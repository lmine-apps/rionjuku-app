const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict');
const app=fs.readFileSync(path.join(__dirname,'../js/app.js'),'utf8');
const block=app.slice(app.indexOf('  // ---------- 使い方ガイド ----------'),app.indexOf('  function showGuide(page, auto)'));
function setup(opts={}) {
 const storage=new Map(),callbacks=[],calls=[];
 const c={RJ:{MOCK:opts.mock!==false},location:{search:opts.search||'?mock=1'},state:{user:{email:'demo@example.com'}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>{if(opts.fail)throw Error('blocked');storage.set(k,v)}},setTimeout:f=>{callbacks.push(f);return callbacks.length},document:{querySelector:()=>opts.modal?{}:null},$:()=>({classList:{contains:()=>!!opts.loggedOut}}),popupNews:()=>calls.push('news'),showGuide:(p,a)=>calls.push(['guide',p,a])};
 vm.createContext(c);vm.runInContext(block,c);return {c,storage,callbacks,calls};
}
test('スキップ済みという旧フラグでは新ガイドを非表示にしない',()=>{const {c,storage}=setup();storage.set('rj_guide','1');assert.equal(c.guideSeen(),false)});
test('明示的な非表示だけ保存・利用者とデモを分離',()=>{const {c}=setup();assert.equal(c.markGuideSeen(),true);assert.equal(c.guideSeen(),true);c.state.user.email='other@example.com';assert.equal(c.guideSeen(),false);c.state.user.email='demo@example.com';c.RJ.MOCK=false;assert.equal(c.guideSeen(),false)});
test('保存拒否は失敗を返して案内を残す',()=>{const {c}=setup({fail:true});assert.equal(c.markGuideSeen(),false);assert.equal(c.guideSeen(),false)});
test('描き直しでも起動ガイドは一度だけ予約',()=>{const {c,callbacks,calls}=setup();c.scheduleGuide();c.scheduleGuide();assert.equal(callbacks.length,1);callbacks[0]();assert.equal(calls[0][0],'guide');assert.equal(calls.length,1)});
test('明示非表示ならお知らせを表示',()=>{const {c,calls,callbacks}=setup();c.markGuideSeen();c.scheduleGuide();assert.deepEqual(calls,['news']);assert.equal(callbacks.length,0)});
test('撮影モードでは自動ガイドを出さない',()=>{const {c,callbacks,calls}=setup({search:'?mock=1&shot=picker'});c.scheduleGuide();assert.equal(callbacks.length,0);assert.equal(calls.length,0)});
test('遅延中のログアウトや別モーダルと重ねない',()=>{for(const opts of [{loggedOut:true},{modal:true}]){const {c,callbacks,calls}=setup(opts);c.scheduleGuide();callbacks[0]();assert.equal(calls.length,0)}});
test('必須ページとスキップ・完了の非永続性',()=>{const {c}=setup();assert.equal(c.GUIDE.length,5);assert.ok(c.GUIDE.some(g=>g.label==='視聴の仕方'));assert.ok(c.GUIDE.some(g=>g.label==='通知設定'));const ui=app.slice(app.indexOf('  function showGuide(page, auto)'),app.indexOf('  function editName()'));assert.equal((ui.match(/markGuideSeen\(/g)||[]).length,1);assert.match(ui,/data-guide-skip/);assert.match(ui,/data-guide-back/);assert.match(ui,/aria-modal="true"/)});