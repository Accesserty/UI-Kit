// npm install in test/ssr first. Rebuild dist before running. No framework is
// loaded by the HTML fixtures. WebDriver is needed for installed Firefox/Safari.
import assert from 'node:assert/strict';
import {readFile,stat,mkdtemp} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,extname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const output=await mkdtemp(join(tmpdir(),'breadcrumbs-html-'));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=createServer(async(req,res)=>{try{
  let file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  if((await stat(file)).isDirectory())file=join(file,'index.html');
  res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const http=`http://127.0.0.1:${server.address().port}/`;
const cases=[];
for(const base of [pathToFileURL(root).href,http])for(const variant of ['source','bundle','min'])cases.push(new URL('test/browser/fixtures/breadcrumbs-'+variant+'.html',base).href);
const ready=()=>document.querySelector('au-breadcrumbs')?.shadowRoot?.querySelectorAll('a').length===2;
const check=()=>{
  const el=document.querySelector('au-breadcrumbs'),links=[...el.shadowRoot.querySelectorAll('a')];
  window.linkNodes=links;
  return {links:links.map(a=>a.href),current:el.shadowRoot.querySelector('[aria-current=page]').tagName,underline:getComputedStyle(links[0]).textDecorationLine,
    upgraded:!Object.hasOwn(el,'items')&&!Object.hasOwn(el,'separator')&&Array.isArray(el.items)&&el.shadowRoot.querySelector('[aria-hidden=true]').textContent==='›'};
};
const focus=()=>window.linkNodes[0].focus();
function verify(result,url){
  assert.deepEqual(result.links,[new URL('./breadcrumbs-target.html',url).href,new URL('./breadcrumbs-target.html#components',url).href]);
  assert.equal(result.current,'SPAN');assert.ok(result.underline.includes('underline'));
  assert.equal(result.upgraded,true);
}
// Exercise setters after deferred upgrade and keep the same focused anchor
// through translation; a shortened trail turns that anchor into current text.
const updateTrail=()=>{
  const c=document.querySelector('au-breadcrumbs'),items=c.items,link=c.shadowRoot.querySelectorAll('a')[1];
  link.focus();c.items=items.map((item,i)=>({...item,text:i===1?'元件':item.text}));
  const retained=c.shadowRoot.activeElement===link&&link.textContent==='元件';
  c.items=c.items.slice(0,2);
  const recovered=c.shadowRoot.activeElement===c.shadowRoot.querySelector('nav')&&!link.isConnected&&c.shadowRoot.querySelector('[aria-current=page]').textContent==='元件';
  c.items=items;window.linkNodes=[...c.shadowRoot.querySelectorAll('a')];
  return retained&&recovered;
};
try {
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.route('**/*',r=>/^file:/.test(r.request().url())||r.request().url().startsWith(http)?r.continue():r.abort());
    for(const url of cases){
      await page.goto(url);await page.waitForFunction(ready);verify(await page.evaluate(check),url);
      assert.equal(await page.evaluate(updateTrail),true);
      await page.evaluate(focus);await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.querySelector('au-breadcrumbs').shadowRoot.activeElement===window.linkNodes[1]),true);
      await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'after');
      await page.evaluate(()=>window.linkNodes[1].focus());await page.keyboard.press('Enter');
      await page.waitForURL(new URL('./breadcrumbs-target.html#components',url).href);
    }
    for(const base of [pathToFileURL(root).href,http]){
      const demo=new URL('demo/breadcrumbs.html',base).href;
      await page.goto(demo);await page.waitForFunction(ready);
      assert.equal(await page.locator('au-breadcrumbs').evaluateAll(els=>els.every(el=>el.shadowRoot.querySelectorAll('a').length===2)),true);
      const first=page.locator('au-breadcrumbs').first().locator('a').first();await first.focus();
      await page.screenshot({path:join(output,new URL(base).protocol==='file:'?'demo-file.png':'demo-http.png')});
      await first.click();await page.waitForURL(new URL('demo/index.html',base).href);
      assert.equal(await page.locator('#components').textContent(),'Components');
    }
    assert.deepEqual(errors,[]);console.log('Chrome: source/bundle/min classic scripts on file + HTTP, real keyboard navigation, tab order, underline, actual demo links PASS');
  }finally{await browser.close();}
  if(!process.env.UI_KIT_WEBDRIVER_MODULE)throw Error('Set UI_KIT_WEBDRIVER_MODULE for required Firefox/Safari checks');
  const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE);
  const {default:webdriver}=await import(moduleURL.href),{default:firefox}=await import(new URL('./firefox.js',moduleURL).href);
  for(const name of ['firefox','safari']){
    let driver;
    try{
      let builder=new webdriver.Builder().forBrowser(name);
      if(name==='firefox')builder=builder.setFirefoxOptions(new firefox.Options().addArguments('-headless'));
      driver=await builder.build();
      for(const url of cases){
        await driver.get(url);await driver.wait(()=>driver.executeScript(ready),5000);verify(await driver.executeScript(check),url);
        assert.equal(await driver.executeScript(updateTrail),true);
        let optionTab=false;
        if(name==='safari'){
          await driver.executeScript(()=>{
            window.probe=document.createElement('div');
            window.probe.innerHTML='<a href="#probe1" id="p1">First</a><a href="#probe2" id="p2">Second</a>';
            document.body.append(window.probe);document.getElementById('p1').focus();
          });
          await driver.actions().sendKeys(webdriver.Key.TAB).perform();optionTab=await driver.executeScript('return document.activeElement.id!=="p2"');
          if(optionTab){await driver.executeScript('document.getElementById("p1").focus()');await driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform();assert.equal(await driver.executeScript('return document.activeElement.id'),'p2');}
          await driver.executeScript('probe.remove()');
        }
        const tab=()=>optionTab?driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform():driver.actions().sendKeys(webdriver.Key.TAB).perform();
        await driver.executeScript(focus);await tab();
        assert.equal(await driver.executeScript('return document.querySelector("au-breadcrumbs").shadowRoot.activeElement===window.linkNodes[1]'),true);
        await tab();assert.equal(await driver.executeScript('return document.activeElement.id'),'after');
        await driver.executeScript('window.linkNodes[1].focus()');await driver.actions().sendKeys(webdriver.Key.ENTER).perform();
        await driver.wait(async()=>await driver.getCurrentUrl()===new URL('./breadcrumbs-target.html#components',url).href,5000);
        console.log(name+' '+url.split('/').at(-1)+' '+new URL(url).protocol+' PASS: deferred properties, dynamic focus, Enter, '+(optionTab?'Option+Tab':'Tab'));
      }
      console.log(name+': source/bundle/min classic scripts on file + HTTP, native keyboard link activation PASS');
    }finally{if(driver)await driver.quit();}
  }
  console.log('Screenshots: '+output);
}finally{await new Promise(r=>server.close(r));}
