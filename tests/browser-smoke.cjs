'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const out=path.resolve(process.env.QA_OUTPUT||path.join(root,'qa'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const source=fs.readFileSync(path.join(root,'game.js'),'utf8');
 const end=source.lastIndexOf('})();');
 const hooked=source.slice(0,end)+`window.__qa={get game(){return game;},get running(){return running;},
   start,prepareStage,nextStage,interact,simulate,shoot,reload,brief,
   deploy(id){selected=id;soundOn=false;start();},
   clear(){for(const e of game.enemies.filter(e=>e.state==='active')){game.px=3.5;game.py=12.5;game.dir=0;e.x=5.5;e.y=12.5;while(e.state==='active'){if(!game.ammo)reload();game.elapsed+=.31;shoot();}}},
   tick(seconds){for(let t=0;t<seconds-1e-8;t+=.05)simulate(.05);},
   objective(){game.px=game.objective.x;game.py=game.objective.y;}};`+source.slice(end);
 const renderer=fs.readFileSync(path.join(root,'renderer3d.js'),'utf8'),renderEnd=renderer.lastIndexOf('})();');
 const renderHooked=renderer.slice(0,renderEnd)+'window.__renderQA={Mesh,actor,get vertices(){return staticCount;}};'+renderer.slice(renderEnd);
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),rel=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  res.end(rel==='game.js'?hooked:rel==='renderer3d.js'?renderHooked:fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  const exe=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p));
  browser=await chromium.launch({executablePath:exe,headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>window.TV3D.ready),true);
  // Exercise real UI navigation and the deploy control before test-only access.
  await page.getByRole('button',{name:'Start Campaign'}).click();
  await page.getByRole('button',{name:'DEPLOY',exact:false}).click();
  await page.waitForSelector('#gameHUD:not([hidden])');
  const scenes=[];
  for(const [map,id] of [0,2,4,5,6,7,8,10].entries()){
   await page.evaluate(({id,map})=>{__qa.deploy(id);if(map===0)__qa.game.pitch=.48;}, {id,map});
   await page.waitForTimeout(160);
   const state=await page.evaluate(()=>{
    const g=__qa.game,gl=TV3D.canvas.getContext('webgl');
    const pixels=[],p=new Uint8Array(4);TV3D.render(g);
    for(let y=1;y<8;y++)for(let x=1;x<8;x++){gl.readPixels(Math.floor(TV3D.canvas.width*x/8),Math.floor(TV3D.canvas.height*y/8),1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);pixels.push(...p);}
    return {map:g.m.map,stage:g.stage,enemies:g.enemies.length,vertices:__renderQA.vertices,glError:gl.getError(),pixels:Array.from(new Set(pixels)).length};
   });
   assert.equal(state.glError,0);assert.ok(state.pixels>8);
   await page.screenshot({path:path.join(out,`scene-${map+1}.png`)});scenes.push(state);
  }
  const missions=await page.evaluate(()=>{
   const results=[];
   for(let id=0;id<12;id++){
    __qa.deploy(id);const g=__qa.game;g.armor=100000;let guard=0;
    while(__qa.running&&guard++<30){
     const type=g.m.steps[g.stage][0];
     if(type==='combat'){__qa.clear();__qa.tick(.05);}
     else if(type==='defend'){__qa.clear();__qa.tick(10.1);}
     else if(type==='escort'){
      g.px=13;g.py=12.5;__qa.tick(3);g.px=7.5;__qa.tick(3);g.px=3.5;__qa.tick(3);
     }else{__qa.objective();__qa.interact();__qa.tick(.35);}
    }
    results.push({id:id+1,done:!__qa.running,title:document.getElementById('resultTitle').textContent,kills:g.kills,devices:g.devices});
   }
   return results;
  });
  assert.ok(missions.every(m=>m.done&&m.title==='MISSION COMPLETE!'));
  const bodies=await page.evaluate(()=>{
   const rows=[];
   for(const kind of ['guard','shield','bot','heavy'])for(const fall of [0,.2,.5,1]){
    const mesh=new __renderQA.Mesh();__renderQA.actor(mesh,0,0,kind,0,0,true,false,fall,.7);
    let min=Infinity,max=-Infinity;
    for(let i=1;i<mesh.a.length;i+=9){min=Math.min(min,mesh.a[i]);max=Math.max(max,mesh.a[i]);}
    rows.push({kind,fall,min,max,finite:mesh.a.every(Number.isFinite)});
   }return rows;
  });
  assert.ok(bodies.every(b=>b.finite&&Math.abs(b.min-.015)<1e-6));
  // Keyboard and touchscreen both dispatch to the same guarded Interact path.
  await page.evaluate(()=>{__qa.deploy(1);__qa.clear();__qa.tick(.05);__qa.objective();});
  await page.keyboard.press('f');
  assert.equal(await page.evaluate(()=>__qa.game.enemies.filter(e=>e.state==='active').length),0);
  await page.evaluate(()=>{__qa.deploy(5);__qa.clear();__qa.tick(.05);__qa.objective();});
  await page.waitForSelector('#interactBtn',{state:'visible'});
  await page.getByRole('button',{name:'Interact',exact:true}).click();
  assert.equal(await page.evaluate(()=>__qa.game.devices),1);
  assert.equal(await page.evaluate(()=>__qa.game.enemies.filter(e=>e.state==='active').length),0);
  const touch=await browser.newPage({viewport:{width:1024,height:768},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  touch.on('pageerror',e=>errors.push(e.message));
  await touch.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle'});
  await touch.evaluate(()=>{__qa.deploy(1);__qa.clear();__qa.tick(.05);__qa.objective();});
  await touch.waitForSelector('#interactBtn',{state:'visible'});
  await touch.getByRole('button',{name:'Interact',exact:true}).tap();
  assert.equal(await touch.evaluate(()=>__qa.game.m.steps[__qa.game.stage][0]),'escort');
  assert.equal(await touch.evaluate(()=>__qa.game.enemies.filter(e=>e.state==='active').length),0);
  await touch.close();
  assert.deepEqual(errors,[]);
  const report={browser:await browser.version(),scenes,missions,groundedActorCases:bodies.length,touchInteract:'passed',errors};
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
