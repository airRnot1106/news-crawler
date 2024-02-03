import { article } from '@/server/api/yahoo/article/route';
import { articles } from '@/server/api/yahoo/articles/route';
import { category } from '@/server/api/yahoo/category/route';
import { OpenAPIHono } from '@hono/zod-openapi';

export const yahoo = new OpenAPIHono()
  .route('/', article)
  .route('/', articles)
  .route('/', category);
