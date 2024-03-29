import {
  NHKArticleQuerySchema,
  NHKArticleResultSchema,
} from '@/server/api/v1/nhk/article/schema';
import { NHKArticleInfo } from '@/server/api/v1/nhk/schema';
import { createBrowser } from '@/server/libs/puppeteer';
import { ErrorSchema } from '@/server/schema';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/api/v1/nhk/article',
  request: {
    query: NHKArticleQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: NHKArticleResultSchema,
        },
      },
      description: 'NHK news article',
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

  const contents = await page.$('section.module--detail-content');
  if (!contents) {
    return c.json(
      {
        ok: false,
        error: 'contents is null',
      } as const,
      500,
    );
  }

  const header = await contents.$('header');
  if (!header) {
    return c.json(
      {
        ok: false,
        error: 'header is null',
      } as const,
      500,
    );
  }

  const thumbnail = await header.$eval(
    'figure img',
    (elm: HTMLImageElement) => elm.src,
  );

  const title = await header.$eval('h1', (elm: HTMLElement) =>
    elm.textContent?.trim(),
  );
  const date = await header.$eval('time', (elm: HTMLElement) =>
    elm.getAttribute('datetime'),
  );

  if (!title || !date) {
    return c.json(
      {
        ok: false,
        error: 'title or date is null',
      } as const,
      500,
    );
  }

  const word = await header.$eval('a.i-word', (elm: HTMLAnchorElement) => {
    const label = elm.textContent?.trim();
    const href = elm.href;

    return label && href
      ? {
          label,
          url: href,
        }
      : null;
  });

  const info = {
    title,
    date,
    url,
    word,
    thumbnail,
    source: 'nhk',
    media: 'nhk',
  } as const satisfies NHKArticleInfo;

  const main = await contents.$('.content--detail-main');
  if (!main) {
    return c.json(
      {
        ok: false,
        error: 'main is null',
      } as const,
      500,
    );
  }

  const elements = await main.$$eval('p,img', (elms) =>
    elms
      .map((elm) => {
        if (elm instanceof HTMLParagraphElement) {
          return {
            type: 'paragraph',
            text: elm.textContent?.trim() ?? '',
          } as const;
        }

        if (elm instanceof HTMLImageElement) {
          return {
            type: 'image',
            src: elm.src,
          } as const;
        }

        return;
      })
      .flatMap((elm) => (elm ? [elm] : [])),
  );

  const raw = await main.evaluate(() => {
    const detail = document.querySelector('.module.module--detail--v3');
    if (!detail) {
      return;
    }

    const moreNews = document.querySelector('.module.module--detail-morenews');
    if (!moreNews) {
      return;
    }

    const main = document.createElement('main');
    main.appendChild(detail);
    main.appendChild(moreNews);

    return main.outerHTML;
  });

  if (!raw) {
    return c.json(
      {
        ok: false,
        error: 'raw is null',
      } as const,
      500,
    );
  }

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
