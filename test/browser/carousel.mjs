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
// ES module sources do not load from file:// URLs; the bundles are checked both ways.
const urls=['source','bundle','min'].flatMap(v=>{
  const path='test/browser/fixtures/carousel-'+v+'.html';
  return [`http://127.0.0.1:${server.address().port}/`+path,pathToFileURL(join(root,path)).href];
}).filter(url=>!(url.startsWith('file:')&&url.includes('-source.html')));
const ready=()=>window.gallery?._dots?.length===3&&gallery.current===1&&Math.abs(gallery._startDistance(gallery._slides[1]))<2;
async function scenario(api){
  // A timed-out wait says which step it was and what the track actually looked
  // like, so a CI failure does not need a local reproduction to interpret.
  const state=()=>({dir:gallery.dir,current:gallery.current,dots:gallery._dots.length,
    offsets:gallery._slides.map(s=>Math.round(gallery._startDistance(s))),
    scrollLeft:Math.round(gallery._track.scrollLeft),trackWidth:Math.round(gallery._track.clientWidth),
    visible:gallery.visibleCount(),
    // The component mirrors arrow keys on the track's computed direction, which
    // it inherits across the shadow boundary; report what it actually saw, and
    // whether the key reached the pagination at all.
    hostDir:getComputedStyle(gallery).direction,trackDir:getComputedStyle(gallery._track).direction,
    keys:(window.keyTrace||[]).slice(-3),changes:(window.changes||[]).slice(-6),rebuilds:window.rebuilds,settles:(window.settles||[]).slice(-4),
    // Scrolling is what moves `current`: the component scrolls and the settle
    // handler reads the index back, so report the room it had to scroll in.
    scroll:{width:Math.round(gallery._track.scrollWidth),client:Math.round(gallery._track.clientWidth),
      room:Math.round(gallery._track.scrollWidth-gallery._track.clientWidth),
      behavior:getComputedStyle(gallery._track).scrollBehavior,
      reduced:matchMedia('(prefers-reduced-motion: reduce)').matches},
    });
  const step=async(label,condition)=>{
    try{await api.wait(condition);}
    catch(error){throw new Error(`${label} — ${String(error.message).split('\n')[0]}\n  state: ${JSON.stringify(await api.evaluate(state))}`);}
  };
  await api.evaluate(()=>{
    const wrapper=document.createElement('div');gallery.before(wrapper);wrapper.attachShadow({mode:'open'}).append(document.getElementById('gallery-name'),gallery);
    for(let i=0;i<3;i++){gallery.remove();wrapper.shadowRoot.append(gallery);}
    window.changes=[];window.keyTrace=[];window.rebuilds=0;window.settles=[];
    const rebuild=gallery._rebuild.bind(gallery);gallery._rebuild=(...a)=>{window.rebuilds++;return rebuild(...a);};
    const settled=gallery._onSettled.bind(gallery);gallery._onSettled=(...a)=>{window.settles.push(Math.round(gallery._track.scrollLeft));return settled(...a);};
    gallery._pagination.addEventListener('keydown',e=>keyTrace.push({key:e.key,alt:e.altKey,ctrl:e.ctrlKey,meta:e.metaKey,prevented:e.defaultPrevented,target:gallery._firstFocusable(gallery.current)?.id,
      // Runs after the component's own handler: the direction it read and the
      // index it landed on, before any scroll settles.
      dirAfter:getComputedStyle(gallery._track).direction,currentAfter:gallery.current}));
    gallery._dots[1].focus();
  });
  await api.key('ArrowRight');await step('ArrowRight moves to slide 2',()=>gallery.current===2&&Math.abs(gallery._startDistance(gallery._slides[2]))<2);
  assert.deepEqual(await api.evaluate(()=>changes),[2]);
  await api.evaluate(()=>{window.forestSlide=gallery._slides[2];window.forestDot=gallery._dots[2];forestSlide.dataset.title='森林';gallery.prepend(forestSlide);gallery.refresh();});
  await step('prepended slide becomes current',()=>gallery.current===0&&Math.abs(gallery._startDistance(gallery._slides[0]))<2);
  assert.equal(await api.evaluate(()=>gallery._dots[0]===forestDot&&gallery.shadowRoot.activeElement===forestDot&&forestDot.getAttribute('aria-label')==='森林, 1 of 3'),true);
  assert.deepEqual(await api.evaluate(()=>changes),[2]);
  await api.key('ArrowRight');await step('ArrowRight moves to slide 1 after reorder',()=>gallery.current===1&&Math.abs(gallery._startDistance(gallery._slides[1]))<2);
  await api.tab();assert.equal(await api.evaluate(()=>gallery.querySelector('#coast').matches(':focus')),true,JSON.stringify(await api.evaluate(()=>{
    const active=[];let el=document.activeElement;while(el){active.push(el.id||el.localName);el=el.shadowRoot?.activeElement;}
    return {active,current:gallery.current,trace:keyTrace};
  })));
  await api.evaluate(()=>gallery._nextBtn.focus());await api.key('Enter');
  await step('Enter on the next button moves to slide 2',()=>gallery.current===2&&Math.abs(gallery._startDistance(gallery._slides[2]))<2);
  await api.key('Enter');assert.deepEqual(await api.evaluate(()=>changes),[2,1,2]);
  assert.equal(await api.evaluate(()=>gallery.shadowRoot.activeElement===gallery._nextBtn&&gallery._nextBtn.getAttribute('aria-disabled')==='true'),true);
  await api.tab();assert.equal(await api.evaluate(()=>document.activeElement.id),'after');
  await api.evaluate(()=>{gallery.dir='rtl';gallery.current=0;gallery._dots[0].focus();});
  // Switching direction re-lays out the scroll container. Wait for the RTL
  // geometry (slide 1 now sits to the left, and the track has room to scroll)
  // and for the position to stop changing; a key pressed before that scrolls
  // against a stale geometry, which the browser clamps back to the start.
  await step('RTL relayout settles on slide 0',()=>{const track=gallery._track,at=Math.round(track.scrollLeft);
    const stable=window.__lastScrollLeft===at;window.__lastScrollLeft=at;
    return stable&&gallery.current===0&&Math.abs(gallery._startDistance(gallery._slides[0]))<2
      &&track.scrollWidth-track.clientWidth>0&&gallery._startDistance(gallery._slides[1])<-1;});
  await api.key('ArrowLeft');await step('RTL ArrowLeft moves to slide 1',()=>gallery.current===1&&Math.abs(gallery._startDistance(gallery._slides[1]))<2);
  // Generate an actual track scroll event, then wait for settled index detection.
  await api.evaluate(()=>gallery._track.scrollTo({left:0,behavior:'instant'}));
  await step('track scrollTo settles back on slide 0',()=>gallery.current===0&&Math.abs(gallery._startDistance(gallery._slides[0]))<2);
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
          await driver.get(url);await driver.wait(()=>driver.executeScript(ready),5000,'initial slide state (dots, current, offset)');
          let optionTab=false;
          if(name==='safari'){
            await driver.executeScript('window.probe=document.createElement("div");probe.innerHTML="<button id=p1>First</button><button id=p2>Second</button>";document.body.append(probe);document.getElementById("p1").focus()');
            await key(webdriver.Key.TAB);optionTab=await driver.executeScript('return document.activeElement.id!=="p2"');
            if(optionTab){await driver.executeScript('document.getElementById("p1").focus()');await driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform();assert.equal(await driver.executeScript('return document.activeElement.id'),'p2');}
            await driver.executeScript('probe.remove()');
          }
          const keys={ArrowRight:webdriver.Key.ARROW_RIGHT,ArrowLeft:webdriver.Key.ARROW_LEFT,Enter:webdriver.Key.ENTER};
          await scenario({evaluate:fn=>driver.executeScript(fn),wait:fn=>driver.wait(()=>driver.executeScript(fn),5000,String(fn).replace(/\s+/g,' ').slice(0,160)),key:k=>key(keys[k]),tab:()=>optionTab?driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform():key(webdriver.Key.TAB)});
          const group=await driver.executeScript('return gallery._wrapper');assert.equal(await group.getAccessibleName(),'Destinations');
          const dot=await driver.executeScript('return gallery._dots[0]');assert.equal(await dot.getAccessibleName(),'森林, 1 of 3');
          console.log(name+' '+url.split('/').at(-1)+' '+new URL(url).protocol+' PASS: keys, identity, RTL scroll, names, '+(optionTab?'Option+Tab':'Tab'));
        }
      }finally{if(driver)await driver.quit();}
    }
  }
}finally{await new Promise(r=>server.close(r));}
