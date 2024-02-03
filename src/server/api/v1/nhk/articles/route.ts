import {
  NHKArticlesQuerySchema,
  NHKArticlesResultSchema,
} from '@/server/api/v1/nhk/articles/schema';
import { NHKArticleInfo } from '@/server/api/v1/nhk/schema';
import { createBrowser } from '@/server/libs/puppeteer';
import { ErrorSchema } from '@/server/schema';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/api/v1/nhk/articles',
  request: {
    query: NHKArticlesQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: NHKArticlesResultSchema,
        },
      },
      description: 'NHK news articles',
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

export const articles = new OpenAPIHono().openapi(route, async (c) => {
  const { category_url: url } = c.req.valid('query');

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

  await page.evaluate(async () => {
    while (true) {
      const moreButton = document.querySelector<HTMLParagraphElement>(
        '#main article.module--list-items footer > p.button',
      );
      if (!moreButton) {
        break;
      }

      moreButton.click();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  });

  const articles = await page.$$eval(
    '#main article.module--list-items > section ul > li',
    (elms: HTMLElement[]) =>
      elms
        .map((elm): NHKArticleInfo | undefined => {
          const thumbnail =
            elm.querySelector<HTMLAnchorElement>('dt > a')?.href;
          if (!thumbnail) {
            return;
          }

          const title = elm.querySelector('dd em')?.textContent?.trim();
          if (!title) {
            return;
          }

          const date = elm.querySelector('dd time')?.getAttribute('datetime');
          if (!date) {
            return;
          }

          const wordAnchor = elm.querySelector<HTMLAnchorElement>('.i-word');
          const wordLabel = wordAnchor?.textContent?.trim() ?? null;
          const wordHref = wordAnchor?.href ?? null;

          const word =
            wordLabel && wordHref
              ? {
                  label: wordLabel,
                  url: wordHref,
                }
              : null;

          const articleUrl =
            elm.querySelector<HTMLAnchorElement>('dd > a')?.href;
          if (!articleUrl) {
            return;
          }

          return {
            title,
            date,
            url: articleUrl,
            word,
            thumbnail,
            source: 'nhk',
            media: 'nhk',
          };
        })
        .filter((article): article is NHKArticleInfo => !!article),
  );

  await browser.close();

  return c.json(
    {
      ok: true,
      value: articles,
    } as const,
    200,
  );
});
