import { category } from '@/server/api/nhk/category/route';
import { Hono } from 'hono';

export const nhk = new Hono().basePath('/nhk').route('/', category);
