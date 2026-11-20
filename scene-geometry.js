/* Geometry retained from the eight-site update; rendered by Three.js. */
(()=>{'use strict';
const palette={white:'#f0f8ff',cream:'#e9dfc9',blue:'#195eaa',navy:'#193553',orange:'#ff9e35',gold:'#ffc965',stone:'#c0d6e4',roof:'#1b539c',red:'#d35d54',green:'#529d77',mint:'#77cbb4',teal:'#3d9ba3',glass:'#59b7d4',black:'#2d3a52',wood:'#ad7555',light:'#dff7f7',purple:'#9f77a8'};
const color=c=>{c=palette[c]||c||'#ffffff';let n=parseInt(c.slice(1),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
class Mesh {constructor(){this.a=[];} tri(p,q,r,col){let C=color(col),n=[(q[1]-p[1])*(r[2]-p[2])-(q[2]-p[2])*(r[1]-p[1]),(q[2]-p[2])*(r[0]-p[0])-(q[0]-p[0])*(r[2]-p[2]),(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])];let l=Math.hypot(...n)||1;n=n.map(v=>v/l);for(const v of [p,q,r])this.a.push(...v,...n,...C);} quad(a,b,c,d,col){this.tri(a,b,c,col);this.tri(a,c,d,col);} box(x,y,z,w,h,d,cl,side){const X=x-w/2,Z=z-d/2,Y=y;let p=[[X,Y,Z],[X+w,Y,Z],[X+w,Y,Z+d],[X,Y,Z+d]],q=p.map(v=>[v[0],Y+h,v[2]]);this.quad(p[0],p[3],p[2],p[1],side||cl);this.quad(q[0],q[1],q[2],q[3],cl);for(let i=0;i<4;i++){let j=(i+1)%4;this.quad(p[i],p[j],q[j],q[i],i===1?side||cl:cl);}} cyl(x,y,z,r,h,cl,n=12){const c=color(cl);for(let i=0;i<n;i++){let a=i*Math.PI*2/n,b=(i+1)*Math.PI*2/n,pa=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],pb=[x+Math.cos(b)*r,y,z+Math.sin(b)*r],qa=[pa[0],y+h,pa[2]],qb=[pb[0],y+h,pb[2]];this.quad(pa,pb,qb,qa,cl);this.tri([x,y+h,z],qa,qb,cl);}} ball(x,y,z,r,cl,segments=10){for(let j=0;j<6;j++){let t1=-Math.PI/2+j*Math.PI/6,t2=t1+Math.PI/6;for(let i=0;i<segments;i++){let a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments,P=(t,ang)=>[x+r*Math.cos(t)*Math.cos(ang),y+r*Math.sin(t),z+r*Math.cos(t)*Math.sin(ang)];this.quad(P(t1,a),P(t1,b),P(t2,b),P(t2,a),cl);}}} cone(x,y,z,r,h,cl,n=12){for(let i=0;i<n;i++){let a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;this.tri([x+r*Math.cos(a),y,z+r*Math.sin(a)],[x+r*Math.cos(b),y,z+r*Math.sin(b)],[x,y+h,z],cl);}} beam(x1,y1,z1,x2,y2,z2,r,cl){let dx=x2-x1,dy=y2-y1,dz=z2-z1,len=Math.hypot(dx,dy,dz),ux=dx/len,uy=dy/len,uz=dz/len,ax=Math.abs(uy)<.9?0:1,ay=Math.abs(uy)<.9?1:0,az=0;let bx=uy*az-uz*ay,by=uz*ax-ux*az,bz=ux*ay-uy*ax,bl=Math.hypot(bx,by,bz)||1;bx/=bl;by/=bl;bz/=bl;let cx=uy*bz-uz*by,cy=uz*bx-ux*bz,cz=ux*by-uy*bx;let f=(px,py,pz,i,j)=>[px+(i?bx:-bx)*r+(j?cx:-cx)*r,py+(i?by:-by)*r+(j?cy:-cy)*r,pz+(i?bz:-bz)*r+(j?cz:-cz)*r];let p=[f(x1,y1,z1,0,0),f(x1,y1,z1,1,0),f(x1,y1,z1,1,1),f(x1,y1,z1,0,1)],q=[f(x2,y2,z2,0,0),f(x2,y2,z2,1,0),f(x2,y2,z2,1,1),f(x2,y2,z2,0,1)];for(let i=0;i<4;i++)this.quad(p[i],p[(i+1)%4],q[(i+1)%4],q[i],cl);}}
const deterministic=i=>{let n=Math.sin(i*84.123+9.7)*41231.23;return n-Math.floor(n);};let level=0,staticCount=0,night=false,groundColor='#bcd6e7';
function addTree(m,x,z,k=1){m.cyl(x,0,z,.11*k,2.2*k,'wood',8);m.ball(x,2.6*k,z,.96*k,'green',9);m.ball(x-.45*k,2.25*k,z+.28*k,.68*k,'mint',8);m.ball(x+.45*k,2.45*k,z-.18*k,.62*k,'green',8);}function planter(m,x,z){m.box(x,0,z,1.3,.35,1.3,'stone');m.box(x,.35,z,1.12,.13,1.12,'green');for(let i=0;i<4;i++)m.ball(x+(i%2?-.3:.3),.53,z+(i<2?-.26:.26),.13,i%2?'orange':'purple',7);}
function sideCity(m){for(let i=0;i<13;i++){let z=i%2?-12:36,x=1+i*2.6,h=2+deterministic(i)*5;let cl=i%3===0?'glass':'stone';m.box(x,0,z,2.2,h,3.2,cl);for(let j=0;j<Math.floor(h);j++){m.box(x,.5+j,z+(i%2?1.66:-1.66),1.6,.34,.06,'glass');}if(i%3===0)addTree(m,x-1,z+(i%2?4:-4),.8);}}
function decor(m,theme){
 night=theme==='night';groundColor=night?'#826878':theme==='mountain'?'#89b58b':theme==='temple'?'#c5b7a2':'#bdd0dc';
 m.box(12,-.24,12,90,.18,70,theme==='mountain'?'green':theme==='night'?'wood':'stone');
 // Site-specific walking surfaces, rather than a universal tiled plaza.
 if(theme==='night'){
  m.box(12,-.065,12,24,.055,6,'#9c8b85');for(let x=2;x<23;x+=2)m.box(x,-.032,12,.055,.013,6,'cream');
 }else if(theme==='mountain'){
  for(let x=1;x<23;x++)m.box(x,-.04,12+Math.sin(x*.4)*.65,.96,.04,4.9,x%3?'stone':'cream');
 }else if(theme==='dome'){
  m.box(12,-.04,12,23,.035,21,'#a8bacc');
 }else if(theme==='temple'){
  m.box(12,-.045,12,23,.045,23,'#c5b8a4');for(let x=2;x<23;x+=2)m.box(x,-.01,12,.06,.012,22,'cream');
 }else if(theme==='tower'){
  m.box(12,-.045,12,23,.035,23,'#bddbe8');for(let x=2;x<23;x+=3)m.box(x,-.015,12,.05,.02,22,'white');
  for(let x of [4,12,20]){m.cyl(x,0,2.5,.32,5,'white');m.cyl(x,0,21.5,.32,5,'white');}
 }else if(theme==='museum'){
  m.box(12,-.04,12,23,.035,23,'cream');for(let x=2;x<23;x+=3)m.box(x,-.01,12,.05,.02,23,'white');
 }else if(theme==='memorial'){
  m.box(12,-.04,12,23,.035,23,'cream');for(let x=2;x<23;x+=3)m.box(x,-.01,12,.05,.02,23,'stone');
 }else{
  m.box(12,-.04,12,23,.035,23,'stone');for(let x=2;x<23;x+=4)m.box(x,-.01,12,.045,.018,23,'white');
 }
 if(['memorial','square','museum'].includes(theme))for(let x=3;x<22;x+=4){planter(m,x,2);planter(m,x,22);}
 if(theme==='night'){
  for(let x=2;x<22;x+=2.5){m.beam(x,3.7,3,x,3.7,21,.035,'gold');for(let z=4;z<21;z+=3.6){m.ball(x,3.65,z,.18,'orange',9);m.cyl(x,3.35,z,.1,.25,'red',9);}}
 }
}
function addCover(m,grid,theme){
 for(let z=1;z<23;z++)for(let x=1;x<23;x++){
  let v=grid[z][x];if(!v)continue;let X=x+.5,Z=z+.5;
  if(v===7){ // Taipei 101 structural column
   m.cyl(X,0,Z,.29,4.7,'white');m.cyl(X,3.8,Z,.43,.3,'stone');
  }else if(v===8){ // 101 glass storefront kiosk
   m.box(X,0,Z,1,.85,1.1,'glass');m.box(X,.85,Z,1.12,.12,1.15,'white');m.box(X,.2,Z-.57,.7,.37,.05,'navy');
  }else if(v===9){ // elevator wall and door
   m.box(X,0,Z,1.06,2.9,.46,'stone');m.box(X,0,Z-.27,.74,2.65,.045,'glass');m.box(X,.35,Z-.29,.035,2,.08,'white');
  }else if(v===10){planter(m,X,Z);
  }else if(v===11){ // white carved balustrade / step rail
   m.box(X,0,Z,.97,.68,.44,'white');m.box(X,.68,Z,1.07,.17,.52,'cream');
  }else if(v===12){m.cyl(X,0,Z,.3,3.1,'red');m.cyl(X,3,Z,.38,.19,'gold');
  }else if(v===13){ // bronze incense burner
   m.cyl(X,0,Z,.55,.85,'gold',12);m.cyl(X,.83,Z,.67,.16,'navy',12);m.ball(X,1.18,Z,.25,'gold',10);
  }else if(v===14){ // temple courtyard rail, not cargo crates
   m.box(X,0,Z,.96,.48,.65,'stone');m.box(X,.48,Z,.96,.1,.65,'white');
  }else if(v===15){ // museum display plinth and glass case
   m.box(X,0,Z,.96,.72,.96,'cream');m.box(X,.73,Z,.82,.95,.82,'glass');m.ball(X,1.07,Z,.29,'#6c94ae',10);
  }else if(v===16){ // gallery room divider
   m.box(X,0,Z,.25,2,1.04,'cream');m.box(X,1.1,Z-.4,.15,.7,.12,'gold');
  }else if(v===17){ // Liberty Square landscaped stone bed
   m.box(X,0,Z,1,.43,1,'white');m.box(X,.43,Z,.86,.14,.86,'green');m.ball(X,.8,Z,.35,'mint',9);
  }else if(v===18){ // public plaza bench
   m.box(X,.4,Z,1.05,.17,.45,'wood');m.box(X,.49,Z+.22,1.05,.48,.15,'stone');
  }else if(v===19){ // arena stadium stepped seating
   m.box(X,0,Z,.98,.28,.95,'#757d80');m.box(X,.28,Z,.72,.12,.65,(x+z)%2?'#d5d7d4':'#464d52');m.box(X,.4,Z+.3,.72,.45,.12,'#899195');
  }else if(v===20){ // Taipei Dome turnstiles
   m.box(X,0,Z,.75,.95,.52,'navy');m.box(X,.95,Z,.75,.13,.52,'glass');m.beam(X-.37,.85,Z,X+.37,.85,Z,.06,'white');
  }else if(v===21){ // Raohe food vendor stall, awning and display
   m.box(X,0,Z,1.12,.96,1.02,'wood');m.box(X,.96,Z,1.1,.11,1.06,'cream');m.box(X,1.9,Z,1.35,.17,1.24,(x+z)%2?'orange':'red');
   for(let q=-1;q<=1;q++)m.ball(X+q*.27,1.15,Z-.33,.17,q===0?'gold':'mint',8);
   for(let q of [-.5,.5])m.beam(X+q,1.02,Z-.5,X+q,2,Z-.5,.045,'white');
  }else if(v===22){ // night-market lantern stand
   m.cyl(X,0,Z,.1,2.7,'wood');m.ball(X,2.65,Z,.37,'orange',9);m.cyl(X,2.35,Z,.2,.18,'red');
  }else if(v===23){ // Yangmingshan rock outcrop
   m.ball(X,.3,Z,.77,'#728d84',9);m.ball(X+.3,.65,Z,.48,'#91a59d',8);
  }else if(v===24){ // low wooden lookout railing
   m.beam(X-.46,.25,Z,X-.46,1.1,Z,.085,'wood');m.beam(X+.46,.25,Z,X+.46,1.1,Z,.085,'wood');m.beam(X-.46,1.05,Z,X+.46,1.05,Z,.09,'wood');
  }else m.box(X,0,Z,.95,1.05,.95,'stone');
 }
}

function build(idx,grid){const theme=['tower','memorial','temple','museum','square','dome','night','mountain'][idx];
 const mesh=new Mesh();decor(mesh,theme);addCover(mesh,grid,theme);window.TVSites.build(mesh,theme,Mesh);if(idx===0)sideCity(mesh);
 return new Float32Array(mesh.a);}
window.TVSceneGeometry={Mesh,build};})();
