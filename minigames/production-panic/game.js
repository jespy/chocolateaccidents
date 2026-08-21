(() => {
'use strict';

const WORLD={width:2200,height:1400};
const PLAYER={speed:240,radius:18,installRange:360,manageRange:320};
const CONFIG = {
  startingPP:420,startingBatch:100,prepSeconds:7,
  shutdownDuration:3.4,shutdownCooldown:32,espressoDuration:7,espressoCooldown:28,
  sellRatio:0.60,pathWidth:70,towerFootprint:22,towerSpacing:52,
  objective:{x:1980,y:330,radius:70},
  path:[
    {x:-80,y:250},{x:300,y:250},{x:300,y:520},{x:680,y:520},{x:680,y:210},
    {x:1050,y:210},{x:1050,y:760},{x:1430,y:760},{x:1430,y:330},{x:1840,y:330},{x:1900,y:330}
  ],
  placementZones:[
    {x:40,y:315,w:220,h:325},
    {x:335,y:70,w:320,h:435},
    {x:335,y:555,w:325,h:670},
    {x:705,y:260,w:330,h:355},
    {x:705,y:795,w:335,h:500},
    {x:1080,y:250,w:330,h:445},
    {x:1080,y:805,w:350,h:500},
    {x:1465,y:390,w:340,h:760},
    {x:1465,y:70,w:355,h:245},
    {x:1765,y:390,w:335,h:720}
  ]
};

const TOWER_DEFS = {
  blower:{name:'Cocoa Bean Blower',cost:90,range:145,rate:.28,damage:8,projSpeed:520,color:'#7f5238',desc:'Compressed-air bean launcher. Fast, cheap, and alarmingly enthusiastic.',kind:'projectile',slow:0,aoe:0,
    levels:[{cost:70,label:'Twin Barrel',damage:11,rate:.22,visual:2},{cost:110,label:'Bean Hopper',damage:14,rate:.17,visual:3}],
    branches:[{id:'barrage',name:'ROASTED BEAN BARRAGE',cost:175,damage:18,rate:.095,visual:4,desc:'Extreme rate of fire.'},{id:'cannon',name:'COCOA CANNON',cost:175,damage:44,rate:.46,aoe:58,visual:5,desc:'Heavy explosive cocoa shots.'}]},
  ganache:{name:'Ganache Sprayer',cost:120,range:112,rate:.55,damage:13,projSpeed:360,color:'#5d2d22',desc:'Hot ganache splashes nearby defects and leaves them sticky.',kind:'projectile',slow:.28,slowTime:2.1,aoe:38,
    levels:[{cost:90,label:'Wide Nozzle',damage:17,range:125,aoe:48,visual:2},{cost:135,label:'Heated Reservoir',damage:22,slow:.38,slowTime:2.5,visual:3}],
    branches:[{id:'flood',name:'GANACHE FLOOD',cost:190,damage:25,aoe:78,rate:.65,visual:4,desc:'Huge sticky splash radius.'},{id:'sear',name:'SEARING GANACHE',cost:190,damage:44,slow:.18,rate:.48,visual:5,desc:'Much hotter, much harder hit.'}]},
  fan:{name:'Cooling Fan',cost:105,range:165,rate:.22,damage:0,projSpeed:0,color:'#7b9294',desc:'Industrial airflow slows defects inside its coverage.',kind:'aura',slow:.34,slowTime:.35,aoe:0,
    levels:[{cost:75,label:'Dual Fan',range:185,slow:.43,visual:2},{cost:120,label:'Chiller Duct',range:205,slow:.53,visual:3}],
    branches:[{id:'freeze',name:'FLASH CHILL',cost:175,slow:.68,range:215,visual:4,desc:'Aggressive industrial cooling.'},{id:'boost',name:'COLD AIR RETURN',cost:175,slow:.5,range:220,buffRate:.18,visual:5,desc:'Also boosts nearby equipment speed.'}]},
  cannon:{name:'Tempering Cannon',cost:160,range:205,rate:1.15,damage:54,projSpeed:380,color:'#6d4030',desc:'Slow artillery made from a tempering line nobody was using correctly anyway.',kind:'projectile',slow:0,aoe:24,
    levels:[{cost:120,label:'Pressure Feed',damage:72,rate:1.02,visual:2},{cost:165,label:'Jacketed Barrel',damage:94,range:225,visual:3}],
    branches:[{id:'mortar',name:'TEMPER MORTAR',cost:225,damage:130,aoe:72,rate:1.25,visual:4,desc:'Large area impact.'},{id:'precision',name:'SNAP-TEMPER DRIVER',cost:225,damage:170,aoe:18,rate:1.5,range:275,visual:5,desc:'Extreme single-target damage.'}]},
  stapler:{name:'Packaging Stapler',cost:110,range:130,rate:.20,damage:10,projSpeed:650,color:'#a24c3c',desc:'An oversized case stapler reassigned from Packaging without paperwork.',kind:'projectile',slow:0,aoe:0,smallBonus:1.65,
    levels:[{cost:80,label:'Pneumatic Feed',damage:14,rate:.16,visual:2},{cost:120,label:'Double Magazine',damage:17,rate:.12,visual:3}],
    branches:[{id:'rapid',name:'CASE CLOSER 9000',cost:175,damage:20,rate:.075,visual:4,desc:'Extremely fast mechanical fire.'},{id:'crimp',name:'PALLET CRIMPER',cost:175,damage:36,rate:.24,range:155,smallBonus:2.1,visual:5,desc:'Heavy hits, brutal against small defects.'}]}
};

const ENEMY_DEFS = {
 truffle:{name:'Runaway Truffle',hp:58,speed:92,reward:12,damage:7,radius:15,color:'#5b2f24',small:true},
 sugar:{name:'Sugar Rush',hp:30,speed:148,reward:9,damage:5,radius:10,color:'#eee0b6',small:true},
 clump:{name:'Cocoa Clump',hp:170,speed:52,reward:20,damage:11,radius:20,color:'#704231'},
 meltling:{name:'Meltling',hp:105,speed:70,reward:16,damage:8,radius:17,color:'#4d271f',trail:true},
 burnt:{name:'Burnt Batch',hp:270,speed:45,reward:30,damage:14,radius:22,color:'#2d2421',armor:.22},
 boss:{name:'THE MEGA CLUMP',hp:1800,speed:28,reward:280,damage:34,radius:42,color:'#4b2d24',boss:true,armor:.12}
};

const WAVES = [
 {title:'Minor Production Irregularity',groups:[['truffle',8,.65]],announce:'Production reports that everything is under control.'},
 {title:'Truffle Containment Failure',groups:[['truffle',10,.48],['sugar',8,.32]],announce:'A containment lid has been located. It was not attached.'},
 {title:'Cocoa Pressure Increasing',groups:[['clump',6,.85],['truffle',8,.44]],announce:'Maintenance has been notified.'},
 {title:'Unauthorized Sugar Activity',groups:[['sugar',18,.20],['meltling',5,.72]],announce:'Please stop describing the sugar as “motivated.”'},
 {title:'Maintenance Requested',groups:[['clump',8,.62],['meltling',7,.56],['truffle',10,.30]],announce:'Maintenance has been notified again.'},
 {title:'MAINTENANCE DID NOT ARRIVE',groups:[['burnt',4,1.0],['sugar',18,.19],['clump',6,.65]],announce:'Production has revised its previous statement.'},
 {title:'Temper Failure Detected',groups:[['meltling',12,.38],['burnt',5,.8],['truffle',10,.27]],announce:'Quality Control would like everyone to remain calm.'},
 {title:'Unauthorized Truffles in Production',groups:[['truffle',22,.22],['clump',8,.5],['sugar',14,.18]],announce:'Quality Control has left the building.'},
 {title:'Batch Stability Questionable',groups:[['burnt',8,.62],['meltling',10,.38],['clump',10,.44]],announce:'The Big Boss is asking why production has stopped.'},
 {title:'CATASTROPHIC BLOCKAGE',groups:[['boss',1,0],['clump',10,.55],['sugar',15,.2]],announce:'Nobody volunteered to explain it.'}
];

const $ = s => document.querySelector(s);
const canvas=$('#game');const ctx=canvas.getContext('2d');const camera={x:0,y:0};const player={x:260,y:360,dir:'down',moving:false};const keys=new Set();
const loadSprite=src=>{const img=new Image();img.src=src;return img;};
const chrisSprites={
  idle:loadSprite('assets/chris_idle.png'),
  down:['assets/chris_walk1.png','assets/chris_walk2.png'].map(loadSprite),
  up:['assets/chris_away1.png','assets/chris_away2.png'].map(loadSprite),
  left:['assets/chris_left1.png','assets/chris_left2.png','assets/chris_left3.png','assets/chris_left4.png'].map(loadSprite),
  right:['assets/chris_right1.png','assets/chris_right2.png','assets/chris_right3.png','assets/chris_right4.png'].map(loadSprite)
};
const floorTileSize=128;
const floorTiles=['assets/tiles1.png','assets/tiles2.png','assets/tiles3.png','assets/tiles4.png','assets/tiles5.png'].map(loadSprite);
let floorPattern=null,staticFloorCanvas=null,staticFloorKey='';

let ceilingLights=[];
let lightGlowStandard=null;
let vignetteCanvas=null;
let vignetteKey='';
const LIGHT_BRIGHTNESS=0.92;


let equipmentCollapsed=false;
let dpr=1, W=1280,H=720;
const state = {screen:'menu',batch:100,pp:CONFIG.startingPP,wave:-1,waveActive:false,paused:false,selectedType:null,selectedTower:null,towers:[],enemies:[],projectiles:[],particles:[],spawnQueue:[],spawnTimer:0,spawnStreams:[],wavesInProgress:0,time:0,prepTimer:0,shutdown:0,shutdownCd:0,espresso:0,espressoCd:0,announcementTimer:0,music:true,sfx:true,hoverPos:null};

function resetGame(){player.x=260;player.y=360;player.dir='down';player.moving=false;camera.x=0;camera.y=0;resetCeilingLights();
const floorCols=Math.ceil(WORLD.width/floorTileSize),floorRows=Math.ceil(WORLD.height/floorTileSize);
floorPattern=Array.from({length:floorCols*floorRows},()=>Math.floor(Math.random()*floorTiles.length));
staticFloorCanvas=null;staticFloorKey='';Object.assign(state,{batch:100,pp:CONFIG.startingPP,wave:-1,waveActive:false,paused:false,selectedType:null,selectedTower:null,towers:[],enemies:[],projectiles:[],particles:[],spawnQueue:[],spawnTimer:0,spawnStreams:[],wavesInProgress:0,time:0,prepTimer:0,shutdown:0,shutdownCd:0,espresso:0,espressoCd:0,announcementTimer:0,hoverPos:null});updateHud();buildTowerButtons();hideInspect();}

function startGame(){resetGame();$('#menu').classList.add('hidden');$('#how').classList.add('hidden');$('#hud').classList.remove('hidden');$('#gameWrap').classList.remove('hidden');state.screen='game';state.prepTimer=CONFIG.prepSeconds;showAnnouncement(`SHIFT STARTED — INCIDENT 1 BEGINS IN ${CONFIG.prepSeconds} SECONDS.`,3.2);resize();}
function showMenu(){state.screen='menu';$('#menu').classList.remove('hidden');$('#hud').classList.add('hidden');$('#gameWrap').classList.add('hidden');$('#pauseScreen').classList.add('hidden');$('#endScreen').classList.add('hidden');}


function buildTowerButtons(){const root=$('#towerButtons');root.innerHTML='';Object.entries(TOWER_DEFS).forEach(([id,t])=>{const b=document.createElement('button');b.className='tower-btn';b.dataset.id=id;const icon={blower:'🫘',ganache:'♨',fan:'✣',cannon:'●',stapler:'▰'}[id];b.innerHTML=`<span class="tower-icon" aria-hidden="true">${icon}</span><span class="price">${t.cost}</span><b>${t.name}</b><small>${towerRole(id)}</small>`;b.dataset.tooltip=`${t.name} — ${towerRole(id)} — ${t.cost} Points`;b.onclick=()=>selectBuild(id);root.appendChild(b);});}
function towerRole(id){return {blower:'FAST / LIGHT',ganache:'SPLASH / SLOW',fan:'SUPPORT / SLOW',cannon:'HEAVY / LONG',stapler:'FAST / SMALL'}[id];}
function selectBuild(id){const def=TOWER_DEFS[id];if(state.pp<def.cost){toast('INSUFFICIENT PRODUCTION POINTS. ACCOUNTING IS UNSYMPATHETIC.');return;}state.selectedTower=null;hideInspect();state.selectedType=state.selectedType===id?null:id;document.querySelectorAll('.tower-btn').forEach(b=>b.classList.toggle('selected',b.dataset.id===state.selectedType));toast(state.selectedType?`SELECTED: ${def.name}. CLICK AN OPEN FACTORY-FLOOR AREA TO INSTALL.`:'PLACEMENT CANCELLED');}

function startWaveEarly(){
  if(state.screen!=='game'||state.paused||state.wave>=WAVES.length-1)return;
  state.prepTimer=0;
  startNextWave();
}
function startNextWave(){
  if(state.wave>=WAVES.length-1)return;
  state.wave++;
  state.waveActive=true;
  state.wavesInProgress=(state.wavesInProgress||0)+1;
  const w=WAVES[state.wave];
  const queue=[];
  w.groups.forEach(g=>{for(let i=0;i<g[1];i++)queue.push({type:g[0],delay:g[2]});});
  state.spawnStreams.push({wave:state.wave,queue,timer:.5,finished:false});
  showAnnouncement(`INCIDENT ${state.wave+1}/10 — ${w.title}`,2.8);
  setTimeout(()=>{if(state.screen==='game'&&!state.paused)showAnnouncement(w.announce,2.8)},1300);
  updateHud();
}

function spawnEnemy(type){const d=ENEMY_DEFS[type];state.enemies.push({type,x:CONFIG.path[0].x,y:CONFIG.path[0].y,pathIndex:1,hp:d.hp,maxHp:d.hp,speed:d.speed,slow:0,slowTimer:0,dead:false,angle:0,shed: type==='boss'?3.8:0,trailTimer:0,attackingTank:false,tankAttackTimer:0,tankHitFlash:0});}

function pointInRect(x,y,r){return x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;}
function distToSegment(px,py,a,b){const vx=b.x-a.x,vy=b.y-a.y,wx=px-a.x,wy=py-a.y,len2=vx*vx+vy*vy;if(!len2)return Math.hypot(px-a.x,py-a.y);let t=(wx*vx+wy*vy)/len2;t=Math.max(0,Math.min(1,t));const cx=a.x+t*vx,cy=a.y+t*vy;return Math.hypot(px-cx,py-cy);}
function isValidPlacement(x,y,radius=CONFIG.towerFootprint){if(!state.selectedType)return false;const def=TOWER_DEFS[state.selectedType];if(state.pp<def.cost)return false;if(!CONFIG.placementZones.some(z=>pointInRect(x,y,z)))return false;const clearance=CONFIG.pathWidth/2+15;for(let i=0;i<CONFIG.path.length-1;i++)if(distToSegment(x,y,CONFIG.path[i],CONFIG.path[i+1])<clearance)return false;if(state.towers.some(t=>Math.hypot(x-t.x,y-t.y)<CONFIG.towerSpacing))return false;const o=CONFIG.objective;if(Math.hypot(x-o.x,y-o.y)<o.radius+radius+4)return false;return true;}
function tryPlaceTower(x,y){if(!state.selectedType)return false;const def=TOWER_DEFS[state.selectedType];if(!isValidPlacement(x,y)){toast(state.pp<def.cost?'INSUFFICIENT PRODUCTION POINTS.':'INSTALLATION NOT APPROVED AT THIS LOCATION.');return false;}state.pp-=def.cost;const t={type:state.selectedType,x,y,level:1,totalCost:def.cost,cooldown:Math.random()*.2,branch:null,disabled:0,aimAngle:0,recoil:0,fanAngle:0,active:false};state.towers.push(t);state.selectedType=null;state.selectedTower=null;document.querySelectorAll('.tower-btn').forEach(b=>b.classList.remove('selected'));hideInspect();updateHud();burst(x,y,'#e3b43d',10);return true;}

function towerStats(t){const base={...TOWER_DEFS[t.type]};let s={range:base.range,rate:base.rate,damage:base.damage,aoe:base.aoe||0,slow:base.slow||0,slowTime:base.slowTime||0,smallBonus:base.smallBonus||1,buffRate:base.buffRate||0,visual:1};for(let i=0;i<t.level-1&&i<base.levels.length;i++)Object.assign(s,base.levels[i]);if(t.branch){const b=base.branches.find(x=>x.id===t.branch);if(b)Object.assign(s,b);}return s;}
function selectTower(t){state.selectedTower=t;state.selectedType=null;document.querySelectorAll('.tower-btn').forEach(b=>b.classList.remove('selected'));const d=TOWER_DEFS[t.type],s=towerStats(t);$('#inspectPanel').classList.remove('hidden');$('#inspectName').textContent=d.name;$('#inspectLevel').textContent=t.branch?`FINAL: ${d.branches.find(b=>b.id===t.branch).name}`:`LEVEL ${t.level}`;$('#inspectDesc').textContent=t.branch?d.branches.find(b=>b.id===t.branch).desc:d.desc;$('#inspectStats').innerHTML=`<div class="stat-pill"><b>RANGE</b><br>${Math.round(s.range)}</div><div class="stat-pill"><b>${d.kind==='aura'?'SLOW':'DAMAGE'}</b><br>${d.kind==='aura'?Math.round(s.slow*100)+'%':Math.round(s.damage)}</div><div class="stat-pill"><b>RATE</b><br>${d.kind==='aura'?'Continuous':(1/s.rate).toFixed(1)+'/sec'}</div><div class="stat-pill"><b>SPENT</b><br>${t.totalCost} PP</div>`;
 const up=$('#upgradeBtn'),a=$('#branchABtn'),b=$('#branchBBtn');a.classList.add('hidden');b.classList.add('hidden');
 if(t.branch){up.classList.add('hidden');} else if(t.level<=d.levels.length){up.classList.remove('hidden');const nxt=d.levels[t.level-1];up.textContent=`UPGRADE — ${nxt.label} (${nxt.cost} PP)`;} else {up.classList.add('hidden');a.classList.remove('hidden');b.classList.remove('hidden');a.textContent=`${d.branches[0].name} — ${d.branches[0].cost} PP`;b.textContent=`${d.branches[1].name} — ${d.branches[1].cost} PP`;}
 $('#sellBtn').textContent=`REMOVE EQUIPMENT — +${Math.floor(t.totalCost*CONFIG.sellRatio)} PP`;
}
function hideInspect(){state.selectedTower=null;$('#inspectPanel').classList.add('hidden');}
function upgradeSelected(){const t=state.selectedTower;if(!t)return;const d=TOWER_DEFS[t.type];if(t.level>d.levels.length)return;const u=d.levels[t.level-1];if(state.pp<u.cost)return toast('UPGRADE DENIED: PRODUCTION POINT BALANCE TOO LOW.');state.pp-=u.cost;t.totalCost+=u.cost;t.level++;selectTower(t);updateHud();burst(t.x,t.y,'#e3b43d',12);}
function chooseBranch(i){const t=state.selectedTower;if(!t)return;const d=TOWER_DEFS[t.type],b=d.branches[i];if(state.pp<b.cost)return toast('FINAL MODIFICATION REQUIRES MORE PP.');state.pp-=b.cost;t.totalCost+=b.cost;t.branch=b.id;selectTower(t);updateHud();burst(t.x,t.y,'#e3b43d',20);}
function sellSelected(){const t=state.selectedTower;if(!t)return;state.pp+=Math.floor(t.totalCost*CONFIG.sellRatio);state.towers=state.towers.filter(x=>x!==t);hideInspect();updateHud();toast('EQUIPMENT REMOVED. PAPERWORK WILL BE FILED RETROACTIVELY.');}



function rnd(a,b){return a+Math.random()*(b-a);}
function clampValue(v,a,b){return Math.max(a,Math.min(b,v));}
function makeLightGlow(){
  const size=510,cv=document.createElement('canvas');
  cv.width=cv.height=size;
  const x=cv.getContext('2d'),r=size/2,g=x.createRadialGradient(r,r,18,r,r,r);
  g.addColorStop(0,'rgba(214,229,236,.27)');
  g.addColorStop(.22,'rgba(184,211,224,.18)');
  g.addColorStop(.64,'rgba(132,175,198,.07)');
  g.addColorStop(1,'rgba(112,158,184,0)');
  x.fillStyle=g;x.fillRect(0,0,size,size);
  return cv;
}
function ensureLightCache(){if(!lightGlowStandard)lightGlowStandard=makeLightGlow();}
function ensureVignette(){
  const key=W+'x'+H;
  if(vignetteCanvas&&vignetteKey===key)return;
  const cv=document.createElement('canvas');
  cv.width=Math.max(1,Math.floor(W));cv.height=Math.max(1,Math.floor(H));
  const x=cv.getContext('2d'),g=x.createRadialGradient(W/2,H/2,90,W/2,H/2,Math.max(W,H)*.68);
  g.addColorStop(0,'rgba(0,0,0,0)');
  g.addColorStop(.42,'rgba(1,4,9,.24)');
  g.addColorStop(1,'rgba(0,2,7,.90)');
  x.fillStyle=g;x.fillRect(0,0,W,H);
  vignetteCanvas=cv;vignetteKey=key;
}
function resetCeilingLights(){
  ceilingLights=Array.from({length:16},()=>({
    type:'normal',base:rnd(.72,1.04),phase:rnd(0,Math.PI*2),speed:rnd(.35,.8),
    next:0,flicker:0,flickerLevel:1,glitchTime:0,toggle:0,on:true
  }));
  const order=Array.from({length:16},(_,i)=>i).sort(()=>Math.random()-.5);
  const flickerRanges=[[2.2,4.1],[3.8,6.7],[6.2,10.5]];
  order.slice(0,3).forEach((index,i)=>Object.assign(ceilingLights[index],{
    type:'flicker',interval:flickerRanges[i],next:rnd(...flickerRanges[i])
  }));
  Object.assign(ceilingLights[order[3]],{type:'glitch',next:rnd(4.5,8.5)});
}
function updateCeilingLights(dt){
  for(const light of ceilingLights){
    light.flicker=Math.max(0,light.flicker-dt);
    if(light.type==='flicker'){
      light.next-=dt;
      if(light.next<=0){
        light.flicker=rnd(.07,.18);
        light.flickerLevel=rnd(.35,.68);
        light.next=rnd(...light.interval);
      }
    }else if(light.type==='glitch'){
      if(light.glitchTime>0){
        light.glitchTime-=dt;light.toggle-=dt;
        if(light.toggle<=0){light.on=!light.on;light.toggle=rnd(.055,.16);}
        if(light.glitchTime<=0){light.on=true;light.next=rnd(5.5,10);}
      }else{
        light.next-=dt;
        if(light.next<=0){light.glitchTime=rnd(.25,.55);light.toggle=.01;light.on=false;}
      }
    }
  }
}
function drawNightShiftLighting(){
  // Match Night Shift: dark screen-space ambient layer.
  const ambientAlpha=.54;
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle=`rgba(1,4,10,${ambientAlpha})`;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();

  // Draw 4x4 soft overhead lights in screen space at evenly spaced world positions.
  ensureLightCache();
  ctx.save();
  ctx.globalCompositeOperation='screen';
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
    const light=ceilingLights[row*4+col];
    const worldX=(col+.5)*WORLD.width/4;
    const worldY=(row+.5)*WORLD.height/4;
    const lightX=worldX-camera.x;
    const lightY=worldY-camera.y;
    const radius=255;
    if(lightX>-radius&&lightX<W+radius&&lightY>-radius&&lightY<H+radius){
      let strength=light.base*(.9+Math.sin(state.time*light.speed+light.phase)*.1)*LIGHT_BRIGHTNESS;
      if(light.flicker>0)strength*=light.flickerLevel;
      if(light.type==='glitch'&&light.glitchTime>0)strength*=(light.on?.72:.06);
      ctx.globalAlpha=strength;
      ctx.drawImage(lightGlowStandard,lightX-radius,lightY-radius,radius*2,radius*2);
    }
  }
  ctx.restore();

  ensureVignette();
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.drawImage(vignetteCanvas,0,0,canvas.width,canvas.height);
  ctx.restore();
}
function updatePlayer(dt){
 let dx=(keys.has('ArrowRight')||keys.has('KeyD')?1:0)-(keys.has('ArrowLeft')||keys.has('KeyA')?1:0);
 let dy=(keys.has('ArrowDown')||keys.has('KeyS')?1:0)-(keys.has('ArrowUp')||keys.has('KeyW')?1:0);
 const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;player.moving=!!(dx||dy);
 if(player.moving){player.x=Math.max(28,Math.min(WORLD.width-28,player.x+dx*PLAYER.speed*dt));player.y=Math.max(85,Math.min(WORLD.height-28,player.y+dy*PLAYER.speed*dt));if(Math.abs(dx)>Math.abs(dy))player.dir=dx>0?'right':'left';else player.dir=dy>0?'down':'up';}
 const sx=player.x-camera.x,sy=player.y-camera.y,ix=W*.30,iy=H*.28,iw=W*.40,ih=H*.44;
 if(sx<ix)camera.x=player.x-ix;else if(sx>ix+iw)camera.x=player.x-(ix+iw);
 if(sy<iy)camera.y=player.y-iy;else if(sy>iy+ih)camera.y=player.y-(iy+ih);
 camera.x=Math.max(0,Math.min(Math.max(0,WORLD.width-W),camera.x));camera.y=Math.max(0,Math.min(Math.max(0,WORLD.height-H),camera.y));
}
function inPlayerRange(x,y,r=PLAYER.installRange){return Math.hypot(x-player.x,y-player.y)<=r;}
function drawPlayer(){
  ctx.save();
  ctx.translate(player.x,player.y);

  // soft floor shadow
  ctx.save();
  ctx.globalAlpha=.38;
  ctx.fillStyle='#00030a';
  ctx.shadowColor='#000';
  ctx.shadowBlur=10;
  ctx.beginPath();
  ctx.ellipse(0,26,20,7,0,0,Math.PI*2);
  ctx.fill();
  ctx.restore();

  const frames=chrisSprites[player.dir];
  let sprite;
  if(!player.moving){
    sprite=chrisSprites.idle;
  }else if(frames&&frames.length){
    const fps=(player.dir==='left'||player.dir==='right')?8:6;
    sprite=frames[Math.floor(state.time*fps)%frames.length];
  }else{
    sprite=chrisSprites.idle;
  }

  // Match Night Shift's gameplay proportions.
  const forwardScale=player.dir==='down'?.9:1;
  const width=51*forwardScale;
  const height=73.1*forwardScale;

  if(sprite&&sprite.complete&&sprite.naturalWidth){
    ctx.drawImage(sprite,-width/2,-height/2,width,height);
  }else{
    ctx.fillStyle='#315c75';
    ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
function update(dt){if(state.screen!=='game'||state.paused)return;state.time+=dt;state.tankHit=Math.max(0,(state.tankHit||0)-dt);state.tankShake=Math.max(0,(state.tankShake||0)-dt*14);updatePlayer(dt);updateCeilingLights(dt);state.shutdown=Math.max(0,state.shutdown-dt);state.shutdownCd=Math.max(0,state.shutdownCd-dt);state.espresso=Math.max(0,state.espresso-dt);state.espressoCd=Math.max(0,state.espressoCd-dt);state.announcementTimer=Math.max(0,state.announcementTimer-dt);if(state.announcementTimer<=0)$('#announcement').classList.add('hidden');
 if(!state.waveActive&&state.wave<WAVES.length-1&&state.prepTimer>0){state.prepTimer=Math.max(0,state.prepTimer-dt);if(state.prepTimer<=0)startNextWave();}
 if(state.spawnStreams.length){
   state.spawnStreams.forEach(stream=>{
     if(stream.finished)return;
     if(stream.queue.length){
       stream.timer-=dt;
       if(stream.timer<=0){
         const q=stream.queue.shift();
         spawnEnemy(q.type);
         stream.timer=q.delay;
       }
     }else stream.finished=true;
   });
   state.spawnStreams=state.spawnStreams.filter(s=>!s.finished);
 }
 const frozen=state.shutdown>0;
 state.enemies.forEach(e=>{if(e.dead)return;const d=ENEMY_DEFS[e.type];if(e.slowTimer>0)e.slowTimer-=dt;else e.slow=0;if(!frozen){
   if(e.attackingTank){
     // A defect gets one visible hit on the tank, deals its normal leak damage, then disappears.
     e.tankAttackTimer-=dt;
     if(e.tankAttackTimer<=0){
       state.batch=Math.max(0,state.batch-d.damage);
       state.tankHit=.18;
       state.tankShake=Math.min(7,(state.tankShake||0)+2.5);
       burst(CONFIG.objective.x-54,e.y,'#d06b45',10);
       e.dead=true;
       if(state.batch<=0)return endGame(false);
     }
   }else{
     let mult=1-e.slow;
     const target=CONFIG.path[e.pathIndex];
     const dx=target.x-e.x,dy=target.y-e.y,dist=Math.hypot(dx,dy);
     const step=e.speed*mult*dt;
     if(dist<=step){
       e.x=target.x;e.y=target.y;e.pathIndex++;
       if(e.pathIndex>=CONFIG.path.length){
         e.attackingTank=true;
         e.tankAttackTimer=.2+Math.random()*.25;
         // Cluster attackers around the tank face instead of stacking perfectly.
         e.x=CONFIG.objective.x-CONFIG.objective.radius-10;
         e.y=CONFIG.objective.y+((Math.random()-.5)*88);
         e.angle=0;
       }
     }else{
       e.x+=dx/dist*step;e.y+=dy/dist*step;e.angle=Math.atan2(dy,dx);
     }
   }
 }
  if(d.trail){e.trailTimer-=dt;if(e.trailTimer<=0){e.trailTimer=.18;state.particles.push({x:e.x,y:e.y,vx:0,vy:0,life:1.8,max:1.8,size:8,color:'#4b281f',puddle:true});}}
  if(d.boss){e.shed-=dt;if(e.shed<=0){e.shed=4.2;if(e.pathIndex<CONFIG.path.length-1){for(let i=0;i<2;i++){spawnEnemy('clump');const n=state.enemies[state.enemies.length-1];n.x=e.x+(i?16:-16);n.y=e.y+20;n.pathIndex=e.pathIndex;}}}}
 });
 state.enemies=state.enemies.filter(e=>!e.dead);
 // fan aura and cold-air-return buffs
 state.towers.forEach(t=>{const d=TOWER_DEFS[t.type],s=towerStats(t);if(d.kind==='aura'){t.active=false;state.enemies.forEach(e=>{if(Math.hypot(e.x-t.x,e.y-t.y)<=s.range){e.slow=Math.max(e.slow,s.slow);e.slowTimer=.4;t.active=true;}});if(t.active)t.fanAngle=(t.fanAngle||0)+dt*8.5;}});
 state.towers.forEach(t=>{if(t.disabled>0){t.disabled-=dt;return;}const d=TOWER_DEFS[t.type],s=towerStats(t);t.recoil=Math.max(0,(t.recoil||0)-dt*7);if(d.kind==='aura')return;let rate=s.rate;if(state.espresso>0)rate*=.56;let buff=0;state.towers.forEach(f=>{if(f===t||f.type!=='fan')return;const fs=towerStats(f);if(fs.buffRate&&Math.hypot(f.x-t.x,f.y-t.y)<=fs.range)buff=Math.max(buff,fs.buffRate);});rate*=1-buff;const targets=state.enemies.filter(e=>Math.hypot(e.x-t.x,e.y-t.y)<=s.range).sort((a,b)=>progress(b)-progress(a));if(targets.length){const targetAngle=Math.atan2(targets[0].y-t.y,targets[0].x-t.x);let diff=((targetAngle-(t.aimAngle||0)+Math.PI*3)%(Math.PI*2))-Math.PI;t.aimAngle=(t.aimAngle||0)+diff*Math.min(1,dt*9);}t.cooldown-=dt;if(t.cooldown<=0&&targets.length){shoot(t,targets[0],s);t.cooldown=rate;t.recoil=1;}});
 state.projectiles.forEach(p=>{if(p.dead)return;if(!state.enemies.includes(p.target)||p.target.dead){p.dead=true;return;}const dx=p.target.x-p.x,dy=p.target.y-p.y,dist=Math.hypot(dx,dy),step=p.speed*dt;if(dist<=step+5){impact(p);}else{p.x+=dx/dist*step;p.y+=dy/dist*step;}});state.projectiles=state.projectiles.filter(p=>!p.dead);
 state.particles.forEach(p=>{p.life-=dt;p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;p.vy=(p.vy||0)+20*dt;});state.particles=state.particles.filter(p=>p.life>0);
 if(state.waveActive&&!state.spawnStreams.length&&!state.enemies.length){
   state.waveActive=false;
   const bonus=55+state.wave*9;
   state.pp+=bonus;
   if(state.wave===WAVES.length-1){
     updateHud();endGame(true);
   }else{
     state.prepTimer=CONFIG.prepSeconds;
     updateHud();
     showAnnouncement(`PRODUCTION FLOOR CLEAR — +${bonus} POINTS. NEXT INCIDENT AUTO-STARTS IN ${CONFIG.prepSeconds}s`,4.2);
   }
 }
 updateHud();
}
function progress(e){if(e.attackingTank)return CONFIG.path.length*1000+100;return e.pathIndex*1000-Math.hypot((CONFIG.path[e.pathIndex]?.x||e.x)-e.x,(CONFIG.path[e.pathIndex]?.y||e.y)-e.y);}
function shoot(t,target,s){const d=TOWER_DEFS[t.type],a=t.aimAngle||0,muzzle=t.type==='cannon'?42:t.type==='stapler'?31:t.type==='ganache'?34:36;const mx=t.x+Math.cos(a)*muzzle,my=t.y+Math.sin(a)*muzzle;state.projectiles.push({x:mx,y:my,target,damage:s.damage,speed:d.projSpeed||450,color:d.color,aoe:s.aoe||0,slow:s.slow||0,slowTime:s.slowTime||0,smallBonus:s.smallBonus||1,type:t.type,dead:false});burst(mx,my,d.color,3);}
function impact(p){p.dead=true;const victims=p.aoe>0?state.enemies.filter(e=>Math.hypot(e.x-p.target.x,e.y-p.target.y)<=p.aoe):[p.target];victims.forEach(e=>damageEnemy(e,p.damage*(ENEMY_DEFS[e.type].small?p.smallBonus:1),p));burst(p.target.x,p.target.y,p.color,7);}
function damageEnemy(e,amt,p){const d=ENEMY_DEFS[e.type];amt*=1-(d.armor||0);e.hp-=amt;if(p.slow){e.slow=Math.max(e.slow,p.slow);e.slowTimer=Math.max(e.slowTimer,p.slowTime);}if(e.hp<=0&&!e.dead){e.dead=true;state.pp+=d.reward;burst(e.x,e.y,d.color,d.boss?34:12);if(e.type==='boss'){for(let i=0;i<5;i++){spawnEnemy('clump');const n=state.enemies[state.enemies.length-1];n.x=e.x+(Math.random()-.5)*70;n.y=e.y+(Math.random()-.5)*70;n.pathIndex=Math.min(e.pathIndex,CONFIG.path.length-1);}}}}
function burst(x,y,color,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=25+Math.random()*90;state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+Math.random()*.45,max:.8,size:2+Math.random()*5,color});}}

function draw(){
 if(state.screen!=='game')return;
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.save();
 ctx.translate(-camera.x,-camera.y);
 drawFactory();drawPath();drawParticles(true);
 state.towers.forEach(drawTower);
 state.enemies.forEach(drawEnemy);
 state.projectiles.forEach(drawProjectile);
 drawParticles(false);drawTank();drawPlayer();
 ctx.restore();

 drawNightShiftLighting();

 // Placement and selection overlays remain bright and readable above lighting.
 ctx.save();
 ctx.translate(-camera.x,-camera.y);
 if(state.selectedType){drawPlacementHints();if(state.hoverPos)drawPlacementGhost();}
 if(state.selectedTower){
   const st=towerStats(state.selectedTower);
   ctx.save();ctx.strokeStyle='#f5d66d';ctx.lineWidth=2;ctx.setLineDash([8,8]);
   ctx.beginPath();ctx.arc(state.selectedTower.x,state.selectedTower.y,st.range,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
 ctx.restore();
}
function drawNightShiftAtmosphere(){}

function ensureStaticFloor(){
  if(!floorPattern)return false;
  const key=floorPattern.length+':'+floorPattern.slice(0,18).join(',');
  if(staticFloorCanvas&&staticFloorKey===key)return true;
  if(!floorTiles.every(t=>t.complete&&t.naturalWidth))return false;
  const cv=document.createElement('canvas');
  cv.width=WORLD.width;cv.height=WORLD.height;
  const x=cv.getContext('2d',{alpha:false});
  x.fillStyle='#45515e';x.fillRect(0,0,WORLD.width,WORLD.height);
  const cols=Math.ceil(WORLD.width/floorTileSize),rows=Math.ceil(WORLD.height/floorTileSize);
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const tile=floorTiles[floorPattern[row*cols+col]];
    x.drawImage(tile,col*floorTileSize,row*floorTileSize,floorTileSize+1,floorTileSize+1);
  }
  staticFloorCanvas=cv;staticFloorKey=key;
  return true;
}
function drawFactory(){if(ensureStaticFloor())ctx.drawImage(staticFloorCanvas,0,0);else{ctx.fillStyle='#45515e';ctx.fillRect(0,0,WORLD.width,WORLD.height);}ctx.fillStyle='#717d7e';ctx.fillRect(0,0,WORLD.width,62);ctx.fillStyle='#30393a';ctx.fillRect(0,60,WORLD.width,6);ctx.strokeStyle='#70472f';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(40,30);ctx.lineTo(360,30);ctx.lineTo(360,78);ctx.stroke();ctx.strokeStyle='#bd7447';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='rgba(151,45,43,.25)';ctx.fillRect(0,300,WORLD.width,18);ctx.fillRect(410,62,18,238);ctx.fillStyle='rgba(230,102,82,.22)';for(let x=0;x<W;x+=54){ctx.save();ctx.translate(x,300);ctx.rotate(-.55);ctx.fillRect(0,0,13,23);ctx.restore();}drawPallet(95,1040);drawPallet(1880,1120);drawRack(35,670);drawRack(2020,120);drawTable(820,1160);drawTable(1280,90);drawPallet(1540,1180);drawRack(1780,760);ctx.fillStyle='#c69a35';ctx.fillRect(0,WORLD.height-18,WORLD.width,18);ctx.fillStyle='#272c2c';for(let x=-20;x<WORLD.width;x+=48){ctx.save();ctx.translate(x,WORLD.height-18);ctx.rotate(-.55);ctx.fillRect(0,0,16,30);ctx.restore();}}
function drawPath(){
  ctx.save();
  ctx.lineCap='butt';
  ctx.lineJoin='miter';

  const beltW=CONFIG.pathWidth;
  const half=beltW/2;
  const plateLen=30;
  const gap=3;
  const motion=((plateLen+gap)-(state.time*38)%(plateLen+gap))%(plateLen+gap);

  ctx.strokeStyle='#2e3435';
  ctx.lineWidth=beltW+14;
  ctx.beginPath();
  CONFIG.path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.stroke();

  ctx.strokeStyle='#7f8a88';
  ctx.lineWidth=beltW+6;
  ctx.beginPath();
  CONFIG.path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.stroke();

  ctx.strokeStyle='#252a2b';
  ctx.lineWidth=beltW-6;
  ctx.beginPath();
  CONFIG.path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.stroke();

  let plateIndex=0;
  for(let i=0;i<CONFIG.path.length-1;i++){
    const a=CONFIG.path[i],b=CONFIG.path[i+1];
    const dx=b.x-a.x,dy=b.y-a.y;
    const len=Math.hypot(dx,dy);
    if(len<1)continue;
    const ux=dx/len,uy=dy/len;
    const angle=Math.atan2(dy,dx);

    for(let d=-motion;d<len;d+=plateLen+gap){
      const start=Math.max(0,d);
      const end=Math.min(len,d+plateLen);
      const segLen=end-start;
      if(segLen<=2)continue;

      const cx=a.x+ux*((start+end)/2);
      const cy=a.y+uy*((start+end)/2);

      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(angle);
      ctx.fillStyle=plateIndex%2===0?'#3a4142':'#343a3b';
      ctx.strokeStyle='#171c1d';
      ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.roundRect(-segLen/2,-(beltW-14)/2,segLen,beltW-14,2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle='rgba(145,156,154,.16)';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(-segLen/2+3,0);
      ctx.lineTo(segLen/2-3,0);
      ctx.stroke();
      ctx.restore();
      plateIndex++;
    }
  }

  for(let i=0;i<CONFIG.path.length-1;i++){
    const a=CONFIG.path[i],b=CONFIG.path[i+1];
    const dx=b.x-a.x,dy=b.y-a.y;
    const len=Math.hypot(dx,dy);
    if(len<1)continue;
    const ux=dx/len,uy=dy/len;
    const nx=-uy,ny=ux;
    for(let d=18;d<len;d+=78){
      const x=a.x+ux*d,y=a.y+uy*d;
      ctx.strokeStyle='rgba(137,149,147,.28)';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(x+nx*(half-9),y+ny*(half-9));
      ctx.lineTo(x-nx*(half-9),y-ny*(half-9));
      ctx.stroke();
    }
  }

  for(let i=1;i<CONFIG.path.length-1;i++){
    const p=CONFIG.path[i];
    ctx.fillStyle='#353b3c';
    ctx.strokeStyle='#7f8a88';
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.roundRect(p.x-half+5,p.y-half+5,beltW-10,beltW-10,8);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle='rgba(180,190,188,.22)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(p.x,p.y,half-15,0,Math.PI*2);
    ctx.stroke();
  }

  ctx.strokeStyle='rgba(176,91,58,.55)';
  ctx.lineWidth=2;
  ctx.beginPath();
  CONFIG.path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.stroke();

  ctx.restore();
}
function drawPlacementHints(){ctx.save();CONFIG.placementZones.forEach(z=>{ctx.fillStyle='rgba(104,205,126,.20)';ctx.strokeStyle='rgba(177,255,187,.72)';ctx.lineWidth=2;ctx.setLineDash([10,7]);ctx.fillRect(z.x,z.y,z.w,z.h);ctx.strokeRect(z.x+1,z.y+1,z.w-2,z.h-2);ctx.setLineDash([]);ctx.fillStyle='rgba(215,255,220,.72)';ctx.font='900 9px Arial';ctx.textAlign='left';ctx.fillText('INSTALLATION AREA',z.x+8,z.y+15);});ctx.restore();}
function drawPlacementGhost(){const p=state.hoverPos,spec=TOWER_DEFS[state.selectedType],valid=isValidPlacement(p.x,p.y);ctx.save();ctx.fillStyle=valid?'rgba(92,184,105,.12)':'rgba(190,66,61,.13)';ctx.strokeStyle=valid?'rgba(111,220,122,.85)':'rgba(225,82,76,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,spec.range,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.globalAlpha=.48;drawTower({type:state.selectedType,x:p.x,y:p.y,level:1,branch:null},true);ctx.restore();}
function drawTank(){
 const x=CONFIG.objective.x,y=CONFIG.objective.y,hp=Math.max(0,Math.min(100,state.batch));
 const shake=state.tankShake||0;
 ctx.save();ctx.translate(x+(shake?Math.sin(state.time*48)*shake:0),y);
 // shadow / footing
 ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,64,57,18,0,0,Math.PI*2);ctx.fill();
 // legs
 ctx.fillStyle='#59615f';ctx.fillRect(-31,49,12,28);ctx.fillRect(19,49,12,28);
 // cylindrical stainless vessel
 const g=ctx.createLinearGradient(-45,0,45,0);g.addColorStop(0,'#737d7b');g.addColorStop(.22,'#d9dfdd');g.addColorStop(.5,'#aeb8b6');g.addColorStop(.78,'#e7ecea');g.addColorStop(1,'#707a78');
 ctx.fillStyle=g;ctx.strokeStyle='#4d5553';ctx.lineWidth=5;ctx.beginPath();ctx.roundRect(-46,-66,92,121,18);ctx.fill();ctx.stroke();
 // top lid and agitator
 ctx.fillStyle='#8a9492';ctx.beginPath();ctx.ellipse(0,-63,42,14,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#5c6664';ctx.fillRect(-8,-89,16,25);ctx.fillStyle='#9a5b38';ctx.fillRect(-14,-101,28,13);
 // chocolate sight glass
 ctx.fillStyle='#4c2b22';ctx.fillRect(-31,-20,62,26);ctx.fillStyle='#6e3b2c';ctx.fillRect(-28,-17,56,20);
 // pipe outlet
 ctx.fillStyle='#a26840';ctx.strokeStyle='#594232';ctx.lineWidth=4;ctx.fillRect(-63,10,20,16);ctx.strokeRect(-63,10,20,16);
 // label
 ctx.fillStyle='#7d2f2f';ctx.fillRect(-38,16,76,28);ctx.fillStyle='#fff1d8';ctx.font='900 8px Arial';ctx.textAlign='center';ctx.fillText('MAIN TEMPERING',0,28);ctx.fillText('TANK',0,38);
 // health gauge above tank
 const bw=112,bh=15;ctx.fillStyle='#2e2926';ctx.fillRect(-bw/2,-125,bw,bh);ctx.fillStyle=hp>60?'#5f9c5b':hp>30?'#d2a035':'#a63c36';ctx.fillRect(-bw/2+2,-123,(bw-4)*(hp/100),bh-4);ctx.strokeStyle='#f6ead3';ctx.lineWidth=2;ctx.strokeRect(-bw/2,-125,bw,bh);
 ctx.fillStyle='#fff4df';ctx.font='900 10px Arial';ctx.fillText(`TANK ${Math.ceil(hp)}%` ,0,-131);
 // Real-time impact flash when defects are attacking the vessel.
 if((state.tankHit||0)>0){
   ctx.strokeStyle=`rgba(255,112,72,${Math.min(1,state.tankHit*5)})`;
   ctx.lineWidth=6;ctx.beginPath();ctx.roundRect(-51,-72,102,135,21);ctx.stroke();
   ctx.fillStyle='#ffb06b';ctx.font='900 10px Arial';ctx.fillText('UNDER ATTACK',0,-145);
 }
 // damage warning
 if(hp<50){ctx.strokeStyle=hp<25?'#ff5d4f':'#efc24a';ctx.lineWidth=3;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(0,-7,58,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
 ctx.restore();
}
function drawTower(t,ghost=false){
 const s=towerStats(t),d=TOWER_DEFS[t.type],a=t.aimAngle||0,recoil=(t.recoil||0)*5;
 ctx.save();ctx.translate(t.x,t.y);
 if(t===state.selectedTower){ctx.strokeStyle='#ffe087';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,34,0,Math.PI*2);ctx.stroke();}
 // base
 ctx.fillStyle='#4e5755';ctx.fillRect(-25,15,50,11);ctx.fillStyle='#aab3b1';ctx.strokeStyle='#4a5351';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-23,-18,46,38,7);ctx.fill();ctx.stroke();

 if(t.type==='fan'){
   // recognizable wheeled industrial floor fan
   ctx.strokeStyle='#555f5e';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-15,19);ctx.lineTo(-21,35);ctx.moveTo(15,19);ctx.lineTo(21,35);ctx.stroke();
   ctx.fillStyle='#454e4d';ctx.beginPath();ctx.arc(-22,36,5,0,Math.PI*2);ctx.arc(22,36,5,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#768486';ctx.strokeStyle='#d1d9d8';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-3,29,0,Math.PI*2);ctx.fill();ctx.stroke();
   // guard cage rings
   ctx.strokeStyle='#515c5d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-3,23,0,Math.PI*2);ctx.stroke();
   ctx.save();ctx.translate(0,-3);ctx.rotate(t.fanAngle||0);
   ctx.fillStyle=t.active?'#b8ced0':'#9caaaa';
   const blades=s.visual>=2?6:4;
   for(let i=0;i<blades;i++){ctx.save();ctx.rotate(i*Math.PI*2/blades);ctx.beginPath();ctx.moveTo(2,0);ctx.quadraticCurveTo(10,-7,20,-3);ctx.quadraticCurveTo(15,5,3,5);ctx.closePath();ctx.fill();ctx.restore();}
   ctx.fillStyle='#4e5959';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.restore();
   if(s.visual>=3){ctx.strokeStyle='#6f9eaa';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-3,34,0,Math.PI*2);ctx.stroke();}
   if(t.active&&!ghost){ctx.strokeStyle='rgba(199,236,240,.35)';ctx.lineWidth=2;for(let yy=-18;yy<=18;yy+=12){ctx.beginPath();ctx.moveTo(32,yy);ctx.lineTo(54,yy-3);ctx.stroke();}}
 } else {
   // rotating upper machinery
   ctx.save();ctx.rotate(a);
   ctx.translate(-recoil,0);
   if(t.type==='blower'){
     ctx.fillStyle='#7a4b34';const barrels=s.visual>=2?2:1;for(let i=0;i<barrels;i++)ctx.fillRect(6,-12+i*12,32,8);
     if(s.visual>=3){ctx.fillStyle='#b0834f';ctx.beginPath();ctx.moveTo(-15,-18);ctx.lineTo(5,-18);ctx.lineTo(0,-34);ctx.lineTo(-12,-34);ctx.closePath();ctx.fill();}
     if(s.visual>=4){ctx.fillStyle='#c38b45';ctx.fillRect(-5,-27,12,12);}
     if(s.visual>=5){ctx.fillStyle='#5f3527';ctx.beginPath();ctx.arc(37,0,10,0,Math.PI*2);ctx.fill();}
   }
   if(t.type==='ganache'){
     ctx.fillStyle='#653227';ctx.beginPath();ctx.ellipse(-5,-4,15,18,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8d5639';ctx.fillRect(7,-7,30,11);
     ctx.fillStyle='#c37b45';ctx.beginPath();ctx.arc(38,-1,5,0,Math.PI*2);ctx.fill();
     if(s.visual>=3){ctx.strokeStyle='#b06135';ctx.lineWidth=5;ctx.beginPath();ctx.arc(-5,-3,23,0,Math.PI*1.7);ctx.stroke();}
   }
   if(t.type==='cannon'){
     ctx.fillStyle='#b48251';ctx.beginPath();ctx.arc(-7,0,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6b3d2d';ctx.fillRect(-1,-8,43,16);
     if(s.visual>=2){ctx.fillStyle='#8b5a35';ctx.fillRect(-20,-20,18,12);}
     if(s.visual>=3){ctx.strokeStyle='#d0b174';ctx.lineWidth=3;ctx.strokeRect(4,-11,31,22);}
     if(s.visual>=4){ctx.fillStyle='#4e2c22';ctx.fillRect(28,-12,18,24);}
     if(s.visual>=5){ctx.fillStyle='#d2b66d';ctx.fillRect(38,-5,11,10);}
   }
   if(t.type==='stapler'){
     ctx.fillStyle='#a84439';ctx.beginPath();ctx.roundRect(-12,-18,35,13,5);ctx.fill();ctx.fillRect(-16,-2,41,9);
     ctx.strokeStyle='#67312d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(17,-13);ctx.lineTo(32,-1);ctx.stroke();
     if(s.visual>=2){ctx.fillStyle='#7a8990';ctx.fillRect(-21,-16,8,20);}
     if(s.visual>=3){ctx.fillStyle='#c96c56';ctx.fillRect(-8,-30,21,9);}
     if(s.visual>=4){ctx.fillStyle='#763328';ctx.fillRect(22,-8,14,16);}
     if(s.visual>=5){ctx.fillStyle='#d0af69';ctx.fillRect(29,-5,13,10);}
   }
   ctx.restore();
 }
 if(t.disabled>0&&!ghost){ctx.fillStyle='#c94235';ctx.beginPath();ctx.arc(0,-28,5,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
function drawEnemy(e){const d=ENEMY_DEFS[e.type];ctx.save();
const attackBob=e.attackingTank?Math.sin(state.time*11+e.y*.03)*3:0;
ctx.translate(e.x+attackBob,e.y);ctx.rotate(e.attackingTank?0:e.angle*.12);if(d.boss){ctx.fillStyle='#e6b93e';ctx.strokeStyle='#3b2f29';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,d.radius+9,0,Math.PI*2);ctx.stroke();}
 ctx.fillStyle=d.color;ctx.strokeStyle='#35251f';ctx.lineWidth=3;if(e.type==='truffle'){ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#d8b58b';for(let a=0;a<3;a++){ctx.beginPath();ctx.arc(-6+a*6,-4+(a%2)*5,2,0,Math.PI*2);ctx.fill();}}
 else if(e.type==='sugar'){ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?9:14;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.stroke();}
 else if(e.type==='clump'||e.type==='boss'){const r=d.radius;ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5,rr=r*(.78+((i*37)%7)/20);ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#b5774d';ctx.beginPath();ctx.arc(-r*.25,-r*.15,r*.12,0,Math.PI*2);ctx.fill();}
 else if(e.type==='meltling'){ctx.beginPath();ctx.ellipse(0,2,18,13,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-12,7);ctx.quadraticCurveTo(-18,24,-5,18);ctx.quadraticCurveTo(0,25,7,15);ctx.fill();}
 else if(e.type==='burnt'){ctx.beginPath();ctx.roundRect(-22,-18,44,36,8);ctx.fill();ctx.stroke();ctx.strokeStyle='#96614c';for(let i=-12;i<=12;i+=8){ctx.beginPath();ctx.moveTo(i,-13);ctx.lineTo(i+6,12);ctx.stroke();}}
 const hpw=d.boss?88:38;ctx.fillStyle='#352824';ctx.fillRect(-hpw/2,-d.radius-13,hpw,5);ctx.fillStyle=e.hp/e.maxHp>.35?'#e2b741':'#9b3434';ctx.fillRect(-hpw/2,-d.radius-13,hpw*Math.max(0,e.hp/e.maxHp),5);ctx.restore();}
function drawProjectile(p){ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=p.color;if(p.type==='stapler'){ctx.fillRect(-6,-2,12,4);}else if(p.type==='ganache'){ctx.beginPath();ctx.ellipse(0,0,7,5,0,0,Math.PI*2);ctx.fill();}else{ctx.beginPath();ctx.arc(0,0,p.type==='cannon'?7:4,0,Math.PI*2);ctx.fill();}ctx.restore();}
function drawParticles(puddles){state.particles.forEach(p=>{if(!!p.puddle!==puddles)return;ctx.save();ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;if(p.puddle){ctx.beginPath();ctx.ellipse(p.x,p.y,p.size*1.6,p.size*.65,0,0,Math.PI*2);ctx.fill();}else{ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.restore();});}
function drawPallet(x,y){ctx.fillStyle='#8c6547';for(let i=0;i<3;i++)ctx.fillRect(x,y+i*9,74,6);ctx.fillStyle='#b0835c';ctx.fillRect(x+5,y-25,64,25);ctx.strokeStyle='#755139';ctx.strokeRect(x+5,y-25,64,25)}
function drawRack(x,y){ctx.fillStyle='#5e6664';ctx.fillRect(x,y,7,105);ctx.fillRect(x+62,y,7,105);for(let yy=0;yy<100;yy+=30)ctx.fillRect(x, y+yy,69,5);ctx.fillStyle='#a9754e';ctx.fillRect(x+8,y+7,50,15);ctx.fillRect(x+8,y+38,50,15)}
function drawTable(x,y){ctx.fillStyle='#c4ccca';ctx.strokeStyle='#5b6462';ctx.lineWidth=3;ctx.fillRect(x,y,105,34);ctx.strokeRect(x,y,105,34);ctx.fillStyle='#6b7472';ctx.fillRect(x+8,y+34,7,32);ctx.fillRect(x+90,y+34,7,32)}

function updateHud(){$('#batchValue').textContent=Math.ceil(state.batch)+'%';$('#ppValue').textContent=Math.floor(state.pp);const nextWave=Math.min(state.wave+2,WAVES.length);
$('#waveValue').textContent=state.waveActive?`${state.wave+1}/10`:state.wave>=WAVES.length-1?'10/10':`${nextWave}/10`;
const incidentEl=$('#incidentValue');
if(incidentEl){
  incidentEl.textContent=state.waveActive?WAVES[state.wave].title.toUpperCase():state.wave>=WAVES.length-1?'SHIFT COMPLETE':`PREP ${Math.ceil(state.prepTimer)}s — ${WAVES[Math.max(0,nextWave-1)].title.toUpperCase()}`;
}$('#shutdownCd').textContent=state.shutdown>0?`${state.shutdown.toFixed(1)}s ACTIVE`:state.shutdownCd>0?`${Math.ceil(state.shutdownCd)}s cooldown`:'Ready';$('#espressoCd').textContent=state.espresso>0?`${state.espresso.toFixed(1)}s ACTIVE`:state.espressoCd>0?`${Math.ceil(state.espressoCd)}s cooldown`:'Ready';$('#shutdownBtn').classList.toggle('cooldown',state.shutdownCd>0);$('#espressoBtn').classList.toggle('cooldown',state.espressoCd>0);
const nextBtn=$('#nextWaveBtn'),nextText=$('#nextWaveText');
if(nextBtn&&nextText){
  const canStart=state.screen==='game'&&!state.paused&&state.wave<WAVES.length-1;
  nextBtn.disabled=!canStart;
  if(canStart){
    nextText.textContent=state.waveActive?`Launch ${state.wave+2}/10`:`Start now · ${Math.max(0,Math.ceil(state.prepTimer))}s`;
  }else{
    nextText.textContent=state.wave>=WAVES.length-1?'Final wave':'Unavailable';
  }
}
}
function showAnnouncement(msg,seconds=3){const el=$('#announcement');el.textContent=msg;el.classList.remove('hidden');state.announcementTimer=seconds;}
let toastTimer;function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hidden'),2300);}
function activateShutdown(){if(state.shutdownCd>0||state.screen!=='game'||state.paused)return;state.shutdown=CONFIG.shutdownDuration;state.shutdownCd=CONFIG.shutdownCooldown;showAnnouncement('EMERGENCY SHUTDOWN — CONVEYOR MOTION SUSPENDED.',2.2);}
function activateEspresso(){if(state.espressoCd>0||state.screen!=='game'||state.paused)return;state.espresso=CONFIG.espressoDuration;state.espressoCd=CONFIG.espressoCooldown;showAnnouncement('ESPRESSO BREAK — EQUIPMENT OPERATORS ARE NOW CONCERNINGLY EFFICIENT.',2.2);}
function pauseToggle(){if(state.screen!=='game')return;state.paused=!state.paused;$('#pauseScreen').classList.toggle('hidden',!state.paused);}
function endGame(win){state.paused=true;$('#endKicker').textContent=win?'SHIFT REPORT: ACCEPTABLE':'SHIFT REPORT: UNFORTUNATE';$('#endTitle').textContent=win?'PRODUCTION CONTAINED':'BATCH RUINED';$('#endText').textContent=win?`The Mega Clump has been contained with ${Math.ceil(state.batch)}% Batch Integrity remaining. Management has described the incident as “mostly preventable.”`:'The Main Tempering Tank has been compromised. Production will now begin the traditional process of determining whose fault this was.';$('#endScreen').classList.remove('hidden');}

function resize(){
 const wrap=$('#gameWrap');
 const rect=wrap.getBoundingClientRect();

 const cssW=Math.max(1,rect.width);
 const cssH=Math.max(1,rect.height);

 canvas.style.width=`${cssW}px`;
 canvas.style.height=`${cssH}px`;

 dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
 canvas.width=Math.max(1,Math.floor(cssW*dpr));
 canvas.height=Math.max(1,Math.floor(cssH*dpr));

 H=720;
 W=H*(cssW/cssH);

 ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);vignetteCanvas=null;vignetteKey='';

 camera.x=Math.max(0,Math.min(Math.max(0,WORLD.width-W),camera.x));
 camera.y=Math.max(0,Math.min(Math.max(0,WORLD.height-H),camera.y));
}
function mousePos(ev){const r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)/r.width*W+camera.x,y:(ev.clientY-r.top)/r.height*H+camera.y};}
canvas.addEventListener('mousemove',e=>{state.hoverPos=mousePos(e);});
canvas.addEventListener('mouseleave',()=>{state.hoverPos=null;});
canvas.addEventListener('click',e=>{if(state.paused)return;const m=mousePos(e);let best=null,bd=28;for(let i=state.towers.length-1;i>=0;i--){const t=state.towers[i],d=Math.hypot(m.x-t.x,m.y-t.y);if(d<bd){bd=d;best=t;}}if(best){selectTower(best);return;}if(state.selectedType){tryPlaceTower(m.x,m.y);return;}hideInspect();});

$('#fullBtn').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();};$('#playBtn').onclick=startGame;$('#howBtn').onclick=()=>{$('#menu').classList.add('hidden');$('#how').classList.remove('hidden');};$('#howBack').onclick=()=>{$('#how').classList.add('hidden');$('#menu').classList.remove('hidden');};$('#nextWaveBtn').onclick=startWaveEarly;$('#shutdownBtn').onclick=activateShutdown;$('#espressoBtn').onclick=activateEspresso;$('#pauseBtn').onclick=pauseToggle;$('#resumeBtn').onclick=pauseToggle;$('#restartBtn').onclick=()=>{state.paused=false;$('#pauseScreen').classList.add('hidden');startGame();};$('#endRestart').onclick=()=>{$('#endScreen').classList.add('hidden');state.paused=false;startGame();};$('#inspectClose').onclick=hideInspect;$('#upgradeBtn').onclick=upgradeSelected;$('#branchABtn').onclick=()=>chooseBranch(0);$('#branchBBtn').onclick=()=>chooseBranch(1);$('#sellBtn').onclick=sellSelected;$('#musicBtn').onclick=()=>{state.music=!state.music;$('#musicBtn').style.opacity=state.music?1:.45;toast(state.music?'MUSIC ENABLED. AUDIO FILE CAN BE ADDED LATER.':'MUSIC MUTED.');};$('#sfxBtn').onclick=()=>{state.sfx=!state.sfx;$('#sfxBtn').style.opacity=state.sfx?1:.45;toast(state.sfx?'SFX ENABLED.':'SFX MUTED.');};
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code)){keys.add(e.code);e.preventDefault();}if(e.key==='Escape'&&state.screen==='game'){if(state.selectedType){state.selectedType=null;document.querySelectorAll('.tower-btn').forEach(b=>b.classList.remove('selected'));toast('PLACEMENT CANCELLED.');return;}if(state.selectedTower){hideInspect();return;}pauseToggle();return;}if(e.key==='1')activateShutdown();if(e.key==='2')activateEspresso();});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('resize',resize);

let last=performance.now();function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop);}buildTowerButtons();requestAnimationFrame(loop);
})();
