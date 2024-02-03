import {
  YahooArticlesQuerySchema,
  YahooArticlesResultSchema,
} from '@/server/api/v1/yahoo/articles/schema';
import { YahooArticleInfo } from '@/server/api/v1/yahoo/schema';
import { createBrowser } from '@/server/libs/puppeteer';
import { ErrorSchema } from '@/server/schema';
import { convertToISO8601 } from '@/server/util';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/api/v1/yahoo/articles',
  request: {
    query: YahooArticlesQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: YahooArticlesResultSchema,
        },
      },
      description: 'Yahoo news articles',
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
      const moreButton = document.querySelector<HTMLButtonElement>(
        '.newsFeed_more > button',
      );
      if (!moreButton) {
        break;
      }

      moreButton.click();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  });

  const articles = (
    await page.$$eval('li.newsFeed_item', (elms) =>
      elms.map((elm) => {
        const thumbnail =
          elm.querySelector<HTMLImageElement>('.newsFeed_item_thumbnail img')
            ?.src ?? null;

        const title = elm
          .querySelector('.newsFeed_item_title')
          ?.textContent?.trim();
        if (!title) {
          return;
        }

        const media = elm
          .querySelector('.newsFeed_item_media')
          ?.textContent?.trim();
        if (!media) {
          return;
        }

        const date = elm
          .querySelector('.newsFeed_item_date')
          ?.textContent?.trim();
        if (!date) {
          return;
        }

        const url = elm.querySelector<HTMLAnchorElement>(
          '.newsFeed_item_link',
        )?.href;
        if (!url) {
          return;
        }

        return {
          title,
          date,
          url,
          thumbnail,
          source: 'yahoo',
          media,
        } as const;
      }),
    )
  )
    .map((article) => {
      if (!article) {
        return;
      }

      const date = convertToISO8601(article.date);
      if (!date) {
        return;
      }

      return {
        ...article,
        date,
      };
    })
    .filter((article): article is YahooArticleInfo => !!article);

  await browser.close();

  return c.json(
    {
      ok: true,
      value: articles,
    } as const,
    200,
  );
});
