import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../db';
import { JWT_SECRET } from '../middleware/auth';

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  const { name, email, password } = parsed.data;
  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hash]
    );
    const id = result.rows[0].id;
    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id, name, email } });
  } catch (e: any) {
    if (e.code === '23505') {
      res.status(409).json({ error: 'Este email ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Datos inválidos' }); return; }

  const { email, password } = parsed.data;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Email o contraseña incorrectos' }); return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ error: 'No autorizado' }); return; }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { rows } = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [payload.userId]);
    if (!rows[0]) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
    res.json(rows[0]);
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
