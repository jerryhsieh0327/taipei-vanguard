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
 window.__qa={start,interact,simulate,shoot,reload,brief,pause,spawnWave,move,passable,visibility,
  get game(){return game;},get running(){return running;},hold(value){paused=value;},
  deploy(id,mode='campaign'){selected=id;soundOn=false;start(mode);},tactics:window.TVTactics};
 ${helpers}
 Object.assign(window.__qa,{tick:s=>tick(__qa,s),walkTo:(p,o)=>walkTo(__qa,p,o),settle:()=>settle(__qa),traverse:()=>traverse(__qa),
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
  assert.equal(await page.evaluate(()=>TV3D.ready),true);console.log('R3 character engine ready');
  await page.getByRole('button',{name:'Start Campaign'}).click();await page.locator('#deployBtn').click();
  await page.waitForSelector('#gameHUD:not([hidden])');
  const scenes=[];
  for(const [map,id] of [0,2,4,5,6,7,8,10].entries()){
   await page.evaluate(id=>{__qa.deploy(id);__qa.hold(true);TV3D.render(__qa.game);},id);
   const initial=await page.evaluate(async()=>{
    const THREE=await import('/vendor/three/three.module.min.js'),g=__qa.game,
     wall=TV3D.scene.children.find(o=>o.isMesh&&o.geometry?.getAttribute('color')),
     origin=new THREE.Vector3(g.px,1.65,g.py);
    const physicalOcclusion=g.enemies.map(e=>{
     const target=new THREE.Vector3(e.x,1.2,e.y),direction=target.clone().sub(origin),distance=direction.length(),
      hit=new THREE.Raycaster(origin,direction.normalize(),.05,distance).intersectObject(wall)[0];
     return !!hit&&hit.distance<distance-.2;
    });
    return {map:g.m.map,length:g.route.plan.length,width:g.grid[0].length,height:g.grid.length,
     visible:__qa.visible().length,engaged:__qa.engaged().length,activated:g.encounterEvents.length,
     roster:g.rosterSize,physicalOcclusion,glError:TV3D.renderer.getContext().getError()};
   });
   assert.equal(initial.visible,0);assert.equal(initial.engaged,0);assert.equal(initial.activated,0);assert.equal(initial.glError,0);
   assert.ok(initial.physicalOcclusion.every(Boolean));
   await page.screenshot({path:path.join(out,`start-${map+1}.png`)});
   const encounter=await page.evaluate(()=>{
    __qa.hold(false);const g=__qa.game,gate=TVRoutes.pointAt(g.route.plan,g.route.plan.encounters[0].trigger+.35);
    __qa.walkTo(gate,{fight:false});__qa.tick(.1);const first=__qa.engaged(),before=first.map(e=>({x:e.x,y:e.y}));
    let sawRunning=false,sawVisible=false;
    for(let i=0;i<80;i++){__qa.simulate(.05);sawRunning||=first.some(e=>e.locomotionSpeed>2.5);sawVisible||=__qa.visible().length>0;if(i>10&&sawRunning&&sawVisible&&first.some(e=>e.intent==='emerge'))break;}
    const guard=first.find(e=>__qa.visibility(g.px,g.py,e.x,e.y))||first[0];
    g.dir=Math.atan2(guard.y-g.py,guard.x-g.px);g.pitch=0;__qa.hold(true);TV3D.render(g);
    return {activated:g.encounterEvents.length,engaged:first.length,visible:__qa.visible().length,sawRunning,sawVisible,
     moved:first.map((e,i)=>Math.hypot(e.x-before[i].x,e.y-before[i].y)),spawnEvents:g.spawnEvents.length,
     clips:first.map(e=>TV3D.entries.get('enemy-'+e.id).current)};
   });
   assert.equal(encounter.activated,1);assert.ok(encounter.engaged>=1&&encounter.engaged<=2);
   assert.ok(encounter.sawRunning&&encounter.sawVisible);assert.ok(encounter.moved.some(d=>d>.75));assert.equal(encounter.spawnEvents,1);
   await page.screenshot({path:path.join(out,`ambush-${map+1}.png`)});
   scenes.push({initial,encounter});console.log('Map',map+1,'hidden -> moving encounter verified');
  }
  const missions=await page.evaluate(()=>{
   const results=[];__qa.hold(false);
   for(let id=0;id<12;id++){
    __qa.deploy(id);const g=__qa.game;g.armor=100000;__qa.traverse();let guard=0;
    while(__qa.running&&guard++<12){if(g.m.steps[g.stage][0]==='escort')__qa.escort();else{__qa.reachObjective();if(__qa.running)__qa.interact();__qa.tick(.35);}}
    results.push({id:id+1,done:!__qa.running,title:document.getElementById('resultTitle').textContent,
     length:g.route.plan.length,progress:g.routeProgress,kills:g.kills,roster:g.rosterSize,
     spawnEvents:g.spawnEvents.length,encounters:g.encounterEvents.map(e=>e.id)});
   }return results;
  });
  assert.ok(missions.every(m=>m.done&&m.title==='MISSION COMPLETE!'&&m.kills===m.roster&&m.spawnEvents===1&&new Set(m.encounters).size===4));
  const backtracking=await page.evaluate(()=>{
   __qa.deploy(0);const g=__qa.game;g.armor=100000;
   const gate=TVRoutes.pointAt(g.route.plan,g.route.plan.encounters[0].trigger+.35);__qa.walkTo(gate);__qa.settle();
   const ids=g.downeds.map(e=>e.id);__qa.walkTo(g.route.plan.start);for(let i=0;i<10;i++)__qa.interact();__qa.walkTo(gate);
   return {events:g.encounterEvents.length,spawns:g.spawnEvents.length,stillDown:ids.every(id=>g.downeds.find(e=>e.id===id)?.state==='disabled')};
  });
  assert.deepEqual(backtracking,{events:1,spawns:1,stillDown:true});
  const bodies=await page.evaluate(async()=>{
   const THREE=await import('/vendor/three/three.module.min.js');__qa.deploy(5);__qa.clear();__qa.tick(.05);
   const g=__qa.game;__qa.reachObjective();__qa.interact();__qa.tick(.35);__qa.hold(true);const rows=[];
   for(const fall of [0,.25,.5,1]){for(const e of g.downeds)e.fall=fall;TV3D.render(g);
    for(const entry of TV3D.entries.values())if(entry.dead){entry.root.updateMatrixWorld(true);for(const skin of entry.skins)skin.skeleton.update();const b=new THREE.Box3().setFromObject(entry.pivot,true);rows.push({fall,minY:b.min.y});}}
   return rows;
  });
  assert.ok(bodies.length>=16&&bodies.every(b=>Math.abs(b.minY-.012)<.004));
  const defenses=await page.evaluate(()=>{
   __qa.hold(false);const rows=[];
   for(const id of [7,11]){__qa.deploy(id,'defense');const g=__qa.game;g.armor=100000;for(let i=0;i<3;i++){__qa.clear();__qa.tick(10.1);}rows.push({id:id+1,done:!__qa.running,kills:g.kills,spawns:g.spawnEvents.length});}return rows;
  });
  assert.ok(defenses.every(d=>d.done&&d.kills===12&&d.spawns===3));
  const touch=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});touch.on('pageerror',e=>errors.push(e.message));
  await touch.goto(url,{waitUntil:'networkidle'});await touch.waitForFunction(()=>window.TV3D?.ready,{},{timeout:60000});
  await touch.evaluate(()=>{__qa.deploy(11);__qa.clear();__qa.tick(.05);const g=__qa.game;g.px=g.objective.x;g.py=g.objective.y;});
  await touch.waitForSelector('#interactBtn',{state:'visible'});await touch.getByRole('button',{name:'Interact',exact:true}).tap();
  assert.equal(await touch.evaluate(()=>__qa.game.spawnEvents.length),1);assert.equal(await touch.evaluate(()=>__qa.game.enemies.filter(e=>e.state==='active').length),0);
  await touch.close();assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  const report={browser:await browser.version(),build:'TACTICAL R3 · AMBUSH ROUTES',scenes,missions,backtracking,
   groundedCases:bodies.length,defenses,touchInteract:'passed',externalRequests:external,errors};
  fs.writeFileSync(path.join(out,'ambush-browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
