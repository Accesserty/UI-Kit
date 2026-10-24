// node test/browser/form-registration.mjs [chrome|firefox|safari]
// The event registration case (demo/form-registration.html) end to end with
// the keyboard: invalid submit focuses the error summary, every summary link
// focuses the real control, corrections update the summary without moving
// focus, a valid submit announces success without losing focus, and reset
// clears what the application added. Chrome also checks the accessibility
// tree and a 320px viewport. Firefox/Safari need UI_KIT_WEBDRIVER_MODULE
// pointing to selenium-webdriver/index.js. Rebuild dist before running.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,extname} from 'node:path';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const browsers=process.argv[2]?[process.argv[2]]:['chrome','firefox','safari'];
assert.ok(browsers.every(n=>['chrome','firefox','safari'].includes(n)));
const TYPES={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const server=createServer(async(req,res)=>{try{
  const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',(TYPES[extname(file)]||'text/plain')+'; charset=utf-8');
  res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const urls=[`http://127.0.0.1:${server.address().port}/demo/form-registration.html`,pathToFileURL(resolve(root,'demo/form-registration.html')).href];

// Browser-side helpers, installed once per page load.
const helpers=()=>{
  window.deep=()=>{let el=document.activeElement;while(el?.shadowRoot?.activeElement)el=el.shadowRoot.activeElement;return el;};
  window.inside=id=>{const host=document.getElementById(id),el=deep();return !!el&&(el===host||host.contains(el)||!!host.shadowRoot?.contains(el));};
  window.errorText=id=>document.getElementById(id+'-error').textContent;
  window.summaryLinks=()=>document.getElementById('error-summary').hidden?[]:[...document.querySelectorAll('#error-summary-list a')].map(a=>a.textContent);
};
const FIELDS=['reg-name','reg-email','reg-meal','reg-terms'];

// Poll a browser-side condition (the success message is written after a short delay).
async function until(api,condition,label,timeout=2000){
  for(const end=Date.now()+timeout;Date.now()<end;await new Promise(r=>setTimeout(r,100)))if(await api.evaluate(condition))return;
  assert.fail('timed out: '+label);
}

async function scenario(api){
  await api.evaluate(helpers);
  // The status region must already be rendered while empty: Safari+VoiceOver
  // does not announce a role=status element that appears together with its text.
  assert.notEqual(await api.evaluate(()=>getComputedStyle(document.getElementById('form-status')).display),'none');
  // Invalid submit: focus moves to the summary, which lists all four fields.
  await api.evaluate(()=>document.querySelector('button[type=submit]').focus());
  await api.key('Enter');
  assert.equal(await api.evaluate(()=>document.activeElement.id),'error-summary');
  assert.equal((await api.evaluate(()=>summaryLinks())).length,4);
  for(const id of FIELDS)assert.ok(await api.evaluate(`return document.getElementById('${id}').getAttribute('aria-invalid')==='true'&&!!errorText('${id}')`),`${id} flagged`);
  // Every summary link puts focus on the real control inside the component.
  for(const [index,id] of FIELDS.entries()){
    await api.evaluate(`document.querySelectorAll('#error-summary-list a')[${index}].focus()`);
    await api.key('Enter');
    assert.ok(await api.evaluate(`return inside('${id}')&&['INPUT','TEXTAREA'].includes(deep().tagName)`),`summary link ${index} focuses ${id}`);
  }
  // Correcting the name clears its error and updates the summary; focus stays in the form.
  await api.evaluate(()=>document.getElementById('reg-name').focus());
  await api.type('Wang');
  await api.tab();
  assert.equal(await api.evaluate(()=>document.getElementById('reg-name').getAttribute('aria-invalid')),null);
  assert.equal(await api.evaluate(()=>errorText('reg-name')),'');
  assert.equal((await api.evaluate(()=>summaryLinks())).length,3);
  assert.equal(await api.evaluate(()=>inside('reg-email')),true,'Tab after the name goes to the email field, not to the summary');
  // A malformed email gets the format message.
  await api.type('ming');
  await api.tab();
  assert.match(await api.evaluate(()=>errorText('reg-email')),/correct format/);
  await api.evaluate(()=>{const el=document.getElementById('reg-email');el.value='ming@example.com';el.dispatchEvent(new Event('change',{bubbles:true}));});
  assert.equal(await api.evaluate(()=>errorText('reg-email')),'');
  // Meal and terms with the keyboard.
  await api.evaluate(()=>document.getElementById('reg-meal').focus());
  await api.key('Space');
  assert.equal(await api.evaluate(()=>document.getElementById('reg-meal').value),'regular');
  await api.evaluate(()=>document.getElementById('reg-terms').focus());
  await api.key('Space');
  assert.equal(await api.evaluate(()=>document.getElementById('reg-terms').checked),true);
  assert.deepEqual(await api.evaluate(()=>summaryLinks()),[],'summary closes once everything is fixed');
  // Valid submit: success in the status region, focus stays on the button.
  await api.evaluate(()=>document.querySelector('button[type=submit]').focus());
  await api.key('Enter');
  await until(api,'return /Registration complete/.test(document.getElementById("form-status").textContent)','success message');
  assert.equal(await api.evaluate(()=>document.activeElement.type),'submit');
  assert.equal(await api.evaluate(()=>{const data=new FormData(document.getElementById('registration'));return [data.get('name'),data.get('email'),data.get('meal'),data.get('terms')].join('|');}),'Wang|ming@example.com|regular|agreed');
  // Reset restores the components and clears everything the application added.
  await api.evaluate(()=>document.querySelector('button[type=reset]').focus());
  await api.key('Enter');
  assert.deepEqual(await api.evaluate(()=>({
    name:document.getElementById('reg-name').value,meal:document.getElementById('reg-meal').value,terms:document.getElementById('reg-terms').checked,
    status:document.getElementById('form-status').textContent,summary:document.getElementById('error-summary').hidden,result:document.getElementById('form-result').hidden,
    flagged:[...document.querySelectorAll('[aria-invalid]')].length,
  })),{name:'',meal:null,terms:false,status:'',summary:true,result:true,flagged:0});
}

try{
  if(browsers.includes('chrome')){
    const browser=await chromium.launch({channel:'chrome',headless:true});
    try{
      for(const url of urls){
        const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
        await page.goto(url);await page.waitForFunction(()=>!!document.querySelector('au-input')?.shadowRoot?.querySelector('input'));
        // Accessibility tree after an invalid submit: names, required, invalid and the error as description.
        await page.locator('button[type=submit]').click();
        const cdp=await page.context().newCDPSession(page),{nodes}=await cdp.send('Accessibility.getFullAXTree');
        const prop=(n,name)=>n.properties?.find(p=>p.name===name)?.value?.value;
        for(const [role,name,error] of [['textbox','Name (required)','Enter your name.'],['textbox','Email (required)','Enter your email address.'],['radiogroup','Meal (required)','Choose a meal.'],['checkbox','I agree to the event terms (required)','Agree to the event terms to register.']]){
          const node=nodes.find(n=>!n.ignored&&n.role?.value===role&&n.name?.value===name);
          assert.ok(node,`${role} ${name}`);
          assert.equal(node.description?.value,error,`${name} description`);
          assert.equal(String(prop(node,'invalid')),'true',`${name} invalid`);
          if(role!=='checkbox')assert.equal(prop(node,'required'),true,`${name} required`);
        }
        await cdp.detach();
        await page.reload();await page.waitForFunction(()=>!!document.querySelector('au-input')?.shadowRoot?.querySelector('input'));
        await scenario({evaluate:fn=>page.evaluate(typeof fn==='string'?new Function(fn):fn),tab:()=>page.keyboard.press('Tab'),key:k=>page.keyboard.press(k),type:t=>page.keyboard.type(t)});
        await page.setViewportSize({width:320,height:900});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'320px without horizontal scroll');
        assert.deepEqual(errors,[]);
        await page.close();
        console.log('Chrome '+new URL(url).protocol+' PASS: AX names/required/invalid/descriptions, summary focus and links, live correction, success without focus loss, reset, 320px');
      }
    }finally{await browser.close();}
  }
  if(browsers.some(n=>n!=='chrome')){
    assert.ok(process.env.UI_KIT_WEBDRIVER_MODULE,'Set UI_KIT_WEBDRIVER_MODULE for Firefox/Safari');
    const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE),{default:webdriver}=await import(moduleURL.href),{default:firefox}=await import(new URL('./firefox.js',moduleURL).href);
    for(const name of browsers.filter(n=>n!=='chrome')){
      let driver;
      try{
        let builder=new webdriver.Builder().forBrowser(name);if(name==='firefox')builder=builder.setFirefoxOptions(new firefox.Options().addArguments('-headless'));
        driver=await builder.build();
        const send=value=>driver.actions().sendKeys(value).perform();
        // Safari moves Tab between controls only with Option+Tab unless the user changed that setting.
        let optionTab=false;
        const keys={Enter:webdriver.Key.ENTER,Space:webdriver.Key.SPACE};
        for(const url of urls){
          await driver.get(url);await driver.wait(()=>driver.executeScript('return !!document.querySelector("au-input")?.shadowRoot?.querySelector("input")'),3000);
          if(name==='safari'){
            await driver.executeScript('window.probe=document.createElement("div");probe.innerHTML="<input id=p1><button id=p2>Second</button>";document.body.prepend(probe);document.getElementById("p1").focus()');
            await send(webdriver.Key.TAB);optionTab=await driver.executeScript('return document.activeElement.id!=="p2"');
            await driver.executeScript('probe.remove()');
          }
          await scenario({
            evaluate:fn=>driver.executeScript(fn),key:k=>send(keys[k]??k),type:t=>send(t),
            tab:()=>optionTab?driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform():send(webdriver.Key.TAB),
          });
          console.log(name+' '+new URL(url).protocol+' PASS: summary focus and links, live correction, success without focus loss, reset, '+(optionTab?'Option+Tab':'Tab'));
        }
      }finally{if(driver)await driver.quit();}
    }
  }
}finally{await new Promise(r=>server.close(r));}
