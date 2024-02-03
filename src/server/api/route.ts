import { v1 } from '@/server/api/v1/route';
import { OpenAPIHono } from '@hono/zod-openapi';

export const api = new OpenAPIHono().route('/', v1);
