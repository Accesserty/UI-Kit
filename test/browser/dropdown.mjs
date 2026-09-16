// Installed Chrome, Firefox and Safari; plain HTML over HTTP and file URLs.
// UI_KIT_WEBDRIVER_MODULE points to an installed selenium-webdriver/index.js.
import assert from 'node:assert/strict';
import {readFile, mkdtemp} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve, extname, join} from 'node:path';
import {tmpdir} from 'node:os';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const browsers=process.argv[2]?[process.argv[2]]:['chrome','firefox','safari'];
assert.ok(browsers.every(name=>['chrome','firefox','safari'].includes(name)));
const server=createServer(async(req,res)=>{
  try {
    const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
    if(!file.startsWith(root)) {res.writeHead(403).end();return;}
    res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript':'text/html');
    res.end(await readFile(file));
  } catch {res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const urls=['source','bundle','min'].flatMap(variant => {
  const file=`test/browser/fixtures/dropdown-${variant}.html`;
  return [`http://127.0.0.1:${server.address().port}/${file}`,pathToFileURL(join(root,file)).href]
    .flatMap(url => [url, url+'?fallback=1']);
});
const setup=()=>{
  window.dd=document.getElementById('actions');window.selections=[];
  if(new URL(location.href).searchParams.has('fallback')) {
    const parent=dd.parentNode,next=dd.nextSibling;dd.remove();
    Object.defineProperty(dd.menu,'showPopover',{value:undefined,configurable:true});
    Object.defineProperty(dd.menu,'hidePopover',{value:undefined,configurable:true});
    parent.insertBefore(dd,next);
  }
  dd.addEventListener('selected',e=>selections.push(e.detail.value));
  window.menuEvents=[];
  dd.trigger.addEventListener('keydown',e=>menuEvents.push(['key',e.key,e.defaultPrevented]));
  dd.menu.addEventListener('toggle',e=>menuEvents.push(['toggle',e.newState]));
  const wrapper=document.createElement('div');dd.before(wrapper);
  wrapper.attachShadow({mode:'open'}).append(dd);
  const first=dd.items[0];
  for(let i=0;i<3;i++) {first.remove();dd.prepend(first);const parent=dd.parentNode;dd.remove();parent.append(dd);}
  dd.trigger.focus();
};
const firstFocused=()=>dd.isOpen&&dd.items[0].shadowRoot.activeElement===dd.items[0].item;
const secondFocused=()=>dd.items[1].shadowRoot.activeElement===dd.items[1].item;
const selectedOnce=()=>!dd.isOpen&&JSON.stringify(selections)==='["save"]'&&dd.shadowRoot.activeElement===dd.trigger;
const translated=()=>{const node=dd.items[1].item;dd.items[1].textContent='儲存';dd.setAttribute('data-text-trigger','文件操作');return dd.items[1].item===node&&dd.items[1].shadowRoot.activeElement===node;};
const menuNameContract=()=>{
  const labelledby=dd.menu.getAttribute('aria-labelledby');
  const label=labelledby&&dd.shadowRoot.getElementById(labelledby);
  return {
    role:dd.menu.getAttribute('role'),
    labelledby,
    targetFound:!!label,
    targetText:label?.textContent.trim()||''
  };
};
const itemNameContract=()=>{
  const item=dd.items[1].item;
  return {
    role:item.getAttribute('role'),
    tabindex:item.getAttribute('tabindex'),
    // The label is light-DOM content projected through the item's slot;
    // textContent on the shadow .item wrapper is intentionally empty.
    text:dd.items[1].textContent.trim()
  };
};
const escaped=()=>!dd.isOpen&&dd.shadowRoot.activeElement===dd.trigger&&dd.trigger.getAttribute('aria-expanded')==='false';
const linkFocused=()=>dd.items[2].shadowRoot.activeElement===dd.items[2].item;
try {
  if(browsers.includes('chrome')) {
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    for(const url of urls) {
      console.log('Checking '+url);
      await page.goto(url);await page.waitForFunction(()=>document.getElementById('actions')?.trigger);
      assert.equal(await page.locator('au-dropdown button').getAttribute('aria-expanded'),'false');
      await page.evaluate(setup);await page.keyboard.press('Enter');await page.waitForFunction(firstFocused);
      await page.keyboard.press('ArrowDown');await page.waitForFunction(secondFocused);
      assert.equal(await page.evaluate(translated),true);
      const cdp=await page.context().newCDPSession(page),ax=await cdp.send('Accessibility.getFullAXTree');
      assert.ok(ax.nodes.find(n=>n.role?.value==='menu'&&n.name?.value==='文件操作'));
      assert.ok(ax.nodes.find(n=>n.role?.value==='menuitem'&&n.name?.value==='儲存'));
      await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
      assert.equal(await page.evaluate(()=>getComputedStyle(dd.items[1].item).outlineStyle),'solid');
      assert.equal(await page.evaluate(()=>getComputedStyle(dd.items[1].item).transitionDuration),'0s');
      await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
      assert.notEqual(await page.evaluate(()=>getComputedStyle(dd.items[1].item).boxShadow),'none');
      await page.keyboard.press('Enter');await page.waitForFunction(selectedOnce);
      await page.keyboard.press('ArrowUp');await page.waitForFunction(linkFocused);
      await page.keyboard.press('Escape');await page.waitForFunction(escaped);
      await page.keyboard.press('Enter');await page.waitForFunction(firstFocused);
      await page.keyboard.press('Tab');await page.waitForFunction(()=>!dd.isOpen&&document.activeElement.id==='after');
      await page.evaluate(()=>dd.trigger.focus());await page.keyboard.press('ArrowUp');await page.waitForFunction(linkFocused);
      await page.keyboard.press('Enter');await page.waitForFunction(()=>location.hash==='#destination'&&JSON.stringify(selections)==='["save","open"]');
    }
    const output=await mkdtemp(join(tmpdir(),'dropdown-check-'));
    await page.evaluate(()=>dd.open(1));await page.waitForFunction(secondFocused);
    await page.screenshot({path:join(output,'dropdown.png')});
    await page.route('https://**',route=>route.abort());
    await page.goto(pathToFileURL(join(root,'demo/dropdown.html')).href);
    assert.equal(await page.evaluate(()=>{
      const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);
      return new Set(ids).size===ids.length;
    }),true);
    for(const id of ['basic','custom']) {
      await page.locator(`#${id}-dropdown button`).focus();await page.keyboard.press('ArrowDown');
      await page.waitForFunction(id=>document.getElementById(`${id}-dropdown`).items[0].shadowRoot.activeElement,id);
      await page.keyboard.press('Enter');
      await page.waitForFunction(id=>document.getElementById(`${id}-status`).textContent==='Last selected: 1',id);
      assert.equal(await page.locator(`#${id}-status`).getAttribute('role'),'status');
    }
    await page.screenshot({path:join(output,'dropdown-demo.png')});
    assert.deepEqual(errors,[]);
    console.log('Chrome PASS: source/bundle/min × file/HTTP × native/simulated-inline; nested shadow, reconnect counts, keyboard, Tab exit, links, translated focus, AX names, forced colors, reduced motion, demo IDs and both status updates. Screenshots: '+output);
  } finally {await browser.close();}
  }
  if(browsers.some(name=>name!=='chrome')) {
  if(!process.env.UI_KIT_WEBDRIVER_MODULE) throw Error('Set UI_KIT_WEBDRIVER_MODULE for required Firefox/Safari checks');
  const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE);
  const {default:webdriver}=await import(moduleURL.href);
  const {default:firefox}=await import(new URL('./firefox.js',moduleURL).href);
  for(const name of browsers.filter(name=>name!=='chrome')) {
    let driver;
    const unresolvedNames=[];
    try {
      let builder=new webdriver.Builder().forBrowser(name);
      if(name==='firefox') builder=builder.setFirefoxOptions(new firefox.Options().addArguments('-headless'));
      driver=await builder.build();
      const wait=fn=>driver.wait(()=>driver.executeScript(fn),3000,fn.name||String(fn));
      const readName=async(element,role,url)=>{
        let value=await element.getAccessibleName();
        if(value!=='') return value;
        // DOM changes can precede accessibility-tree updates. Poll the actual
        // computed name, never replace it with DOM text or an assumed name.
        try {
          await driver.wait(async()=>{value=await element.getAccessibleName();return value!=='';},3000,`${role} computed name`,100);
          console.log(`${name} delayed computed ${role} name resolved: ${url}`);
        } catch(error) {
          if(!(error instanceof webdriver.error.TimeoutError)) throw error;
        }
        return value;
      };
      for(const url of urls) {
        console.log(name+' '+url);
        await driver.get(url);await driver.wait(()=>driver.executeScript('return !!document.getElementById("actions")?.trigger'),3000);
        // Establish Safari's keyboard preference with two ordinary buttons.
        // Option+Tab includes controls when plain Tab skips them on macOS.
        let optionTab=false;
        if(name==='safari') {
          await driver.executeScript('window.tabProbe=document.createElement("div");tabProbe.innerHTML="<button id=probe-first>First</button><button id=probe-second>Second</button>";document.body.append(tabProbe);document.getElementById("probe-first").focus();');
          await driver.actions().sendKeys(webdriver.Key.TAB).perform();
          optionTab=await driver.executeScript('return document.activeElement.id !== "probe-second"');
          if(optionTab) {
            await driver.executeScript('document.getElementById("probe-first").focus()');
            await driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform();
            assert.equal(await driver.executeScript('return document.activeElement.id'),'probe-second');
            console.log('Safari plain Tab skips native buttons; verifying full keyboard traversal with Option+Tab');
          }
          await driver.executeScript('tabProbe.remove()');
        }
        await driver.executeScript(setup);
        await driver.actions().sendKeys(webdriver.Key.ENTER).perform();await wait(firstFocused);
        await driver.actions().sendKeys(webdriver.Key.ARROW_DOWN).perform();await wait(secondFocused);
        assert.equal(await driver.executeScript(translated),true);
        // Empty names are unresolved accessibility findings, not established
        // driver bugs. Continue interaction checks, then return a nonzero
        // incomplete status if any computed name is still empty.
        assert.deepEqual(await driver.executeScript(menuNameContract),{
          role:'menu',
          labelledby:await driver.executeScript('return dd.menu.getAttribute("aria-labelledby")'),
          targetFound:true,
          targetText:'文件操作'
        });
        const menu=await driver.executeScript('return dd.menu');
        const webdriverMenuName=await readName(menu,'menu',url);
        if (webdriverMenuName) assert.equal(webdriverMenuName,'文件操作');
        else { unresolvedNames.push({url,role:'menu'}); console.warn(`${name} UNRESOLVED menu accessible name: ${url}`); }
        assert.deepEqual(await driver.executeScript(itemNameContract),{
          role:'menuitem',
          tabindex:'-1',
          text:'儲存'
        });
        const item=await driver.executeScript('return dd.items[1].item');
        const webdriverItemName=await readName(item,'menuitem',url);
        if (webdriverItemName) assert.equal(webdriverItemName,'儲存');
        else { unresolvedNames.push({url,role:'menuitem'}); console.warn(`${name} UNRESOLVED menuitem accessible name: ${url}`); }
        await driver.actions().sendKeys(webdriver.Key.ENTER).perform();await wait(selectedOnce);
        await driver.actions().sendKeys(webdriver.Key.ARROW_UP).perform();await wait(linkFocused);
        await driver.actions().sendKeys(webdriver.Key.ESCAPE).perform();await wait(escaped);
        await driver.actions().sendKeys(webdriver.Key.ENTER).perform();await wait(firstFocused);
        if(optionTab) await driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform();
        else await driver.actions().sendKeys(webdriver.Key.TAB).perform();
        await wait(()=>!dd.isOpen&&document.activeElement.id==='after');
        await driver.executeScript('dd.trigger.focus()');await driver.actions().sendKeys(webdriver.Key.ARROW_UP).perform();await wait(linkFocused);
        await driver.actions().sendKeys(webdriver.Key.ENTER).perform();await driver.wait(()=>driver.executeScript('return location.hash === "#destination" && JSON.stringify(selections) === \'["save","open"]\''),3000);
      }
      console.log(name+' interaction PASS: file/HTTP, nested shadow, reconnect counts, real keyboard, Tab exit, links and translated focus');
      if(unresolvedNames.length) {
        console.error(name+' INCOMPLETE: unresolved accessible names '+JSON.stringify(unresolvedNames));
        process.exitCode=2;
      } else console.log(name+' computed accessible names PASS (not a screen-reader test)');
    } catch(error) {
      if(driver) console.error(await driver.executeScript('return {open:dd.isOpen,selected:selections,events:menuEvents,innerActive:dd.shadowRoot.activeElement?.outerHTML,active:document.activeElement.outerHTML,rootActive:dd.getRootNode().activeElement?.outerHTML,itemFocus:dd.items.map(i=>!!i.shadowRoot.activeElement)}'));
      throw error;
    } finally {if(driver) await driver.quit();}
  }
  }
} finally {await new Promise(r=>server.close(r));}
