const {chromium}=require('C:/Users/PCCSALKRM/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('node:assert/strict'),R=require('./dist/rules.js');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});let row=null,offline=false;const errors=[];const copy=x=>x==null?x:JSON.parse(JSON.stringify(x));const sdk=`export function createClient(){const user={id:'image-qa',email:'imageqa@players.evervale.invalid',user_metadata:{player_id:'imageqa'}};return {auth:{onAuthStateChange(){},async getSession(){return {data:{session:{user}}}},async signOut(){return {}}},from(){let method='read',payload,revision;return {select(){return this},eq(k,v){if(k==='revision')revision=v;return this},insert(p){method='insert';payload=p;return this},update(p){method='update';payload=p;return this},async maybeSingle(){return window.__qaBackend({method,payload,revision})}}}}}`;
async function device(){const context=await browser.newContext({viewport:{width:1100,height:900}});await context.route('https://esm.sh/**',route=>route.fulfill({contentType:'application/javascript',body:sdk}));await context.exposeBinding('__qaBackend',async(_source,q)=>{if(offline)throw Error('offline');if(q.method==='read')return {data:copy(row)};if(q.method==='insert'&&row)return {error:{code:'23505'}};if(q.method==='update'&&q.revision!==row?.revision)return {data:null};row={data:copy(q.payload.data),revision:(row?.revision||0)+1,updated_at:new Date().toISOString()};return {data:copy(row)};});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto('http://127.0.0.1:4173');await p.locator('#menuScreen').waitFor({state:'visible'});await p.waitForFunction(()=>!document.getElementById('contentRetry').disabled);await p.click('#battleEditorMenu');await p.locator('#battleEditorScreen').waitFor({state:'visible'});return {context,p};}
const {p}=await device();
await p.click('#battleNew');await p.fill('#battleWidth','8');await p.fill('#battleHeight','8');await p.click('#battleResize');
const kinds=['tent','chest','campfire','crate','barrel','sign'];
for(let i=0;i<kinds.length;i++){
 await p.click('[data-brush="'+kinds[i]+'"]');
 const point=await p.evaluate(([x,y])=>EverTaleBattle.cellPoint(x,y),[1+i%3*2,2+Math.floor(i/3)*3]);
 await p.locator('#battleCanvas').click({position:point});
}
await p.click('#battleUndo');await p.click('#battleRedo');await p.click('#battleSave');
await p.waitForFunction(()=>document.getElementById('battleCloudStatus').textContent.includes('บันทึกบน Supabase แล้ว'));
const saved=row.data.contentLibrary['battleScenes:main'].scenes.at(-1),D=require('./dist/battle-data.js');
for(let i=0;i<kinds.length;i++){const c=saved.cells[(2+Math.floor(i/3)*3)*8+1+i%3*2];assert.equal(c.object,kinds[i]);assert(!D.walkable(c));}
const other=await device();await other.p.selectOption('#battleScene',saved.id);await other.p.click('#battleSave');
assert.deepEqual(row.data.contentLibrary['battleScenes:main'].scenes.at(-1).cells,saved.cells);
await p.waitForFunction(()=>document.getElementById('battleCanvas').dataset.props==='ready');
await p.locator('#battleCanvas').screenshot({path:'artifacts/qa/camp-props.png'});
assert.deepEqual(errors,[]);console.log('PASS all six props: paint, undo/redo, saved schema, blocked movement, mocked cloud and second-browser restore, illustrated atlas ready');await browser.close();})().catch(e=>{console.error(e);process.exitCode=1});
