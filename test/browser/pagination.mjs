// Run after installing test/ssr dependencies. UI_KIT_WEBDRIVER_MODULE points
// to an installed selenium-webdriver/index.js for real Firefox/Safari checks.
import assert from 'node:assert/strict';
import {readFile, mkdtemp} from 'node:fs/promises';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import {join,resolve,extname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const output=await mkdtemp(join(tmpdir(),'ui-kit-pagination-'));
const root=fileURLToPath(new URL('../../',import.meta.url));
const browsers=process.argv[2]?[process.argv[2]]:['chrome','firefox','safari'];
assert.ok(browsers.every(name=>['chrome','firefox','safari'].includes(name)), 'Use chrome, firefox or safari');
const server=createServer(async(req,res)=>{try{
  const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',(extname(file)==='.js'?'text/javascript':'text/html')+'; charset=utf-8');
  res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const fixture='test/browser/fixtures/pagination.html';
const fileBase=pathToFileURL(join(root,fixture)).href;
const httpBase=`http://127.0.0.1:${server.address().port}/${fixture}`;
const urls=[fileBase,httpBase].flatMap(base=>['source','bundle','min'].map(mode=>base+'?mode='+mode));
const setup=()=>{const el=document.getElementById('pager');window.pageEvents=[];el.addEventListener('page-change',e=>pageEvents.push(e.detail));window.nextNode=el.shadowRoot.querySelector('[data-control=next]');nextNode.focus();};
const stable=()=>{const el=document.getElementById('pager');return el.currentPage===2&&el.shadowRoot.activeElement===window.nextNode&&JSON.stringify(window.pageEvents)==='[2]';};
const translate=()=>document.getElementById('pager').setAttribute('data-text-next','下一頁');
const translated=()=>window.nextNode.textContent==='下一頁'&&document.getElementById('pager').shadowRoot.activeElement===window.nextNode;
const boundary=()=>{const el=document.getElementById('pager');return el.currentPage===3&&el.shadowRoot.activeElement?.getAttribute('aria-current')==='page'&&el.liveRegion.textContent==='Page 3';};
try {
  if(browsers.includes('chrome')) {
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:320,height:900}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    for(const url of urls){
    await page.route('**/*',route=>route.continue());
    await page.goto(url);
    try {
      await page.waitForFunction(() => {
        const el=document.getElementById('pager');
        return customElements.get('au-pagination') && el?.shadowRoot?.querySelector('[data-control="next"]');
      }, null, {timeout:5000});
    } catch (error) {
      const details=errors.length ? ` Page errors: ${errors.join(' | ')}` : '';
      throw new Error(`Pagination failed to initialize: ${url}.${details}`, {cause:error});
    }
    await page.evaluate(setup);await page.keyboard.press('Enter');await page.waitForFunction(stable);
    await page.evaluate(translate);await page.waitForFunction(translated);await page.keyboard.press('Enter');await page.waitForFunction(boundary);
    await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.getElementById('pager').shadowRoot.activeElement?.tagName),'INPUT');
    await page.locator('au-pagination input').fill('1');await page.keyboard.press('Enter');await page.waitForFunction(()=>document.getElementById('pager').currentPage===1);
    assert.equal(await page.evaluate(()=>document.getElementById('pager').shadowRoot.activeElement?.tagName),'INPUT');
    const cdp=await page.context().newCDPSession(page),ax=await cdp.send('Accessibility.getFullAXTree');
    assert.ok(ax.nodes.find(n=>n.role?.value==='navigation'&&n.name?.value==='Results pages'));
    assert.ok(ax.nodes.find(n=>n.role?.value==='combobox'&&n.name?.value==='each page Page size'));
    assert.ok(ax.nodes.find(n=>n.role?.value==='spinbutton'&&n.name?.value==='go to'));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.ok(await page.locator('au-pagination button, au-pagination select, au-pagination input').evaluateAll(nodes=>nodes.every(el=>{const r=el.getBoundingClientRect();return r.width>=24&&r.height>=24;})));
    await page.screenshot({path:join(output,'pagination-'+new URL(url).searchParams.get('mode')+'-'+new URL(url).protocol.slice(0,-1)+'.png')});
    await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
    assert.equal(await page.locator('au-pagination input').evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
    assert.equal(await page.locator('au-pagination button').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
    await page.screenshot({path:join(output,'pagination-forced-colors.png')});assert.deepEqual(errors,[]);
    console.log('Chrome PASS '+url+': keyboard, focus identity, boundary fallback, jump, AX names, 320px, targets, forced colors, reduced motion');
    await page.unroute('**/*');
    }
  } finally {await browser.close();}
  }
  if(browsers.some(name=>name!=='chrome')) {
  if(!process.env.UI_KIT_WEBDRIVER_MODULE) throw Error('Set UI_KIT_WEBDRIVER_MODULE to run required Firefox/Safari checks');
  const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE);
  const {default:webdriver}=await import(moduleURL.href);
  const {default:firefox}=await import(new URL('./firefox.js',moduleURL).href);
  for(const name of browsers.filter(name=>name!=='chrome')) {
    let driver;
    try {
      let builder=new webdriver.Builder().forBrowser(name);
      if(name==='firefox') builder=builder.setFirefoxOptions(new firefox.Options().addArguments('-headless'));
      driver=await builder.build();
      for(const url of urls){await driver.get(url);await driver.executeScript(setup);
      await driver.actions().sendKeys(webdriver.Key.ENTER).perform();await driver.wait(()=>driver.executeScript(stable),3000);
      await driver.executeScript(translate);await driver.wait(()=>driver.executeScript(translated),3000);
      await driver.actions().sendKeys(webdriver.Key.ENTER).perform();await driver.wait(()=>driver.executeScript(boundary),3000);
      await driver.actions().sendKeys(webdriver.Key.TAB).perform();assert.equal(await driver.executeScript('return document.getElementById("pager").shadowRoot.activeElement?.tagName'),'INPUT');
      const select=await driver.executeScript('return document.getElementById("pager").shadowRoot.querySelector("select")');
      assert.equal(await select.getAccessibleName(),'each page Page size');
      const nav=await driver.executeScript('return document.getElementById("pager").shadowRoot.querySelector("nav")');
      assert.equal(await nav.getAccessibleName(),'Results pages');
      console.log(name+' PASS '+url+': real keyboard navigation, translation focus, boundary fallback, Tab order and accessible names');
      }
    } finally {if(driver)await driver.quit();}
  }
  }
  console.log('Screenshots: '+output);
} finally {await new Promise(resolve=>server.close(resolve));}
