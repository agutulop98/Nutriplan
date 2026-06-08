export function getToken() {
  return localStorage.getItem('token');
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(err.error ?? 'Error desconocido');
  }
  return res.json() as Promise<T>;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Recipe {
  id: number;
  name: string;
  image: string | null;
  time: number | null;
  calories: number | null;
  difficulty: string | null;
  category: string | null;
  servings: number | null;
  ingredients: string[];
  steps: string[];
}

export interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  checked: number;
  custom: number;
}

export type WeekPlan = Record<string, Record<string, Recipe | null>>;
