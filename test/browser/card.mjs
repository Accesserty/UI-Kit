// node test/browser/card.mjs [chrome|firefox|safari]
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
assert.ok(browsers.every(n=>['chrome','firefox','safari'].includes(n)));
const server=createServer(async(req,res)=>{try{
  const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript':extname(file)==='.css'?'text/css':'text/html');
  res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const urls=['source','bundle','min'].flatMap(v=>{
  const path='test/browser/fixtures/card-'+v+'.html';
  return [`http://127.0.0.1:${server.address().port}/`+path,pathToFileURL(join(root,path)).href];
});
const active=()=>{let el=document.activeElement;while(el?.shadowRoot?.activeElement)el=el.shadowRoot.activeElement;return el?.id;};
async function scenario(api){
  await api.evaluate(()=>{
    const layout=cardForm.parentElement,wrapper=document.createElement('div');layout.before(wrapper);wrapper.attachShadow({mode:'open'}).append(layout);
    for(let i=0;i<3;i++){card.remove();cardForm.append(card);card.render();}
    document.getElementById('before').focus();
  });
  for(const id of ['heading-action','media-link','notes']){await api.tab();assert.equal(await api.evaluate(active),id);}
  await api.evaluate(()=>{const input=card.querySelector('input');input.setSelectionRange(input.value.length,input.value.length);});
  await api.key('x');
  assert.equal(await api.evaluate(()=>{
    const slot=card.shadowRoot.querySelector('slot[name=content]');card.querySelector('h2').textContent='旅遊指南';card.render();
    return card.shadowRoot.querySelector('slot[name=content]')===slot&&card.querySelector('input').matches(':focus')&&new FormData(cardForm).get('notes')==='Initialx';
  }),true);
  await api.tab();assert.equal(await api.evaluate(active),'save');await api.key('Space');
  assert.deepEqual(await api.evaluate(()=>submissions),['Initialx']);
  await api.tab();assert.equal(await api.evaluate(active),'after');
  await api.evaluate(()=>cardForm.reset());assert.equal(await api.evaluate(()=>new FormData(cardForm).get('notes')),'Initial');
}
try{
  if(browsers.includes('chrome')){
    const browser=await chromium.launch({channel:'chrome',headless:true});
    try{
      const page=await browser.newPage({viewport:{width:320,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
      for(const url of urls){
        await page.goto(url);await page.waitForFunction(()=>window.card?.shadowRoot?.querySelector('slot'));
        await scenario({evaluate:fn=>page.evaluate(fn),tab:()=>page.keyboard.press('Tab'),key:k=>page.keyboard.press(k)});
        const cdp=await page.context().newCDPSession(page),ax=await cdp.send('Accessibility.getFullAXTree');
        assert.ok(ax.nodes.find(n=>n.role?.value==='heading'&&n.name?.value==='旅遊指南'&&n.properties.some(p=>p.name==='level'&&p.value.value===2)));
        assert.ok(ax.nodes.find(n=>n.role?.value==='textbox'&&n.name?.value==='Guide notes'));
        await page.evaluate(()=>{card.querySelector('h2').textContent='LongUnbrokenTitle'.repeat(10);card.dir='rtl';});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        await page.evaluate(()=>{card.hidden=true;});assert.equal(await page.evaluate(()=>getComputedStyle(card).display),'none');
        await page.evaluate(()=>{card.hidden=false;card.querySelector('button').focus();});
        await page.emulateMedia({forcedColors:'active'});
        assert.equal(await page.evaluate(()=>{const style=getComputedStyle(card.querySelector('button'));return style.outlineStyle!=='none'&&parseFloat(style.outlineWidth)>0;}),true);
        await page.emulateMedia({forcedColors:'none'});
        console.log('Chrome '+url.split('/').at(-1)+' '+new URL(url).protocol+' PASS: native slots/tab/form/reset, retained focus, AX, narrow RTL, hidden');
      }
      const output=await mkdtemp(join(tmpdir(),'card-check-'));await page.screenshot({path:join(output,'card-narrow.png')});console.log('Screenshot: '+output);assert.deepEqual(errors,[]);
    }finally{await browser.close();}
  }
  if(browsers.some(n=>n!=='chrome')){
    assert.ok(process.env.UI_KIT_WEBDRIVER_MODULE,'Set UI_KIT_WEBDRIVER_MODULE for Firefox/Safari');
    const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE),{default:webdriver}=await import(moduleURL.href),{default:firefox}=await import(new URL('./firefox.js',moduleURL).href);
    for(const name of browsers.filter(n=>n!=='chrome')){
      let driver;
      try{
        let builder=new webdriver.Builder().forBrowser(name);if(name==='firefox')builder=builder.setFirefoxOptions(new firefox.Options().addArguments('-headless'));
        driver=await builder.build();const key=value=>driver.actions().sendKeys(value).perform();
        for(const url of urls){
          await driver.get(url);await driver.wait(()=>driver.executeScript('return !!window.card?.shadowRoot?.querySelector("slot")'),3000);
          let optionTab=false;
          if(name==='safari'){
            await driver.executeScript('window.probe=document.createElement("div");probe.innerHTML="<button id=p1>First</button><button id=p2>Second</button>";document.body.append(probe);document.getElementById("p1").focus()');
            await key(webdriver.Key.TAB);optionTab=await driver.executeScript('return document.activeElement.id!=="p2"');
            if(optionTab){await driver.executeScript('document.getElementById("p1").focus()');await driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform();assert.equal(await driver.executeScript('return document.activeElement.id'),'p2');}
            await driver.executeScript('probe.remove()');
          }
          await scenario({evaluate:fn=>driver.executeScript(fn),key:k=>key(k==='Space'?webdriver.Key.SPACE:k),tab:()=>optionTab?driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform():key(webdriver.Key.TAB)});
          const input=await driver.executeScript('return card.querySelector("input")');assert.equal(await input.getAccessibleName(),'Guide notes');
          console.log(name+' '+url.split('/').at(-1)+' '+new URL(url).protocol+' PASS: slot order, form/reset, stable focus, names, '+(optionTab?'Option+Tab':'Tab'));
        }
      }finally{if(driver)await driver.quit();}
    }
  }
}finally{await new Promise(r=>server.close(r));}
