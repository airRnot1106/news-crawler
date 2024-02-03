import { NHKCategoryResultSchema } from '@/server/api/nhk/category/schema';
import { NHKCategory } from '@/server/api/nhk/schema';
import { createBrowser } from '@/server/libs/puppeteer';
import { ErrorSchema } from '@/server/schema';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/api/v1/nhk/category',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: NHKCategoryResultSchema,
        },
      },
      description: 'NHK news categories',
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
  const url = 'https://www3.nhk.or.jp/news/';

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

  const categories = await page.$$eval('ul.nav-ex > li > a', (anchors) =>
    anchors
      .map((anchor) => {
        const label = anchor.textContent?.trim();
        if (!label) {
          return;
        }

        const dataCategory = anchor.getAttribute('data-category');
        if (!dataCategory) {
          return;
        }

        const { href } = anchor;

        return {
          label,
          data_category: dataCategory,
          url: href,
        };
      })
      .filter((category): category is NHKCategory => !!category),
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
