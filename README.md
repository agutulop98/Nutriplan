# NutriPlan

Aplicación web de planificación nutricional con chatbot de IA.

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript (puerto 3001)
- **Base de datos**: PostgreSQL en [Neon](https://neon.tech)
- **Chatbot**: OpenAI API

---

## Desarrollo local

### Instalar dependencias

```bash
npm install
npm --prefix backend install
```

### Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` con los valores reales. Variables necesarias:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` | Clave secreta para tokens JWT |
| `OPENAI_API_KEY` | Clave de API de OpenAI |

### Arrancar la aplicación

```bash
npm run dev:all
```

Abre **http://localhost:5173** en el navegador. El backend corre en `localhost:3001`.

### Arrancar servidores por separado

```bash
npm run dev:frontend   # solo frontend (puerto 5173)
npm run dev:backend    # solo backend (puerto 3001)
```

### Poblar la base de datos

```bash
npm run seed
```

---

## Despliegue en Kubernetes (minikube)

Para desplegar la aplicación completa en un clúster local con minikube (Windows + WSL2), consulta la guía detallada:

**[KUBERNETES.md](./KUBERNETES.md)**

Incluye: instalación de herramientas, construcción de imágenes, gestión de secretos con Sealed Secrets, configuración de Ingress y troubleshooting.
