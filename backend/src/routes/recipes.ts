import { Router } from 'express';
import { z } from 'zod';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const RecipeSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  image: z.string().optional().nullable(),
  time: z.number().int().positive().optional().nullable(),
  calories: z.number().int().positive().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  servings: z.number().int().positive().optional().nullable(),
  ingredients: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
});

async function buildRecipe(row: any) {
  const { rows: ings } = await pool.query(
    'SELECT ingredient FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY sort_order',
    [row.id]
  );
  const { rows: steps } = await pool.query(
    'SELECT description FROM recipe_steps WHERE recipe_id = $1 ORDER BY step_order',
    [row.id]
  );
  return { ...row, ingredients: ings.map((r: any) => r.ingredient), steps: steps.map((r: any) => r.description) };
}

router.get('/', async (req, res) => {
  const { search, category, difficulty } = req.query;
  let query = 'SELECT * FROM recipes WHERE 1=1';
  const params: any[] = [];
  let i = 1;

  if (search) {
    query += ` AND (name ILIKE $${i} OR id IN (SELECT recipe_id FROM recipe_ingredients WHERE ingredient ILIKE $${i + 1}))`;
    params.push(`%${search}%`, `%${search}%`);
    i += 2;
  }
  if (category && category !== 'Todas') {
    query += ` AND category = $${i++}`;
    params.push(category);
  }
  if (difficulty && difficulty !== 'Todas') {
    query += ` AND difficulty = $${i++}`;
    params.push(difficulty);
  }
  query += ' ORDER BY id';

  const { rows } = await pool.query(query, params);
  res.json(await Promise.all(rows.map(buildRecipe)));
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM recipes WHERE id = $1', [Number(req.params.id)]);
  if (!rows[0]) { res.status(404).json({ error: 'Receta no encontrada' }); return; }
  res.json(await buildRecipe(rows[0]));
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const parsed = RecipeSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  const { name, image, time, calories, difficulty, category, servings, ingredients, steps } = parsed.data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO recipes (name, image, time, calories, difficulty, category, servings) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [name, image ?? null, time ?? null, calories ?? null, difficulty ?? null, category ?? null, servings ?? 2]
    );
    const id = result.rows[0].id;

    for (let i = 0; i < ingredients.length; i++) {
      await client.query('INSERT INTO recipe_ingredients (recipe_id, ingredient, sort_order) VALUES ($1,$2,$3)', [id, ingredients[i], i]);
    }
    for (let i = 0; i < steps.length; i++) {
      await client.query('INSERT INTO recipe_steps (recipe_id, description, step_order) VALUES ($1,$2,$3)', [id, steps[i], i + 1]);
    }
    await client.query('COMMIT');

    const { rows } = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
    res.status(201).json(await buildRecipe(rows[0]));
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { rows: existing } = await pool.query('SELECT id FROM recipes WHERE id = $1', [id]);
  if (!existing[0]) { res.status(404).json({ error: 'Receta no encontrada' }); return; }

  const parsed = RecipeSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  const { name, image, time, calories, difficulty, category, servings, ingredients, steps } = parsed.data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE recipes SET name=$1,image=$2,time=$3,calories=$4,difficulty=$5,category=$6,servings=$7 WHERE id=$8',
      [name, image ?? null, time ?? null, calories ?? null, difficulty ?? null, category ?? null, servings ?? 2, id]
    );
    await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [id]);
    for (let i = 0; i < ingredients.length; i++) {
      await client.query('INSERT INTO recipe_ingredients (recipe_id, ingredient, sort_order) VALUES ($1,$2,$3)', [id, ingredients[i], i]);
    }
    await client.query('DELETE FROM recipe_steps WHERE recipe_id = $1', [id]);
    for (let i = 0; i < steps.length; i++) {
      await client.query('INSERT INTO recipe_steps (recipe_id, description, step_order) VALUES ($1,$2,$3)', [id, steps[i], i + 1]);
    }
    await client.query('COMMIT');

    const { rows } = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
    res.json(await buildRecipe(rows[0]));
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query('SELECT id FROM recipes WHERE id = $1', [id]);
  if (!rows[0]) { res.status(404).json({ error: 'Receta no encontrada' }); return; }
  await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
  res.json({ success: true });
});

export default router;
