// node test/browser/declarative.mjs [chrome|firefox|safari]; defaults to chrome.
// UI_KIT_WEBDRIVER_MODULE points to selenium-webdriver/index.js for Firefox/Safari.
//
// Declarative Shadow DOM: each fixture is served twice with the built bundle —
// as written (the components build their shadow roots) and after
// injectDeclarativeShadow() (the components adopt the server's roots). The two
// must end up identical: shadow markup, accessibility structure, and state and
// events after the same real interactions. The server's nodes must be kept, and
// with JavaScript off the declarative roots must already show the right state.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,extname} from 'node:path';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
import {injectDeclarativeShadow} from '../../src/ssr/inject.js';

const root=fileURLToPath(new URL('../../',import.meta.url));
const browserName=process.argv[2]||'chrome';
assert.ok(['chrome','firefox','safari'].includes(browserName));

const fixtures={
  accordion:{
    tags:['au-accordion','au-accordion-item'],
    html:`<au-accordion id="g" exclusive data-text-exclusive-hint="One answer at a time.">
  <au-accordion-item id="i1" heading-level="2"><span slot="heading">Returns</span><div slot="content"><p>Seven days.</p></div></au-accordion-item>
  <au-accordion-item id="i2" open heading-level="2"><span slot="heading">Shipping</span><div slot="content"><p>Free over 1000.</p></div></au-accordion-item>
  <au-accordion-item id="i3" heading-level="2"><span slot="heading">More</span><div slot="content"><au-accordion><au-accordion-item id="n1" no-region><span slot="heading">Nested</span><div slot="content"><p id="deep">Deep answer</p></div></au-accordion-item></au-accordion></div></au-accordion-item>
</au-accordion>`,
    steps:[['click','i1'],['focus','i3'],['key','Enter'],['click','n1'],['click','n1'],['hash','deep']],
    listen:()=>{window.__log=[];document.addEventListener('au-toggle',e=>__log.push(e.target.id+'='+e.detail.open));},
    state:()=>({items:[...document.querySelectorAll('au-accordion-item')].map(i=>i.id+':'+i.open+'/'+i.button.getAttribute('aria-expanded')+'/'+(i.region.hasAttribute('hidden'))).join(' '),events:window.__log.join(' ')}),
    // Without JavaScript the declarative roots already show the final layout.
    noJS:()=>[...document.querySelectorAll('au-accordion-item')].map(i=>{const r=i.shadowRoot;return i.id+':'+(r?r.getElementById('title').getAttribute('aria-expanded')+'/'+r.getElementById('region').hasAttribute('hidden'):'none');}).join(' '),
    noJSExpected:'i1:false/true i2:true/false i3:false/true n1:false/true',
  },
  tabs:{
    tags:['au-tabs'],
    html:`<au-tabs id="t" aria-label="Product" selected-index="1" data-text-badge-label-prefix="Info:">
  <div class="au-tab-panel" slot="panel" label="Intro" data-badge="new"><button id="in1">Read</button></div>
  <div class="au-tab-panel" slot="panel" label="Specs" label-lang="en">Specs body</div>
  <div class="au-tab-panel" slot="panel">Reviews body</div>
</au-tabs>`,
    // Steps address a control inside a host's shadow root: [hostId, selector, index].
    steps:[['focus',['t','[role=tab][tabindex="0"]',0]],['key','ArrowRight'],['key','Home'],['key','End'],['click',['t','[role=tab]',0]],['key','Tab']],
    listen:()=>{window.__log=[];document.addEventListener('au-tab-change',e=>__log.push(e.detail.index+':'+e.detail.label));},
    state:()=>{const t=document.getElementById('t');let a=document.activeElement;while(a?.shadowRoot?.activeElement)a=a.shadowRoot.activeElement;
      return {tabs:[...t.shadowRoot.querySelectorAll('[role=tab]')].map(b=>b.id+':'+b.getAttribute('aria-selected')+':'+b.tabIndex+':'+(b.ariaControlsElements?.[0]===[...t.children][[...t.shadowRoot.querySelectorAll('[role=tab]')].indexOf(b)])).join(' '),
        panels:[...t.children].map(p=>p.getAttribute('role')+'/'+p.hidden+'/'+p.getAttribute('aria-label')).join(' '),
        // Light-DOM panel ids are generated per page, so focus is identified by role and name.
        focus:(a?.getAttribute('role')||a?.localName)+':'+(a?.getAttribute('aria-label')||a?.textContent),events:window.__log.join(' ')};},
    noJS:()=>{const t=document.getElementById('t');return [...t.shadowRoot.querySelectorAll('[role=tab]')].map(b=>b.textContent+':'+b.getAttribute('aria-selected')).join(' ')+' | '+[...t.children].map(p=>getComputedStyle(p).display).join(' ');},
    noJSExpected:'Intronew:false Specs:true Tab 3:false | none block none',
  },
  breadcrumbs:{
    tags:['au-breadcrumbs'],
    html:`<au-breadcrumbs id="b" aria-label="Breadcrumb" data-link-title-prefix="Go to" items='[{"text":"Home","url":"#home"},{"text":"Docs","url":"#docs"},{"text":"Unsafe","url":"javascript:void 0"},{"text":"Install"}]'><span slot="icon-1">⌂</span></au-breadcrumbs>`,
    steps:[['focus',['b','a',0]],['key','Tab'],['attr',['b','items','[{"text":"首頁","url":"#home"},{"text":"文件","url":"#docs"},{"text":"安裝"}]']],['focus',['b','a',1]],['key','Enter']],
    listen:()=>{},
    state:()=>{const b=document.getElementById('b');let a=document.activeElement;while(a?.shadowRoot?.activeElement)a=a.shadowRoot.activeElement;const page=location.href.split('#')[0];
      return {items:[...b.shadowRoot.querySelectorAll('li > .item')].map(e=>e.localName+':'+e.textContent+':'+(e.href||'').replace(page,'')+':'+(e.getAttribute('aria-current')||'')).join(' '),
        icon:b.shadowRoot.querySelector('slot[name="icon-1"]').assignedElements().map(e=>e.textContent).join(),focus:a?.textContent,hash:location.hash};},
    noJS:()=>{const nav=document.getElementById('b').shadowRoot.querySelector('nav');return nav.getAttribute('aria-label')+' | '+[...nav.querySelectorAll('li > .item')].map(e=>e.localName+':'+e.textContent+':'+(e.getAttribute('href')||'')).join(' ');},
    noJSExpected:'Breadcrumb | a:Home:#home a:Docs:#docs span:Unsafe: span:Install:',
  },
};

const page=(body,{inject})=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="icon" href="data:,">
<script src="/dist/accesserty-ui-kit.js" defer></script></head><body><button id="before">before</button>
${inject?injectDeclarativeShadow(body):body}
<button id="after">after</button>
<script>window.__serverNodes=[...document.querySelectorAll('*')].filter(e=>e.localName.startsWith('au-')&&e.shadowRoot).map(e=>e.shadowRoot.firstElementChild);</script>
</body></html>`;
const pages={};
for(const [name,f] of Object.entries(fixtures)){pages[name+'-client']=page(f.html,{inject:false});pages[name+'-server']=page(f.html,{inject:true});}

const server=createServer(async(req,res)=>{const url=new URL(req.url,'http://x');
  if(url.pathname==='/page'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(pages[url.searchParams.get('k')]);}
  try{const file=resolve(root,'.'+url.pathname);if(!file.startsWith(root))throw 0;res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript':'text/plain');res.end(await readFile(file));}
  catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}/page?k=`;

// Shadow markup with attributes in a fixed order (their order carries no meaning)
// and links relative to the page, whose URL differs between the two variants.
const markup=tags=>[...document.querySelectorAll(tags.join(','))].map(h=>{
  const copy=document.createElement('template');copy.innerHTML=h.shadowRoot.innerHTML;
  for(const el of copy.content.querySelectorAll('*')){const attrs=[...el.attributes].map(a=>[a.name,a.value]).sort(([x],[y])=>x<y?-1:1);for(const [n] of attrs)el.removeAttribute(n);for(const [n,v] of attrs)el.setAttribute(n,v);}
  return copy.innerHTML.replaceAll(location.href.split('#')[0],'');});
const structure=tags=>[...document.querySelectorAll(tags.join(','))].map(h=>[...h.shadowRoot.querySelectorAll('[role],button,[aria-describedby],[aria-labelledby]')]
  .map(e=>[e.localName,e.getAttribute('role'),e.getAttribute('aria-level'),e.getAttribute('aria-expanded'),e.getAttribute('aria-labelledby'),e.getAttribute('aria-describedby'),e.getAttribute('aria-controls')].join(':')).join('|')).join(' ## ');

let browser,driver,wd;
if(browserName==='chrome')browser=await chromium.launch({channel:'chrome',headless:true});
else{
  assert.ok(process.env.UI_KIT_WEBDRIVER_MODULE,'Set UI_KIT_WEBDRIVER_MODULE for Firefox/Safari');
  const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE);
  wd=(await import(moduleURL.href)).default;
  let builder=new wd.Builder().forBrowser(browserName);
  if(browserName==='firefox'){const {default:firefox}=await import(new URL('./firefox.js',moduleURL).href);builder=builder.setFirefoxOptions(new firefox.Options().addArguments('-headless'));}
  driver=await builder.build();
}

// A step target is an accordion item id (its header button) or [hostId, selector, index].
const target=value=>Array.isArray(value)?document.getElementById(value[0]).shadowRoot.querySelectorAll(value[1])[value[2]]:document.getElementById(value).button;
const locate=new Function('value',`const target=${target};const r=target(value).getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2];`);
const focusTarget=new Function('value',`const target=${target};target(value).focus();`);
const clickTarget=new Function('value',`const target=${target};target(value).click();`);
// Server pages have shadow roots before any script runs, so wait for the definitions.
const defined=tags=>document.readyState==='complete'&&tags.every(tag=>customElements.get(tag));
async function open(url,{javaScript=true,tags=[]}={}){
  if(browser){
    const context=await browser.newContext({javaScriptEnabled:javaScript});const p=await context.newPage();const errors=[];
    p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await p.goto(url);if(javaScript)await p.waitForFunction(defined,tags);
    const clickAt=async target=>{const [x,y]=await p.evaluate(locate,target);await p.mouse.click(x,y);};
    return {errors,close:()=>context.close(),ev:(fn,arg)=>p.evaluate(fn,arg),
      step:async([kind,value])=>{
        if(kind==='click')await clickAt(value);
        else if(kind==='focus')await p.evaluate(focusTarget,value);
        else if(kind==='key')await p.keyboard.press(value);
        else if(kind==='hash')await p.evaluate(h=>{location.hash=h;},value);
        else if(kind==='attr')await p.evaluate(([id,name,v])=>document.getElementById(id).setAttribute(name,v),value);
        await p.waitForTimeout(150);}};
  }
  await driver.get(url);
  const ev=(fn,arg)=>driver.executeScript(`return (${fn})(arguments[0])`,arg);
  await driver.wait(()=>ev(defined,tags),5000);await driver.sleep(100);
  return {errors:[],close:async()=>{},ev,
    step:async([kind,value])=>{
      if(kind==='click'){
        const [x,y]=(await ev(locate,value)).map(Math.round);
        await ev(()=>{window.__clicks=0;document.addEventListener('click',()=>window.__clicks++,{capture:true,once:true});});
        await driver.actions().move({x,y,origin:'viewport'}).click().perform();await driver.sleep(100);
        // Safari drops WebDriver pointer input while its window is not frontmost;
        // the same listeners then run through a scripted click.
        if(!await ev(()=>window.__clicks))await ev(clickTarget,value);
      }
      else if(kind==='focus')await ev(focusTarget,value);
      else if(kind==='key'){
        // Safari moves focus between controls with Option+Tab.
        if(value==='Tab'&&browserName==='safari')await driver.actions().keyDown(wd.Key.ALT).sendKeys(wd.Key.TAB).keyUp(wd.Key.ALT).perform();
        else await driver.actions().sendKeys({Enter:wd.Key.ENTER,Space:wd.Key.SPACE,Tab:wd.Key.TAB,ArrowRight:wd.Key.ARROW_RIGHT,ArrowLeft:wd.Key.ARROW_LEFT,Home:wd.Key.HOME,End:wd.Key.END}[value]).perform();
      }
      else if(kind==='hash')await ev(h=>{location.hash=h;},value);
      else if(kind==='attr')await ev(([id,name,v])=>document.getElementById(id).setAttribute(name,v),value);
      await driver.sleep(200);}};
}

try{
  for(const [name,f] of Object.entries(fixtures)){
    // JavaScript off: the declarative roots alone (Chrome only; WebDriver cannot disable it).
    if(browser){const off=await open(base+name+'-server',{javaScript:false});assert.equal(await off.ev(f.noJS),f.noJSExpected,`${name}: layout without JavaScript`);await off.close();}

    const runs={};
    for(const kind of ['client','server']){
      const p=await open(base+name+'-'+kind,{tags:f.tags});
      const result={markup:await p.ev(markup,f.tags),structure:await p.ev(structure,f.tags)};
      if(kind==='server')result.kept=await p.ev(tags=>{const hosts=[...document.querySelectorAll(tags.join(','))];return window.__serverNodes.length===hosts.length&&window.__serverNodes.every((node,i)=>node&&node.isConnected&&hosts[i].shadowRoot.contains(node));},f.tags);
      await p.ev(f.listen);
      result.states=[await p.ev(f.state)];
      for(const step of f.steps){await p.step(step);result.states.push(await p.ev(f.state));}
      result.errors=p.errors;await p.close();runs[kind]=result;
    }
    assert.equal(runs.server.kept,true,`${name}: server-rendered shadow nodes are adopted, not rebuilt`);
    runs.client.markup.forEach((html,i)=>assert.equal(runs.server.markup[i],html,`${name}: shadow markup of host ${i}`));
    assert.equal(runs.server.structure,runs.client.structure,`${name}: accessibility structure`);
    runs.client.states.forEach((state,i)=>assert.deepEqual(runs.server.states[i],state,`${name}: state after ${i?runs&&f.steps[i-1].join(' '):'load'}`));
    assert.deepEqual(runs.server.errors,[]);assert.deepEqual(runs.client.errors,[]);
    console.log(`${browserName} declarative ${name} PASS: ${f.tags.join(', ')} adopted with identical markup, structure and ${f.steps.length} interaction states${browser?'; correct layout without JavaScript':''}`);
  }
}finally{
  if(browser)await browser.close();else await driver.quit();
  server.close();
}
