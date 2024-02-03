import { nhk } from '@/server/api/v1/nhk/route';
import { yahoo } from '@/server/api/v1/yahoo/route';
import { OpenAPIHono } from '@hono/zod-openapi';

export const v1 = new OpenAPIHono().route('/', nhk).route('/', yahoo);
