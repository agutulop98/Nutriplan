import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Home, Search, Calendar, Heart, User, ShoppingCart, LogOut, ChefHat } from "lucide-react";
import { useApp } from "../context/AppContext";
import { ChatWidget } from "./ChatWidget";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useApp();

  const navItems = [
    { path: "/", label: "Inicio", icon: Home },
    { path: "/search", label: "Buscar recetas", icon: Search },
    { path: "/planner", label: "Plan semanal", icon: Calendar },
    { path: "/shopping", label: "Lista de compra", icon: ShoppingCart },
    { path: "/favorites", label: "Favoritos", icon: Heart },
    { path: "/profile", label: "Perfil", icon: User },
    { path: "/admin", label: "Gestionar recetas", icon: ChefHat },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-xl">🥗</span>
            </div>
            <div>
              <h1 className="text-primary">NutriPlan</h1>
              <p className="text-muted-foreground text-xs">Tu planificador saludable</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active ? "bg-primary text-white shadow-md" : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-secondary rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm truncate">{user?.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? "—"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <ChatWidget />
    </div>
  );
}
