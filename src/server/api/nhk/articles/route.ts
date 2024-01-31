import { createBrowser } from '@/server/libs/puppeteer';
import { NHKArticle } from '@/server/types/nhk';
import { Ok } from '@/type';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

export const articles = new Hono().basePath('/articles').get(
  '/',
  zValidator(
    'query',
    z.object({
      category_url: z.string().url(),
    }),
  ),
  async (c) => {
    const { category_url: url } = c.req.valid('query');

    const browser = await createBrowser();
    const page = await browser.newPage();
    await page.goto(url);

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
          .map((elm) => {
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

            return {
              title,
              date,
              url: articleUrl,
              word,
              thumbnail,
            };
          })
          .filter((article): article is NHKArticle => !!article),
    );

    await browser.close();

    return c.json({
      ok: true,
      value: articles,
    } satisfies Ok<NHKArticle[]>);
  },
);
