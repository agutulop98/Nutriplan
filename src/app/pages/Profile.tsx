import { useState } from "react";
import { User, Mail, Target, Activity, Bell, Lock, LogOut, Save, Camera, Apple } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";

const initialFormData = {
  name: "Juan Pérez",
  email: "juan@nutriplan.com",
  weight: 70,
  height: 170,
  calorieGoal: 2000,
  goal: "maintain",
  activityLevel: "moderate",
};

const initialPreferences = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  lactoseFree: false,
};

const initialNotifications = {
  mealReminders: true,
  newRecipes: true,
  weeklySummary: false,
  nutritionTips: true,
};

export function Profile() {
  const navigate = useNavigate();
  const { logout } = useApp();
  const [formData, setFormData] = useState(initialFormData);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleSave = () => {
    toast.success("Cambios guardados exitosamente");
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setPreferences(initialPreferences);
    setNotifications(initialNotifications);
    toast.info("Cambios descartados");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Sesión cerrada");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información y preferencias</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="mb-1">{formData.name}</h2>
            <p className="text-muted-foreground text-sm mb-4">{formData.email}</p>
            <div className="bg-secondary rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl">{formData.weight}</p>
                  <p className="text-sm text-muted-foreground">kg</p>
                </div>
                <div>
                  <p className="text-2xl">{formData.height}</p>
                  <p className="text-sm text-muted-foreground">cm</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">IMC</p>
              <p className="text-2xl text-primary">
                {(formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Rango saludable</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border mb-6">
            <h2 className="mb-6">Información personal</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Apple className="w-5 h-5 text-primary" />
              </div>
              <h2>Preferencias alimentarias</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "vegetarian", label: "Vegetariano", icon: "🥬" },
                { key: "vegan", label: "Vegano", icon: "🌱" },
                { key: "glutenFree", label: "Sin gluten", icon: "🌾" },
                { key: "lactoseFree", label: "Sin lactosa", icon: "🥛" },
              ].map((pref) => (
                <label
                  key={pref.key}
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border ${
                    preferences[pref.key as keyof typeof preferences]
                      ? "bg-primary/10 border-primary"
                      : "bg-secondary border-transparent hover:bg-secondary/80"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={preferences[pref.key as keyof typeof preferences]}
                    onChange={(e) =>
                      setPreferences({ ...preferences, [pref.key]: e.target.checked })
                    }
                    className="w-5 h-5 text-primary rounded"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pref.icon}</span>
                    <span>{pref.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2>Objetivos nutricionales</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Objetivo diario de calorías
              </label>
              <input
                type="number"
                value={formData.calorieGoal}
                onChange={(e) =>
                  setFormData({ ...formData, calorieGoal: Number(e.target.value) })
                }
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Meta</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="maintain">Mantener peso</option>
                <option value="lose">Perder peso</option>
                <option value="gain">Ganar masa muscular</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h2>Nivel de actividad</h2>
          </div>
          <div className="space-y-3">
            {[
              { value: "sedentary", level: "Sedentario", desc: "Poco o ningún ejercicio" },
              { value: "light", level: "Ligero", desc: "Ejercicio 1-3 días/semana" },
              { value: "moderate", level: "Moderado", desc: "Ejercicio 3-5 días/semana" },
              { value: "active", level: "Activo", desc: "Ejercicio 6-7 días/semana" },
            ].map((item) => (
              <label
                key={item.value}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  formData.activityLevel === item.value
                    ? "bg-primary/10 border border-primary"
                    : "hover:bg-secondary"
                }`}
              >
                <input
                  type="radio"
                  name="activity"
                  value={item.value}
                  checked={formData.activityLevel === item.value}
                  onChange={(e) =>
                    setFormData({ ...formData, activityLevel: e.target.value })
                  }
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p>{item.level}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <h2>Notificaciones</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "mealReminders", label: "Recordatorios de comidas" },
              { key: "newRecipes", label: "Nuevas recetas recomendadas" },
              { key: "weeklySummary", label: "Resumen semanal" },
              { key: "nutritionTips", label: "Consejos nutricionales" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary cursor-pointer transition-all"
              >
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [item.key]: e.target.checked })
                  }
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h2>Seguridad y privacidad</h2>
          </div>
          <div className="space-y-3">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm">Sesión activa</p>
                <p className="text-xs text-muted-foreground">Autenticación verificada</p>
              </div>
            </div>
            <button className="w-full text-left px-4 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-all">
              Cambiar contraseña
            </button>
            <button className="w-full text-left px-4 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-all">
              Autenticación de dos factores
            </button>
            <button className="w-full text-left px-4 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-all">
              Dispositivos conectados
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleCancel}
          className="px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md"
        >
          <Save className="w-5 h-5" />
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
