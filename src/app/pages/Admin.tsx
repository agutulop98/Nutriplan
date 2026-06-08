import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, ChefHat, X, Check, Flame } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, type Recipe, type Ingredient } from "../../lib/api";

const CATEGORIES = ["Desayuno", "Comida", "Cena", "Snack"];
const DIFFICULTIES = ["Fácil", "Media", "Difícil"];

type FormState = {
  name: string;
  image: string;
  time: number | undefined;
  difficulty: string;
  category: string;
  servings: number | undefined;
  ingredients: Ingredient[];
  steps: string[];
};

const emptyForm = (): FormState => ({
  name: "", image: "", time: undefined,
  difficulty: "Fácil", category: "Comida", servings: 2,
  ingredients: [{ name: "", kcal: 0 }],
  steps: [""],
});

export function Admin() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchRecipes = useCallback(() => {
    apiFetch<Recipe[]>("/recipes")
      .then(setRecipes)
      .catch(() => toast.error("Error al cargar recetas"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setForm({
      name: recipe.name,
      image: recipe.image ?? "",
      time: recipe.time ?? undefined,
      difficulty: recipe.difficulty ?? "Fácil",
      category: recipe.category ?? "Comida",
      servings: recipe.servings ?? 2,
      ingredients: recipe.ingredients.length ? recipe.ingredients : [{ name: "", kcal: 0 }],
      steps: recipe.steps.length ? recipe.steps : [""],
    });
    setShowForm(true);
  };

  const totalFormKcal = form.ingredients.reduce((sum, i) => sum + (i.kcal || 0), 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      ingredients: form.ingredients.filter((i) => i.name.trim()),
      steps: form.steps.filter((s) => s.trim()),
    };
    try {
      if (editingId) {
        const updated = await apiFetch<Recipe>(`/recipes/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        setRecipes((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
        toast.success("Receta actualizada");
      } else {
        const created = await apiFetch<Recipe>("/recipes", { method: "POST", body: JSON.stringify(payload) });
        setRecipes((prev) => [...prev, created]);
        toast.success("Receta creada");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await apiFetch(`/recipes/${id}`, { method: "DELETE" });
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Receta eliminada");
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const updateIngredient = (idx: number, field: keyof Ingredient, value: string | number) => {
    setForm((prev) => {
      const arr = [...prev.ingredients];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, ingredients: arr };
    });
  };

  const addIngredient = () => setForm((prev) => ({ ...prev, ingredients: [...prev.ingredients, { name: "", kcal: 0 }] }));

  const removeIngredient = (idx: number) =>
    setForm((prev) => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== idx) }));

  const updateStep = (idx: number, value: string) => {
    setForm((prev) => {
      const arr = [...prev.steps];
      arr[idx] = value;
      return { ...prev, steps: arr };
    });
  };

  const addStep = () => setForm((prev) => ({ ...prev, steps: [...prev.steps, ""] }));

  const removeStep = (idx: number) =>
    setForm((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">Gestionar recetas</h1>
          <p className="text-muted-foreground">{recipes.length} recetas en total</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md">
          <Plus className="w-5 h-5" />
          Nueva receta
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <ChefHat className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="mb-2">Sin recetas</h2>
          <p className="text-muted-foreground mb-8">Crea tu primera receta para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all group">
              <div className="relative h-40 overflow-hidden bg-secondary">
                {recipe.image ? (
                  <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                  {recipe.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-1">{recipe.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {recipe.time} min · {recipe.calories} kcal · {recipe.difficulty}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(recipe)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm">
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button onClick={() => handleDelete(recipe.id)} disabled={deletingId === recipe.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all text-sm disabled:opacity-60">
                    {deletingId === recipe.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl border border-border my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2>{editingId ? "Editar receta" : "Nueva receta"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-secondary rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground mb-1 block">Nombre *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                    className="w-full py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground mb-1 block">URL de imagen</label>
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Categoría</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Dificultad</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Tiempo (min)</label>
                  <input type="number" min={1} value={form.time ?? ""} onChange={(e) => setForm({ ...form, time: Number(e.target.value) || undefined })}
                    className="w-full py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Porciones</label>
                  <input type="number" min={1} value={form.servings ?? ""} onChange={(e) => setForm({ ...form, servings: Number(e.target.value) || undefined })}
                    className="w-full py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-muted-foreground">Ingredientes</label>
                  <div className="flex items-center gap-3">
                    {totalFormKcal > 0 && (
                      <span className="text-xs font-medium text-orange-600 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {totalFormKcal} kcal total
                      </span>
                    )}
                    <button type="button" onClick={addIngredient} className="text-xs text-primary hover:underline">+ Añadir</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_80px_32px] gap-2 mb-1">
                    <span className="text-xs text-muted-foreground px-1">Ingrediente</span>
                    <span className="text-xs text-muted-foreground px-1">kcal</span>
                    <span />
                  </div>
                  {form.ingredients.map((ing, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_80px_32px] gap-2">
                      <input
                        value={ing.name}
                        onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                        placeholder={`Ingrediente ${idx + 1}`}
                        className="py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <input
                        type="number"
                        min={0}
                        value={ing.kcal || ""}
                        onChange={(e) => updateIngredient(idx, "kcal", Number(e.target.value) || 0)}
                        placeholder="0"
                        className="py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm text-center"
                      />
                      {form.ingredients.length > 1 ? (
                        <button type="button" onClick={() => removeIngredient(idx)} className="flex items-center justify-center p-2 text-muted-foreground hover:text-destructive">
                          <X className="w-4 h-4" />
                        </button>
                      ) : <span />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-muted-foreground">Pasos de preparación</label>
                  <button type="button" onClick={addStep} className="text-xs text-primary hover:underline">+ Añadir</button>
                </div>
                <div className="space-y-2">
                  {form.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-2">{idx + 1}</span>
                      <textarea value={step} onChange={(e) => updateStep(idx, e.target.value)}
                        placeholder={`Paso ${idx + 1}`} rows={2}
                        className="flex-1 py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none" />
                      {form.steps.length > 1 && (
                        <button type="button" onClick={() => removeStep(idx)} className="p-2 text-muted-foreground hover:text-destructive mt-1">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editingId ? "Guardar cambios" : "Crear receta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
