import { createBrowser } from '@/server/libs/puppeteer';
import { NHKCategory } from '@/server/types/nhk';
import { Result } from '@/type';
import { Hono } from 'hono';

export const category = new Hono()
  .basePath('/category')
  .get(
    '/',
    async (c): Promise<ReturnType<typeof c.json<Result<NHKCategory[]>>>> => {
      const url = 'https://www3.nhk.or.jp/news/';

      const browser = await createBrowser();
      const page = await browser.newPage();
      await page.goto(url);

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
        },
        200,
      );
    },
  );
