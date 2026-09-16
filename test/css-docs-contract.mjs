// Scoped to literal defaults audited in the demos, not a general CSS parser.
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const names=new Set(['--au-btn-border-radius','--au-breadcrumbs-text-deco',
  '--au-tree-node-checkbox-label-text-size','--au-tree-node-text-family',
  '--au-tree-node-checkbox-input-checked-symbol','--au-option-padding-bottom',
  '--au-option-padding-left','--au-option-padding-right','--au-switch-gap',
  '--au-switch-container-gap','--au-switch-inner-distance','--au-switch-inner-border-radius']);
const audited=name=>names.has(name)||name.includes('border-color')||name.includes('focus-outline-');
const definitions=new Map();
const sources=['src/css/components.css',...(await readdir(new URL('src/components/',root))).filter(n=>n.endsWith('.js')).map(n=>'src/components/'+n)];
for(const file of sources){
  const source=await read(file);
  for(const match of source.matchAll(/var\((--au-[\w-]+),\s*/g)){
    if(!audited(match[1]))continue;
    let end=match.index+match[0].length,depth=0;const start=end;
    while(end<source.length){if(source[end]===')'&&depth===0)break;if(source[end]==='(')depth++;if(source[end]===')')depth--;end++;}
    const values=definitions.get(match[1])||new Set();values.add(source.slice(start,end).trim());definitions.set(match[1],values);
  }
}
const normalize=value=>value.replace(/\s/g,'').replace(/(?<![\d.])0(?:rem|px)/g,'0');
const removed=new Set(['--au-btn-spinner-color','--au-group-label-text-size','--au-group-label-border-radius']);
let checked=0;
function check(name,value,file){
  assert.ok(!removed.has(name),`${file}: unsupported variable ${name}`);
  if(!audited(name))return;
  assert.ok(definitions.has(name),`${file}: no source definition for ${name}`);
  assert.ok([...definitions.get(name)].some(v=>normalize(v)===normalize(value)),`${file}: ${name} documents ${value}, source: ${[...definitions.get(name)]}`);
  checked++;
}
for(const file of (await readdir(new URL('demo/',root))).filter(n=>n.endsWith('.html'))){
  for(const match of (await read('demo/'+file)).matchAll(/<tr>\s*<td>(--au-[\w-]+)<\/td>\s*<td>[\s\S]*?<\/td>\s*<td>([^<]+)<\/td>\s*<\/tr>/g))check(match[1],match[2],file);
}
const playground=(await read('demo/playground-engine.js')).split('\n').filter(line=>!line.trim().startsWith('//')).join('\n');
for(const match of playground.matchAll(/\{ name: "(--au-[\w-]+)", default: "([^"]*)"/g))check(match[1],match[2],'playground');
for(const [file,prefix] of [['button','btn'],['accordion','summary'],['select','option']]){
  const html=await read('demo/'+file+'.html');
  for(const suffix of ['color','width']){
    const name=`--au-${prefix}-focus-outline-${suffix}`;
    assert.ok(html.includes(`<td>${name}</td>`),`${file}: missing ${name}`);
    assert.ok(playground.includes(`name: "${name}"`),`playground: missing ${name}`);
  }
}
assert.ok(checked>0);
console.log(`PASS CSS documentation: ${checked} audited literal defaults; focus controls documented`);
