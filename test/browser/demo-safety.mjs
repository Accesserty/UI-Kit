// node test/browser/demo-safety.mjs — Chrome, local demo files, no screen reader.
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';

const root = new URL('../../', import.meta.url);
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.route(/^https?:/, route => route.abort());
  await page.goto(new URL('demo/index.html', root).href);
  for (const href of await page.locator('a[href]').evaluateAll(links => links.map(a => a.href))) {
    if (href.startsWith('file:')) await access(new URL(href));
  }
  assert.equal(await page.locator('a[href="carousel.html"]').count(), 1);

  await page.goto(new URL('demo/select.html', root).href);
  for (const id of ['city-basic','city-custom']) {
    assert.ok(await page.locator('#' + id).evaluate(el => el.labels.length && el.labels[0].textContent.trim()));
    await page.locator('#' + id).selectOption('new-york');
    assert.equal(await page.locator('#' + id).inputValue(), 'new-york');
  }
  const session = await page.context().newCDPSession(page);
  const selectAX = await session.send('Accessibility.getFullAXTree');
  for (const name of ['Destination city','Destination city (custom theme)']) {
    assert.ok(selectAX.nodes.some(node => !node.ignored && node.role?.value === 'combobox' && node.name?.value === name));
  }
  await session.detach();

  await page.goto(new URL('demo/dialog.html', root).href);
  assert.equal(await page.locator('dialog').evaluateAll(dialogs => dialogs.every(el => {
    const title = document.getElementById(el.getAttribute('aria-labelledby'));
    return title && el.contains(title) && title.textContent.trim();
  })), true);
  const opener = page.locator('button[onclick*="dialog-basic"]').first();
  await opener.click();
  const dialogAXSession = await page.context().newCDPSession(page);
  const dialogAX = await dialogAXSession.send('Accessibility.getFullAXTree');
  assert.ok(dialogAX.nodes.some(node => !node.ignored && node.role?.value === 'dialog' && node.name?.value === 'Dialog Title'));
  await dialogAXSession.detach();
  await page.keyboard.press('Escape');
  assert.equal(await opener.evaluate(el => el === document.activeElement), true);
  await page.locator('button[onclick*="dialog-backdrop"]').click();
  await page.locator('#dialog-backdrop').click({position:{x:2,y:2}});
  assert.equal(await page.locator('#dialog-backdrop').evaluate(el => el.open), true, 'dialog padding is not the backdrop');
  await page.keyboard.press('Escape');

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async () => { throw new Error('Denied by test'); }}});
  });
  await page.setViewportSize({width:320,height:900});
  await page.goto(new URL('demo/playground.html', root).href);
  await page.waitForFunction(() => document.querySelector('#controls-container').children.length > 0);
  const tabs = page.locator('au-tabs button[role=tab]');
  for (let i = 0; i < await tabs.count(); i++) {
    await tabs.nth(i).click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, '320px playground: ' + await tabs.nth(i).textContent());
  }
  await page.locator('#copy-btn').click();
  await page.waitForFunction(() => document.getElementById('copy-status').textContent.includes('Could not copy'));
  assert.equal(await page.locator('#copy-btn').evaluate(el => el === document.activeElement), true);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {configurable:true, value:undefined}));
  await page.locator('#copy-btn').click();
  assert.match(await page.locator('#copy-status').textContent(), /manually/);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async () => {}}}));
  await page.locator('#copy-btn').click();
  await page.waitForFunction(() => document.getElementById('copy-status').textContent.includes('copied to clipboard'));
  assert.deepEqual(errors, []);
  console.log('PASS Chrome: local demo links, select names/values, dialog name/Escape/focus/padding, all playground tabs at 320px, clipboard denied/missing/success');
} finally { await browser.close(); }
