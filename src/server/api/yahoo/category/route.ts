import { createBrowser } from '@/server/libs/puppeteer';
import { YahooCategory } from '@/server/types/yahoo';
import { Result } from '@/type';
import { Hono } from 'hono';

export const category = new Hono()
  .basePath('/category')
  .get(
    '/',
    async (c): Promise<ReturnType<typeof c.json<Result<YahooCategory[]>>>> => {
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
        },
        200,
      );
    },
  );
