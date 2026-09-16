// Real keyboard matrix for the seven controls without standalone runners.
// Usage: node test/browser/controls.mjs [chrome|firefox|safari]
// This tests targeted interactions, not speech, IME, autofill or full WCAG.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,extname} from 'node:path';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const browsers=process.argv[2]?[process.argv[2]]:['chrome','firefox','safari'];
assert.ok(browsers.every(x=>['chrome','firefox','safari'].includes(x)));
const server=createServer(async(req,res)=>{
  try {
    const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
    if(!file.startsWith(root)){res.writeHead(403).end();return;}
    res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
    res.end(await readFile(file));
  }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const fixture='test/browser/fixtures/controls.html';
const urls=[pathToFileURL(resolve(root,fixture)).href,`http://127.0.0.1:${server.address().port}/${fixture}`].flatMap(url=>['source','bundle','min'].map(mode=>url+'?mode='+mode));
async function verify(api,url,name){
  const {evaluate:e,key,wait}=api;
  await api.goto(url);
  await wait(()=>['text','notes','check','toggle','radio','rating','tabs'].every(id=>document.getElementById(id).shadowRoot?.querySelector('input,textarea,[role=tab]')));
  await e(()=>{
    window.controls=Object.fromEntries(['text','notes','check','toggle','radio','rating','tabs'].map(id=>[id,document.getElementById(id)]));
    window.events={};
    for(const [id,el] of Object.entries(controls)){
      events[id]=[];
      el.addEventListener(id==='tabs'?'tab-change':'change',event=>events[id].push(event.detail));
    }
  });
  let optionTab=false;
  if(name==='safari'){
    await e(()=>{window.probe=document.createElement('div');probe.innerHTML='<button id="p1">One</button><button id="p2">Two</button>';document.body.append(probe);document.getElementById('p1').focus();});
    await key('Tab');optionTab=await e(()=>document.activeElement.id!=='p2');
    if(optionTab){await e(()=>document.getElementById('p1').focus());await key('Alt+Tab');assert.equal(await e(()=>document.activeElement.id),'p2');}
    await e(()=>probe.remove());
  }
  const tab=()=>key(optionTab?'Alt+Tab':'Tab');
  for(const id of ['text','notes']){
    await e(id=>{window.current=controls[id];current.shadowRoot.querySelector('input,textarea').focus();},id);
    await api.type('Hello');
    if(id==='notes'){await key('Enter');await api.type('World');}
    const expected=id==='notes'?'Hello\nWorld':'Hello';
    assert.equal(await e(()=>current.value),expected);
    assert.equal(await e(()=>new FormData(document.getElementById('form')).get(current.getAttribute('name'))),expected);
    await e(()=>{window.controlNode=current.shadowRoot.activeElement;current.setAttribute('label','Translated');});
    await wait(()=>current.shadowRoot.activeElement===controlNode);
    await tab();assert.equal(await e(()=>document.activeElement.id),id==='text'?'after-input':'after-notes');
    console.log(`${name} ${id} PASS: typing, FormData, translated focus, Tab exit`);
  }
  for(const [id,before,after] of [['check','before-check','after-check'],['toggle','before-switch','after-switch']]){
    await e(id=>document.getElementById(id).focus(),before);await tab();
    assert.equal(await e(id=>document.activeElement===controls[id]&&controls[id].shadowRoot.activeElement?.tagName==='INPUT',id),true);
    await key('Space');
    assert.deepEqual(await e(id=>({checked:controls[id].checked,count:events[id].length,value:new FormData(document.getElementById('form')).get(id)}),id),{checked:true,count:1,value:'on'});
    await e(id=>{window.current=controls[id];window.controlNode=current.shadowRoot.activeElement;current.setAttribute('label','Translated');},id);
    await wait(()=>current.shadowRoot.activeElement===controlNode);
    await key('Space');assert.equal(await e(id=>events[id].length,id),2);
    assert.equal(await e(id=>new FormData(document.getElementById('form')).has(id),id),false);
    await tab();assert.equal(await e(()=>document.activeElement.id),after);
    console.log(`${name} ${id} PASS: Tab entry/exit, Space, exact events, FormData, translated focus`);
  }
  await e(()=>document.getElementById('before-radio').focus());await tab();await key('ArrowRight');
  assert.deepEqual(await e(()=>({value:controls.radio.value,count:events.radio.length,submitted:new FormData(document.getElementById('form')).get('delivery')})),{value:'c',count:1,submitted:'c'});
  await e(()=>{window.radioNode=controls.radio.shadowRoot.activeElement;controls.radio.lastElementChild.setAttribute('label','Translated express');});
  await wait(()=>controls.radio.shadowRoot.activeElement===radioNode&&radioNode.labels[0].textContent.includes('Translated express'));
  await key('ArrowRight');assert.equal(await e(()=>controls.radio.value),'a');await tab();assert.equal(await e(()=>document.activeElement.id),'after-radio');
  console.log(`${name} radio PASS: disabled skip, wrapping, FormData, events, translation, Tab`);
  await e(()=>document.getElementById('before-rating').focus());await tab();await key('ArrowRight');
  assert.deepEqual(await e(()=>({value:controls.rating.value,count:events.rating.length,submitted:new FormData(document.getElementById('form')).get('rating')})),{value:3,count:1,submitted:'3'});
  await tab();assert.equal(await e(()=>document.activeElement.id),'after-rating');
  console.log(`${name} rating PASS: selected Tab entry, arrow selection, exact event, FormData, Tab exit`);
  await e(()=>document.getElementById('fields').disabled=true);
  assert.deepEqual(await e(()=>Array.from(new FormData(document.getElementById('form')).entries())),[]);
  await e(()=>document.getElementById('reset').focus());
  await e(()=>document.getElementById('fields').disabled=false);
  await key('Enter');
  assert.deepEqual(await e(()=>({text:controls.text.value,notes:controls.notes.value,check:controls.check.checked,toggle:controls.toggle.checked,radio:controls.radio.value,rating:controls.rating.value})),{text:'',notes:'',check:false,toggle:false,radio:'a',rating:2});
  await e(()=>document.getElementById('before-tabs').focus());await tab();await key('ArrowRight');
  assert.deepEqual(await e(()=>({index:controls.tabs.selectedIndex,count:events.tabs.length,selected:controls.tabs.shadowRoot.activeElement.getAttribute('aria-selected')})),{index:1,count:1,selected:'true'});
  await e(()=>{window.tabNode=controls.tabs.shadowRoot.activeElement;controls.tabs.lastElementChild.setAttribute('label','Translated second');});
  await wait(()=>controls.tabs.shadowRoot.activeElement===tabNode&&tabNode.textContent.includes('Translated second'));
  await tab();assert.equal(await e(()=>document.activeElement===controls.tabs.lastElementChild),true);
  await tab();assert.equal(await e(()=>document.activeElement.id),'after-tabs');
  console.log(`${name} tabs PASS: arrows, selection event/state, translated focus, active panel Tab, exit`);
  await e(()=>{document.documentElement.dir='rtl';controls.tabs.selectedIndex=0;controls.tabs.shadowRoot.querySelector('[role=tab]').focus();});
  await key('ArrowLeft');assert.equal(await e(()=>controls.tabs.selectedIndex),1);
  await key('ArrowRight');assert.equal(await e(()=>controls.tabs.selectedIndex),0);
  await e(()=>{controls.rating.value=2;controls.rating.focus();});
  await key('ArrowLeft');assert.equal(await e(()=>controls.rating.value),3);
  await key('ArrowRight');assert.equal(await e(()=>controls.rating.value),2);
  await key('ArrowDown');assert.equal(await e(()=>controls.rating.value),3);
  await e(()=>document.documentElement.dir='ltr');
  await key('ArrowRight');assert.equal(await e(()=>controls.rating.value),4);
  console.log(`${name} RTL PASS: tabs and rating visual horizontal keys, unchanged vertical keys and dynamic direction`);
  console.log(`${name} PASS ${url}: seven targeted controls; native reset/disabled FormData. No speech assertion.`);
}
try{
  for(const name of browsers){
    let browser,driver;
    try{
      let api;
      if(name==='chrome'){
        browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();
        api={goto:url=>page.goto(url),evaluate:(fn,arg)=>page.evaluate(fn,arg),wait:fn=>page.waitForFunction(fn),key:k=>page.keyboard.press(k==='Space'?' ':k),type:t=>page.keyboard.type(t)};
      }else{
        assert.ok(process.env.UI_KIT_WEBDRIVER_MODULE,'Set UI_KIT_WEBDRIVER_MODULE');
        const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE);
        const {default:w}=await import(moduleURL.href),{default:f}=await import(new URL('./firefox.js',moduleURL).href);
        let builder=new w.Builder().forBrowser(name);if(name==='firefox')builder=builder.setFirefoxOptions(new f.Options().addArguments('-headless'));
        driver=await builder.build();
        api={goto:url=>driver.get(url),evaluate:(fn,arg)=>driver.executeScript(fn,arg),wait:fn=>driver.wait(()=>driver.executeScript(fn),5000),type:t=>driver.actions().sendKeys(t).perform(),key:k=>k==='Alt+Tab'?driver.actions().keyDown(w.Key.ALT).sendKeys(w.Key.TAB).keyUp(w.Key.ALT).perform():driver.actions().sendKeys(({Tab:w.Key.TAB,Enter:w.Key.ENTER,Space:w.Key.SPACE,ArrowRight:w.Key.ARROW_RIGHT,ArrowLeft:w.Key.ARROW_LEFT,ArrowDown:w.Key.ARROW_DOWN})[k]).perform()};
      }
      for(const url of urls)await verify(api,url,name);
    }finally{await browser?.close();await driver?.quit();}
  }
}finally{await new Promise(r=>server.close(r));}
