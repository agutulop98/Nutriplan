import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiFetch, getToken, type User } from "../../lib/api";

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  favorites: number[];
  toggleFavorite: (id: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    apiFetch<User>('/auth/me')
      .then((userData) => {
        setUser(userData);
        return apiFetch<{ id: number }[]>('/favorites');
      })
      .then((favs) => setFavorites(favs.map((r) => r.id)))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: userData } = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', token);
    setUser(userData);
    const favs = await apiFetch<{ id: number }[]>('/favorites');
    setFavorites(favs.map((r) => r.id));
  };

  const register = async (name: string, email: string, password: string) => {
    const { token, user: userData } = await apiFetch<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem('token', token);
    setUser(userData);
    setFavorites([]);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setFavorites([]);
  };

  const toggleFavorite = async (id: number) => {
    const isFav = favorites.includes(id);
    setFavorites((prev) => (isFav ? prev.filter((f) => f !== id) : [...prev, id]));
    try {
      await apiFetch(`/favorites/${id}`, { method: isFav ? 'DELETE' : 'POST' });
    } catch {
      setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ isAuthenticated: !!user, user, loading, login, register, logout, favorites, toggleFavorite }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
