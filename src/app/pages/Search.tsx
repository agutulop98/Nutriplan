import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search as SearchIcon, Clock, Flame, Heart, Calendar, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, type Recipe } from "../../lib/api";
import { useApp } from "../context/AppContext";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEALS = ["Desayuno", "Comida", "Merienda", "Cena"];

export function Search() {
  const { favorites, toggleFavorite } = useApp();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todas");

  const [plannerModal, setPlannerModal] = useState<Recipe | null>(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedMeal, setSelectedMeal] = useState(MEALS[0]);
  const [addingToPlanner, setAddingToPlanner] = useState(false);

  const categories = ["Todas", "Desayuno", "Comida", "Cena", "Snack"];
  const difficulties = ["Todas", "Fácil", "Media", "Difícil"];

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory !== "Todas") params.set("category", selectedCategory);
    if (selectedDifficulty !== "Todas") params.set("difficulty", selectedDifficulty);

    const timeout = setTimeout(() => {
      setLoading(true);
      apiFetch<Recipe[]>(`/recipes?${params}`)
        .then(setRecipes)
        .catch(() => toast.error("Error al cargar recetas"))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const handleToggleFavorite = async (id: number, name: string) => {
    const isAdding = !favorites.includes(id);
    await toggleFavorite(id);
    toast.success(isAdding ? `"${name}" añadida a favoritos` : `"${name}" eliminada de favoritos`);
  };

  const confirmAddToPlanner = async () => {
    if (!plannerModal) return;
    setAddingToPlanner(true);
    try {
      await apiFetch("/planner", {
        method: "PUT",
        body: JSON.stringify({ day: selectedDay, meal: selectedMeal, recipeId: plannerModal.id }),
      });
      toast.success(`"${plannerModal.name}" añadida al plan: ${selectedDay} - ${selectedMeal}`);
      setPlannerModal(null);
    } catch (err: any) {
      toast.error(err.message ?? "Error al añadir al plan");
    } finally {
      setAddingToPlanner(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Buscar recetas</h1>
        <p className="text-muted-foreground">Encuentra la receta perfecta para ti</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm p-6 mb-8 border border-border">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, ingrediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm mb-3 text-muted-foreground">Tipo de comida</p>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg transition-all ${selectedCategory === cat ? "bg-primary text-white shadow-md" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm mb-3 text-muted-foreground">Dificultad</p>
            <div className="flex gap-2 flex-wrap">
              {difficulties.map((diff) => (
                <button key={diff} onClick={() => setSelectedDifficulty(diff)}
                  className={`px-4 py-2 rounded-lg transition-all ${selectedDifficulty === diff ? "bg-primary text-white shadow-md" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground">
              {recipes.length} {recipes.length === 1 ? "receta encontrada" : "recetas encontradas"}
            </p>
            <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-lg">
              <Heart className="w-4 h-4 text-accent fill-current" />
              <span className="text-sm text-muted-foreground">{favorites.length} favoritos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-card rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all border border-border group relative">
                <Link to={`/recipe/${recipe.id}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    <img src={recipe.image ?? ""} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      {recipe.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2">{recipe.name}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.time} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        <span>{recipe.calories} kcal</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{recipe.difficulty}</p>
                  </div>
                </Link>

                <div className="px-4 pb-4">
                  <button
                    onClick={(e) => { e.preventDefault(); setPlannerModal(recipe); }}
                    className="w-full py-2 rounded-lg transition-all text-sm flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90"
                  >
                    <Calendar className="w-4 h-4" />
                    Añadir al plan
                  </button>
                </div>

                <button
                  onClick={(e) => { e.preventDefault(); handleToggleFavorite(recipe.id, recipe.name); }}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all shadow-md ${
                    favorites.includes(recipe.id) ? "bg-accent text-white scale-110" : "bg-white/90 text-muted-foreground hover:bg-accent hover:text-white"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(recipe.id) ? "fill-current" : ""}`} />
                </button>
              </div>
            ))}
          </div>

          {recipes.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="mb-2">No se encontraron recetas</h2>
              <p className="text-muted-foreground mb-8">Intenta ajustar tus filtros de búsqueda</p>
            </div>
          )}
        </>
      )}

      {plannerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-sm border border-border">
            <h3 className="mb-1">Añadir al plan semanal</h3>
            <p className="text-muted-foreground text-sm mb-4">{plannerModal.name}</p>

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
              <button onClick={() => setPlannerModal(null)}
                className="flex-1 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-all">
                Cancelar
              </button>
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
