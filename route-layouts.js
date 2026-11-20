/* Extended, collision-backed approaches and one-shot ambush activations. */
(()=>{'use strict';
const width=64,height=36,offset={x:36,y:0};
const specs={
 tower:{turnX:13,lowY:24,returnX:29,name:'MALL SERVICE WALK',wall:'#b7c4bc',floor:'#c6cec5'},
 memorial:{turnX:12,lowY:25,returnX:31,name:'COLONNADE AND GARDEN',wall:'#c7c5b8',floor:'#c6c2ae'},
 temple:{turnX:13,lowY:23,returnX:30,name:'TEMPLE SIDE CORRIDOR',wall:'#9c715e',floor:'#b8ab96'},
 museum:{turnX:11,lowY:25,returnX:27,name:'GALLERY ACCESS HALL',wall:'#cec4aa',floor:'#c7c1b1'},
 square:{turnX:14,lowY:26,returnX:32,name:'GARDEN PERIMETER WALK',wall:'#657b56',floor:'#b9c0b1'},
 dome:{turnX:11,lowY:24,returnX:30,name:'STADIUM SERVICE CONCOURSE',wall:'#859497',floor:'#a4b0ae'},
 night:{turnX:14,lowY:22,returnX:31,name:'MARKET SIDE ALLEY',wall:'#75665c',floor:'#827a72'},
 mountain:{turnX:14,lowY:25,returnX:30,name:'LOOKOUT SWITCHBACK TRAIL',wall:'#8b9381',floor:'#a3aa94'}
};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function pointAt(plan,s){
 let remaining=Math.max(0,Math.min(plan.length,s));
 for(let i=0;i<plan.nodes.length-1;i++){
  const a=plan.nodes[i],b=plan.nodes[i+1],len=distance(a,b);
  if(remaining<=len||i===plan.nodes.length-2){const t=Math.min(1,remaining/len);return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,dx:(b.x-a.x)/len,dy:(b.y-a.y)/len,index:i};}
  remaining-=len;
 }
}
function create(theme,siteGrid){
 const spec=specs[theme],nodes=[[3.5,12.5],[spec.turnX+.5,12.5],[spec.turnX+.5,spec.lowY+.5],
  [spec.returnX+.5,spec.lowY+.5],[spec.returnX+.5,12.5],[39.5,12.5],[54.5,12.5]].map(([x,y])=>({x,y}));
 const plan={...spec,theme,width,height,offset:{...offset},nodes,start:{...nodes[0]},siteStart:{x:39.5,y:12.5},
  length:nodes.slice(1).reduce((n,p,i)=>n+distance(nodes[i],p),0)};
 const grid=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>!x||!y||x===width-1||y===height-1?1:31));
 const carve=(a,b,r=2)=>{
  const steps=Math.ceil(distance(a,b)*2);
  for(let i=0;i<=steps;i++){
   const t=steps?i/steps:0,cx=Math.floor(a.x+(b.x-a.x)*t),cy=Math.floor(a.y+(b.y-a.y)*t);
   for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if(x>0&&y>0&&x<width-1&&y<height-1)grid[y][x]=0;
  }
 };
 for(let i=1;i<nodes.length;i++)carve(nodes[i-1],nodes[i]);
 // Keep each landmark's original courtyard/arena/market footprint at the end.
 for(let y=0;y<24;y++)for(let x=0;x<24;x++)grid[y][x+offset.x]=siteGrid[y][x];
 for(let y=10;y<=14;y++)for(let x=34;x<=39;x++)grid[y][x]=0;
 const first=distance(nodes[0],nodes[1]),second=distance(nodes[1],nodes[2]);
 const gates=[5,first+5,first+second+7,plan.length-11];
 plan.encounters=[];
 for(let i=0;i<3;i++){
  const gate=pointAt(plan,gates[i]),anchor=pointAt(plan,gates[i]+3),side=i%2?-1:1,
   nx=-anchor.dy*side,ny=anchor.dx*side,
   branch={x:anchor.x+nx*5,y:anchor.y+ny*5},
   back={x:branch.x-anchor.dx*3,y:branch.y-anchor.dy*3};
  carve(anchor,branch,1);carve(branch,back,1);
  const spots=[back,{x:back.x+anchor.dx,y:back.y+anchor.dy}];
  plan.encounters.push({id:i,trigger:gates[i],gate:{x:gate.x,y:gate.y},exit:{x:anchor.x,y:anchor.y},spots,label:['SIDE ENTRANCE','FIRST TURN','CROSS PASSAGE'][i]});
 }
 // Last team waits behind a real sight-blocking screen, then runs around its end.
 for(let x=44;x<=49;x++)grid[8][x]=31;
 for(const [x,y] of [[46,6],[48,6],[46,7],[48,7]])grid[y][x]=0;
 plan.encounters.push({id:3,trigger:gates[3],gate:{x:43.5,y:12.5},exit:{x:50.5,y:12.5},
  spots:[{x:46.5,y:6.5},{x:48.5,y:6.5}],label:'LANDMARK APPROACH'});
 return {grid,siteGrid,plan};
}
function locate(plan,x,y){
 let best={distance:Infinity,progress:0,index:0},travelled=0;
 for(let i=0;i<plan.nodes.length-1;i++){
  const a=plan.nodes[i],b=plan.nodes[i+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),
   t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(len*len))),d=Math.hypot(x-a.x-dx*t,y-a.y-dy*t);
  if(d<best.distance)best={distance:d,progress:travelled+len*t,index:i};travelled+=len;
 }
 return best;
}
function wakeGroup(g,id,reason='movement'){
 const encounter=g.route?.plan.encounters.find(c=>c.id===id);
 if(!encounter||g.encounterEvents.some(e=>e.id===id))return false;
 const members=g.enemies.filter(e=>e.encounterId===id&&e.state==='active');
 if(!members.length)return false;
 for(const e of members){e.awakened=true;e.emergeTarget={...encounter.exit};e.alertUntil=g.elapsed+10;e.lastSeen={x:g.px,y:g.py};e.intent='emerge';}
 g.encounterEvents.push({id,reason,time:g.elapsed,progress:g.routeProgress,members:members.map(e=>e.id)});return true;
}
function update(g,visibility){
 if(g.mode!=='campaign'||!g.route)return;
 const plan=g.route.plan,position=locate(plan,g.px,g.py);
 if(position.distance<4)g.routeProgress=Math.max(g.routeProgress,position.progress);
 for(const encounter of plan.encounters){
  if(g.routeProgress>=encounter.trigger)wakeGroup(g,encounter.id);
 }
 // A player who peeks into a pocket may alert that team naturally before the gate.
 for(const e of g.enemies)if(e.state==='active'&&e.awakened===false&&Math.hypot(e.x-g.px,e.y-g.py)<12&&visibility(g.px,g.py,e.x,e.y))wakeGroup(g,e.encounterId,'visual-contact');
 const next=plan.nodes[Math.min(plan.nodes.length-1,position.index+1)];
 g.routeGuide=g.m.steps[g.stage]?.[0]==='combat'?{type:'route',x:next.x,y:next.y,index:position.index,active:true}:null;
}
function roster(g,n,createEnemy){
 const plan=g.route.plan;
 for(let group=0;group<4;group++){
  const count=Math.floor(n/4)+(group>=4-n%4?1:0),encounter=plan.encounters[group];
  for(let j=0;j<count;j++){
   const p=encounter.spots[j],heavy=g.id===11&&group===3&&j===count-1;
   const enemy=createEnemy(p.x,p.y,heavy?'heavy':(group+j)%3===2?'shield':'guard');
   if(!enemy)throw Error('Ambush pocket is blocked: '+group);
   Object.assign(enemy,{awakened:false,encounterId:group,emergeTarget:null,intent:'ambush-wait'});
  }
 }
}
function decorate(m,grid,route){
 const p=route.plan,theme=p.theme,h=theme==='night'?3.2:theme==='mountain'?2.55:2.8;
 // Collision and visible occlusion use the same cell faces.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const tile=grid[y][x];if(tile!==31&&tile!==1)continue;
  const H=tile===1?.9:h,cl=tile===1?'#9aa69a':p.wall;
  const faces=[{nx:0,ny:-1,a:[x,0,y],b:[x+1,0,y]},
   {nx:1,ny:0,a:[x+1,0,y],b:[x+1,0,y+1]},
   {nx:0,ny:1,a:[x+1,0,y+1],b:[x,0,y+1]},
   {nx:-1,ny:0,a:[x,0,y+1],b:[x,0,y]}];
  let visible=false;
  for(const face of faces){
   if(grid[y+face.ny]?.[x+face.nx]!==0)continue;visible=true;
   m.quad(face.a,face.b,[face.b[0],H,face.b[2]],[face.a[0],H,face.a[2]],cl);
   m.beam(face.a[0],.42,face.a[2],face.b[0],.42,face.b[2],.055,['temple','mountain'].includes(theme)?'#80664e':'#747f76');
   if(tile===31&&(x+y)%3===0){
    const cx=(face.a[0]+face.b[0])/2+face.nx*.035,cz=(face.a[2]+face.b[2])/2+face.ny*.035,
     alongX=face.ny!==0,panel=(Y,W,T,D,C)=>m.box(cx,Y,cz,alongX?W:D,T,alongX?D:W,C);
    if(theme==='tower'){
     panel(.8,.84,1.35,.055,'#6e999a');panel(.65,.98,.09,.1,'white');
     m.cyl(cx,0,cz,.13,H,'#bfc8bd',10);
    }else if(theme==='memorial'){
     m.cyl(cx,0,cz,.16,H,'#e4e1d4',10);panel(2.6,1.12,.18,.28,'#617d91');
    }else if(theme==='temple'){
     m.cyl(cx,0,cz,.14,H,'#a44736',10);panel(2.5,1.1,.2,.22,'#bb9a5c');
    }else if(theme==='museum'){
     panel(.95,.84,.9,.065,'#a39262');panel(1.03,.66,.73,.085,'#4c6863');
    }else if(theme==='dome'){
     panel(1.35,.86,.6,.06,'#3c6571');panel(2.35,.8,.12,.16,'#d4ddce');
    }else if(theme==='night'){
     panel(.55,.92,1.25,.045,'#625e55');panel(1.85,1.1,.34,.11,'#b18a4b');
     panel(2.22,1.25,.13,.85,(x+y)%2?'#944c3e':'#b08c57');
    }else if(theme==='mountain'){
     m.ball(cx-face.nx*.4,1.3,cz-face.ny*.4,.59,'#8f9684',9);
    }else if(theme==='square'){
     m.ball(cx-face.nx*.45,2.05,cz-face.ny*.45,.6,'#6d8458',9);
    }
   }
  }
  if(!visible||tile!==31)continue;
  m.box(x+.5,H-.04,y+.5,1,.08,1,theme==='square'?'#738660':cl);
 }
 for(let i=1;i<p.nodes.length;i++){
  const a=p.nodes[i-1],b=p.nodes[i],len=distance(a,b),horizontal=a.y===b.y;
  if(Math.min(a.x,b.x)>=36)continue;
  m.box((a.x+b.x)/2,-.05,(a.y+b.y)/2,horizontal?len+5:5,.035,horizontal?5:len+5,p.floor);
  if(theme==='night')for(let s=2;s<len;s+=4){const t=s/len,x=a.x+(b.x-a.x)*t,z=a.y+(b.y-a.y)*t;m.ball(x,3.05,z,.19,'#bd9c55',8);}
 }
 // Restrained floor route cues at corners; they do not trigger interactions.
 for(const node of p.nodes.slice(1,-1)){m.box(node.x,-.005,node.y,.65,.015,.16,'#c0b58d');m.box(node.x,-.004,node.y,.16,.015,.65,'#c0b58d');}
}
window.TVRoutes={width,height,offset,specs,create,pointAt,locate,wakeGroup,update,roster,decorate};
})();
