// Run after `npm run build` in this directory.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname,resolve} from 'node:path';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const root=resolve(new URL('./dist/browser/',import.meta.url).pathname);
const server=createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  const type={'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(file)]||'application/octet-stream';
  res.setHeader('Content-Type',type+'; charset=utf-8');res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/`;
let browser;
try{
  browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(url);await page.waitForSelector('au-input input');
  assert.equal(await page.locator('h1').textContent(),'Edit');
  await page.locator('au-input input').fill('From user');
  await page.waitForFunction(() => document.getElementById('value')?.textContent === 'From user');
  assert.equal(await page.locator('#value').textContent(),'From user');
  assert.equal(await page.locator('#text-events').textContent(),'1');
  await page.locator('#write').click();
  // Zoneless Angular schedules its rendered signals; a completed click is not
  // a guarantee that the subsequent render has committed. Still require both
  // the model output and the actual custom-element values to converge.
  await page.waitForFunction(() => document.getElementById('value')?.textContent === 'From model'
    && document.getElementById('checked')?.textContent === 'true'
    && document.querySelector('au-input')?.value === 'From model'
    && document.querySelector('au-checkbox')?.checked === true);
  assert.equal(await page.locator('#value').textContent(),'From model');
  assert.equal(await page.locator('#checked').textContent(),'true');
  await page.locator('#disable').click();
  assert.equal(await page.locator('au-input').getAttribute('disabled'),'');
  assert.equal(await page.locator('au-checkbox').getAttribute('disabled'),'');
  await page.locator('#disable').click();
  await page.locator('au-input input').fill('Reset me');
  await page.locator('button[type=reset]').click();
  // The elements reset synchronously; the zoneless render of the model outputs
  // follows on Angular's scheduler, so wait for both to converge.
  await page.waitForFunction(() => document.querySelector('au-input')?.value === 'Initial'
    && document.querySelector('au-checkbox')?.checked === false
    && document.getElementById('value')?.textContent === 'Initial'
    && document.getElementById('checked')?.textContent === 'false'
    && document.getElementById('valid')?.textContent === 'true');
  assert.equal(await page.locator('au-input').evaluate(el => el.value),'Initial');
  assert.equal(await page.locator('au-checkbox').evaluate(el => el.checked),false);
  assert.equal(await page.locator('#value').textContent(),'Initial');
  assert.equal(await page.locator('#checked').textContent(),'false');
  assert.equal(await page.locator('#valid').textContent(),'true');
  await page.locator('a[href="/summary"]').click();await page.waitForURL('**/summary');
  assert.equal(await page.locator('h1').textContent(),'Summary');
  // Static template text is created before the first binding update runs.
  await page.waitForFunction(() => document.getElementById('summary')?.textContent === 'Initial');
  assert.equal(await page.locator('#summary').textContent(),'Initial');
  await page.locator('a[href="/edit"]').click();await page.waitForURL('**/edit');
  assert.equal(await page.locator('h1').textContent(),'Edit');
  assert.deepEqual(errors,[]);
  console.log('PASS Angular CLI AOT production runtime: route navigation, input/checkbox adapters, model writes, disabled state, reset, validation and browser errors');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
