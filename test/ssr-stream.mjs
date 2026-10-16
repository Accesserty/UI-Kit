// node test/ssr-stream.mjs — withDeclarativeShadow() on real Node HTTP responses.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {injectDeclarativeShadow,withDeclarativeShadow} from '../src/ssr/inject.js';

const page=`<!doctype html><html lang="zh-Hant"><body><au-breadcrumbs aria-label="麵包屑" items='[{"text":"首頁","url":"/"},{"text":"文件"}]'></au-breadcrumbs>
<au-accordion><au-accordion-item open><span slot="heading">退貨</span><div slot="content">七天內</div></au-accordion-item></au-accordion></body></html>`;
const expected=injectDeclarativeShadow(page);
const bytes=Buffer.from(page);

const handlers={
  // Headers sent before the first chunk; chunks split tags and multi-byte characters.
  streamed:(req,res)=>{res.writeHead(200,{'content-type':'text/html; charset=utf-8'});
    let i=0;const next=()=>{if(i>=bytes.length)return res.end();const size=1+(i%7);res.write(bytes.subarray(i,i+=size));setImmediate(next);};next();},
  // Whole body with a content-length that the insertion would make wrong.
  whole:(req,res)=>{res.setHeader('content-type','text/html');res.setHeader('content-length',bytes.length);res.end(bytes);},
  // Strings and an end() callback.
  strings:(req,res)=>{res.setHeader('content-type','text/html');res.write(page.slice(0,40));res.end(page.slice(40),()=>{});},
  json:(req,res)=>{res.setHeader('content-type','application/json');res.end('{"tag":"<au-accordion>"}');},
};
const server=createServer(withDeclarativeShadow((req,res)=>{
  assert.equal(req.headers['accept-encoding'],undefined,'compression is disabled before the handler runs');
  handlers[req.url.slice(1)](req,res);
}));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=path=>`http://127.0.0.1:${server.address().port}/${path}`;
try{
  for(const name of ['streamed','whole','strings']){
    const response=await fetch(url(name),{headers:{'accept-encoding':'gzip'}});
    assert.equal(response.headers.get('content-encoding'),null,`${name}: not compressed`);
    assert.equal(await response.text(),expected,`${name}: same as injecting the whole page`);
  }
  assert.equal(await (await fetch(url('json'))).text(),'{"tag":"<au-accordion>"}','non-HTML passes through');
  console.log('PASS withDeclarativeShadow: streamed chunks splitting tags and characters, headers sent first, content-length, strings, non-HTML untouched');
}finally{server.close();}
