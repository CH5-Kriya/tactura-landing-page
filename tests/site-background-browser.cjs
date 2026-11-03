const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  const url = process.env.SITE_URL || 'http://127.0.0.1:3102';
  try {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(url);
    await page.waitForFunction(() => {
      const v = document.querySelector('.site-background video');
      return v && v.readyState >= 2 && !v.paused;
    });
    assert(await page.locator('.brand-mark').first().getAttribute('src').then(src => src.includes('tactura-icon-lime.png')));
    assert.equal(await page.locator('link[rel=icon]').getAttribute('href'), '/tactura-favicon.png');
    assert.equal(await page.locator('link[rel=apple-touch-icon]').getAttribute('href'), '/tactura-apple-icon.png');
    assert(await page.locator('.site-background video').evaluate(v => v.muted && v.loop && v.playsInline));
    await page.getByRole('button', {name: 'Pause background'}).click();
    await page.waitForFunction(() => document.querySelector('.site-background video').paused);
    await page.getByRole('button', {name: 'Play background'}).click();
    await page.waitForFunction(() => !document.querySelector('.site-background video').paused);
    await page.getByRole('button', {name: 'Pause background'}).blur();
    await page.screenshot({path: '/tmp/tactura-background-desktop.png'});
    for (const path of ['/demo', '/privacy']) {
      await page.goto(url + path);
      await page.locator('.site-background video').waitFor();
      assert(await page.locator('.brand-mark').first().getAttribute('src').then(src => src.includes('tactura-icon-lime.png')));
    }
    await page.goto(url);
    await page.setViewportSize({width: 390, height: 844});
    await page.waitForFunction(() => {
      const last = [...document.querySelectorAll('.blur-text span')].at(-1);
      return last && getComputedStyle(last).opacity === '1';
    });
    await page.screenshot({path: '/tmp/tactura-background-mobile.png'});
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const reduced = await browser.newPage({reducedMotion: 'reduce'});
    const mediaRequests = [];
    reduced.on('request', request => { if (/tactura-background\.(webm|mp4)/.test(request.url())) mediaRequests.push(request.url()); });
    await reduced.goto(url);
    await reduced.waitForTimeout(300);
    assert.equal(await reduced.locator('.site-background video').count(), 0);
    assert.equal(await reduced.locator('.background-toggle').count(), 0);
    assert((await reduced.locator('.site-background').evaluate(el => getComputedStyle(el).backgroundImage)).includes('tactura-background.webp'));
    assert.deepEqual(mediaRequests, []);
    assert.deepEqual(errors, []);
    console.log('PASS icons, video playback, pause/resume, shared pages, mobile layout and reduced-motion static fallback without video requests');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
