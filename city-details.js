/* Original street vehicles, market goods and museum exhibit geometry. */
import * as T from './vendor/three/three.module.min.js';
export function vehicle(b,f,y){
 const {M,mat,add}=b,[kind,a,c,A,C,H]=f,cx=(a+A+1)/2,cz=(c+C+1)/2,w=A-a+1,d=C-c+1,angle=w>=d?0:Math.PI/2;
 const paint=mat('vehicle-paint-'+a%4,[0x648393,0xc3c4b8,0x8f4437,0x454d55][a%4],null,{metalness:.35,roughness:.34});
 const tail=mat('tail-light',0xa52d26,null,{emissive:0x681713,emissiveIntensity:.3}),tyre=mat('rubber',0x242727,null,{roughness:1});
 const part=(g,m,x=0,Y=0,z=0,rotation)=>{if(rotation)g.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(...rotation)));g.translate(x,Y,z);add(g,m,cx,y,cz,[0,angle,0]);};
 const box=(x,Y,z,W,h,D,m)=>part(new T.BoxGeometry(W,h,D),m,x,Y+h/2,z);
 const extrusion=(points,depth,m)=>{
  const shape=new T.Shape();points.forEach(([x,Y],i)=>i?shape.lineTo(x,Y):shape.moveTo(x,Y));shape.closePath();
  const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.04,bevelThickness:.04});g.translate(0,0,-depth/2);part(g,m);
 };
 const panel=(vertices,m)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,1,2,0,2,3].flatMap(i=>vertices[i]),3));g.computeVertexNormals();part(g,m);};
 if(kind==='scooter'){
  const L=1.65,D=.55;
  for(const X of [-.55,.55]){part(new T.TorusGeometry(.2,.075,7,14),tyre,X,.275,0);part(new T.CylinderGeometry(.14,.14,.16,12),M.steel,X,.275,0,[Math.PI/2,0,0]);}
  extrusion([[-.72,.32],[-.62,.64],[-.2,.72],[.22,.45],[.48,.43],[.62,.88],[.39,1.02],[.19,.61],[-.36,.39]],D,paint);
  box(-.27,.73,0,.7,.14,.46,tyre);box(.14,.37,0,.7,.07,.43,M.steel);
  part(new T.CylinderGeometry(.035,.035,.35,7),M.steel,.42,.93,0,[0,0,.28]);
  part(new T.CylinderGeometry(.025,.025,.64,7),tyre,.43,1.1,0,[Math.PI/2,0,0]);
  for(const Z of [-.29,.29]){part(new T.CylinderGeometry(.018,.018,.2,5),M.steel,.4,1.21,Z,[0,0,-.25]);part(new T.SphereGeometry(.07,9,7),M.glass,.37,1.32,Z);}
  box(.6,.89,0,.08,.17,.26,M.ivory);box(-.72,.49,0,.06,.13,.28,tail);box(-.75,.3,0,.04,.12,.22,M.ivory);
  b.stats.scooters++;return;
 }
 const L=Math.max(w,d)*.96,D=Math.min(w,d)*.9,isVan=kind==='van',height=H||1.4;
 for(const X of [-L*.3,L*.3])for(const Z of [-D*.49,D*.49]){
  part(new T.TorusGeometry(.26,.095,8,18),tyre,X,.36,Z);part(new T.CylinderGeometry(.2,.2,.15,14),M.steel,X,.36,Z,[Math.PI/2,0,0]);
 }
 extrusion([[-L*.48,.3],[-L*.5,.53],[-L*.43,.77],[L*.4,.77],[L*.5,.57],[L*.48,.3]],D,paint);
 if(isVan){
  box(-L*.12,.72,0,L*.68,height-.72,D*.97,paint);box(L*.33,.73,0,L*.28,height*.68,D*.92,paint);
  box(L*.479,height*.5,0,.035,height*.22,D*.77,M.glass);
  for(const Z of [-D*.472,D*.472])box(L*.31,1,Z,L*.2,.6,.025,M.glass);
  box(-L*.465,.9,0,.04,height*.6,.035,M.steel);
  for(const Z of [-D*.2,D*.2])box(-L*.49,1.1,Z,.05,.08,.13,M.dark);
 }else{
  const lo=.78,hi=height-.05;
  extrusion([[-L*.31,lo],[-L*.2,hi],[L*.17,hi],[L*.31,lo]],D*.83,paint);
  for(const side of [-1,1]){
   const Z=side*D*.424;panel([[-L*.27,lo+.05,Z],[-L*.18,hi-.06,Z],[L*.15,hi-.06,Z],[L*.27,lo+.05,Z]],M.glass);
   box(0,lo,Z,.04,hi-lo,.035,M.steel);box(-L*.11,.67,side*D*.5,.22,.04,.04,M.steel);
  }
  panel([[L*.18,hi-.035,-D*.39],[L*.18,hi-.035,D*.39],[L*.305,lo+.02,D*.39],[L*.305,lo+.02,-D*.39]],M.glass);
  panel([[-L*.205,hi-.03,-D*.39],[-L*.31,lo+.02,-D*.39],[-L*.31,lo+.02,D*.39],[-L*.205,hi-.03,D*.39]],M.glass);
 }
 for(const Z of [-D*.31,D*.31]){box(L*.495,.53,Z,.045,.18,D*.19,M.ivory);box(-L*.495,.53,Z,.04,.15,D*.18,tail);}
 for(const X of [-L*.505,L*.505]){box(X,.32,0,.07,.1,D*.88,M.steel);box(X,.4,0,.075,.12,.38,M.ivory);}
 b.stats.vehicles++;
}
export function marketGoods(b,f,y){
 const {M,mat,box,cyl,ball,beam,sign,add}=b,[,a,z,A,Z,,label]=f,cx=(a+A+1)/2,cz=(z+Z+1)/2,w=A-a+1;
 const title=label||'台灣小吃',top=y+1.1,cream=mat('food-cream',0xe4c28d),brown=mat('food-brown',0x8a4c2b),red=mat('food-red',0xc96b42),green=mat('food-green',0x6c984b),yellow=mat('food-yellow',0xe8b953),white=mat('porcelain',0xe4e0d2,null,{roughness:.25});
 sign(title,cx,y+2.12,z-.06,w-.45,.38,Math.PI,'#ffe1ad','#67362c');sign(title,cx,y+2.12,Z+1.06,w-.45,.38,0,'#ffe1ad','#67362c');
 const tray=(x,zz,W=1.1,D=.7)=>{box(x,top,zz,W,.035,D,M.steel);};
 const bowl=(x,zz,food)=>{add(new T.CylinderGeometry(.19,.11,.13,14),white,x,top+.09,zz);cyl(x,top+.145,zz,.165,.015,food,14);};
 const steam=(x,zz)=>{for(let i=0;i<3;i++)beam([x+i*.1,top+.25,zz],[x+i*.1-.07,top+.6,zz+.1],.012,M.ivory);};
 if(title==='胡椒餅'){
  for(const dz of [-.7,.55]){tray(cx,cz+dz,3.7,.9);for(let i=0;i<10;i++){const x=a+.65+(i%5)*.9,zz=cz+dz+Math.floor(i/5)*.27-.13;ball(x,top+.15,zz,.2,.13,.19,cream);for(let s=0;s<4;s++)cyl(x+(s%2)*.07-.035,top+.265,zz+Math.floor(s/2)*.06-.03,.009,.008,white,5);}}
  cyl(cx,top+.04,cz,.34,.38,brown,20);cyl(cx,top+.42,cz,.31,.035,M.dark,20);
 }else if(title==='藥燉排骨'){
  for(const X of [cx-.9,cx+.9]){cyl(X,top,cz,.42,.34,M.dark,20);cyl(X,top+.32,cz,.39,.025,brown,20);for(const side of [-1,1])beam([X+side*.4,top+.15,cz-.13],[X+side*.56,top+.15,cz+.13],.04,M.steel);steam(X,cz);}
  for(let i=0;i<6;i++){const x=a+.6+i*.85,zz=z+.45;bowl(x,zz,brown);for(let k=0;k<3;k++){box(x-.1+k*.09,top+.17,zz,.07,.05,.1,cream);ball(x+.08,top+.2,zz+.05,.04,.02,.06,green);}}
 }else if(title==='蚵仔煎'){
  tray(cx,cz,3.8,1.6);box(cx,top+.04,cz,3.6,.035,1.45,M.dark);
  for(let i=0;i<6;i++){const x=a+.8+i%3*1.55,zz=cz+(i<3?-.4:.4);ball(x,top+.1,zz,.46,.045,.32,yellow);for(let k=0;k<4;k++){ball(x+Math.sin(k*2)*.2,top+.15,zz+Math.cos(k)*.15,.08,.02,.04,green);ball(x+Math.cos(k*3)*.2,top+.145,zz+Math.sin(k)*.14,.06,.025,.05,white);}beam([x-.2,top+.15,zz],[x+.22,top+.15,zz+.04],.025,red);}
  box(A-.2,top+.1,Z+.4,.08,.55,.08,M.steel);box(A-.2,top+.08,Z+.4,.25,.035,.3,M.steel);
 }else if(title==='珍珠奶茶'){
  for(let i=0;i<15;i++){const x=a+.5+i%5*1.1,zz=z+.6+Math.floor(i/5)*1.0;add(new T.CylinderGeometry(.14,.1,.32,12),i%3===0?white:cream,x,top+.16,zz);cyl(x,top+.32,zz,.145,.025,white,14);beam([x,top+.33,zz],[x+.025,top+.6,zz],.012,M.dark);for(let k=0;k<4;k++)ball(x+Math.cos(k*1.7)*.08,top+.05,zz+Math.sin(k*1.7)*.08,.025,.025,.025,M.dark);}
  box(cx,top,cz,1,.34,.5,M.wood);
 }else if(title==='水果鮮切'){
  for(let i=0;i<24;i++){const x=a+.5+i%6*.84,zz=z+.5+Math.floor(i/6)*.8;box(x,top,zz,.72,.08,.65,M.wood);ball(x,top+.24,zz,.22,.21,.22,i%3===0?green:i%3===1?yellow:red);}
  for(let i=0;i<3;i++){const x=cx-1+i*1.1;ball(x,top+.16,cz,.4,.16,.33,green);box(x,top+.3,cz,.6,.012,.45,red);}
 }else if(title==='豆花甜品'){
  for(let i=0;i<12;i++){const x=a+.55+i%6*.82,zz=z+.6+Math.floor(i/6)*1.3;bowl(x,zz,white);for(let k=0;k<5;k++)ball(x+Math.cos(k)*.1,top+.18,zz+Math.sin(k)*.1,.04,.025,.04,k%2?brown:yellow);}
  cyl(cx,top,cz,.38,.5,M.steel,20);steam(cx,cz);
 }else if(title==='服飾包包'){
  for(let i=0;i<4;i++){const x=a+.5+i*.95,zz=cz;box(x,top+.1,zz,.66,.075,.8,[M.blue,M.red,M.cream,M.green][i]);box(x,top+.18,zz+.15,.42,.06,.58,[M.red,M.blue,M.green,M.cream][i]);}
  for(let i=0;i<3;i++){const x=a+.6+i*1.4,zz=z+.5;box(x,top+.1,zz,.55,.52,.22,M.wood);add(new T.TorusGeometry(.14,.025,6,14),M.wood,x,top+.7,zz);}
 }else{
  for(let i=0;i<9;i++){const x=a+.5+i%5*.9,zz=z+.5+Math.floor(i/5)*1.2,m=[M.orange,M.blue,M.green][i%3];ball(x,top+.17,zz,.15,.18,.12,m);ball(x,top+.4,zz,.13,.13,.13,m);for(const X of [-.1,.1])ball(x+X,top+.51,zz,.055,.06,.045,m);for(const X of [-.05,.05])ball(x+X,top+.42,zz+.11,.015,.015,.012,M.dark);}
  for(let i=0;i<4;i++)box(a+.6+i*.9,top+.05,Z+.5,.65,.1,.55,[M.red,M.blue,M.orange,M.cream][i]);
 }
 b.stats.stalls++;b.stats.productKinds.push(title);
}
export function artifact(b,x,y,z,type){
 const {M,mat,box,cyl,ball,add,beam}=b,white=mat('ceramic-white',0xd9ddd7,null,{roughness:.25,metalness:.08}),blue=mat('cobalt-blue',0x315780,null,{roughness:.3}),jade=mat('jade',0x638d6b,null,{roughness:.35,metalness:.1}),bronze=mat('bronze',0x6b745a,null,{metalness:.65,roughness:.55});
 if(type==='青花瓷瓶'){
  const points=[[.1,0],[.2,.05],[.3,.18],[.29,.4],[.14,.56],[.095,.72],[.15,.77]].map(p=>new T.Vector2(...p));add(new T.LatheGeometry(points,24),white,x,y,z);
  for(const [r,h] of [[.2,.08],[.297,.3],[.235,.48],[.105,.65]])add(new T.TorusGeometry(r,.017,7,24),blue,x,y+h,z,[Math.PI/2,0,0]);
 }else if(type==='玉器'){
  box(x,y,z,.6,.04,.45,M.wood);for(let i=0;i<7;i++)ball(x+Math.sin(i*2.1)*.18,y+.12+i*.06,z+Math.cos(i)*.08,.12,.2,.08,jade);
 }else if(type==='青銅鼎'){
  add(new T.CylinderGeometry(.3,.22,.36,20),bronze,x,y+.35,z);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;cyl(x+Math.cos(a)*.18,y,z+Math.sin(a)*.18,.045,.23,bronze,8);}
  for(const X of [-.26,.26])add(new T.TorusGeometry(.12,.025,6,16),bronze,x+X,y+.6,z,[0,Math.PI/2,0]);
 }else{
  box(x,y,z,.72,.035,.5,M.cream);for(let i=0;i<5;i++)box(x-.27+i*.13,y+.04,z,.015,.006,.34,M.dark);for(const X of [-.37,.37])cyl(x+X,y,z,.035,.13,M.wood,8);
 }
 b.stats.museumArtifacts++;
}
export function museumInterior(b,route){
 const {M,mat,box,cyl,sign,add,plane}=b,y=2.4;
 box(56,8.08,22,51,.1,24,M.ivory);
 for(const [X,Z] of [[41,16],[69,16],[52,29]]){
  box(X,7.9,Z,3,.08,.65,mat('ceiling-lamp',0xe8e8d5,null,{emissive:0xf6efd5,emissiveIntensity:.7}));
  const light=new T.PointLight(0xfff0cd,55,25,2);light.position.set(X,6.7,Z);b.group.add(light);
 }
 sign('102 導覽大廳',52,6.25,33.8,7,.8,0,'#d9cead','#40544c');sign('103 文獻展示',43,5.9,26.2,6,.65,0);sign('106 珍玩展示',66,5.9,26.2,6,.65,0);
 sign('國立故宮博物院',54,4.75,24.04,7.2,1.05,0,'#d7c99d','#41584d');
 sign('← 書畫文獻',52.1,3.55,24.04,3.2,.6,0,'#dfd7b8','#41584d');sign('珍玩展示 →',55.6,3.55,24.04,3.2,.6,0,'#dfd7b8','#41584d');
 sign('國立故宮博物院 · INFORMATION',37,5.2,30,7,.65,0,'#e6d9ac','#4b6054');
 sign('出口 EXIT',52,5.4,33.4,3,.45,Math.PI,'#e4eadb','#376b52');
 // A visible portal and door jambs make crossing from outside to the lobby clear.
 for(const X of [48.7,55.3])box(X,y,34.2,.2,5.4,.32,M.steel);box(52,7.6,34.2,6.8,.18,.32,M.steel);
 plane(52,34.6,6.3,1.1,M.wood,y+.015);
 const titles=['山水','雅趣','文獻'];
 for(let n=0;n<6;n++){
  const x=35+n*7.8,z=10.06,W=4.5,H=2.25,c=document.createElement('canvas');c.width=512;c.height=256;const p=c.getContext('2d');p.fillStyle='#d8ccb1';p.fillRect(0,0,512,256);
  for(let k=0;k<5;k++){p.fillStyle=['#a4a28e','#878d7f','#656f64','#424e47','#273c32'][k];p.beginPath();p.moveTo(0,240);for(let X=0;X<=512;X+=8)p.lineTo(X,150-k*13-Math.sin(X*.015+k*1.7)*35-Math.sin(X*.031+k)*20);p.lineTo(512,256);p.closePath();p.fill();}
  p.fillStyle='#3c4134';p.font='28px serif';p.fillText(titles[n%3],425,42);p.fillStyle='#a34e38';p.fillRect(462,51,19,19);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;b.registerTexture(tex);
  box(x,3.45,z,W+.2,H+.2,.12,M.wood);const image=new T.PlaneGeometry(W,H);add(image,mat('ink-art-'+n,0xffffff,null,{map:tex,roughness:1,side:T.DoubleSide}),x,4.6,z+.07);
  for(const X of [x-W/2-.1,x+W/2+.1])cyl(X,3.35,z,.06,2.5,M.gold,8);
 }
 for(const [X,Z] of [[44,19],[64,20],[76,23]]){
  for(const dx of [-.7,.7]){cyl(X+dx,y,Z,.04,.85,M.steel,7);add(new T.SphereGeometry(.07,8,5),M.gold,X+dx,y+.9,Z);}
  box(X,y+.7,Z,1.4,.035,.035,M.red);
 }
 b.stats.interiorDetails=['102 orientation lobby','service counter','gallery labels','framed ink studies','ceramics','bronze vessel','jade display','manuscript','case lighting','exit signage'];
}
export function departmentStore(b,f,y){
 const {M,mat,box,sign,roof,cyl}=b,[,a,z,A,Z,h,label]=f,x=(a+A+1)/2,zz=(z+Z+1)/2,w=A-a+1,d=Z-z+1;
 const wall=mat('department-stone',0xb4b3a5,'concrete');box(x,y,zz,w,h,d,wall);box(x,y+h,zz,w+.5,.35,d+.5,M.ivory);
 for(const side of [-1,1]){
  const X=x+side*(w/2+.025);
  for(let level=1;level<5;level++){box(X,y+level*3,zz,.045,1.9,d-2,M.glass);box(X+side*.025,y+level*3-.12,zz,.07,.16,d-1,M.steel);}
  for(let q=z+1;q<Z;q+=3)cyl(X+side*.25,y,q,.12,h,M.steel,7);
  sign(label||'信義新天地',X+side*.06,y+h-2,zz,Math.min(13,d-2),1.5,side>0?Math.PI/2:-Math.PI/2,'#efe1b7','#5a4240');
 }
 for(const Q of [z-.025,Z+1.025]){
  for(let level=1;level<5;level++)box(x,y+level*3,Q,w-2,1.9,.045,M.glass);
  box(x,y,Q,w-3,2.8,.08,M.dark);box(x,y+3,Q,w+1,.18,2,M.steel);
 }
 sign('XINYI SHOPPING',x,y+4.4,Z+1.07,w-2,1.1,0,'#e2dcc8','#343e43');
 b.stats.departmentStores++;
}
