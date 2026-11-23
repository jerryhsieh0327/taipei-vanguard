/* Textured, skinned character renderer. All dependencies/assets are local. */
import * as THREE from './vendor/three/three.module.min.js';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';
import {KTX2Loader} from './vendor/three/addons/loaders/KTX2Loader.js';
import {MeshoptDecoder} from './vendor/three/addons/libs/meshopt_decoder.module.js';
import {clone as cloneSkeleton,retargetClip} from './vendor/three/addons/utils/SkeletonUtils.js';
import {buildWorld} from './city-scene.js?v=city-life-r6';
import {wardrobe,boneAliases} from './character-wardrobe.js?v=city-life-r6';
const status={ready:false,loading:true,ownsWeapon:true,build:'TACTICAL-R6',error:null};
window.TV3D=status;
const canvas=document.createElement('canvas');canvas.id='world3d';
canvas.setAttribute('aria-label','Textured tactical Taipei game');document.getElementById('app').prepend(canvas);
const deploy=document.getElementById('deployBtn'),defense=document.getElementById('defenseBtn');
deploy.disabled=defense.disabled=true;
let renderer,scene,camera,environment,template,clips,civilian,civilianClips,weapon,sun,hemisphere,lastElapsed=0;
const entries=new Map(),props=new THREE.Group(),tempBox=new THREE.Box3(),tempQ=new THREE.Quaternion();
function firearm(){
 const gun=new THREE.Group(),steel=new THREE.MeshStandardMaterial({color:0x20272b,metalness:.7,roughness:.34}),
  polymer=new THREE.MeshStandardMaterial({color:0x30382f,roughness:.85}),detail=new THREE.MeshStandardMaterial({color:0x101315,roughness:.5});
 function box(x,y,z,w,h,d,mat){const p=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);p.position.set(x,y,z);gun.add(p);return p;}
 function tube(x,y,z,r,len,mat){const p=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,12),mat);p.rotation.x=Math.PI/2;p.position.set(x,y,z);gun.add(p);return p;}
 box(0,0,0,.09,.12,.32,steel);box(0,-.015,-.28,.075,.11,.26,polymer);
 box(0,-.065,-.39,.1,.18,.045,polymer);box(0,-.14,-.04,.055,.21,.08,detail).rotation.x=-.2;
 box(0,-.15,.07,.055,.23,.085,steel).rotation.x=.15;
 box(0,-.02,.24,.085,.09,.22,polymer);tube(0,0,.44,.018,.24,steel);tube(0,0,.58,.027,.07,detail);
 box(0,.085,.04,.06,.025,.31,detail);box(0,.13,-.02,.055,.07,.065,steel);
 box(0,.138,.019,.035,.037,.006,new THREE.MeshStandardMaterial({color:0x638d91,metalness:.5,roughness:.16}));
 for(let i=0;i<7;i++)box(0,.04,.15+i*.026,.1,.015,.009,detail);
 const flash=new THREE.Mesh(new THREE.SphereGeometry(.055,7,5),new THREE.MeshBasicMaterial({color:0xffd08b}));
 flash.position.z=.65;flash.scale.set(.6,.6,2.3);flash.visible=false;gun.add(flash);gun.userData.flash=flash;return gun;
}
function geometryMesh(data){
 const geometry=new THREE.BufferGeometry(),buffer=new THREE.InterleavedBuffer(data,9);
 geometry.setAttribute('position',new THREE.InterleavedBufferAttribute(buffer,3,0));
 geometry.setAttribute('normal',new THREE.InterleavedBufferAttribute(buffer,3,3));
 geometry.setAttribute('color',new THREE.InterleavedBufferAttribute(buffer,3,6));geometry.computeBoundingSphere();
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.88,metalness:.02}));
 mesh.receiveShadow=true;return mesh;
}
function disposeEntry(entry){
 entry.mixer.stopAllAction();for(const mat of entry.materials)mat.dispose();
 for(const g of entry.ownedGeometry||[])g.dispose();for(const t of entry.ownedTextures||[])t.dispose();
}
function load(idx,grid,route){
 lastElapsed=0;if(environment){scene.remove(environment);environment.userData.dispose?.();}
 for(const entry of entries.values()){scene.remove(entry.root);disposeEntry(entry);}entries.clear();props.clear();props.userData.signature=null;
 environment=buildWorld(route);scene.add(environment);scene.userData.route=route;
 const night=idx===6,color=night?0x172334:idx===7?0xbacbc9:idx===5?0x849594:0xb6d3e3;
 scene.background=new THREE.Color(color);scene.fog=new THREE.Fog(color,idx===7?100:140,idx===7?260:350);
 hemisphere.intensity=night?1.3:idx===5?2.2:1.6;sun.intensity=night?.9:2.3;
 sun.position.set(12,70,45);sun.target.position.set(48,0,36);Object.assign(sun.shadow.camera,{left:-70,right:70,top:55,bottom:-55,far:180});sun.shadow.camera.updateProjectionMatrix();
}
function makeActor(key,ally=false,appearance){
 appearance||=window.TVCharacterStyles.civilian('night');
 const isCivilian=ally||appearance.family!=='tactical'||appearance.variant===2;
 const root=new THREE.Group(),pivot=new THREE.Group(),model=cloneSkeleton(isCivilian?civilian:template),materials=[],bones={},skins=[];
 root.add(pivot);pivot.add(model);
 const mixer=new THREE.AnimationMixer(model),actions={};
 for(const clip of (isCivilian?civilianClips:clips))if(clip.name!=='TPose')actions[clip.name]=mixer.clipAction(clip);
 actions.Idle.play();mixer.update(.01);model.updateMatrixWorld(true);
 model.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update();});
 // Skinning matrices must be initialized before measuring the animated mesh.
 const bounds=new THREE.Box3().setFromObject(model,true),height=bounds.max.y-bounds.min.y,scale=appearance.height/height;
 model.scale.multiplyScalar(scale);model.scale.x*=appearance.width;model.position.y=-bounds.min.y*scale;model.rotation.y=isCivilian?0:Math.PI;
 model.traverse(o=>{
  if(o.isBone)bones[boneAliases[o.name]||o.name.replace(/[^a-z0-9]/gi,'').replace(/^mixamorig/,'')]=o;
  if(o.isSkinnedMesh)skins.push(o);
  if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
   const convert=mat=>{const copy=mat.clone();copy.roughness=.83;copy.metalness=.08;if(ally)copy.color.multiply(new THREE.Color(.7,.9,1));materials.push(copy);return copy;};
   o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);
  }
 });
 root.updateMatrixWorld(true);
 const outfit=isCivilian?wardrobe(model,appearance):{};materials.push(...(outfit.ownedMaterials||[]));
 if(!isCivilian)for(const m of materials)m.color.multiply(new THREE.Color(appearance.shirt));
 const gun=firearm();gun.position.set(-.12,1.25,.47);root.add(gun);gun.visible=!ally;
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.45,16),new THREE.MeshBasicMaterial({color:0x101210,transparent:true,opacity:.15,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;shadow.position.y=.006;root.add(shadow);scene.add(root);
 root.updateMatrixWorld(true);
 const footClearance=Math.min(bones.LeftFoot?.getWorldPosition(new THREE.Vector3()).y??0,bones.RightFoot?.getWorldPosition(new THREE.Vector3()).y??0);
 const soles=[];
 if(isCivilian)for(const skin of skins){const index=skin.geometry.getAttribute('skinIndex'),weights=skin.geometry.getAttribute('skinWeight');
  for(let i=0;i<index.count;i++){const ids=[index.getX(i),index.getY(i),index.getZ(i),index.getW(i)],w=[weights.getX(i),weights.getY(i),weights.getZ(i),weights.getW(i)];if(ids.some((id,j)=>w[j]>.4&&/foot_|toe_/.test(skin.skeleton.bones[id]?.name)))soles.push({skin,index:i});}
 }
 const entry={root,pivot,model,mixer,actions,current:'Idle',materials,bones,skins,gun,shadow,dead:false,scale,ally,appearance,isCivilian,footClearance,soles,...outfit};
 entries.set(key,entry);return entry;
}
function aimJoint(bone,child,target){
 if(!bone||!child)return;
 const origin=bone.getWorldPosition(new THREE.Vector3()),direction=child.getWorldPosition(new THREE.Vector3()).sub(origin).normalize();
 const desired=target.clone().sub(origin).normalize(),delta=new THREE.Quaternion().setFromUnitVectors(direction,desired);
 const world=bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
 const parent=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
 bone.quaternion.copy(parent.multiply(world));bone.updateMatrixWorld(true);
}
function aimPose(entry){
 const {root,bones:b}=entry;
 for(const side of ['Right','Left']){
  const arm=b[side+'Arm'],fore=b[side+'ForeArm'],hand=b[side+'Hand'];if(!arm||!fore||!hand)continue;
  const local=root.worldToLocal(arm.getWorldPosition(new THREE.Vector3())),sign=Math.sign(local.x)||1;
  aimJoint(arm,fore,root.localToWorld(new THREE.Vector3(sign*.38,1.18,.17)));
  aimJoint(fore,hand,root.localToWorld(new THREE.Vector3(side==='Right'?-.12:.12,1.25,side==='Right'?.48:.66)));
 }
}
function pose(entry,e,dt){
 const {root,pivot,mixer,actions,bones,skins,gun}=entry;
 const ground=scene.userData.route.floorAt(e.x,e.y);root.position.set(e.x,ground,e.y);root.rotation.y=Math.PI/2-(e.facing||0);
 if(e.state==='active'){
  pivot.position.y=0;
  const next=e.moving?e.locomotionSpeed>2.4?'Run':'Walk':'Idle';
  if(next!==entry.current){actions[entry.current]?.fadeOut(.14);actions[next]?.reset().fadeIn(.14).play();entry.current=next;}
  actions[next]?.setEffectiveTimeScale(next==='Run'?Math.max(.85,(e.locomotionSpeed||3)/3.25):next==='Walk'?1.15:1);
  mixer.update(dt);root.updateMatrixWorld(true);
  if(e.hitAt>0&&bones.Spine2){bones.Spine2.rotation.x+=Math.sin(e.hitAt/.25*Math.PI)*.11;root.updateMatrixWorld(true);}
  if(!entry.ally&&e.intent!=='run'&&e.intent!=='search'&&e.intent!=='dodge'&&e.intent!=='emerge')aimPose(entry);
  if(e.intent==='dodge')pivot.rotation.z=(e.dodgeSide||1)*-.15;else pivot.rotation.z*=.7;
  gun.visible=!entry.ally&&e.intent!=='run'&&e.intent!=='search'&&e.intent!=='dodge'&&e.intent!=='emerge';
  gun.userData.flash.visible=gun.visible&&e.attackFlash>0;
  if(entry.isCivilian&&e.moving){
   root.updateMatrixWorld(true);for(const skin of skins)skin.skeleton.update();let low=Infinity;const v=new THREE.Vector3();
   for(const s of entry.soles){s.skin.getVertexPosition(s.index,v);v.applyMatrix4(s.skin.matrixWorld);low=Math.min(low,v.y);}
   if(Number.isFinite(low))pivot.position.y=ground+.008-low;root.updateMatrixWorld(true);
  }
 }else{
  if(!entry.dead){
   entry.dead=true;mixer.timeScale=0;gun.visible=false;
   entry.deathBones=Object.entries(bones).filter(([name])=>/Arm|Leg/.test(name)).map(([name,bone])=>({name,bone,q:bone.quaternion.clone()}));
  }
  const t=Math.max(0,Math.min(1,e.fall||0)),smooth=t*t*(3-2*t);
  for(const item of entry.deathBones){
   const angle=/ForeArm/.test(item.name)?.24:/Leg/.test(item.name)?.32:.4;
   item.bone.quaternion.copy(item.q).multiply(tempQ.setFromEuler(new THREE.Euler(angle*smooth,0,(item.name.startsWith('Left')?1:-1)*.16*smooth)));
  }
  pivot.rotation.set(-Math.PI/2*smooth,0,0);pivot.position.y=0;root.updateMatrixWorld(true);
  for(const skin of skins)skin.skeleton.update();
  tempBox.setFromObject(pivot,true);pivot.position.y=ground+.012-tempBox.min.y;root.updateMatrixWorld(true);
  entry.shadow.scale.set(1+smooth,.65+smooth,1);
 }
}
function objective(o){
 const ground=scene.userData.route.floorAt(o.x,o.y);
 if(o.type==='route'){
  const marker=new THREE.Mesh(new THREE.ConeGeometry(.18,.32,3),new THREE.MeshStandardMaterial({color:0xb8aa78,roughness:1}));
  marker.rotation.x=Math.PI;marker.position.set(o.x,ground+.4,o.y);props.add(marker);return;
 }
 if(o.type==='bomb'){
  const group=new THREE.Group(),body=new THREE.MeshStandardMaterial({color:0x605645,roughness:.8}),red=new THREE.MeshStandardMaterial({color:0xc94736,emissive:0x7c1e12,emissiveIntensity:.65});
  const box=new THREE.Mesh(new THREE.BoxGeometry(.8,.3,.55),body);box.position.y=.18;group.add(box);
  const panel=new THREE.Mesh(new THREE.BoxGeometry(.3,.025,.18),red);panel.position.set(0,.35,0);group.add(panel);
  const mark=new THREE.Mesh(new THREE.ConeGeometry(.13,.26,8),red);mark.position.y=1.45;mark.rotation.z=Math.PI;group.add(mark);
  group.position.set(o.x,ground,o.y);props.add(group);return;
 }
 if(o.type==='exit'||o.type==='point'){
  const ring=new THREE.Mesh(new THREE.RingGeometry(.8,1.05,32),new THREE.MeshBasicMaterial({color:0x7faf8d,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2;ring.position.set(o.x,ground+.02,o.y);props.add(ring);return;
 }
 const group=new THREE.Group(),metal=new THREE.MeshStandardMaterial({color:0x343d3a,roughness:.65,metalness:.4}),
  light=new THREE.MeshStandardMaterial({color:['bomb','device'].includes(o.type)?0xb99853:0x649d92,emissive:['bomb','device'].includes(o.type)?0x5c4213:0x174c3d,emissiveIntensity:.5});
 const box=new THREE.Mesh(new THREE.BoxGeometry(.55,.95,.4),metal);box.position.y=.48;group.add(box);
 const panel=new THREE.Mesh(new THREE.BoxGeometry(.03,.28,.28),light);panel.position.set(-.3,.72,0);group.add(panel);
 const marker=new THREE.Mesh(new THREE.ConeGeometry(.12,.22,8),light);marker.position.y=1.6;marker.rotation.z=Math.PI;group.add(marker);
 group.position.set(o.x,ground,o.y);props.add(group);
}
function render(game){
 if(!status.ready||!game)return;
 const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
 const pixel=Math.min(devicePixelRatio||1,1.25);
 if(canvas.width!==Math.round(width*pixel)||canvas.height!==Math.round(height*pixel)){
  renderer.setPixelRatio(pixel);renderer.setSize(width,height,false);camera.aspect=width/height;
 }
 camera.fov=game.aim?42:64;camera.updateProjectionMatrix();const eyeHeight=game.route.floorAt(game.px,game.py)+1.65+(game.jumpHeight||0);camera.position.set(game.px,eyeHeight,game.py);
 const pitch=(game.pitch||0)+(game.recoil||0)*.35;
 camera.lookAt(game.px+Math.cos(game.dir)*Math.cos(pitch),eyeHeight+Math.sin(pitch),game.py+Math.sin(game.dir)*Math.cos(pitch));
 const dt=Math.max(0,Math.min(.1,game.elapsed-lastElapsed));lastElapsed=game.elapsed;
 const actors=[...new Set(game.enemies.concat(game.downeds))],liveKeys=new Set();
 for(const e of actors){const key='enemy-'+e.id;liveKeys.add(key);pose(entries.get(key)||makeActor(key,false,e.appearance),e,dt);}
 const residents=(game.civilians||[]).filter(c=>Math.hypot(c.x-game.px,c.y-game.py)<42).sort((a,b)=>Math.hypot(a.x-game.px,a.y-game.py)-Math.hypot(b.x-game.px,b.y-game.py)).slice(0,8);
 for(const c of residents){const key='civilian-'+c.id;liveKeys.add(key);pose(entries.get(key)||makeActor(key,true,c.appearance),c,dt);}
 if(game.escort||game.objective?.type==='rescue'){
  const e=game.escort||game.objective,key='ally';liveKeys.add(key);
  pose(entries.get(key)||makeActor(key,true,window.TVCharacterStyles.civilian(game.theme.theme,game.id)),{...e,state:'active',moving:!!game.escort,locomotionSpeed:game.escort?2:0,facing:Math.atan2(game.py-e.y,game.px-e.x)},dt);
 }
 for(const [key,entry] of entries)if(!liveKeys.has(key)){scene.remove(entry.root);disposeEntry(entry);entries.delete(key);}
 const target=game.objective,guide=game.routeGuide,signature=`${game.stage}:${game.stageDone}:${target?.type}:${guide?.index??''}`;
 if(signature!==props.userData.signature){
  props.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});props.clear();props.userData.signature=signature;
  if(target&&target.type!=='rescue')objective(target);
  if(guide)objective(guide);
 }
 const bob=game.wasMoving?Math.sin(game.animation)*.006:0;
 weapon.position.set(game.aim?.025:.23,-.25+bob-(game.reloadUntil?Math.sin((game.reloadUntil-game.elapsed)*3)*.07:0),-.45+(game.muzzle?game.muzzle*.45:0));
 weapon.rotation.set(game.reloadUntil?-.42:0,Math.PI,game.reloadUntil?.28:0);weapon.userData.flash.visible=game.muzzle>0;
 renderer.render(scene,camera);
 status.metrics={actors:actors.length,civilians:residents.length,population:game.civilians?.length||0,skinnedMeshes:[...entries.values()].reduce((n,e)=>n+e.skins.length,0),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
}
async function boot(){
 try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();scene.add(props);camera=new THREE.PerspectiveCamera(64,1,.05,500);scene.add(camera);
  hemisphere=new THREE.HemisphereLight(0xdce7e9,0x5a5f4d,1.6);scene.add(hemisphere);
  sun=new THREE.DirectionalLight(0xffefd6,2.5);sun.position.set(8,16,8);sun.target.position.set(12,0,12);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:.5,far:65});
  sun.shadow.bias=-.001;sun.shadow.normalBias=.02;scene.add(sun,sun.target);
  weapon=firearm();weapon.rotation.y=Math.PI;weapon.scale.setScalar(.7);weapon.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;o.material.depthTest=false;o.renderOrder=10;}});camera.add(weapon);
  const asset=await new GLTFLoader().loadAsync(new URL('./assets/models/Soldier.glb',import.meta.url).href);
  template=asset.scene;clips=asset.animations;
  const ktx=new KTX2Loader().setTranscoderPath(new URL('./vendor/three/addons/libs/basis/',import.meta.url).href).detectSupport(renderer);
  const casual=await new GLTFLoader().setKTX2Loader(ktx).setMeshoptDecoder(MeshoptDecoder).loadAsync(new URL('./assets/models/CasualWalker.glb',import.meta.url).href);civilian=casual.scene;ktx.dispose();
  civilianClips=casual.animations.filter(c=>['idle','walk'].includes(c.name)).map(c=>{const n=c.clone();n.name=c.name==='idle'?'Idle':'Walk';return n;});
  const target=cloneSkeleton(civilian),source=cloneSkeleton(template);let targetSkin,sourceSkin;
  target.traverse(o=>{if(o.isSkinnedMesh&&(!targetSkin||o.skeleton.bones.length>targetSkin.skeleton.bones.length))targetSkin=o;});source.traverse(o=>{if(o.isSkinnedMesh&&(!sourceSkin||o.skeleton.bones.length>sourceSkin.skeleton.bones.length))sourceSkin=o;});
  source.skeleton=sourceSkin.skeleton;
  const names={};for(const [name,alias] of Object.entries(boneAliases))names[name]=sourceSkin.skeleton.bones.find(b=>b.name.replace(/[^a-z0-9]/gi,'')==='mixamorig'+alias)?.name;
  const run=retargetClip(targetSkin,source,clips.find(c=>c.name==='Run'),{names,hip:names.hips,scale:.01,hipInfluence:new THREE.Vector3(0,1,0),fps:30,preserveBonePositions:true});
  if(run.tracks.length<12)throw Error('Civilian run animation could not be mapped');
  for(const track of run.tracks)track.name=track.name.replace(/^\.bones\[([^\]]+)\]\./,'$1.');
  // Keep the civilian's own hip height: the source rig uses a different unit
  // scale. Retarget rotations; foot contact is normalized during locomotion.
  run.tracks=run.tracks.filter(track=>!track.name.endsWith('.position'));
  run.name='Run';civilianClips.push(run);

  if(!clips.some(c=>c.name==='Run')||!clips.some(c=>c.name==='Walk'))throw Error('Character animation clips are missing');
  Object.assign(status,{ready:true,loading:false,load,render,canvas,renderer,scene,camera,entries,
   civilianAsset:{name:'Casual Walker CC0',clips:civilianClips.map(c=>c.name)},asset:{name:'Mixamo Soldier',clips:clips.map(c=>c.name),textured:true,skinned:true}});
  deploy.disabled=defense.disabled=false;deploy.textContent='▶ DEPLOY — NO RESPAWN';
 }catch(error){status.loading=false;status.error=String(error);deploy.textContent='3D LOAD FAILED — RELOAD';console.error(error);}
}
status.loaded=boot();
