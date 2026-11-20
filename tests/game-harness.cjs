'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
function loadGame(){
 const nodes=new Map(),listeners=new Map(),context2d=new Proxy({}, {get:()=>()=>{}});
 const node=id=>{if(!nodes.has(id))nodes.set(id,{id,width:166,height:166,style:{},dataset:{},classList:{toggle(){}},
  getContext:()=>context2d,addEventListener(){},replaceChildren(){},append(){}});return nodes.get(id);};
 let seed=12345;const randomMath=Object.create(Math);randomMath.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const sandbox={Math:randomMath,document:{getElementById:node,querySelectorAll:()=>[],createElement:()=>node(Symbol()),documentElement:{}},
  Image:class{},innerWidth:1024,innerHeight:768,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame(){},
  alert(message){throw Error(message);},localStorage:{getItem:()=>null,setItem(){}},
  addEventListener:(name,fn)=>listeners.set(name,fn),window:{TV3D:{ready:true,load(){}}}};
 vm.createContext(sandbox);
 for(const file of ['landmarks.js','route-layouts.js','enemy-ai.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),sandbox);
 let source=fs.readFileSync(path.join(__dirname,'../game.js'),'utf8'),end=source.lastIndexOf('})();');assert.ok(end>0);
 source=source.slice(0,end)+`globalThis.testGame={missions,start,prepareStage,nextStage,spawnWave,spawnEnemy,passable,visibility,move,objectiveAt,
  interact,simulate,shoot,reload,pause,tool,finish,keys,get game(){return game;},get running(){return running;},get progress(){return progress;},
  deploy(id,mode='campaign'){selected=id;soundOn=false;start(mode);}};`+source.slice(end);
 vm.runInContext(source,sandbox);const api=sandbox.testGame;
 Object.assign(api,{nodes,listeners,tactics:sandbox.window.TVTactics,routes:sandbox.window.TVRoutes});return api;
}
const living=g=>g.enemies.filter(e=>e.state==='active');
const engaged=g=>living(g).filter(e=>e.awakened!==false);
function tick(api,seconds=.05){for(let t=0;t<seconds-1e-8;t+=.05)api.simulate(.05);}
function shootVisible(api){
 const g=api.game;const target=engaged(g).find(e=>api.visibility(g.px,g.py,e.x,e.y)&&Math.hypot(e.x-g.px,e.y-g.py)<20);
 if(!target)return false;
 const d=Math.hypot(target.x-g.px,target.y-g.py);g.dir=Math.atan2(target.y-g.py,target.x-g.px);g.pitch=Math.atan2(.95-1.65,d);
 if(!g.ammo)api.reload();api.shoot();return true;
}
function settle(api){
 for(let i=0;i<360&&engaged(api.game).length&&api.running;i++){shootVisible(api);api.simulate(.05);}
 assert.equal(engaged(api.game).length,0,'engaged team must emerge and be defeatable from the route');
}
function walkTo(api,target,{fight=true,pace=3.2}={}){
 let guard=0;
 while(api.running&&Math.hypot(target.x-api.game.px,target.y-api.game.py)>.12&&guard++<1800){
  const g=api.game,dx=target.x-g.px,dy=target.y-g.py,d=Math.hypot(dx,dy),step=Math.min(pace*.05,d);
  api.move(dx/d*step,dy/d*step);api.simulate(.05);
  if(fight&&engaged(g).length)settle(api);
 }
 assert.ok(guard<1800,'walking must not stall at a wall');
}
function traverse(api){for(const p of api.game.route.plan.nodes.slice(1))walkTo(api,p);}
function reachObjective(api){
 const g=api.game,goal=g.objective,route=api.tactics.findPath(g.px,g.py,goal.x,goal.y,api.passable);
 for(const p of route)walkTo(api,p);walkTo(api,goal);
}
function escort(api){
 const g=api.game;
 for(const p of g.route.plan.nodes.slice().reverse())walkTo(api,p,{fight:false,pace:1.65});
 tick(api,2);
}
function clearForStateTest(api){
 const g=api.game;
 for(const e of living(g)){
  g.px=3.5;g.py=12.5;g.dir=0;g.pitch=0;e.x=5.5;e.y=12.5;e.awakened=true;e.emergeTarget=null;
  let guard=0;while(e.state==='active'&&guard++<100){if(!g.ammo)api.reload();g.elapsed+=.31;api.shoot();}
  assert.ok(guard<100);
 }
}
module.exports={loadGame,living,engaged,tick,shootVisible,settle,walkTo,traverse,reachObjective,escort,clearForStateTest};
