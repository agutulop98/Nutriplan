import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Plus, Flame, ChevronLeft, ChevronRight, X, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, type Recipe, type WeekPlan } from "../../lib/api";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEALS = ["Desayuno", "Comida", "Merienda", "Cena"];

const MEAL_EMOJI: Record<string, string> = {
  Desayuno: "🌅", Comida: "🍽️", Merienda: "🥤", Cena: "🌙",
};

function getWeekLabel(offset: number): string {
  const today = new Date();
  const daysToMonday = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString("es-ES", opts);
  return `${fmt(monday, { day: "numeric", month: "long" })} – ${fmt(sunday, { day: "numeric", month: "long", year: "numeric" })}`;
}

const emptyPlan = (): WeekPlan =>
  Object.fromEntries(DAYS.map((d) => [d, Object.fromEntries(MEALS.map((m) => [m, null]))]));

export function WeeklyPlanner() {
  const navigate = useNavigate();
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(emptyPlan());
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);

  const fetchPlan = useCallback(() => {
    apiFetch<WeekPlan>("/planner")
      .then(setWeekPlan)
      .catch(() => toast.error("Error al cargar el plan"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const removeMeal = async (day: string, mealType: string) => {
    setWeekPlan((prev) => ({ ...prev, [day]: { ...prev[day], [mealType]: null } }));
    try {
      await apiFetch("/planner", {
        method: "PUT",
        body: JSON.stringify({ day, meal: mealType, recipeId: null }),
      });
      toast.success("Receta eliminada del plan");
    } catch {
      toast.error("Error al eliminar del plan");
      fetchPlan();
    }
  };

  const generateShoppingList = async () => {
    try {
      await apiFetch("/shopping/generate", { method: "POST" });
      toast.success("Lista de compras generada");
      navigate("/shopping");
    } catch {
      toast.error("Error al generar la lista");
    }
  };

  const getWeeklyCalories = () =>
    Object.values(weekPlan).flatMap(Object.values).reduce((sum, meal) => sum + ((meal as Recipe | null)?.calories ?? 0), 0);

  const getDailyCalories = (day: string) =>
    Object.values(weekPlan[day] ?? {}).reduce((sum, meal) => sum + ((meal as Recipe | null)?.calories ?? 0), 0);

  const mealsPlanned = Object.values(weekPlan).flatMap(Object.values).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Planificador semanal</h1>
        <p className="text-muted-foreground">Organiza tus comidas de la semana</p>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentWeek((p) => p - 1)} className="p-2 hover:bg-secondary rounded-lg transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2>{getWeekLabel(currentWeek)}</h2>
          <button onClick={() => setCurrentWeek((p) => p + 1)} className="p-2 hover:bg-secondary rounded-lg transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-6 py-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total semanal</p>
                <p className="text-primary">{getWeeklyCalories()} kcal</p>
              </div>
            </div>
          </div>
          <button onClick={generateShoppingList}
            className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-all shadow-md flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Generar lista de compra
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 w-32">Comida</th>
                {DAYS.map((day) => (
                  <th key={day} className="text-center p-4 min-w-[140px]">
                    <div>{day}</div>
                    <div className="text-xs text-muted-foreground mt-1">{getDailyCalories(day)} kcal</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEALS.map((mealType) => (
                <tr key={mealType} className="border-b border-border last:border-b-0">
                  <td className="p-4 bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{MEAL_EMOJI[mealType]}</span>
                      <span>{mealType}</span>
                    </div>
                  </td>
                  {DAYS.map((day) => {
                    const meal = weekPlan[day]?.[mealType] as Recipe | null;
                    return (
                      <td key={`${day}-${mealType}`} className="p-2">
                        {meal ? (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 hover:bg-primary/10 transition-all group relative">
                            <button
                              onClick={() => removeMeal(day, mealType)}
                              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <p className="text-sm mb-1">{meal.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Flame className="w-3 h-3" />
                              <span>{meal.calories} kcal</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate("/search")}
                            className="w-full h-full min-h-[60px] border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center group"
                          >
                            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary mb-1" />
                            <span className="text-xs text-muted-foreground group-hover:text-primary">Añadir</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h3 className="mb-2">Resumen nutricional</h3>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Promedio diario</span>
              <span>{Math.round(getWeeklyCalories() / 7)} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Objetivo diario</span>
              <span>2000 kcal</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${Math.min((getWeeklyCalories() / 7 / 2000) * 100, 100)}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              {getWeeklyCalories() / 7 < 2000 ? "Por debajo del objetivo" : "Objetivo alcanzado"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-sm p-6 text-white">
          <h3 className="mb-2 text-white">Comidas planificadas</h3>
          <div className="text-4xl mt-4">{mealsPlanned}</div>
          <p className="text-white/80 text-sm mt-1">de 28 posibles</p>
          <div className="mt-4 w-full bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${(mealsPlanned / 28) * 100}%` }} />
          </div>
          <p className="text-white/90 text-sm mt-2">{Math.round((mealsPlanned / 28) * 100)}% completado</p>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
          <h3 className="text-accent mb-2">Acciones rápidas</h3>
          <div className="space-y-3">
            <button onClick={() => navigate("/search")}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Buscar recetas
            </button>
            <button onClick={generateShoppingList}
              className="w-full bg-accent text-white py-2 rounded-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Generar lista de compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
