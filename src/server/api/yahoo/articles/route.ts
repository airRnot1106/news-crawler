import { createBrowser } from '@/server/libs/puppeteer';
import { YahooArticleInfo } from '@/server/types/yahoo';
import { convertToISO8601 } from '@/server/util';
import { Result } from '@/type';
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
  async (c): Promise<ReturnType<typeof c.json<Result<YahooArticleInfo[]>>>> => {
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
          const thumbnail = elm.querySelector<HTMLImageElement>(
            '.newsFeed_item_thumbnail img',
          )?.src;
          if (!thumbnail) {
            return;
          }

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
      },
      200,
    );
  },
);
