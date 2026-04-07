import { writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const pageUrl = process.argv[2];
const domPath = process.argv[3];
const jsonPath = process.argv[4];
const executablePath = process.env.CHROME_BIN || '/usr/bin/google-chrome';

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

try {
  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 120000 });
  await page.waitForFunction(
    () => document.body.dataset.status === 'pass' || document.body.dataset.status === 'fail',
    { timeout: 300000 },
  );

  const html = await page.content();
  const resultText = await page.$eval('#results', (node) => node.textContent ?? '');

  writeFileSync(domPath, html);
  writeFileSync(jsonPath, resultText.trim());
} finally {
  await browser.close();
}
