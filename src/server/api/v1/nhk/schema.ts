import { ElementSchema } from '@/server/schema';
import { z } from '@hono/zod-openapi';

export const NHKCategorySchema = z
  .object({
    label: z.string().openapi({
      example: '社会',
    }),
    data_category: z.string().openapi({
      example: 'news-social',
    }),
    url: z.string().url().openapi({
      example: 'https://www3.nhk.or.jp/news/cat01.html',
    }),
  })
  .openapi('NHKCategory');

export type NHKCategory = z.infer<typeof NHKCategorySchema>;

export const NHKArticleInfoSchema = z
  .object({
    title: z.string().openapi({
      example: '陸自と米海兵隊 九州沖縄で共同訓練へ 離島防衛を想定',
    }),
    date: z.string().datetime().openapi({
      example: '2024-02-02T20:54',
    }),
    url: z.string().url().openapi({
      example: 'https://www3.nhk.or.jp/news/html/20240202/k10014345361000.html',
    }),
    word: z
      .object({
        label: z.string().openapi({
          example: '防衛省・自衛隊',
        }),
        url: z.string().url().openapi({
          example: 'https://www3.nhk.or.jp/news/word/0000947.html',
        }),
      })
      .nullable(),
    thumbnail: z.string().url().openapi({
      example: 'https://www3.nhk.or.jp/news/html/20240202/k10014345361000.html',
    }),
    source: z.literal('nhk').openapi({
      example: 'nhk',
    }),
    media: z.literal('nhk').openapi({
      example: 'nhk',
    }),
  })
  .openapi('NHKArticleInfo');

export type NHKArticleInfo = z.infer<typeof NHKArticleInfoSchema>;

export const NHKArticleSchema = z
  .object({
    info: NHKArticleInfoSchema,
    elements: z.array(ElementSchema),
    raw: z.string(),
  })
  .openapi('NHKArticle');

export type NHKArticle = z.infer<typeof NHKArticleSchema>;
