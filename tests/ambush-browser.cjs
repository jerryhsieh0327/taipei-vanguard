'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.QA_OUTPUT||path.join(root,'qa'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.glb':'model/gltf-binary','.json':'application/json'};
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const source=fs.readFileSync(path.join(root,'game.js'),'utf8'),end=source.lastIndexOf('})();'),
  harness=fs.readFileSync(path.join(__dirname,'game-harness.cjs'),'utf8'),helpers=harness.slice(harness.indexOf('const living='),harness.indexOf('module.exports='));
 const hooks=`const assert={ok(v,m){if(!v)throw Error(m||'test assertion failed');},equal(a,b,m){if(a!==b)throw Error((m||'test assertion failed')+': '+a+' !== '+b);}};
 window.__qa={start,interact,simulate,shoot,reload,brief,pause,spawnWave,move,passable,visibility,localThreat,updateDefuse,keys,drawMini,
  get game(){return game;},get running(){return running;},hold(value){paused=value;},
  deploy(id,mode='campaign'){selected=id;soundOn=false;start(mode);},tactics:window.TVTactics};
 ${helpers}
 Object.assign(window.__qa,{complete:()=>complete(__qa),navigate:(p,o)=>navigate(__qa,p,o),tick:s=>tick(__qa,s),walkTo:(p,o)=>walkTo(__qa,p,o),settle:()=>settle(__qa),traverse:()=>traverse(__qa),
  reachObjective:()=>reachObjective(__qa),escort:()=>escort(__qa),clear:()=>clearForStateTest(__qa),
  engaged:()=>engaged(game),visible:()=>living(game).filter(e=>visibility(game.px,game.py,e.x,e.y))});`;
 const hooked=source.slice(0,end)+hooks+source.slice(end);
 const server=http.createServer((req,res)=>{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html',file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(rel==='game.js'?hooked:fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1}),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(!/^(http:\/\/127\.0\.0\.1:|data:|blob:)/.test(r.url()))external.push(r.url());});
  const url=`http://127.0.0.1:${server.address().port}/`;
  await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.TV3D?.ready||window.TV3D?.error,{},{timeout:60000});
  assert.equal(await page.evaluate(()=>TV3D.ready),true);console.log('R6 character engine ready');
  await page.getByRole('button',{name:'Start Campaign'}).click();await page.locator('#deployBtn').click();
  await page.waitForSelector('#gameHUD:not([hidden])');
  // Real desktop input, including the focused Deploy button left by navigation.
  await page.evaluate(()=>{__qa.deploy(0);window.__jumpRound=__qa.game;});
  const ammoBefore=await page.evaluate(()=>__qa.game.ammo);
  await page.keyboard.down('Space');
  const jump=await page.evaluate(()=>{__qa.tick(.15);TV3D.render(__qa.game);return {height:__qa.game.jumpHeight,cameraY:TV3D.camera.position.y,ammo:__qa.game.ammo,shots:__qa.game.shots,sameRound:__jumpRound===__qa.game};});
  assert.ok(jump.height>.3);assert.ok(Math.abs(jump.cameraY-1.65-jump.height)<1e-6);assert.equal(jump.ammo,ammoBefore);assert.equal(jump.shots,0);assert.equal(jump.sameRound,true);
  await page.keyboard.up('Space');await page.evaluate(()=>__qa.tick(1));assert.equal(await page.evaluate(()=>__qa.game.jumpHeight),0);
  assert.equal(await page.locator('#desktopControls').isVisible(),true);
  const lookBounds=await page.locator('#lookPad').boundingBox();
  await page.mouse.move(lookBounds.x+lookBounds.width*.5,lookBounds.y+lookBounds.height*.5);
  await page.mouse.down({button:'left'});
  const firstClick=await page.evaluate(()=>({shots:__qa.game.shots,locked:!!document.pointerLockElement}));assert.ok(firstClick.shots>=1);
  await page.evaluate(()=>__qa.tick(.45));const heldShots=await page.evaluate(()=>__qa.game.shots);assert.ok(heldShots>firstClick.shots);
  await page.keyboard.down('Space');await page.evaluate(()=>__qa.tick(.1));await page.keyboard.up('Space');
  const beforeSpaceRelease=await page.evaluate(()=>__qa.game.shots);await page.evaluate(()=>__qa.tick(.4));
  assert.ok(await page.evaluate(()=>__qa.game.shots)>beforeSpaceRelease);
  await page.mouse.up({button:'left'});const releasedShots=await page.evaluate(()=>__qa.game.shots);await page.evaluate(()=>__qa.tick(.4));assert.equal(await page.evaluate(()=>__qa.game.shots),releasedShots);
  await page.evaluate(()=>document.exitPointerLock?.());await page.waitForFunction(()=>!document.pointerLockElement);
  const beforeUI=await page.evaluate(()=>__qa.game.shots);await page.locator('#aimBtn').click();assert.equal(await page.evaluate(()=>__qa.game.shots),beforeUI);
  await page.locator('#pauseBtn').click();await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>__qa.game.shots),beforeUI);
  await page.locator('#resumeBtn').click();
  const desktopControls={spaceJump:'passed',cameraFollowsJump:'passed',spaceDoesNotShoot:'passed',leftClick:'passed',heldFire:'passed',spaceReleaseKeepsFire:'passed',mouseReleaseStopsFire:'passed',uiDoesNotFire:'passed',autoPointerLock:firstClick.locked};
  console.log('Desktop jump and mouse firing verified');

  const scenes=[];
  for(const id of Array.from({length:12},(_,i)=>i)){
   await page.evaluate(id=>{__qa.deploy(id);__qa.hold(true);TV3D.render(__qa.game);__qa.drawMini();const c=document.getElementById('scene');c.getContext('2d').clearRect(0,0,c.width,c.height);},id);
   const row=await page.evaluate(async()=>{
    const THREE=await import('/vendor/three/three.module.min.js'),g=__qa.game,
     wall=TV3D.scene.getObjectByName('OPEN_CITY_ENVIRONMENT'),
     origin=new THREE.Vector3(g.px,g.route.floorAt(g.px,g.py)+1.65,g.py);
    const physicalOcclusion=g.enemies.map(e=>{
     const target=new THREE.Vector3(e.x,g.route.floorAt(e.x,e.y)+1.2,e.y),direction=target.clone().sub(origin),distance=direction.length(),
      hit=new THREE.Raycaster(origin,direction.normalize(),.05,distance).intersectObject(wall,true).find(h=>!h.object.material.transparent);
     return !!hit&&hit.distance<distance-.2;
    });
    return {id:g.id+1,map:g.m.map,name:g.route.plan.name,physicalOcclusion,openFraction:g.grid.flat().filter(v=>v===0).length/(96*72),mazeWalls:g.grid.flat().filter(v=>v===31).length,
     visible:__qa.visible().length,engaged:__qa.engaged().length,glError:TV3D.renderer.getContext().getError(),metrics:TV3D.metrics};
   });
   assert.equal(row.visible,0);assert.equal(row.engaged,0);assert.equal(row.glError,0);if(!row.physicalOcclusion.every(Boolean))console.log('OCCLUSION FAILURE',JSON.stringify(row));
   await page.screenshot({path:path.join(out,`start-${id+1}.png`)});
   // Also inspect the landmark-specific middle section at player eye height.
   await page.evaluate(()=>{
    const g=__qa.game,n=g.route.plan.nodes,i=Math.floor(n.length/2),q=n[i+1]||n[i-1];
    __qa.hold(false);g.armor=100000;for(const p of n.slice(1,i+1))__qa.navigate(p);
    g.dir=Math.atan2(q.y-g.py,q.x-g.px);g.pitch=0;__qa.hold(true);TV3D.render(g);
   });
   await page.screenshot({path:path.join(out,`site-${id+1}.png`)});scenes.push(row);console.log('Site geometry / hiding verified',id+1);
  }
  assert.ok(scenes.every(s=>s.physicalOcclusion.every(Boolean)),'every initial guard must have genuine visual cover');
  const missions=await page.evaluate(()=>{
   const rows=[];__qa.hold(false);
   for(let id=0;id<12;id++){
    __qa.deploy(id);const g=__qa.game;g.armor=100000;__qa.traverse();__qa.complete();
    rows.push({id:id+1,success:!__qa.running&&document.getElementById('resultTitle').textContent==='MISSION COMPLETE!',
     kills:g.kills,roster:g.rosterSize,shots:g.shots,bombs:g.devices,bombTotal:g.bombTotal,rescues:g.rescues,
     spawns:g.spawnEvents.length,enteredMuseum:g.enteredMuseum,encounters:g.encounterEvents.map(e=>({id:e.id,label:e.label})),stage:g.stage,steps:g.m.steps.length});
   }return rows;
  });
  assert.ok(missions.every(m=>m.success&&m.spawns===1&&m.bombs===m.bombTotal&&m.shots>0&&m.stage===m.steps));assert.equal(missions[5].enteredMuseum,true);
  // A real F key must be held; a quick tap cannot disarm the objective.
  await page.evaluate(()=>{__qa.deploy(0);__qa.clear();const g=__qa.game;g.px=g.objective.x;g.py=g.objective.y;__qa.tick(.1);});
  await page.keyboard.down('f');await page.evaluate(()=>__qa.tick(1));
  assert.ok(await page.evaluate(()=>__qa.game.defuseProgress>=1));
  await page.keyboard.up('f');await page.evaluate(()=>__qa.tick(.1));assert.equal(await page.evaluate(()=>__qa.game.defuseProgress),0);
  await page.keyboard.down('f');await page.evaluate(()=>__qa.tick(4.1));await page.keyboard.up('f');
  assert.equal(await page.evaluate(()=>__qa.game.devices),1);
  const cityLife=await page.evaluate(async()=>{
   const THREE=await import('/vendor/three/three.module.min.js');__qa.deploy(0);__qa.hold(true);const g=__qa.game;TV3D.render(g);
   const world=TV3D.scene.getObjectByName('OPEN_CITY_ENVIRONMENT'),tower=world.getObjectByName('TAIPEI_101_LANDMARK'),bounds=new THREE.Box3().setFromObject(tower),screen=[];
   for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])screen.push(new THREE.Vector3(x,y,z).project(TV3D.camera).toArray());
   const origin=TV3D.camera.position.clone(),center=bounds.getCenter(new THREE.Vector3());
   const sight=[.08,.25,.45,.65,.9].map(v=>{const p=new THREE.Vector3(center.x,bounds.min.y+(bounds.max.y-bounds.min.y)*v,center.z),direction=p.sub(origin),distance=direction.length(),hit=new THREE.Raycaster(origin,direction.normalize(),.01,distance).intersectObject(world,true).find(h=>!h.object.material.transparent);return !hit||hit.object===tower;});
   const before=g.civilians.map(c=>({x:c.x,y:c.y}));__qa.hold(false);__qa.tick(3);__qa.hold(true);TV3D.render(g);
   return {projectedBounds:screen,visibleTowerSamples:sight,movingPeople:g.civilians.filter((c,i)=>Math.hypot(c.x-before[i].x,c.y-before[i].y)>1).length,
    population:g.civilians.length,rendered:TV3D.metrics.civilians,unarmed:[...TV3D.entries].filter(([k])=>k.startsWith('civilian-')).every(([,e])=>e.ally&&!e.gun.visible),details:world.userData.details};
  });
  assert.ok(cityLife.projectedBounds.every(p=>Math.abs(p[0])<1&&Math.abs(p[1])<1&&p[2]>0&&p[2]<1),'the entire 101 must fit in the initial view');
  assert.ok(cityLife.visibleTowerSamples.filter(Boolean).length>=4,'101 must be visible beyond the street frontage');
  assert.ok(cityLife.population>=12&&cityLife.rendered>=4&&cityLife.rendered<=8&&cityLife.movingPeople>=4&&cityLife.unarmed);
  const museumProgress=await page.evaluate(()=>{
   __qa.deploy(5);__qa.clear();const g=__qa.game,start={x:g.px,y:g.py,stage:g.stage,ground:g.route.floorAt(g.px,g.py)};__qa.hold(false);__qa.navigate(g.objective);__qa.hold(true);TV3D.render(g);
   g.dir=-Math.PI/2;g.pitch=.02;TV3D.render(g);__qa.drawMini();
   return {start,entered:g.enteredMuseum,stage:g.stage,position:{x:g.px,y:g.py,ground:g.route.floorAt(g.px,g.py)},details:TV3D.scene.getObjectByName('OPEN_CITY_ENVIRONMENT').userData.details,spawns:g.spawnEvents.length};
  });
  await page.screenshot({path:path.join(out,'museum-lobby.png')});
  assert.ok(museumProgress.start.y>48&&museumProgress.start.ground===0&&museumProgress.entered&&museumProgress.stage===1&&museumProgress.position.y<35&&museumProgress.position.ground===2.4&&museumProgress.spawns===1);
  assert.ok(museumProgress.details.museumArtifacts>=7&&museumProgress.details.interiorDetails.length>=8);
  await page.evaluate(()=>{__qa.hold(false);__qa.navigate({x:43.5,y:22.5});__qa.hold(true);const g=__qa.game;g.dir=-Math.PI/2;g.pitch=-.025;TV3D.render(g);__qa.drawMini();});
  await page.screenshot({path:path.join(out,'museum-gallery.png')});
  const marketLife=await page.evaluate(()=>{
   __qa.deploy(8);__qa.hold(true);const g=__qa.game,world=TV3D.scene.getObjectByName('OPEN_CITY_ENVIRONMENT');
   return {population:g.civilians.length,vendors:g.civilians.filter(c=>c.stationary&&c.appearance.apron&&!c.appearance.armed).length,details:world.userData.details};
  });
  assert.ok(marketLife.population>=20&&marketLife.vendors>=6&&marketLife.details.stalls===8&&new Set(marketLife.details.productKinds).size===8&&marketLife.details.scooters>=12&&marketLife.details.vehicles>=3);
  for(const view of [{name:'market-buns',x:16.8,y:31.5,dir:1.05,pitch:-.15},{name:'market-drinks',x:49.7,y:31.7,dir:1.0,pitch:-.18},{name:'market-goods',x:16,y:31.5,dir:-Math.PI/2,pitch:-.15}]){
   await page.evaluate(v=>{const g=__qa.game;g.px=v.x;g.py=v.y;g.dir=v.dir;g.pitch=v.pitch;TV3D.render(g);__qa.drawMini();},view);await page.screenshot({path:path.join(out,view.name+'.png')});
  }
  const bodies=await page.evaluate(async()=>{
   const THREE=await import('/vendor/three/three.module.min.js'),rows=[];
   for(const id of [0,4,8,10]){
    __qa.deploy(id);__qa.clear();__qa.hold(true);const g=__qa.game;g.enemies=g.enemies.slice(0,3);g.downeds=g.downeds.slice(0,3);
    for(const fall of [0,.25,.5,1]){for(const e of g.downeds)e.fall=fall;TV3D.render(g);
     for(const entry of TV3D.entries.values())if(entry.dead){entry.root.updateMatrixWorld(true);for(const skin of entry.skins)skin.skeleton.update();const b=new THREE.Box3().setFromObject(entry.pivot,true);rows.push({id,fall,minY:b.min.y,expected:g.route.floorAt(entry.root.position.x,entry.root.position.z)+.012});}}
   }
   return rows;
  });
  assert.equal(bodies.length,48);assert.ok(bodies.every(b=>Math.abs(b.minY-b.expected)<.004));
  const characters=[];
  for(const id of [0,4,8,10]){
   const row=await page.evaluate(id=>{
    __qa.deploy(id);__qa.hold(true);const g=__qa.game;g.px=48;g.py=id===8?31:60;g.dir=-Math.PI/2;g.pitch=-.04;
    g.enemies=g.enemies.slice(0,3);g.enemies.forEach((e,i)=>{e.x=46+i*2;e.y=g.py-5;e.awakened=false;e.facing=Math.PI/2;e.appearance=TVCharacterStyles.enemy(g.theme.theme,i,e.kind);});
    g.objective=null;g.routeGuide=null;TV3D.render(g);__qa.drawMini();const c=document.getElementById('scene');c.getContext('2d').clearRect(0,0,c.width,c.height);
    return {id:id+1,looks:g.enemies.map(e=>e.appearance),rigs:[...TV3D.entries.values()].map(e=>({bones:Object.keys(e.bones).length,skins:e.skins.length}))};
   },id);await page.screenshot({path:path.join(out,`characters-${id+1}.png`)});characters.push(row);
  }
  const runningPoses=await page.evaluate(async()=>{
   const THREE=await import('/vendor/three/three.module.min.js');__qa.deploy(8);__qa.hold(true);const g=__qa.game,e=g.enemies[0];g.enemies=[e];e.x=48;e.y=30;e.awakened=true;e.moving=true;e.locomotionSpeed=3.2;e.intent='run';
   const rows=[];for(let i=0;i<25;i++){g.elapsed+=.05;TV3D.render(g);const entry=TV3D.entries.get('enemy-'+e.id);entry.root.updateMatrixWorld(true);for(const s of entry.skins)s.skeleton.update();const bounds=new THREE.Box3().setFromObject(entry.pivot,true);rows.push({minY:bounds.min.y,head:entry.bones.Head.getWorldPosition(new THREE.Vector3()).y,leg:entry.bones.LeftLeg.quaternion.toArray(),clip:entry.current});}return rows;
  });
  assert.ok(new Set(runningPoses.map(r=>JSON.stringify(r.leg))).size>=20,'run clip must animate, not just have a Run label');
  assert.ok(runningPoses.every(r=>r.clip==='Run'&&r.minY>-.04&&r.minY<.08&&r.head>1.3&&r.head<2.3),'civilian running soles and body proportions');
  const elevations=await page.evaluate(()=>[2,5,10].map(id=>{__qa.deploy(id);__qa.hold(true);const g=__qa.game,p=id===2?{x:64.5,y:28.5}:id===5?{x:52.5,y:28.5}:{x:82.5,y:18.5};g.px=p.x;g.py=p.y;TV3D.render(g);return {id,ground:g.route.floorAt(p.x,p.y),cameraY:TV3D.camera.position.y};}));
  assert.ok(elevations.every(e=>Math.abs(e.cameraY-e.ground-1.65)<1e-5));
  const defenses=await page.evaluate(()=>{
   __qa.hold(false);return [7,11].map(id=>{__qa.deploy(id,'defense');const g=__qa.game;g.armor=100000;for(let i=0;i<3;i++){__qa.clear();__qa.tick(10.1);}return {id:id+1,success:!__qa.running,spawns:g.spawnEvents.length,kills:g.kills};});
  });assert.ok(defenses.every(d=>d.success&&d.spawns===3&&d.kills===12));
  const touch=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});touch.on('pageerror',e=>errors.push(e.message));
  await touch.goto(url,{waitUntil:'networkidle'});await touch.waitForFunction(()=>TV3D.ready);
  await touch.evaluate(()=>{__qa.deploy(0);__qa.clear();const g=__qa.game;g.px=g.objective.x;g.py=g.objective.y;__qa.tick(.1);});
  assert.equal(await touch.locator('#desktopControls').isVisible(),false);
  const shotBefore=await touch.evaluate(()=>__qa.game.shots);await touch.locator('#lookPad').tap({position:{x:150,y:200}});
  assert.equal(await touch.evaluate(()=>__qa.game.shots),shotBefore);await touch.locator('#fireBtn').tap();
  assert.ok(await touch.evaluate(()=>__qa.game.shots)>shotBefore);
  const cdp=await touch.context().newCDPSession(touch),bounds=await touch.locator('#interactBtn').boundingBox(),p={x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await touch.evaluate(()=>__qa.tick(1.5));
  assert.ok(await touch.evaluate(()=>__qa.game.defuseProgress>=1.49));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.evaluate(()=>__qa.tick(.1));
  assert.equal(await touch.evaluate(()=>__qa.game.defuseProgress),0);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await touch.evaluate(()=>__qa.tick(4.1));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await touch.evaluate(()=>__qa.game.devices),1);
  await touch.screenshot({path:path.join(out,'touch-defused.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  const report={build:'TACTICAL R6 · CITY LIFE',browser:await browser.version(),desktopControls,desktopDefuse:'passed',touchDefuse:'passed',touchFire:'passed',touchLookDoesNotFire:'passed',scenes,missions,cityLife,museumProgress,marketLife,characters,runningPoses,elevations,groundedBodies:bodies.length,defenses,errors,externalRequests:external};
  fs.writeFileSync(path.join(out,'site-browser-results.json'),JSON.stringify(report,null,2));console.log('All R6 browser checks passed');
 }finally{if(browser)await browser.close();server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
