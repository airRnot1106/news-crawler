import puppeteer from 'puppeteer';

export const createBrowser = async () => {
  return await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: null,
  });
};
