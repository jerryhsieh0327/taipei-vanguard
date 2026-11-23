/* Passive residents and shoppers. Never part of enemy rosters/objectives. */
(()=>{'use strict';
const routes={
 tower:[[[33,57],[42,48],[54,35],[66,28]],[[29,46],[32,35],[43,29],[59,27]]],
 memorial:[[[10,36],[15,31],[30,30],[42,31]],[[40,43],[54,43],[70,45],[82,48]]],
 temple:[[[32,53],[44,54],[58,54],[69,53]],[[31,32],[41,32],[56,32],[65,32]]],
 museum:[[[43,55],[50,54],[61,54],[72,54]],[[33,25],[36,24],[44,24]],[[59,21],[65,22],[73,23]]],
 square:[[[22,34],[37,35],[49,36],[64,38]],[[30,47],[42,50],[56,50],[67,48]]],
 dome:[[[32,68],[44,68],[52,68],[64,68]],[[44,40],[48,45],[55,40]]],
 night:[[[82,30],[69,30],[56,30],[45,31],[35,31],[23,31]],[[12,41],[20,41],[32,41],[44,41],[59,41],[77,41]]],
 mountain:[[[18,58],[25,54],[34,52]],[[76,21],[82,18],[86,23]]]
};
const pt=([x,y])=>({x:x+.5,y:y+.5}),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function track(g,waypoints){
 const path=[pt(waypoints[0])];
 for(let i=1;i<waypoints.length;i++){
  const a=pt(waypoints[i-1]),b=pt(waypoints[i]);path.push(...window.TVTactics.findPath(a.x,a.y,b.x,b.y,g.passableForRoute));
 }
 return path.concat(path.slice(1,-1).reverse());
}
function create(g){
 const theme=g.theme.theme,tracks=routes[theme].map(p=>track(g,p)),count=theme==='night'?16:theme==='tower'?14:theme==='museum'?12:8,people=[];
 for(let i=0;i<count;i++){
  const path=tracks[i%tracks.length],index=Math.floor((i*17+3)%path.length),p=path[index];
  if(!p||!g.passableForRoute(p.x,p.y,.28))throw Error('Blocked civilian path '+theme);
  const appearance=window.TVCharacterStyles.civilian(theme==='night'?'square':theme,i+30);
  appearance.shirt=['#b7cad7','#dbc29d','#afc6a2','#c6b7c8'][i%4];appearance.pants=['#61717b','#7d786a','#556c80'][i%3];
  Object.assign(appearance,{shoppingBag:['tower','night'].includes(theme)&&i%2===0,backpack:theme==='mountain'||i%4===1});
  people.push({id:i+1,...p,appearance,path,index:(index+1)%path.length,home:{...p},state:'active',moving:false,locomotionSpeed:0,facing:Math.atan2(path[(index+1)%path.length].y-p.y,path[(index+1)%path.length].x-p.x),intent:'stroll',walkSpeed:1.05+(i%4)*.12,stationary:false,panicUntil:0,nextPauseAt:5+i%6});
 }
 if(theme==='night'){
  const stalls=g.route.plan.features.filter(f=>f[0]==='stall').slice(0,6);
  for(let i=0;i<stalls.length;i++){
   const [,a,b,c]=stalls[i],p={x:(a+c+1)/2,y:b-1.5},appearance=window.TVCharacterStyles.civilian('night',i);
   people.push({id:100+i,...p,appearance,path:[p],index:0,home:{...p},state:'active',moving:false,locomotionSpeed:0,facing:Math.PI/2,intent:'serve',walkSpeed:1.1,stationary:true,panicUntil:0});
  }
 }
 g.civilianSafePoints=routes[theme].flatMap(r=>[pt(r[0]),pt(r.at(-1))]);return people;
}
function update(g,dt,passable){
 for(const c of g.civilians||[]){
  const before={x:c.x,y:c.y},heard=g.elapsed<(g.shotNoiseUntil||0)&&Math.hypot(c.x-g.px,c.y-g.py)<18;
  if(heard){
   c.panicUntil=g.elapsed+5;
   if(!c.panicRoute&&g.elapsed>=(c.nextPanicPlan||0)){
    const safe=g.civilianSafePoints.reduce((a,b)=>Math.hypot(a.x-g.px,a.y-g.py)>Math.hypot(b.x-g.px,b.y-g.py)?a:b);
    c.panicRoute=window.TVTactics.findPath(c.x,c.y,safe.x,safe.y,passable);c.nextPanicPlan=g.elapsed+3;c.returnRoute=null;
   }
  }
  const panic=g.elapsed<c.panicUntil;
  if(!panic&&!c.stationary&&g.elapsed>=c.nextPauseAt){c.pauseUntil=g.elapsed+1.5;c.nextPauseAt=g.elapsed+9+c.id%5;}
  if(!panic&&c.panicRoute){
   const target=c.stationary?c.home:c.path[c.index];c.returnRoute=window.TVTactics.findPath(c.x,c.y,target.x,target.y,passable);c.panicRoute=null;
  }
  let target;
  if(panic)target=c.panicRoute?.[0];
  else if(c.returnRoute?.length)target=c.returnRoute[0];
  else if(!c.stationary)target=c.path[c.index];
  const heroDistance=Math.hypot(c.x-g.px,c.y-g.py);
  if(target&&dist(c,target)<.16){
   if(panic)c.panicRoute.shift();else if(c.returnRoute?.length)c.returnRoute.shift();else c.index=(c.index+1)%c.path.length;
  }else if(target&&heroDistance>.8&&(panic||g.elapsed>=(c.pauseUntil||0))){
   const d=dist(c,target),step=Math.min(d,(panic?3.1:c.walkSpeed)*dt),dx=(target.x-c.x)/d*step,dy=(target.y-c.y)/d*step;
   if(passable(c.x+dx,c.y,.28))c.x+=dx;if(passable(c.x,c.y+dy,.28))c.y+=dy;
  }
  c.locomotionSpeed=dist(c,before)/Math.max(.001,dt);c.moving=c.locomotionSpeed>.04;c.intent=panic?'flee':c.stationary?'serve':g.elapsed<(c.pauseUntil||0)?'browse':'stroll';
  if(c.moving){const targetAngle=Math.atan2(c.y-before.y,c.x-before.x),turn=Math.atan2(Math.sin(targetAngle-c.facing),Math.cos(targetAngle-c.facing));c.facing+=turn*Math.min(1,dt*7);}
 }
}
window.TVLife={create,update,routes};
})();
