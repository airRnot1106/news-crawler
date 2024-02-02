import { createBrowser } from '@/server/libs/puppeteer';
import {
  YahooArticle,
  YahooArticleElement,
  YahooArticleInfo,
} from '@/server/types/yahoo';
import { convertToISO8601 } from '@/server/util';
import { Result } from '@/type';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

export const article = new Hono().basePath('/article').get(
  '/',
  zValidator(
    'query',
    z.object({
      article_url: z.string().url(),
    }),
  ),
  async (c): Promise<ReturnType<typeof c.json<Result<YahooArticle>>>> => {
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
          },
          500,
        );
      }

      return c.json(
        {
          ok: false,
          error: 'unknown error',
        },
        500,
      );
    }

    const contentsWrapper = await page.$('#contentsWrap');
    if (!contentsWrapper) {
      return c.json(
        {
          ok: false,
          error: 'contentsWrapper is null',
        },
        500,
      );
    }

    const header = await contentsWrapper.$('header');
    if (!header) {
      return c.json(
        {
          ok: false,
          error: 'header is null',
        },
        500,
      );
    }

    const title = await header.$eval('h1', (h1) => h1.textContent?.trim());
    if (!title) {
      return c.json(
        {
          ok: false,
          error: 'title is null',
        },
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
        },
        500,
      );
    }

    const footer = await contentsWrapper.$('footer');
    if (!footer) {
      return c.json(
        {
          ok: false,
          error: 'footer is null',
        },
        500,
      );
    }

    const media = await footer.$eval('a', (a) => a.textContent?.trim());
    if (!media) {
      return c.json(
        {
          ok: false,
          error: 'media is null',
        },
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

    const elements: YahooArticleElement[] = [];
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
          elms.flatMap((elm): YahooArticleElement[] => {
            const images = Array.from(elm.querySelectorAll('img')).map(
              (img) =>
                ({
                  type: 'image',
                  src: img.src,
                }) as const,
            );
            const text = elm.textContent?.trim();
            const paragraph = text
              ? [{ type: 'paragraph', text } as const]
              : [];

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
      },
      200,
    );
  },
);
