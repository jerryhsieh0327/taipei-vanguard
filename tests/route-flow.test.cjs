const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,living,engaged,tick,navigate,traverse,complete,clearForStateTest,defuse}=require('./game-harness.cjs');
for(let id=0;id<12;id++)test(`mission ${id+1}: authored topology, hidden guards, reachable objectives and flanks`,()=>{
 const a=loadGame();a.deploy(id);const g=a.game,p=g.route.plan;
 assert.equal(g.grid.length,72);assert.equal(g.grid[0].length,96);assert.equal(living(g).length,g.m.roster);
 assert.equal(g.grid.flat().filter(v=>v===31).length,0,'no generated maze wall tiles');
 assert.ok(g.grid.flat().filter(v=>v===0).length/(96*72)>.55,'most of the map remains open ground');
 assert.equal(engaged(g).length,0);assert.equal(g.encounterEvents.length,0);
 assert.ok(living(g).every(e=>!a.visibility(g.px,g.py,e.x,e.y)));
 for(const target of [...p.nodes,...g.enemies,p.hostage,...p.bombs,p.extraction,...p.encounters.flatMap(c=>[c.exit,...c.flank])]){
  assert.ok(a.passable(target.x,target.y,.28),`blocked ${JSON.stringify(target)}`);
  assert.ok(a.tactics.findPath(g.px,g.py,target.x,target.y,a.passable).length||Math.hypot(g.px-target.x,g.py-target.y)<1);
 }
 const before=g.enemies.map(e=>[e.x,e.y]);tick(a,5);assert.deepEqual(g.enemies.map(e=>[e.x,e.y]),before);assert.equal(g.armor,100);
});
test('eight sites have different collision topology; all twelve missions have different routes',()=>{
 const grids=new Set(),routes=new Set(),positions=new Set();
 for(let id=0;id<12;id++){
  const a=loadGame();a.deploy(id);const g=a.game;
  if([0,2,4,5,6,7,8,10].includes(id))grids.add(JSON.stringify(g.grid));
  routes.add(JSON.stringify(g.route.plan.nodes));positions.add(JSON.stringify(g.route.plan.encounters.map(c=>c.spots)));
 }
 assert.equal(grids.size,8);assert.equal(routes.size,12);assert.equal(positions.size,12);
});
for(let id=0;id<12;id++)test(`mission ${id+1}: collision movement, shooting, site objectives and evacuation`,()=>{
 const a=loadGame();a.deploy(id);const g=a.game;g.armor=100000;
 traverse(a);complete(a);
 assert.equal(a.nodes.get('resultTitle').textContent,'MISSION COMPLETE!');assert.equal(a.running,false);
 assert.equal(g.spawnEvents.length,1);assert.equal(g.spawnEvents[0].count,g.rosterSize);
 assert.equal(g.stage,g.m.steps.length);assert.ok(g.downeds.every(e=>e.state==='disabled'));
 assert.ok(g.encounterEvents.length>=2);assert.equal(g.devices,g.bombTotal);
 if(g.m.steps.some(st=>st[0]==='rescue'))assert.equal(g.rescues,1);
 assert.ok(g.shots>0);assert.equal(new Set(g.encounterEvents.map(e=>e.id)).size,g.encounterEvents.length);
});
test('proximity gates do not awaken distant teams from accumulated route progress',()=>{
 const a=loadGame();a.deploy(0);const g=a.game;g.routeProgress=10000;tick(a,.1);assert.equal(g.encounterEvents.length,0);
 const c=g.route.plan.encounters[0];g.px=c.gate.x;g.py=c.gate.y;tick(a,.1);
 assert.ok(g.encounterEvents.some(e=>e.id===0));assert.ok(g.enemies.filter(e=>e.encounterId===0).every(e=>e.awakened));
 const events=g.encounterEvents.length;a.routes.wakeGroup(g,0);assert.equal(g.encounterEvents.length,events);
});
test('Interact, backtracking, stage preparation and restarts cannot revive campaign enemies',()=>{
 const a=loadGame();a.deploy(0);const g=a.game;g.armor=100000;traverse(a);const dead=g.downeds.slice(),events=g.spawnEvents.length;
 for(let i=0;i<15;i++){a.interact();a.prepareStage();a.spawnWave(3);a.spawnEnemy(6.5,38.5);}
 navigate(a,g.route.plan.start);assert.equal(g.spawnEvents.length,events);assert.ok(dead.every(e=>e.state==='disabled'&&g.downeds.includes(e)));
 a.start();assert.equal(a.game.downeds.length,0);assert.equal(a.game.encounterEvents.length,0);assert.notEqual(a.game,g);
});
test('a bomb needs four continuous seconds; release, movement, firing, jumping and damage reset progress',()=>{
 const a=loadGame();a.deploy(0);const g=a.game;clearForStateTest(a);g.px=g.objective.x;g.py=g.objective.y;
 a.interact();assert.equal(g.devices,0);
 a.keys.add('f');tick(a,2);assert.ok(g.defuseProgress>=1.99&&g.devices===0);
 a.keys.delete('f');tick(a,.05);assert.equal(g.defuseProgress,0);
 a.keys.add('f');tick(a,1);g.wasMoving=true;a.updateDefuse(.1,false);assert.equal(g.defuseProgress,0);g.wasMoving=false;
 tick(a,1);a.jump();tick(a,.05);assert.equal(g.defuseProgress,0);tick(a,1);
 tick(a,1);a.updateDefuse(.05,true);assert.equal(g.defuseProgress,0);assert.equal(g.devices,0);
 a.keys.delete('f');tick(a,1);defuse(a);assert.equal(g.devices,1);assert.equal(g.stage,1);
});
test('remote dormant guards do not block rescue or bomb interaction; nearby visible guards do',()=>{
 const a=loadGame();a.deploy(4);const g=a.game;g.px=g.objective.x;g.py=g.objective.y;
 // Keep a genuine remote team and hide all near teams for this state fixture.
 g.enemies=g.enemies.filter(e=>Math.hypot(e.x-g.px,e.y-g.py)>12);
 assert.ok(g.enemies.length);a.interact();assert.equal(g.stage,1);assert.ok(g.enemies.length);assert.equal(g.spawnEvents.length,1);
 const b=loadGame();b.deploy(0);const h=b.game;h.px=h.objective.x;h.py=h.objective.y;const e=h.enemies[0];e.x=h.px-2;e.y=h.py;e.awakened=true;
 b.keys.add('f');tick(b,.3);assert.equal(h.defuseProgress,0);assert.equal(h.devices,0);
});
test('second bomb is distinct and double taps cannot disarm it or spawn guards',()=>{
 const a=loadGame();a.deploy(5);const g=a.game;clearForStateTest(a);g.px=g.objective.x;g.py=g.objective.y;const first={...g.objective};
 defuse(a);assert.equal(g.devices,1);assert.notDeepEqual(g.objective,first);a.interact();a.interact();tick(a,.4);assert.equal(g.devices,1);
 g.px=g.objective.x;g.py=g.objective.y;defuse(a);assert.equal(g.devices,2);assert.equal(g.spawnEvents.length,1);
});
test('bomb timer fails while armed, stops after disposal, and pause freezes it',()=>{
 for(const disposed of [false,true]){
  const a=loadGame();a.deploy(0);const g=a.game;clearForStateTest(a);g.bombRemaining=.1;
  if(disposed)g.devices=g.bombTotal;
  a.pause();tick(a,1);assert.equal(g.bombRemaining,.1);a.pause();tick(a,.2);
  assert.equal(a.running,disposed);if(!disposed)assert.equal(a.nodes.get('resultTitle').textContent,'MISSION FAILED');
 }
});
test('rescue, escort and exit positions come from the specific site, not a shared final point',()=>{
 const a=loadGame();a.deploy(4);const g=a.game;clearForStateTest(a);g.px=g.objective.x;g.py=g.objective.y;a.interact();
 assert.equal(g.escort.x,g.route.plan.hostage.x);assert.equal(g.objective.x,g.route.plan.extraction.x);assert.notDeepEqual(g.objective,g.route.plan.start);
 g.px=g.objective.x;g.py=g.objective.y;tick(a,.1);assert.equal(a.running,true,'player alone cannot complete the escort');
});
test('guard tactics differ: sentry holds an angle, flanker uses its authored branch, rusher closes distance',()=>{
 const a=loadGame();a.deploy(6);const g=a.game;g.armor=100000;g.px=25.5;g.py=21.5;
 const e=g.enemies[0];g.enemies=[e];e.awakened=true;e.emergeTarget=null;e.x=35.5;e.y=21.5;e.alertUntil=100;e.lastSeen={x:g.px,y:g.py};
 e.tactic='anchor';tick(a,.2);assert.equal(e.intent,'hold-angle');assert.ok(e.locomotionSpeed<.01);
 e.tactic='rush';tick(a,.2);assert.equal(e.intent,'run');assert.ok(e.locomotionSpeed>3);
 e.tactic='flank';e.flankRoute=[{x:37.5,y:27.5}];e.flankIndex=0;tick(a,.2);assert.equal(e.intent,'flank');assert.ok(e.locomotionSpeed>2);
});
test('ponds block walking but do not act as opaque walls',()=>{
 const a=loadGame();a.deploy(2);assert.equal(a.passable(22.5,18.5),false);
 assert.equal(a.visibility(15.5,18.5,31.5,18.5),true);
});
test('touch cancellation and pause cancel held bomb disposal',()=>{
 const a=loadGame();a.deploy(0);clearForStateTest(a);const g=a.game;g.px=g.objective.x;g.py=g.objective.y;
 const button=a.nodes.get('interactBtn'),down=()=>button.events.get('pointerdown')({preventDefault(){},pointerId:3});
 down();tick(a,2);assert.ok(g.defuseProgress>=1.99);button.events.get('pointercancel')();tick(a,.05);assert.equal(g.defuseProgress,0);
 down();tick(a,1);a.pause();assert.equal(g.defuseProgress,0);a.pause();tick(a,4.1);assert.equal(g.devices,0);
});
for(const id of [7,11])test(`mission ${id+1}: optional defense retains exactly three explicit waves`,()=>{
 const a=loadGame();a.deploy(id,'defense');const g=a.game;g.armor=100000;
 for(let i=0;i<3;i++){assert.equal(living(g).length,3+i);assert.ok(living(g).every(e=>a.passable(e.x,e.y,.28)));clearForStateTest(a);tick(a,10.1);}
 assert.equal(a.running,false);assert.equal(g.spawnEvents.length,3);assert.equal(g.kills,12);assert.equal(a.progress.unlocked,1);
});
test('vendor, gang and tactical silhouettes have distinct clothing and headgear',()=>{
 const cases=[[0,'tactical'],[4,'gang'],[8,'vendor'],[10,'hiker']];
 for(const [id,family] of cases){const a=loadGame();a.deploy(id);const looks=a.game.enemies.map(e=>e.appearance);assert.ok(looks.every(l=>l.family===family&&l.armed));assert.equal(new Set(looks.map(l=>l.variant)).size,3);
  if(family==='vendor')assert.ok(looks.every(l=>l.apron)&&looks.some(l=>l.hat==='chef'));
  if(family==='gang')assert.ok(looks.some(l=>l.floral)&&looks.some(l=>l.tank)&&looks.every(l=>l.chain));
 }
});
test('memorial steps, museum terrace and mountain slopes carry real floor elevations',()=>{
 const a=loadGame();a.deploy(2);assert.ok(a.game.route.floorAt(64,27)>2);assert.equal(a.game.route.floorAt(51,27),0);
 a.deploy(5);assert.equal(a.game.route.floorAt(52,25),2.4);assert.equal(a.game.route.floorAt(52,51),0);
 a.deploy(10);assert.ok(Math.abs(a.game.route.floorAt(80,18)-a.game.route.floorAt(18,60))>.5);
});
