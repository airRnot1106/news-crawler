import { article } from '@/server/api/nhk/article/route';
import { articles } from '@/server/api/nhk/articles/route';
import { category } from '@/server/api/nhk/category/route';
import { OpenAPIHono } from '@hono/zod-openapi';

export const nhk = new OpenAPIHono()
  .route('/', article)
  .route('/', articles)
  .route('/', category);
