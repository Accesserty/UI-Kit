// Nuxt fixture using the Vue integration: `<au-* v-model>` in server rendering,
// hydration, both binding directions for the seven form components, v-model
// modifiers, template-ref forwarding, attribute pass-through and FormData.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const url=`http://127.0.0.1:${process.argv[2]||41793}`;
const html=await (await fetch(url)).text();
// Server output carries the initial model values as attributes.
assert.match(html,/<au-input[^>]*id="vm-input"[^>]*value="Neil"/);
assert.match(html,/<au-textarea[^>]*id="vm-textarea"[^>]*value="Hello"/);
assert.match(html,/<au-checkbox[^>]*id="vm-checkbox"[^>]*checked/);
assert.doesNotMatch(html,/<au-switch[^>]*id="vm-switch"[^>]*checked/);
assert.match(html,/<au-radio-group[^>]*id="vm-radio"[^>]*value="m"/);
assert.match(html,/<au-rating[^>]*id="vm-rating"[^>]*value="3"/);
// Native-style bindings render the same initial state on the server.
assert.match(html,/<au-checkbox[^>]*id="vm-src-b"[^>]*checked/);
assert.doesNotMatch(html,/<au-checkbox[^>]*id="vm-src-a"[^>]*checked/);
assert.match(html,/<au-checkbox[^>]*id="vm-consent"[^>]*checked/);
assert.doesNotMatch(html,/<au-checkbox[^>]*true-value/,'true-value stays with the wrapper');
assert.match(html,/<au-radio-group[^>]*id="vm-level"[^>]*value="2"/);
assert.match(html,/<au-checkbox[^>]*class="consumer-class"[^>]*data-test="kept"|<au-checkbox[^>]*data-test="kept"[^>]*class="consumer-class"/);

const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage(),errors=[];
  page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(url);await page.waitForFunction(()=>document.getElementById('ready')?.textContent==='true'&&document.querySelector('au-rating')?.shadowRoot);
  const model=async()=>JSON.parse(await page.locator('#model').textContent());
  const el=(id,prop)=>page.evaluate(([id,prop])=>{const v=document.getElementById(id)[prop];return Array.isArray(v)?v.map(f=>f.name):v;},[id,prop]);
  const settle=()=>page.waitForTimeout(50);

  // Hydrated elements reflect the model.
  assert.equal(await el('vm-input','value'),'Neil');
  assert.equal(await el('vm-checkbox','checked'),true);
  assert.equal(await el('vm-switch','checked'),false);
  assert.equal(await el('vm-radio','value'),'m');
  assert.equal(await el('vm-rating','value'),3);
  assert.equal(await page.evaluate(()=>document.getElementById('vm-card').shadowRoot!==null),true,'unwrapped au-* stays a custom element');

  // Element → model, with typed values.
  await page.locator('#vm-input input').fill('Typed');
  await page.locator('#vm-trim input').fill('  spaced  ');
  await page.locator('#vm-number input').fill('42');
  await page.locator('#vm-textarea textarea').fill('Line one\nLine two');
  await page.locator('#vm-checkbox').click();
  await page.locator('#vm-switch').click();
  await page.getByRole('radio',{name:'Small'}).click();
  await page.locator('#vm-rating input[value="3"]').focus();await page.keyboard.press('ArrowRight');
  await page.locator('#vm-files input[type=file]').setInputFiles([{name:'a.txt',mimeType:'text/plain',buffer:Buffer.from('a')}]);
  await settle();
  let m=await model();
  assert.deepEqual({name:m.name,trimmed:m.trimmed,age:m.age,notes:m.notes,agree:m.agree,alerts:m.alerts,size:m.size,score:m.score,files:m.files},
    {name:'Typed',trimmed:'spaced',age:42,notes:'Line one\nLine two',agree:false,alerts:true,size:'s',score:4,files:['a.txt']});
  assert.equal(m.changes,1,'consumer @change still fires alongside v-model');
  assert.equal(await el('vm-rating','value'),4,'rating keeps the user choice');
  assert.deepEqual(await el('vm-files','value'),['a.txt'],'file selection survives the model update');

  // Bindings shaped like native controls give the same values a native control would.
  assert.deepEqual([await el('vm-src-a','checked'),await el('vm-src-b','checked'),await el('vm-consent','checked')],[false,true,true]);
  await page.locator('#vm-src-a').click();await page.locator('#vm-src-b').click();
  await page.locator('#vm-consent').click();
  await page.locator('#vm-qty input').fill('7');
  await page.getByRole('radio',{name:'Level 1'}).click();
  await settle();
  m=await model();
  assert.deepEqual({sources:m.sources,consent:m.consent,qty:m.qty,level:m.level},{sources:['a'],consent:'no',qty:7,level:1});
  await page.evaluate(()=>{document.getElementById('vm-src-b').click();});await settle();
  assert.deepEqual((await model()).sources,['a','b'],'checked boxes collect their values in order of checking');

  // .lazy updates on change, not on each keystroke.
  await page.locator('#vm-lazy input').fill('later');
  assert.equal((await model()).lazy,'');
  await page.locator('#vm-lazy input').press('Tab');await settle();
  assert.equal((await model()).lazy,'later');

  // A rejected file keeps its error message after the model round trip.
  await page.locator('#vm-files input[type=file]').setInputFiles([{name:'b.png',mimeType:'image/png',buffer:Buffer.from('b')}]);await settle();
  const errorText=await page.evaluate(()=>document.getElementById('vm-files').shadowRoot.querySelector('.error-area')?.textContent.trim());
  assert.ok(errorText,'file type error is shown');
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>document.getElementById('vm-files').shadowRoot.querySelector('.error-area')?.textContent.trim()),errorText,'error message is not cleared by v-model');

  // FormData matches the model.
  const form=await page.evaluate(()=>[...new FormData(document.getElementById('vm-form'))].map(([k,v])=>k+'='+(v instanceof File?v.name:v)));
  for(const pair of ['name=Typed','notes=Line one\nLine two','alerts=on','size=s','score=4','files=a.txt'])assert.ok(form.includes(pair),`FormData has ${pair}: ${form.join(' & ')}`);
  assert.ok(!form.some(p=>p.startsWith('agree=')),'unchecked checkbox is not submitted');

  // Model → element.
  await page.click('#set-model');await settle();
  assert.equal(await el('vm-input','value'),'Set by Vue');
  assert.equal(await el('vm-textarea','value'),'Line');
  assert.equal(await el('vm-checkbox','checked'),false);
  assert.equal(await el('vm-switch','checked'),true);
  assert.equal(await el('vm-radio','value'),'s');
  assert.equal(await el('vm-rating','value'),5);
  assert.deepEqual(await el('vm-files','value'),[],'setting the model to [] clears the files');

  // Template refs forward to the element.
  assert.equal(await page.evaluate(()=>{window.nameRef.value.focus();let a=document.activeElement;while(a?.shadowRoot?.activeElement)a=a.shadowRoot.activeElement;return a.localName;}),'input');
  assert.equal(await page.evaluate(()=>window.nameRef.value.value),'Set by Vue');
  assert.equal(await page.evaluate(()=>window.nameRef.value.$el?.id),'vm-input');

  assert.deepEqual(errors,[],'no hydration warnings or errors');
  console.log('nuxt v-model PASS: SSR values, hydration, 7 components both directions, .trim/.number/.lazy, native-style checkbox arrays/true-value/number input/typed radio values, consumer listeners, file errors kept, FormData, template refs');
}finally{await browser.close();}
