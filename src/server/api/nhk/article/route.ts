import { createBrowser } from '@/server/libs/puppeteer';
import { NHKArticle } from '@/server/types/nhk';
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
  async (c): Promise<ReturnType<typeof c.json<Result<NHKArticle>>>> => {
    const { article_url: url } = c.req.valid('query');

    const browser = await createBrowser();
    const page = await browser.newPage();
    await page.goto(url);

    const contents = await page.$('section.module--detail-content');
    if (!contents) {
      return c.json(
        {
          ok: false,
          error: 'contents is null',
        },
        500,
      );
    }

    const header = await contents.$('header');
    if (!header) {
      return c.json(
        {
          ok: false,
          error: 'header is null',
        },
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
        },
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
    };

    const main = await contents.$('.content--detail-main');
    if (!main) {
      return c.json(
        {
          ok: false,
          error: 'main is null',
        },
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

      const moreNews = document.querySelector(
        '.module.module--detail-morenews',
      );
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
        },
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
      },
      200,
    );
  },
);
