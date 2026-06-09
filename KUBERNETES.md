# NutriPlan — Despliegue local con Kubernetes (minikube)

Guía para correr NutriPlan completo (frontend + backend) en un clúster local de Kubernetes usando minikube.

## Arquitectura

```
Browser
  └── http://nutriplan.local
        └── Ingress (nginx)
              ├── /api  ──► Service nutriplan-backend ──► Pod (Node.js :3001)
              └── /     ──► Service nutriplan-frontend ──► Pod (nginx :80)
```

## Prerequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) con integración WSL2 activa
- Ubuntu en WSL2 (Windows) o Linux/macOS directamente

## 1. Instalación de herramientas

Desde Ubuntu (WSL2):

```bash
# minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube-linux-amd64 && sudo mv minikube-linux-amd64 /usr/local/bin/minikube

# kubectl (via alias de minikube, sin instalar por separado)
echo "alias kubectl='minikube kubectl --'" >> ~/.bashrc && source ~/.bashrc

# k9s (dashboard de terminal)
curl -sL https://github.com/derailed/k9s/releases/latest/download/k9s_Linux_amd64.tar.gz -o k9s.tar.gz
tar -xzf k9s.tar.gz k9s && sudo mv k9s /usr/local/bin/
```

## 2. Arrancar minikube

```bash
minikube start --driver=docker
minikube addons enable ingress

# Verificar que el ingress controller esté listo
kubectl get pods -n ingress-nginx
```

## 3. Clonar el repositorio

```bash
# Clonar en el filesystem nativo de WSL2 (mejor rendimiento)
git clone https://github.com/agutulop98/Nutriplan.git
cd Nutriplan
```

## 4. Construir las imágenes Docker

```bash
# Frontend (VITE_API_URL vacío → usa rutas relativas /api)
docker build --build-arg VITE_API_URL="" -t nutriplan-frontend:local .

# Backend
docker build -t nutriplan-backend:local ./backend
```

## 5. Cargar imágenes en minikube

```bash
minikube image load nutriplan-frontend:local
minikube image load nutriplan-backend:local
```

## 6. Crear el Secret con las credenciales

Crea el archivo `k8s/secret.yaml` (no está en el repositorio por seguridad):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nutriplan-secret
type: Opaque
stringData:
  DATABASE_URL: "postgresql://usuario:password@host/db?sslmode=require"
  JWT_SECRET: "tu-jwt-secret"
  OPENAI_API_KEY: "sk-proj-..."
```

> Necesitas una base de datos PostgreSQL accesible (ej: [Neon](https://neon.tech) gratuito) y una API key de OpenAI para el chatbot.

## 7. Desplegar en Kubernetes

```bash
kubectl apply -f k8s/
```

Deberías ver:

```
secret/nutriplan-secret created
deployment.apps/nutriplan-backend created
deployment.apps/nutriplan-frontend created
service/nutriplan-backend created
service/nutriplan-frontend created
ingress.networking.k8s.io/nutriplan-ingress created
```

## 8. Verificar el despliegue

```bash
kubectl get pods
# Esperar a que ambos estén Running

kubectl get all
kubectl get ingress
```

O con k9s:

```bash
k9s
```

| Comando en k9s | Descripción |
|---|---|
| `:pod` | Ver pods |
| `:deploy` | Ver deployments |
| `:svc` | Ver services |
| `:ingress` | Ver ingress |
| `l` sobre un pod | Ver logs |
| `d` sobre un pod | Describe |

## 9. Acceder a la app

**Agregar al `/etc/hosts` de WSL2:**

```bash
echo "$(minikube ip)  nutriplan.local" | sudo tee -a /etc/hosts
```

**Agregar al hosts de Windows** (PowerShell como Administrador):

```powershell
Add-Content C:\Windows\System32\drivers\etc\hosts "127.0.0.1  nutriplan.local"
```

**Activar el tunnel** (mantener esta terminal abierta):

```bash
minikube tunnel
```

**Abrir en el browser:**

```
http://nutriplan.local
```

## Estructura de manifiestos K8s

```
k8s/
├── secret.yaml              # Credenciales (no en git)
├── deployment.yaml          # Deployment del backend (Node.js)
├── service.yaml             # Service del backend (ClusterIP)
├── frontend-deployment.yaml # Deployment del frontend (nginx)
├── frontend-service.yaml    # Service del frontend (ClusterIP)
└── ingress.yaml             # Ingress nginx con ruteo /api y /
```

## Comandos útiles

```bash
# Ver logs del backend en tiempo real
kubectl logs deployment/nutriplan-backend -f

# Reiniciar un deployment
kubectl rollout restart deployment/nutriplan-backend

# Escalar replicas
kubectl scale deployment/nutriplan-backend --replicas=2

# Eliminar todo
kubectl delete -f k8s/
```

## Limpiar el entorno

```bash
kubectl delete -f k8s/
minikube stop
```
