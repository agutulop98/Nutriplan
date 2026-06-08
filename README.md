
## Running the code

Install dependencies:

```bash
npm install
npm --prefix backend install
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
npm run seed           # initial 8 recipes
npm --prefix backend run seed:extra   # full 30 recipes + example users
```

### Example users

| Email | Password | Role |
|-------|----------|------|
| admin@nutriplan.com | admin123 | Admin |
| maria@example.com | maria123 | User |
| juan@example.com | juan123 | User |
