import { nhk } from '@/server/api/nhk/route';
import { yahoo } from '@/server/api/yahoo/route';
import { OpenAPIHono } from '@hono/zod-openapi';

export const api = new OpenAPIHono().route('/', nhk).route('/', yahoo);
