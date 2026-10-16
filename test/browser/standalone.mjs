// Each dist/components/*.js file, readable and minified, works on its own as a classic script, over
// file:// and HTTP: it defines exactly its own elements, leaks no globals,
// renders, and can be combined with other files and the full bundle.
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname,basename} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const browsers=process.argv[2]?[process.argv[2]]:['chrome','firefox','safari'];
assert.ok(browsers.every(b=>['chrome','firefox','safari'].includes(b)));
const server=createServer(async(req,res)=>{try{
  const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',(extname(file)==='.js'?'text/javascript':'text/html')+'; charset=utf-8');
  res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const fixture='test/browser/fixtures/standalone.html';
const bases=[pathToFileURL(resolve(root,fixture)).href,`http://127.0.0.1:${server.address().port}/${fixture}`];
// Element names each source file defines, read from its customElements.define calls.
const components=Object.fromEntries(readdirSync(resolve(root,'src/components')).filter(f=>f.endsWith('.js')).map(f=>[
  basename(f,'.js'),[...readFileSync(resolve(root,'src/components',f),'utf8').matchAll(/define\(\s*["'](au-[a-z-]+)["']/g)].map(m=>m[1]),
]));
const allTags=Object.values(components).flat();
assert.equal(allTags.length,18,'expected 18 elements in 15 files');

const inspect=allTags=>{
  const leaked=Object.keys(window).filter(key=>!globalsBefore.includes(key)&&key!=='globalsBefore');
  const defined=allTags.filter(tag=>customElements.get(tag));
  const shadowless=defined.filter(tag=>{const el=document.createElement(tag);document.body.append(el);const ok=!!el.shadowRoot;el.remove();return !ok;});
  return {errors,leaked,defined,shadowless};
};
// Shadow content of the three components that share render code with the server.
const render=()=>{
  document.body.insertAdjacentHTML('beforeend',`<au-accordion id="acc"><au-accordion-item><span slot="heading">Question</span><div slot="content">Answer</div></au-accordion-item></au-accordion>
<au-tabs id="tabs" aria-label="Sections"><div class="au-tab-panel" slot="panel" label="One">1</div><div class="au-tab-panel" slot="panel" label="Two">2</div></au-tabs>
<au-breadcrumbs id="crumbs" items='[{"text":"Home","url":"./"},{"text":"Here"}]'></au-breadcrumbs>`);
};
const rendered=()=>{
  const item=document.querySelector('#acc au-accordion-item');
  return {
    accordion:item.shadowRoot?.getElementById('title')?.getAttribute('aria-expanded')??null,
    tabs:document.getElementById('tabs').shadowRoot?.querySelectorAll('[role=tab]').length??0,
    breadcrumbs:document.getElementById('crumbs').shadowRoot?.querySelectorAll('a').length??0,
  };
};

async function verify(api,name){
  for(const base of bases){
    const protocol=new URL(base).protocol;
    for(const [file,tags] of Object.entries(components))for(const variant of [file,file+'.min']){
      await api.goto(`${base}?files=${variant}`);await api.wait(()=>document.readyState==='complete');
      const result=await api.evaluate(inspect,allTags);
      assert.deepEqual(result,{errors:[],leaked:[],defined:tags,shadowless:[]},`${name} ${protocol} ${variant}.js on its own`);
    }
    await api.goto(`${base}?files=accordion.min,tabs,breadcrumbs.min`);await api.wait(()=>document.readyState==='complete');
    await api.evaluate(render);await api.wait(()=>document.getElementById('tabs').shadowRoot?.querySelectorAll('[role=tab]').length===2);
    assert.deepEqual(await api.evaluate(rendered),{accordion:'false',tabs:2,breadcrumbs:1},`${name} ${protocol} rendering`);
    // Files loaded twice, and next to the full bundle, define each element once.
    await api.goto(`${base}?files=tabs,accordion.min,bundle,tabs.min,breadcrumbs`);await api.wait(()=>document.readyState==='complete');
    const combined=await api.evaluate(inspect,allTags);
    assert.deepEqual({errors:combined.errors,leaked:combined.leaked,defined:combined.defined.length},{errors:[],leaked:[],defined:18},`${name} ${protocol} combined`);
    console.log(`${name} ${protocol} PASS: ${Object.keys(components).length} files × readable/min alone (own elements only, no globals), rendering, combined with the bundle`);
  }
}

try{
  if(browsers.includes('chrome')){
    const browser=await chromium.launch({channel:'chrome',headless:true});
    try{
      const page=await browser.newPage();
      await verify({goto:url=>page.goto(url),evaluate:(fn,arg)=>page.evaluate(fn,arg),wait:fn=>page.waitForFunction(fn)},'chrome');
    }finally{await browser.close();}
  }
  const webdriverBrowsers=browsers.filter(n=>n!=='chrome');
  if(webdriverBrowsers.length){
    if(!process.env.UI_KIT_WEBDRIVER_MODULE)throw Error('Set UI_KIT_WEBDRIVER_MODULE for Firefox/Safari checks');
    const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE);
    const {default:webdriver}=await import(moduleURL.href),{default:firefox}=await import(new URL('./firefox.js',moduleURL).href);
    for(const name of webdriverBrowsers){
      let driver;
      try{
        let builder=new webdriver.Builder().forBrowser(name);
        if(name==='firefox')builder=builder.setFirefoxOptions(new firefox.Options().addArguments('-headless'));
        driver=await builder.build();
        // Safari can return from get() while the previous page is still current.
        const goto=async url=>{await driver.get(url);await driver.wait(async()=>await driver.executeScript('return location.href')===url,5000);};
        await verify({goto,evaluate:(fn,arg)=>driver.executeScript(fn,arg),wait:fn=>driver.wait(()=>driver.executeScript(fn),5000)},name);
      }finally{if(driver)await driver.quit();}
    }
  }
}finally{await new Promise(r=>server.close(r));}
