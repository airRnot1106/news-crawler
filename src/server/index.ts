import { api } from '@/server/api/route';
import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { prettyJSON } from 'hono/pretty-json';

const app = new OpenAPIHono().route('/', api);
export type AppType = typeof app;

app.use('*', prettyJSON());

app.get('/ui', swaggerUI({ url: '/doc' }));

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'News Crawler API',
    version: '1.0.0',
  },
});

const port = 3000;
// biome-ignore lint/suspicious/noConsoleLog: <explanation>
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
