// Chrome local-file demo flow. Requires test/ssr dependencies and Google Chrome.
import assert from 'node:assert/strict';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
  const page = await browser.newPage({reducedMotion:'reduce',timezoneId:'Asia/Taipei'});
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route(/^https?:/, route => route.abort());
  await page.goto(new URL('../../demo/form.html', import.meta.url).href);
  await page.waitForFunction(() => !!document.querySelector('au-input').shadowRoot?.querySelector('input'));
  await page.locator('button[type=submit]').click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'error-summary');
  await page.evaluate(() => {
    const upload = document.createElement('au-file-upload');
    upload.id = 'default-upload-description-probe';
    upload.setAttribute('label', 'Default upload test');
    upload.setAttribute('aria-describedby', 'err-resume');
    document.body.append(upload);
  });
  const axSession = await page.context().newCDPSession(page);
  const ax = await axSession.send('Accessibility.getFullAXTree');
  const rating = ax.nodes.find(node => !node.ignored && node.role?.value === 'radiogroup' && node.name?.value === 'Self-Rated Skill Level');
  assert.match(rating?.description?.value || '', /Please select a skill level/);
  const upload = ax.nodes.find(node => !node.ignored && node.role?.value === 'button' && node.name?.value === 'Choose resume file…');
  assert.match(upload?.description?.value || '', /Please upload your resume/);
  const defaultUpload = ax.nodes.find(node => !node.ignored && node.role?.value === 'button' && node.name?.value === 'Default upload test');
  assert.match(defaultUpload?.description?.value || '', /Please upload your resume/);
  await axSession.detach();
  await page.locator('au-file-upload#default-upload-description-probe').evaluate(el => el.remove());
  const targets = await page.locator('#error-summary-list a').evaluateAll(links => links.map(a => a.hash.slice(1)));
  assert.ok(targets.length > 5);
  for (const id of targets) {
    const link = page.locator(`#error-summary-list a[href="#${id}"]`);
    await link.focus(); await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(id => {
      const host = document.getElementById(id);
      let focused = document.activeElement;
      while (focused?.shadowRoot?.activeElement) focused = focused.shadowRoot.activeElement;
      return !!focused && (focused === host || host.contains(focused) || host.shadowRoot?.contains(focused));
    }, id), true, 'summary target ' + id);
    assert.equal(await page.evaluate(() => ['INPUT','TEXTAREA','BUTTON'].includes((function active(el){return el?.shadowRoot?.activeElement ? active(el.shadowRoot.activeElement) : el;})(document.activeElement)?.tagName)), true, 'actual control focus ' + id);
  }
  await page.locator('#field-first-name input').fill('Jane');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('au-input#field-first-name').getAttribute('aria-invalid'), null);
  assert.equal(await page.locator('#err-first-name').getAttribute('aria-hidden'), 'true');
  await page.locator('button[type=reset]').click();
  assert.equal(await page.locator('#error-summary').getAttribute('aria-hidden'), 'true');
  assert.equal(await page.locator('#error-summary-list a').count(), 0);
  assert.equal(await page.locator('[data-invalid]').count(), 0);
  await page.evaluate(() => {
    const values = {'field-first-name':'Jane','field-last-name':'Doe','field-email':'jane@example.com',
      'field-birthdate':'2000-01-01','field-position':'Engineer','field-experience':'1_to_3',
      'field-skill-level':3,'field-cover-letter':'A sufficiently long demonstration cover letter describing relevant experience and skills.',
      'field-start-date':document.getElementById('field-start-date').getAttribute('min')};
    for (const [id,value] of Object.entries(values)) document.getElementById(id).value = value;
    const work = document.getElementById('field-worktype'); work.value = work.querySelector('au-radio').getAttribute('value');
    document.getElementById('skill-js').checked = true;
  });
  await page.locator('#field-resume input[type=file]').setInputFiles({name:'resume.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 demo')});
  await page.locator('button[type=submit]').click();
  assert.equal(await page.locator('#error-summary').getAttribute('aria-hidden'), 'true');
  assert.match(await page.locator('#success-banner').textContent(), /nothing was sent/);
  const result = JSON.parse(await page.locator('#form-output').textContent());
  assert.equal(result.skill_level, '3', 'rating comes from native FormData, not a numeric workaround');
  assert.equal(result.resume, 'resume.pdf');
  assert.deepEqual(errors, []);
  console.log('PASS Chrome: invalid submit focus, every summary link keyboard-activates a real control, correction, reset, valid local FormData including rating/files');
} finally { await browser.close(); }
