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
 window.__qa={start,interact,simulate,shoot,reload,brief,pause,spawnWave,move,passable,visibility,localThreat,updateDefuse,keys,
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
  assert.equal(await page.evaluate(()=>TV3D.ready),true);console.log('R4 character engine ready');
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
   await page.evaluate(id=>{__qa.deploy(id);__qa.hold(true);TV3D.render(__qa.game);},id);
   const row=await page.evaluate(async()=>{
    const THREE=await import('/vendor/three/three.module.min.js'),g=__qa.game,
     wall=TV3D.scene.children.find(o=>o.isMesh&&o.geometry?.getAttribute('color')),
     origin=new THREE.Vector3(g.px,1.65,g.py);
    const physicalOcclusion=g.enemies.map(e=>{
     const target=new THREE.Vector3(e.x,1.2,e.y),direction=target.clone().sub(origin),distance=direction.length(),
      hit=new THREE.Raycaster(origin,direction.normalize(),.05,distance).intersectObject(wall)[0];
     return !!hit&&hit.distance<distance-.2;
    });
    return {id:g.id+1,map:g.m.map,name:g.route.plan.name,physicalOcclusion,
     visible:__qa.visible().length,engaged:__qa.engaged().length,glError:TV3D.renderer.getContext().getError(),metrics:TV3D.metrics};
   });
   assert.equal(row.visible,0);assert.equal(row.engaged,0);assert.equal(row.glError,0);assert.ok(row.physicalOcclusion.every(Boolean),JSON.stringify(row));
   await page.screenshot({path:path.join(out,`start-${id+1}.png`)});
   // Also inspect the landmark-specific middle section at player eye height.
   await page.evaluate(()=>{
    const g=__qa.game,n=g.route.plan.nodes,i=Math.floor(n.length/2),q=n[i+1]||n[i-1];
    __qa.hold(false);g.armor=100000;for(const p of n.slice(1,i+1))__qa.navigate(p);
    g.dir=Math.atan2(q.y-g.py,q.x-g.px);g.pitch=0;__qa.hold(true);TV3D.render(g);
   });
   await page.screenshot({path:path.join(out,`site-${id+1}.png`)});scenes.push(row);console.log('Site geometry / hiding verified',id+1);
  }
  const missions=await page.evaluate(()=>{
   const rows=[];__qa.hold(false);
   for(let id=0;id<12;id++){
    __qa.deploy(id);const g=__qa.game;g.armor=100000;__qa.traverse();__qa.complete();
    rows.push({id:id+1,success:!__qa.running&&document.getElementById('resultTitle').textContent==='MISSION COMPLETE!',
     kills:g.kills,roster:g.rosterSize,shots:g.shots,bombs:g.devices,bombTotal:g.bombTotal,rescues:g.rescues,
     spawns:g.spawnEvents.length,encounters:g.encounterEvents.map(e=>({id:e.id,label:e.label})),stage:g.stage,steps:g.m.steps.length});
   }return rows;
  });
  assert.ok(missions.every(m=>m.success&&m.spawns===1&&m.bombs===m.bombTotal&&m.shots>0&&m.stage===m.steps));
  // A real F key must be held; a quick tap cannot disarm the objective.
  await page.evaluate(()=>{__qa.deploy(0);__qa.clear();const g=__qa.game;g.px=g.objective.x;g.py=g.objective.y;__qa.tick(.1);});
  await page.keyboard.down('f');await page.evaluate(()=>__qa.tick(1));
  assert.ok(await page.evaluate(()=>__qa.game.defuseProgress>=1));
  await page.keyboard.up('f');await page.evaluate(()=>__qa.tick(.1));assert.equal(await page.evaluate(()=>__qa.game.defuseProgress),0);
  await page.keyboard.down('f');await page.evaluate(()=>__qa.tick(4.1));await page.keyboard.up('f');
  assert.equal(await page.evaluate(()=>__qa.game.devices),1);
  const bodies=await page.evaluate(async()=>{
   const THREE=await import('/vendor/three/three.module.min.js');__qa.deploy(5);__qa.clear();__qa.hold(true);const g=__qa.game,rows=[];
   for(const fall of [0,.25,.5,1]){for(const e of g.downeds)e.fall=fall;TV3D.render(g);
    for(const entry of TV3D.entries.values())if(entry.dead){entry.root.updateMatrixWorld(true);for(const skin of entry.skins)skin.skeleton.update();const b=new THREE.Box3().setFromObject(entry.pivot,true);rows.push({fall,minY:b.min.y});}}
   return rows;
  });
  assert.ok(bodies.length>=24&&bodies.every(b=>Math.abs(b.minY-.012)<.004));
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
  const report={build:'TACTICAL R4 · SITE MISSIONS',browser:await browser.version(),desktopControls,desktopDefuse:'passed',touchDefuse:'passed',touchFire:'passed',touchLookDoesNotFire:'passed',scenes,missions,groundedBodies:bodies.length,defenses,errors,externalRequests:external};
  fs.writeFileSync(path.join(out,'site-browser-results.json'),JSON.stringify(report,null,2));console.log('All R4 browser checks passed');
 }finally{if(browser)await browser.close();server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
