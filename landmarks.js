/* Reference-led landmark geometry. These are compressed playable site studies,
 * not measured architectural replicas. See SCENE_REFERENCES.md for sources. */
(()=>{'use strict';
const plans=[
 {area:'Mall entrance / lift lobby',devices:[[18.5,10.5],[18.5,14.5]],point:[18.5,12.5]},
 {area:'Memorial stair approach',devices:[[18.5,12.5],[14.5,13.5]],point:[20.5,12.5]},
 {area:'Temple courtyard',devices:[[18.5,12.5],[16.5,13.5]],point:[20.5,12.5]},
 {area:'North-campus gallery approach',devices:[[18.5,12.5],[14.5,12.5]],point:[20.5,12.5]},
 {area:'Liberty arch / ceremonial axis',devices:[[18.5,11.5],[14.5,13.5]],point:[20.5,12.5]},
 {area:'Baseball field / seating concourse',devices:[[18.5,12.5],[16.5,12.5]],point:[20.5,12.5]},
 {area:'Raohe aisle / east entrance',devices:[[18.5,12.5],[14.5,12.5]],point:[20.5,12.5]},
 {area:'Xiaoyoukeng lookout trail',devices:[[18.5,12.5],[14.5,12.5]],point:[20.5,12.5]}
];
// Local facades face -Z. Rotate them toward the playable approach (+X).
function append(m,part,x,z,yaw=Math.PI/2){
 const c=Math.cos(yaw),s=Math.sin(yaw);
 for(let i=0;i<part.a.length;i+=9){
  const a=part.a,nx=a[i+3],nz=a[i+5];
  m.a.push(x+a[i]*c+a[i+2]*s,a[i+1],z-a[i]*s+a[i+2]*c,
   nx*c+nz*s,a[i+4],-nx*s+nz*c,a[i+6],a[i+7],a[i+8]);
 }
}
function taper(m,x,y,z,bottom,top,h,cl){
 const ring=(w,Y)=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[x+a*w/2,Y,z+b*w/2]);
 const p=ring(bottom,y),q=ring(top,y+h);
 for(let i=0;i<4;i++)m.quad(p[i],p[(i+1)%4],q[(i+1)%4],q[i],cl);
 m.quad(...q,cl);
}
function roof(m,x,z,w,d,y,cl='blue',rise=1.7){
 const ridge=w*.32;
 const lf=[x-w/2,y+.35,z-d/2],rf=[x+w/2,y+.35,z-d/2],
  lb=[x-w/2,y+.35,z+d/2],rb=[x+w/2,y+.35,z+d/2],
  a=[x-ridge,y+rise,z],b=[x+ridge,y+rise,z];
 m.quad(lf,rf,b,a,cl);m.quad(lb,a,b,rb,cl);
 m.tri(lf,a,lb,cl);m.tri(rf,rb,b,cl);
 m.beam(...a,...b,.10,'gold');
 for(const [p,q] of [[lf,rf],[lb,rb],[lf,lb],[rf,rb]])m.beam(...p,...q,.10,cl);
 // Lifted eave tips are geometric details, not a flat roof label.
 for(const p of [lf,rf,lb,rb])m.beam(...p,p[0]+Math.sign(p[0]-x)*.45,p[1]+.5,p[2],.07,'gold');
 for(let u=-w/2+.4;u<w/2;u+=.55){
  const f=Math.min(1,Math.abs(u)/(w/2));
  m.beam(x+u,y+.38,z-d/2,x+u*(.64),y+rise-.04,z,.025,cl==='green'?'#3a836c':'#3c72a6');
 }
}
function octRoof(m,y,r,h,cl){
 for(let i=0;i<8;i++){
  const a=(i/8+.0625)*Math.PI*2,b=((i+1)/8+.0625)*Math.PI*2;
  const p=[Math.cos(a)*r,y,Math.sin(a)*r],q=[Math.cos(b)*r,y,Math.sin(b)*r];
  m.tri(p,q,[0,y+h,0],cl);m.beam(...p,...q,.1,cl);
  m.beam(...p,0,y+h,0,.055,'#5484b4');
 }
}
function stairs(m,x,z,w,n,rise=.17,run=.38){
 for(let i=0;i<n;i++)m.box(x,0,z+i*run,w,(i+1)*rise,run+.02,'#d8d9cf');
 for(const side of [-1,1]){
  m.beam(x+side*w/2,.7,z,x+side*w/2,n*rise+.7,z+(n-1)*run,.13,'white');
  for(let i=0;i<n;i+=3)m.cyl(x+side*w/2,i*rise,z+i*run,.12,.8,'white',8);
 }
}
function sign(m,text,x,y,z,w,h,background='navy',ink='gold'){
 m.box(x,y,z,w,h,.07,background);
 const c=document.createElement('canvas');c.width=384;c.height=64;
 const p=c.getContext('2d');p.fillStyle='#fff';p.font='bold 39px "Microsoft JhengHei", sans-serif';
 p.textAlign='center';p.textBaseline='middle';p.fillText(text,192,32,365);
 const data=p.getImageData(0,0,384,64).data,sx=w/384,sy=h/64;
 // Bake text to the static mesh. No font downloads or texture dependencies.
 for(let v=0;v<64;v+=2)for(let u=0;u<384;u+=2)if(data[(v*384+u)*4+3]>100){
  const a=x+w/2-u*sx,b=y+h-v*sy;
  m.quad([a,b,z-.041],[a-sx*2,b,z-.041],[a-sx*2,b-sy*2,z-.041],[a,b-sy*2,z-.041],ink);
 }
}
function tower(m,Mesh){
 const p=new Mesh();
 p.box(0,0,0,14,3.1,12,'#456d72');p.box(0,3.1,0,15,.25,13,'stone');
 taper(p,0,3.35,0,9,7.4,7,'#508f91');
 for(let i=0;i<8;i++){
  const y=10.35+i*3.45,w=7.1-i*.09;
  taper(p,0,y,0,w-.85,w,3.15,'#4a9295');
  p.box(0,y+3.12,0,w+.35,.23,w+.35,'#b2bfb7');
  for(let row=1;row<=5;row++)p.box(0,y+row*.49,-w/2-.025,w-.2,.045,.05,'#b1d4ce');
  for(let side of [-1,1])p.beam(side*(w/2-.45),y+.3,-w/2-.05,side*(w/2-.1),y+3.1,-w/2-.05,.055,'stone');
 }
 taper(p,0,37.95,0,4.5,2.6,4,'#559f9f');p.cyl(0,41.95,0,.5,3,'stone');p.cyl(0,44.95,0,.1,4,'stone');
 for(let x=-5.5;x<=5.5;x+=1.1){p.box(x,.2,-6.05,.72,2.5,.08,'glass');p.box(x,0,-6.12,.055,3,.1,'stone');}
 sign(p,'TAIPEI 101',0,3.7,-6.6,7,.8,'#24494d','white');
 append(m,p,34,12);
 // Mall/lift-lobby slice: the open sightline keeps the tower visible above it.
 m.box(20.5,0,12,.9,3,9,'#9eb4b5');
 for(const z of [9.5,12,14.5]){m.box(20.04,0,z,.06,2.6,1.6,'#45676e');m.box(20,0,z,.08,2.6,.035,'stone');}
 for(const z of [2.5,21.5])for(let x=3;x<21;x+=3){m.cyl(x,0,z,.25,4.3,'cream');m.box(x,4.25,z,3,.22,2,'stone');}
}
function memorial(m,Mesh){
 const p=new Mesh();
 for(let i=0;i<3;i++)p.box(0,i*.65,0,17-i, .65,14-i,'white');
 p.box(0,1.95,0,11,7.3,10,'#eeeae0');
 p.box(0,2,-5.06,3.7,5.7,.15,'navy');
 for(let x of [-4.7,4.7])p.box(x,1.95,-5.15,.7,7.3,.6,'white');
 octRoof(p,9.25,9,2.25,'#225798');octRoof(p,10.45,7.1,3.5,'#1e4c8f');
 p.ball(0,14.05,0,.32,'gold',10);stairs(p,0,-12,9,16,.122,.43);
 sign(p,'中正紀念堂',0,7.5,-5.2,4.7,.8,'#e9e4d6','navy');
 append(m,p,36,12);
 // Formal approach remains walkable on the level plaza; the full stair flight
 // is outside the collision boundary, rather than an invisible walkable wall.
 for(const z of [3,21])for(let x=4;x<22;x+=2){m.cyl(x,0,z,.11,.8,'white');if(x<20)m.beam(x,.72,z,x+2,.72,z,.1,'white');}
}
function templeHall(p,x,z,w,d,y=0){
 p.box(x,y,z,w,2.8,d,'#985344');roof(p,x,z,w+1.6,d+1.2,y+2.8,'#9b483b',2);
 for(let k=-1;k<=1;k++)p.box(x+k*w*.26,y,z-d/2-.06,w*.17,2.3,.13,'#402f2b');
 for(let k=-2;k<=2;k++)p.cyl(x+k*w*.2,y,z-d/2-.22,.17,2.8,'#ad4333',10);
 // Decorative ridge silhouettes evoke the temple's richly ornamented roofs.
 for(const side of [-1,1])for(let i=0;i<5;i++)p.ball(x+side*(i*.32+.25),y+4.9+Math.sin(i*.7)*.26,z,.12,'gold',7);
}
function temple(m,Mesh){
 const p=new Mesh();templeHall(p,0,0,16,5);templeHall(p,0,9,16,5);templeHall(p,0,17,16,5);
 sign(p,'艋舺龍山寺',0,2.1,-2.8,5.2,.65,'#76392a','gold');append(m,p,28,12);
 // Courtyard flanked by covered side corridors, not free-standing cargo cover.
 for(const z of [3,21]){
  m.box(12,0,z,20,.35,2,'stone');m.box(12,3,z,21,.22,2.7,'#9b483b');
  for(let x=3;x<23;x+=2)m.cyl(x,.35,z,.16,2.65,'#ad4333',10);
 }
}
function museum(m,Mesh){
 const p=new Mesh();p.box(0,0,0,23,1.2,13,'stone');
 for(const x of [-8,0,8]){
  const w=x===0?9:7,y=x===0?7:4.8;
  p.box(x,1.2,0,w,y,9,'#dfcfab');roof(p,x,0,w+1,10,y+1.2,'green',1.7);
  if(x===0){p.box(x,y+2.2,0,5,1.5,5,'cream');roof(p,x,0,6.2,6,y+3.7,'green',1.2);}
  for(let k=-1;k<=1;k++)p.box(x+k*1.9,2,-4.55,.8,2,.08,'#56726b');
 }
 stairs(p,0,-10,8,12,.1,.42);sign(p,'國立故宮博物院',0,5,-4.7,7.3,.9,'#d5bf91','navy');append(m,p,34,12);
 for(let i=0;i<8;i++){const x=28+i*2.5; m.ball(x,3, i%2?-4:28,5,'#47764d',9);}
 // Gallery wings frame the approach while keeping the central view open.
 for(const z of [2,22]){m.box(12,0,z,20,2.8,.45,'cream');for(let x=4;x<21;x+=3)m.box(x,.85,z+(z<12?.25:-.25),1.4,1.1,.08,'#516c73');}
}
function liberty(m,Mesh){
 const p=new Mesh(),posts=[-10,-6,-2,2,6,10];
 // Five openings require six columns. The former model incorrectly had five.
 for(const x of posts){p.box(x,0,0,.65,7.3,1.3,'white');p.box(x,.25,0,1,.35,1.8,'cream');}
 for(let i=0;i<5;i++){
  const x=-8+i*4,h=6.4+(2-Math.abs(i-2))*.75;
  p.box(x,h,0,4.4,.6,1.7,'white');roof(p,x,0,4.9,2.3,h+.65,'blue',.75);
  roof(p,x,0,3.8,1.9,h+1.4,'blue',.65);
 }
 roof(p,0,0,5.5,2.7,9.6,'blue',.85);
 sign(p,'自由廣場',0,7.55,-1,5,1,'white','navy');append(m,p,28,12);
 // The two golden-roofed performing-arts halls flank the ceremonial axis.
 for(const z of [-10,34]){
  const q=new Mesh();q.box(0,0,0,15,1.4,9,'white');q.box(0,1.4,0,13,3.6,7,'red');
  roof(q,0,0,16,10,5,'#b88c3e',2.2);
  for(let x=-5.5;x<=5.5;x+=1.1)q.cyl(x,1.4,-3.7,.15,3.6,'red',8);
  append(m,q,13,z,z<12?Math.PI:0);
 }
}
function dome(m,Mesh){
 // A roofed baseball bowl around the playable field/concourse, rather than a
 // distant wire cage and football-like painted rectangle.
 const cx=12,cz=12,rx=25,rz=21;
 for(let i=0;i<48;i++){
  const a=i*Math.PI*2/48,b=(i+1)*Math.PI*2/48;
  for(let j=0;j<8;j++){
   const p=j/8*Math.PI/2,q=(j+1)/8*Math.PI/2;
   const v=(ang,t)=>[cx+rx*Math.cos(ang)*Math.cos(t),4+14*Math.sin(t),cz+rz*Math.sin(ang)*Math.cos(t)];
   m.quad(v(a,p),v(b,p),v(b,q),v(a,q),'#b5bdc1');
   if(i%3===0)m.beam(...v(a,p),...v(a,q),.065,'white');
  }
 }
 for(let row=0;row<7;row++)for(let i=0;i<64;i++){
  if(i%16===0)continue; // four aisles through the seating bowl
  const a=i*Math.PI*2/64,r=15+row*.7,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r*.84,y=.6+row*.4;
  m.box(x,y,z,.65,.16,.55,(i+row)%3===0?'#343a40':(i+row)%3===1?'#8d9498':'#d4d6d5');
  m.box(x,y+.16,z+.22,.65,.48,.12,'#686f73');
 }
 m.box(12,-.018,12,24,.025,22,'#427b58');
 m.quad([5,.012,12],[10.5,.012,6.5],[16,.012,12],[10.5,.012,17.5],'#b28561');
 m.cyl(10.5,.018,12,.64,.025,'#c3986e',20);
 for(const [x,z] of [[5,12],[10.5,6.5],[16,12],[10.5,17.5]])m.box(x,.03,z,.28,.02,.28,'white');
 m.beam(5,.035,12,20,.035,-3,.028,'white');m.beam(5,.035,12,20,.035,27,.028,'white');
 const board=new Mesh();sign(board,'臺北大巨蛋',0,7,0,9,1.7,'#18262c','white');sign(board,'TAIPEI DOME',0,6,0,8,.8,'#18262c','white');append(m,board,30,12);
 for(const z of [4,20])for(let x=3;x<22;x+=3)m.box(x,8,z,1,.12,.5,'white');
}
function nightMarket(m,Mesh){
 const gate=new Mesh();
 for(const x of [-3.5,3.5]){gate.cyl(x,0,0,.24,4.1,'#a64437',12);gate.box(x,3.3,0,.7,.4,.8,'gold');}
 gate.box(0,3.7,0,8.2,.8,.7,'#9c3b31');roof(gate,0,0,9,2,4.45,'#a65b36',1.1);
 sign(gate,'饒河街觀光夜市',0,3.8,-.5,7,.65,'#8b302c','gold');
 for(const side of [-1,1]){gate.ball(side*3.5,5.1,0,.26,'gold',9);gate.cone(side*3.5,5.3,0,.15,.28,'gold',8);}
 append(m,gate,22.5,12);
 // Dense shopfronts follow the street. Ciyou Temple sits beside the east gate.
 for(const z of [3,21])for(let x=2;x<23;x+=3){
  m.box(x,0,z,2.9,5,3,'#686063');m.box(x,2.5,z+(z<12?1.55:-1.55),2.5,.65,.08,'#b4563d');
  for(let j=0;j<2;j++)m.box(x-.65+j*1.2,3.8,z+(z<12?1.55:-1.55),.8,.8,.08,'#b1bba6');
 }
 const t=new Mesh();templeHall(t,0,0,11,7);templeHall(t,0,6,8,6,2.5);sign(t,'松山慈祐宮',0,2,-3.8,5,.7,'#743f2e','gold');append(m,t,31,1);
}
function mountain(m,Mesh){
 // Yangmingshan is a region: this map explicitly depicts the Xiaoyoukeng
 // lookout/trail, not a generic forest presented as the entire national park.
 const height=(x,z)=>.3+8*Math.exp(-((x-38)**2/220+(z-1)**2/150))+
  6*Math.exp(-((x-48)**2/250+(z-23)**2/170))-3.8*Math.exp(-((x-29)**2/34+(z-5)**2/35));
 for(let x=25;x<65;x+=2)for(let z=-18;z<40;z+=2){
  const v=(a,b)=>[a,Math.max(.15,height(a,b)+Math.sin(a*.5+b)*.23),b];
  m.quad(v(x,z),v(x+2,z),v(x+2,z+2),v(x,z+2),z<10&&x<33?'#999b7e':(x+z)%4?'#658263':'#738970');
 }
 // Exposed hydrothermal scar, yellow sulfur patches and pale fumaroles.
 m.quad([24.8,.05,1],[24.8,.05,10],[28,4.5,9],[29,4.2,.5],'#b4b39a');
 m.tri([24.7,.1,5],[26.3,2.8,7],[27,3.1,3],'#d6c58b');
 for(let i=0;i<11;i++)m.ball(25+det(i)*12,.2+det(i+6),3+det(i+3)*6,.8+det(i+5),'#adae8d',9);
 for(let i=0;i<5;i++){
  const x=25+i*.5,z=5+Math.sin(i)*1.6;
  m.ball(x,.1,z,.55,'#d5c578',9);
  for(let j=0;j<5;j++)m.ball(x+j*.15,.6+j*.67,z,.3+j*.15,'#dce6df',9);
 }
 for(let i=0;i<60;i++){
  const x=1+det(i)*22,z=i%2?5.5:19;
  m.beam(x,0,z,x+.18,.8+det(i+2)*.5,z,.017,'#b0ad79');
 }
 const p=new Mesh();sign(p,'陽明山・小油坑',0,1.1,0,4.4,.7,'#5d5340','white');p.beam(-1.5,0,0,-1.5,1.6,0,.065,'wood');p.beam(1.5,0,0,1.5,1.6,0,.065,'wood');append(m,p,21,17);
}
function det(i){const n=Math.sin(i*74.37+2.1)*41231;return n-Math.floor(n);}
const builders={tower,memorial,temple,museum,square:liberty,dome,night:nightMarket,mountain};
window.TVSites={plans,build(m,theme,Mesh){builders[theme](m,Mesh);}};
})();
