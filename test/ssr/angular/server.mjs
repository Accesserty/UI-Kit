import '@angular/compiler';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {renderApplication,provideServerRendering} from '@angular/platform-server';
import {bootstrapApplication} from '@angular/platform-browser';
import {App,providers} from './app.mjs';
await build({entryPoints:[new URL('./client.mjs',import.meta.url).pathname],bundle:true,format:'iife',outfile:new URL('./client.bundle.js',import.meta.url).pathname,define:{'process.env.NODE_ENV':'"development"'}});
const server=createServer(async(req,res)=>{try{
 if(req.url==='/client.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(await readFile(new URL('./client.bundle.js',import.meta.url)));return;}
 const html=await renderApplication(context=>bootstrapApplication(App,{providers:[...providers,provideServerRendering()]},context),{document:'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Angular SSR</title></head><body><test-app></test-app><script src="/client.js" defer></script></body></html>',url:'http://127.0.0.1:41793/',allowedHosts:['127.0.0.1']});
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
}catch(e){console.error(e);res.statusCode=500;res.end(String(e));}});
server.listen(41793,'127.0.0.1',()=>console.log('Angular SSR http://127.0.0.1:41793'));
