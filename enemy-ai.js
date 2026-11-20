/* Tactical movement on the game's collision grid. No spawning or resurrection. */
(()=>{'use strict';
function findPath(sx,sy,tx,ty,passable){
 const width=passable.bounds?.width||64,height=passable.bounds?.height||36,
  start=[Math.floor(sx),Math.floor(sy)],goal=[Math.floor(tx),Math.floor(ty)],key=(x,y)=>y*width+x;
 const queue=[start],seen=new Set([key(...start)]),parent=new Map();let found=null;
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];if(x===goal[0]&&y===goal[1]){found=[x,y];break;}
  for(const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){
   const k=key(nx,ny);if(nx<1||ny<1||nx>=width-1||ny>=height-1||seen.has(k)||!passable(nx+.5,ny+.5,.28))continue;
   seen.add(k);parent.set(k,[x,y]);queue.push([nx,ny]);
  }
 }
 if(!found)return [];
 const route=[];let p=found;
 while(p[0]!==start[0]||p[1]!==start[1]){route.push({x:p[0]+.5,y:p[1]+.5});p=parent.get(key(...p));}
 return route.reverse();
}
function react(e,g){
 if(e.state!=='active'||g.elapsed<(e.dodgeCooldown||0))return;
 e.reactAt=g.elapsed+.12+Math.random()*.12;
 e.dodgeCooldown=g.elapsed+1.4+Math.random()*.8;
 e.dodgeSide=Math.random()<.5?-1:1;
 e.underFireUntil=g.elapsed+2.5;
}
function seekCover(e,g,world){
 let best=null,score=Infinity;
 for(let y=Math.max(1,Math.floor(e.y)-4);y<Math.min((world.passable.bounds?.height||36)-1,e.y+5);y++)for(let x=Math.max(1,Math.floor(e.x)-4);x<Math.min((world.passable.bounds?.width||64)-1,e.x+5);x++){
  const px=x+.5,py=y+.5,d=Math.hypot(px-e.x,py-e.y);
  if(d<.5||!world.passable(px,py,.28)||world.visibility(g.px,g.py,px,py))continue;
  const s=d+Math.abs(Math.hypot(px-g.px,py-g.py)-7)*.15;
  if(s<score&&findPath(e.x,e.y,px,py,world.passable).length){score=s;best={x:px,y:py};}
 }
 return best;
}
function move(e,vx,vy,speed,dt,passable){
 const length=Math.hypot(vx,vy);if(length<.001)return;
 const dx=vx/length*speed*dt,dy=vy/length*speed*dt;
 // Axis separation allows sliding along cover; every step checks actor radius.
 if(passable(e.x+dx,e.y,.28))e.x+=dx;
 if(passable(e.x,e.y+dy,.28))e.y+=dy;
}
function update(e,g,dt,world){
 if(e.state!=='active')return;
 if(e.awakened===false){e.moving=false;e.locomotionSpeed=0;e.intent='ambush-wait';return;}
 if(e.emergeTarget&&Math.hypot(e.x-e.emergeTarget.x,e.y-e.emergeTarget.y)<.75)e.emergeTarget=null;
 const oldX=e.x,oldY=e.y,d=Math.hypot(e.x-g.px,e.y-g.py),los=world.visibility(e.x,e.y,g.px,g.py);
 e.hitAt=Math.max(0,e.hitAt-dt);e.attackFlash=Math.max(0,(e.attackFlash||0)-dt);
 if(los&&d<19){e.lastSeen={x:g.px,y:g.py};e.alertUntil=g.elapsed+7;}
 if(g.elapsed<(g.shotNoiseUntil||0)&&d<17){e.lastSeen={x:g.px,y:g.py};e.alertUntil=g.elapsed+7;}
 const alert=g.elapsed<(e.alertUntil||0);
 let vx=0,vy=0,speed=0;e.crouching=false;
 if(e.reactAt&&g.elapsed>=e.reactAt){e.reactAt=0;e.dodgeUntil=g.elapsed+.38;}
 if(g.elapsed<(e.dodgeUntil||0)){
  const ux=(g.px-e.x)/(d||1),uy=(g.py-e.y)/(d||1);
  vx=-uy*e.dodgeSide;vy=ux*e.dodgeSide;speed=3.7;e.intent='dodge';
  // If the chosen side is blocked, dodge to the open side instead.
  if(!world.passable(e.x+vx*.35,e.y+vy*.35,.28)){vx=-vx;vy=-vy;}
 }else if(e.emergeTarget){
  let target=e.emergeTarget;e.intent='emerge';
  if(!world.visibility(e.x,e.y,target.x,target.y)){
   if(!e.route||g.elapsed>=(e.repathAt||0)){e.route=findPath(e.x,e.y,target.x,target.y,world.passable);e.repathAt=g.elapsed+.5;}
   while(e.route?.length&&Math.hypot(e.route[0].x-e.x,e.route[0].y-e.y)<.2)e.route.shift();
   target=e.route?.[0]||target;
  }
  vx=target.x-e.x;vy=target.y-e.y;speed=e.kind==='heavy'?2.1:3.25;
 }else if(alert){
  if(g.elapsed>=(e.nextCoverCheck||0)&&e.hp<=e.maxHp*.6&&g.elapsed<(e.underFireUntil||0)){
   e.cover=seekCover(e,g,world);e.nextCoverCheck=g.elapsed+3;e.coverUntil=g.elapsed+3;
  }
  let target;
  if(e.cover&&g.elapsed<e.coverUntil){
   target=e.cover;e.intent='cover';
   if(Math.hypot(target.x-e.x,target.y-e.y)<.5){target=null;e.intent='hold-cover';}
  }else if(!los||d>9){target=e.lastSeen;e.intent=los?'run':'search';}
  else if(d<3){vx=(e.x-g.px)/(d||1);vy=(e.y-g.py)/(d||1);speed=2.3;e.intent='retreat';}
  else{
   if(g.elapsed>=(e.nextStrafe||0)){e.strafeSide=(e.strafeSide||1)*-1;e.nextStrafe=g.elapsed+.8+Math.random()*.7;}
   const ux=(g.px-e.x)/(d||1),uy=(g.py-e.y)/(d||1);
   vx=-uy*e.strafeSide;vy=ux*e.strafeSide;speed=1.45;e.intent='strafe';
   if(!world.passable(e.x+vx*.5,e.y+vy*.5,.28)){e.strafeSide=-e.strafeSide;vx=-vx;vy=-vy;}
  }
  if(target){
   const direct=world.visibility(e.x,e.y,target.x,target.y);
   if(!direct){
    if(!e.route||g.elapsed>=(e.repathAt||0)){e.route=findPath(e.x,e.y,target.x,target.y,world.passable);e.repathAt=g.elapsed+.65;}
    while(e.route?.length&&Math.hypot(e.route[0].x-e.x,e.route[0].y-e.y)<.2)e.route.shift();
    target=e.route?.[0]||target;
   }
   vx=target.x-e.x;vy=target.y-e.y;speed=e.kind==='heavy'?2.1:3.25;
  }
 }else e.intent='hold';
 if(speed){
  for(const other of g.enemies){
   if(other===e||other.state!=='active')continue;
   const gap=Math.hypot(e.x-other.x,e.y-other.y);
   if(gap>.001&&gap<.7){vx+=(e.x-other.x)/gap*(.7-gap)*2;vy+=(e.y-other.y)/gap*(.7-gap)*2;}
  }
  move(e,vx,vy,speed,dt,world.passable);
 }
 e.locomotionSpeed=Math.hypot(e.x-oldX,e.y-oldY)/Math.max(.001,dt);e.moving=e.locomotionSpeed>.08;
 if(e.moving)e.phase+=dt*e.locomotionSpeed*3.6;
 e.facing=los?Math.atan2(g.py-e.y,g.px-e.x):e.moving?Math.atan2(e.y-oldY,e.x-oldX):e.facing;
 // Short bursts with recovery, rather than a continuous damage beam.
 if(los&&d<18&&alert&&e.intent!=='dodge'&&e.intent!=='run'&&e.intent!=='emerge'&&g.elapsed>=(e.nextShot||0)){
  e.burstLeft??=3;e.attackFlash=.08;e.burstLeft--;e.shotsFired=(e.shotsFired||0)+1;
  e.nextShot=g.elapsed+(e.burstLeft>0?.15:1.7+Math.random()*.8);
  if(e.burstLeft<=0)e.burstLeft=3;
  const chance=Math.max(.15,.72-d*.025-(g.wasMoving?.15:0)-(e.moving?.1:0));
  if(Math.random()<chance){
   const damage=(g.m.diff==='Tight'?5:3.5)*(g.elapsed<g.shieldUntil?.25:1);
   g.armor=Math.max(0,g.armor-damage);g.hitFlash=.16;world.onDamage?.();
  }
 }
}
window.TVTactics={findPath,react,update};
})();
