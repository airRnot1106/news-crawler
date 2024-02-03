import { ElementSchema } from '@/server/schema';
import { z } from '@hono/zod-openapi';

export const YahooCategorySchema = z
  .object({
    label: z.string().openapi({ example: '国内' }),
    url: z
      .string()
      .url()
      .openapi({ example: 'https://news.yahoo.co.jp/categories/domestic' }),
  })
  .openapi('YahooCategory');

export type YahooCategory = z.infer<typeof YahooCategorySchema>;

export const YahooArticleInfoSchema = z
  .object({
    title: z.string().openapi({
      example:
        '大須観音で節分会の豆まき　鬼面が寺宝のため「鬼は外」は禁句　参拝者が「福は内　福は内」と厄除け',
    }),
    date: z.string().datetime().openapi({ example: '2024-02-03 03:47' }),
    url: z.string().url().openapi({
      example:
        'https://news.yahoo.co.jp/articles/7262178b4d9f926d04c695ec178c46118723a296',
    }),
    thumbnail: z
      .string()
      .url()
      .openapi({
        example:
          'https://newsatcl-pctr.c.yimg.jp/t/amd-img/20240203-90022763-nbnv-000-1-thumb.jpg?pri=l&w=300&h=168&exp=10800',
      })
      .nullable(),
    source: z.literal('yahoo').openapi({ example: 'yahoo' }),
    media: z.string().openapi({ example: 'メ〜テレ（名古屋テレビ）' }),
  })
  .openapi('YahooArticleInfo');

export type YahooArticleInfo = z.infer<typeof YahooArticleInfoSchema>;

export const YahooArticleSchema = z
  .object({
    info: YahooArticleInfoSchema,
    elements: z.array(ElementSchema),
    raw: z.string(),
  })
  .openapi('YahooArticle');

export type YahooArticle = z.infer<typeof YahooArticleSchema>;
