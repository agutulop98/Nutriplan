# NutriPlan — Despliegue local con Kubernetes (minikube)

Guía para desplegar NutriPlan completo (frontend + backend) en un clúster local de Kubernetes usando minikube sobre Windows + WSL2 Ubuntu. Sirve como referencia para repetir el despliegue desde cero.

---

## Arquitectura

```
Browser
  └── http://nutriplan.local
        └── Ingress (nginx)
              ├── /api  ──► Service nutriplan-backend ──► Pod (Node.js :3001)
              └── /     ──► Service nutriplan-frontend ──► Pod (nginx :80)
```

- **Frontend**: React + Vite + TypeScript, servido con Nginx dentro de Kubernetes.
- **Backend**: Node.js + Express + TypeScript, escucha en puerto 3001.
- **Base de datos**: PostgreSQL externa en [Neon](https://neon.tech) (no corre dentro del clúster).
- **Chatbot**: requiere `OPENAI_API_KEY`.

---

## Prerequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado en Windows con integración WSL2 activa.
- Ubuntu en WSL2 como entorno de trabajo principal.

---

## 1. Instalación de herramientas

Ejecutar desde Ubuntu (WSL2):

### kubectl

Instalación desde el repositorio oficial de Kubernetes:

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubectl
```

### minikube

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube-linux-amd64 && sudo mv minikube-linux-amd64 /usr/local/bin/minikube
```

### k9s (dashboard de terminal)

```bash
curl -sL https://github.com/derailed/k9s/releases/latest/download/k9s_Linux_amd64.tar.gz -o k9s.tar.gz
tar -xzf k9s.tar.gz k9s && sudo mv k9s /usr/local/bin/ && rm k9s.tar.gz
```

### kubeseal (cliente de Sealed Secrets)

```bash
KUBESEAL_VERSION=$(curl -s https://api.github.com/repos/bitnami-labs/sealed-secrets/releases/latest \
  | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')
curl -Lo kubeseal "https://github.com/bitnami-labs/sealed-secrets/releases/download/v${KUBESEAL_VERSION}/kubeseal-${KUBESEAL_VERSION}-linux-amd64.tar.gz" \
  | tar -xz kubeseal
sudo mv kubeseal /usr/local/bin/
```

---

## 2. Arrancar minikube

```bash
minikube start --driver=docker
minikube addons enable ingress

# Instalar el controller de Sealed Secrets en el clúster
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml

# Verificar que el ingress controller esté listo
kubectl get pods -n ingress-nginx

# Verificar que el controller de sealed-secrets esté listo
kubectl get pods -n kube-system | grep sealed-secrets
```

---

## 3. Clonar el repositorio

```bash
# Clonar en el filesystem nativo de WSL2 (mejor rendimiento)
git clone https://github.com/agutulop98/Nutriplan.git
cd Nutriplan
```

---

## 4. Construir las imágenes Docker

Desde la raíz del repositorio:

```bash
# Frontend (VITE_API_URL vacío → usa rutas relativas /api)
docker build --build-arg VITE_API_URL="" -t nutriplan-frontend:local .

# Backend
docker build -t nutriplan-backend:local ./backend
```

---

## 5. Cargar imágenes en minikube

```bash
minikube image load nutriplan-frontend:local
minikube image load nutriplan-backend:local
```

> Los manifiestos deben tener `imagePullPolicy: Never` para que Kubernetes use las imágenes locales cargadas y no intente descargarlas del registry.

---

## 6. Gestión de secretos con Sealed Secrets

Los secretos contienen credenciales reales y **nunca deben subirse al repositorio en texto claro**.

### Flujo correcto

**Paso 1 — Crear `k8s/secret.yaml` localmente (temporal, no versionar):**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nutriplan-secret
type: Opaque
stringData:
  DATABASE_URL: "postgresql://usuario:password@host/db?sslmode=require"
  JWT_SECRET: "tu-jwt-secret"
  FRONTEND_URL: "http://nutriplan.local"
  NODE_ENV: "production"
  OPENAI_API_KEY: "sk-proj-..."
```

Variables necesarias:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (Neon u otro proveedor) |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `FRONTEND_URL` | URL pública del frontend (`http://nutriplan.local`) |
| `NODE_ENV` | Entorno de ejecución (`production`) |
| `OPENAI_API_KEY` | Clave de API de OpenAI para el chatbot |

**Paso 2 — Generar `k8s/sealed-secret.yaml` (este sí puede versionarse):**

```bash
kubeseal --format yaml < k8s/secret.yaml > k8s/sealed-secret.yaml
```

**Paso 3 — Aplicar el sealed secret en el clúster:**

```bash
kubectl apply -f k8s/sealed-secret.yaml
```

**Paso 4 — Borrar el secret en claro:**

```bash
rm k8s/secret.yaml
```

> **Importante:** `k8s/secret.yaml` debe estar en `.gitignore`. El archivo `k8s/sealed-secret.yaml` es el que se puede commitear porque está cifrado con la clave pública del clúster.

---

## 7. Desplegar en Kubernetes

Aplicar los manifiestos en este orden:

```bash
kubectl apply -f k8s/sealed-secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

Deberías ver:

```
sealedsecret.bitnami.com/nutriplan-secret configured
deployment.apps/nutriplan-backend created
service/nutriplan-backend created
deployment.apps/nutriplan-frontend created
service/nutriplan-frontend created
ingress.networking.k8s.io/nutriplan-ingress created
```

---

## 8. Verificar el despliegue

```bash
kubectl get pods
kubectl get svc
kubectl get ingress
kubectl get sealedsecret
kubectl get secret
kubectl logs deployment/nutriplan-backend -f
```

---

## 9. Acceder a la app

### Opción A — Con `minikube tunnel` (recomendado en Windows)

Ejecutar en una terminal aparte (mantenerla abierta mientras se usa la app):

```bash
minikube tunnel
```

Luego editar el archivo `hosts` de **Windows** como Administrador:

```
C:\Windows\System32\drivers\etc\hosts
```

Agregar la línea:

```
127.0.0.1  nutriplan.local
```

> Con el tunnel activo, el Ingress queda expuesto en `127.0.0.1` y el navegador de Windows puede resolver `nutriplan.local` correctamente.

### Opción B — Sin tunnel (acceso desde WSL2)

Si no se usa tunnel, obtener la IP del clúster y apuntar el dominio a ella:

```bash
# Obtener la IP de minikube
minikube ip

# Agregar al /etc/hosts de WSL2
echo "$(minikube ip)  nutriplan.local" | sudo tee -a /etc/hosts
```

En este caso el acceso desde el navegador de Windows puede requerir también editar `C:\Windows\System32\drivers\etc\hosts` con esa misma IP.

### Abrir en el navegador

```
http://nutriplan.local
```

---

## Estructura de manifiestos K8s

```
k8s/
├── secret.yaml              # Credenciales en claro (NO en git, borrar tras generar sealed)
├── sealed-secret.yaml       # Credenciales cifradas con kubeseal (sí puede versionarse)
├── deployment.yaml          # Deployment del backend (Node.js)
├── service.yaml             # Service del backend (ClusterIP :3001)
├── frontend-deployment.yaml # Deployment del frontend (nginx)
├── frontend-service.yaml    # Service del frontend (ClusterIP :80)
└── ingress.yaml             # Ingress nginx con ruteo /api → backend, / → frontend
```

---

## Navegación con k9s

```bash
k9s
```

| Comando | Descripción |
|---|---|
| `:pod` | Ver pods |
| `:deploy` | Ver deployments |
| `:svc` | Ver services |
| `:ingress` | Ver ingress |
| `:secret` | Ver secrets |
| `l` sobre un pod | Ver logs en tiempo real |
| `d` sobre un pod | Describe el recurso |

---

## Comandos útiles

```bash
# Logs del backend en tiempo real
kubectl logs deployment/nutriplan-backend -f

# Reiniciar un deployment (útil tras recargar una imagen)
kubectl rollout restart deployment/nutriplan-backend
kubectl rollout restart deployment/nutriplan-frontend

# Escalar réplicas
kubectl scale deployment/nutriplan-backend --replicas=2

# Eliminar todos los recursos del proyecto
kubectl delete -f k8s/
```

---

## Troubleshooting

### Pod en `ImagePullBackOff`

Kubernetes no encuentra la imagen. Verificar que:

1. La imagen se construyó correctamente: `docker images | grep nutriplan`
2. Se cargó en minikube: `minikube image load nutriplan-backend:local`
3. El manifiesto tiene `imagePullPolicy: Never`

### Pod en `CrashLoopBackOff`

El proceso del contenedor falla al arrancar. Revisar los logs:

```bash
kubectl logs deployment/nutriplan-backend
kubectl logs deployment/nutriplan-backend --previous
```

Causas frecuentes: variables de entorno faltantes, error en la conexión a la base de datos.

### Ingress no responde

Verificar que:

1. El addon de ingress está habilitado: `minikube addons enable ingress`
2. El pod del ingress controller está corriendo: `kubectl get pods -n ingress-nginx`
3. El archivo `hosts` tiene la entrada correcta para `nutriplan.local`
4. Si se usa `minikube tunnel`, la terminal con el tunnel sigue abierta

### Error de conexión a la base de datos

Verificar que:

1. `DATABASE_URL` en el secret tiene el valor correcto (usuario, contraseña, host, nombre de BD)
2. El proveedor de la BD (Neon) tiene habilitado el acceso desde IPs externas
3. El sealed secret se aplicó correctamente: `kubectl get secret nutriplan-secret`

### Frontend no llama al backend

Verificar que:

1. La imagen del frontend se construyó con `VITE_API_URL=""` (rutas relativas `/api`)
2. El Ingress enruta `/api` correctamente al service `nutriplan-backend` en puerto 3001
3. Las peticiones del frontend usan la ruta relativa `/api/...` y no una URL absoluta hardcodeada

---

## Limpiar el entorno

```bash
kubectl delete -f k8s/
minikube stop
```
