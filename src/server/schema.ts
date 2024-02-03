import { z } from '@hono/zod-openapi';

export const createResultSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    ok: z.literal(true),
    value: schema,
  });

export const ErrorSchema = z
  .object({
    ok: z.literal(false),
    error: z.string(),
  })
  .openapi('Error');

export const ParagraphElementSchema = z
  .object({
    type: z.literal('paragraph').openapi({
      example: 'paragraph',
    }),
    text: z.string().openapi({
      example:
        '陸上自衛隊は、離島の防衛を想定したアメリカ海兵隊との共同訓練を、今月下旬から九州・沖縄で行うと発表しました。一部の訓練は鹿児島県の沖永良部島で初めて行うとしています。',
    }),
  })
  .openapi('ParagraphElement');

export type ParagraphElement = z.infer<typeof ParagraphElementSchema>;

export const ImageElementSchema = z
  .object({
    type: z.literal('image').openapi({
      example: 'image',
    }),
    src: z.string().url().openapi({
      example:
        'https://www3.nhk.or.jp/news/html/20240202/K10014345321_2402021849_0202194223_02_03.jpg',
    }),
  })
  .openapi('ImageElement');

export type ImageElement = z.infer<typeof ImageElementSchema>;

export const ElementSchema = z.union([
  ParagraphElementSchema,
  ImageElementSchema,
]);

export type ArticleElement = z.infer<typeof ElementSchema>;
