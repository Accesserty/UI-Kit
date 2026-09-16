// node test/browser/carousel.mjs [chrome|firefox|safari]
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
  const path='test/browser/fixtures/carousel-'+v+'.html';
  return [`http://127.0.0.1:${server.address().port}/`+path,pathToFileURL(join(root,path)).href];
});
const ready=()=>window.gallery?._dots?.length===3&&gallery.current===1&&Math.abs(gallery._startDistance(gallery._slides[1]))<2;
async function scenario(api){
  await api.evaluate(()=>{
    const wrapper=document.createElement('div');gallery.before(wrapper);wrapper.attachShadow({mode:'open'}).append(document.getElementById('gallery-name'),gallery);
    for(let i=0;i<3;i++){gallery.remove();wrapper.shadowRoot.append(gallery);}
    window.changes=[];window.keyTrace=[];
    gallery._pagination.addEventListener('keydown',e=>keyTrace.push({key:e.key,alt:e.altKey,ctrl:e.ctrlKey,meta:e.metaKey,prevented:e.defaultPrevented,target:gallery._firstFocusable(gallery.current)?.id}));
    gallery._dots[1].focus();
  });
  await api.key('ArrowRight');await api.wait(()=>gallery.current===2&&Math.abs(gallery._startDistance(gallery._slides[2]))<2);
  assert.deepEqual(await api.evaluate(()=>changes),[2]);
  await api.evaluate(()=>{window.forestSlide=gallery._slides[2];window.forestDot=gallery._dots[2];forestSlide.dataset.title='森林';gallery.prepend(forestSlide);gallery.refresh();});
  await api.wait(()=>gallery.current===0&&Math.abs(gallery._startDistance(gallery._slides[0]))<2);
  assert.equal(await api.evaluate(()=>gallery._dots[0]===forestDot&&gallery.shadowRoot.activeElement===forestDot&&forestDot.getAttribute('aria-label')==='森林, 1 of 3'),true);
  assert.deepEqual(await api.evaluate(()=>changes),[2]);
  await api.key('ArrowRight');await api.wait(()=>gallery.current===1&&Math.abs(gallery._startDistance(gallery._slides[1]))<2);
  await api.tab();assert.equal(await api.evaluate(()=>gallery.querySelector('#coast').matches(':focus')),true,JSON.stringify(await api.evaluate(()=>{
    const active=[];let el=document.activeElement;while(el){active.push(el.id||el.localName);el=el.shadowRoot?.activeElement;}
    return {active,current:gallery.current,trace:keyTrace};
  })));
  await api.evaluate(()=>gallery._nextBtn.focus());await api.key('Enter');
  await api.wait(()=>gallery.current===2&&Math.abs(gallery._startDistance(gallery._slides[2]))<2);
  await api.key('Enter');assert.deepEqual(await api.evaluate(()=>changes),[2,1,2]);
  assert.equal(await api.evaluate(()=>gallery.shadowRoot.activeElement===gallery._nextBtn&&gallery._nextBtn.getAttribute('aria-disabled')==='true'),true);
  await api.tab();assert.equal(await api.evaluate(()=>document.activeElement.id),'after');
  await api.evaluate(()=>{gallery.dir='rtl';gallery.current=0;gallery._dots[0].focus();});
  await api.wait(()=>gallery.current===0&&Math.abs(gallery._startDistance(gallery._slides[0]))<2);
  await api.key('ArrowLeft');await api.wait(()=>gallery.current===1&&Math.abs(gallery._startDistance(gallery._slides[1]))<2);
  // Generate an actual track scroll event, then wait for settled index detection.
  await api.evaluate(()=>gallery._track.scrollTo({left:0,behavior:'instant'}));
  await api.wait(()=>gallery.current===0&&Math.abs(gallery._startDistance(gallery._slides[0]))<2);
}
try{
  if(browsers.includes('chrome')){
    const browser=await chromium.launch({channel:'chrome',headless:true});
    try{
      const page=await browser.newPage({viewport:{width:1000,height:900}}),errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      for(const url of urls){
        await page.goto(url);await page.waitForFunction(ready);
        await scenario({evaluate:fn=>page.evaluate(fn),wait:fn=>page.waitForFunction(fn),key:k=>page.keyboard.press(k),tab:()=>page.keyboard.press('Tab')});
        const cdp=await page.context().newCDPSession(page),ax=await cdp.send('Accessibility.getFullAXTree');
        assert.ok(ax.nodes.find(n=>n.role?.value==='group'&&n.name?.value==='Destinations'));
        assert.ok(ax.nodes.find(n=>n.role?.value==='button'&&n.name?.value==='森林, 1 of 3'));
        for(const [width,count] of [[900,3],[650,2],[320,1]]){
          await page.evaluate(width=>gallery.style.width=width+'px',width);
          await page.waitForFunction(count=>gallery.visibleCount()===count,count);
          assert.equal(await page.evaluate(()=>{const c=gallery;return Math.abs(c._slides[0].getBoundingClientRect().width-(c._track.clientWidth-(c.visibleCount()-1)*16)/c.visibleCount())<2;}),true);
        }
        await page.setViewportSize({width:320,height:900});await page.evaluate(()=>{
          gallery.style.width='100%';for(let i=0;i<17;i++){const slide=document.createElement('article');slide.dataset.title='Extra '+i;slide.textContent='Content';gallery.append(slide);}gallery.refresh();gallery._dots[0].focus();
        });
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        assert.equal(await page.evaluate(()=>gallery._dots.every(d=>d.getBoundingClientRect().width>=24&&d.getBoundingClientRect().height>=24)),true);
        await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
        assert.equal(await page.evaluate(()=>getComputedStyle(gallery._dots[0]).outlineStyle),'solid');
        assert.equal(await page.evaluate(()=>getComputedStyle(gallery._dots[0]).borderTopStyle),'double');
        assert.equal(await page.evaluate(()=>getComputedStyle(gallery._track).scrollBehavior),'auto');
        await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
        console.log('Chrome '+url.split('/').at(-1)+' '+new URL(url).protocol+' PASS: keys, identity, RTL scroll, AX, responsive sizing, 20-dot reflow, forced colors');
        if(url===urls.at(-1)){const out=await mkdtemp(join(tmpdir(),'carousel-check-'));await page.screenshot({path:join(out,'carousel-narrow.png')});console.log('Screenshot: '+out);}
        await page.setViewportSize({width:1000,height:900});
      }
      assert.deepEqual(errors,[]);
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
        driver=await builder.build();const key=value=>driver.actions().sendKeys(value).perform();
        for(const url of urls){
          await driver.get(url);await driver.wait(()=>driver.executeScript(ready),5000);
          let optionTab=false;
          if(name==='safari'){
            await driver.executeScript('window.probe=document.createElement("div");probe.innerHTML="<button id=p1>First</button><button id=p2>Second</button>";document.body.append(probe);document.getElementById("p1").focus()');
            await key(webdriver.Key.TAB);optionTab=await driver.executeScript('return document.activeElement.id!=="p2"');
            if(optionTab){await driver.executeScript('document.getElementById("p1").focus()');await driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform();assert.equal(await driver.executeScript('return document.activeElement.id'),'p2');}
            await driver.executeScript('probe.remove()');
          }
          const keys={ArrowRight:webdriver.Key.ARROW_RIGHT,ArrowLeft:webdriver.Key.ARROW_LEFT,Enter:webdriver.Key.ENTER};
          await scenario({evaluate:fn=>driver.executeScript(fn),wait:fn=>driver.wait(()=>driver.executeScript(fn),5000),key:k=>key(keys[k]),tab:()=>optionTab?driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform():key(webdriver.Key.TAB)});
          const group=await driver.executeScript('return gallery._wrapper');assert.equal(await group.getAccessibleName(),'Destinations');
          const dot=await driver.executeScript('return gallery._dots[0]');assert.equal(await dot.getAccessibleName(),'森林, 1 of 3');
          console.log(name+' '+url.split('/').at(-1)+' '+new URL(url).protocol+' PASS: keys, identity, RTL scroll, names, '+(optionTab?'Option+Tab':'Tab'));
        }
      }finally{if(driver)await driver.quit();}
    }
  }
}finally{await new Promise(r=>server.close(r));}
