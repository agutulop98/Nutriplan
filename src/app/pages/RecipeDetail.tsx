import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Clock, Users, Flame, ChefHat, Heart, Calendar, ArrowLeft, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, type Recipe } from "../../lib/api";
import { useApp } from "../context/AppContext";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEALS = ["Desayuno", "Comida", "Merienda", "Cena"];

// Color palette for the calorie distribution bars
const BAR_COLORS = [
  "bg-orange-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-red-500", "bg-yellow-500", "bg-pink-500", "bg-teal-500",
];

export function RecipeDetail() {
  const { id } = useParams();
  const { favorites, toggleFavorite } = useApp();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [plannerOpen, setPlannerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedMeal, setSelectedMeal] = useState(MEALS[0]);
  const [addingToPlanner, setAddingToPlanner] = useState(false);

  useEffect(() => {
    apiFetch<Recipe>(`/recipes/${id}`)
      .then(setRecipe)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <ChefHat className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="mb-2">Receta no encontrada</h2>
          <p className="text-muted-foreground mb-6">Esta receta no existe o no está disponible.</p>
          <Link to="/search" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Volver al buscador
          </Link>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(recipe.id);
  const totalKcal = recipe.ingredients.reduce((sum, i) => sum + (i.kcal ?? 0), 0);
  const ingsWithKcal = recipe.ingredients.filter(i => i.kcal > 0).sort((a, b) => b.kcal - a.kcal);

  const handleToggleFavorite = async () => {
    await toggleFavorite(recipe.id);
    toast.success(isFavorite ? `"${recipe.name}" eliminada de favoritos` : `"${recipe.name}" añadida a favoritos`);
  };

  const confirmAddToPlanner = async () => {
    setAddingToPlanner(true);
    try {
      await apiFetch("/planner", {
        method: "PUT",
        body: JSON.stringify({ day: selectedDay, meal: selectedMeal, recipeId: recipe.id }),
      });
      toast.success(`"${recipe.name}" añadida al plan: ${selectedDay} - ${selectedMeal}`);
      setPlannerOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? "Error al añadir al plan");
    } finally {
      setAddingToPlanner(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-96 overflow-hidden">
        <img src={recipe.image ?? ""} alt={recipe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link to="/search" className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm mb-4">
              {recipe.category}
            </div>
            <h1 className="text-white mb-4">{recipe.name}</h1>
            <div className="flex gap-6 text-white flex-wrap">
              <div className="flex items-center gap-2"><Clock className="w-5 h-5" /><span>{recipe.time} minutos</span></div>
              <div className="flex items-center gap-2"><Users className="w-5 h-5" /><span>{recipe.servings} {recipe.servings === 1 ? "porción" : "porciones"}</span></div>
              <div className="flex items-center gap-2"><Flame className="w-5 h-5" /><span>{recipe.calories} kcal</span></div>
              <div className="flex items-center gap-2"><ChefHat className="w-5 h-5" /><span>{recipe.difficulty}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex gap-4 mb-8">
          <button onClick={() => setPlannerOpen(true)}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Añadir al plan semanal
          </button>
          <button onClick={handleToggleFavorite}
            className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${isFavorite ? "bg-accent text-white hover:bg-accent/90" : "bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white"}`}>
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "En favoritos" : "Guardar en favoritos"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {/* Ingredient list */}
            <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2>Ingredientes</h2>
                {totalKcal > 0 && (
                  <span className="text-sm font-medium text-primary">{totalKcal} kcal total</span>
                )}
              </div>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                      <span className="text-foreground text-sm">{ingredient.name}</span>
                      {ingredient.kcal > 0 && (
                        <span className="text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                          {ingredient.kcal} kcal
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Calorie breakdown */}
            {ingsWithKcal.length > 0 && (
              <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Distribución calórica
                </h3>

                {/* Stacked bar */}
                <div className="flex h-4 rounded-full overflow-hidden mb-4 gap-px">
                  {ingsWithKcal.map((ing, idx) => (
                    <div
                      key={idx}
                      className={`${BAR_COLORS[idx % BAR_COLORS.length]} transition-all`}
                      style={{ width: `${Math.round((ing.kcal / totalKcal) * 100)}%` }}
                      title={`${ing.name}: ${ing.kcal} kcal`}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {ingsWithKcal.map((ing, idx) => {
                    const pct = Math.round((ing.kcal / totalKcal) * 100);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${BAR_COLORS[idx % BAR_COLORS.length]}`} />
                        <span className="text-xs text-muted-foreground truncate flex-1">
                          {ing.name.length > 28 ? ing.name.slice(0, 26) + "…" : ing.name}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs font-medium">{ing.kcal}</span>
                          <span className="text-xs text-muted-foreground">kcal</span>
                          <span className="text-xs text-muted-foreground w-7 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
              <h2 className="mb-6">Preparación</h2>
              <div className="space-y-6">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-foreground leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {plannerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-sm border border-border">
            <h3 className="mb-1">Añadir al plan semanal</h3>
            <p className="text-muted-foreground text-sm mb-4">{recipe.name}</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Día</label>
                <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Comida</label>
                <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)}
                  className="w-full py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                  {MEALS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setPlannerOpen(false)} className="flex-1 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-all">Cancelar</button>
              <button onClick={confirmAddToPlanner} disabled={addingToPlanner}
                className="flex-1 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {addingToPlanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
