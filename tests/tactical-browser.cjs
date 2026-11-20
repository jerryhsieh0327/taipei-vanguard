'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.QA_OUTPUT||path.join(root,'qa'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.glb':'model/gltf-binary','.json':'application/json'};
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const source=fs.readFileSync(path.join(root,'game.js'),'utf8'),end=source.lastIndexOf('})();');
 const hooked=source.slice(0,end)+`window.__qa={get game(){return game;},get running(){return running;},
  start,interact,simulate,shoot,reload,brief,pause,spawnWave,
  hold(value){paused=value;},deploy(id,mode='campaign'){selected=id;soundOn=false;start(mode);},
  clear(){for(const e of game.enemies.filter(e=>e.state==='active')){game.px=3.5;game.py=12.5;game.pitch=0;game.dir=0;e.x=5.5;e.y=12.5;let guard=0;while(e.state==='active'&&guard++<100){if(!game.ammo)reload();game.elapsed+=.31;shoot();}if(e.state==='active')throw Error('Could not eliminate test target');}},
  tick(seconds){for(let t=0;t<seconds-1e-8;t+=.05)simulate(.05);},
  objective(){game.px=game.objective.x;game.py=game.objective.y;}};`+source.slice(end);
 const server=http.createServer((req,res)=>{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html',file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  res.end(rel==='game.js'?hooked:fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  const exe=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
  browser=await chromium.launch({executablePath:exe,headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:')&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))requests.push(r.url());});
  const url=`http://127.0.0.1:${server.address().port}/`;
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.TV3D?.ready||window.TV3D?.error,{},{timeout:60000});
  const asset=await page.evaluate(()=>({ready:TV3D.ready,error:TV3D.error,asset:TV3D.asset}));
  assert.equal(asset.ready,true,JSON.stringify(asset));console.log('Character engine ready:',JSON.stringify(asset));
  await page.getByRole('button',{name:'Start Campaign'}).click();
  await page.getByRole('button',{name:'DEPLOY — NO RESPAWN',exact:false}).click();
  await page.waitForSelector('#gameHUD:not([hidden])');
  await page.waitForTimeout(400);
  console.log('Frame state',JSON.stringify(await page.evaluate(()=>{
   TV3D.render(__qa.game);const c=document.getElementById('scene');c.getContext('2d').clearRect(0,0,c.width,c.height);
   return {running:__qa.running,armor:__qa.game.armor,elapsed:__qa.game.elapsed,metrics:TV3D.metrics};
  })));
  await page.screenshot({path:path.join(out,'textured-combat.png')});
  if(process.env.QUICK_PREVIEW){
   console.log(JSON.stringify(await page.evaluate(async()=>{
    const THREE=await import('/vendor/three/three.module.min.js');
    return [...TV3D.entries.values()].map(e=>({scale:e.scale,modelScale:e.model.scale.toArray(),position:e.root.position.toArray(),
     bounds:new THREE.Box3().setFromObject(e.model,true),bones:Object.keys(e.bones).length,
     skins:e.skins.map(s=>({name:s.name,visible:s.visible,position:s.position.toArray(),scale:s.scale.toArray(),material:s.material.type,opacity:s.material.opacity,
      bone:s.skeleton.bones[0].getWorldPosition(new THREE.Vector3()).toArray(),vertex:s.getVertexPosition(0,new THREE.Vector3()).applyMatrix4(s.matrixWorld).toArray()}))}));
   }),null,2));console.log(JSON.stringify({asset,errors}));return;
  }
  const scenes=[];
  for(const [map,id] of [0,2,4,5,6,7,8,10].entries()){
   await page.evaluate(({id,map})=>{__qa.deploy(id);if(map===0)__qa.game.pitch=.3;}, {id,map});
   await page.waitForTimeout(120);
   const state=await page.evaluate(async()=>{
    const THREE=await import('/vendor/three/three.module.min.js');
    const g=__qa.game;TV3D.render(g);const gl=TV3D.renderer.getContext();let meshes=0,maps=0,bones=0;
    for(const entry of TV3D.entries.values())entry.model.traverse(o=>{if(o.isSkinnedMesh){meshes++;if(o.material.map)maps++;}if(o.isBone)bones++;});
    const heights=[...TV3D.entries.values()].map(e=>{e.root.updateMatrixWorld(true);for(const skin of e.skins)skin.skeleton.update();const box=new THREE.Box3().setFromObject(e.model,true);return box.max.y-box.min.y;});
    return {map:g.m.map,mode:g.mode,roster:g.rosterSize,spawnEvents:g.spawnEvents.length,meshes,maps,bones,minHeight:Math.min(...heights),maxHeight:Math.max(...heights),glError:gl.getError(),metrics:TV3D.metrics};
   });
   assert.ok(state.meshes>0&&state.maps>0&&state.bones>0);assert.equal(state.glError,0);assert.equal(state.spawnEvents,1);
   assert.ok(state.minHeight>1.4&&state.maxHeight<2.1);
   await page.screenshot({path:path.join(out,`scene-${map+1}.png`)});scenes.push(state);
  }
  const animation=await page.evaluate(()=>{
   __qa.deploy(0);const g=__qa.game,e=g.enemies[0];g.enemies=[e];g.armor=100000;e.x=16.5;e.y=12.5;
   __qa.tick(.2);TV3D.render(g);const entry=TV3D.entries.get('enemy-'+e.id),before=entry.bones.LeftUpLeg.quaternion.toArray(),run=entry.current;
   __qa.tick(.15);TV3D.render(g);const after=entry.bones.LeftUpLeg.quaternion.toArray();
   TVTactics.react(e,g);__qa.tick(.35);TV3D.render(g);
   return {run,legChange:after.reduce((n,v,i)=>n+Math.abs(v-before[i]),0),dodge:e.intent,dodgeSpeed:e.locomotionSpeed,lean:entry.pivot.rotation.z};
  });
  assert.equal(animation.run,'Run');assert.ok(animation.legChange>.01);assert.equal(animation.dodge,'dodge');assert.ok(animation.dodgeSpeed>3&&Math.abs(animation.lean)>.1);
  const missions=await page.evaluate(()=>{
   const rows=[];
   for(let id=0;id<12;id++){
    __qa.deploy(id);const g=__qa.game;g.armor=100000;let guard=0;
    while(__qa.running&&guard++<30){
     const type=g.m.steps[g.stage][0];
     if(type==='combat'){__qa.clear();__qa.tick(.05);}
     else if(type==='escort'){g.px=13;g.py=12.5;__qa.tick(3);g.px=7.5;__qa.tick(3);g.px=3.5;__qa.tick(3);}
     else{__qa.objective();__qa.interact();__qa.tick(.35);}
    }
    rows.push({id:id+1,done:!__qa.running,title:document.getElementById('resultTitle').textContent,kills:g.kills,roster:g.rosterSize,spawns:g.spawnEvents.length});
   }return rows;
  });
  assert.ok(missions.every(m=>m.done&&m.title==='MISSION COMPLETE!'&&m.spawns===1&&m.kills===m.roster));
  // Every corpse is still skinned and grounded after a real terminal interaction.
  const bodies=await page.evaluate(async()=>{
   const THREE=await import('/vendor/three/three.module.min.js');
   __qa.deploy(5);__qa.clear();__qa.tick(.05);const g=__qa.game;
   __qa.objective();__qa.interact();__qa.tick(.35);__qa.hold(true);
   const cases=[];
   for(const fall of [0,.25,.5,1]){
    for(const e of g.downeds)e.fall=fall;
    TV3D.render(g);
    for(const entry of TV3D.entries.values()){
     if(!entry.dead)continue;entry.root.updateMatrixWorld(true);for(const skin of entry.skins)skin.skeleton.update();
     const box=new THREE.Box3().setFromObject(entry.pivot,true);cases.push({fall,minY:box.min.y,height:box.max.y-box.min.y});
    }
   }
   return cases;
  });
  assert.ok(bodies.length>=16&&bodies.every(b=>Math.abs(b.minY-.012)<.004&&Number.isFinite(b.height)));
  await page.evaluate(()=>{const g=__qa.game;g.px=3.5;g.py=12.5;g.dir=0;g.pitch=-.32;TV3D.render(g);});
  await page.screenshot({path:path.join(out,'grounded-after-interact.png')});
  const defenses=await page.evaluate(()=>{
   __qa.hold(false);const rows=[];
   for(const id of [7,11]){
    __qa.deploy(id,'defense');const g=__qa.game;g.armor=100000;
    for(let wave=0;wave<3;wave++){__qa.clear();__qa.tick(10.1);}
    rows.push({id:id+1,done:!__qa.running,mode:g.mode,kills:g.kills,spawnEvents:g.spawnEvents.length});
   }return rows;
  });
  assert.ok(defenses.every(d=>d.done&&d.kills===12&&d.spawnEvents===3));
  await page.evaluate(()=>{__qa.deploy(7);__qa.clear();__qa.tick(.05);__qa.objective();});
  await page.keyboard.press('f');
  assert.equal(await page.evaluate(()=>__qa.game.spawnEvents.length),1);
  assert.equal(await page.evaluate(()=>__qa.game.enemies.filter(e=>e.state==='active').length),0);
  const touch=await browser.newPage({viewport:{width:1024,height:768},isMobile:true,hasTouch:true});
  touch.on('pageerror',e=>errors.push(e.message));await touch.goto(url,{waitUntil:'networkidle'});
  await touch.waitForFunction(()=>window.TV3D?.ready,{},{timeout:60000});
  await touch.evaluate(()=>{__qa.deploy(11);__qa.clear();__qa.tick(.05);__qa.objective();});
  await touch.waitForSelector('#interactBtn',{state:'visible'});await touch.getByRole('button',{name:'Interact',exact:true}).tap();
  assert.equal(await touch.evaluate(()=>__qa.game.spawnEvents.length),1);
  assert.equal(await touch.evaluate(()=>__qa.game.enemies.filter(e=>e.state==='active').length),0);
  await touch.close();assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  const report={browser:await browser.version(),asset,scenes,animation,missions,groundedActorCases:bodies.length,defenses,touchInteract:'passed',externalRequests:requests,errors};
  fs.writeFileSync(path.join(out,'tactical-browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
