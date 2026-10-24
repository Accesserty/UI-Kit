// node test/browser/webdriver-suite.mjs firefox|safari
// Runs every WebDriver-capable browser check against one installed browser and
// prints a summary. Uses test/ssr's selenium-webdriver unless
// UI_KIT_WEBDRIVER_MODULE points elsewhere. Rebuild dist before running.
//
// Safari drives a real, visible window: a check that fails is run once more and
// reported separately, because focus assertions fail when the window loses
// focus to other activity on the Mac. Firefox runs headless and is not retried.
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const browser=process.argv[2];
if(!['firefox','safari'].includes(browser)){console.error('Usage: node test/browser/webdriver-suite.mjs firefox|safari');process.exit(2);}
const root=fileURLToPath(new URL('../../',import.meta.url));
const driverModule=process.env.UI_KIT_WEBDRIVER_MODULE||fileURLToPath(new URL('../ssr/node_modules/selenium-webdriver/index.js',import.meta.url));
if(!existsSync(driverModule)){console.error(`selenium-webdriver not found at ${driverModule}. Run: npm ci --prefix test/ssr`);process.exit(2);}
const suites=['css-contract','controls','pagination','dropdown','tree','accordion','declarative','breadcrumbs-html','card','carousel','file-upload','standalone','form-registration'];
const retries=browser==='safari'?1:0;
const run=name=>new Promise(resolve=>{
  let output='';
  const child=spawn(process.execPath,[`test/browser/${name}.mjs`,browser],{cwd:root,env:{...process.env,UI_KIT_WEBDRIVER_MODULE:driverModule}});
  child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
  child.on('close',code=>resolve({code,output}));
});
const failed=[],flaky=[];
for(const name of suites){
  let result=await run(name),attempts=1;
  while(result.code!==0&&attempts<=retries){result=await run(name);attempts++;}
  const status=result.code!==0?'FAIL':attempts>1?'PASS on retry':'PASS';
  console.log(`${browser} ${name.padEnd(18)} ${status}`);
  if(result.code!==0){failed.push(name);console.log(result.output.split('\n').filter(l=>!/^\s+at /.test(l)).slice(-12).join('\n'));}
  else if(attempts>1)flaky.push(name);
}
console.log(`\n${browser}: ${suites.length-failed.length}/${suites.length} passed`+(flaky.length?`; passed only on retry: ${flaky.join(', ')}`:''));
process.exit(failed.length?1:0);
