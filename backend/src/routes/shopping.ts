import { Router } from 'express';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

function categorize(ingredient: string): string {
  const low = ingredient.toLowerCase();
  if (/pollo|salmón|atún|huevo|pechuga|carne|ternera|cerdo|garbanz/.test(low)) return 'Proteínas';
  if (/leche|yogur|queso|kéfir|crema|parmesano/.test(low)) return 'Lácteos';
  if (/tomate|lechuga|espinaca|zanahoria|pepino|cebolla|ajo|pimiento|aguacate|brócoli|calabac|cilantro|apio/.test(low)) return 'Verduras';
  if (/plátano|fresa|mango|arándano|manzana|naranja|limón|kiwi|acai|açaí|coco/.test(low)) return 'Frutas';
  if (/arroz|pasta|pan|avena|quinoa|harina|cereal|granola|tortilla|integral/.test(low)) return 'Cereales';
  return 'Otros';
}

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const { rows } = await pool.query('SELECT * FROM shopping_items WHERE user_id = $1 ORDER BY category, id', [req.userId]);
  res.json(rows);
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { name, category } = req.body;
  if (!name?.trim() || !category?.trim()) { res.status(400).json({ error: 'Nombre y categoría son obligatorios' }); return; }
  const { rows } = await pool.query(
    'INSERT INTO shopping_items (user_id, name, category, custom) VALUES ($1, $2, $3, 1) RETURNING *',
    [req.userId, name.trim(), category.trim()]
  );
  res.status(201).json(rows[0]);
});

router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  const { checked } = req.body;
  await pool.query('UPDATE shopping_items SET checked = $1 WHERE id = $2 AND user_id = $3', [checked ? 1 : 0, Number(req.params.id), req.userId]);
  res.json({ success: true });
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  await pool.query('DELETE FROM shopping_items WHERE id = $1 AND user_id = $2', [Number(req.params.id), req.userId]);
  res.json({ success: true });
});

router.delete('/', authenticate, async (req: AuthRequest, res) => {
  const { onlyChecked } = req.query;
  if (onlyChecked === 'true') {
    await pool.query('DELETE FROM shopping_items WHERE user_id = $1 AND checked = 1', [req.userId]);
  } else {
    await pool.query('DELETE FROM shopping_items WHERE user_id = $1', [req.userId]);
  }
  res.json({ success: true });
});

router.post('/generate', authenticate, async (req: AuthRequest, res) => {
  const { rows } = await pool.query(`
    SELECT ri.ingredient
    FROM week_plans wp
    JOIN recipe_ingredients ri ON ri.recipe_id = wp.recipe_id
    WHERE wp.user_id = $1
  `, [req.userId]);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM shopping_items WHERE user_id = $1 AND custom = 0', [req.userId]);
    const seen = new Set<string>();
    for (const row of rows) {
      const key = row.ingredient.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        await client.query(
          'INSERT INTO shopping_items (user_id, name, category, custom) VALUES ($1, $2, $3, 0)',
          [req.userId, row.ingredient, categorize(row.ingredient)]
        );
      }
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  const { rows: items } = await pool.query('SELECT * FROM shopping_items WHERE user_id = $1 ORDER BY category, id', [req.userId]);
  res.json(items);
});

export default router;
