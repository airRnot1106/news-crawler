import { NHKArticleInfoSchema } from '@/server/api/nhk/schema';
import { createResultSchema } from '@/server/schema';
import { z } from '@hono/zod-openapi';

export const NHKArticlesQuerySchema = z.object({
  category_url: z
    .string()
    .url()
    .openapi({
      example: 'https://www3.nhk.or.jp/news/cat01.html',
      param: {
        name: 'category_url',
        in: 'query',
      },
    }),
});

export const NHKArticlesResultSchema = createResultSchema(
  NHKArticleInfoSchema.array(),
);
