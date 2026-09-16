// Chrome regression: node test/browser/visibility.mjs
// Requires test/ssr dependencies and installed Google Chrome. Not a VoiceOver test.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve, extname} from 'node:path';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!path.startsWith(root)) { res.writeHead(403).end(); return; }
    res.setHeader('Content-Type', extname(path) === '.js' ? 'text/javascript' : extname(path) === '.css' ? 'text/css' : 'text/html');
    res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({channel: 'chrome', headless: true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  const fixture = 'test/browser/fixtures/visibility.html';
  const bases = [pathToFileURL(resolve(root, fixture)).href, `http://127.0.0.1:${server.address().port}/${fixture}`];
  for (const base of bases) for (const mode of ['source','bundle','min']) {
    await page.goto(`${base}?mode=${mode}`);
    await page.evaluate(() => window.ready);
    assert.equal(await page.evaluate(() => [...document.querySelector('#components').children].every(el => getComputedStyle(el).display === 'none' && el.getClientRects().length === 0)), true);
    await page.locator('#before').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'after');
    const cdp = await page.context().newCDPSession(page);
    const {nodes} = await cdp.send('Accessibility.getFullAXTree');
    assert.equal(nodes.some(node => !node.ignored && node.name?.value?.startsWith('Hidden sample ')), false);
    await cdp.detach();
    assert.equal(await page.evaluate(() => [...document.querySelector('#components').children].every(el => {
      const shadow = el.shadowRoot;
      el.hidden = false;
      const visible = getComputedStyle(el).display !== 'none';
      el.setAttribute('hidden', 'UNTIL-FOUND');
      const preserved = getComputedStyle(el).display !== 'none';
      el.hidden = true;
      return visible && preserved && el.shadowRoot === shadow;
    })), true);
    for (const forcedColors of ['none','active']) {
      await page.emulateMedia({forcedColors});
      await page.locator('#before').focus();
      for (const id of ['after','select','summary']) {
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement.id), id);
        assert.equal(await page.locator('#' + id).evaluate(el => {
          const css = getComputedStyle(el);
          return el.matches(':focus-visible') && css.outlineStyle !== 'none' && parseFloat(css.outlineWidth) >= 2;
        }), true, `${mode} ${id} focus (${forcedColors})`);
      }
    }
    await page.emulateMedia({forcedColors:'none'});
    await page.emulateMedia({forcedColors:'none', reducedMotion:'reduce'});
    assert.equal(await page.evaluate(() => ['after', 'select', 'summary'].every(id => {
      const css = getComputedStyle(document.getElementById(id));
      return css.transitionDuration === '0s' && css.animationDuration === '0s';
    })), true, `${mode} reduced-motion native controls`);
    await page.emulateMedia({forcedColors:'none', reducedMotion:'no-preference'});
    console.log(`PASS ${new URL(base).protocol} ${mode}: 18 hidden hosts, restoration, Tab, AX exclusion, native focus/forced-colors`);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
