// node test/browser/accordion.mjs [chrome|firefox|safari]
// UI_KIT_WEBDRIVER_MODULE points to an installed selenium-webdriver/index.js.
import assert from 'node:assert/strict';
import {readFile,mkdtemp} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {join,resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const browsers=process.argv[2]?[process.argv[2]]:['chrome','firefox','safari'];
assert.ok(browsers.every(n=>['chrome','firefox','safari'].includes(n)));
const server=createServer(async(req,res)=>{try{
  const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript':extname(file)==='.css'?'text/css':'text/html');
  res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const urls=['source','bundle','min'].flatMap(v=>{
  const path='test/browser/fixtures/accordion-'+v+'.html';
  return [`http://127.0.0.1:${server.address().port}/`+path,pathToFileURL(join(root,path)).href];
});
const ready=()=>!!window.accordionFixture?.first.button&&accordionFixture.root.exclusive&&accordionFixture.first.open&&!accordionFixture.second.open;
const setup=()=>{
  const f=accordionFixture,wrapper=document.createElement('div');f.root.before(wrapper);
  wrapper.attachShadow({mode:'open'}).append(f.root);
  for(let i=0;i<3;i++){f.root.remove();wrapper.shadowRoot.append(f.root);}
  window.eventLog=[];f.inner.button.focus();
};
const nested=()=>accordionFixture.first.open&&accordionFixture.inner.open&&eventLog.length===0;
const collapsed=()=>{
  const f=accordionFixture;
  return !f.first.open&&f.first.region.hidden&&f.first.region.inert&&f.first.shadowRoot.activeElement===f.first.button&&eventLog.length===1;
};
const translated=()=>{
  const f=accordionFixture,button=f.first.button;
  f.first.querySelector('[slot=heading]').textContent='第一個答案';f.first.setAttribute('heading-level','4');
  f.root.setAttribute('data-text-exclusive-hint','一次只能展開一個區塊');
  return f.first.button===button&&f.first.shadowRoot.activeElement===button&&f.first.heading.getAttribute('aria-level')==='4'&&eventLog.length===2;
};
async function scenario(api){
  await api.evaluate(setup);await api.key('Enter');assert.equal(await api.evaluate(nested),true);
  await api.evaluate(()=>{accordionFixture.inside.focus();accordionFixture.first.open=false;});
  assert.equal(await api.evaluate(collapsed),true);
  await api.key('Space');assert.equal(await api.evaluate(()=>accordionFixture.first.open&&eventLog.length===2),true);
  assert.equal(await api.evaluate(translated),true);
  await api.tab();assert.equal(await api.evaluate(()=>document.activeElement===accordionFixture.inside||accordionFixture.inside.matches(':focus')),true);
  await api.evaluate(()=>accordionFixture.second.button.focus());await api.key('Enter');
  assert.equal(await api.evaluate(()=>!accordionFixture.first.open&&accordionFixture.second.open&&eventLog.length===4&&accordionFixture.second.shadowRoot.activeElement===accordionFixture.second.button),true);
  await api.key('Space');assert.equal(await api.evaluate(()=>!accordionFixture.second.open&&eventLog.length===5),true);
  await api.tab();assert.equal(await api.evaluate(()=>document.activeElement.id),'after');
  await api.evaluate(()=>{accordionFixture.first.open=true;accordionFixture.first.button.focus();});
}
try{
  if(browsers.includes('chrome')){
    const browser=await chromium.launch({channel:'chrome',headless:true});
    try{
      const page=await browser.newPage({viewport:{width:320,height:900}}),errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      for(const url of urls){
        await page.goto(url);await page.waitForFunction(ready);
        await scenario({evaluate:fn=>page.evaluate(fn),key:key=>page.keyboard.press(key),tab:()=>page.keyboard.press('Tab')});
        const cdp=await page.context().newCDPSession(page),ax=await cdp.send('Accessibility.getFullAXTree');
        const button=ax.nodes.find(n=>n.role?.value==='button'&&n.name?.value==='第一個答案 Optional');
        assert.equal(button.description.value,'一次只能展開一個區塊');
        const region=ax.nodes.find(n=>n.role?.value==='region'&&n.name?.value==='第一個答案 Optional');assert.ok(region);
        assert.ok(button.properties.find(p=>p.name==='controls').value.relatedNodes.some(n=>n.backendDOMNodeId===region.backendDOMNodeId));
        assert.ok(ax.nodes.find(n=>n.role?.value==='heading'&&n.name?.value==='第一個答案 Optional'&&n.properties.some(p=>p.name==='level'&&p.value.value===4)));
        await page.evaluate(()=>{accordionFixture.first.querySelector('[slot=heading]').textContent='LongUnbrokenTitle'.repeat(12);accordionFixture.first.dir='rtl';});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        assert.equal(await page.evaluate(()=>getComputedStyle(accordionFixture.first.button).textAlign),'start');
        await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
        await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
        assert.equal(await page.evaluate(()=>getComputedStyle(accordionFixture.first.button).outlineStyle),'solid');
        assert.equal(await page.evaluate(()=>getComputedStyle(accordionFixture.first.button).transitionDuration),'0s');
        await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
        console.log('Chrome '+url.split('/').at(-1)+' '+new URL(url).protocol+' PASS');
      }
      const output=await mkdtemp(join(tmpdir(),'accordion-check-'));await page.screenshot({path:join(output,'accordion-narrow.png')});
      assert.deepEqual(errors,[]);console.log('Screenshot: '+output);
    }finally{await browser.close();}
  }
  if(browsers.some(n=>n!=='chrome')){
    assert.ok(process.env.UI_KIT_WEBDRIVER_MODULE,'Set UI_KIT_WEBDRIVER_MODULE for Firefox/Safari');
    const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE),{default:webdriver}=await import(moduleURL.href),{default:firefox}=await import(new URL('./firefox.js',moduleURL).href);
    for(const name of browsers.filter(n=>n!=='chrome')){
      let driver;
      try{
        let builder=new webdriver.Builder().forBrowser(name);
        if(name==='firefox')builder=builder.setFirefoxOptions(new firefox.Options().addArguments('-headless'));
        driver=await builder.build();
        const key=value=>driver.actions().sendKeys(value).perform();
        for(const url of urls){
          await driver.get(url);await driver.wait(()=>driver.executeScript(ready),3000);
          let optionTab=false;
          if(name==='safari'){
            await driver.executeScript('window.probe=document.createElement("div");probe.innerHTML="<button id=p1>First</button><button id=p2>Second</button>";document.body.append(probe);document.getElementById("p1").focus()');
            await key(webdriver.Key.TAB);optionTab=await driver.executeScript('return document.activeElement.id!=="p2"');
            if(optionTab){await driver.executeScript('document.getElementById("p1").focus()');await driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform();assert.equal(await driver.executeScript('return document.activeElement.id'),'p2');}
            await driver.executeScript('probe.remove()');
          }
          await scenario({evaluate:fn=>driver.executeScript(fn),key:k=>key(k==='Space'?webdriver.Key.SPACE:webdriver.Key.ENTER),tab:()=>optionTab?driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform():key(webdriver.Key.TAB)});
          const button=await driver.executeScript('return accordionFixture.first.button'),region=await driver.executeScript('return accordionFixture.first.region');
          assert.equal(await button.getAccessibleName(),'第一個答案 Optional');assert.equal(await region.getAccessibleName(),'第一個答案 Optional');
          console.log(name+' '+url.split('/').at(-1)+' '+new URL(url).protocol+' PASS: nested exclusivity, focus, events, names, '+(optionTab?'Option+Tab':'Tab'));
        }
      }finally{if(driver)await driver.quit();}
    }
  }
}finally{await new Promise(r=>server.close(r));}
