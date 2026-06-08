import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Clock, Flame, Heart, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, type Recipe } from "../../lib/api";
import { useApp } from "../context/AppContext";

export function Favorites() {
  const { favorites, toggleFavorite } = useApp();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  useEffect(() => {
    apiFetch<Recipe[]>("/favorites")
      .then(setRecipes)
      .catch(() => toast.error("Error al cargar favoritos"))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["Todas", "Desayuno", "Comida", "Cena", "Snack"];

  const filtered = recipes.filter(
    (r) => selectedCategory === "Todas" || r.category === selectedCategory
  );

  const removeFavorite = async (id: number, name: string) => {
    await toggleFavorite(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    toast.success(`"${name}" eliminada de favoritos`);
  };

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
        <h1 className="mb-2">Recetas favoritas</h1>
        <p className="text-muted-foreground">
          {recipes.length} {recipes.length === 1 ? "receta guardada" : "recetas guardadas"}
        </p>
      </div>

      {recipes.length > 0 && (
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-all ${selectedCategory === cat ? "bg-primary text-white" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="mb-2">No hay favoritos aún</h2>
          <p className="text-muted-foreground mb-8">Explora nuestras recetas y guarda tus favoritas</p>
          <Link to="/search" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all">
            Buscar recetas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((recipe) => (
            <div key={recipe.id} className="bg-card rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all border border-border group relative">
              <Link to={`/recipe/${recipe.id}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  <img src={recipe.image ?? ""} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {recipe.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-3">{recipe.name}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.time} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      <span>{recipe.calories} kcal</span>
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); removeFavorite(recipe.id, recipe.name); }}
                className="absolute top-3 right-3 p-2 bg-destructive text-white rounded-full backdrop-blur-sm hover:bg-destructive/90 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
