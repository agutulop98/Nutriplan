import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🥗</span>
              </div>
              <h1 className="text-primary">NutriPlan</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Planifica tus comidas de forma saludable
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="mb-2 text-center">Bienvenido de nuevo</h2>
            <p className="text-muted-foreground text-center mb-6">Ingresa a tu cuenta</p>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-muted-foreground">Recordarme</span>
                </label>
                <Link to="/forgot-password" className="text-primary hover:text-primary/80">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md disabled:opacity-60"
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="text-primary hover:text-primary/80">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Al continuar, aceptas nuestros términos y condiciones
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="w-full h-80 mb-8 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop"
              alt="Comida saludable"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mb-4 text-white">Organiza tu alimentación</h2>
          <p className="text-white/90 text-lg">
            Descubre recetas saludables, planifica tu semana y alcanza tus objetivos nutricionales
          </p>
        </div>
      </div>
    </div>
  );
}
