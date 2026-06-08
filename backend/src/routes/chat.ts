import { Router } from 'express';
import OpenAI from 'openai';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY no configurada');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_recipes',
      description: 'Busca recetas por nombre, ingrediente, categoría o dificultad.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Texto a buscar en nombre o ingredientes' },
          category: { type: 'string', enum: ['Desayuno', 'Comida', 'Cena', 'Snack'] },
          difficulty: { type: 'string', enum: ['Fácil', 'Media', 'Difícil'] },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recipe',
      description: 'Obtiene detalles completos de una receta: ingredientes, pasos y calorías.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'number' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_recipe',
      description: 'Crea y guarda una nueva receta. Solo cuando el usuario pida explícitamente crear o añadir una receta.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          calories: { type: 'number', description: 'Calorías por ración (kcal)' },
          time: { type: 'number', description: 'Minutos de preparación' },
          difficulty: { type: 'string', enum: ['Fácil', 'Media', 'Difícil'] },
          category: { type: 'string', enum: ['Desayuno', 'Comida', 'Cena', 'Snack'] },
          servings: { type: 'number' },
          ingredients: { type: 'array', items: { type: 'string' }, description: 'Con cantidades, ej: "200g de pasta"' },
          steps: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'ingredients', 'steps'],
      },
    },
  },
];

async function executeTool(name: string, args: any): Promise<any> {
  if (name === 'search_recipes') {
    let query = 'SELECT id, name, calories, time, difficulty, category FROM recipes WHERE 1=1';
    const params: any[] = [];
    let i = 1;
    if (args.query) {
      query += ` AND (name ILIKE $${i} OR id IN (SELECT recipe_id FROM recipe_ingredients WHERE ingredient ILIKE $${i + 1}))`;
      params.push(`%${args.query}%`, `%${args.query}%`);
      i += 2;
    }
    if (args.category) { query += ` AND category = $${i++}`; params.push(args.category); }
    if (args.difficulty) { query += ` AND difficulty = $${i++}`; params.push(args.difficulty); }
    query += ' ORDER BY id LIMIT 10';
    const { rows } = await pool.query(query, params);
    return rows;
  }

  if (name === 'get_recipe') {
    const { rows } = await pool.query('SELECT * FROM recipes WHERE id = $1', [Number(args.id)]);
    if (!rows[0]) return { error: 'Receta no encontrada' };
    const { rows: ings } = await pool.query('SELECT ingredient FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY sort_order', [args.id]);
    const { rows: steps } = await pool.query('SELECT description FROM recipe_steps WHERE recipe_id = $1 ORDER BY step_order', [args.id]);
    return { ...rows[0], ingredients: ings.map((r: any) => r.ingredient), steps: steps.map((r: any) => r.description) };
  }

  if (name === 'create_recipe') {
    const { name, image, time, calories, difficulty, category, servings, ingredients, steps } = args;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'INSERT INTO recipes (name, image, time, calories, difficulty, category, servings) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [name, image ?? null, time ?? null, calories ?? null, difficulty ?? null, category ?? null, servings ?? 2]
      );
      const id = result.rows[0].id;
      for (let i = 0; i < (ingredients as string[]).length; i++) {
        await client.query('INSERT INTO recipe_ingredients (recipe_id, ingredient, sort_order) VALUES ($1,$2,$3)', [id, ingredients[i], i]);
      }
      for (let i = 0; i < (steps as string[]).length; i++) {
        await client.query('INSERT INTO recipe_steps (recipe_id, description, step_order) VALUES ($1,$2,$3)', [id, steps[i], i + 1]);
      }
      await client.query('COMMIT');
      const { rows } = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
      return { success: true, recipe: rows[0] };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  return { error: 'Herramienta desconocida' };
}

const SYSTEM = `Eres el asistente de NutriPlan, una app de planificación de comidas saludables. Puedes:
- Buscar recetas existentes y consultar sus calorías, ingredientes y preparación
- Crear nuevas recetas directamente en la base de datos

Responde siempre en español, de forma concisa y amigable. Usa las herramientas para obtener datos reales.
Cuando te pregunten por calorías de una receta, búscala y devuelve el dato real.
Cuando el usuario quiera añadir una receta, recoge todos los datos y usa create_recipe.
Si necesitas estimar calorías para una receta nueva, haz una estimación razonable basada en los ingredientes.`;

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { messages } = req.body as { messages: { role: string; content: string }[] };
    if (!Array.isArray(messages)) { res.status(400).json({ error: 'messages debe ser un array' }); return; }

    const openai = getOpenAI();
    const chat: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    for (let i = 0; i < 5; i++) {
      const response = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: chat, tools, tool_choice: 'auto' });
      const msg = response.choices[0].message;
      chat.push(msg);

      if (!msg.tool_calls?.length) { res.json({ message: msg.content }); return; }

      for (const tc of msg.tool_calls) {
        if (tc.type !== 'function') continue;
        const result = await executeTool(tc.function.name, JSON.parse(tc.function.arguments));
        chat.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      }
    }

    res.json({ message: 'No pude procesar la solicitud. Intenta de nuevo.' });
  } catch (err: any) {
    console.error('Chat error:', err?.message);
    res.status(500).json({ error: err?.message ?? 'Error interno' });
  }
});

export default router;
