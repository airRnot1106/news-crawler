import { articles } from '@/server/api/yahoo/articles/route';
import { category } from '@/server/api/yahoo/category/route';
import { Hono } from 'hono';

export const yahoo = new Hono()
  .basePath('/yahoo')
  .route('/', articles)
  .route('/', category);
