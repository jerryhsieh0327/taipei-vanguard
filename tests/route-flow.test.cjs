const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,living,engaged,tick,settle,walkTo,traverse,reachObjective,escort,clearForStateTest}=require('./game-harness.cjs');
const mapMissions=[0,2,4,5,6,7,8,10];
for(const id of mapMissions)test(`map ${id+1}: extended route, hidden roster, reachable pockets and objectives`,()=>{
 const api=loadGame();api.deploy(id);const g=api.game,plan=g.route.plan;
 assert.equal(g.grid.length,36);assert.equal(g.grid[0].length,64);assert.ok(plan.length>=65&&plan.length<=85);
 assert.equal(engaged(g).length,0);assert.equal(g.encounterEvents.length,0);
 assert.ok(living(g).every(e=>!api.visibility(g.px,g.py,e.x,e.y)),'all opening sightlines must conceal the staged guards');
 assert.ok(living(g).every(e=>api.passable(e.x,e.y,.28)));
 assert.ok(api.tactics.findPath(g.px,g.py,plan.nodes.at(-1).x,plan.nodes.at(-1).y,api.passable).length>=50);
 for(const e of living(g))assert.ok(api.tactics.findPath(g.px,g.py,e.x,e.y,api.passable).length);
 for(const [type,index] of [['device',0],['device',1],['point',0],['rescue',0]]){
  const p=api.objectiveAt(type,index);assert.ok(api.passable(p.x,p.y,.28));
  assert.ok(api.tactics.findPath(g.px,g.py,p.x,p.y,api.passable).length);
 }
 const before=living(g).map(e=>[e.x,e.y]);tick(api,8);
 assert.deepEqual(living(g).map(e=>[e.x,e.y]),before);assert.equal(g.armor,100);assert.equal(g.encounterEvents.length,0);
 assert.equal(api.passable(-1,12),false);assert.equal(api.passable(64,12),false);
});
test('footsteps activate only the first team; it runs from cover through real collision',()=>{
 const api=loadGame();api.deploy(7);const g=api.game;g.armor=100000;
 const gate=api.routes.pointAt(g.route.plan,g.route.plan.encounters[0].trigger+.35);walkTo(api,gate,{fight:false});tick(api,.1);
 assert.equal(g.encounterEvents.length,1);assert.equal(engaged(g).length,2);
 const moving=engaged(g),before=moving.map(e=>({x:e.x,y:e.y})),waiting=living(g).filter(e=>!e.awakened).map(e=>[e.id,e.x,e.y]);
 let seen=false,fast=false;
 for(let i=0;i<80;i++){api.simulate(.05);for(const e of moving){seen||=api.visibility(g.px,g.py,e.x,e.y);fast||=e.locomotionSpeed>2.5;assert.ok(api.passable(e.x,e.y,.28));}}
 assert.ok(seen&&fast);assert.ok(moving.some((e,i)=>Math.hypot(e.x-before[i].x,e.y-before[i].y)>2));
 assert.deepEqual(living(g).filter(e=>!e.awakened).map(e=>[e.id,e.x,e.y]),waiting);
 assert.equal(g.spawnEvents.length,1);
});
test('backtracking and repeated Interact cannot replay an ambush or revive a body',()=>{
 const api=loadGame();api.deploy(0);const g=api.game;g.armor=100000;
 const ids=g.enemies.map(e=>e.id).join(','),gate=api.routes.pointAt(g.route.plan,g.route.plan.encounters[0].trigger+.35);walkTo(api,gate);settle(api);
 const dead=g.downeds.slice();assert.ok(dead.length>0);
 walkTo(api,g.route.plan.start);for(let i=0;i<20;i++)api.interact();
 walkTo(api,gate);
 assert.equal(g.encounterEvents.length,1);assert.equal(g.spawnEvents.length,1);
 assert.equal(g.enemies.map(e=>e.id).join(','),ids);assert.ok(dead.every(e=>e.state==='disabled'&&g.downeds.includes(e)));
 assert.equal(api.spawnWave(3),false);assert.equal(api.spawnEnemy(5.5,12.5),false);
});
for(let id=0;id<12;id++)test(`mission ${id+1}: traverse, fight four encounters, finish objectives and escorts`,()=>{
 const api=loadGame();api.deploy(id);const g=api.game;g.armor=100000;
 traverse(api);
 assert.equal(g.encounterEvents.length,4);assert.equal(new Set(g.encounterEvents.map(e=>e.id)).size,4);
 assert.equal(living(g).length,0);assert.equal(g.kills,g.rosterSize);
 let guard=0;
 while(api.running&&guard++<12){
  const type=g.m.steps[g.stage][0];
  if(type==='escort')escort(api);
  else{reachObjective(api);if(api.running)api.interact();tick(api,.35);}
 }
 assert.equal(api.running,false);assert.equal(api.nodes.get('resultTitle').textContent,'MISSION COMPLETE!');
 assert.equal(g.spawnEvents.length,1);assert.equal(g.spawnEvents[0].count,g.rosterSize);
 assert.equal(g.stage,g.m.steps.length);assert.ok(g.downeds.every(e=>e.state==='disabled'));
 assert.equal(api.progress.unlocked,Math.min(12,id+2));
});
test('stage setup and stale stage completion remain one-shot',()=>{
 const api=loadGame();api.deploy(0);const g=api.game,cycle=g.spawnCycle;
 api.prepareStage();api.nextStage(0);assert.equal(g.stage,0);assert.equal(g.spawnCycle,cycle);
 clearForStateTest(api);tick(api);assert.equal(g.stage,1);
 api.nextStage(0);api.prepareStage();assert.equal(g.stage,1);assert.equal(g.spawnCycle,cycle);
});
test('device interactions ignore distance, pause, consumed targets, double taps and results',()=>{
 const api=loadGame();api.deploy(9);const g=api.game;clearForStateTest(api);tick(api);
 api.interact();assert.equal(g.devices,0);g.px=g.objective.x;g.py=g.objective.y;
 api.pause();api.interact();assert.equal(g.devices,0);api.pause();
 g.objective.active=false;api.interact();assert.equal(g.devices,0);g.objective.active=true;
 api.interact();assert.equal(g.devices,1);api.interact();api.tool('device');assert.equal(g.rescues,0);
 tick(api,.35);api.interact();assert.equal(g.rescues,1);assert.equal(g.spawnEvents.length,1);
 api.finish(true);const before=[g.devices,g.rescues,g.spawnCycle,g.stage].join(',');api.interact();
 assert.equal([g.devices,g.rescues,g.spawnCycle,g.stage].join(','),before);
});
for(const id of [7,11])test(`mission ${id+1}: explicit defense still has exactly three waves`,()=>{
 const api=loadGame();api.deploy(id,'defense');const g=api.game;g.armor=100000;
 assert.equal(g.px,39.5);assert.equal(living(g).length,3);assert.equal(g.encounterEvents.length,0);
 const first=living(g).slice();tick(api,10.1);assert.equal(g.stageDone,0);assert.ok(first.every(e=>living(g).includes(e)));
 clearForStateTest(api);tick(api);assert.equal(living(g).length,4);api.prepareStage();assert.equal(living(g).length,4);
 clearForStateTest(api);tick(api,10.1);assert.equal(living(g).length,5);
 clearForStateTest(api);tick(api,10.1);assert.equal(api.running,false);assert.equal(g.spawnEvents.length,3);
 assert.equal(g.kills,12);assert.equal(api.progress.unlocked,1);
});
test('terminal destruction and timeout stop subsequent waves',()=>{
 for(const reason of ['terminal','timer']){
  const api=loadGame();api.deploy(7,'defense');const g=api.game;g.armor=100000;
  if(reason==='terminal')g.terminalHealth=.001;else g.remaining=.001;
  tick(api);const events=g.spawnEvents.length;assert.equal(api.running,false);tick(api,35);api.interact();api.prepareStage();
  assert.equal(g.spawnEvents.length,events);assert.equal(api.nodes.get('resultTitle').textContent,'MISSION FAILED');
 }
});
test('timed reload still prevents firing until completion',()=>{
 const api=loadGame();api.deploy(0);const g=api.game;g.ammo=0;const reserve=g.reserve;
 api.reload();api.shoot();tick(api,1);assert.equal(g.ammo,0);assert.equal(g.shots,0);
 tick(api,.7);assert.equal(g.ammo,30);assert.equal(g.reserve,reserve-30);
});
test('restart resets route activations intentionally; the armored leader starts hidden in the last pocket',()=>{
 const api=loadGame();api.deploy(11);const g=api.game;
 const heavy=g.enemies.filter(e=>e.kind==='heavy');assert.equal(heavy.length,1);assert.equal(heavy[0].encounterId,3);assert.equal(heavy[0].awakened,false);
 g.armor=100000;walkTo(api,api.routes.pointAt(g.route.plan,g.route.plan.encounters[0].trigger+.35));assert.ok(g.encounterEvents.length>0);api.start();
 assert.notEqual(api.game,g);assert.equal(api.game.encounterEvents.length,0);assert.equal(api.game.routeProgress,0);assert.equal(api.game.downeds.length,0);
});
test('awakened guards retain running and delayed dodge behavior on the new grid',()=>{
 const api=loadGame();api.deploy(0);const g=api.game,e=g.enemies[0];g.enemies=[e];g.armor=100000;
 e.awakened=true;e.emergeTarget=null;e.x=13.5;e.y=12.5;tick(api,.2);
 assert.equal(e.intent,'run');assert.ok(e.locomotionSpeed>2.8);
 e.x=8.5;e.y=12.5;api.tactics.react(e,g);const y=e.y;tick(api,.4);
 assert.equal(e.intent,'dodge');assert.ok(Math.abs(e.y-y)>.2);assert.ok(api.passable(e.x,e.y,.28));
});
