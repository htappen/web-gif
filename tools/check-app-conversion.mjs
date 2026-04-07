import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const pageUrl = process.argv[2];
const outputDir = process.argv[3];
const executablePath = process.env.CHROME_BIN || '/usr/bin/google-chrome';

if (!pageUrl || !outputDir) {
  throw new Error('Usage: node tools/check-app-conversion.mjs <page-url> <output-dir>');
}

mkdirSync(outputDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
  await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 120000 });
  await page.waitForSelector('[data-testid="conversion-result"] video', { timeout: 300000 });
  await page.waitForFunction(() => {
    const video = document.querySelector('[data-testid="conversion-result"] video');
    return video instanceof HTMLVideoElement && video.readyState >= 2 && video.duration > 0;
  }, { timeout: 300000 });

  const result = await page.evaluate(async () => {
    const anchor = document.querySelector('[data-testid="conversion-result"] a');
    const video = document.querySelector('[data-testid="conversion-result"] video');
    if (!(anchor instanceof HTMLAnchorElement) || !(video instanceof HTMLVideoElement)) {
      throw new Error('Expected conversion result video and download link.');
    }

    const response = await fetch(anchor.href);
    const blob = await response.blob();

    return {
      downloadName: anchor.download,
      href: anchor.href,
      size: blob.size,
      duration: video.duration,
      currentSrc: video.currentSrc,
    };
  });

  writeFileSync(join(outputDir, 'app-conversion.json'), JSON.stringify(result, null, 2));
  writeFileSync(join(outputDir, 'app-conversion.dom.html'), await page.content());
  await page.screenshot({ path: join(outputDir, 'app-conversion.png') });

  if (!result.currentSrc.startsWith('blob:')) {
    throw new Error(`Expected blob-backed video output, received ${result.currentSrc}`);
  }

  if (result.size <= 1024) {
    throw new Error(`Expected output larger than 1024 bytes, received ${result.size}`);
  }
} finally {
  await browser.close();
}
