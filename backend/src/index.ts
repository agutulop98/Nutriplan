import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { migrate } from './migrate';
import authRoutes from './routes/auth';
import recipesRoutes from './routes/recipes';
import plannerRoutes from './routes/planner';
import shoppingRoutes from './routes/shopping';
import favoritesRoutes from './routes/favorites';
import chatRoutes from './routes/chat';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/chat', chatRoutes);

async function main() {
  await migrate();
  app.listen(PORT, () => {
    console.log(`NutriPlan API corriendo en http://localhost:${PORT}`);
  });
}

main().catch(err => { console.error(err); process.exit(1); });
