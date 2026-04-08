import { exit } from 'process';
import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'http://127.0.0.1:4173';
const executablePath = process.env.CHROME_BIN || '/usr/bin/google-chrome';

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu']
});

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'load' });
  
  // Wait for React to finish loader
  await page.waitForSelector('button', { timeout: 10000 });
  
  // Click Load sample
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const loadSample = buttons.find(b => b.textContent && b.textContent.includes('Load sample'));
    if (loadSample) loadSample.click();
  });
  
  // Wait for video to appear and start playing
  await page.waitForSelector('video', { timeout: 10000 });
  
  const jitterCount = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const video = document.querySelector('video');
      let externalSeeks = 0;
      
      const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
      Object.defineProperty(video, 'currentTime', {
        get: function() {
          return originalDescriptor.get.call(this);
        },
        set: function(val) {
          externalSeeks++;
          originalDescriptor.set.call(this, val);
        }
      });
      
      video.play();
      
      setTimeout(() => {
        resolve(externalSeeks);
      }, 3000);
    });
  });
  
  console.log(`External seeks counted during playback: ${jitterCount}`);
  if (jitterCount > 2) {
    console.error(`Jitter detected! Expected <= 2 seeks, but caught ${jitterCount}.`);
    process.exit(1);
  } else {
    console.log('Playback is smooth.');
  }

} finally {
  await browser.close();
}
