/* Authored topology, physical hiding places and one-shot proximity encounters. */
(()=>{'use strict';
const width=64,height=48,offset={x:0,y:0},pt=p=>Array.isArray(p)?{x:p[0]+.5,y:p[1]+.5}:{...p},distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function create(theme,_unused,mission=0){
 const spec=window.TVSitePlans[theme==='tower'&&mission===1?'observatory':theme],alternate=[3,9,11].includes(mission),
  grid=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>!x||!y||x===width-1||y===height-1?1:31));
 const rect=(x1,y1,x2,y2,v=0)=>{for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)if(x>0&&y>0&&x<width-1&&y<height-1)grid[y][x]=v;};
 const carve=raw=>{const nodes=raw.slice(0,-1).map(pt),r=raw.at(-1);for(let i=1;i<nodes.length;i++){
  const a=nodes[i-1],b=nodes[i],steps=Math.ceil(distance(a,b)*3);for(let s=0;s<=steps;s++){const t=s/steps,x=Math.floor(a.x+(b.x-a.x)*t),y=Math.floor(a.y+(b.y-a.y)*t);rect(x-r,y-r,x+r,y+r);}
 }};
 for(const [, ...box] of spec.rooms)rect(...box);for(const raw of spec.paths||[])carve(raw);
 for(const [kind,...box] of spec.features)rect(...box,kind==='pond'?33:32);
 for(const [, ...box] of spec.afterRooms||[])rect(...box);for(const raw of spec.afterPaths||[])carve(raw);
 const nodes=(alternate&&spec.alternate?spec.alternate:spec.nodes).map(pt),encounters=(alternate&&spec.alternateTeams?spec.alternateTeams:spec.teams).map(([label,gate,spots,exit,tactics,flank=[]],id)=>({id,label,gate:pt(gate),radius:3.5,spots:spots.map(pt),exit:pt(exit),tactics,flank:flank.map(pt)}));
 const plan={...spec,theme,variant:spec.name,width,height,offset:{...offset},nodes,start:nodes[0],encounters,
  siteStart:pt(spec.siteStart),hostage:pt(spec.hostage),bombs:spec.bombs.map(pt),extraction:pt(alternate&&spec.alternateExit?spec.alternateExit:spec.extraction),
  length:nodes.slice(1).reduce((n,p,i)=>n+distance(nodes[i],p),0),defenseSpots:[]};
 const floor=(x,y,r=.28)=>[[-r,-r],[r,-r],[-r,r],[r,r]].every(([dx,dy])=>grid[Math.floor(y+dy)]?.[Math.floor(x+dx)]===0);
 floor.bounds={width,height};plan.walkLine=[nodes[0]];
 for(let i=1;i<nodes.length;i++)plan.walkLine.push(...window.TVTactics.findPath(nodes[i-1].x,nodes[i-1].y,nodes[i].x,nodes[i].y,floor));
 for(let y=2;y<height-2;y+=2)for(let x=2;x<width-2;x+=2)if(!grid[y][x]&&distance({x:x+.5,y:y+.5},plan.siteStart)>5)plan.defenseSpots.push({x:x+.5,y:y+.5});
 return {grid,siteGrid:null,plan};
}
function pointAt(plan,s){let remain=Math.max(0,Math.min(plan.length,s));for(let i=0;i<plan.nodes.length-1;i++){
 const a=plan.nodes[i],b=plan.nodes[i+1],len=distance(a,b);if(remain<=len||i===plan.nodes.length-2){const t=Math.min(1,remain/len);return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,dx:(b.x-a.x)/len,dy:(b.y-a.y)/len,index:i};}remain-=len;
}}
function locate(plan,x,y){let best={distance:Infinity,progress:0,index:0},travelled=0;for(let i=0;i<plan.nodes.length-1;i++){
 const a=plan.nodes[i],b=plan.nodes[i+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(len*len))),d=Math.hypot(x-a.x-dx*t,y-a.y-dy*t);
 if(d<best.distance)best={distance:d,progress:travelled+len*t,index:i};travelled+=len;
}return best;}
function wakeGroup(g,id,reason='movement'){
 const c=g.route?.plan.encounters.find(c=>c.id===id);if(!c||g.encounterEvents.some(e=>e.id===id))return false;
 const members=g.enemies.filter(e=>e.encounterId===id&&e.state==='active');if(!members.length)return false;
 for(const e of members){e.awakened=true;e.emergeTarget={...c.exit};e.alertUntil=g.elapsed+12;e.lastSeen={x:g.px,y:g.py};e.intent='emerge';}
 g.encounterEvents.push({id,label:c.label,reason,time:g.elapsed,members:members.map(e=>e.id)});return true;
}
function update(g,visibility){
 if(g.mode!=='campaign'||!g.route)return;const plan=g.route.plan,position=locate(plan,g.px,g.py);if(position.distance<4)g.routeProgress=Math.max(g.routeProgress,position.progress);
 for(const c of plan.encounters)if(distance({x:g.px,y:g.py},c.gate)<c.radius)wakeGroup(g,c.id);
 for(const e of g.enemies)if(e.state==='active'&&e.awakened===false&&distance(e,{x:g.px,y:g.py})<14&&visibility(g.px,g.py,e.x,e.y))wakeGroup(g,e.encounterId,'visual-contact');
 // Recompute at tile/stage boundaries; the guide respects walls and shortcuts.
 const target=g.objective,key=target?`${g.stage}:${g.stageDone}:${Math.floor(g.px)},${Math.floor(g.py)}`:'';
 if(g.guideKey!==key){g.guideKey=key;const route=target?window.TVTactics.findPath(g.px,g.py,target.x,target.y,g.passableForRoute):[];
  g.routeGuide=route.length>2?{type:'route',...route[Math.min(3,route.length-1)],index:key,active:true}:null;}
}
function roster(g,n,createEnemy){
 const teams=g.route.plan.encounters;for(let group=0;group<teams.length;group++){
  const count=Math.floor(n/teams.length)+(group<n%teams.length?1:0),c=teams[group];for(let j=0;j<count;j++){
   const p=c.spots[j%c.spots.length],kind=g.id===11&&group===teams.length-1&&j===count-1?'heavy':j%2?'shield':'guard',e=createEnemy(p.x,p.y,kind);
   if(!e)throw Error(`Blocked ${g.theme.theme} guard: ${c.label}`);
   Object.assign(e,{awakened:false,encounterId:group,tactic:c.tactics[j%c.tactics.length],home:{...p},flankRoute:c.flank.map(pt),flankIndex:0,emergeTarget:null,intent:'ambush-wait'});
  }
 }
}
function decorate(m,grid,route){
 const p=route.plan,t=p.theme,H=t==='mountain'?2.65:t==='dome'?4:3.2;
 m.box(32,-.18,24,110,.15,90,t==='mountain'?'#82916e':p.floor);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const v=grid[y][x];if(v!==31&&v!==1)continue;let exposed=false;
  for(const [nx,ny] of [[0,-1],[1,0],[0,1],[-1,0]]){if(grid[y+ny]?.[x+nx]!==0)continue;exposed=true;
   const X=x+.5+nx*.5,Z=y+.5+ny*.5,along=ny!==0;
   // The wall starts at ground level. Dimensions exactly follow collision faces.
   const skyline=t==='tower'&&p.name.includes('89F')&&((x<14||x>53)||(y<9||y>38));
   m.box(X,0,Z,along?1:.035,H,along?.035:1,skyline?'#87b3bd':p.wall);
   if(skyline){
    const panel=(Y,W,T,C)=>m.box(X+nx*.03,Y,Z+ny*.03,along?W:.025,T,along?.025:W,C),bh=.4+((x*7+y*3)%8)*.13;
    panel(.35,.7,bh,'#698d96');panel(0,1,.45,'#bdc9c7');panel(2.8,1,.12,'#d2dbd2');
    m.cyl(X+nx*.04,0,Z+ny*.04,.035,H,'#d5dbd6',5);
   }
   if(t==='temple'||t==='memorial'){
    m.box(X,2.7,Z,along?1.15:.35,.2,along?.35:1.15,t==='temple'?'#944b36':'#58778d');
    if((x+y)%3===0)m.cyl(X,0,Z,.14,2.8,t==='temple'?'#9e3d2b':'#eeeadf',8);
   }else if(t==='night'){
    m.box(X,2.2,Z,along?1.2:.8,.13,along?.8:1.2,(x+y)%2?'#994a3c':'#b19a57');
    if((x+y)%3===0)m.box(X,1.45,Z,along?.8:.06,.38,along?.06:.8,'#c09e5b');
   }else if(t==='mountain'&&(x+y)%2===0){
    m.ball(X-nx*.35,1.1,Z-ny*.35,.7,'#829080',8);for(let k=0;k<3;k++)m.cyl(X-nx*.45+k*.18,0,Z-ny*.45,.04,3+(k%2)*.4,'#6d8058',5);
   }else if(['tower','museum'].includes(t))m.box(X,.8,Z,along?.82:.06,1,along?.06:.82,t==='tower'?'#6e969a':'#9b8c67');
  }if(exposed)m.box(x+.5,H-.04,y+.5,1,.08,1,p.wall);
 }
 for(const [kind,a,b,c,d] of p.features){
  const x=(a+c+1)/2,z=(b+d+1)/2,w=c-a+1,depth=d-b+1;
  if(kind==='pond'){m.box(x,-.02,z,w,.08,depth,'#4a898c');continue;}
  if(kind==='seats'){
   for(let Y=b;Y<=d;Y++)for(let X=a;X<=c;X++)if(grid[Y][X]===32){m.box(X+.5,0,Y+.5,.98,1.15,.98,'#5f6b6c');m.box(X+.5,1.15,Y+.5,.78,.25,.8,(X+Y)%2?'#b6bcba':'#4e5858');m.box(X+.5,1.4,Y+.8,.78,.75,.15,'#86908d');}continue;
  }
  const green=['hedge','grove'].includes(kind),h=green?2.7:kind==='display'?2.1:kind==='stall'?2.2:kind==='incense'?2.2:kind==='terrace'?3.2:3.6;
  m.box(x,0,z,w,h,depth,green?'#69825c':kind==='hall'?'#98533e':kind==='display'?'#8e9b94':p.wall);
  if(['hall','theatre','concert'].includes(kind)){
   window.TVSites.roof(m,x,z,w+.7,depth+.8,h,kind==='hall'?'#964c36':'#bc8441',1.6);
   for(let q=a+.5;q<=c;q+=2){m.cyl(q,0,b-.08,.16,3.3,'#b3523b',8);m.box(q,.5,b-.08,.7,1.5,.08,'#683f32');}
  }else if(kind==='stall'){
   m.box(x,2.2,z,w+.3,.18,depth+.4,'#ac6344');for(let q=a+.5;q<=c;q+=2)m.box(q,.8,b-.06,1.4,.3,.16,'#cbb991');
  }else if(kind==='atrium'){m.box(x,3.6,z,w+.5,.3,depth+.5,'#98a9a2');m.box(x,4,z,w,1,depth,'#6f8f90');}
  else if(kind==='core')for(let q=b+1;q<=d;q+=3)m.box(a-.035,0,q,.08,2.7,1.8,'#4f6c70');
  else if(kind==='display')m.box(x,2.1,z,w,.08,depth,'#cfbd87');
 }
 if(t==='tower'){
  if(p.name.includes('89F')){m.ball(33,3.8,24,2.8,'#ba9d57',18);m.beam(30,7,24,31,5,24,.13,'#89897a');m.beam(36,7,24,35,5,24,.13,'#89897a');}
 }else if(t==='memorial'){
  const part=new window.TVSceneGeometry.Mesh();part.box(0,0,0,9,7,10,'#e8e3d8');part.box(-4.55,0,0,.06,5,3,'#263f4e');
  window.TVSites.octRoof(part,7,8,1.7,'#2c5a86');window.TVSites.octRoof(part,8.2,6.2,2.4,'#234e79');
  window.TVSites.append(m,part,52.5,24.5,0);
 }else if(t==='dome'){
  m.box(32,-.025,24,26,.02,14,'#637f60');for(const [a,b,c,d] of [[25,27,32,20],[32,20,39,27],[39,27,32,30],[32,30,25,27]])m.beam(a,.015,b,c,.015,d,.035,'#d8d4b8');
  for(let x=6;x<60;x+=6){m.beam(x,6,4,x,13,24,.1,'#bec7c5');m.beam(x,13,24,x,6,44,.1,'#bec7c5');}
  m.quad([4,13.2,24],[60,13.2,24],[60,6.2,4],[4,6.2,4],'#859391');m.quad([4,6.2,44],[60,6.2,44],[60,13.2,24],[4,13.2,24],'#859391');
 }else if(t==='night'){
  for(let x=5;x<61;x+=4)for(const y of [19,28]){m.ball(x,3.3,y,.2,'#d69b55',8);m.beam(x,3.6,17,x,3.6,30,.025,'#a38c66');}
  for(const X of [3,60]){
   for(const Z of [17,30])m.cyl(X,0,Z,.28,4,'#8b3e31',9);
   m.beam(X,4,17,X,4,30,.22,'#aa854a');const sign=new window.TVSceneGeometry.Mesh();window.TVSites.sign(sign,'饒河街觀光夜市',0,3.4,0,8,.7,'#5e3f2b','gold');window.TVSites.append(m,sign,X,23.5,Math.PI/2);
  }
 }
 else if(t==='mountain')for(const [x,z] of [[46,17],[34,25]]){m.ball(x,.3,z,2,'#b2b09a',10);m.ball(x,2.3,z,.9,'#d7d9ca',10);m.ball(x+.4,3.7,z,1.3,'#d0d3c8',10);}
 for(const [name,a,b,c] of p.rooms)window.TVSites.sign(m,name,(a+c+1)/2,2.6,b+.05,Math.min(5,c-a),.45,'#314e4d','white');
}
function ceilingAt(g,px,py,r=.21){
 if(g.theme.theme!=='night')return Infinity;let ceiling=Infinity;
 for(let y=Math.floor(py)-2;y<=Math.floor(py)+2;y++)for(let x=Math.floor(px)-2;x<=Math.floor(px)+2;x++)if(g.grid[y]?.[x]===31){
  for(const [nx,ny] of [[0,-1],[1,0],[0,1],[-1,0]])if(g.grid[y+ny]?.[x+nx]===0){const cx=x+.5+nx*.5,cy=y+.5+ny*.5;
   if(Math.abs(px-cx)<(ny?1.2:.8)/2+r&&Math.abs(py-cy)<(ny?.8:1.2)/2+r)ceiling=Math.min(ceiling,2.2);
  }
 }return ceiling;
}
window.TVRoutes={width,height,offset,specs:window.TVSitePlans,create,pointAt,locate,wakeGroup,update,roster,decorate,ceilingAt};
})();
