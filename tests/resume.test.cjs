'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname,'../js/app.js'),'utf8');
const feature = source.slice(source.indexOf('  // ---------- この端末で続きから見る'), source.indexOf('  // ---------- 視聴済み ----------'));
const course = source.slice(source.indexOf('  function openCourse('), source.indexOf('  /** 左：章＋レッスン',source.indexOf('  function openCourse(')));
function setup() {
  let now = 1800000000000;
  const storage = new Map(), nodes = new Map(), opened = [], external = [];
  const video = {id:4,title:'第2回講義',url:'https://vimeo.com/12345',state:'open'};
  const courses = [{name:'凛穏塾',chapters:[{name:'講義',videos:[video]}]}];
  const state = {user:{email:'demo@example.com'},courses,ci:0,vi:0,flat:[{v:video,chapter:'講義'}],watched:{}};
  const node = id => {
    if(!nodes.has(id)) nodes.set(id,{classList:{add(){},remove(){}},setAttribute(){},focus(){}});
    return nodes.get(id);
  };
  const context = {
    state, localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    Date:{now:()=>now}, document:{addEventListener(){},hidden:false},window:{addEventListener(){}},
    RJ:{MOCK:true,parseVimeo:url=>{const m=String(url||'').match(/vimeo\.com\/(\d+)/);return m?{id:m[1]}:null;},errMsg:()=> 'ログインしてください。'},
    $:node, esc:s=>String(s), uid:'',store:{token:()=> 'demo-token',clear:()=>external.push('clear')},
    api:async()=>({ok:true,user:state.user,courses:state.courses}),
    applyData:r=>{state.user=r.user;state.courses=r.courses;},saveDataCache:()=>{},
    openCourse:(...args)=>opened.push(args),closeDrawer:()=>{},
    showLogin:()=>external.push('login'),renderSideChapters:()=>{},order:()=> 'old',
    openVideo:(...args)=>opened.push(args)
  };
  vm.createContext(context);
  vm.runInContext(feature + '\nthis.r={resumeStorageKey,validResume,readResume,writeResume,findResumeVideo,resumeTime,trackResume,flushResume,endResumeSession,resumeFrom,bumpView:()=>resumeView++};', context);
  const record = extra => ({course:'凛穏塾',id:'4',media:'12345',seconds:120,duration:1000,at:now,...extra});
  return {context,r:context.r,state,storage,opened,external,record,tick:n=>now+=n,runCourse:()=>vm.runInContext(course,context)};
}
function player() {
  const handlers = {};
  return {
    handlers,
    on(name,fn){(handlers[name] ||= []).push(fn);},
    off(name,fn){handlers[name]=(handlers[name]||[]).filter(x=>x!==fn);},
    emit(name,data){for(const fn of [...(handlers[name]||[])]) fn(data);}
  };
}
const settle = () => new Promise(resolve=>setImmediate(resolve));
function panel() {
  const msg={textContent:''},buttons=[{disabled:false},{disabled:false}];
  return {msg,buttons,querySelector:()=>msg,querySelectorAll:()=>buttons};
}
test('利用者・本番/デモの保存先を分離する',()=>{
  const h=setup(), a=h.r.resumeStorageKey();
  h.state.user.email='other@example.com'; assert.notEqual(h.r.resumeStorageKey(),a);
  h.state.user.email=' DEMO@example.com '; assert.equal(h.r.resumeStorageKey(),a);
  h.context.RJ.MOCK=false; assert.notEqual(h.r.resumeStorageKey(),a);
  h.state.user=null; assert.equal(h.r.resumeStorageKey(),'');
});
test('壊れた記録・NaN・終端・古い記録を再開候補にしない',()=>{
  const h=setup(), key=h.r.resumeStorageKey();
  for(const value of ['null','{}','bad json','[null,{},42]']) {
    h.storage.set(key,value); assert.equal(h.r.readResume(key).length,0);
  }
  for(const extra of [{seconds:NaN},{seconds:Infinity},{seconds:4},{seconds:999},{duration:-1},{at:1}])
    assert.equal(Boolean(h.r.validResume(h.record(extra))),false);
});
test('保存は30本まで、同じ動画は最新位置へ更新する',()=>{
  const h=setup(),key=h.r.resumeStorageKey();
  for(let i=0;i<40;i++){h.tick(100);h.r.writeResume(key,h.record({id:String(i)}),false);}
  assert.equal(h.r.readResume(key).length,30);
  h.r.writeResume(key,h.record({id:'39',seconds:200}),false);
  assert.equal(h.r.readResume(key).length,30);
  assert.equal(h.r.readResume(key)[0].seconds,200);
});
test('期限切れ・未公開・割当解除・動画差し替えを再開しない',()=>{
  const h=setup(),r=h.record(),v=h.state.courses[0].chapters[0].videos[0];
  assert.ok(h.r.findResumeVideo(r));
  for(const status of ['expired','before']) {v.state=status;assert.equal(h.r.findResumeVideo(r),null);}
  v.state='open';v.url='https://vimeo.com/999';assert.equal(h.r.findResumeVideo(r),null);
  v.url='https://vimeo.com/12345';h.state.courses=[];assert.equal(h.r.findResumeVideo(r),null);
});
test('時間表示は時・分・秒を読みやすくする',()=>{
  const {r}=setup();assert.equal(r.resumeTime(1920),'32分');assert.equal(r.resumeTime(3665),'1時間1分5秒');
});
test('開いただけ・再生前のシークでは前回位置を上書きしない',()=>{
  const h=setup(),p=player(),key=h.r.resumeStorageKey();
  h.r.writeResume(key,h.record(),false);h.state.player=p;h.r.trackResume(h.state.flat[0].v);
  p.emit('timeupdate',{seconds:0,duration:1000});p.emit('seeked',{seconds:600,duration:1000});
  assert.equal(h.r.readResume(key)[0].seconds,120);
});
test('再生位置を定期保存し、一時停止で直近位置を保存する',()=>{
  const h=setup(),p=player(),key=h.r.resumeStorageKey();h.state.player=p;h.r.trackResume(h.state.flat[0].v);
  p.emit('play');p.emit('timeupdate',{seconds:60,duration:1000});
  h.tick(1000);p.emit('timeupdate',{seconds:62,duration:1000});
  assert.equal(h.r.readResume(key)[0].seconds,60);
  p.emit('pause',{seconds:63,duration:1000});assert.equal(h.r.readResume(key)[0].seconds,63);
});
test('画面を離れるとき未保存分を保存し、他のイベント処理を残す',()=>{
  const h=setup(),p=player(),key=h.r.resumeStorageKey(),other=()=>{};
  p.on('timeupdate',other);h.state.player=p;h.r.trackResume(h.state.flat[0].v);
  p.emit('play');p.emit('timeupdate',{seconds:60,duration:1000});
  h.tick(100);p.emit('timeupdate',{seconds:64,duration:1000});h.r.endResumeSession();
  assert.equal(h.r.readResume(key)[0].seconds,64);assert.deepEqual(p.handlers.timeupdate,[other]);
});
test('別の動画へ切り替えた後の古いコールバックを無視する',()=>{
  const h=setup(),p=player(),key=h.r.resumeStorageKey();h.state.player=p;h.r.trackResume(h.state.flat[0].v);
  p.emit('play');const old=p.handlers.timeupdate[0];h.r.endResumeSession();
  old({seconds:900,duration:1000});assert.equal(h.r.readResume(key).length,0);
});
test('90%の視聴済み後も続きは残し、最後まで見たら候補から外す',()=>{
  const h=setup(),p=player(),key=h.r.resumeStorageKey();h.state.player=p;h.r.trackResume(h.state.flat[0].v);
  p.emit('play');p.emit('timeupdate',{seconds:950,duration:1000});assert.equal(h.r.readResume(key).length,1);
  p.emit('ended');p.emit('pause',{seconds:950,duration:1000});assert.equal(h.r.readResume(key).length,0);
});
test('保存領域やSDKが利用できなくても例外を出さない',()=>{
  const h=setup();h.context.localStorage.getItem=()=>{throw Error('blocked');};h.context.localStorage.setItem=()=>{throw Error('full');};
  assert.doesNotThrow(()=>h.r.writeResume(h.r.resumeStorageKey(),h.record(),false));
  assert.doesNotThrow(()=>h.r.trackResume(h.state.flat[0].v));
});
test('1コースでも前回の動画を開き、明示操作なしでは位置を復元しない',()=>{
  const h=setup(),key=h.r.resumeStorageKey();
  h.state.courses[0].chapters[0].videos.unshift({id:2,url:'https://vimeo.com/222',state:'open'});
  h.r.writeResume(key,h.record(),false);h.runCourse();h.context.openCourse(0);
  assert.deepEqual(h.opened,[[1]]); // resumeSecondsを渡さず、再生を開始しない。
});
test('再開時は最新データを確認してから指定位置を開く',async()=>{
  const h=setup(),p=panel();let calls=0;
  h.context.api=async action=>{assert.equal(action,'data');calls++;return {ok:true,user:h.state.user,courses:h.state.courses};};
  h.r.resumeFrom(h.record(),false,p);assert.ok(p.buttons.every(b=>b.disabled));await settle();
  assert.equal(calls,1);assert.equal(h.opened[0][1].seconds,120);assert.ok(p.buttons.every(b=>!b.disabled));
});
test('はじめから見るでは保存位置を削除し0秒で開く',async()=>{
  const h=setup(),p=panel(),key=h.r.resumeStorageKey();h.r.writeResume(key,h.record(),false);
  h.r.resumeFrom(h.record(),true,p);await settle();
  assert.equal(h.opened[0][1].seconds,0);assert.equal(h.r.readResume(key).length,0);
});
test('最新データで期限切れなら、古い控えのURLを使って再開しない',async()=>{
  const h=setup(),p=panel();
  h.context.api=async()=>({ok:true,user:h.state.user,courses:[]});
  h.r.resumeFrom(h.record(),false,p);await settle();
  assert.equal(h.opened.length,0);assert.match(p.msg.textContent,/現在視聴できません/);
});
test('通信失敗時は再開せず、再試行できる状態に戻す',async()=>{
  const h=setup(),p=panel();h.context.api=async()=>{throw Error('通信できません');};
  h.r.resumeFrom(h.record(),false,p);await settle();
  assert.equal(h.opened.length,0);assert.ok(p.buttons.every(b=>!b.disabled));assert.match(p.msg.textContent,/通信/);
});
test('認証切れ・停止時はログイン案内へ戻る',async()=>{
  for(const error of ['unauthorized','stopped']) {
    const h=setup(),p=panel();h.context.api=async()=>({ok:false,error});
    h.r.resumeFrom(h.record(),false,p);await settle();assert.deepEqual(h.external,['clear','login']);assert.equal(h.opened.length,0);
  }
});
test('確認中に画面または利用者が変わった場合は勝手に遷移しない',async()=>{
  for(const change of ['view','user']) {
    const h=setup(),p=panel();let resolve;h.context.api=()=>new Promise(r=>resolve=r);
    h.r.resumeFrom(h.record(),false,p);
    if(change==='view') h.r.bumpView(); else h.state.user.email='other@example.com';
    resolve({ok:true,user:h.state.user,courses:h.state.courses});await settle();assert.equal(h.opened.length,0);
  }
});