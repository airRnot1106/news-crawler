import { article } from '@/server/api/nhk/article/route';
import { articles } from '@/server/api/nhk/articles/route';
import { category } from '@/server/api/nhk/category/route';
import { Hono } from 'hono';

export const nhk = new Hono()
  .basePath('/nhk')
  .route('/', article)
  .route('/', articles)
  .route('/', category);
