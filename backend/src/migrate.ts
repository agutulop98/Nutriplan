import pool from './db';

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT,
      time INTEGER,
      calories INTEGER,
      difficulty TEXT,
      category TEXT,
      servings INTEGER DEFAULT 2,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id SERIAL PRIMARY KEY,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      ingredient TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS recipe_steps (
      id SERIAL PRIMARY KEY,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      step_order INTEGER NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, recipe_id)
    );

    CREATE TABLE IF NOT EXISTS week_plans (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
      UNIQUE(user_id, day, meal_type)
    );

    CREATE TABLE IF NOT EXISTS shopping_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      checked INTEGER DEFAULT 0,
      custom INTEGER DEFAULT 0
    );
  `);
  console.log('Tablas creadas correctamente');
}
