import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Register() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordMatch) return;
    setError("");
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-white max-w-lg">
          <h2 className="mb-6 text-white">Únete a NutriPlan</h2>
          <p className="text-white/90 text-lg mb-8">
            Crea tu cuenta y comienza a disfrutar de todos los beneficios de una alimentación planificada y saludable
          </p>
          <div className="space-y-4">
            {[
              { title: "Guarda tus recetas favoritas", desc: "Accede rápidamente a las recetas que más te gustan" },
              { title: "Planifica tu semana completa", desc: "Organiza todas tus comidas con anticipación" },
              { title: "Lista de compras automática", desc: "Genera tu lista de ingredientes con un solo clic" },
              { title: "Seguimiento nutricional", desc: "Controla tus calorías y alcanza tus objetivos" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-1 text-white">{item.title}</h3>
                  <p className="text-white/80 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🥗</span>
              </div>
              <h1 className="text-primary">NutriPlan</h1>
            </div>
            <p className="text-muted-foreground text-lg">Crea tu cuenta gratuita</p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="mb-2 text-center">Regístrate</h2>
            <p className="text-muted-foreground text-center mb-6">Completa tus datos para comenzar</p>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Juan Pérez"
                    className="w-full pl-12 pr-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-12 pr-12 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repite tu contraseña"
                    className={`w-full pl-12 pr-12 py-3 bg-input-background rounded-lg border focus:outline-none focus:ring-2 ${
                      formData.confirmPassword && !passwordMatch ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"
                    }`}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordMatch && (
                  <p className="text-destructive text-sm mt-1">Las contraseñas no coinciden</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!passwordMatch || !formData.password || loading}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="text-primary hover:text-primary/80">Iniciar sesión</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
