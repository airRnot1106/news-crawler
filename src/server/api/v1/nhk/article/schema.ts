import { NHKArticleSchema } from '@/server/api/v1/nhk/schema';
import { createResultSchema } from '@/server/schema';
import { z } from '@hono/zod-openapi';

export const NHKArticleQuerySchema = z.object({
  article_url: z
    .string()
    .url()
    .openapi({
      example: 'https://www3.nhk.or.jp/news/html/20240202/k10014345361000.html',
      param: {
        name: 'article_url',
        in: 'query',
      },
    }),
});

export const NHKArticleResultSchema = createResultSchema(NHKArticleSchema);
