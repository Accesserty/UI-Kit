// Actual shared CSS values in installed browsers. Not screen-reader or OS contrast QA.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const browsers=process.argv[2]?[process.argv[2]]:['chrome','firefox','safari'];
assert.ok(browsers.every(b=>['chrome','firefox','safari'].includes(b)));
const server=createServer(async(req,res)=>{try{
  const file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',(extname(file)==='.css'?'text/css':'text/html')+'; charset=utf-8');
  res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const fixture='test/browser/fixtures/css-contract.html';
const urls=[pathToFileURL(resolve(root,fixture)).href,`http://127.0.0.1:${server.address().port}/${fixture}`];
const snapshot=()=>{
  const rgb=color=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
  const panel=document.getElementById('panel');panel.showPopover();
  const style=getComputedStyle(panel);
  const defaults={bg:rgb(style.backgroundColor),fg:rgb(style.color)};
  panel.style.setProperty('--au-popover-bg','0 0 0');
  panel.style.setProperty('--au-popover-text-color','1 0 0');
  panel.style.setProperty('--au-popover-border-color','1 0 0');
  const custom={bg:rgb(style.backgroundColor),fg:rgb(style.color),border:rgb(style.borderTopColor)};
  return {black:rgb(getComputedStyle(document.getElementById('black')).color),white:rgb(getComputedStyle(document.getElementById('white')).color),focus:rgb(getComputedStyle(document.getElementById('focus-color')).color),placeholder:rgb(getComputedStyle(document.getElementById('placeholder-color')).color),defaults,custom,
    fallback:!CSS.supports('selector(::picker-icon)'),
    selects:['ltr','rtl','auto'].map(id=>{const c=getComputedStyle(document.getElementById(id));return {id,direction:c.direction,x:c.backgroundPositionX,image:c.backgroundImage,start:parseFloat(c.paddingInlineStart),end:parseFloat(c.paddingInlineEnd)};})};
};
const luminance=rgb=>rgb.slice(0,3).map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i],0);
try{
  for(const name of browsers){let browser,driver;
    try{
      let goto,evaluate,page;
      if(name==='chrome'){browser=await chromium.launch({channel:'chrome',headless:true});page=await browser.newPage();goto=url=>page.goto(url);evaluate=fn=>page.evaluate(fn);}
      else{assert.ok(process.env.UI_KIT_WEBDRIVER_MODULE,'Set UI_KIT_WEBDRIVER_MODULE');const url=pathToFileURL(process.env.UI_KIT_WEBDRIVER_MODULE);const {default:w}=await import(url.href),{default:f}=await import(new URL('./firefox.js',url).href);let builder=new w.Builder().forBrowser(name);if(name==='firefox')builder=builder.setFirefoxOptions(new f.Options().addArguments('-headless'));driver=await builder.build();goto=url=>driver.get(url);evaluate=fn=>driver.executeScript(fn);}
      for(const url of urls){await goto(url);const s=await evaluate(snapshot);
        assert.deepEqual(s.black,[0,0,0,255],'pure-black must render black');
        assert.deepEqual(s.white,[255,255,255,255],'pure-white must render white');
        assert.ok(1.05/(luminance(s.focus)+0.05)>=3,'focus token against white');
        assert.ok(1.05/(luminance(s.placeholder)+0.05)>=4.5,'placeholder token against white');
        assert.equal(s.defaults.bg[3],255);assert.equal(s.defaults.fg[3],255);
        assert.ok((luminance(s.defaults.bg)+0.05)/(luminance(s.defaults.fg)+0.05)>=4.5,'default popover text contrast');
        assert.deepEqual(s.custom,{bg:[0,0,0,255],fg:[255,255,255,255],border:[255,255,255,255]});
        assert.deepEqual(s.selects.map(s=>s.direction),['ltr','rtl','rtl']);
        if(s.fallback){const [ltr,rtl,auto]=s.selects;assert.notEqual(ltr.image,'none');assert.ok(ltr.end>ltr.start,JSON.stringify(s.selects));assert.ok(rtl.end>rtl.start,JSON.stringify(s.selects));assert.notEqual(ltr.x,rtl.x);assert.equal(rtl.x,auto.x);}
        if(page && await page.evaluate(()=>CSS.supports('appearance','base-select'))){
          await page.evaluate(()=>document.getElementById('panel').hidePopover());
          await page.locator('#ltr').focus();
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('ArrowDown');
          const focus=await page.locator('#ltr').evaluate(select=>{
            const option=select.querySelector('option:focus-visible');
            if(!option)return null;
            const c=getComputedStyle(option);
            const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
            ctx.fillStyle=c.outlineColor;ctx.fillRect(0,0,1,1);
            return {index:option.index,selected:select.selectedIndex,style:c.outlineStyle,width:parseFloat(c.outlineWidth),color:[...ctx.getImageData(0,0,1,1).data]};
          });
          assert.ok(focus,'keyboard focus must reach a picker option');
          assert.equal(focus.index,1);assert.equal(focus.selected,0,'navigation must not commit selection');
          assert.equal(focus.style,'solid');assert.ok(focus.width>=2);
          // The default focused-row background is neutral OKLCH L=.9466.
          assert.ok((0.9466**3+0.05)/(luminance(focus.color)+0.05)>=3,'option outline against row background');
          await page.keyboard.press('Enter');
          assert.equal(await page.locator('#ltr').evaluate(el=>el.selectedIndex),1);
        }
        console.log(`${name} PASS ${url}: token RGB, default popover contrast, channel overrides; select ${s.fallback?'RTL fallback':'native picker (fallback not exercised)'}`);
      }
    }finally{await browser?.close();await driver?.quit();}
  }
}finally{await new Promise(r=>server.close(r));}
