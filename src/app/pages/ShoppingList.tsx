import { useState, useEffect, useCallback } from "react";
import { Copy, Trash2, Check, ShoppingCart, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, type ShoppingItem } from "../../lib/api";

const CATEGORIES = ["Verduras", "Frutas", "Proteínas", "Lácteos", "Cereales", "Otros"];
const CATEGORY_EMOJI: Record<string, string> = {
  Verduras: "🥬", Frutas: "🍎", Proteínas: "🥩", Lácteos: "🥛", Cereales: "🌾", Otros: "🛒",
};

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Otros");
  const [showAddForm, setShowAddForm] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchItems = useCallback(() => {
    apiFetch<ShoppingItem[]>("/shopping")
      .then(setItems)
      .catch(() => toast.error("Error al cargar la lista"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const toggleItem = async (id: number, checked: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: checked ? 0 : 1 } : i)));
    try {
      await apiFetch(`/shopping/${id}`, { method: "PATCH", body: JSON.stringify({ checked: !checked }) });
    } catch {
      fetchItems();
    }
  };

  const deleteItem = async (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await apiFetch(`/shopping/${id}`, { method: "DELETE" }).catch(() => fetchItems());
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const item = await apiFetch<ShoppingItem>("/shopping", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim(), category: newCategory }),
      });
      setItems((prev) => [...prev, item]);
      setNewName("");
      setShowAddForm(false);
    } catch (err: any) {
      toast.error(err.message ?? "Error al añadir");
    }
  };

  const clearChecked = async () => {
    await apiFetch("/shopping?onlyChecked=true", { method: "DELETE" });
    setItems((prev) => prev.filter((i) => !i.checked));
    toast.success("Ingredientes comprados eliminados");
  };

  const clearAll = async () => {
    await apiFetch("/shopping", { method: "DELETE" });
    setItems([]);
    toast.success("Lista limpiada");
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const newItems = await apiFetch<ShoppingItem[]>("/shopping/generate", { method: "POST" });
      setItems(newItems);
      toast.success("Lista generada desde el plan semanal");
    } catch (err: any) {
      toast.error(err.message ?? "Error al generar la lista");
    } finally {
      setGenerating(false);
    }
  };

  const copyList = () => {
    const text = CATEGORIES.map((cat) => {
      const catItems = items.filter((i) => i.category === cat && !i.checked);
      if (!catItems.length) return "";
      return `${cat}:\n${catItems.map((i) => `- ${i.name}`).join("\n")}`;
    }).filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Lista copiada al portapapeles");
  };

  const stats = {
    total: items.length,
    checked: items.filter((i) => i.checked).length,
    pending: items.filter((i) => !i.checked).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Lista de la compra</h1>
        <p className="text-muted-foreground">Ingredientes de tu plan semanal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total", value: stats.total, sub: "ingredientes", icon: ShoppingCart, color: "text-primary", bg: "bg-primary/10" },
          { label: "Comprados", value: stats.checked, sub: "marcados", icon: Check, color: "text-accent", bg: "bg-accent/10" },
          { label: "Pendientes", value: stats.pending, sub: "por comprar", icon: ShoppingCart, color: "text-primary", bg: "bg-primary/10" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <h3>{s.label}</h3>
            </div>
            <p className="text-3xl">{s.value}</p>
            <p className="text-muted-foreground text-sm">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={generate} disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all shadow-md disabled:opacity-60">
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
          Generar desde plan
        </button>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md">
          <Plus className="w-5 h-5" />
          Añadir ingrediente
        </button>
        <button onClick={copyList}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all">
          <Copy className="w-5 h-5" />
          Copiar lista
        </button>
        <button onClick={clearChecked} disabled={stats.checked === 0}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all disabled:opacity-50">
          <Check className="w-5 h-5" />
          Limpiar comprados
        </button>
        <button onClick={clearAll}
          className="flex items-center gap-2 px-6 py-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all">
          <Trash2 className="w-5 h-5" />
          Limpiar todo
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addItem} className="bg-card rounded-xl border border-border p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-40">
            <label className="text-sm text-muted-foreground mb-1 block">Ingrediente</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: 2 tomates"
              className="w-full py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Categoría</label>
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
              className="py-2 px-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90">Añadir</button>
          <button type="button" onClick={() => setShowAddForm(false)} className="py-2 px-4 bg-secondary rounded-lg hover:bg-secondary/80">Cancelar</button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="mb-2">Lista vacía</h2>
          <p className="text-muted-foreground mb-8">
            Añade recetas a tu plan semanal y genera tu lista de compras
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const catItems = items.filter((i) => i.category === category);
            if (!catItems.length) return null;
            return (
              <div key={category} className="bg-card rounded-xl shadow-sm p-6 border border-border">
                <h2 className="mb-4 flex items-center gap-2">
                  <span>{CATEGORY_EMOJI[category] ?? "📦"}</span>
                  {category}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({catItems.filter((i) => !i.checked).length} pendientes)
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {catItems.map((item) => (
                    <div key={item.id} className={`flex items-center gap-3 p-4 rounded-lg transition-all group ${item.checked ? "bg-secondary/50" : "bg-secondary hover:bg-secondary/80"}`}>
                      <input type="checkbox" checked={!!item.checked} onChange={() => toggleItem(item.id, item.checked)}
                        className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-primary cursor-pointer" />
                      <div className="flex-1">
                        <p className={item.checked ? "line-through text-muted-foreground" : ""}>{item.name}</p>
                      </div>
                      <button onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
