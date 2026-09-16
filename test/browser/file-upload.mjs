// node test/browser/file-upload.mjs [chrome|firefox|safari]
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
const paths=['upload-one.txt','upload-two.txt'].map(n=>join(root,'test/browser/fixtures',n));
const server=createServer(async(req,res)=>{try{
  const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',(extname(file)==='.js'?'text/javascript':'text/html')+'; charset=utf-8');res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const urls=['source','bundle','min'].flatMap(v=>{const path='test/browser/fixtures/file-upload-'+v+'.html';return ['http://127.0.0.1:'+server.address().port+'/'+path,pathToFileURL(join(root,path)).href];});
async function scenario(api){
  assert.equal(await api.evaluate(()=>window.consumerSentinel()),'consumer-owned');
  assert.equal(await api.evaluate(()=>!Object.hasOwn(u,'value')),true);
  await api.choose();
  assert.deepEqual(await api.evaluate(()=>events),['change']);
  assert.deepEqual(await api.evaluate(()=>new FormData(uploadForm).getAll('attachments').map(f=>[f.name,f.size])),[['upload-one.txt',6],['upload-two.txt',7]]);
  await api.evaluate(()=>document.getElementById('trigger').focus());await api.tab();
  assert.equal(await api.evaluate(()=>u.shadowRoot.activeElement?._file?.name),'upload-one.txt');
  assert.equal(await api.evaluate(()=>{window.firstRemove=u.shadowRoot.activeElement;u.setAttribute('msg-remove-text','刪除');u.setAttribute('name','documents');return u.shadowRoot.activeElement===firstRemove&&firstRemove.getAttribute('aria-label')==='刪除 upload-one.txt';}),true);
  await api.evaluate(()=>{fields.disabled=true;u.removeFile(u.value[0]);u.handleFiles([new File(['x'],'blocked.txt')]);});
  assert.deepEqual(await api.evaluate(()=>[u.value.length,u.fileInput.disabled,u.triggerArea.inert,new FormData(uploadForm).has('documents')]),[2,true,true,false]);
  await api.evaluate(()=>{fields.disabled=false;u.shadowRoot.querySelector('button.delete').focus();});
  await api.key('Space');assert.equal(await api.evaluate(()=>u.shadowRoot.activeElement?._file?.name),'upload-two.txt');
  await api.key('Enter');assert.equal(await api.evaluate(()=>document.activeElement.id),'trigger');
  assert.deepEqual(await api.evaluate(()=>events),['change','upload-one.txt','change','upload-two.txt','change']);
  assert.equal(await api.evaluate(()=>uploadForm.reportValidity()),false);
  assert.equal(await api.evaluate(()=>u.shadowRoot.activeElement===u.triggerArea),true);
  // Synthetic drop dispatch is separate from native input/filechooser evidence.
  await api.evaluate(()=>{const dt=new DataTransfer();dt.items.add(new File(['x'],'bad.jpg'));u.dropZone.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}));});
  assert.equal(await api.evaluate(()=>u.errorList.textContent.includes('not an accepted')),true);
  await api.evaluate(()=>{const dt=new DataTransfer();dt.items.add(new File(['ok'],'UPPER.TXT'));u.dropZone.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}));});
  assert.equal(await api.evaluate(()=>u.errorList.textContent),'');
  assert.equal(await api.evaluate(()=>new FormData(uploadForm).get('documents').name),'UPPER.TXT');
  assert.equal(await api.evaluate(()=>{const e=new Event('drop',{bubbles:true,cancelable:true});document.body.dispatchEvent(e);return e.defaultPrevented;}),false);
  await api.evaluate(()=>uploadForm.reset());assert.equal(await api.evaluate(()=>u.value.length),0);
  assert.equal(await api.evaluate(()=>events.length),6);
  assert.equal(await api.evaluate(()=>{const parent=u.parentElement;for(let i=0;i<3;i++){u.remove();parent.append(u);}u.value=[new File(['x'],'retained.txt')];const button=u.shadowRoot.querySelector('button.delete');button.focus();u.value=u.value;return u.shadowRoot.activeElement===button;}),true);
  await api.key('Enter');assert.equal(await api.evaluate(()=>events.length),8);
  assert.equal(await api.evaluate(()=>{u.value=[new File(['x'],'long-name'.repeat(25)+'.txt')];u.dir='rtl';return document.documentElement.scrollWidth<=innerWidth;}),true);
}
try{
  if(browsers.includes('chrome')){
    const browser=await chromium.launch({channel:'chrome',headless:true});
    try{
      const page=await browser.newPage({viewport:{width:320,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
      for(const url of urls){
        await page.goto(url);await page.waitForFunction(()=>window.u?.fileInput);
        if(!url.includes('-source.html')){
          assert.equal(await page.evaluate(async()=>{
            const names=['au-accordion','au-accordion-item','au-breadcrumbs','au-card','au-carousel','au-checkbox','au-dropdown','au-dropdown-item','au-file-upload','au-input','au-pagination','au-radio-group','au-rating','au-switch','au-tabs','au-textarea','au-tree','au-tree-node'];
            const constructors=names.map(name=>customElements.get(name));
            const src=document.querySelector('script[src]').src;
            await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script);});
            if(location.protocol==='http:')await import(src);
            return constructors.every((constructor,i)=>constructor&&constructor===customElements.get(names[i]))&&window.consumerSentinel()==='consumer-owned';
          }),true);
        }
        await scenario({evaluate:fn=>page.evaluate(fn),tab:()=>page.keyboard.press('Tab'),key:k=>page.keyboard.press(k),choose:async()=>{await page.locator('#trigger').focus();const p=page.waitForEvent('filechooser');await page.keyboard.press('Enter');await (await p).setFiles(paths);}});
        const cdp=await page.context().newCDPSession(page),ax=await cdp.send('Accessibility.getFullAXTree');
        assert.ok(ax.nodes.some(n=>n.role?.value==='group'&&n.name?.value==='Attachments'));
        assert.ok(ax.nodes.some(n=>n.role?.value==='button'&&n.name?.value==='Default picker'));
        await page.locator('au-file-upload button.delete').focus();await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
        assert.equal(await page.evaluate(()=>{const s=getComputedStyle(u.shadowRoot.activeElement);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2&&s.transitionDuration==='0s';}),true);
        await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
        await page.locator('#fallback .default-trigger').focus();
        const fallbackChooser=page.waitForEvent('filechooser');await page.keyboard.press('Space');await (await fallbackChooser).setFiles(paths.slice(0,1));
        assert.equal(await page.locator('au-file-upload#fallback').evaluate(el=>el.value[0]?.name),'upload-one.txt');
        console.log('Chrome '+url+' PASS: real Enter filechooser, File submission, fieldset, stable focus, reset, synthetic drop, AX, narrow RTL');
      }
      const output=await mkdtemp(join(tmpdir(),'upload-check-'));await page.screenshot({path:join(output,'upload-narrow.png')});console.log('Screenshot: '+output);assert.deepEqual(errors,[]);
    }finally{await browser.close();}
  }
  if(browsers.some(n=>n!=='chrome')){
    assert.ok(process.env.UI_KIT_WEBDRIVER_MODULE);
    const moduleURL=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE),{default:webdriver}=await import(moduleURL.href),{default:firefox}=await import(new URL('./firefox.js',moduleURL).href);
    for(const name of browsers.filter(n=>n!=='chrome')){
      let driver;
      try{
        let builder=new webdriver.Builder().forBrowser(name);if(name==='firefox')builder=builder.setFirefoxOptions(new firefox.Options().addArguments('-headless'));
        driver=await builder.build();await driver.manage().window().setRect({width:420,height:900});
        const key=k=>driver.actions().sendKeys(k==='Space'?webdriver.Key.SPACE:k==='Enter'?webdriver.Key.ENTER:k).perform();
        for(const url of urls){
          await driver.get(url);await driver.wait(()=>driver.executeScript('return !!window.u?.fileInput'),4000);
          let optionTab=false,selection='native input sendKeys';
          if(name==='safari'){
            await driver.executeScript(()=>{window.probe=document.createElement('div');probe.innerHTML='<button id="p1">First</button><button id="p2">Second</button>';document.body.append(probe);document.getElementById('p1').focus();});
            await key(webdriver.Key.TAB);optionTab=await driver.executeScript('return document.activeElement.id!=="p2"');
            if(optionTab){await driver.executeScript('document.getElementById("p1").focus()');await driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform();assert.equal(await driver.executeScript('return document.activeElement.id'),'p2');}
            await driver.executeScript('probe.remove()');
          }
          await scenario({evaluate:fn=>driver.executeScript(fn),key,tab:()=>optionTab?driver.actions().keyDown(webdriver.Key.ALT).sendKeys(webdriver.Key.TAB).keyUp(webdriver.Key.ALT).perform():key(webdriver.Key.TAB),choose:async()=>{
            const input=await driver.executeScript('return u.fileInput');
            try {await input.sendKeys(paths.join('\n'));}
            catch(error){
              if(name!=='safari'||!['UnsupportedOperationError','ElementNotInteractableError','InvalidArgumentError'].includes(error.name))throw error;
              selection='synthetic input change (Safari driver file selection unavailable)';
              await driver.executeScript(()=>{const dt=new DataTransfer();dt.items.add(new File(['first\n'],'upload-one.txt',{type:'text/plain'}));dt.items.add(new File(['second\n'],'upload-two.txt',{type:'text/plain'}));u.fileInput.files=dt.files;u.fileInput.dispatchEvent(new Event('change',{bubbles:true}));});
            }
          }});
          console.log(name+' '+url+' PASS: '+selection+', '+(optionTab?'Option+Tab':'Tab')+', native remove keys, form/fieldset/reset, synthetic drop');
        }
      }finally{if(driver)await driver.quit();}
    }
  }
}finally{await new Promise(r=>server.close(r));}
