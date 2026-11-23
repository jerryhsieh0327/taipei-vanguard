'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
function loadGame(){
 const nodes=new Map(),listeners=new Map(),documentListeners=new Map(),context2d=new Proxy({}, {get:()=>()=>{}});
 const node=id=>{if(!nodes.has(id))nodes.set(id,{id,width:166,height:166,style:{},dataset:{},classList:{toggle(){}},
  events:new Map(),getContext:()=>context2d,addEventListener(name,fn){this.events.set(name,fn);},setPointerCapture(){},replaceChildren(){},append(){}});return nodes.get(id);};
 let seed=12345;const randomMath=Object.create(Math);randomMath.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const sandbox={Math:randomMath,document:{getElementById:node,querySelectorAll:()=>[],createElement:()=>node(Symbol()),documentElement:{},
  addEventListener:(name,fn)=>documentListeners.set(name,fn),exitPointerLock(){this.pointerLockElement=null;}},
  Image:class{},innerWidth:1024,innerHeight:768,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame(){},
  alert(message){throw Error(message);},localStorage:{getItem:()=>null,setItem(){}},
  addEventListener:(name,fn)=>listeners.set(name,fn),window:{TV3D:{ready:true,load(){}}}};
 vm.createContext(sandbox);
 for(const file of ['landmarks.js','character-styles.js','site-plans.js','route-layouts.js','enemy-ai.js','ambient-life.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),sandbox);
 let source=fs.readFileSync(path.join(__dirname,'../game.js'),'utf8'),end=source.lastIndexOf('})();');assert.ok(end>0);
 source=source.slice(0,end)+`globalThis.testGame={missions,start,prepareStage,nextStage,spawnWave,spawnEnemy,passable,visibility,move,objectiveAt,jump,
  interact,updateDefuse,localThreat,simulate,shoot,reload,pause,tool,finish,keys,get game(){return game;},get running(){return running;},get progress(){return progress;},
  deploy(id,mode='campaign'){selected=id;soundOn=false;start(mode);}};`+source.slice(end);
 vm.runInContext(source,sandbox);const api=sandbox.testGame;
 Object.assign(api,{nodes,listeners,document:sandbox.document,documentListeners,tactics:sandbox.window.TVTactics,routes:sandbox.window.TVRoutes});return api;
}
const living=g=>g.enemies.filter(e=>e.state==='active');
const engaged=g=>living(g).filter(e=>e.awakened!==false);
function tick(api,seconds=.05){for(let t=0;t<seconds-1e-8;t+=.05)api.simulate(.05);}
function shootVisible(api){
 const g=api.game;const target=engaged(g).find(e=>api.visibility(g.px,g.py,e.x,e.y)&&Math.hypot(e.x-g.px,e.y-g.py)<20);
 if(!target)return false;
 const d=Math.hypot(target.x-g.px,target.y-g.py);g.dir=Math.atan2(target.y-g.py,target.x-g.px);g.pitch=Math.atan2(g.route.floorAt(target.x,target.y)+.95-g.route.floorAt(g.px,g.py)-1.65,d);
 if(!g.ammo)api.reload();api.shoot();return true;
}
function stepFight(api){shootVisible(api);api.simulate(.05);}
function walkTo(api,target,{fight=true,pace=3.2}={}){
 let guard=0;
 while(api.running&&Math.hypot(target.x-api.game.px,target.y-api.game.py)>.12&&guard++<2400){
  const g=api.game,dx=target.x-g.px,dy=target.y-g.py,d=Math.hypot(dx,dy),step=Math.min(pace*.05,d);
  api.move(dx/d*step,dy/d*step);if(fight)shootVisible(api);api.simulate(.05);
 }
 assert.ok(guard<2400,'walking must not stall at a wall');
}
function navigate(api,target,options){
 const g=api.game,route=api.tactics.findPath(g.px,g.py,target.x,target.y,api.passable);
 assert.ok(route.length||Math.hypot(g.px-target.x,g.py-target.y)<1.5,'target must be connected');
 for(const p of route)walkTo(api,p,options);walkTo(api,target,options);
}
function settle(api){
 let guard=0;
 while(api.running&&engaged(api.game).length&&guard++<1200){
  const g=api.game,e=engaged(g)[0];
  if(api.visibility(g.px,g.py,e.x,e.y)&&Math.hypot(e.x-g.px,e.y-g.py)<19)stepFight(api);
  else{
   const path=api.tactics.findPath(g.px,g.py,e.x,e.y,api.passable);
   assert.ok(path.length,'active guard must remain reachable');walkTo(api,path[0]);
  }
 }
 assert.ok(guard<1200,'guards must be defeatable');
}
function traverse(api){for(const p of api.game.route.plan.nodes.slice(1))navigate(api,p);}
function reachObjective(api){navigate(api,api.game.objective);}
function escort(api){navigate(api,api.game.objective,{pace:1.5});tick(api,2);}
function defuse(api){
 let guard=0;
 while(api.localThreat()&&guard++<1200)stepFight(api);
 assert.ok(!api.localThreat(),'objective must be defensible');
 api.keys.add('f');tick(api,4.1);api.keys.delete('f');tick(api,.05);
}
function complete(api){
 let guard=0;
 while(api.running&&guard++<20){
  const g=api.game,type=g.m.steps[g.stage][0];
  if(type==='escort'){escort(api);continue;}
  reachObjective(api);let wait=0;while(api.localThreat()&&wait++<800)stepFight(api);
  if(type==='defuse')defuse(api);else if(api.running)api.interact();tick(api,.35);
 }
 assert.ok(guard<20,'mission objectives must complete');
}
function clearForStateTest(api){
 // State-only fixtures remove the roster; traversal tests below use actual fire.
 const g=api.game;for(const e of living(g)){e.hp=0;e.state='disabled';e.fall=1;g.downeds.push(e);g.kills++;}
}
module.exports={loadGame,living,engaged,tick,shootVisible,stepFight,settle,walkTo,navigate,traverse,reachObjective,escort,defuse,complete,clearForStateTest};
