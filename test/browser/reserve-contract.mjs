// node test/browser/reserve-contract.mjs
// The README's :not(:defined) reservation CSS must reserve exactly the registered
// height of each default variant, at widths on both sides of au-input's 768px query.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {chromium} from '../ssr/node_modules/playwright/index.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const readme=await readFile(resolve(root,'README.md'),'utf8');
const css=readme.match(/<!-- reserve-css:[^>]*-->\s*```css\n([\s\S]*?)```/)?.[1];
assert.ok(css,'README reservation CSS block not found');
const body=`<au-input label="Name"></au-input>
<au-input label="Name" data-size="small"></au-input>
<au-input label="Name" data-size="large"></au-input>
<au-input label="Name" data-layout="vertical"></au-input>
<au-input label="Name" data-layout="vertical" data-size="small"></au-input>
<au-input label="Name" data-layout="vertical" data-size="large"></au-input>
<au-input label="Name" data-clear></au-input>
<au-textarea label="Comments"></au-textarea>
<au-file-upload name="files" label="Attachments"></au-file-upload>
<au-tree aria-label="Files" style="--tree-rows:2"></au-tree>
<script>document.querySelector('au-tree').data=[{id:'docs',label:'Docs',children:[{id:'guide',label:'Guide'}]},{id:'src',label:'Src'}];</script>`;
const server=createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/reserve.html'){
    res.setHeader('Content-Type','text/html');
    const script=url.searchParams.get('registered')==='1'?'<script src="/dist/accesserty-ui-kit.min.js"></script>':'';
    res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/src/css/au-style.css"><style>${css}</style>${script}<body style="margin:16px">${body}</body></html>`);
    return;
  }
  const file=resolve(root,'.'+url.pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript':extname(file)==='.css'?'text/css':'text/plain');
  res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  for(const width of [320,600,767,800,1280]){
    const page=await browser.newPage({viewport:{width,height:900}});
    const heights=async registered=>{
      await page.goto(`http://127.0.0.1:${server.address().port}/reserve.html?registered=${registered}`);
      await page.waitForFunction(r=>[...document.querySelectorAll('body > [label],body > au-tree')].every(e=>!!e.shadowRoot===r),registered===1);
      return page.evaluate(()=>[...document.querySelectorAll('body > [label],body > au-tree')].map(e=>({
        name:e.outerHTML.slice(0,e.outerHTML.indexOf('>')+1),height:Math.round(e.getBoundingClientRect().height*10)/10})));
    };
    const reserved=await heights(0),registered=await heights(1);
    registered.forEach((item,i)=>assert.ok(Math.abs(item.height-reserved[i].height)<=0.5,
      `${width}px ${item.name}: reserved ${reserved[i].height}px, registered ${item.height}px`));
    await page.close();
  }
  console.log('PASS README reservation CSS: 10 variants at 320/600/767/800/1280px reserve their registered heights');
}finally{await browser.close();server.close();}
