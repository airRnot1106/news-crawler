import { article } from '@/server/api/v1/nhk/article/route';
import { articles } from '@/server/api/v1/nhk/articles/route';
import { category } from '@/server/api/v1/nhk/category/route';
import { OpenAPIHono } from '@hono/zod-openapi';

export const nhk = new OpenAPIHono()
  .route('/', article)
  .route('/', articles)
  .route('/', category);
