
## Running the code

Install dependencies:

```bash
npm install
npm --prefix backend install
```

Copy the example env file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

Start both frontend and backend together:

```bash
npm run dev:all
```

Then open **http://localhost:5173** in your browser.

> `localhost:3001` is the backend API — open `localhost:5173` for the app.

### Individual servers

```bash
npm run dev:frontend   # frontend only (port 5173)
npm run dev:backend    # backend only (port 3001)
```

### Seed the database

```bash
npm run seed
```

### Environment variables

See `backend/.env.example` for required variables (`DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`).
