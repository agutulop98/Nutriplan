import { Link } from "react-router";
import { Clock, Flame, ChevronRight, Search, Calendar, Heart, ShoppingCart, TrendingUp, Target } from "lucide-react";

const mockRecipes = [
  {
    id: 1,
    name: "Ensalada de quinoa y aguacate",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    time: 15,
    calories: 320,
    category: "Almuerzo"
  },
  {
    id: 2,
    name: "Bowl de acai con frutos rojos",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop",
    time: 10,
    calories: 280,
    category: "Desayuno"
  },
  {
    id: 3,
    name: "Salmón al horno con vegetales",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    time: 35,
    calories: 420,
    category: "Cena"
  },
  {
    id: 4,
    name: "Batido verde energizante",
    image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop",
    time: 5,
    calories: 180,
    category: "Desayuno"
  }
];

const todayMeals = [
  { type: "Desayuno", recipe: "Avena con frutas", calories: 280, time: "08:00" },
  { type: "Comida", recipe: "Ensalada de pollo", calories: 420, time: "13:00" },
  { type: "Merienda", recipe: "Yogurt con granola", calories: 180, time: "17:00" },
  { type: "Cena", recipe: "Salmón al horno", calories: 400, time: "20:00" },
];

export function Dashboard() {
  const userName = "Juan";
  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const goalCalories = 2000;
  const progressPercentage = Math.min((totalCalories / goalCalories) * 100, 100);
  const remainingCalories = Math.max(goalCalories - totalCalories, 0);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Buenos días" : currentHour < 18 ? "Buenas tardes" : "Buenas noches";
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">{greeting}, {userName}!</h1>
        <p className="text-muted-foreground capitalize">{today}</p>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link
          to="/search"
          className="bg-card rounded-xl shadow-sm p-4 border border-border hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-all">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3>Buscar recetas</h3>
              <p className="text-sm text-muted-foreground">500+ opciones</p>
            </div>
          </div>
        </Link>

        <Link
          to="/planner"
          className="bg-card rounded-xl shadow-sm p-4 border border-border hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-all">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3>Plan semanal</h3>
              <p className="text-sm text-muted-foreground">Organiza tu semana</p>
            </div>
          </div>
        </Link>

        <Link
          to="/favorites"
          className="bg-card rounded-xl shadow-sm p-4 border border-border hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center group-hover:bg-destructive/20 transition-all">
              <Heart className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3>Favoritos</h3>
              <p className="text-sm text-muted-foreground">Tus recetas guardadas</p>
            </div>
          </div>
        </Link>

        <Link
          to="/shopping"
          className="bg-card rounded-xl shadow-sm p-4 border border-border hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-all">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3>Lista de compra</h3>
              <p className="text-sm text-muted-foreground">Genera tu lista</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2>Plan de hoy</h2>
            <Link to="/planner" className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm">
              Ver plan completo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {todayMeals.map((meal, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">
                      {meal.type === "Desayuno" ? "🌅" : meal.type === "Comida" ? "🍽️" : meal.type === "Merienda" ? "🥤" : "🌙"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{meal.type} • {meal.time}</p>
                    <p>{meal.recipe}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm">{meal.calories} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5" />
              <h3 className="text-white">Progreso del día</h3>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl mb-2">{totalCalories}</div>
              <p className="text-white/80">de {goalCalories} kcal</p>
            </div>

            <div className="space-y-3 bg-white/10 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Progreso</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-white/90 text-sm text-center">
                {remainingCalories > 0 ? `Faltan ${remainingCalories} kcal` : "¡Objetivo alcanzado! 🎉"}
              </p>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-accent">Racha actual</h3>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">7 días</div>
              <p className="text-muted-foreground text-sm">¡Sigue así!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2>Recetas recomendadas</h2>
        <Link to="/search" className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm">
          Ver todas <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            to={`/recipe/${recipe.id}`}
            className="bg-card rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all border border-border group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
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
        ))}
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-accent mb-1">¿No sabes qué cocinar?</h3>
          <p className="text-muted-foreground text-sm">Explora nuestro buscador y encuentra la receta perfecta para ti</p>
        </div>
        <Link
          to="/search"
          className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-all flex items-center gap-2 shadow-md"
        >
          <Search className="w-5 h-5" />
          Buscar recetas
        </Link>
      </div>
    </div>
  );
}
