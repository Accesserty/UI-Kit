// Next.js App Router fixture using the React integration: server-rendered
// values, hydration, controlled and uncontrolled use, controlled rejection,
// refs to the element, attribute pass-through and FormData.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const url=`http://127.0.0.1:${process.argv[2]||41794}`;
const html=await (await fetch(url)).text();
assert.match(html,/<au-input[^>]*id="rf-name"[^>]*value="Neil"/);
assert.match(html,/<au-input[^>]*id="rf-free"[^>]*value="Initial"/);
assert.match(html,/<au-checkbox[^>]*id="rf-agree"[^>]*checked=""/);
assert.match(html,/<au-radio-group[^>]*id="rf-size"[^>]*value="m"/);
assert.match(html,/<au-rating[^>]*id="rf-score"[^>]*value="3"/);
assert.match(html,/<au-checkbox[^>]*class="consumer-class"/);

const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage(),errors=[];
  page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(url);await page.waitForFunction(()=>document.getElementById('ready')?.textContent==='true'&&document.getElementById('rf-score')?.shadowRoot);
  const model=async()=>JSON.parse(await page.locator('#model').textContent());
  const el=(id,prop)=>page.evaluate(([id,prop])=>{const v=document.getElementById(id)[prop];return Array.isArray(v)?v.map(f=>f.name):v;},[id,prop]);
  const settle=()=>page.waitForTimeout(80);

  assert.equal(await el('rf-name','value'),'Neil');
  assert.equal(await el('rf-agree','checked'),true);
  assert.equal(await el('rf-alerts','checked'),false);
  assert.equal(await el('rf-size','value'),'m');
  assert.equal(await el('rf-score','value'),3);

  await page.locator('#rf-name input').fill('Typed');
  await page.locator('#rf-notes textarea').fill('Line one\nLine two');
  await page.locator('#rf-agree').click();
  await page.locator('#rf-alerts').click();
  await page.getByRole('radio',{name:'Small'}).click();
  await page.locator('#rf-score input[value="3"]').focus();await page.keyboard.press('ArrowRight');
  await page.locator('#rf-files input[type=file]').setInputFiles([{name:'a.txt',mimeType:'text/plain',buffer:Buffer.from('a')}]);
  await page.locator('#rf-free input').fill('Free text');
  await settle();
  const m=await model();
  assert.deepEqual({name:m.name,notes:m.notes,agree:m.agree,size:m.size,score:m.score,files:m.files,alertsChanges:m.alertsChanges},
    {name:'Typed',notes:'Line one\nLine two',agree:false,size:'s',score:4,files:['a.txt'],alertsChanges:1});
  assert.equal(await el('rf-alerts','checked'),true,'uncontrolled switch keeps the user choice');
  assert.equal(await el('rf-free','value'),'Free text','uncontrolled input keeps the user value');
  assert.equal(await el('rf-score','value'),4);

  // Native-style patterns: e.target.value collects checked boxes; valueAsNumber reads a number field.
  assert.deepEqual([await el('rf-src-a','checked'),await el('rf-src-b','checked')],[false,true]);
  await page.locator('#rf-src-a').click();await page.locator('#rf-src-b').click();
  await page.locator('#rf-qty input').fill('7');await settle();
  assert.deepEqual({sources:(await model()).sources,qty:(await model()).qty},{sources:['a'],qty:7});

  // Controlled rejection: the parent refuses letters, so the field reverts.
  await page.locator('#rf-digits input').focus();await page.evaluate(()=>{const i=document.getElementById('rf-digits').shadowRoot.querySelector('input');i.setSelectionRange(i.value.length,i.value.length);});await page.keyboard.type('3a');await page.waitForTimeout(150);
  assert.equal((await model()).digits,'123');
  assert.equal(await el('rf-digits','value'),'123','rejected input reverts to the controlled value');

  const form=await page.evaluate(()=>[...new FormData(document.getElementById('rf-form'))].map(([k,v])=>k+'='+(v instanceof File?v.name:v)));
  for(const pair of ['name=Typed','digits=123','free=Free text','notes=Line one\nLine two','alerts=on','size=s','score=4','files=a.txt'])assert.ok(form.includes(pair),`FormData has ${pair}: ${form.join(' & ')}`);

  await page.click('#set-model');await settle();
  assert.equal(await el('rf-name','value'),'Set by React');
  assert.equal(await el('rf-notes','value'),'Line');
  assert.equal(await el('rf-agree','checked'),false);
  assert.equal(await el('rf-size','value'),'s');
  assert.equal(await el('rf-score','value'),5);

  assert.equal(await page.evaluate(()=>window.uncontrolledRef.current?.id),'rf-free','ref points at the element');
  assert.equal(await page.evaluate(()=>window.uncontrolledRef.current instanceof HTMLElement),true);
  assert.equal(await page.evaluate(()=>!!document.getElementById('rf-card').shadowRoot),true);
  assert.deepEqual(errors,[],'no hydration warnings or errors');
  console.log('next react PASS: SSR values, hydration, 7 components controlled/uncontrolled, controlled rejection, checkbox arrays via e.target.value, valueAsNumber, FormData, element refs');
}finally{await browser.close();}
