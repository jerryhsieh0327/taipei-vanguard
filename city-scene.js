/* Open streets / courtyards. Original procedural materials and architecture. */
import * as T from './vendor/three/three.module.min.js';
import {vehicle,marketGoods,artifact,museumInterior,departmentStore} from './city-details.js?v=city-life-r6';
const C={stone:0xc9c5b5,ivory:0xe7e3d7,red:0x8f372c,roof:0x984a35,gold:0xbe9853,green:0x456d5b,glass:0x688d9c,steel:0x6e7a7c,wood:0x745440};
function texture(kind){
 const c=document.createElement('canvas');c.width=c.height=256;const p=c.getContext('2d');let seed=101;
 const r=()=>((seed=seed*16807%2147483647)/2147483647);
 const base=kind==='asphalt'?[70,76,78]:kind==='grass'?[91,112,71]:kind==='brick'?[130,91,75]:kind==='tile'?[178,174,158]:[183,184,174];
 const d=p.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){const n=(r()-.5)*(kind==='asphalt'?25:16);for(let k=0;k<3;k++)d.data[i+k]=base[k]+n;d.data[i+3]=255;}p.putImageData(d,0,0);
 if(kind==='tile'||kind==='brick'){
  p.strokeStyle=kind==='brick'?'#645c53':'#96978e';p.lineWidth=1;
  const h=kind==='brick'?32:64,w=kind==='brick'?64:64;
  for(let y=0;y<=256;y+=h){p.beginPath();p.moveTo(0,y);p.lineTo(256,y);p.stroke();for(let x=(y/h%2)*w/2;x<257;x+=w){p.beginPath();p.moveTo(x,y);p.lineTo(x,y+h);p.stroke();}}
 }
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}
function collector(){
 const group=new T.Group(),batches=new Map(),materials=new Map(),textures=[];
 function mat(name,color,tex,extra={}){if(materials.has(name))return materials.get(name);const m=new T.MeshStandardMaterial({color,roughness:.88,...extra});if(tex){m.map=texture(tex);textures.push(m.map);}materials.set(name,m);return m;}
 const M={stone:mat('stone',C.stone),ivory:mat('ivory',C.ivory),red:mat('red',C.red,'brick'),gold:mat('gold',C.gold),wood:mat('wood',C.wood),glass:mat('glass',C.glass,null,{metalness:.5,roughness:.22}),steel:mat('steel',C.steel,null,{metalness:.6,roughness:.4}),tile:mat('tile',0xffffff,'tile'),concrete:mat('concrete',0xffffff,'concrete'),asphalt:mat('asphalt',0xffffff,'asphalt'),grass:mat('grass',0xffffff,'grass'),dark:mat('dark',0x283337),white:mat('white',0xe3e2d1),green:mat('green',0x55714a),leaf:mat('leaf',0x698251),roof:mat('roof',C.roof),blue:mat('blue',0x365a7e),orange:mat('orange',0xc47e37),cream:mat('cream',0xc3b8a1)};
 function add(g,m,x=0,y=0,z=0,rotation,scale){const q=new T.Quaternion();if(rotation)q.setFromEuler(new T.Euler(...rotation));g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),q,new T.Vector3(...(scale||[1,1,1]))));if(g.index){const n=g.toNonIndexed();g.dispose();g=n;}if(!batches.has(m))batches.set(m,[]);batches.get(m).push(g);}
 function box(x,y,z,w,h,d,m=M.stone){if(h<=0||w<=0||d<=0)return;add(new T.BoxGeometry(w,h,d),m,x,y+h/2,z);}
 function cyl(x,y,z,r,h,m=M.stone,n=12){add(new T.CylinderGeometry(r,r,h,n),m,x,y+h/2,z);}
 function ball(x,y,z,rx,ry,rz,m=M.leaf){add(new T.SphereGeometry(1,10,7),m,x,y,z,null,[rx,ry,rz]);}
 function beam(a,b,r,m=M.steel){const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A),g=new T.CylinderGeometry(r,r,v.length(),7);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.normalize()));const p=A.add(B).multiplyScalar(.5);add(g,m,p.x,p.y,p.z);}
 function plane(x,z,w,d,m=M.tile,y=.006){const g=new T.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);const uv=g.getAttribute('uv');for(let i=0;i<uv.count;i++){uv.setXY(i,uv.getX(i)*w/3,uv.getY(i)*d/3);}add(g,m,x,y,z);}
 function sign(text,x,y,z,w,h,yaw=0,color='#e7d6ad',bg='#403b31'){
  const c=document.createElement('canvas');c.width=Math.max(256,Math.min(2048,Math.round(w/h*96)));c.height=96;const p=c.getContext('2d');p.fillStyle=bg;p.fillRect(0,0,c.width,96);p.strokeStyle=color;p.lineWidth=2;p.strokeRect(4,4,c.width-8,88);p.fillStyle=color;p.font='bold 53px "Microsoft JhengHei",sans-serif';p.textAlign='center';p.textBaseline='middle';p.fillText(text,c.width/2,50,c.width-24);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const material=new T.MeshStandardMaterial({map:tex,roughness:.7,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.12,side:T.FrontSide});materials.set('sign-'+materials.size,material);add(new T.PlaneGeometry(w,h),material,x,y,z,[0,yaw,0]);
 }
 function roof(x,z,w,d,y,m=M.roof,rise=2){
  const g=new T.BufferGeometry(),pts=[[-w/2,0,-d/2],[w/2,0,-d/2],[w*.32,rise,0],[-w*.32,rise,0],[-w/2,0,d/2],[w/2,0,d/2]],idx=[0,1,2,0,2,3,4,3,2,4,2,5,0,3,4,1,5,2];g.setAttribute('position',new T.Float32BufferAttribute(idx.flatMap(i=>pts[i]),3));g.computeVertexNormals();g.setAttribute('uv',new T.Float32BufferAttribute(idx.flatMap(i=>[(pts[i][0]+w/2)/2,(pts[i][2]+d/2)/2]),2));add(g,m,x,y,z);
  for(const Z of [z-d/2,z+d/2])beam([x-w/2,y,Z],[x+w/2,y,Z],.14,m);
  for(const X of [-1,1])for(const Z of [-1,1])beam([x+X*w/2,y,z+Z*d/2],[x+X*(w/2+.5),y+.6,z+Z*(d/2+.25)],.12,m);
  beam([x-w*.32,y+rise,z],[x+w*.32,y+rise,z],.13,M.gold);
 }
 function tree(x,z,h=6,y=0){cyl(x,y,z,.22,h*.6,M.wood,7);ball(x,y+h*.78,z,h*.36,h*.29,h*.34,M.leaf);ball(x-.8,y+h*.67,z+.7,h*.26,h*.26,h*.25,M.green);}
 function streetLamp(x,z,h=7){cyl(x,0,z,.08,h,M.steel,6);beam([x,h,z],[x+1,h,z],.07,M.steel);box(x+1,h-.1,z,.8,.12,.45,M.cream);}
 function cityBlock(x,z,w,d,h,style=0){
  const wall=mat('city'+style,[0x9d9b8e,0x787f7c,0xb4aa99,0x758c94][style%4]);box(x,0,z,w,h,d,wall);box(x,h,z,w+.3,.25,d+.3,M.stone);
  for(let y=2;y<h-1;y+=2.5)for(let X=-w/2+1;X<w/2;X+=2.3){box(x+X,y,z-d/2-.025,1.25,1.5,.045,M.glass);box(x+X,y,z+d/2+.025,1.25,1.5,.045,M.glass);}
  for(let y=2;y<h-1;y+=2.5)for(let Z=-d/2+1;Z<d/2;Z+=2.3){box(x-w/2-.025,y,z+Z,.045,1.5,1.25,M.glass);box(x+w/2+.025,y,z+Z,.045,1.5,1.25,M.glass);}
  box(x+w*.28,h,z,.9,1.3,1.3,M.steel);
 }
 function finish(){
  for(const [material,geoms] of batches){let count=0;for(const g of geoms)count+=g.getAttribute('position').count;const pos=new Float32Array(count*3),norm=new Float32Array(count*3),uv=new Float32Array(count*2);let n=0;
   for(const g of geoms){const p=g.getAttribute('position'),N=g.getAttribute('normal'),U=g.getAttribute('uv');pos.set(p.array,n*3);norm.set(N.array,n*3);if(U)uv.set(U.array,n*2);n+=p.count;g.dispose();}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(norm,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.computeBoundingSphere();const mesh=new T.Mesh(g,material);mesh.receiveShadow=true;mesh.castShadow=true;group.add(mesh);
  }
  group.userData.dispose=()=>{group.traverse(o=>{if(o.isMesh){o.geometry.dispose();}});for(const m of materials.values())m.dispose();for(const t of textures)t.dispose();};return group;
 }
 return {group,M,mat,add,box,cyl,ball,beam,plane,sign,roof,tree,streetLamp,cityBlock,finish,registerTexture:t=>textures.push(t),registerMaterial:m=>materials.set('extra-'+materials.size,m)};
}
export function buildWorld(route){
 const b=collector(),{M,box,cyl,ball,beam,plane,sign,roof,tree,streetLamp,cityBlock,add,mat}=b,p=route.plan,t=p.theme,floor=route.floorAt;b.stats={vehicles:0,scooters:0,stalls:0,productKinds:[],museumArtifacts:0,departmentStores:0};
 if(t==='mountain'){
  const g=new T.PlaneGeometry(320,260,160,130);g.rotateX(-Math.PI/2);const pos=g.getAttribute('position'),uv=g.getAttribute('uv');for(let i=0;i<pos.count;i++){const x=pos.getX(i)+48,z=pos.getZ(i)+36;pos.setXYZ(i,x,floor(x,z)-.025,z);uv.setXY(i,x/3,z/3);}g.computeVertexNormals();add(g,M.grass);
 }else plane(48,36,340,280,t==='night'?M.asphalt:M.tile,-.025);
 if(!['mountain','dome'].includes(t)&&!p.name.includes('89F')){
  for(let i=0;i<13;i++){const x=-40+i*17,z=i%2?-35:107;if(t==='tower'&&x>55&&z<20)continue;cityBlock(x,z,10+(i%3)*3,10,10+(i*7)%32,i%4);}
  for(let i=0;i<5;i++)cityBlock(-35,10+i*17,15,12,16+i*4,i%4);
 }
 if(t==='tower'){
  plane(48,65,135,9,M.asphalt,.007);plane(48,59.5,110,3,M.concrete,.01);
  plane(48,37,43,43,M.tile,.01);
  for(let x=-12;x<110;x+=7)box(x,.018,65,3,.012,.13,M.white);
  for(let x=14;x<23;x+=1.3)box(x,.022,65,.65,.012,8,M.white);
  for(const z of [14,28,42,56])streetLamp(30,z,6);
  for(const [x,z] of [[33,16],[67,54],[64,17]])tree(x,z,5.5);
  const old=new window.TVSceneGeometry.Mesh(),receiver={a:old.a};for(const k of ['box','cyl','ball','beam','quad','cone'])receiver[k]=()=>{};
  window.TVSites.build(receiver,'tower',window.TVSceneGeometry.Mesh);
  const raw=old.a,geometry=new T.BufferGeometry(),positions=[],normals=[],colors=[],landmark=p.landmark;
  for(let i=0;i<raw.length;i+=9){positions.push((raw[i]-34)*landmark.scale+landmark.x,raw[i+1]*landmark.scale,(raw[i+2]-12)*landmark.scale+landmark.z);normals.push(...raw.slice(i+3,i+6));colors.push(...raw.slice(i+6,i+9));}
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeBoundingBox();
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.43,metalness:.3,side:T.DoubleSide});b.registerMaterial(material);
  const tower=new T.Mesh(geometry,material);tower.name='TAIPEI_101_LANDMARK';tower.castShadow=true;tower.receiveShadow=true;b.group.add(tower);
  for(const X of [40,50])cyl(X,0,42,.055,3.75,M.steel,7);for(const X of [57,69])cyl(X,0,33,.055,4.55,M.steel,7);
  sign('香堤大道 · XIANGTI',45,3.7,42,10,.8,0,'#e1d2a7','#3c4b48');
  sign('信義新天地 · XINYI',63,4.5,33,12,.9,0,'#e2d3b0','#455359');
 }
 if(p.name.includes('89F')){
  plane(48,36,64,56,M.concrete,.005);box(48,5.9,36,65,.15,57,M.ivory);
  // The city is below the observation windows, rather than printed on a wall.
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2,rad=60+(i%3)*18,x=48+Math.cos(a)*rad,z=36+Math.sin(a)*rad;const H=7+(i*11)%25;
   const wall=mat('skyline'+i%4,[0x81949a,0x8c9992,0x9d9f98,0x748a94][i%4]);box(x,-42,z,10,H,9,wall);for(let h=-39;h<-42+H;h+=2)box(x,h,z-4.55,8,.6,.1,M.glass);
  }
  for(let x=20;x<80;x+=5){cyl(x,0,8.5,.08,6,M.steel);cyl(x,0,64.5,.08,6,M.steel);}
  for(let z=13;z<64;z+=5){cyl(16.5,0,z,.08,6,M.steel);cyl(80.5,0,z,.08,6,M.steel);}
  sign('89F · TAIPEI SKYLINE',48,4,43.05,10,.7,0);
 }
 if(t==='memorial'){
  plane(45,32,82,40,M.tile);for(let x=8;x<62;x+=4)box(x,.015,32,.05,.015,34,M.ivory);
  for(let i=0;i<13;i++)box(54+i+.5,0,29,1,.125+i*.25,18,M.ivory);
  for(const z of [19.6,38.4]){beam([54,.9,z],[67,3.9,z],.11,M.ivory);for(let x=54;x<67;x+=2)cyl(x,floor(x,29),z,.14,.95,M.ivory);}
  for(let x=4;x<92;x+=8){tree(x,5,7);tree(x,66,7);}
  for(let x=6;x<62;x+=5){cyl(x,0,3,.22,4,M.ivory);box(x,4,3,5.2,.24,3,M.blue);}
 }
 if(t==='square'){
  plane(48,36,92,40,M.tile);for(let z=19;z<55;z+=4)box(48,.012,z,85,.012,.045,M.ivory);
  for(const Z of [10,62])for(let x=7;x<29;x+=7)tree(x,Z,7);
  // Freestanding arch on the west edge; the whole ceremonial axis stays open.
  for(const Z of [23,29.5,36,42.5,49]){box(5,0,Z,2,7.2,1.2,M.ivory);roof(5,Z,4,7.5,7.2,M.blue,1.6);}
  box(5,6.5,36,1,1,29,M.ivory);sign('自由廣場',5,7.4,36,8,1.5,Math.PI/2,'#274a60','#e1e2d6');
  // Memorial silhouette at the far end makes the space legible at first glance.
  box(113,0,36,14,9,15,M.ivory);const part=new window.TVSceneGeometry.Mesh();window.TVSites.octRoof(part,9,11,3,'#365c85');
  const G=new T.BufferGeometry(),pos=[],normal=[];for(let i=0;i<part.a.length;i+=9){pos.push(part.a[i]+113,part.a[i+1],part.a[i+2]+36);normal.push(...part.a.slice(i+3,i+6));}G.setAttribute('position',new T.Float32BufferAttribute(pos,3));G.setAttribute('normal',new T.Float32BufferAttribute(normal,3));add(G,M.blue);
 }
 if(t==='museum'){
  plane(48,55,90,30,M.tile);box(56,0,22,53,2.4,27,M.stone);plane(56,22,51,24,M.tile,2.405);
  for(let i=0;i<24;i++)box(52,0,47.75-i*.5,8,.1*(i+1),.5,M.ivory);
  roof(56,22,56,30,8.2,M.green,4);roof(56,22,22,31,11.7,M.green,2.6);
  for(let x=33;x<82;x+=5){if(x>47&&x<57)continue;cyl(x,2.4,35.3,.24,5.6,M.ivory);}
  sign('國立故宮博物院',56,9.3,37.1,14,1.2,0,'#d6bb70','#304e45');
  for(let x=12;x<91;x+=11){tree(x,65,6);streetLamp(x,53,5);}
 }
 if(t==='temple'){
  plane(48,39,70,65,M.tile);for(let x=28;x<70;x+=3)box(x,.01,53,.04,.015,25,M.cream);
  for(const X of [23,74]){box(X,4.2,27,4,.3,36,M.roof);for(let z=14;z<45;z+=7)cyl(X,0,z,.22,4.2,M.red);}
  box(48,4.25,42,11,.6,5,M.roof);roof(48,42,13,7,4.85,M.roof,1.4);sign('艋舺龍山寺',48,3.9,45.1,7,.8,0,'#d7b267','#602c24');
  for(let i=0;i<6;i++){ball(11+i*.7,1.2+i*.15,49,.7,.8,.9,M.stone);}
 }
 if(t==='night'){
  plane(48,36,115,22,M.asphalt);plane(48,25,100,4,M.concrete,.015);plane(48,47,100,4,M.concrete,.015);
  for(let x=12;x<90;x+=4){beam([x,5,23],[x,5,49],.025,M.steel);for(const z of [27,31,41,45]){ball(x,4.6,z,.24,.34,.24,M.orange);cyl(x,4.18,z,.08,.2,M.gold,7);}}
  for(const X of [9,86]){for(const Z of [25,47])cyl(X,0,Z,.35,5,M.red);roof(X,36,5,25,5,M.roof,1.4);sign('饒河街觀光夜市',X,4.2,36,15,1.3,Math.PI/2,'#e7be60','#762d27');}
  box(94,0,14,18,5.5,14,M.red);roof(94,14,22,17,5.5,M.roof,3);roof(94,14,14,12,8,M.roof,2);sign('松山慈祐宮',94,4,21.1,10,1.1);
  for(const X of [20,48,76]){const warm=new T.PointLight(0xffcf99,65,38,2);warm.position.set(X,5,36);b.group.add(warm);}
 }
 if(t==='mountain'){
  // Winding path is a surface in an open landscape, never a high-walled trench.
  for(let i=1;i<p.nodes.length;i++){
   const a=p.nodes[i-1],c=p.nodes[i],d=Math.hypot(c.x-a.x,c.y-a.y),steps=Math.ceil(d*2);
   const points=[],uv=[],nx=-(c.y-a.y)/d*1.25,nz=(c.x-a.x)/d*1.25;
   for(let n=0;n<steps;n++){
    const v=n/steps,V=(n+1)/steps,x=a.x+(c.x-a.x)*v,z=a.y+(c.y-a.y)*v,X=a.x+(c.x-a.x)*V,Z=a.y+(c.y-a.y)*V;
    const P=[[x+nx,z+nz],[x-nx,z-nz],[X-nx,Z-nz],[X+nx,Z+nz]],ids=[0,2,1,0,3,2];
    for(const j of ids){const [px,pz]=P[j];points.push(px,floor(px,pz)+.025,pz);uv.push(j===0||j===3?0:1,j<2?v*d/3:V*d/3);}
   }
   const ribbon=new T.BufferGeometry();ribbon.setAttribute('position',new T.Float32BufferAttribute(points,3));ribbon.setAttribute('uv',new T.Float32BufferAttribute(uv,2));ribbon.computeVertexNormals();add(ribbon,M.concrete);
  }
  for(let i=0;i<12;i++){
   const x=-70+i*22,z=-45-(i%3)*15,R=35+(i%3)*6,H=35+(i%4)*8,vertices=[],UV=[];
   const point=(a,r)=>{const rad=R*r*(1+.08*Math.sin(a*3+i));return [Math.cos(a)*rad,H*Math.pow(Math.max(0,1-r*r),1.6)+Math.sin(a*5+i)*r*(1-r)*3,Math.sin(a)*rad];};
   for(let ring=0;ring<14;ring++)for(let k=0;k<64;k++){
    const a=k/64*Math.PI*2,A=(k+1)/64*Math.PI*2,r=ring/14,s=(ring+1)/14,Q=[point(a,r),point(A,r),point(A,s),point(a,s)];
    for(const j of [0,1,2,0,2,3]){vertices.push(...Q[j]);UV.push(Q[j][0]/4,Q[j][2]/4);}
   }
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(UV,2));g.computeVertexNormals();add(g,mat('hill'+i%3,[0x54766a,0x668276,0x718b7e][i%3],'grass'),x,-3,z);
  }
  for(const [x,z] of [[61,6],[92,12]]){ball(x,floor(x,z)+.3,z,6,1,4,M.stone);ball(x,floor(x,z)+2,z,2,1.3,2,M.cream);ball(x+1,floor(x,z)+4,z,2.8,1.2,2.4,M.cream);}
  for(let z=15;z<26;z+=2)beam([87,floor(87,z),z],[87,floor(87,z)+1,z],.06,M.wood);
  sign('小油坑 · XIAOYOUKENG',16,3,55.1,7,.8);
 }
 for(const feature of p.features){
  const [kind,a,c,A,C,h,label]=feature,x=(a+A+1)/2,z=(c+C+1)/2,w=A-a+1,d=C-c+1,y=floor(x,z);
  if(kind==='podium')continue;
  if(kind==='departmentStore'){departmentStore(b,feature,y);continue;}
  if(['car','van','scooter'].includes(kind)){vehicle(b,feature,y);continue;}
  if(kind==='building'){cityBlock(x,z,w,d,h,a%4);continue;}
  if(kind==='pond'){plane(x,z,w,d,mat('water',0x547f80,null,{roughness:.23,metalness:.3}),.01);for(const Z of [c,C+1])box(x,0,Z,w,.25,.3,M.stone);continue;}
  if(kind==='grove'||kind==='bamboo'){
   for(let i=0;i<7;i++){const X=a+.5+(i*1.17)%w,Z=c+.5+(i*1.91)%d;if(kind==='grove')tree(X,Z,4+i%3,y);else{for(let k=0;k<4;k++){cyl(X+k*.16,y,Z,.045,3.2,M.green,5);ball(X+k*.1,y+1.7+k*.4,Z,.6,.9,.4,M.leaf);}}}continue;
  }
  if(kind==='rock'){ball(x,y+h*.25,z,w*.55,h*.65,d*.55,M.stone);ball(x+w*.25,y+h*.6,z-d*.2,w*.3,h*.42,d*.35,M.concrete);continue;}
  if(kind==='glass'){
   const m=mat('clear-windows',0xa3c6cf,null,{transparent:true,opacity:.13,metalness:.15,roughness:.14,depthWrite:false});box(x,y,z,w,h,d,m);box(x,y,z,w,.6,d,M.ivory);box(x,y+h-.15,z,w,.15,d,M.steel);continue;
  }
  if(kind==='shopRow'){
   const front=c<30?C+1:c,dir=c<30?1:-1,n=Math.ceil(w/5.5),W=w/n;
   for(let i=0;i<n;i++){
    const X=a+(i+.5)*W,H=h+(i%3-1)*1.5;cityBlock(X,z,W-.08,d,H,i%4);
    box(X,0,front+dir*.04,W-.45,2.65,.08,M.steel);for(let k=0;k<9;k++)box(X,.25+k*.27,front+dir*.1,W-.5,.035,.035,M.dark);
    box(X,3.3,front+dir*1.1,W,.2,2.2,[M.roof,M.green,M.cream][i%3]);
    sign(['胡椒餅','藥燉排骨','台灣茶','蚵仔煎','滷味','豆花','麵線'][i%7],X,3.1,front+dir*1.25,W-.4,.85,dir<0?Math.PI:0,['#efdfb1','#efdba2','#e8dcca'][i%3],['#70332b','#3b5146','#595146'][i%3]);
    // Air-conditioning units and balconies establish real inhabited frontage.
    for(let Y=5;Y<H;Y+=3){box(X+W*.32,Y,front+dir*.45,.65,.55,.6,M.ivory);beam([X-W*.35,Y-.3,front+dir*.8],[X+W*.35,Y-.3,front+dir*.8],.04,M.steel);}
   }continue;
  }
  if(kind==='stall'){
   box(x,y,z,w,1,d,M.wood);box(x,y+1,z,w+.15,.08,d+.15,M.steel);box(x,y+2.35,z,w+1,.2,d+1,[M.roof,M.green,M.orange][a%3]);
   for(const X of [a+.12,A+.88])for(const Z of [c+.12,C+.88])cyl(X,y,Z,.045,2.35,M.steel,5);
   marketGoods(b,feature,y);continue;
  }
  if(kind==='planter'){box(x,y,z,w,h,d,M.stone);for(let i=0;i<5;i++)ball(a+.6+i*w/5,y+h+.15,z,.45,.25,d*.3,M.leaf);continue;}
  if(kind==='pillar'){cyl(x,y,z,.38,h,M.red);continue;}
  if(kind==='incense'){cyl(x,y,z,w*.42,h*.8,M.gold);cyl(x,y+h*.8,z,w*.48,.18,M.dark);for(let i=0;i<8;i++)cyl(x-1+i*.27,y+h,z,.018,.5,M.wood,5);continue;}
  if(kind==='memorial'){
   box(x,0,z,w,3,d,M.ivory);box(x,3,z,w-3,10,d-5,M.ivory);box(a-.04,3,z,.08,6,4,M.dark);
   const g=new T.ConeGeometry(14,4,8);add(g,M.blue,x,15.1,z,[0,Math.PI/8,0]);add(new T.ConeGeometry(11,5,8),M.blue,x,17.3,z,[0,Math.PI/8,0]);ball(x,20,z,.3,.3,.3,M.gold);sign('中正紀念堂',a-.1,10,z,6,.9,Math.PI/2,'#294a61','#deded1');continue;
  }
  if(kind==='theatre'||kind==='templeHall'){
   box(x,y,z,w,h,d,kind==='theatre'?M.ivory:M.red);roof(x,z,w+2,d+2,y+h,kind==='theatre'?M.orange:M.roof,kind==='theatre'?4:2.3);
   for(let X=a+1;X<A;X+=3){cyl(X,y,c-.25,.22,h,M.red);box(X,y+.1,c-.1,1.2,h*.66,.08,M.dark);}
   if(label)sign(label,x,y+h-.7,c-.16,Math.min(w-2,10),.85,Math.PI,'#ddc071','#6c352b');continue;
  }
  if(kind==='galleryWall'||kind==='partition'){box(x,y,z,w,h,d,kind==='partition'?M.cream:M.ivory);if(kind==='galleryWall'&&w>d)for(let X=a+2;X<A;X+=4)box(X,y+2,z-.52,1.8,1.8,.04,M.glass);continue;}
  if(kind==='display'){
   box(x,y,z,w,.75,d,M.cream);box(x,y+.75,z,w,1,d,mat('caseGlass',0x91bab5,null,{transparent:true,opacity:.23,roughness:.15,depthWrite:false}));
   if(t==='museum'){
    artifact(b,x,y+.77,z,label||'青花瓷瓶');sign(label||'珍玩展示',x,y+.44,C+1.025,Math.min(w-.2,2.7),.32,0,'#d9ca9c','#4a5a50');
   }else ball(x,y+1,z,.32,.45,.3,M.gold);
   continue;
  }
  if(kind==='reception'){
   box(x,y,z,w,h,d,M.wood);box(x,y+h,z,w+.1,.08,d+.1,M.stone);box(x-.8,y+h+.08,z,.5,.35,.25,M.dark);sign('服務台 INFORMATION',x,y+.6,C+1.04,w-.3,.38,0);continue;
  }
  if(kind==='bench'){
   box(x,y+.4,z,w,.12,d,M.wood);box(x,y+.52,z+.35,w,.65,.15,M.wood);for(const X of [a+.4,A+.6])box(X,y,z,.14,.4,d*.8,M.steel);continue;
  }
  if(kind==='pavilion'||kind==='hut'||kind==='dugout'||kind==='core'||kind==='kiosk'){
   box(x,y,z,w,h,d,kind==='hut'?M.wood:kind==='core'?M.stone:M.concrete);roof(x,z,w+.8,d+.8,y+h,kind==='pavilion'?M.green:M.steel,kind==='pavilion'?2:.5);
   if(label)sign(label,x,y+h-.6,c-.06,w-1,.7,Math.PI);continue;
  }
  if(kind==='screen'){box(x,y,z,w,h,d,t==='temple'?M.red:M.stone);continue;}
 }
 if(t==='museum')museumInterior(b,route);
 if(t==='dome'){
  plane(48,36,57,41,M.grass,.01);
  const diamond=new T.PlaneGeometry(17,17);diamond.rotateX(-Math.PI/2);diamond.rotateY(Math.PI/4);add(diamond,mat('dirt',0xad8661),48,.018,40);
  cyl(48,.02,36,.7,.08,mat('dirt',0xad8661),20);
  for(const [x,z] of [[48,52],[36,40],[48,28],[60,40]])box(x,.03,z,.45,.03,.45,M.white);
  beam([48,.04,52],[17,.04,21],.035,M.white);beam([48,.04,52],[79,.04,21],.035,M.white);
  for(let row=0;row<7;row++)for(let i=0;i<128;i++){
   const a=i/128*Math.PI*2,r=1.17+row*.043,x=48+Math.cos(a)*29*r,z=36+Math.sin(a)*21*r;
   if(Math.abs(x-48)<2.5||Math.abs(z-36)<2.5)continue;const y=1.5+row*.38;
   box(x,0,z,1.6,y,.9,M.concrete);box(x,y,z,.7,.15,.65,[M.stone,M.dark,M.steel][i%3]);box(x,y+.15,z+.25,.7,.5,.12,M.steel);
  }
  const vertices=[];for(let i=0;i<64;i++)for(let j=0;j<12;j++){
   const a=i/64*Math.PI*2,A=(i+1)/64*Math.PI*2,t=j/12*Math.PI/2,u=(j+1)/12*Math.PI/2,
    v=(a,t)=>[48+47*Math.cos(a)*Math.cos(t),9+25*Math.sin(t),36+34*Math.sin(a)*Math.cos(t)];vertices.push(...v(a,t),...v(A,t),...v(A,u),...v(a,t),...v(A,u),...v(a,u));
   if(i%4===0)beam(v(a,t),v(a,u),.12,M.ivory);
  }const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();add(g,mat('domeRoof',0x9faeae,null,{side:T.DoubleSide}));
  sign('TAIPEI DOME',48,12,5.5,23,3,0,'#e1dfbd','#1f343b');sign('臺北大巨蛋',48,8.7,5.5,18,2,0);
  for(const [X,Z] of [[23,20],[73,20],[23,53],[73,53]]){const light=new T.PointLight(0xe2eeeb,240,85,2);light.position.set(X,16,Z);b.group.add(light);}
 }
 const world=b.finish();world.name='OPEN_CITY_ENVIRONMENT';world.userData.floorAt=floor;world.userData.details=b.stats;world.userData.landmark=p.landmark||null;return world;
}
