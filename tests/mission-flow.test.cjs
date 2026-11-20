'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

// Run the real game closure with a small DOM adapter. Test access is injected
// here, never shipped as a global in the playable game.
function loadGame(){
  const nodes=new Map(),listeners=new Map();
  const context2d=new Proxy({}, {get:()=>()=>{}});
  const node=id=>{
    if(!nodes.has(id))nodes.set(id,{id,style:{},dataset:{},classList:{toggle(){}},
      getContext:()=>context2d,addEventListener(){},replaceChildren(){},append(){}});
    return nodes.get(id);
  };
  const sandbox={document:{getElementById:node,querySelectorAll:()=>[],
    createElement:()=>node(Symbol()),documentElement:{}},Image:class{},
    innerWidth:1024,innerHeight:768,devicePixelRatio:1,
    performance:{now:()=>0},requestAnimationFrame(){},alert(message){throw Error(message);},
    localStorage:{getItem:()=>null,setItem(){}},
    addEventListener:(name,fn)=>listeners.set(name,fn),window:{TV3D:{ready:true,load(){}}}};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../enemy-ai.js'),'utf8'),sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../landmarks.js'),'utf8'),sandbox);
  const filename=path.resolve(process.env.GAME_SOURCE||path.join(__dirname,'../game.js'));
  let source=fs.readFileSync(filename,'utf8');
  const end=source.lastIndexOf('})();');
  assert.ok(end>0);
  source=source.slice(0,end)+`globalThis.testGame={missions,start,prepareStage,nextStage,spawnWave,spawnEnemy,passable,visibility,
    interact,simulate,shoot,reload,pause,tool,finish,keys,get game(){return game;},
    get running(){return running;},get paused(){return paused;},get progress(){return progress;},
    deploy(id,mode='campaign'){selected=id;soundOn=false;start(mode);}};`+source.slice(end);
  vm.runInContext(source,sandbox,{filename});
  const api=sandbox.testGame;api.nodes=nodes;api.listeners=listeners;api.plans=sandbox.window.TVSites.plans;api.tactics=sandbox.window.TVTactics;
  return api;
}
function active(g){return g.enemies.filter(e=>e.state==='active');}
function tick(api,seconds=.05){for(let t=0;t<seconds-1e-8;t+=.05)api.simulate(.05);}
function atObjective(api){const g=api.game;g.px=g.objective.x;g.py=g.objective.y;}
function clearWithWeapon(api){
  const g=api.game;
  // Place each real enemy on the open mission spine to exercise shooting, HP,
  // death registration and stage simulation without requiring an aim bot.
  for(const e of active(g)){
    g.px=3.5;g.py=12.5;g.dir=0;e.x=5.5;e.y=12.5;
    while(e.state==='active'){
      if(g.ammo===0)api.reload();g.elapsed+=.31;api.shoot();
    }
  }
}
function finishEscort(api){
  const g=api.game;
  // Follow the same open traversal spine used by the touch controls.
  g.px=13;g.py=12.5;tick(api,3);
  g.px=7.5;tick(api,3);
  g.px=3.5;tick(api,3);
}

test('rescue -> escort never creates an unbriefed enemy wave',()=>{
  const api=loadGame();api.deploy(1);clearWithWeapon(api);tick(api);
  const g=api.game,cycle=g.spawnCycle;assert.equal(g.m.steps[g.stage][0],'rescue');
  atObjective(api);api.interact();
  assert.equal(g.m.steps[g.stage][0],'escort');
  assert.equal(active(g).length,0);assert.equal(g.spawnCycle,cycle);
});
test('multi-device interactions do not spawn or erase enemies',()=>{
  const api=loadGame();api.deploy(5);clearWithWeapon(api);tick(api);
  const g=api.game,cycle=g.spawnCycle;assert.equal(g.m.steps[g.stage][0],'disable');
  assert.equal(active(g).length,0);atObjective(api);api.interact();
  assert.equal(g.devices,1);assert.equal(active(g).length,0);
  assert.equal(g.spawnCycle,cycle);assert.equal(g.objective.active,true);
  tick(api,.35);atObjective(api);api.tool('device');
  assert.equal(g.devices,2);assert.equal(api.running,false);
});
test('stage entry and stale completion are one-shot; living enemies cannot be skipped',()=>{
  const api=loadGame();api.deploy(0);const g=api.game;
  const enemies=g.enemies.slice(),cycle=g.spawnCycle;
  api.prepareStage();assert.equal(g.spawnCycle,cycle);
  assert.ok(enemies.every(e=>g.enemies.includes(e)));
  api.nextStage(0);assert.equal(g.stage,0);
  clearWithWeapon(api);tick(api);assert.equal(g.stage,1);
  api.nextStage(0);assert.equal(g.stage,1);
  api.prepareStage();assert.equal(g.spawnCycle,cycle);
});
test('interaction ignores far, paused, consumed, rapid and post-result inputs',()=>{
  const api=loadGame();api.deploy(9);clearWithWeapon(api);tick(api);
  const g=api.game;api.interact();assert.equal(g.devices,0);
  atObjective(api);api.pause();api.interact();assert.equal(g.devices,0);api.pause();
  g.objective.active=false;api.interact();assert.equal(g.devices,0);
  g.objective.active=true;api.interact();assert.equal(g.devices,1);
  const rescue=g.objective;api.interact();api.tool('device');
  assert.equal(g.objective,rescue);assert.equal(g.rescues,0);
  tick(api,.35);api.interact();assert.equal(g.rescues,1);
  finishEscort(api);assert.equal(api.running,false);
  const snapshot=[g.stage,g.devices,g.rescues,g.spawnCycle];
  for(let i=0;i<5;i++)api.interact();
  assert.deepEqual([g.stage,g.devices,g.rescues,g.spawnCycle],snapshot);
});
test('corpses stay disabled across objectives; restart intentionally resets the mission',()=>{
  const api=loadGame();api.deploy(1);clearWithWeapon(api);
  const g=api.game,bodies=g.downeds.slice();tick(api);
  atObjective(api);api.interact();tick(api,1);
  assert.equal(g.downeds.length,bodies.length);
  assert.ok(bodies.every(e=>g.downeds.includes(e)&&e.state==='disabled'&&e.hp<=0&&e.fall===1));
  api.start();assert.notEqual(api.game,g);assert.equal(api.game.stage,0);
  assert.equal(api.game.downeds.length,0);assert.equal(active(api.game).length,6);
});
for(const id of [7,11])test(`mission ${id+1}: defense retains live threats and completes exactly 3 waves`,()=>{
  const api=loadGame();api.deploy(id,'defense');const g=api.game;g.armor=100000;
  while(g.m.steps[g.stage][0]!=='defend'){
    if(g.m.steps[g.stage][0]==='combat'){clearWithWeapon(api);tick(api);}
    else{atObjective(api);api.interact();tick(api,.35);}
  }
  assert.equal(active(g).length,3);
  assert.match(api.nodes.get('hudObjective').textContent,/WAVE 1 \/ 3/);
  const first=active(g).slice(),stage=g.stage;tick(api,10.1);
  assert.equal(g.stageDone,0);assert.ok(first.every(e=>active(g).includes(e)));
  clearWithWeapon(api);tick(api);assert.equal(g.stageDone,1);assert.equal(active(g).length,4);
  api.prepareStage();assert.equal(active(g).length,4);assert.equal(g.stageDone,1);
  clearWithWeapon(api);tick(api,.5);assert.equal(g.stageDone,1);
  tick(api,9.6);assert.equal(g.stageDone,2);assert.equal(active(g).length,5);
  clearWithWeapon(api);tick(api,10.1);
  assert.equal(api.running,false);assert.equal(g.stage,stage+1);
  assert.equal(g.terminalHealth>0,true);assert.equal(active(g).length,0);
  assert.ok(g.downeds.every(e=>e.state==='disabled'));
});
for(let id=0;id<12;id++)test(`campaign mission ${id+1} reaches results without unbriefed spawns`,()=>{
  const api=loadGame();api.deploy(id);const g=api.game;g.armor=100000;
  let guard=0;
  while(api.running&&guard++<30){
    const type=g.m.steps[g.stage][0],before=g.spawnCycle;
    if(type==='combat'){clearWithWeapon(api);tick(api);}
    else if(type==='defend'){clearWithWeapon(api);tick(api,10.1);}
    else if(type==='escort'){assert.equal(active(g).length,0);finishEscort(api);}
    else{assert.equal(active(g).length,0);atObjective(api);api.interact();tick(api,.35);}
    const next=g.m.steps[g.stage]?.[0];
    if(next!=='combat'&&next!=='defend')assert.equal(g.spawnCycle,before);
  }
  assert.equal(api.running,false,'mission must complete');
  assert.equal(api.nodes.get('resultTitle').textContent,'MISSION COMPLETE!');
  assert.equal(g.stage,g.m.steps.length);assert.equal(active(g).length,0);
  assert.equal(api.progress.unlocked,Math.min(12,id+2));
  assert.equal(g.spawnEvents.length,1,'the entire campaign roster must be created at deployment');
  assert.equal(g.spawnEvents[0].count,g.m.steps[0][1]);
});
test('every site-specific objective is in a connected, open collision cell',()=>{
 const api=loadGame();
 for(const id of [0,2,4,5,6,7,8,10]){
  api.deploy(id);const g=api.game,plan=api.plans[g.m.map],seen=new Set(),queue=[[3,12]];
  for(let i=0;i<queue.length;i++){
   const [x,y]=queue[i],key=`${x},${y}`;
   if(seen.has(key)||!g.grid[y]||g.grid[y][x]!==0)continue;
   seen.add(key);queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  for(const [x,y] of [...plan.devices,plan.point,[18.5,12.5],[3.5,12.5]])
   assert.ok(seen.has(`${Math.floor(x)},${Math.floor(y)}`),`map ${g.m.map}: unreachable ${x},${y}`);
 }
});
test('failure and timeout stop defense spawning and interaction',()=>{
 for(const reason of ['terminal','timer']){
  const api=loadGame();api.deploy(7,'defense');const g=api.game;g.armor=100000;
  assert.equal(g.m.steps[g.stage][0],'defend');const cycle=g.spawnCycle;
  if(reason==='terminal')g.terminalHealth=.001;else g.remaining=.001;
  tick(api);assert.equal(api.running,false);
  tick(api,31);api.interact();api.prepareStage();
  assert.equal(g.spawnCycle,cycle);assert.equal(api.nodes.get('resultTitle').textContent,'MISSION FAILED');
 }
});
test('campaign spawn lock rejects any later spawn, including explicit combat setup calls',()=>{
 const api=loadGame();api.deploy(11);const g=api.game;
 assert.equal(g.enemies.length,7);assert.equal(g.enemies.filter(e=>e.kind==='heavy').length,1);
 assert.equal(api.spawnWave(5),false);assert.equal(api.spawnEnemy(10.5,12.5),false);
 clearWithWeapon(api);tick(api);const ids=g.downeds.map(e=>e.id).join(',');
 for(let n=0;n<2;n++){atObjective(api);api.interact();tick(api,.35);assert.equal(active(g).length,0);}
 assert.equal(g.downeds.map(e=>e.id).join(','),ids);assert.equal(g.spawnEvents.length,1);
 assert.equal(api.spawnWave(3,true),false);
});
test('AI runs, reacts after a delay, dodges on the ground and respects cover collision',()=>{
 const api=loadGame();api.deploy(0);const g=api.game,e=g.enemies[0];g.armor=100000;
 for(const other of g.enemies)if(other!==e)other.state='disabled';
 e.x=16.5;e.y=12.5;tick(api,.2);
 assert.equal(e.intent,'run');assert.ok(e.locomotionSpeed>2.8);
 e.x=8.5;e.y=12.5;api.tactics.react(e,g);const beforeY=e.y;
 tick(api,.4);assert.equal(e.intent,'dodge');assert.ok(Math.abs(e.y-beforeY)>.2);
 assert.ok(api.passable(e.x,e.y,.28));assert.equal(e.state,'active');
});
test('navigation routes around a blocked corridor rather than walking into it',()=>{
 const api=loadGame();api.deploy(0);const g=api.game;
 g.grid=Array.from({length:24},(_,y)=>Array.from({length:24},(_,x)=>x===0||y===0||x===23||y===23?1:0));
 for(let y=9;y<=14;y++)g.grid[y][8]=1;
 const path=api.tactics.findPath(11.5,12.5,3.5,12.5,api.passable);
 assert.ok(path.length>8);assert.ok(path.every(p=>api.passable(p.x,p.y,.28)));
 assert.ok(path.some(p=>p.y<9||p.y>14));
 const e=g.enemies[0];g.enemies=[e];e.x=11.5;e.y=12.5;g.shotNoiseUntil=100;g.armor=100000;
 tick(api,7);assert.ok(api.visibility(e.x,e.y,g.px,g.py),'enemy should route to a clear firing position');
 assert.ok(Math.hypot(e.x-11.5,e.y-12.5)>2);
 assert.ok(api.passable(e.x,e.y,.28));
});
test('reload takes time and prevents firing until the magazine is ready',()=>{
 const api=loadGame();api.deploy(0);const g=api.game;g.ammo=0;const reserve=g.reserve;
 api.reload();assert.equal(g.ammo,0);assert.ok(g.reloadUntil>g.elapsed);
 api.shoot();assert.equal(g.shots,0);tick(api,1);assert.equal(g.ammo,0);
 tick(api,.7);assert.equal(g.ammo,30);assert.equal(g.reserve,reserve-30);assert.equal(g.reloadUntil,0);
});
