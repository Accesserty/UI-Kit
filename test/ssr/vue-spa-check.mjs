// Vue SPA built with Vite exactly as the README documents (vite.config isCustomElement + plugin).
import assert from 'node:assert/strict';
import {createServer} from 'node:http';import {readFile} from 'node:fs/promises';import {extname} from 'node:path';
import {chromium} from 'playwright';
const dist=new URL('./vue-spa/dist/',import.meta.url).pathname;
const server=createServer(async(req,res)=>{const path=new URL(req.url,'http://x').pathname;if(path==='/favicon.ico'){res.writeHead(204).end();return;}
  try{res.setHeader('Content-Type',{'.js':'text/javascript','.html':'text/html'}[extname(path)]||'text/html');res.end(await readFile(dist+(path==='/'?'index.html':path.slice(1))));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage(),errors=[];
  page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>document.getElementById('score')?.shadowRoot);
  const model=async()=>JSON.parse(await page.locator('#model').textContent());
  await page.locator('#email input').fill('  me@example.com ');await page.locator('#agree').click();
  await page.locator('#score input[value="2"]').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(50);
  assert.deepEqual(await model(),{email:'me@example.com',agree:true,score:3});
  await page.evaluate(()=>{vm.email='set';vm.agree=false;vm.score=5;});await page.waitForTimeout(50);
  assert.deepEqual(await page.evaluate(()=>[document.getElementById('email').value,document.getElementById('agree').checked,document.getElementById('score').value]),['set',false,5]);
  assert.equal(await page.evaluate(()=>{vm.field.focus();let a=document.activeElement;while(a?.shadowRoot?.activeElement)a=a.shadowRoot.activeElement;return a.localName;}),'input');
  assert.equal(await page.evaluate(()=>!!document.getElementById('card').shadowRoot),true,'unwrapped au-card is a custom element');
  assert.deepEqual(errors,[]);
  console.log('vue spa PASS: README vite.config, v-model both directions with .trim, template ref, unwrapped elements');
}finally{await browser.close();server.close();}
