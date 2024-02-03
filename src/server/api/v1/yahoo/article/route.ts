import {
  YahooArticleQuerySchema,
  YahooArticleResultSchema,
} from '@/server/api/v1/yahoo/article/schema';
import { YahooArticleInfo } from '@/server/api/v1/yahoo/schema';
import { createBrowser } from '@/server/libs/puppeteer';
import { ArticleElement, ErrorSchema } from '@/server/schema';
import { convertToISO8601 } from '@/server/util';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/api/v1/yahoo/article',
  request: {
    query: YahooArticleQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: YahooArticleResultSchema,
        },
      },
      description: 'Yahoo news article',
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

export const article = new OpenAPIHono().openapi(route, async (c) => {
  const { article_url: url } = c.req.valid('query');
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

  const contentsWrapper = await page.$('#contentsWrap');
  if (!contentsWrapper) {
    return c.json(
      {
        ok: false,
        error: 'contentsWrapper is null',
      } as const,
      500,
    );
  }

  const header = await contentsWrapper.$('header');
  if (!header) {
    return c.json(
      {
        ok: false,
        error: 'header is null',
      } as const,
      500,
    );
  }

  const title = await header.$eval('h1', (h1) => h1.textContent?.trim());
  if (!title) {
    return c.json(
      {
        ok: false,
        error: 'title is null',
      } as const,
      500,
    );
  }

  const maybeDate = await header.$eval('time', (time) =>
    time.textContent?.trim(),
  );
  const date = maybeDate ? convertToISO8601(maybeDate) : null;
  if (!date) {
    return c.json(
      {
        ok: false,
        error: 'date is null',
      } as const,
      500,
    );
  }

  const footer = await contentsWrapper.$('footer');
  if (!footer) {
    return c.json(
      {
        ok: false,
        error: 'footer is null',
      } as const,
      500,
    );
  }

  const media = await footer.$eval('a', (a) => a.textContent?.trim());
  if (!media) {
    return c.json(
      {
        ok: false,
        error: 'media is null',
      } as const,
      500,
    );
  }

  const info = {
    title,
    date,
    url,
    thumbnail: null,
    source: 'yahoo',
    media,
  } as const satisfies YahooArticleInfo;

  const elements: ArticleElement[] = [];
  const raws: string[] = [];
  let currentPage = 1;
  while (true) {
    const res = await page.goto(`${url}?page=${currentPage}`);
    if (!res || !res.ok()) {
      break;
    }

    const elementsEachPage = await page.$$eval(
      'div.article_body > div',
      (elms) =>
        elms.flatMap((elm): ArticleElement[] => {
          const images = Array.from(elm.querySelectorAll('img')).map(
            (img) =>
              ({
                type: 'image',
                src: img.src,
              }) as const,
          );
          const text = elm.textContent?.trim();
          const paragraph = text ? [{ type: 'paragraph', text } as const] : [];

          return [...images, ...paragraph];
        }),
    );

    elements.push(...elementsEachPage);

    const rawEachPage = await page.$eval(
      'div.article_body',
      (elm) => elm.outerHTML,
    );
    raws.push(rawEachPage);

    currentPage++;
  }

  const raw = `<main>${raws.join('')}</main>`;

  await browser.close();

  return c.json(
    {
      ok: true,
      value: {
        info,
        elements,
        raw,
      },
    } as const,
    200,
  );
});
