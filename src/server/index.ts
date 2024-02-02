import { api } from '@/server/api/route';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';

const app = new Hono().use('*', prettyJSON()).route('/', api);
export type AppType = typeof app;

const port = 3000;
// biome-ignore lint/suspicious/noConsoleLog: <explanation>
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
