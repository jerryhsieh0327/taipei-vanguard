const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,tick}=require('./game-harness.cjs');
function key(api,type,key,extra={}){let prevented=false;api.listeners.get(type)({key,code:key===' '?'Space':key,repeat:false,preventDefault(){prevented=true;},...extra});return prevented;}
function pointer(api,type,target='lookPad',extra={}){api.listeners.get(type)({pointerType:'mouse',button:0,target:api.nodes.get(target),pointerId:1,preventDefault(){},...extra});}
test('Space starts a ballistic jump without shooting or consuming ammo',()=>{
 const api=loadGame();api.deploy(0);const g=api.game,ammo=g.ammo;
 assert.equal(key(api,'keydown',' '),true);tick(api,.1);
 assert.ok(g.jumpHeight>.3&&g.jumpVelocity>0);assert.equal(g.shots,0);assert.equal(g.ammo,ammo);
 key(api,'keyup',' ');let peak=g.jumpHeight;
 for(let i=0;i<30;i++){api.simulate(.05);peak=Math.max(peak,g.jumpHeight);}
 assert.ok(peak>.6&&peak<1);assert.equal(g.jumpHeight,0);assert.equal(g.jumpVelocity,0);assert.equal(g.shots,0);
});
test('holding Space and repeated presses cannot relaunch in midair or auto-hop on landing',()=>{
 const api=loadGame();api.deploy(0);const g=api.game;
 key(api,'keydown',' ');tick(api,.1);const velocity=g.jumpVelocity;
 key(api,'keydown',' ',{repeat:true});assert.equal(g.jumpVelocity,velocity);
 key(api,'keyup',' ');key(api,'keydown',' ');assert.equal(g.jumpVelocity,velocity);
 tick(api,1);key(api,'keydown',' ',{repeat:true});tick(api,.1);assert.equal(g.jumpHeight,0);
 key(api,'keyup',' ');key(api,'keydown',' ');tick(api,.05);assert.ok(g.jumpHeight>0);
});
test('jump is blocked in menus, pause and results; pausing freezes the airborne state',()=>{
 const api=loadGame();assert.equal(api.jump(),false);api.deploy(0);const g=api.game;
 api.pause();key(api,'keydown',' ');tick(api,.2);assert.equal(g.jumpHeight,0);key(api,'keyup',' ');api.pause();
 key(api,'keydown',' ');tick(api,.1);const h=g.jumpHeight,v=g.jumpVelocity;
 api.pause();tick(api,.5);assert.equal(g.jumpHeight,h);assert.equal(g.jumpVelocity,v);api.pause();tick(api,1);assert.equal(g.jumpHeight,0);
 api.finish(false);key(api,'keyup',' ');key(api,'keydown',' ');assert.equal(g.jumpHeight,0);assert.equal(api.jump(),false);
});
test('jumping cannot cross authored walls and low market awnings stop the head',()=>{
 const api=loadGame();api.deploy(8);const g=api.game;
 let found;
 for(let y=2;y<46&&!found;y++)for(let x=2;x<62&&!found;x++)if(api.passable(x+.5,y+.25,.21)&&api.routes.ceilingAt(g,x+.5,y+.25)<Infinity)found={x:x+.5,y:y+.25};
 assert.ok(found);g.px=found.x;g.py=found.y;const ceiling=api.routes.ceilingAt(g,g.px,g.py);
 api.jump();let highest=0;for(let i=0;i<20;i++){api.simulate(.05);highest=Math.max(highest,g.jumpHeight);}
 assert.ok(highest>.15&&highest<=ceiling-1.82+1e-6);assert.equal(g.jumpHeight,0);
 const before={x:g.px,y:g.py};api.jump();api.move(0,-.6);assert.ok(api.passable(g.px,g.py,.21));
});
test('left mouse fires immediately without pointer lock, holds to repeat, and releases to stop',()=>{
 const api=loadGame();api.deploy(0);const g=api.game;
 pointer(api,'pointerdown');assert.equal(g.shots,1);assert.equal(g.ammo,29);
 tick(api,.55);assert.ok(g.shots>=3);pointer(api,'pointerup');const shots=g.shots;tick(api,.5);assert.equal(g.shots,shots);
});
test('releasing Space while holding left mouse does not interrupt firing',()=>{
 const api=loadGame();api.deploy(0);const g=api.game;
 pointer(api,'pointerdown');key(api,'keydown',' ');tick(api,.1);key(api,'keyup',' ');const shots=g.shots;
 tick(api,.5);assert.ok(g.shots>shots);pointer(api,'pointerup');
});
test('mouse firing ignores UI buttons, right click, touch-look and inactive gameplay',()=>{
 const api=loadGame();api.deploy(0);const g=api.game;
 for(const id of ['pauseBtn','aimBtn','reloadBtn','interactBtn'])pointer(api,'pointerdown',id);
 pointer(api,'pointerdown','lookPad',{button:2});pointer(api,'pointerdown','lookPad',{pointerType:'touch'});assert.equal(g.shots,0);
 api.pause();pointer(api,'pointerdown');assert.equal(g.shots,0);api.pause();api.finish(false);pointer(api,'pointerdown');assert.equal(g.shots,0);
});
test('pointer cancellation, lost lock, blur and pause stop held firing',()=>{
 const api=loadGame();api.deploy(0);const g=api.game;
 pointer(api,'pointerdown');pointer(api,'pointercancel');let shots=g.shots;tick(api,.3);assert.equal(g.shots,shots);
 pointer(api,'pointerdown');api.document.pointerLockElement=null;api.documentListeners.get('pointerlockchange')();shots=g.shots;tick(api,.3);assert.equal(g.shots,shots);
 pointer(api,'pointerdown');api.pause();shots=g.shots;api.pause();tick(api,.3);assert.equal(g.shots,shots);
 pointer(api,'pointerdown');api.listeners.get('blur')();shots=g.shots;api.pause();tick(api,.3);assert.equal(g.shots,shots);
});
test('touch FIRE still works and releasing the look finger does not stop the fire finger',()=>{
 const api=loadGame();api.deploy(0);const g=api.game,fire=api.nodes.get('fireBtn'),look=api.nodes.get('lookPad');
 fire.events.get('pointerdown')({pointerId:2,pointerType:'touch',preventDefault(){}});assert.equal(g.shots,1);
 look.events.get('pointerdown')({pointerId:3,pointerType:'touch',clientX:10,clientY:10,preventDefault(){}});
 look.events.get('pointerup')({pointerId:3});tick(api,.4);assert.ok(g.shots>=3);
 fire.events.get('pointerup')({pointerId:2});const shots=g.shots;tick(api,.4);assert.equal(g.shots,shots);
});
test('airborne shots use the raised eye height, rather than the old ground-level trajectory',()=>{
 const api=loadGame();api.deploy(0);const g=api.game,e=g.enemies[0];g.px=6.5;g.py=38.5;e.x=8.5;e.y=38.5;e.awakened=true;e.emergeTarget=null;
 g.jumpHeight=.75;g.dir=0;g.pitch=0;api.shoot();assert.equal(e.hp,e.maxHp);
 g.elapsed+=.2;g.pitch=Math.atan2(1-(1.65+g.jumpHeight),2);api.shoot();assert.equal(e.hp,e.maxHp-1);
});
