import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const env={...process.env,NEXT_TELEMETRY_DISABLED:'1',NUXT_TELEMETRY_DISABLED:'1'};
const children=[];
function launch(args,cwd=root,extraEnv={}) {
  const child=spawn(process.execPath,args,{cwd,env:{...env,...extraEnv},stdio:'inherit'});
  children.push(child);return child;
}
function finished(child) {
  return new Promise((resolve,reject)=>{
    child.once('error',reject);
    child.once('exit',(code,signal)=>code===0?resolve():reject(new Error(`Command failed: ${code ?? signal}`)));
  });
}
async function checkPort(port) {
  const server=createServer();
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  await new Promise(resolve=>server.close(resolve));
}
async function ready(port,child) {
  const deadline=Date.now()+30000;
  while(Date.now()<deadline) {
    if(child.exitCode!==null)throw new Error(`Server on ${port} exited`);
    try {const response=await fetch(`http://127.0.0.1:${port}`,{signal:AbortSignal.timeout(2000)});await response.arrayBuffer();if(response.ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  throw new Error(`Server on ${port} did not become ready`);
}
function cleanup(){for(const child of children)if(child.exitCode===null)child.kill('SIGTERM');}
process.once('SIGINT',()=>{cleanup();process.exit(130);});
process.once('SIGTERM',()=>{cleanup();process.exit(143);});
try {
  for(const port of [41791,41792,41793])await checkPort(port);
  console.log('Building Next and Nuxt production SSR fixtures');
  await finished(launch([`${root}node_modules/next/dist/bin/next`,'build','--webpack'],`${root}next`));
  await finished(launch([`${root}node_modules/nuxt/bin/nuxt.mjs`,'build'],`${root}nuxt`));
  const next=launch([`${root}node_modules/next/dist/bin/next`,'start','--hostname','127.0.0.1','--port','41791'],`${root}next`);
  const nuxt=launch(['.output/server/index.mjs'],`${root}nuxt`,{PORT:'41792',HOST:'127.0.0.1'});
  const angular=launch(['angular/server.mjs']);
  await Promise.all([ready(41791,next),ready(41792,nuxt),ready(41793,angular)]);
  await finished(launch(['ssr-check.mjs']));
} finally {cleanup();}
