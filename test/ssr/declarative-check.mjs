// Declarative Shadow DOM through a framework: the server HTML carries the
// shadow roots, the page shows them without JavaScript, and with JavaScript the
// components adopt the server's nodes without hydration warnings.
// Usage: node declarative-check.mjs <port> <label>
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const url=`http://127.0.0.1:${process.argv[2]}`,label=process.argv[3]||url;
const hosts='au-breadcrumbs,au-accordion,au-accordion-item,au-tabs';
const html=await (await fetch(url)).text();
for(const tag of ['au-breadcrumbs','au-accordion','au-accordion-item','au-tabs'])
  assert.match(html,new RegExp(`<${tag}\\b[^>]*><template shadowrootmode="open">`),`${label}: server HTML has a declarative root for ${tag}`);

const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const off=await (await browser.newContext({javaScriptEnabled:false})).newPage();await off.goto(url);
  assert.deepEqual(await off.evaluate(()=>({
    crumbs:[...document.getElementById('dsd-crumbs').shadowRoot.querySelectorAll('li > .item')].map(e=>e.textContent),
    open:[...document.querySelectorAll('au-accordion-item')].map(i=>i.shadowRoot.getElementById('title').getAttribute('aria-expanded')),
    tabs:[...document.getElementById('dsd-tabs').shadowRoot.querySelectorAll('[role=tab]')].map(t=>t.textContent+':'+t.getAttribute('aria-selected')),
    panels:[...document.getElementById('dsd-tabs').children].map(p=>getComputedStyle(p).display),
  })),{crumbs:['Home','Docs','Forms'],open:['false','true'],tabs:['Intro:false','Specs:true','Reviews:false'],panels:['none','block','none']},`${label}: layout without JavaScript`);

  const page=await browser.newPage(),errors=[];
  page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});page.on('pageerror',e=>errors.push(String(e)));
  // Remember each server-rendered shadow node as the parser creates it.
  await page.addInitScript(selector=>{window.__serverNodes=new Map();
    new MutationObserver(()=>{for(const host of document.querySelectorAll(selector))if(host.shadowRoot&&!__serverNodes.has(host))__serverNodes.set(host,host.shadowRoot.firstElementChild);}).observe(document,{childList:true,subtree:true});},hosts);
  await page.goto(url);
  await page.waitForFunction(()=>document.getElementById('ready')?.textContent==='true'&&['au-accordion-item','au-tabs','au-breadcrumbs'].every(t=>customElements.get(t)));
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(selector=>{const all=[...document.querySelectorAll(selector)];return all.length===__serverNodes.size&&all.every(h=>{const node=__serverNodes.get(h);return node?.isConnected&&h.shadowRoot.contains(node);});},hosts),true,`${label}: server shadow nodes adopted, not rebuilt`);
  assert.equal(await page.evaluate(()=>{const t=document.getElementById('dsd-tabs');return [...t.children].map(p=>p.getAttribute('role')+'/'+p.hidden).join()+'|'+!!t.shadowRoot.querySelector('style[data-preselect]');}),'tabpanel/true,tabpanel/false,tabpanel/true|false',`${label}: tabs took over the panels`);
  // The adopted components still work and still follow framework updates.
  await page.evaluate(()=>document.getElementById('q1').button.click());
  assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('au-accordion-item')].map(i=>i.open)),[true,false],`${label}: exclusive accordion after a click`);
  await page.evaluate(()=>window.addFaq());await page.waitForFunction(()=>document.getElementById('q3')?.shadowRoot?.getElementById('title'));
  assert.equal(await page.evaluate(()=>document.getElementById('q3').shadowRoot.getElementById('title').textContent.trim()===''&&document.getElementById('q3').button.getAttribute('aria-expanded')),'false',`${label}: a client-added item builds its own root`);
  assert.deepEqual(errors,[],`${label}: no hydration warnings or errors`);
  console.log(`${label} declarative PASS: server roots for breadcrumbs, accordion, tabs; correct layout without JavaScript; adopted without hydration warnings; interactive and reactive afterwards`);
}finally{await browser.close();}
