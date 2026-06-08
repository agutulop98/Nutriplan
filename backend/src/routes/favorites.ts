import { Router } from 'express';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

async function buildRecipe(row: any) {
  const { rows: ings } = await pool.query(
    'SELECT ingredient FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY sort_order', [row.id]
  );
  const { rows: steps } = await pool.query(
    'SELECT description FROM recipe_steps WHERE recipe_id = $1 ORDER BY step_order', [row.id]
  );
  return { ...row, ingredients: ings.map((r: any) => r.ingredient), steps: steps.map((r: any) => r.description) };
}

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const { rows } = await pool.query(`
    SELECT r.* FROM favorites f
    JOIN recipes r ON f.recipe_id = r.id
    WHERE f.user_id = $1
    ORDER BY r.id
  `, [req.userId]);
  res.json(await Promise.all(rows.map(buildRecipe)));
});

router.post('/:id', authenticate, async (req: AuthRequest, res) => {
  const recipeId = Number(req.params.id);
  const { rows } = await pool.query('SELECT id FROM recipes WHERE id = $1', [recipeId]);
  if (!rows[0]) { res.status(404).json({ error: 'Receta no encontrada' }); return; }
  try {
    await pool.query('INSERT INTO favorites (user_id, recipe_id) VALUES ($1, $2)', [req.userId, recipeId]);
  } catch { /* already favorited */ }
  res.json({ success: true });
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  await pool.query('DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2', [req.userId, Number(req.params.id)]);
  res.json({ success: true });
});

export default router;
