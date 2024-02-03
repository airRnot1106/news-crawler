import { YahooArticleInfoSchema } from '@/server/api/v1/yahoo/schema';
import { createResultSchema } from '@/server/schema';
import { z } from '@hono/zod-openapi';

export const YahooArticlesQuerySchema = z.object({
  category_url: z
    .string()
    .url()
    .openapi({
      example: 'https://news.yahoo.co.jp/categories/domestic',
      param: {
        name: 'category_url',
        in: 'query',
      },
    }),
});

export const YahooArticlesResultSchema = createResultSchema(
  YahooArticleInfoSchema.array(),
);
