import { nhk } from '@/server/api/nhk/route';
import { Hono } from 'hono';
export const api = new Hono().basePath('/api').route('/', nhk);
