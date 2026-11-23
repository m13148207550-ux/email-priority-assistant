// Run with Node.js: node test_offline.cjs
// Executes the actual inline script with a minimal DOM and a network trap.
// This checks browser event logic; it is not a human usability test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
process.chdir(__dirname);
const html=fs.readFileSync('index.html','utf8');
assert(!html.includes('fetch('),'Offline UI must not call fetch');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
const element=()=>({value:'',textContent:'',hidden:false,disabled:false,children:[],append(e){this.children.push(e);},replaceChildren(){this.children=[];}});
const dom=Object.fromEntries(ids.map(id=>[id,element()]));dom.version.value='revised';
const context=vm.createContext({document:{getElementById:id=>dom[id],createElement:element},fetch:()=>{throw Error('Network forbidden in offline test');}});
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
const text=()=>dom.result.children.map(p=>p.textContent).join('\n');
const results=[];
(async()=>{
  await dom.analyse.onclick();assert(text().includes('Suggested: High'));assert(text().includes('16:00 today'));results.push('A revised -> High, quoted deadline');
  dom.b.onclick();dom.version.value='baseline';await dom.analyse.onclick();assert(text().includes('Suggested: High'));results.push('B baseline -> High (preserved defect)');
  dom.version.value='revised';await dom.analyse.onclick();assert(text().includes('Suggested: Needs review'));assert(text().includes('Are you attending'));results.push('B revised -> Needs review + question');
  dom.keep.onclick();assert(dom.status.textContent.includes('unresolved'));
  await dom.normal.onclick();assert(text().includes('Your priority: Normal (system suggested Needs review)'));assert(!dom.undo.disabled);results.push('Manual correction -> Normal');
  await dom.undo.onclick();assert(text().includes('Suggested: Needs review'));assert(dom.undo.disabled);results.push('Undo -> Needs review');
  dom.participation.value='no';await dom.analyse.onclick();assert(text().includes('Suggested: Normal'));results.push('B clarified no -> Normal');
  dom.body.value='';await dom.analyse.onclick();assert(text().includes('Please provide the email text.'));results.push('Empty body -> request text');
  dom.a.onclick();await dom.analyse.onclick();assert(text().includes('Suggested: High'));results.push('Reload A -> High; old correction cleared');
  dom.body.oninput();assert(dom.controls.hidden);assert(dom.result.textContent.includes('Input changed'));results.push('Editing the message invalidates its suggestion');
  const evidence=JSON.parse(fs.readFileSync('results.json','utf8'));
  for(const [key,subject,body,participation,version] of [
    ['A_baseline','Draft feedback needed','Please send feedback by 16:00 today.','yes','baseline'],
    ['B_baseline','Optional workshop','Optional workshop registration deadline Friday.','unknown','baseline'],
    ['B_retest','Optional workshop','Optional workshop registration deadline Friday.','unknown','revised'],
    ['B_clarified_no','Optional workshop','Optional workshop registration deadline Friday.','no','revised']]){
      const result=vm.runInContext(`classify(${JSON.stringify({subject,body,participation})},${JSON.stringify(version)})`,context);
      assert.deepEqual(JSON.parse(JSON.stringify(result)),evidence[key]);
  }
  results.push('Four offline results exactly match saved Python evidence');
  const output={status:'PASS',scope:'Automated actual inline JS event logic, network trap and Python parity; not a browser-render or human study',checks:results};
  fs.writeFileSync('offline_results.json',JSON.stringify(output,null,2));
  console.log(results.join('\n')+'\nPASS: all checks completed without network calls.');
})().catch(e=>{console.error(e);process.exitCode=1;});
