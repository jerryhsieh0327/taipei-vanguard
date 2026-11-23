/* Taipei Vanguard — local Three.js FPS with open city scenes. */
'use strict';
(()=>{
const $=id=>document.getElementById(id), TAU=Math.PI*2;
const BUILD='TACTICAL R5 · OPEN CITY';window.TV_BUILD=BUILD;
const maps=[
 {name:'Taipei 101',theme:'tower',sky:'#79cbff',wall:'#b2c9da',trim:'#2778c0',floor:'#b3c3d0',accent:'#ffbd43'},
 {name:'National Chiang Kai-shek Memorial Hall',theme:'memorial',sky:'#89d6ff',wall:'#e7e8de',trim:'#2e64a8',floor:'#b2b5b5',accent:'#f0c35f'},
 {name:'Mengjia Longshan Temple',theme:'temple',sky:'#f9c58c',wall:'#b84638',trim:'#edbc53',floor:'#ad9087',accent:'#ffc34a'},
 {name:'National Palace Museum',theme:'museum',sky:'#add8ff',wall:'#dce1d8',trim:'#46857b',floor:'#a9c8b2',accent:'#ffe39b'},
 {name:'Liberty Square',theme:'square',sky:'#87c9f9',wall:'#d7e6ea',trim:'#347ac5',floor:'#c9d5d7',accent:'#ffd063'},
 {name:'Taipei Dome',theme:'dome',sky:'#84d0ff',wall:'#b2cedd',trim:'#277bbd',floor:'#9aaebb',accent:'#54e1ff'},
 {name:'Raohe Street Night Market',theme:'night',sky:'#252f68',wall:'#de936e',trim:'#e04e67',floor:'#66739f',accent:'#ffce57'},
 {name:'Yangmingshan',theme:'mountain',sky:'#85c6e4',wall:'#7cab83',trim:'#427656',floor:'#92b790',accent:'#ffeb8d'}
];
const missions=[
 {
  "name": "Xinyi Boulevard Bomb Alert",
  "map": 0,
  "roster": 6,
  "diff": "Casual",
  "time": 600,
  "bombTime": 360,
  "story": "Approach Taipei 101 along the Xinyi boulevard. Use the sidewalks and entrance forecourt to reach the mall access bomb. Guards wait behind the delivery van, podium corners and entrance signs. Defuse the charge, then withdraw to the street evacuation point.",
  "steps": [
   [
    "defuse",
    1,
    "Hold F / INTERACT to defuse the lift-lobby bomb"
   ],
   [
    "waypoint",
    0,
    "Withdraw to the mall entrance"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "89F Skyline Rescue",
  "map": 0,
  "roster": 7,
  "diff": "Tight",
  "time": 720,
  "bombTime": 0,
  "story": "Inserted at the 89F express-lift lobby. Circle the service core along the observation ring, rescue Leo near the south windows, and escort him to the express lift.",
  "steps": [
   [
    "rescue",
    0,
    "Rescue Leo in the south observation bay"
   ],
   [
    "escort",
    0,
    "Bring Leo to the express lift"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "Memorial Terrace Bombs",
  "map": 1,
  "roster": 7,
  "diff": "Casual",
  "time": 720,
  "bombTime": 360,
  "story": "Use the garden and pond banks to reach both sides of the memorial terrace. Guards cover the side walls and colonnade. Defuse the two terrace charges and withdraw.",
  "steps": [
   [
    "defuse",
    2,
    "Defuse both terrace charges"
   ],
   [
    "waypoint",
    0,
    "Return to the garden entry"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "Garden Colonnade Rescue",
  "map": 1,
  "roster": 7,
  "diff": "Tight",
  "time": 720,
  "bombTime": 0,
  "story": "Approach through the north colonnade instead of the central axis. Rescue the stranded guide beside the terrace, then leave through the southeast garden gate.",
  "steps": [
   [
    "rescue",
    0,
    "Locate the guide beside the terrace"
   ],
   [
    "escort",
    0,
    "Escort the guide to the southeast garden gate"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "Longshan Rear-Court Rescue",
  "map": 2,
  "roster": 7,
  "diff": "Casual",
  "time": 780,
  "bombTime": 0,
  "story": "Cross the open forecourt and enter the temple gate. Move around the halls and through the rear court to rescue the volunteer, then use the side corridor to reach the eastern evacuation point.",
  "steps": [
   [
    "rescue",
    0,
    "Rescue the volunteer in the rear court"
   ],
   [
    "escort",
    0,
    "Evacuate through the west hu-long corridor"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "Palace Gallery Bomb Search",
  "map": 3,
  "roster": 8,
  "diff": "Tight",
  "time": 840,
  "bombTime": 360,
  "story": "Approach across the museum garden, climb the entrance steps and search the broad exhibition rooms. Guards hold the gallery doors and partition corners. Disarm both charges and leave through the entrance forecourt.",
  "steps": [
   [
    "defuse",
    2,
    "Defuse the east-wing and archive charges"
   ],
   [
    "waypoint",
    0,
    "Withdraw through the museum foyer"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "Liberty Two-Hall Alert",
  "map": 4,
  "roster": 6,
  "diff": "Casual",
  "time": 720,
  "bombTime": 360,
  "story": "The plaza is open; the theatre and concert hall block long views. Choose either flank to reach charges beside both halls. Guards hold column lines and move around the hall perimeter. Exit at the western arch.",
  "steps": [
   [
    "defuse",
    2,
    "Defuse the two hall-side charges"
   ],
   [
    "waypoint",
    0,
    "Reach the western arch evacuation point"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "Dome Dugout Bombs",
  "map": 5,
  "roster": 8,
  "diff": "Tight",
  "time": 900,
  "bombTime": 360,
  "story": "Follow the outer concourse, enter the player tunnel and cross the field to the dugout. Disarm the dugout and bullpen charges; return via the seating aisle and service exit.",
  "steps": [
   [
    "defuse",
    2,
    "Defuse the dugout and bullpen charges"
   ],
   [
    "waypoint",
    0,
    "Leave through the service exit"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "Raohe Vendor Rescue",
  "map": 6,
  "roster": 7,
  "diff": "Casual",
  "time": 780,
  "bombTime": 0,
  "story": "Start at the east gate. Move between divided stall lanes and the rear shop alley to find a trapped vendor. Escort the vendor along the market to the west gate.",
  "steps": [
   [
    "rescue",
    0,
    "Rescue the vendor in the rear court"
   ],
   [
    "escort",
    0,
    "Bring the vendor to the west gate"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "Raohe East-Gate Evacuation",
  "map": 6,
  "roster": 8,
  "diff": "Tight",
  "time": 840,
  "bombTime": 360,
  "story": "Enter from the west. Defuse the east-gate food-cart charge, reach the rear vendor court, and evacuate the vendor through the east gate. Grill shutters and cross-lane gaps conceal short-range attackers.",
  "steps": [
   [
    "defuse",
    1,
    "Defuse the east-gate food-cart charge"
   ],
   [
    "rescue",
    0,
    "Rescue the rear-court vendor"
   ],
   [
    "escort",
    0,
    "Bring the vendor to the east gate"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "Bamboo Trail Rescue",
  "map": 7,
  "roster": 6,
  "diff": "Casual",
  "time": 840,
  "bombTime": 0,
  "story": "Take the bamboo branch to the Xiaoyoukeng-inspired lookout. Patrols wait behind rock banks. Rescue the hiker and use the visitor-station trail to evacuate.",
  "steps": [
   [
    "rescue",
    0,
    "Rescue the hiker at the lookout"
   ],
   [
    "escort",
    0,
    "Return the hiker to the visitor station"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 },
 {
  "name": "Ridge Bomb Disposal",
  "map": 7,
  "roster": 8,
  "diff": "Tight",
  "time": 960,
  "bombTime": 360,
  "story": "Take the longer rock-ridge switchbacks. Defuse charges at the fumarole-view junction and lookout platform. An armored guard anchors the final bend. Return to the visitor station after both charges are safe.",
  "steps": [
   [
    "defuse",
    2,
    "Defuse the trail-junction and lookout charges"
   ],
   [
    "waypoint",
    0,
    "Return to the visitor station"
   ]
  ],
  "win": "Complete the site objectives and reach the marked evacuation point. Eliminations alone do not complete this mission.",
  "lose": "Armor reaches zero, an active bomb detonates, or the mission timer expires."
 }
];
const artSprites={};const canvas=$('scene'),ctx=canvas.getContext('2d',{alpha:true}); let CW=960,CH=540,DPR=1;
function resize(){const w=innerWidth,h=innerHeight;canvas.width=Math.min(1280,Math.floor(w*Math.min(devicePixelRatio||1,1.3)));canvas.height=Math.min(720,Math.floor(h*Math.min(devicePixelRatio||1,1.3)));CW=canvas.width;CH=canvas.height;ctx.imageSmoothingEnabled=true;}
addEventListener('resize',resize);resize();
let screen='menu', selected=0, running=false, paused=false,game=null, last=performance.now(), screenDepth=[],spriteCache={};
let soundOn=true,audio=null;function beep(type='tap',vol=.12){if(!soundOn)return;try{audio||=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type==='shot'?'sawtooth':type==='damage'?'square':'sine';o.frequency.setValueAtTime(type==='shot'?210:type==='hit'?640:type==='win'?525:type==='damage'?120:410,t);o.frequency.exponentialRampToValueAtTime(type==='shot'?65:type==='win'?880:type==='damage'?65:290,t+.12);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.16);}catch(e){}}
function show(id){for(const el of document.querySelectorAll('.panel-screen'))el.classList.toggle('active',el.id===id);screen=id;$('gameHUD').hidden=id!=='playing';$('pauseOverlay').hidden=true;canvas.style.display=id==='playing'?'none':'block';}
function save(){try{localStorage.setItem('tvsa_progress_v1',JSON.stringify(progress));}catch(e){}}
let progress={unlocked:1,stars:{}};try{Object.assign(progress,JSON.parse(localStorage.getItem('tvsa_progress_v1')||'{}'));}catch(e){}progress.unlocked=Math.max(1,Math.min(12,progress.unlocked||1));
function missionSelect(){running=false;show('missionSelect');const grid=$('missionGrid');grid.replaceChildren();missions.forEach((m,i)=>{let b=document.createElement('button');b.className='mission-tile';b.disabled=i>=progress.unlocked;b.style.opacity=b.disabled?'.48':'1';b.style.backgroundImage=`linear-gradient(100deg,#0b2d63ec,#124879dd),url('assets/landmark-${m.map+1}.jpg')`;b.style.backgroundSize='cover';b.style.backgroundPosition='center';b.innerHTML=`<div class="top"><span>MISSION ${String(i+1).padStart(2,'0')}</span><span class="tag ${m.diff==='Tight'?'tight':''}">${m.diff.toUpperCase()}</span></div><b>${m.name}</b><small>${maps[m.map].name}</small><small>${b.disabled?'🔒 LOCKED':(progress.stars[i]?'★'.repeat(progress.stars[i])+' CLEARED':'READY TO DEPLOY')}</small>`;b.onclick=()=>brief(i);grid.append(b);});}
function brief(i){selected=i;$('defenseBtn').hidden=![7,11].includes(i);const m=missions[i];show('briefing');$('briefNumber').textContent=`MISSION ${String(i+1).padStart(2,'0')}`;$('briefTitle').textContent=m.name;$('briefLocation').textContent=maps[m.map].name;$('briefStory').textContent=m.story;$('briefDifficulty').textContent=m.diff.toUpperCase();$('briefDifficulty').className='difficulty '+(m.diff==='Tight'?'tight':'');$('briefObjectives').replaceChildren();m.steps.forEach(s=>{let li=document.createElement('li');li.textContent=s[2];$('briefObjectives').append(li)});$('briefWin').textContent=m.win;$('briefLose').textContent=m.lose;let bg=$('briefLandscape');bg.style.backgroundImage=`linear-gradient(0deg,#071e43dd,transparent 70%),url('assets/landmark-${m.map+1}.jpg')`;bg.style.backgroundPosition=`${m.map===0?'center':m.map===7?'right':'35%'} center`;}
$('continueBtn').onclick=()=>brief(Math.max(0,progress.unlocked-1));$('openMissions').onclick=missionSelect;document.querySelectorAll('[data-back]').forEach(x=>x.onclick=()=>screen==='briefing'?missionSelect():show('menu'));$('deployBtn').onclick=()=>start('campaign');$('defenseBtn').onclick=()=>start('defense');
$('soundToggle').onclick=()=>{soundOn=!soundOn;$('soundToggle').textContent=soundOn?'♫ ON':'♫ OFF';beep();};$('fullscreen').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.();};
function solid(x,y){const row=game?.grid[Math.floor(y)],col=Math.floor(x);return !row||col<0||col>=row.length||row[col]>0;}
function passable(x,y,r=.22){return !solid(x-r,y-r)&&!solid(x+r,y-r)&&!solid(x-r,y+r)&&!solid(x+r,y+r);}
function visibility(x1,y1,x2,y2){
 const d=Math.hypot(x2-x1,y2-y1),steps=Math.max(1,Math.ceil(d/.16)),f=game.route.floorAt,
  aHeight=f(x1,y1)+1.55,bHeight=f(x2,y2)+1.25;
 for(let i=1;i<steps;i++){
  const t=i/steps,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t,h=game.route.occlusion[Math.floor(y)]?.[Math.floor(x)];
  if(h===undefined)return false;if(h>0&&f(x,y)+h>aHeight+(bHeight-aHeight)*t)return false;
 }return true;
}

function objectiveAt(type,index=0){
 const p=game.route.plan,location=type==='bomb'||type==='device'?p.bombs[index]:type==='rescue'?p.hostage:p.extraction;
 return {type,...location,active:true,index};
}
function start(mode='campaign'){
 if(!window.TV3D?.ready){note('Loading the textured character and 3D engine…',3);return;}
 if(mode!=='campaign'&&mode!=='defense')mode='campaign';
 if(mode==='defense'&&![7,11].includes(selected))mode='campaign';
 const base=missions[selected],m=mode==='defense'?{...base,name:base.name+' — Defense Drill',
  steps:[['defend',3,'Optional defense drill — clear three incoming waves']],win:'Clear the three explicit defense waves.'}:base;
 const layout=window.TVRoutes.create(maps[m.map].theme,null,selected),entry=mode==='campaign'?layout.plan.start:layout.plan.siteStart;
 game={id:selected,m,mode,theme:maps[m.map],grid:layout.grid,route:layout,routeProgress:0,encounterEvents:[],routeGuide:null,passableForRoute:passable,defuseProgress:0,defuseCooldown:0,bombRemaining:mode==='campaign'?m.bombTime:0,bombTotal:mode==='campaign'?(m.steps.find(s=>s[0]==='defuse')?.[1]||0):0,px:entry.x,py:entry.y,dir:Math.atan2(layout.plan.nodes[1].y-entry.y,layout.plan.nodes[1].x-entry.x),pitch:0,jumpHeight:0,jumpVelocity:0,
  armor:100,escortHealth:100,terminalHealth:100,ammo:30,reserve:150,weapon:0,aim:false,reloadUntil:0,recoil:0,
  shieldUntil:0,droneUntil:0,enemies:[],downeds:[],objective:null,stage:0,preparedStage:-1,stageDone:0,nextInteractAt:0,
  kills:0,shots:0,hits:0,devices:0,rescues:0,elapsed:0,remaining:m.time,animation:0,muzzle:0,hitFlash:0,wasMoving:false,
  escort:null,lastFire:-10,spawnCycle:0,defendClock:0,spawnLocked:false,nextEnemyId:1,spawnEvents:[]};
 running=true;paused=false;keys.clear();firing=false;moveInput.x=moveInput.y=0;show('playing');ctx.clearRect(0,0,CW,CH);passable.bounds={width:game.grid[0].length,height:game.grid.length};window.TV3D.load(m.map,game.grid,layout);
 if(mode==='campaign'){
  window.TVRoutes.roster(game,m.roster,spawnEnemy);game.spawnCycle+=3;
  game.spawnEvents.push({reason:'hidden-roster',time:0,count:game.enemies.length});
 }else spawnWave(3,false,'deployment');
 game.rosterSize=game.enemies.length;game.spawnLocked=mode==='campaign';
 prepareStage();window.TVRoutes.update(game,visibility);beep('win',.09);note(mode==='defense'?'OPTIONAL DEFENSE — WAVE 1 / 3':'OPEN CITY — CHECK YOUR OBJECTIVE',2.5);
}
function spawnEnemy(x,y,kind='guard'){
 if(!running||game.spawnLocked||solid(x,y))return false;
 const hp=kind==='heavy'?6:3;
 game.enemies.push({id:game.nextEnemyId++,x,y,kind,appearance:window.TVCharacterStyles.enemy(game.theme.theme,game.nextEnemyId,kind),hp,maxHp:hp,phase:Math.random()*6,moving:false,facing:Math.PI,
  fall:0,state:'active',hitAt:0,locomotionSpeed:0,intent:'hold',nextShot:game.elapsed+1.1+Math.random()*.8});return game.enemies[game.enemies.length-1];
}
function spawnWave(n,heavy=false,reason='defense-wave'){
 if(!running||game.spawnLocked)return false;
 const slots=game.route.plan.defenseSpots,before=game.enemies.length;
 for(let i=0;i<n;i++){
  const p=slots[(game.spawnCycle+i*7)%slots.length];
  spawnEnemy(p.x,p.y,heavy?'heavy':i%3===2?'shield':'guard');
 }
 game.spawnCycle+=3;game.spawnEvents.push({reason,time:game.elapsed,count:game.enemies.length-before});return true;
}
function prepareStage(){
 if(!running||!game||game.preparedStage===game.stage)return;
 const st=game.m.steps[game.stage];game.preparedStage=game.stage;
 game.objective=null;game.escort=null;game.defuseProgress=0;interactHeld=false;$('interactBtn').style.display='none';$('missionPrompt').style.display='none';
 if(!st){finish(true);return;}
 game.stageDone=0;game.objectIndex=0;
 // Keep living threats; defeated actors remain in downeds for the 3D renderer.
 game.enemies=game.enemies.filter(e=>e.state==='active');
 // Stage preparation never creates enemies. Campaign roster is sealed at deployment.
 if(st[0]==='defend'){game.defendClock=0;game.terminalHealth=100;}
 else if(st[0]==='rescue')game.objective=objectiveAt('rescue');
 else if(st[0]==='escort'){game.escort={...objectiveAt('rescue'),safety:100};game.objective={type:'exit',...game.route.plan.extraction,active:true};}
 else if(st[0]==='defuse')game.objective=objectiveAt('bomb');
 else if(st[0]==='disable')game.objective=objectiveAt('device');
 else if(st[0]==='waypoint')game.objective=objectiveAt('point');
 updateHUD();note(st[0]==='defend'?`DEFENSE — WAVE 1 / ${st[1]}`:st[2],2);
}
function nextStage(expectedStage){
 if(!running||!game||game.stage!==expectedStage||game.preparedStage!==expectedStage||(game.m.steps[expectedStage]?.[0]==='defend'&&game.enemies.some(e=>e.state==='active')))return;
 game.stage++;prepareStage();
}
let interactHeld=false;
let noticeUntil=0;function note(msg,seconds=1.6){$('notice').textContent=msg;$('notice').style.opacity=1;noticeUntil=performance.now()/1000+seconds;}
function updateHUD(){
 if(!game)return;const st=game.m.steps[game.stage],g=game;
 $('buildLabel').textContent=BUILD;
 $('gameHUD').style.setProperty?.('--damage',String(Math.min(1,g.hitFlash*5)));
 $('hostileCount').textContent=g.mode==='campaign'?g.route.plan.name+' · '+g.enemies.filter(e=>e.state==='active'&&e.awakened).length+' ENGAGED · NO RESPAWN':'OPTIONAL DEFENSE WAVES';
 $('hudMission').textContent=`MISSION ${String(g.id+1).padStart(2,'0')} · ${g.theme.name}`;
 $('hudObjective').textContent=st?(st[0]==='defend'?`WAVE ${g.stageDone+1} / ${st[1]} · TERMINAL ${Math.ceil(g.terminalHealth)}%`:st[0]==='defuse'?`${st[2]} · ${g.stageDone} / ${st[1]} SAFE`+(g.defuseProgress?` · ${Math.floor(g.defuseProgress/4*100)}%`:''):st[2]):'Mission Complete';
 const bomb=g.devices<g.bombTotal&&g.bombRemaining>0,remaining=bomb?g.bombRemaining:g.remaining;
 $('hudTimer').textContent=`${bomb?'BOMB':'TIME'} ${Math.max(0,Math.floor(remaining/60)).toString().padStart(2,'0')}:${Math.max(0,Math.floor(remaining%60)).toString().padStart(2,'0')}`;
 $('hudTimer').style.color=bomb?'#ff9b71':remaining<60?'#ff907e':'#ffd666';
 $('armorBar').style.width=`${Math.max(0,g.armor)}%`;$('armorText').textContent=Math.ceil(g.armor);
 $('weaponName').textContent=g.weapon?'PULSE SIDEARM':'SKYLINE RIFLE';$('ammoText').textContent=g.reloadUntil?'RELOADING':`${g.ammo} / ${g.reserve}`;
}

function jump(){
 if(!running||!game||paused||game.jumpHeight>.001||Math.abs(game.jumpVelocity)>.001)return false;
 game.jumpVelocity=5.6;return true;
}
function updateJump(dt){
 if(game.jumpHeight<=0&&game.jumpVelocity<=0)return;
 game.jumpVelocity-=18*dt;game.jumpHeight+=game.jumpVelocity*dt;
 const ceiling=window.TVRoutes.ceilingAt(game,game.px,game.py)-game.route.floorAt(game.px,game.py)-1.8-.02;
 if(game.jumpHeight>ceiling){game.jumpHeight=Math.max(0,ceiling);game.jumpVelocity=Math.min(0,game.jumpVelocity);}
 if(game.jumpHeight<=0){game.jumpHeight=0;game.jumpVelocity=0;}
}
function canPlayerMove(x,y){return passable(x,y,.21)&&game.route.floorAt(x,y)+1.8+(game.jumpHeight||0)+.02<=window.TVRoutes.ceilingAt(game,x,y)+1e-6;}
function move(dx,dy){if(!running||paused)return;if(canPlayerMove(game.px+dx,game.py))game.px+=dx;if(canPlayerMove(game.px,game.py+dy))game.py+=dy;}
function shoot(){completeReload();if(game?.reloadUntil)return;if(!running||paused||game.elapsed-game.lastFire<(game.weapon?.3:.16))return;game.lastFire=game.elapsed;if(game.ammo<=0){note('RELOAD REQUIRED',1);beep('tap');return;}game.ammo--;game.shots++;game.muzzle=.08;game.recoil=Math.min(.12,game.recoil+.018);game.shotNoiseUntil=game.elapsed+1.5;beep('shot',.07);let target=null,angle=game.dir,best=1e6;for(const e of game.enemies){if(e.state!=='active')continue;let dist=Math.hypot(e.x-game.px,e.y-game.py),ad=Math.atan2(e.y-game.py,e.x-game.px)-angle;ad=Math.atan2(Math.sin(ad),Math.cos(ad));const threshold=Math.atan(.3/Math.max(.1,dist))+(game.aim?.003:.009);if(Math.abs(ad)<threshold*3&&visibility(game.px,game.py,e.x,e.y)){if(e.awakened===false)window.TVRoutes.wakeGroup(game,e.encounterId,'incoming-fire');window.TVTactics.react(e,game);}const height=game.route.floorAt(game.px,game.py)+1.65+(game.jumpHeight||0)+Math.tan(game.pitch||0)*dist-game.route.floorAt(e.x,e.y);if(height<.15||height>(e.crouching?1.25:1.95))continue;if(Math.abs(ad)<threshold&&dist<21&&dist<best&&visibility(game.px,game.py,e.x,e.y)){target=e;best=dist;}}if(target){game.hits++;target.hp--;target.hitAt=.25;beep('hit',.07);if(target.hp<=0){target.state='disabled';target.fall=0;target.moving=false;game.downeds.push(target);game.kills++;note('HOSTILE UNIT STOPPED!',.85);}else note('DIRECT HIT!',.5);}updateHUD();}
function completeReload(){if(!game||!game.reloadUntil||game.elapsed<game.reloadUntil)return;
 const max=game.weapon?12:30,take=Math.min(max-game.ammo,game.reserve);game.ammo+=take;game.reserve-=take;game.reloadUntil=0;updateHUD();}
function reload(){if(!running||!game||paused||game.reloadUntil||game.ammo>=(game.weapon?12:30)||game.reserve<=0)return;
 game.reloadUntil=game.elapsed+(game.weapon?1.1:1.65);note('RELOADING…',1.2);beep();}
function switchWeapon(){if(!game)return;game.weapon=1-game.weapon;game.reloadUntil=0;game.ammo=Math.min(game.ammo,game.weapon?12:30);note(game.weapon?'PULSE SIDEARM':'SKYLINE RIFLE',1);updateHUD();}
function tool(name){if(!game||paused)return;if(name==='shield'){game.shieldUntil=game.elapsed+7;note('HALO SHIELD ACTIVE',1.5);beep('win',.08);}else if(name==='drone'){game.droneUntil=game.elapsed+12;note('SCOUT WING: TARGETS MARKED',1.5);beep('win',.08);}else if(name==='device'){interact();}}
function nearObjective(){let o=game?.objective;if(!o?.active)return false;return Math.hypot(game.px-o.x,game.py-o.y)<1.9;}
function localThreat(){return game.enemies.some(e=>e.state==='active'&&e.awakened!==false&&Math.hypot(e.x-game.px,e.y-game.py)<9&&visibility(game.px,game.py,e.x,e.y));}
function interact(){
 if(!running||!game||paused||!game.objective?.active||game.elapsed<game.nextInteractAt)return;
 const stage=game.stage,st=game.m.steps[stage],o=game.objective;
 if(!st)return;if(!nearObjective()){note('MOVE CLOSER TO THE OBJECTIVE',1);return;}
 if(localThreat()){note('NEARBY GUARD — SECURE YOUR POSITION',1);return;}
 if(st[0]==='defuse'){note('HOLD F / INTERACT — 4 SECONDS',1);return;}
 if(st[0]==='escort'&&(!game.escort||Math.hypot(game.escort.x-o.x,game.escort.y-o.y)>=2.5)){note('WAIT FOR YOUR ESCORT',1.1);return;}
 o.active=false;game.nextInteractAt=game.elapsed+.3;
 if(st[0]==='rescue'){game.rescues++;note('HOSTAGE FOLLOWING — REACH THE EXIT',2);beep('win');nextStage(stage);}
 else if(st[0]==='escort'||st[0]==='waypoint')nextStage(stage);
}
function updateDefuse(dt,damaged){
 if(game.m.steps[game.stage]?.[0]!=='defuse')return;
 const held=keys.has('f')||interactHeld,blocked=!nearObjective()||localThreat()||game.wasMoving||firing||game.jumpHeight>0||damaged;
 if(damaged)game.defuseCooldown=game.elapsed+.8;
 if(!held||blocked||game.elapsed<game.defuseCooldown){if(game.defuseProgress)note('DEFUSE INTERRUPTED',1);game.defuseProgress=0;return;}
 if(!game.objective?.active||game.elapsed<game.nextInteractAt)return;
 game.defuseProgress+=dt;
 if(game.defuseProgress+1e-7>=4){
  const stage=game.stage,st=game.m.steps[stage];game.objective.active=false;game.devices++;game.stageDone++;game.defuseProgress=0;game.nextInteractAt=game.elapsed+.3;
  note('BOMB SAFE',1.5);beep('win');
  if(game.stageDone>=st[1])nextStage(stage);else game.objective=objectiveAt('bomb',game.stageDone);
 }
}

function finish(success){if(!running)return;running=false;firing=false;keys.clear();show('results');$('resultIcon').textContent=success?'★':'↻';$('resultIcon').style.color=success?'#ffcf51':'#ff8e8e';$('resultTitle').textContent=success?'MISSION COMPLETE!':'MISSION FAILED';$('resultSub').textContent=success?`${game.m.name} — Taipei mission secured.`:'The mission objective was not completed. Try again!';let score=Math.max(1,Math.min(3,Math.round(3-(game.armor<40?1:0)-(game.hits/Math.max(1,game.shots)<.25?1:0))));if(success&&game.mode==='campaign'){progress.stars[game.id]=Math.max(progress.stars[game.id]||0,score);progress.unlocked=Math.max(progress.unlocked,Math.min(12,game.id+2));save();beep('win',.14);}else beep('damage',.12);$('resultStats').innerHTML=`<div><b>${Math.floor(game.elapsed/60)}:${Math.floor(game.elapsed%60).toString().padStart(2,'0')}</b><small>TIME</small></div><div><b>${game.kills}</b><small>UNITS STOPPED</small></div><div><b>${game.shots?Math.round(game.hits/game.shots*100):0}%</b><small>ACCURACY</small></div><div><b>${game.rescues}</b><small>RESCUES</small></div><div><b>${game.devices}</b><small>DEVICES</small></div><div><b>${success?'★'.repeat(score):'—'}</b><small>RATING</small></div>`;$('resultPrimary').textContent=success&&game.mode==='campaign'&&game.id<11?'NEXT MISSION':'TRY AGAIN';$('resultPrimary').onclick=()=>success&&game.mode==='campaign'&&game.id<11?brief(game.id+1):start(game.mode);$('resultSecondary').onclick=missionSelect;}
function pause(){
 if(!running)return;paused=!paused;firing=false;interactHeld=false;game.defuseProgress=0;keys.clear();$('pauseOverlay').hidden=!paused;
 if(paused&&document.pointerLockElement)document.exitPointerLock?.();
}
$('pauseBtn').onclick=pause;$('resumeBtn').onclick=pause;$('restartBtn').onclick=()=>{paused=false;start(game?.mode);};$('quitBtn').onclick=()=>{paused=false;running=false;missionSelect();};$('reloadBtn').onclick=reload;$('switchBtn').onclick=switchWeapon;$('aimBtn').onclick=()=>{if(game){game.aim=!game.aim;$('aimBtn').style.borderColor=game.aim?'#ffe15e':'';}};$('interactBtn').onclick=interact;
$('interactBtn').addEventListener('pointerdown',e=>{e.preventDefault();interactHeld=true;$('interactBtn').setPointerCapture(e.pointerId);interact();});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])$('interactBtn').addEventListener(ev,()=>{interactHeld=false;});document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>tool(b.dataset.tool));
let moveInput={x:0,y:0},keys=new Set(),firing=false,padId=null,lookId=null,lastLookX=0,lastLookY=0;
const pad=$('movePad'),look=$('lookPad'),knob=$('moveKnob');
look.addEventListener('dblclick',()=>look.requestPointerLock?.());
addEventListener('mousemove',e=>{if(document.pointerLockElement!==look||!running||paused)return;game.dir+=e.movementX*.0025;game.pitch=Math.max(-.65,Math.min(.65,game.pitch-e.movementY*.002));});
function isGameView(target){
 return target===look||target===$('gameHUD')||target===$('world3d')||target===canvas||!!target?.closest?.('#lookPad');
}
addEventListener('pointerdown',e=>{
 if(e.pointerType!=='mouse'||e.button!==0||!running||paused)return;
 if(document.pointerLockElement!==look&&!isGameView(e.target))return;
 firing=true;shoot();
 if(document.pointerLockElement!==look){try{look.requestPointerLock?.()?.catch?.(()=>{});}catch{}}
});
addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&e.button===0)firing=false;});
addEventListener('pointercancel',e=>{if(e.pointerType==='mouse')firing=false;});
document.addEventListener?.('pointerlockchange',()=>{
 if(document.pointerLockElement!==look){firing=false;lookId=null;}
});
addEventListener('blur',()=>{keys.clear();firing=false;moveInput.x=moveInput.y=0;if(running&&!paused)pause();});
function updatePad(e){let r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+62;let x=(e.clientX-cx)/50,y=(e.clientY-cy)/50;let mag=Math.max(1,Math.hypot(x,y));moveInput.x=x/mag;moveInput.y=y/mag;knob.style.transform=`translate(${moveInput.x*35}px,${moveInput.y*35}px)`;}
pad.addEventListener('pointerdown',e=>{padId=e.pointerId;pad.setPointerCapture(e.pointerId);updatePad(e);e.preventDefault();});pad.addEventListener('pointermove',e=>{if(e.pointerId===padId){updatePad(e);e.preventDefault();}});function padUp(e){if(e.pointerId===padId){padId=null;moveInput.x=moveInput.y=0;knob.style.transform='';}}pad.addEventListener('pointerup',padUp);pad.addEventListener('pointercancel',padUp);
look.addEventListener('pointerdown',e=>{lookId=e.pointerId;lastLookX=e.clientX;lastLookY=e.clientY;look.setPointerCapture(e.pointerId);e.preventDefault()});look.addEventListener('pointermove',e=>{if(e.pointerId!==lookId||!running||paused||document.pointerLockElement===look)return;let dx=e.clientX-lastLookX,dy=e.clientY-lastLookY;lastLookX=e.clientX;lastLookY=e.clientY;game.dir+=dx*.005*(game.aim?.58:1);game.pitch=Math.max(-.52,Math.min(.52,(game.pitch||0)-dy*.003));e.preventDefault();});look.addEventListener('pointerup',()=>lookId=null);look.addEventListener('pointercancel',()=>lookId=null);
const fire=$('fireBtn');fire.addEventListener('pointerdown',e=>{firing=true;fire.setPointerCapture(e.pointerId);shoot();e.preventDefault();});fire.addEventListener('pointerup',()=>firing=false);fire.addEventListener('pointercancel',()=>firing=false);
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase(),space=e.code==='Space'||k===' ';
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)||(space&&running))e.preventDefault();
 const held=keys.has(k);keys.add(k);if(e.repeat||(space&&held))return;
 if(k==='escape'&&running)pause();else if(space)jump();else if(k==='r')reload();else if(k==='f')interact();
 else if(k==='q')tool('shield');else if(k==='e')tool('drone');
 else if(k==='1'||k==='2'){if(game){game.weapon=k==='2'?1:0;updateHUD();}}
});
addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());});
function simulate(dt){if(!game||paused||!running)return;dt=Math.min(dt,.05);game.elapsed+=dt;game.remaining-=dt;
if(game.devices<game.bombTotal){game.bombRemaining=Math.max(0,game.bombRemaining-dt);if(game.bombRemaining<=0){finish(false);return;}}
updateJump(dt);game.animation+=dt*(game.wasMoving?8:1.4);game.muzzle=Math.max(0,game.muzzle-dt);game.hitFlash=Math.max(0,game.hitFlash-dt);game.recoil=Math.max(0,game.recoil-dt*.1);completeReload();if(game.remaining<=0){finish(false);return;}
if(keys.has('arrowleft'))game.dir-=dt*1.8;if(keys.has('arrowright'))game.dir+=dt*1.8;
let forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-moveInput.y;let side=(keys.has('d')?1:0)-(keys.has('a')?1:0)+moveInput.x;let magnitude=Math.hypot(forward,side);game.wasMoving=magnitude>.08;if(magnitude>1){forward/=magnitude;side/=magnitude;}let sp=(keys.has('shift')?4.1:3.2)*dt;move(Math.cos(game.dir)*forward*sp+Math.cos(game.dir+Math.PI/2)*side*sp,Math.sin(game.dir)*forward*sp+Math.sin(game.dir+Math.PI/2)*side*sp);if(firing)shoot();
window.TVRoutes.update(game,visibility);
const armorBefore=game.armor;
for(const e of game.enemies){window.TVTactics.update(e,game,dt,{passable,visibility,solid,onDamage:()=>beep('damage',.026)});if(game.armor<=0){finish(false);return;}}
updateDefuse(dt,game.armor<armorBefore);
if(!running)return;
for(const e of game.downeds)e.fall=Math.min(1,e.fall+dt*2.0);if(game.downeds.length>22)game.downeds.splice(0,game.downeds.length-22);
const stage=game.stage,st=game.m.steps[stage];
if(st){
 if(st[0]==='combat'&&game.enemies.length&&game.enemies.every(e=>e.state!=='active'))nextStage(stage);
 else if(st[0]==='waypoint'&&nearObjective()&&!localThreat())nextStage(stage);
 else if(st[0]==='defend'&&game.mode==='defense'){
  game.defendClock=Math.min(10,game.defendClock+dt);
  const active=game.enemies.filter(e=>e.state==='active');
  if(active.length){
   game.terminalHealth-=dt*(game.m.diff==='Tight'?.55:.3)*active.length;
   if(game.terminalHealth<=0){finish(false);return;}
  }else if(game.defendClock>=10){
   game.defendClock=0;game.stageDone++;
   if(game.stageDone>=st[1])nextStage(stage);
   else{game.enemies=game.enemies.filter(e=>e.state==='active');spawnWave(3+game.stageDone,false,'defense-wave-'+(game.stageDone+1));note(`DEFENSE — WAVE ${game.stageDone+1} / ${st[1]}`,1.8);}
  }
 }else if(st[0]==='escort'&&game.escort){
  const o=game.escort,d=Math.hypot(game.px-o.x,game.py-o.y);
  if(d>1.3&&d<9){
   let target={x:game.px,y:game.py};
   if(!visibility(o.x,o.y,game.px,game.py)){
    if(!o.route||game.elapsed>=(o.repathAt||0)){o.route=window.TVTactics.findPath(o.x,o.y,game.px,game.py,passable);o.repathAt=game.elapsed+.5;}
    while(o.route?.length&&Math.hypot(o.route[0].x-o.x,o.route[0].y-o.y)<.2)o.route.shift();
    target=o.route?.[0]||target;
   }
   const length=Math.hypot(target.x-o.x,target.y-o.y)||1,step=2.35*dt,dx=(target.x-o.x)/length*step,dy=(target.y-o.y)/length*step;
   if(passable(o.x+dx,o.y,.3))o.x+=dx;if(passable(o.x,o.y+dy,.3))o.y+=dy;
  }
  // Only guards in actual range and line of sight endanger the escort.
  if(game.enemies.some(e=>e.state==='active'&&e.awakened!==false&&Math.hypot(e.x-o.x,e.y-o.y)<10&&visibility(e.x,e.y,o.x,o.y))){o.safety-=dt*2;if(o.safety<=0){finish(false);return;}}
  if(Math.hypot(o.x-game.objective.x,o.y-game.objective.y)<2.2&&Math.hypot(game.px-game.objective.x,game.py-game.objective.y)<2.8&&!localThreat())nextStage(stage);
 }
}
if(game.ammo===0&&game.reserve===0){game.reserve=48;note('EMERGENCY AMMO SUPPLY!',1.3);}updateHUD();let it=game.objective&&nearObjective();$('interactBtn').style.display=it?'block':'none';$('missionPrompt').style.display=it?'block':'none';$('missionPrompt').textContent=it?(game.objective.type==='bomb'?`HOLD F / INTERACT — DEFUSE ${Math.floor(game.defuseProgress/4*100)}%`:game.objective.type==='device'?'TAP INTERACT — DISABLE DEVICE':game.objective.type==='rescue'?'TAP INTERACT — RESCUE':game.objective.type==='exit'?'ESCORT TO THE EXIT':'CHECKPOINT REACHED'):'';if(performance.now()/1000>noticeUntil)$('notice').style.opacity=0;
}
// Painted character sprites, lighting and decorative landmark skyline are original procedural artwork.
function sprite(kind){if(spriteCache[kind])return spriteCache[kind];let c=document.createElement('canvas');c.width=160;c.height=230;let p=c.getContext('2d');p.lineJoin='round';p.lineCap='round';p.strokeStyle='#15365b';p.lineWidth=6;
const box=(x,y,w,h,r,col,stroke=true)=>{p.fillStyle=col;p.beginPath();p.roundRect(x,y,w,h,r);p.fill();if(stroke)p.stroke();};
p.save();p.shadowColor='#15355d77';p.shadowBlur=10;
if(kind==='bot'||kind==='heavy'){box(32,63,96,108,20,kind==='heavy'?'#4d6896':'#cbd5dc');box(42,74,76,70,14,'#e4f2fc');box(48,82,64,43,10,'#213b59');box(55,91,19,13,4,'#ffbf44',false);box(85,91,19,13,4,'#ffbf44',false);box(24,101,24,67,9,'#ffb33f');box(112,101,24,67,9,'#ffb33f');box(39,159,31,55,8,'#596f94');box(90,159,31,55,8,'#596f94');box(61,50,37,18,8,'#ffbe55');}else{box(51,125,28,87,8,'#4e6393');box(83,125,28,87,8,'#4e6393');box(39,89,84,76,19,'#72849e');box(52,100,56,50,11,kind==='shield'?'#d59f5d':'#d55755');box(26,95,23,68,9,'#62738d');box(115,95,23,68,9,'#62738d');p.fillStyle='#e0b98b';p.beginPath();p.arc(80,66,38,0,TAU);p.fill();p.stroke();box(43,38,75,46,16,'#48546f');box(46,53,68,24,9,'#182c47');box(54,61,53,7,3,'#65d6ef',false);box(29,134,45,19,6,'#304357');}
p.restore();spriteCache[kind]=c;return c;}
function drawLandmark(p,theme,w,h){const cx=w*.5,ground=h*.85;const c={tower:['#3d90b9','#59bad2'],memorial:['#e8f2f5','#2b5eac'],temple:['#e7b76b','#c84b3e'],museum:['#ebf4e4','#529782'],square:['#f0f6fb','#3189bd'],dome:['#d4eeff','#458bbf'],night:['#faaf67','#fa4c77'],mountain:['#4d8c7c','#7eb795']}[theme];p.save();p.translate(cx,ground);p.lineJoin='round';p.lineWidth=4;p.strokeStyle='#24506e';p.fillStyle=c[0];
const poly=(points,fill,stroke=true)=>{p.beginPath();p.moveTo(...points[0]);points.slice(1).forEach(z=>p.lineTo(...z));p.closePath();p.fillStyle=fill;p.fill();if(stroke)p.stroke();};
if(theme==='tower'){for(let i=0;i<7;i++){let ww=108-i*11,y=-38-i*39;poly([[-ww/2,y],[ww/2,y],[ww/2-7,y-39],[-ww/2+7,y-39]],i%2?c[0]:c[1]);p.fillStyle='#d0f4ff';for(let j=-ww/2+12;j<ww/2-8;j+=14)p.fillRect(j,y-31,5,20);}p.fillStyle='#f6ce72';p.fillRect(-4,-369,8,49);}
else if(theme==='memorial'||theme==='square'){const size=theme==='square'?245:170;p.fillStyle='#f8f6ea';p.fillRect(-size/2,-120,size,120);for(let j=-size/2+18;j<size/2;j+=28){p.fillStyle='#d6e4ec';p.fillRect(j,-100,13,86)}poly([[-size*.62,-133],[size*.62,-133],[size*.53,-169],[-size*.53,-169]],c[1]);poly([[-size*.56,-169],[size*.56,-169],[size*.43,-206],[-size*.43,-206]],'#2369ac');if(theme==='square'){for(let x of [-120,120]){p.fillStyle='#edf2f2';p.fillRect(x-9,-145,18,145);}}}
else if(theme==='temple'||theme==='museum'){p.fillStyle='#f5e9d5';p.fillRect(-165,-111,330,111);for(let x=-136;x<160;x+=42){p.fillStyle=theme==='temple'?'#ba5142':'#dce9e7';p.fillRect(x,-97,18,94);}poly([[-190,-123],[190,-123],[138,-173],[-138,-173]],c[1]);poly([[-135,-171],[135,-171],[98,-207],[-98,-207]],theme==='temple'?'#cf543d':'#64a48a');for(let x=-176;x<=176;x+=35){p.fillStyle='#f7da85';p.fillRect(x,-130,7,11);}}
else if(theme==='dome'){p.beginPath();p.ellipse(0,-45,210,112,0,Math.PI,0);p.lineTo(210,0);p.lineTo(-210,0);p.fillStyle='#b6d9ed';p.fill();p.stroke();for(let i=-4;i<=4;i++){p.strokeStyle='#4c93c4';p.lineWidth=3;p.beginPath();p.moveTo(i*40,0);p.lineTo(i*31,-100);p.stroke();}}
else if(theme==='night'){for(let i=0;i<7;i++){let x=-260+i*84;p.fillStyle=i%2?'#f1a85c':'#cf6390';p.fillRect(x,-125,73,125);p.fillStyle='#ffdf68';p.fillRect(x+7,-104,59,24);p.fillStyle='#f8d5a7';for(let k=0;k<3;k++)p.fillRect(x+10+k*18,-63,10,18);p.fillStyle='#e4485b';p.beginPath();p.ellipse(x+37,-144,17,21,0,0,TAU);p.fill();}}
else if(theme==='mountain'){for(let layer=0;layer<3;layer++){let shift=layer*34;poly([[-480,0],[-355,-120+shift],[-240,-40],[-80,-200+shift],[70,-60],[210,-160+shift],[440,0]],layer===0?'#72a8aa':layer===1?'#4d8c77':'#38725f',false);}p.fillStyle='#d7e6d8';p.fillRect(-75,-60,150,60);p.fillStyle='#3b5770';p.fillRect(-46,-95,92,35);p.fillRect(-4,-145,8,50);}
p.restore();}
function drawSky(p,t){let g=p.createLinearGradient(0,0,0,CH*.65);g.addColorStop(0,t.sky);g.addColorStop(.8,t.theme==='night'?'#7c5e9f':'#dbf7ff');g.addColorStop(1,t.theme==='night'?'#ff996e':'#f6e9ce');p.fillStyle=g;p.fillRect(0,0,CW,CH*.61);p.globalAlpha=t.theme==='night'?.7:.6;p.fillStyle='#fff';for(let i=0;i<7;i++){let x=((i*203+40)-(game.dir*80)%1800+1800)%1800-150,y=CH*(.12+(i%3)*.07);p.beginPath();p.ellipse(x,y,60,14,0,0,TAU);p.ellipse(x-30,y+4,48,11,0,0,TAU);p.ellipse(x+30,y+5,52,11,0,0,TAU);p.fill();}p.globalAlpha=1;
p.save();p.globalAlpha=.73;let offset=Math.sin(game.dir)*CW*.23;p.translate(offset,-CH*.02);drawLandmark(p,t.theme,CW,CH*.69);p.restore();}
function drawWorld(){if(!game)return;let t=game.theme;let h=CH,w=CW;drawSky(ctx,t);
let floor=ctx.createLinearGradient(0,h*.51,0,h);floor.addColorStop(0,t.theme==='night'?'#6d6086':'#b7bdc0');floor.addColorStop(1,t.floor);ctx.fillStyle=floor;ctx.fillRect(0,h*.51,w,h*.49);
// Receding decorative floor guides and reflected light.
ctx.strokeStyle='#f3f5ef42';ctx.lineWidth=1;for(let i=-10;i<=10;i++){let x=w/2+i*w*.12;ctx.beginPath();ctx.moveTo(w/2,h*.53);ctx.lineTo(x,h);ctx.stroke();}for(let y=.57;y<1;y+=.075){ctx.beginPath();ctx.moveTo(0,h*y);ctx.lineTo(w,h*y);ctx.stroke();}
const FOV=game.aim?.67:1.17,rays=Math.min(640,Math.ceil(w/2.2)),sw=w/rays;screenDepth=new Array(rays);
for(let i=0;i<rays;i++){let a=game.dir+Math.atan((i/rays-.5)*2*Math.tan(FOV/2));let sx=Math.cos(a),sy=Math.sin(a),mx=Math.floor(game.px),my=Math.floor(game.py);let deltaX=Math.abs(1/(sx||.00001)),deltaY=Math.abs(1/(sy||.00001));let stepx=sx<0?-1:1,stepy=sy<0?-1:1,sideX=(sx<0?game.px-mx:mx+1-game.px)*deltaX,sideY=(sy<0?game.py-my:my+1-game.py)*deltaY,hit=0,side=0,dist=24;
for(let k=0;k<45;k++){if(sideX<sideY){sideX+=deltaX;mx+=stepx;side=0;}else{sideY+=deltaY;my+=stepy;side=1;}if(mx<0||my<0||mx>=24||my>=24){hit=1;break;}if(game.grid[my][mx]){hit=game.grid[my][mx];dist=side===0?(mx-game.px+(1-stepx)/2)/(sx||.00001):(my-game.py+(1-stepy)/2)/(sy||.00001);break;}}
let d=Math.max(.12,dist*Math.cos(a-game.dir));screenDepth[i]=d;let wallH=Math.min(h*3,h*.86/d*2.25),top=h*.51-wallH*.51,shade=Math.max(.37,1-d/21)*(side===1?.83:1);ctx.fillStyle=shadeColor(t.wall,shade);ctx.fillRect(i*sw,top,sw+1,wallH);let u=(side===0?game.py+dist*sy:game.px+dist*sx)%1;if(u<0)u+=1;
// Facade outlines, material panels, decorative tiled windows.
if(u<.065||u>.94){ctx.fillStyle=shadeColor(t.trim,shade*.9);ctx.fillRect(i*sw,top,sw+1,wallH);}if(hit>=2&&u>.22&&u<.76){let mid=top+wallH*.19;ctx.fillStyle=shadeColor(hit===6?'#3d8661':t.accent,shade);ctx.fillRect(i*sw,mid,sw+1,wallH*.2);}if(hit===1&&u>.3&&u<.68&&Math.floor(u*8)%3===0){ctx.fillStyle=shadeColor('#eaf8ff',shade*.6);ctx.fillRect(i*sw,top+wallH*.26,sw+1,wallH*.3);}ctx.fillStyle=`rgba(255,255,255,${.15*shade})`;ctx.fillRect(i*sw,top+wallH*.08,sw+1,Math.max(1,wallH*.013));ctx.fillStyle=`rgba(1,24,57,${.13})`;ctx.fillRect(i*sw,top+wallH*.88,sw+1,wallH*.12);
}
let items=[];for(const e of game.enemies)if(Math.hypot(e.x-game.px,e.y-game.py)<22)items.push({x:e.x,y:e.y,type:'enemy',e});if(game.objective)items.push({x:game.objective.x,y:game.objective.y,type:game.objective.type});if(game.escort)items.push({x:game.escort.x,y:game.escort.y,type:'escort'});items.sort((a,b)=>Math.hypot(b.x-game.px,b.y-game.py)-Math.hypot(a.x-game.px,a.y-game.py));
for(const o of items){let dx=o.x-game.px,dy=o.y-game.py,dist=Math.hypot(dx,dy);let angle=Math.atan2(dy,dx)-game.dir;angle=Math.atan2(Math.sin(angle),Math.cos(angle));if(Math.abs(angle)>FOV*.69||dist<.25)continue;let xp=(.5+Math.tan(angle)/(2*Math.tan(FOV/2)))*w,base=h*.51,scale=h*.68/dist,wi=scale*.82,he=scale*1.43;let ray=Math.floor(xp/w*rays);if(ray<0||ray>=rays||screenDepth[ray]<dist-.4)continue;
if(o.type==='enemy'){const e=o.e;ctx.globalAlpha=e.state==='disabled'?.7:1;let img=(artSprites[e.kind]?.complete&&artSprites[e.kind]?.naturalWidth)?artSprites[e.kind]:sprite(e.kind);let sy=base-he*.66+(e.state==='disabled'?he*.46:Math.sin(e.phase*4)*2);ctx.drawImage(img,xp-wi/2,sy,wi,he*(e.state==='disabled'?.55:1));ctx.globalAlpha=1;if(e.state==='active'){ctx.fillStyle='#0c2758';ctx.fillRect(xp-wi*.29,sy-12,wi*.58,7);ctx.fillStyle=e.hitAt>0?'#fffa8c':'#ff6667';ctx.fillRect(xp-wi*.29,sy-12,wi*.58*Math.min(1,e.hp/(e.kind==='heavy'?10:e.kind==='shield'?4:e.kind==='bot'?2:3)),7);if(e.kind==='shield'){ctx.strokeStyle='#9ceaffaa';ctx.lineWidth=Math.max(2,scale*.025);ctx.strokeRect(xp-wi*.45,sy+he*.24,wi*.9,he*.45);}if(e.hitAt>0){ctx.fillStyle='#ffdf66';for(let z=0;z<6;z++){let th=z*TAU/6+e.phase;ctx.fillRect(xp+Math.cos(th)*20,sy+he*.45+Math.sin(th)*20,Math.max(3,scale*.07),3);}}}}
else{let isRescue=o.type==='rescue'||o.type==='escort';let color=isRescue?'#fbd270':o.type==='device'?'#64f4f9':'#84fb94';let sy=base-he*.55;ctx.fillStyle='#062c56aa';ctx.beginPath();ctx.ellipse(xp,sy+he*.8,wi*.5,he*.12,0,0,TAU);ctx.fill();if(isRescue){ctx.drawImage(sprite('rescue'),xp-wi/2,sy,wi,he);}else{ctx.fillStyle=color;ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(xp-wi*.38,sy+he*.22,wi*.76,he*.48,Math.min(12,wi*.1));ctx.fill();ctx.stroke();ctx.fillStyle='#174f7a';ctx.textAlign='center';ctx.font=`900 ${Math.max(11,wi*.24)}px system-ui`;ctx.fillText(o.type==='device'?'⌁':'➤',xp,sy+he*.52);}ctx.fillStyle='#042c52';ctx.fillRect(xp-wi*.6,sy-30,wi*1.2,23);ctx.fillStyle='#e9fcff';ctx.font=`bold ${Math.max(11,Math.min(16,scale*.2))}px system-ui`;ctx.textAlign='center';ctx.fillText(isRescue?'RESCUE TARGET':o.type==='device'?'DISABLE DEVICE':'CHECKPOINT',xp,sy-14);}}
// Original cartoon-tech foreground weapon, with mechanical highlights and firing flash.
drawWeapon(ctx,w,h);
// Direction indicator and color grading.
ctx.fillStyle=t.theme==='night'?'#4023580c':'#159bd709';ctx.fillRect(0,0,w,h);if(game.hitFlash>0){ctx.fillStyle=`rgba(255,95,77,${game.hitFlash*.9})`;ctx.fillRect(0,0,w,h);}if(game.elapsed<game.shieldUntil){ctx.strokeStyle='#65eaffbb';ctx.lineWidth=9;ctx.strokeRect(8,8,w-16,h-16);}
}
function shadeColor(hex,f){let v=parseInt(hex.slice(1),16);return `rgb(${Math.min(255,Math.round(((v>>16)&255)*f))},${Math.min(255,Math.round(((v>>8)&255)*f))},${Math.min(255,Math.round((v&255)*f))})`;}
function drawWeapon(p,w,h){let sc=Math.max(.6,Math.min(w/960,h/540)),bob=Math.sin(game.animation)* (game.wasMoving?7:2),kick=game.muzzle?game.muzzle*90:0,x=w*.54,y=h*.77+bob+kick; p.save();p.translate(x,y);p.scale(sc,sc);p.lineJoin='round';p.lineWidth=5;p.strokeStyle='#163a67';p.shadowColor='#07316b9e';p.shadowBlur=16;
const shape=(pts,fill)=>{p.beginPath();p.moveTo(...pts[0]);pts.slice(1).forEach(q=>p.lineTo(...q));p.closePath();p.fillStyle=fill;p.fill();p.stroke()};
// Glove and shoulder
shape([[-20,140],[3,76],[83,86],[140,210],[44,230],[-38,190]],'#f3f6fb');shape([[36,157],[90,112],[163,148],[190,245],[85,246]],'#4163a6');
// Rifle stock, grip and central receiver
shape([[8,61],[132,26],[276,52],[326,83],[268,124],[95,116]],'#e4edf3');shape([[97,39],[233,34],[281,54],[248,109],[113,103]],'#327ac4');shape([[138,43],[182,37],[183,95],[138,99]],'#ffb43b');shape([[258,55],[362,70],[368,98],[269,112]],'#f3f6f7');shape([[290,65],[404,73],[410,94],[306,104]],'#ff9c29');shape([[130,120],[167,110],[188,184],[139,210]],'#2e4669');shape([[198,115],[248,116],[249,171],[194,170]],'#d9eff7');
// Sight tower
shape([[196,18],[195,-19],[259,-28],[273,12],[257,45],[211,44]],'#ffae34');shape([[207,-12],[248,-17],[251,28],[211,29]],'#1d4068');p.fillStyle='#37edff';p.fillRect(213,-8,33,31);p.strokeStyle='#d8ffff';p.lineWidth=2;p.beginPath();p.arc(230,7,9,0,TAU);p.stroke();
// Rifle markings
p.fillStyle='#fff';p.font='900 19px system-ui';p.textAlign='center';p.fillText(game.weapon?'PULSE SIDEARM':'SKYLINE RIFLE',190,77);p.strokeStyle='#124273';p.lineWidth=4;p.shadowBlur=0;p.restore();
if(game.muzzle){p.save();let fx=x+420*sc,fy=y+82*sc;p.translate(fx,fy);p.rotate(game.elapsed*2);p.fillStyle='#fffce0';p.strokeStyle='#ff9c2c';p.lineWidth=3;p.beginPath();for(let i=0;i<16;i++){let a=i*TAU/16,r=i%2===0?35*sc:12*sc;p.lineTo(Math.cos(a)*r,Math.sin(a)*r);}p.closePath();p.fill();p.stroke();p.restore();}}
function drawMini(){
 if(!game)return;const c=$('minimap'),p=c.getContext('2d'),w=game.grid[0].length,h=game.grid.length,
  scale=Math.min(c.width/w,c.height/h),ox=(c.width-w*scale)/2,oy=(c.height-h*scale)/2;
 if(!game.miniBase){
  const base=document.createElement('canvas');base.width=c.width;base.height=c.height;const b=base.getContext('2d');
  b.fillStyle='#12241b';b.fillRect(0,0,c.width,c.height);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(game.grid[y][x]){b.fillStyle=game.grid[y][x]===31?'#4b6250':'#718371';b.fillRect(ox+x*scale,oy+y*scale,scale,scale);}
  b.strokeStyle='#b9ad7580';b.lineWidth=1;b.beginPath();game.route.plan.walkLine.forEach((n,i)=>i?b.lineTo(ox+n.x*scale,oy+n.y*scale):b.moveTo(ox+n.x*scale,oy+n.y*scale));b.stroke();game.miniBase=base;
 }
 p.clearRect(0,0,c.width,c.height);p.drawImage(game.miniBase,0,0);
 const target=game.routeGuide||game.objective;
 if(target){p.fillStyle='#b4d68c';p.beginPath();p.arc(ox+target.x*scale,oy+target.y*scale,3,0,TAU);p.fill();}
 for(const e of game.enemies){if(e.state!=='active')continue;
  if(game.elapsed<game.droneUntil||(e.awakened!==false&&Math.hypot(e.x-game.px,e.y-game.py)<9&&visibility(game.px,game.py,e.x,e.y))){p.fillStyle='#e98b68';p.beginPath();p.arc(ox+e.x*scale,oy+e.y*scale,2.3,0,TAU);p.fill();}
 }
 p.save();p.translate(ox+game.px*scale,oy+game.py*scale);p.rotate(game.dir);p.fillStyle='#f4db93';p.beginPath();p.moveTo(6,0);p.lineTo(-4,-4);p.lineTo(-4,4);p.closePath();p.fill();p.restore();
}
function loop(now){let dt=Math.min(.06,(now-last)/1000);last=now;if(running&&!paused){simulate(dt);if(window.TV3D?.ready){window.TV3D.render(game);ctx.clearRect(0,0,CW,CH);if(!window.TV3D.ownsWeapon)drawWeapon(ctx,CW,CH);if(game.hitFlash>0){ctx.fillStyle=`rgba(255,95,77,${game.hitFlash*.35})`;ctx.fillRect(0,0,CW,CH);}}else{ctx.clearRect(0,0,CW,CH);ctx.fillStyle='#09264c';ctx.fillRect(0,0,CW,CH);ctx.fillStyle='#fff';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText('WEBGL 3D REQUIRED',CW/2,CH/2);}drawMini();}else if(!running){drawMenuCanvas(now/1000);}requestAnimationFrame(loop);}function drawMenuCanvas(t){let g=ctx.createLinearGradient(0,0,0,CH);g.addColorStop(0,'#78cdfd');g.addColorStop(.55,'#d4faff');g.addColorStop(1,'#5f92b8');ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);ctx.globalAlpha=.58;drawLandmark(ctx,'tower',CW,CH);ctx.globalAlpha=1;}
$('buildLabel').textContent=BUILD;
requestAnimationFrame(loop);
})();
