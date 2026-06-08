import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Correo de recuperación enviado");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🥗</span>
            </div>
            <h1 className="text-primary">NutriPlan</h1>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="mb-2">Correo enviado</h2>
              <p className="text-muted-foreground mb-6">
                Revisa tu bandeja de entrada y sigue las instrucciones para
                recuperar tu contraseña.
              </p>
              <Link to="/login" className="text-primary hover:text-primary/80">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-center">Recuperar contraseña</h2>
              <p className="text-muted-foreground text-center mb-6">
                Introduce tu correo y te enviaremos un enlace de recuperación
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md"
                >
                  Enviar enlace de recuperación
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
