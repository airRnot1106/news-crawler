import { YahooArticleSchema } from '@/server/api/v1/yahoo/schema';
import { createResultSchema } from '@/server/schema';
import { z } from '@hono/zod-openapi';

export const YahooArticleQuerySchema = z.object({
  article_url: z
    .string()
    .url()
    .openapi({
      example:
        'https://news.yahoo.co.jp/articles/7262178b4d9f926d04c695ec178c46118723a296',
      param: {
        name: 'article_url',
        in: 'query',
      },
    }),
});

export const YahooArticleResultSchema = createResultSchema(YahooArticleSchema);
