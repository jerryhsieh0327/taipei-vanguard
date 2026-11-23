/* Authored topology, physical hiding places and one-shot proximity encounters. */
(()=>{'use strict';
const width=96,height=72,offset={x:0,y:0},pt=p=>Array.isArray(p)?{x:p[0]+.5,y:p[1]+.5}:{...p},distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function create(theme,_unused,mission=0){
 const spec=window.TVSitePlans[theme==='tower'&&mission===1?'observatory':theme],alternate=[3,9,11].includes(mission),
  grid=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>!x||!y||x===width-1||y===height-1?1:0)),
  occlusion=Array.from({length:height},()=>Array(width).fill(0));
 const floorAt=(x,z)=>{
  if(theme==='mountain')return .7*Math.sin(x*.06)+.5*Math.cos(z*.09)+Math.max(0,(x-25)*.045);
  if(theme==='memorial'&&z>=20&&z<=38&&x>=54&&x<67)return Math.min(3,Math.floor((x-54)*2)*.125);
  if(theme==='museum'){
   if(x>=30&&x<=83&&z>=9&&z<=35)return 2.4;
   if(x>=48&&x<=56&&z>35&&z<=48)return Math.min(2.4,Math.floor((48-z)*2)*.1);
  }return 0;
 };
 for(const [kind,a,b,c,d,h] of spec.features)for(let z=b;z<=d;z++)for(let x=a;x<=c;x++){
  if(x<1||z<1||x>=width-1||z>=height-1)continue;
  grid[z][x]=kind==='pond'?33:32;occlusion[z][x]=kind==='glass'?0:h;
 }
 if(theme==='dome')for(let z=2;z<70;z++)for(let x=2;x<94;x++){
  const r=Math.hypot((x+.5-48)/29,(z+.5-36)/21);
  if(r>1.16&&r<1.48&&Math.abs(x+.5-48)>2.4&&Math.abs(z+.5-36)>2.4){grid[z][x]=35;occlusion[z][x]=1.5+(r-1.16)*8;}
 }
 const nodes=(alternate&&spec.alternate?spec.alternate:spec.nodes).map(pt),encounters=(alternate&&spec.alternateTeams?spec.alternateTeams:spec.teams).map(([label,gate,spots,exit,tactics,flank=[]],id)=>({id,label,gate:pt(gate),radius:5,spots:spots.map(pt),exit:pt(exit),tactics,flank:flank.map(pt)}));
 const plan={...spec,variant:spec.name,width,height,offset:{...offset},nodes,start:pt(alternate&&spec.alternateStart?spec.alternateStart:spec.start),encounters,
  siteStart:pt(spec.siteStart),hostage:pt(spec.hostage),bombs:spec.bombs.map(pt),extraction:pt(alternate&&spec.alternateExit?spec.alternateExit:spec.exit),
  length:nodes.slice(1).reduce((n,p,i)=>n+distance(nodes[i],p),0),defenseSpots:[]};
 const floor=(x,y,r=.28)=>[[-r,-r],[r,-r],[-r,r],[r,r]].every(([dx,dy])=>grid[Math.floor(y+dy)]?.[Math.floor(x+dx)]===0);
 floor.bounds={width,height};plan.walkLine=[plan.start];
 for(let i=1;i<nodes.length;i++)plan.walkLine.push(...window.TVTactics.findPath(nodes[i-1].x,nodes[i-1].y,nodes[i].x,nodes[i].y,floor));
 for(let y=4;y<height-4;y+=3)for(let x=4;x<width-4;x+=3)if(floor(x+.5,y+.5)&&distance({x:x+.5,y:y+.5},plan.siteStart)>6&&distance({x:x+.5,y:y+.5},plan.siteStart)<22)plan.defenseSpots.push({x:x+.5,y:y+.5});
 return {grid,occlusion,floorAt,plan};
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
   Object.assign(e,{appearance:window.TVCharacterStyles.enemy(g.theme.theme,group*2+j,kind),awakened:false,encounterId:group,tactic:c.tactics[j%c.tactics.length],home:{...p},flankRoute:c.flank.map(pt),flankIndex:0,emergeTarget:null,intent:'ambush-wait'});
  }
 }
}
function ceilingAt(g,x,z,r=.21){
 if(g.theme.theme!=='night')return Infinity;
 let H=Infinity;for(const [kind,a,b,c,d] of g.route.plan.features)if(kind==='stall'&&x>a-.5-r&&x<c+1.5+r&&z>b-.5-r&&z<d+1.5+r)H=Math.min(H,2.35);
 return H;
}
window.TVRoutes={width,height,offset,specs:window.TVSitePlans,create,pointAt,locate,wakeGroup,update,roster,ceilingAt};
})();
