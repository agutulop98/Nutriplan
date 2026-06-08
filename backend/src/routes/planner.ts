import { Router } from 'express';
import { z } from 'zod';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEALS = ['Desayuno', 'Comida', 'Merienda', 'Cena'];

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const { rows } = await pool.query(`
    SELECT wp.day, wp.meal_type,
           r.id, r.name, r.image, r.calories, r.time, r.difficulty, r.category
    FROM week_plans wp
    LEFT JOIN recipes r ON wp.recipe_id = r.id
    WHERE wp.user_id = $1
  `, [req.userId]);

  const plan: Record<string, Record<string, any>> = {};
  for (const day of DAYS) {
    plan[day] = {};
    for (const meal of MEALS) plan[day][meal] = null;
  }
  for (const row of rows) {
    if (row.id) {
      plan[row.day][row.meal_type] = {
        id: row.id, name: row.name, image: row.image,
        calories: row.calories, time: row.time,
        difficulty: row.difficulty, category: row.category,
      };
    }
  }
  res.json(plan);
});

const SetMealSchema = z.object({
  day: z.string(),
  meal: z.string(),
  recipeId: z.number().nullable(),
});

router.put('/', authenticate, async (req: AuthRequest, res) => {
  const parsed = SetMealSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Datos inválidos' }); return; }

  const { day, meal, recipeId } = parsed.data;
  if (!DAYS.includes(day) || !MEALS.includes(meal)) {
    res.status(400).json({ error: 'Día o comida inválidos' }); return;
  }

  if (recipeId === null) {
    await pool.query('DELETE FROM week_plans WHERE user_id = $1 AND day = $2 AND meal_type = $3', [req.userId, day, meal]);
  } else {
    const { rows } = await pool.query('SELECT id FROM recipes WHERE id = $1', [recipeId]);
    if (!rows[0]) { res.status(404).json({ error: 'Receta no encontrada' }); return; }
    await pool.query(`
      INSERT INTO week_plans (user_id, day, meal_type, recipe_id) VALUES ($1, $2, $3, $4)
      ON CONFLICT(user_id, day, meal_type) DO UPDATE SET recipe_id = EXCLUDED.recipe_id
    `, [req.userId, day, meal, recipeId]);
  }

  res.json({ success: true });
});

export default router;
