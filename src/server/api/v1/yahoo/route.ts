import { article } from '@/server/api/v1/yahoo/article/route';
import { articles } from '@/server/api/v1/yahoo/articles/route';
import { category } from '@/server/api/v1/yahoo/category/route';
import { OpenAPIHono } from '@hono/zod-openapi';

export const yahoo = new OpenAPIHono()
  .route('/', article)
  .route('/', articles)
  .route('/', category);
