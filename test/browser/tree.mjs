// node test/browser/tree.mjs [chrome|firefox|safari]; defaults to all three.
// UI_KIT_WEBDRIVER_MODULE points to selenium-webdriver/index.js.
import assert from 'node:assert/strict';
import {readFile,mkdtemp} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {join,resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const browsers=process.argv[2]?[process.argv[2]]:['chrome','firefox','safari'];
assert.ok(browsers.every(name=>['chrome','firefox','safari'].includes(name)));
const server=createServer(async(req,res)=>{try{
  const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript':extname(file)==='.css'?'text/css':'text/html');
  res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const urls=[];
for(const variant of ['source','bundle','min']){
  const path='test/browser/fixtures/tree-'+variant+'.html';
  urls.push(`http://127.0.0.1:${server.address().port}/`+path,pathToFileURL(join(root,path)).href);
}
const setup=()=>{
  window.tree=document.getElementById('files');
  const wrapper=document.createElement('div');tree.before(wrapper);
  const shadow=wrapper.attachShadow({mode:'open'});
  shadow.append(document.getElementById('tree-label'),tree);
  for(let i=0;i<3;i++){tree.remove();shadow.append(tree);}
  tree.focus();
};
const state=()=>({active:tree.findActiveNode().activeNode?.data.id,checked:tree.getAllNodes().filter(n=>n.checked&&!n.indeterminate).map(n=>n.data.id),events:selections.length});
const translate=()=>{
  window.alpha=tree.getAllNodes()[1];window.alphaInput=alpha.shadowRoot.querySelector('.checkmark');
  tree.data=[{id:'root',label:'檔案',children:[{id:'alpha',label:'甲',lang:'zh-Hant'},{id:'beta',label:'Beta',disabled:true},{id:'gamma',label:'Gamma',children:[{id:'deep',label:'Deep item'}]}]},{id:'last',label:'Last'}];
  return tree.getAllNodes()[1]===alpha&&alpha.shadowRoot.querySelector('.checkmark')===alphaInput&&tree.findActiveNode().activeNode===alpha&&alpha.checked&&tree.getAllNodes()[0].expanded;
};
const collapsed=()=>tree.findActiveNode().activeNode?.data.id==='root'&&!tree.getAllNodes()[0].expanded&&tree.getAllNodes()[1].tabIndex===-1;
try{
  if(browsers.includes('chrome')) {
    const browser=await chromium.launch({channel:'chrome',headless:true});
    try{
      const page=await browser.newPage({viewport:{width:320,height:900}}),errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      for(const url of urls){
        await page.goto(url);await page.waitForFunction(()=>document.getElementById('files')?.getAllNodes?.().length===6);
        await page.evaluate(setup);await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');await page.keyboard.press('Space');
        assert.deepEqual(await page.evaluate(state),{active:'alpha',checked:['alpha'],events:1});
        assert.equal(await page.evaluate(translate),true);
        await page.keyboard.press('ArrowDown');await page.keyboard.press('Space');
        assert.deepEqual(await page.evaluate(state),{active:'beta',checked:['alpha'],events:1});
        await page.keyboard.press('ArrowDown');await page.keyboard.press('Space');
        assert.deepEqual(await page.evaluate(state),{active:'gamma',checked:['root','alpha','gamma','deep'],events:2});
        await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
        assert.equal((await page.evaluate(state)).active,'deep');
        const cdp=await page.context().newCDPSession(page),ax=await cdp.send('Accessibility.getFullAXTree');
        const namedTree=ax.nodes.find(n=>n.role?.value==='tree'&&n.name?.value==='Project files');assert.ok(namedTree);
        assert.equal(ax.nodes.some(n=>n.role?.value==='checkbox'),false,'treeitems alone expose check state');
        const deep=ax.nodes.find(n=>n.role?.value==='treeitem'&&n.name?.value==='Deep item');assert.equal(deep.properties.find(p=>p.name==='level').value.value,3);
        assert.equal(deep.properties.find(p=>p.name==='checked').value.value,'true');
        assert.equal(await page.evaluate(()=>tree.getAllNodes().find(n=>n.data.id==='deep').hasAttribute('aria-expanded')),false);
        await page.evaluate(()=>tree.getAllNodes()[0].setExpanded(false));assert.equal(await page.evaluate(collapsed),true);
        await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'after');
        await page.evaluate(()=>{tree.focus();tree.getAllNodes()[0].setExpanded(true);});
        await page.keyboard.press('a');await page.keyboard.press('l'); // translated Alpha is absent; no state mutation
        await page.evaluate(()=>{tree.data=[{id:'long',label:'VeryLongUnbrokenText'.repeat(12),children:[{id:'child',label:'Child'}]}];tree.focus();});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        assert.equal(await page.evaluate(()=>tree.getAllNodes()[0].shadowRoot.querySelector('.checkmark').getBoundingClientRect().width>=24),true);
        await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
        assert.equal(await page.evaluate(()=>getComputedStyle(tree.getAllNodes()[0].shadowRoot.querySelector('.node-content')).outlineStyle),'solid');
        assert.equal(await page.evaluate(()=>getComputedStyle(tree.getAllNodes()[0].shadowRoot.querySelector('.toggle-icon')).transitionDuration),'0s');
        await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
        await page.evaluate(()=>{tree.dir='rtl';tree.getAllNodes()[0].setExpanded(false);tree.focus();});
        await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>tree.getAllNodes()[0].expanded),true);
        await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>tree.findActiveNode().activeNode.data.id),'child');
        await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>tree.findActiveNode().activeNode.data.id),'long');
        await page.evaluate(()=>{tree.data=[{id:'pointer',label:'Pointer test'}];window.pointerEvents=0;tree.addEventListener('change',()=>pointerEvents++);});
        await page.locator('au-tree-node .checkmark').click();
        assert.deepEqual(await page.evaluate(()=>({checked:tree.getAllNodes()[0].checked,count:pointerEvents})),{checked:true,count:1});
        await page.locator('au-tree-node .text').click();
        assert.deepEqual(await page.evaluate(()=>({checked:tree.getAllNodes()[0].checked,count:pointerEvents})),{checked:false,count:2});
      }
      const output=await mkdtemp(join(tmpdir(),'tree-check-'));await page.screenshot({path:join(output,'tree-narrow.png')});
      assert.deepEqual(errors,[]);console.log('Chrome PASS: source/bundle/min on file/HTTP, nested shadow, pre-definition data, reconnection, keyboard, disabled cascading, translated focus, AX tree/levels/check state, Tab exit, 320px and forced colors. Screenshot: '+output);
    }finally{await browser.close();}
  }
  if(browsers.some(name=>name!=='chrome')){
    if(!process.env.UI_KIT_WEBDRIVER_MODULE)throw Error('Set UI_KIT_WEBDRIVER_MODULE for Firefox/Safari');
    const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE),{default:webdriver}=await import(moduleURL.href),{default:firefox}=await import(new URL('./firefox.js',moduleURL).href);
    for(const name of browsers.filter(name=>name!=='chrome')){
      let driver;
      try{
        let builder=new webdriver.Builder().forBrowser(name);
        if(name==='firefox')builder=builder.setFirefoxOptions(new firefox.Options().addArguments('-headless'));
        driver=await builder.build();
        const key=async value=>driver.actions().sendKeys(value).perform();
        for(const url of urls){
          await driver.get(url);await driver.wait(()=>driver.executeScript('return document.getElementById("files")?.getAllNodes?.().length===6'),3000);
          let optionTab=false;
          if(name==='safari'){
            await driver.executeScript('window.probe=document.createElement("div");probe.innerHTML="<button id=p1>First</button><button id=p2>Second</button>";document.body.append(probe);document.getElementById("p1").focus()');
            await key(webdriver.Key.TAB);optionTab=await driver.executeScript('return document.activeElement.id!=="p2"');
            if(optionTab){await driver.executeScript('document.getElementById("p1").focus()');await driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform();assert.equal(await driver.executeScript('return document.activeElement.id'),'p2');}
            await driver.executeScript('probe.remove()');
          }
          await driver.executeScript(setup);await key(webdriver.Key.ARROW_RIGHT);await key(webdriver.Key.ARROW_RIGHT);await key(webdriver.Key.SPACE);
          assert.deepEqual(await driver.executeScript(state),{active:'alpha',checked:['alpha'],events:1});
          assert.equal(await driver.executeScript(translate),true);
          const treeElement=await driver.executeScript('return tree.shadowRoot.querySelector("[role=tree]")');assert.equal(await treeElement.getAccessibleName(),'Project files');
          const alphaElement=await driver.executeScript('return tree.getAllNodes()[1]');assert.equal(await alphaElement.getAccessibleName(),'甲');
          await key(webdriver.Key.ARROW_DOWN);await key(webdriver.Key.SPACE);assert.deepEqual(await driver.executeScript(state),{active:'beta',checked:['alpha'],events:1});
          await key(webdriver.Key.ARROW_DOWN);await key(webdriver.Key.SPACE);assert.deepEqual(await driver.executeScript(state),{active:'gamma',checked:['root','alpha','gamma','deep'],events:2});
          await key(webdriver.Key.ARROW_RIGHT);await key(webdriver.Key.ARROW_RIGHT);assert.equal((await driver.executeScript(state)).active,'deep');
          await driver.executeScript('tree.getAllNodes()[0].setExpanded(false)');assert.equal(await driver.executeScript(collapsed),true);
          if(optionTab)await driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform();else await key(webdriver.Key.TAB);
          assert.equal(await driver.executeScript('return document.activeElement.id'),'after');
          await driver.executeScript('tree.dir="rtl";tree.getAllNodes()[0].setExpanded(false);tree.focus()');
          await key(webdriver.Key.ARROW_LEFT);assert.equal(await driver.executeScript('return tree.getAllNodes()[0].expanded'),true);
          await key(webdriver.Key.ARROW_LEFT);assert.equal((await driver.executeScript(state)).active,'alpha');
          await key(webdriver.Key.ARROW_RIGHT);assert.equal((await driver.executeScript(state)).active,'root');
          console.log(name+' '+url.split('/').at(-1)+' '+new URL(url).protocol+' PASS: real keys, translated focus, single events, disabled cascading, names, collapse and '+(optionTab?'Option+Tab':'Tab')+' exit');
        }
      }finally{if(driver)await driver.quit();}
    }
  }
}finally{await new Promise(r=>server.close(r));}
