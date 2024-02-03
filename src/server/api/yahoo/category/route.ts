import { YahooCategoryResultSchema } from '@/server/api/yahoo/category/schema';
import { YahooCategory } from '@/server/api/yahoo/schema';
import { createBrowser } from '@/server/libs/puppeteer';
import { ErrorSchema } from '@/server/schema';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/api/v1/yahoo/category',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: YahooCategoryResultSchema,
        },
      },
      description: 'Yahoo news categories',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

export const category = new OpenAPIHono().openapi(route, async (c) => {
  const url = 'https://news.yahoo.co.jp/';

  const browser = await createBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url);
  } catch (e) {
    if (e instanceof Error) {
      return c.json(
        {
          ok: false,
          error: e.message,
        } as const,
        500,
      );
    }
    return c.json(
      {
        ok: false,
        error: 'unknown error',
      } as const,
      500,
    );
  }

  const categories = await page.$$eval('#snavi > ul > li > a', (anchors) =>
    anchors
      .map((anchor) => {
        const label = anchor.textContent?.trim();
        if (!label) {
          return;
        }

        const { href } = anchor;

        return {
          label,
          url: href,
        };
      })
      .filter((category): category is YahooCategory => !!category)
      .filter(
        (category) =>
          category.label !== '主要' && category.label !== 'トピックス一覧',
      ),
  );

  await browser.close();

  return c.json(
    {
      ok: true,
      value: categories,
    } as const,
    200,
  );
});
