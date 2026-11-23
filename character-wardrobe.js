/* Original modular clothing on a licensed civilian rig. No real-person likeness. */
import * as T from './vendor/three/three.module.min.js';
export const boneAliases={hips:'Hips',spine:'Spine',spine1:'Spine1',chest:'Spine2',neck:'Neck',head:'Head',shoulder_L:'LeftShoulder',upperarm_L:'LeftArm',forearm_L:'LeftForeArm',hand_L:'LeftHand',shoulder_R:'RightShoulder',upperarm_R:'RightArm',forearm_R:'RightForeArm',hand_R:'RightHand',thigh_L:'LeftUpLeg',calf_L:'LeftLeg',foot_L:'LeftFoot',toe_L:'LeftToeBase',thigh_R:'RightUpLeg',calf_R:'RightLeg',foot_R:'RightFoot',toe_R:'RightToeBase'};
export function wardrobe(model,style){
 const ownedGeometry=[],ownedMaterials=[],ownedTextures=[],bones={};model.updateMatrixWorld(true);
 model.traverse(o=>{if(o.isBone)bones[o.name]=o;});
 const material=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.85,...extra});ownedMaterials.push(m);return m;};
 const skin=material(style.skin),dark=material('#222321'),shirt=material(style.shirt),cloth=material(style.variant===1?'#e7dfc9':style.variant===2?'#304447':'#9c6648'),gold=material('#b49145',{metalness:.65,roughness:.35});
 function attach(name,mesh,offset){
  const bone=bones[name];if(!bone)return;
  const q=model.getWorldQuaternion(new T.Quaternion()),pos=bone.getWorldPosition(new T.Vector3()),scale=model.getWorldScale(new T.Vector3());
  pos.add(new T.Vector3(...offset).multiply(scale).applyQuaternion(q));bone.worldToLocal(pos);
  mesh.position.copy(pos);mesh.quaternion.copy(bone.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));
  const bs=bone.getWorldScale(new T.Vector3());mesh.scale.multiply(new T.Vector3(scale.x/bs.x,scale.y/bs.y,scale.z/bs.z));
  bone.add(mesh);ownedGeometry.push(mesh.geometry);
 }
 const box=(w,h,d,m)=>new T.Mesh(new T.BoxGeometry(w,h,d),m);
 const sphere=(x,y,z,m)=>{const g=new T.SphereGeometry(1,16,12);g.scale(x,y,z);return new T.Mesh(g,m);};
 model.traverse(o=>{
  if(!o.isSkinnedMesh)return;const g=o.geometry.clone(),idx=g.getAttribute('skinIndex'),weights=g.getAttribute('skinWeight'),colors=new Float32Array(g.getAttribute('position').count*3);
  const shirtColor=new T.Color(style.shirt),pantsColor=new T.Color(style.pants),white=new T.Color(1,1,1),skinColor=new T.Color(style.skin);
  for(let i=0;i<idx.count;i++){
   const slots=[weights.getX(i),weights.getY(i),weights.getZ(i),weights.getW(i)],k=slots.indexOf(Math.max(...slots)),ids=[idx.getX(i),idx.getY(i),idx.getZ(i),idx.getW(i)],name=o.skeleton.bones[ids[k]]?.name||'';
   let c=/spine|chest|shoulder|upperarm|forearm/.test(name)?shirtColor:/thigh|calf|hips/.test(name)?pantsColor:white;
   if(style.tank&&/upperarm|forearm/.test(name))c=skinColor;
   c.toArray(colors,i*3);
  }
  g.setAttribute('color',new T.BufferAttribute(colors,3));o.geometry=g;ownedGeometry.push(g);
  for(const m of [].concat(o.material)){m.vertexColors=true;m.needsUpdate=true;}
  if(style.tank){
   const arms=[],rest=[],index=g.index?.array||Array.from({length:idx.count},(_,i)=>i);
   for(let j=0;j<index.length;j+=3){let exposed=0;for(let k=0;k<3;k++){const i=index[j+k],weights4=[weights.getX(i),weights.getY(i),weights.getZ(i),weights.getW(i)],which=weights4.indexOf(Math.max(...weights4)),ids=[idx.getX(i),idx.getY(i),idx.getZ(i),idx.getW(i)];if(/upperarm|forearm/.test(o.skeleton.bones[ids[which]]?.name))exposed++;}(exposed>=2?arms:rest).push(index[j],index[j+1],index[j+2]);}
   g.setIndex(rest.concat(arms));g.clearGroups();g.addGroup(0,rest.length,0);g.addGroup(rest.length,arms.length,1);o.material=[o.material,skin];
  }
 });
 if(style.hat==='cap'){
  attach('head',sphere(.14,.065,.14,shirt),[0,.16,0]);attach('head',box(.19,.018,.16,shirt),[0,.145,.13]);
 }else if(style.hat==='chef'){
  attach('head',box(.24,.08,.23,cloth),[0,.19,0]);attach('head',sphere(.15,.12,.14,cloth),[0,.28,0]);
 }else{
  attach('head',sphere(.12,style.variant===2?.09:.055,.12,dark),[0,.14,-.015]);
 }
 if(style.apron){
  attach('chest',box(.39,.7,.025,cloth),[0,-.19,.166]);attach('chest',box(.18,.15,.034,cloth),[0,-.22,.185]);
  for(const X of [-.13,.13])attach('chest',box(.028,.28,.025,cloth),[X,.13,.155]);
  const stitch=material('#c7bfa9');attach('chest',box(.34,.012,.03,stitch),[0,-.49,.187]);
 }
 if(style.floral){
  const c=document.createElement('canvas');c.width=c.height=128;const p=c.getContext('2d');p.fillStyle='#643446';p.fillRect(0,0,128,128);
  for(let i=0;i<18;i++){const x=i*37%128,y=i*53%128;p.fillStyle=i%2?'#d1bc7c':'#bd7e70';for(let n=0;n<5;n++){const a=n/5*Math.PI*2;p.beginPath();p.ellipse(x+Math.cos(a)*5,y+Math.sin(a)*5,4,7,a,0,Math.PI*2);p.fill();}}
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;ownedTextures.push(tex);const floral=material('#ffffff',{map:tex});
  attach('chest',box(.43,.52,.03,floral),[0,-.05,.172]);
  for(const X of [-.09,.09])attach('chest',box(.12,.14,.04,floral),[X,.21,.17]);
 }else if(style.tank){
  const white=material('#d6d5c5');attach('chest',box(.34,.48,.03,white),[0,-.06,.175]);
  for(const X of [-.12,.12])attach('chest',box(.055,.22,.03,white),[X,.22,.14]);
 }
 if(style.chain){
  const chain=new T.Mesh(new T.TorusGeometry(.092,.008,5,18,Math.PI*1.4),gold);attach('chest',chain,[0,.2,.19]);
  attach('chest',sphere(.016,.025,.008,gold),[0,.11,.2]);
 }
 if(style.glasses){
  for(const X of [-.055,.055])attach('head',box(.09,.045,.024,dark),[X,.075,.14]);attach('head',box(.035,.012,.02,gold),[0,.075,.15]);
 }
 if(style.armband){const m=material(style.armband);attach('upperarm_L',box(.09,.13,.11,m),[0,-.14,0]);}
 if(style.family==='tactical'){
  const mask=material('#242b2c');attach('head',sphere(.115,.09,.09,mask),[0,.02,.025]);attach('chest',box(.43,.46,.12,mask),[0,-.02,.13]);
 }
 if(bones.head)bones.head.scale.multiply(new T.Vector3([1.04,.94,1.1][style.variant],1,[.96,1.08,.94][style.variant]));
 return {ownedGeometry,ownedMaterials,ownedTextures};
}
