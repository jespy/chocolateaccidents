'use strict';
const C={speed:150,sneak:.55,sprint:1.7,batteryDrain:.42,sprintDrain:27,staminaRegen:18,integrityDrain:.045,softSpeed:38,bloomDrain:5,intercomEvery:36};
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),hud=document.querySelector('#hud'),overlay=document.querySelector('#overlay'),card=document.querySelector('#card'),taskPanel=document.querySelector('#taskPanel');
let state='start',keys={},mouse={x:640,y:360},last=performance.now(),elapsed=0,announcement=0,paused=false,taskExpanded=false;
const player={x:170,y:360,r:13,stamina:100,battery:100,integrity:100,hasTray:false,wrongTray:false,blanket:false,carryingBox:null,direction:'down',moving:false};
const loadSprite=src=>{const img=new Image();img.src=src;return img};
const chrisSprites={
 idle:loadSprite('assets/chris_idle.png'),
 down:['assets/chris_walk1.png','assets/chris_walk2.png'].map(loadSprite),
 up:['assets/chris_away1.png','assets/chris_away2.png'].map(loadSprite),
 left:['assets/chris_left1.png','assets/chris_left2.png','assets/chris_left3.png','assets/chris_left4.png'].map(loadSprite),
 right:['assets/chris_right1.png','assets/chris_right2.png','assets/chris_right3.png','assets/chris_right4.png'].map(loadSprite)
};
const floorTileSize=64;
const floorTiles=['assets/tiles1.png','assets/tiles2.png','assets/tiles3.png','assets/tiles4.png','assets/tiles5.png'].map(loadSprite);
const floorCols=Math.ceil(1280/floorTileSize),floorRows=Math.ceil(720/floorTileSize);
const floorPattern=Array.from({length:floorCols*floorRows},()=>Math.floor(Math.random()*floorTiles.length));
const ceilingLights=Array.from({length:4},()=>({type:'normal',base:.72+Math.random()*.32,phase:Math.random()*Math.PI*2,speed:.35+Math.random()*.45,next:0,flicker:0,flickerLevel:1,glitchTime:0,toggle:0,on:true}));
const lightOrder=Array.from({length:4},(_,i)=>i).sort(()=>Math.random()-.5),flickerRanges=[[2.2,4.1],[3.8,6.7],[6.2,10.5]];
lightOrder.slice(0,2).forEach((index,i)=>Object.assign(ceilingLights[index],{type:'flicker',interval:flickerRanges[i],next:flickerRanges[i][0]+Math.random()*(flickerRanges[i][1]-flickerRanges[i][0])}));
Object.assign(ceilingLights[lightOrder[2]],{type:'glitch',next:4.5+Math.random()*4});
let roomBrightness=1;
let introTimer=0,introPhase=0,introDialogIndex=0;
const tasks={truffles:false,log:false,compressor:false,tray:false};
const truffleBoxes=[
 {id:'truffleA',x:190,y:590,homeX:267,homeY:210,code:'TR-4A',name:'Milk Chocolate Truffles',shelf:'RACK 1 / SHELF A',stored:false},
 {id:'truffleB',x:220,y:615,homeX:467,homeY:500,code:'TR-7C',name:'Raspberry Truffle',shelf:'RACK 4 / SHELF C',stored:false},
 {id:'truffleC',x:245,y:585,homeX:867,homeY:500,code:'TR-9B',name:'Key Lime Pie Truffle',shelf:'RACK 8 / SHELF B',stored:false}
];
let trayInspected=false;
const notes=[{x:390,y:150,t:'PLEASE SIGN THE TEMPERATURE LOG.'},{x:860,y:580,t:'If you can read this, do not stack the soft ones.'},{x:1010,y:125,t:'Almeria said the noise is “normal expansion.” Almeria has not been in here.'}];
const interactables=[
 {id:'log',x:68,y:238,label:'TEMPERATURE LOG',act(){openTemperatureLog();}},
 {id:'compressor',x:1216,y:606,label:'COMPRESSOR RESET',act(){tasks.compressor=true;msg('COMPRESSOR RESET — SYSTEM PRESSURE STABILIZING');}},
 {id:'listedTray',x:940,y:220,label:'SEA SALT TRUFFLES — BATCH 9F',act(){inspectListedTray();}},
 {id:'realTray',x:560,y:545,label:'SEA SALT TRUFFLES — BATCH 4C / TABLE 4',act(){if(!trayInspected){msg('FROSTED TAG — NO REASON YET TO REMOVE THIS TRAY');return}tasks.tray=true;player.hasTray=true;player.wrongTray=false;msg('SEA SALT TRUFFLES PICKED UP — CARRY THEM TO THE EXIT');}},];
const walls=[
 [0,0,1280,28],[0,692,1280,28],[0,0,28,720],[1252,0,28,720],
 [250,90,35,210],[250,390,35,230],[450,90,35,220],[450,405,35,215],[650,90,35,220],[650,405,35,215],[850,90,35,220],[850,405,35,215],[1050,90,35,210],[1050,395,35,225],
 [1160,470,92,18],[1160,470,18,180]
];
const bloom=[];
const freezerShadow={
 x:1080,y:165,r:14,active:false,revealed:false,stunned:false,
 spawnAt:10,lastSeen:0,respawnAt:0,hitCooldown:0
};
const shadowSpawns=[
 [1080,165],[1080,520],[760,150],[760,555],[360,150],[360,545],[1110,350]
];
function placeShadow(){
 const choices=shadowSpawns.slice().sort((a,b)=>
   Math.hypot(b[0]-player.x,b[1]-player.y)-Math.hypot(a[0]-player.x,a[1]-player.y));
 const q=choices[Math.floor(Math.random()*Math.min(3,choices.length))];
 freezerShadow.x=q[0];freezerShadow.y=q[1];
 freezerShadow.active=true;freezerShadow.revealed=false;freezerShadow.stunned=false;
}
function shadowInFlashlight(){
 if(!freezerShadow.active||!player.flashlightOn||player.battery<=0)return false;
 const dx=freezerShadow.x-player.x,dy=freezerShadow.y-player.y,dist=Math.hypot(dx,dy);
 const beamLen=330+90*(player.battery/100);
 // The 72px radial spill around Chris is visual only and NEVER freezes the Shadow.
 // Shadow stopping begins only in the directional portion of the flashlight beam.
 if(dist<82||dist>beamLen+20)return false;
 const aim=Math.atan2(mouse.y-player.y,mouse.x-player.x);
 const diff=Math.atan2(Math.sin(Math.atan2(dy,dx)-aim),Math.cos(Math.atan2(dy,dx)-aim));
 return Math.abs(diff)<.34;
}

const door={x:28,y:310,w:20,h:100};
const announcements=['Maintenance has been notified.','Maintenance is not entering the freezer at this time.','Has anyone seen the truffles for table 4?','Whoever is in there, the Big Boss is asking why production has stopped.'];
const introDialogs=[
 'WHAM — THE FREEZER DOOR SLAMS SHUT',
 'THE PALLET TIPS — THREE TRUFFLE CASES SKID ACROSS THE FLOOR',
 'ICE SPREADS ACROSS THE DOOR SEAM. IT WILL NOT OPEN.',
 'FIND THE RIGHT TRUFFLES. TIDY UP THE FREEZER. DEAL WITH ANY OTHER PROBLEMS THAT POP UP ALONG THE WAY.'
];
function showIntroDialog(){
 announcement=9999;
 msg.text=introDialogs[introDialogIndex];
}
function advanceIntro(){
 if(state!=='intro')return false;
 if(introDialogIndex<introDialogs.length-1){
   introDialogIndex++;
   introPhase=introDialogIndex;
   if(introDialogIndex===1){player.x=118;player.y=360;}
   showIntroDialog();
 }else{
   state='play';announcement=3.2;msg.text=introDialogs[introDialogs.length-1];
 }
 return true;
}
function start(){state='intro';overlay.classList.remove('show');elapsed=0;announcement=9999;introTimer=0;introPhase=0;introDialogIndex=0;player.x=118;player.y=360;player.direction='right';showIntroDialog();taskList();}
function openTemperatureLog(){
 state='inspect';
 card.innerHTML=`<div class='warning'>FREEZER TEMPERATURE LOG</div>
 <h1>PLEASE SIGN THE LOG</h1>
 <div class='tempLogSheet'>
   <div class='tempLogHeader'><b>WALK-IN FREEZER — DAILY TEMPERATURE RECORD</b><span>QUALITY CONTROL FORM QC-14</span></div>
   <div class='tempReading'><span>CURRENT READING</span><b>-4°F</b><small>ACCEPTABLE RANGE: -10°F TO 0°F</small></div>
   <table class='tempTable'>
     <tr><th>TIME</th><th>TEMP</th><th>INITIALS</th><th>NOTES</th></tr>
     <tr><td>06:00</td><td>-6°F</td><td>JM</td><td>Normal</td></tr>
     <tr><td>10:00</td><td>-5°F</td><td>AL</td><td>Door sticking again</td></tr>
     <tr><td>14:00</td><td>-4°F</td><td>—</td><td>PLEASE SIGN</td></tr>
   </table>
   <div class='tempWarning'>DOOR SEAM SHOWS UNUSUAL .<br><b>MAINTENANCE HAS BEEN NOTIFIED.</b></div>
 </div>
 <p class='small'>The temperature is technically acceptable. The door situation is not mentioned anywhere useful.</p>
 <button onclick='signTemperatureLog()'>SIGN &amp; RETURN CLIPBOARD</button>`;
 overlay.classList.add('show');
}
function signTemperatureLog(){
 tasks.log=true;
 state='play';
 overlay.classList.remove('show');
 msg('LOG SIGNED — QUALITY CONTROL REMAINS SATISFIED');
 taskList();
}
function inspectListedTray(){
 state='inspect';
 trayInspected=true;
 card.innerHTML=`<div class='warning'>INVENTORY INSPECTION</div><h1>LISTED SEA SALT TRUFFLES</h1><div class='trayInspect'><div class='trayChocolate'><span></span><span></span><span></span><span></span><span></span><span></span></div><div class='oldLabel'>C-12<br><small>BATCH 3B</small></div><div class='newLabel'>Sea Salt Truffles<br><small>BATCH 9F</small></div></div><div class='inspectionFinding'><b>SOMETHING IS WRONG.</b><br>The Sea Salt Truffles sticker is sitting over an older C-12 label. The listed batch number is <b>9F</b>. Your work order calls for <b>BATCH 4C / TABLE 4</b>.</div><p class='small'>Someone corrected the inventory without correcting the inventory.</p><button onclick='closeInspection()'>MARK DISCREPANCY &amp; CONTINUE</button>`;
 overlay.classList.add('show');
 taskList();
}
function closeInspection(){state='play';overlay.classList.remove('show');msg('WRONG BATCH. FIND ONE SEA SALT TRUFFLES TRAY MARKED BATCH 4C / TABLE 4. LEAVE ALL OTHERS.');}
function startScreen(){card.innerHTML=`<div class='warning'>WORK ORDER 4-C</div><h1>THE WALK-IN</h1><p>You were sent in for one tray of truffles. The freezer door has a history of sticking. Nobody wrote that part down.</p><p><b>OBJECTIVE:</b> Bring back exactly <b>ONE tray of Sea Salt Truffles — BATCH 4C / TABLE 4</b>.</p><p><b>NOTE:</b> Truffle cases beside the staging room are already sorted. Please do not disturb them.</p><div class='keys'>WASD / arrows move · E or click uses · Shift sneaks · Space/Q sprints</div><p class='small'>Hairnet compliance is assumed. Coat rating is not.</p><button onclick='start()'>ENTER FREEZER</button>`;overlay.classList.add('show')}
function msg(t){announcement=5;msg.text=t;taskList()}msg.text='';
function objective(){
 if(!tasks.truffles)return player.carryingBox?'STORE '+player.carryingBox.code+' — '+player.carryingBox.shelf:'PUT AWAY 3 SPILLED TRUFFLE CASES';
 if(!tasks.log)return 'SIGN TEMPERATURE LOG';
 if(!tasks.compressor)return 'RESET COMPRESSOR';
 if(!trayInspected)return 'INSPECT LISTED SEA SALT TRUFFLES';
 if(!tasks.tray)return 'FIND 1 TRAY: SEA SALT TRUFFLES — BATCH 4C / TABLE 4';
 return 'RETURN TO SEALED DOOR';
}
function taskList(){
 const stored=truffleBoxes.filter(b=>b.stored).length;
 const rows=[
 ['truffles','Put away spilled truffle cases',`${stored}/3 stored — each case has a rack/shelf code`],
 ['log','Sign the temperature log','Clipboard mounted beside the EXIT door'],
 ['compressor','Reset the compressor','Use the control panel on the compressor in the lower-right alcove'],
 ['tray',trayInspected?'Find ONE correct Sea Salt Truffles tray':'Inspect the listed Sea Salt Truffles tray',trayInspected?'Take only BATCH 4C / TABLE 4 — leave all other trays':'Check the label before removing anything']
 ];
 const done=rows.filter(r=>tasks[r[0]]).length;
 const current=rows.find(r=>!tasks[r[0]]) || ['done','Return to the EXIT','Bring the correct tray back to the red freezer door'];
 if(!taskExpanded){
   taskPanel.classList.remove('expanded');
   taskPanel.innerHTML=`<div class='compactTop'><span>WORK ORDER ${done}/${rows.length}</span><span class='tabHint'>TAB: DETAILS</span></div><div class='compactObjective'>${current[1]}</div><div class='compactHint'>${current[2]}</div>${player.carryingBox?`<div class='carryHint'>CARRYING ${player.carryingBox.code} → ${player.carryingBox.shelf}</div>`:''}`;
   return;
 }
 taskPanel.classList.add('expanded');
 taskPanel.innerHTML=`<div class='taskTitle'>INCIDENT / WORK ORDER 4-C <span class='tabHint'>TAB: CLOSE</span></div><div class='taskHint'>Put away the spilled truffle cases, complete freezer procedure, retrieve Sea Salt Truffles, then exit.</div>${rows.map(r=>`<div class='taskRow ${tasks[r[0]]?'done':current&&current[0]===r[0]?'current':''}'><span class='taskMark'>${tasks[r[0]]?'✓':current&&current[0]===r[0]?'→':'○'}</span><span><b>${r[1]}</b><br><span class='small'>${r[2]}</span></span></div>`).join('')}${trayInspected&&!tasks.tray?`<div class='discrepancy'>DISCREPANCY: Listed Sea Salt Truffles is actually C-12 / BATCH 9F.<br><b>Find BATCH 4C / TABLE 4.</b></div>`:''}`;
}
function collide(nx,ny){for(const [x,y,w,h] of walls)if(nx+player.r>x&&nx-player.r<x+w&&ny+player.r>y&&ny-player.r<y+h)return true;return false}
function near(o,d=45){return Math.hypot(player.x-o.x,player.y-o.y)<d}
function use(){
 if(state!=='play'||paused)return;
 if(player.carryingBox){
   const b=player.carryingBox;
   // Destination is inside the rack artwork; interact from either aisle face.
   if(Math.abs(player.x-b.homeX)<58&&Math.abs(player.y-b.homeY)<55){
     b.stored=true;player.carryingBox=null;
     const n=truffleBoxes.filter(x=>x.stored).length;
     if(n===3){tasks.truffles=true;msg('TRUFFLE CASES RESTORED — INCIDENT CORRECTED');}
     else msg(`${b.code} STORED CORRECTLY — ${3-n} CASE${3-n===1?'':'S'} REMAIN`);
     return;
   }
 }
 for(const b of truffleBoxes){
   if(!b.stored&&!player.carryingBox&&Math.hypot(player.x-b.x,player.y-b.y)<45){
     player.carryingBox=b;msg(`${b.code} PICKED UP — STORE AT ${b.shelf}`);return;
   }
 }
 for(const o of interactables){if(near(o)&&!(o.id in tasks&&tasks[o.id])){o.act();return}}if(player.x<80&&player.y>280&&player.y<440){if(tasks.truffles&&tasks.log&&tasks.compressor&&player.hasTray)end();else msg('DOOR FROZEN SHUT — REQUIRED PROCEDURE INCOMPLETE')}}
function end(){state='end';let kind=player.integrity<=0?'DAMAGED TRAY':'CORRECT TRAY';card.innerHTML=`<div class='warning'>SHIFT REPORT</div><h1>${kind}</h1><p><b>SHIFT TIME:</b> ${fmt(elapsed)}<br><b>truffles INTEGRITY:</b> ${Math.max(0,player.integrity|0)}%<br><b>TRUFFLE CASES:</b> ${tasks.truffles?'3/3 STORED':'INCOMPLETE'}<br><b>TEMPERATURE LOG:</b> ${tasks.log?'SIGNED':'NOT SIGNED'}<br><b>WHAT YOU TOOK:</b> SEA SALT TRUFFLES — BATCH 4C / TABLE 4</p><p>${player.integrity<=0?'You escaped. You will be spoken to.':'Correct Sea Salt Truffles confirmed. Tray accepted.'}</p><button onclick='location.reload()'>CLOCK BACK IN</button>`;overlay.classList.add('show')}
function fmt(s){let m=Math.floor(s/60),q=Math.floor(s%60);return `${String(m).padStart(2,'0')}:${String(q).padStart(2,'0')}`}
function updateCeilingLights(dt){
 for(const light of ceilingLights){
  light.flicker=Math.max(0,light.flicker-dt);
  if(light.type==='flicker'){
   light.next-=dt;
   if(light.next<=0){
    light.flicker=.07+Math.random()*.11;
    light.flickerLevel=.22+Math.random()*.33;
    light.next=light.interval[0]+Math.random()*(light.interval[1]-light.interval[0]);
   }
  }else if(light.type==='glitch'){
   if(light.glitchTime>0){
    light.glitchTime-=dt;light.toggle-=dt;
    if(light.toggle<=0){light.on=!light.on;light.toggle=.055+Math.random()*.105}
    if(light.glitchTime<=0){light.on=true;light.next=4.5+Math.random()*4.5}
   }else{
    light.next-=dt;
    if(light.next<=0){light.glitchTime=.38+Math.random()*.47;light.toggle=.01;light.on=false}
   }
  }
 }
}
function update(dt){
 updateCeilingLights(dt);
 if(state==='intro'){
   // Opening dialogue waits for the player; it never advances on a timer.
   return;
 }
 if(state!=='play'||paused)return;
 elapsed+=dt;

 // Shadow logic is completely independent from player movement.
 // It advances every active gameplay frame unless the directional flashlight beam is on it.
 updateFreezerShadow(dt);if(player.flashlightOn&&player.battery>0)player.battery=Math.max(0,player.battery-1.15*dt);
 if(player.hasTray)player.integrity=Math.max(0,player.integrity-C.integrityDrain*dt);
 let dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),dy=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);
 player.moving=Math.hypot(dx,dy)>.08;
 if(player.moving){if(Math.abs(dx)>Math.abs(dy))player.direction=dx<0?'left':'right';else player.direction=dy<0?'up':'down'}
 let n=Math.hypot(dx,dy)||1,sp=C.speed;
 if(keys.Shift)sp*=C.sneak;
 if((keys[' ']||keys.q)&&player.stamina>0){sp*=C.sprint;player.stamina=Math.max(0,player.stamina-C.sprintDrain*dt)}
 else player.stamina=Math.min(100,player.stamina+C.staminaRegen*dt);
 let nx=player.x+dx/n*sp*dt,ny=player.y+dy/n*sp*dt;
 if(!collide(nx,player.y))player.x=nx;
 if(!collide(player.x,ny))player.y=ny;
 // Ice patches are visual atmosphere only; they do not affect movement or integrity.

 if(Math.hypot(dx,dy)>.2&&!keys.Shift)announcement-=dt;if(elapsed>15&&Math.floor(elapsed/C.intercomEvery)>Math.floor((elapsed-dt)/C.intercomEvery))msg('INTERCOM: '+announcements[(elapsed/C.intercomEvery|0)%announcements.length]);
}

function updateFreezerShadow(dt){
 if(state!=='play'||paused)return;

 if(!freezerShadow.active){
   if(elapsed>=freezerShadow.spawnAt&&elapsed>=freezerShadow.respawnAt){
     placeShadow();
   }
   return;
 }

 if(freezerShadow.hitCooldown>0){
   freezerShadow.hitCooldown=Math.max(0,freezerShadow.hitCooldown-dt);
 }

 // ONLY the directional flashlight beam can stop the Shadow.
 // Standing still, walking, sprinting, overhead lights, and the player's radial spill do nothing.
 const beamHoldingShadow=shadowInFlashlight();
 freezerShadow.stunned=beamHoldingShadow;

 if(beamHoldingShadow){
   if(!freezerShadow.revealed){
     freezerShadow.revealed=true;
     msg('...SOMETHING IS STANDING BETWEEN THE RACKS.');
   }
   freezerShadow.lastSeen=elapsed;
   return;
 }

 const dx=player.x-freezerShadow.x;
 const dy=player.y-freezerShadow.y;
 const d=Math.hypot(dx,dy)||1;

 // Continuous pursuit every frame, regardless of whether Chris moves.
 const speed=d<120?34:d<260?27:23;
 freezerShadow.x+=dx/d*speed*dt;
 freezerShadow.y+=dy/d*speed*dt;

 if(d<30&&freezerShadow.hitCooldown<=0){
   freezerShadow.hitCooldown=3;

   if(player.hasTray){
     player.hasTray=false;
     tasks.tray=false;
     const rt=interactables.find(o=>o.id==='realTray');
     if(rt){rt.x=player.x+24;rt.y=player.y+14;}
     msg('SOMETHING BRUSHES PAST YOU — THE SEA SALT TRUFFLES HIT THE FLOOR.');
   }else if(player.carryingBox){
     player.carryingBox.x=player.x+18;
     player.carryingBox.y=player.y+12;
     player.carryingBox=null;
     msg('A SHAPE RUSHES PAST — YOU DROP THE TRUFFLE CASE.');
   }else{
     player.stamina=Math.max(0,player.stamina-35);
     msg('THE LIGHTS BUZZ. SOMETHING COLD PASSES RIGHT BESIDE YOU.');
   }

   freezerShadow.active=false;
   freezerShadow.respawnAt=elapsed+18+Math.random()*12;
 }
}
function flashlightHits(x,y,pad=0){
 if(!player.flashlightOn||player.battery<=0)return false;
 const dx=x-player.x,dy=y-player.y,dist=Math.hypot(dx,dy);
 const beamLen=330+90*(player.battery/100);
 if(dist>beamLen+pad||dist<10)return false;
 const aim=Math.atan2(mouse.y-player.y,mouse.x-player.x);
 const diff=Math.atan2(Math.sin(Math.atan2(dy,dx)-aim),Math.cos(Math.atan2(dy,dx)-aim));
 return Math.abs(diff)<.48;
}
function drawTaskGlow(x,y,r=34){
 if(!flashlightHits(x,y,r))return;
 ctx.save();
 ctx.globalCompositeOperation='screen';
 const pulse=.92+Math.sin(elapsed*4)*.08;
 const g=ctx.createRadialGradient(x,y,2,x,y,r);
 g.addColorStop(0,`rgba(255,247,190,${.55*pulse})`);
 g.addColorStop(.42,`rgba(255,228,125,${.28*pulse})`);
 g.addColorStop(1,'rgba(255,228,125,0)');
 ctx.fillStyle=g;
 ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=`rgba(255,241,174,${.42*pulse})`;
 ctx.lineWidth=1.5;
 ctx.beginPath();ctx.arc(x,y,r*.58,0,Math.PI*2);ctx.stroke();
 ctx.restore();
}
function drawShiftClock(){
 const x=1234,y=48,r=24;
 ctx.save();

 // dark clock face
 ctx.fillStyle='rgba(9,16,22,.88)';
 ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='rgba(215,226,229,.72)';
 ctx.lineWidth=2;ctx.stroke();

 // hour marks
 ctx.strokeStyle='rgba(220,232,235,.58)';
 ctx.lineWidth=1.2;
 for(let i=0;i<12;i++){
   const a=i*Math.PI/6-Math.PI/2;
   const inner=r-6,outer=r-3;
   ctx.beginPath();
   ctx.moveTo(x+Math.cos(a)*inner,y+Math.sin(a)*inner);
   ctx.lineTo(x+Math.cos(a)*outer,y+Math.sin(a)*outer);
   ctx.stroke();
 }

 // Use elapsed shift time as a compact visual timer:
 // second hand = seconds, minute hand = minutes.
 const sec=elapsed%60;
 const min=(elapsed/60)%60;
 const secA=sec/60*Math.PI*2-Math.PI/2;
 const minA=min/60*Math.PI*2-Math.PI/2;

 ctx.strokeStyle='#eef5f6';
 ctx.lineWidth=2.2;
 ctx.beginPath();ctx.moveTo(x,y);
 ctx.lineTo(x+Math.cos(minA)*(r-9),y+Math.sin(minA)*(r-9));ctx.stroke();

 ctx.strokeStyle='#d9bd55';
 ctx.lineWidth=1.4;
 ctx.beginPath();ctx.moveTo(x,y);
 ctx.lineTo(x+Math.cos(secA)*(r-6),y+Math.sin(secA)*(r-6));ctx.stroke();

 ctx.fillStyle='#d9bd55';
 ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();

 // tiny elapsed label
 ctx.fillStyle='rgba(240,245,246,.9)';
 ctx.font='bold 8px Arial';
 ctx.textAlign='center';
 ctx.fillText(fmt(elapsed),x,y+r+12);
 ctx.textAlign='left';

 ctx.restore();
}
function draw(){let W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);
 // Night Shift floor handling: a stable randomized 128px tile map.
 ctx.fillStyle='#45515e';ctx.fillRect(0,0,W,H);
 for(let row=0;row<floorRows;row++)for(let col=0;col<floorCols;col++){
  const tile=floorTiles[floorPattern[row*floorCols+col]];
  if(tile.complete&&tile.naturalWidth)ctx.drawImage(tile,col*floorTileSize,row*floorTileSize,floorTileSize+1,floorTileSize+1);
 }
 // freezer tint and wear stay specific to The Walk-In.
 ctx.fillStyle='rgba(115,145,158,.18)';ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='rgba(46,58,63,.18)';ctx.lineWidth=8;ctx.lineCap='round';
 [[120,520,380,555],[710,650,1030,625],[300,350,600,370]].forEach(a=>{ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[2],a[3]);ctx.stroke()});
 // floor drain
 ctx.fillStyle='#53636a';ctx.beginPath();ctx.arc(610,350,24,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#aab8bd';ctx.lineWidth=2;
 for(let i=-14;i<=14;i+=7){ctx.beginPath();ctx.moveTo(610+i,333);ctx.lineTo(610+i,367);ctx.stroke()}
 // insulated perimeter panels
 ctx.fillStyle='#c4d0d3';ctx.fillRect(0,0,W,28);ctx.fillRect(0,H-28,W,28);ctx.fillRect(0,0,28,H);ctx.fillRect(W-28,0,28,H);
 ctx.strokeStyle='#91a3a9';ctx.lineWidth=2;for(let x=80;x<W;x+=110){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,28);ctx.stroke()}
 // racks: steel uprights, shelves, chocolate cartons and wrapped trays
 const rackRects=walls.slice(4,14);
 for(let ri=0;ri<rackRects.length;ri++){const [x,y,w,h]=rackRects[ri];
   ctx.fillStyle='#596a72';ctx.fillRect(x,y,w,h);
   ctx.fillStyle='#9aaab0';ctx.fillRect(x+4,y+3,5,h-6);ctx.fillRect(x+w-9,y+3,5,h-6);
   ctx.strokeStyle='#c5d0d3';ctx.lineWidth=2;
   for(let sy=y+28;sy<y+h-8;sy+=43){ctx.beginPath();ctx.moveTo(x+7,sy);ctx.lineTo(x+w-7,sy);ctx.stroke();
     if(((sy/43+ri)|0)%3!==0){ctx.fillStyle='#6a3e2b';ctx.fillRect(x+10,sy-19,w-20,16);ctx.fillStyle='#c8a06b';ctx.fillRect(x+13,sy-17,w-26,4);}
   }
   ctx.fillStyle='#e7d56c';ctx.fillRect(x-5,y-18,w+10,15);ctx.fillStyle='#27343a';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText('RACK '+(ri+1),x+w/2,y-7);ctx.textAlign='left';
 }
 // compressor alcove wall and refrigeration hardware
 // Compressor enclosure wall — brighter insulated panels with a strong metal edge so it reads in darkness.
 ctx.fillStyle='#9aaab0';ctx.fillRect(1156,466,100,24);ctx.fillRect(1156,466,24,188);
 ctx.fillStyle='#c0cdd1';ctx.fillRect(1160,470,92,14);ctx.fillRect(1160,470,14,180);
 ctx.strokeStyle='#d8e2e4';ctx.lineWidth=2;ctx.strokeRect(1157,467,98,22);ctx.strokeRect(1157,467,22,186);
 ctx.strokeStyle='rgba(45,58,64,.75)';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(1180,489);ctx.lineTo(1255,489);ctx.stroke();
 ctx.beginPath();ctx.moveTo(1180,489);ctx.lineTo(1180,654);ctx.stroke();
 // Yellow/black corner guard gives the alcove a recognizable industrial silhouette.
 ctx.fillStyle='#d6b83f';ctx.fillRect(1175,484,8,170);
 ctx.fillStyle='#2d3539';
 for(let gy=490;gy<648;gy+=24){ctx.beginPath();ctx.moveTo(1175,gy);ctx.lineTo(1183,gy+10);ctx.lineTo(1183,gy+18);ctx.lineTo(1175,gy+8);ctx.closePath();ctx.fill();}
 ctx.strokeStyle='#d7e0e2';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(1195,490);ctx.lineTo(1195,555);ctx.quadraticCurveTo(1195,570,1210,570);ctx.lineTo(1245,570);ctx.stroke();
 ctx.fillStyle='#3f4e55';ctx.fillRect(1190,585,52,45);ctx.fillStyle='#a9b7bb';ctx.fillRect(1196,591,40,24);ctx.fillStyle='#d5b744';ctx.beginPath();ctx.arc(1208,603,5,0,7);ctx.fill();
 ctx.fillStyle='#dce5e7';ctx.font='bold 9px Arial';ctx.fillText('COMPRESSOR',1187,648);
 // freezer staging room and substantial EXIT door
 ctx.fillStyle='#aab9bd';ctx.fillRect(28,280,72,160);ctx.fillStyle='#d8e0e2';ctx.fillRect(31,292,54,136);
 ctx.strokeStyle='#71838a';ctx.lineWidth=5;ctx.strokeRect(31,292,54,136);
 ctx.fillStyle='#b42d28';ctx.fillRect(38,304,40,112);ctx.fillStyle='#6f1716';ctx.fillRect(43,356,30,7);
 ctx.fillStyle='#e7ecec';ctx.fillRect(72,342,7,35);ctx.fillStyle='#d5b744';ctx.fillRect(83,300,10,120);
 ctx.save();
 ctx.strokeStyle='rgba(225,246,255,.92)';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(37,306);ctx.lineTo(47,322);ctx.lineTo(42,338);ctx.lineTo(55,352);ctx.lineTo(49,369);ctx.lineTo(63,388);ctx.stroke();
 ctx.beginPath();ctx.moveTo(78,314);ctx.lineTo(68,330);ctx.lineTo(74,347);ctx.lineTo(63,365);ctx.lineTo(70,384);ctx.lineTo(59,402);ctx.stroke();
 ctx.fillStyle='rgba(220,245,255,.34)';ctx.fillRect(34,296,48,128);
 ctx.restore();

 if(state==='intro'&&introPhase>=1){ctx.fillStyle='rgba(90,12,12,.22)';ctx.fillRect(28,280,72,160);}
 ctx.fillStyle='#e74b3e';ctx.fillRect(35,262,47,17);ctx.fillStyle='white';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText('EXIT',58,274);ctx.textAlign='left';
 // cold-room floor tape
 ctx.strokeStyle='rgba(226,194,57,.55)';ctx.lineWidth=4;ctx.setLineDash([18,10]);ctx.strokeRect(108,72,1030,570);ctx.setLineDash([]);
 for(const o of interactables){
 const completed=(o.id==='log'&&tasks.log)||(o.id==='compressor'&&tasks.compressor)||(o.id==='listedTray'&&trayInspected)||(o.id==='realTray'&&tasks.tray);
 if(completed)continue;
 const required=(o.id!=='realTray'||trayInspected);ctx.save();if(required){ctx.strokeStyle='#f4dc72';ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.x,o.y,20+Math.sin(elapsed*4)*2,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f4dc72';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText(o.id==='listedTray'?'INSPECT':'TASK',o.x,o.y-27)}else if(o.id==='wrong'){ctx.strokeStyle='#e9eef0';ctx.setLineDash([4,4]);ctx.strokeRect(o.x-18,o.y-16,36,32);ctx.setLineDash([]);ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText('OPTIONAL',o.x,o.y-24)}
 // simple factory-object silhouettes instead of identical squares
 if(o.id==='log'){
   // Wall-mounted clipboard beside EXIT: larger and more readable than other task props.
   ctx.save();
   ctx.fillStyle='#6f7f86';ctx.fillRect(o.x-15,o.y-21,30,42);
   ctx.fillStyle='#f1ead2';ctx.fillRect(o.x-11,o.y-17,22,34);
   ctx.fillStyle='#8999a0';ctx.fillRect(o.x-6,o.y-23,12,7);
   ctx.strokeStyle='#6c7477';ctx.lineWidth=1;
   for(let ly=o.y-10;ly<=o.y+10;ly+=6){ctx.beginPath();ctx.moveTo(o.x-7,ly);ctx.lineTo(o.x+7,ly);ctx.stroke()}
   ctx.fillStyle='#b83e35';ctx.fillRect(o.x-8,o.y+13,16,3);
   ctx.restore();
 }
 else if(o.id==='compressor'){ctx.fillStyle='#46565e';ctx.fillRect(o.x-15,o.y-17,30,34);ctx.fillStyle='#d5b744';ctx.fillRect(o.x-5,o.y-4,10,8);ctx.strokeStyle='#9fb0b7';ctx.strokeRect(o.x-15,o.y-17,30,34)}
 else {ctx.fillStyle=o.id==='wrong'?'#f6e8bc':'#aab7bb';ctx.fillRect(o.x-18,o.y-10,36,20);ctx.fillStyle=o.id==='wrong'?'#7a4b2d':'#563021';ctx.fillRect(o.x-14,o.y-6,28,12);ctx.fillStyle='#edf1e7';ctx.fillRect(o.x+8,o.y-12,13,9)}
 ctx.textAlign='left';if(near(o,72)){ctx.fillStyle='#101820e8';ctx.fillRect(o.x-82,o.y-54,164,24);ctx.fillStyle='#fff';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText('E / CLICK — '+o.label,o.x,o.y-38)}ctx.restore()}
 for(const n of notes){
  // No visible floor marker: the old white squares looked like task/interact icons.
  if(Math.hypot(player.x-n.x,player.y-n.y)<45){
    ctx.fillStyle='#101820cc';ctx.fillRect(350,635,580,42);
    ctx.fillStyle='white';ctx.fillText(n.t,365,660);
  }
}
 // spilled truffle cases + assigned shelf markers
 for(const b of truffleBoxes){
   if(!b.stored && player.carryingBox!==b){
     ctx.save();ctx.translate(b.x,b.y);ctx.rotate((b.id==='truffleB'?.18:-.12));
     ctx.fillStyle='#c9a06b';ctx.fillRect(-18,-13,36,26);ctx.strokeStyle='#6c4b2f';ctx.strokeRect(-18,-13,36,26);
     ctx.fillStyle='#4b2b20';ctx.fillRect(-12,-7,24,9);ctx.fillStyle='#fff';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText(b.code,0,10);ctx.restore();
     if(Math.hypot(player.x-b.x,player.y-b.y)<60){ctx.fillStyle='#101820e8';ctx.fillRect(b.x-105,b.y-55,210,26);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 11px Arial';ctx.fillText('E — PICK UP '+b.code,b.x,b.y-38);ctx.textAlign='left';}
   }
   if(!b.stored){
     // Highlight the actual shelf opening rather than a spot on the floor.
     ctx.save();
     ctx.strokeStyle='#f4dc72';ctx.lineWidth=2;ctx.setLineDash([4,3]);
     ctx.strokeRect(b.homeX-13,b.homeY-18,26,36);ctx.setLineDash([]);
     ctx.fillStyle='#f4dc72';ctx.font='bold 8px Arial';ctx.textAlign='center';
     ctx.fillText(b.name||b.code,b.homeX,b.homeY-23);ctx.restore();ctx.textAlign='left';
   } else {
     // Stored case is drawn inside the rack shelf.
     ctx.fillStyle='#c9a06b';ctx.fillRect(b.homeX-11,b.homeY-14,22,28);
     ctx.fillStyle='#4e2c20';ctx.fillRect(b.homeX-8,b.homeY-9,16,12);
     ctx.fillStyle='#f4efe6';ctx.font='bold 6px Arial';ctx.textAlign='center';ctx.fillText(b.code,b.homeX,b.homeY+10);ctx.textAlign='left';
   }
 }
 if(player.carryingBox){ctx.fillStyle='#c9a06b';ctx.fillRect(player.x-18,player.y-35,36,22);ctx.fillStyle='#fff';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText(player.carryingBox.code,player.x,player.y-21);ctx.textAlign='left';}
 // Night Shift lighting structure: ambient darkness, four independent ceiling fixtures in an evenly spaced 2x2 grid, edge vignette.
 const ambientAlpha=Math.max(.52,Math.min(.82,.74-(roomBrightness-1)*.5));
 ctx.fillStyle=`rgba(1,4,10,${ambientAlpha})`;ctx.fillRect(0,0,W,H);
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let row=0;row<2;row++)for(let col=0;col<2;col++){
  const light=ceilingLights[row*2+col],lightX=(col+.5)*W/2,lightY=(row+.5)*H/2,radius=255;
  let strength=light.base*(.9+Math.sin(elapsed*light.speed+light.phase)*.1)*roomBrightness;
  if(light.flicker>0)strength*=light.flickerLevel;
  if(light.type==='glitch'&&light.glitchTime>0)strength*=(light.on?.72:.06);
  const glow=ctx.createRadialGradient(lightX,lightY,16,lightX,lightY,radius);
  glow.addColorStop(0,`rgba(214,229,236,${.27*strength})`);
  glow.addColorStop(.22,`rgba(184,211,224,${.18*strength})`);
  glow.addColorStop(.64,`rgba(132,175,198,${.07*strength})`);
  glow.addColorStop(1,'rgba(112,158,184,0)');
  ctx.fillStyle=glow;ctx.fillRect(lightX-radius,lightY-radius,radius*2,radius*2);
 }
 ctx.restore();


 // The Freezer Shadow: intentionally vague. It is easiest to perceive when caught by the flashlight.
 if(freezerShadow.active){
   ctx.save();
   const lit=shadowInFlashlight();
   ctx.globalAlpha=lit?.98:(freezerShadow.revealed?.52:.34);
   ctx.fillStyle=lit?'rgba(30,34,36,.98)':'rgba(20,25,28,.96)';
   ctx.beginPath();ctx.ellipse(freezerShadow.x,freezerShadow.y-13,8,9,0,0,Math.PI*2);ctx.fill();
   ctx.beginPath();
   ctx.moveTo(freezerShadow.x-9,freezerShadow.y-5);
   ctx.quadraticCurveTo(freezerShadow.x-13,freezerShadow.y+13,freezerShadow.x-8,freezerShadow.y+27);
   ctx.lineTo(freezerShadow.x+8,freezerShadow.y+27);
   ctx.quadraticCurveTo(freezerShadow.x+13,freezerShadow.y+13,freezerShadow.x+9,freezerShadow.y-5);
   ctx.closePath();ctx.fill();
   ctx.strokeStyle=lit?'rgba(206,232,236,.78)':'rgba(164,195,202,.38)';
   ctx.lineWidth=lit?2:1.2;
   ctx.beginPath();ctx.ellipse(freezerShadow.x,freezerShadow.y-13,8,9,0,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();
   ctx.moveTo(freezerShadow.x-9,freezerShadow.y-5);
   ctx.quadraticCurveTo(freezerShadow.x-13,freezerShadow.y+13,freezerShadow.x-8,freezerShadow.y+27);
   ctx.lineTo(freezerShadow.x+8,freezerShadow.y+27);
   ctx.quadraticCurveTo(freezerShadow.x+13,freezerShadow.y+13,freezerShadow.x+9,freezerShadow.y-5);
   ctx.closePath();ctx.stroke();
   if(lit){
     ctx.globalCompositeOperation='screen';
     const sg=ctx.createRadialGradient(freezerShadow.x,freezerShadow.y,4,freezerShadow.x,freezerShadow.y,32);
     sg.addColorStop(0,'rgba(205,230,232,.12)');sg.addColorStop(1,'rgba(205,230,232,0)');
     ctx.fillStyle=sg;ctx.beginPath();ctx.arc(freezerShadow.x,freezerShadow.y,32,0,Math.PI*2);ctx.fill();
   }
   ctx.restore();
 }
 // Flashlight: additive illumination only. It never lays a dark cone over the room.
 if(player.flashlightOn&&player.battery>0){
   const ang=Math.atan2(mouse.y-player.y,mouse.x-player.x);
   const batteryPower=.55+.45*(player.battery/100);
   const beamLen=330+90*(player.battery/100);
   const half=.43;
   ctx.save();
   ctx.globalCompositeOperation='screen';
   ctx.beginPath();
   ctx.moveTo(player.x,player.y);
   ctx.arc(player.x,player.y,beamLen,ang-half,ang+half);
   ctx.closePath();
   ctx.clip();
   const fg=ctx.createRadialGradient(player.x,player.y,18,player.x,player.y,beamLen);
   fg.addColorStop(0,`rgba(255,248,220,${.40*batteryPower})`);
   fg.addColorStop(.28,`rgba(244,246,224,${.30*batteryPower})`);
   fg.addColorStop(.70,`rgba(220,236,232,${.15*batteryPower})`);
   fg.addColorStop(1,'rgba(220,236,232,0)');
   ctx.fillStyle=fg;
   ctx.fillRect(player.x-beamLen,player.y-beamLen,beamLen*2,beamLen*2);
   ctx.restore();

   // Small spill around Chris makes nearby labels and shelf details readable.
   ctx.save();ctx.globalCompositeOperation='screen';
   const sg=ctx.createRadialGradient(player.x,player.y,4,player.x,player.y,72);
   sg.addColorStop(0,`rgba(255,245,215,${.26*batteryPower})`);
   sg.addColorStop(1,'rgba(255,245,215,0)');
   ctx.fillStyle=sg;ctx.beginPath();ctx.arc(player.x,player.y,72,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 const edgeAlpha=Math.max(.80,Math.min(.985,.955-(roomBrightness-1)*.22));
 const vignette=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,Math.max(W,H)*.72);
 vignette.addColorStop(0,'rgba(0,0,0,0)');
 vignette.addColorStop(.43,'rgba(1,4,9,.18)');
 vignette.addColorStop(1,`rgba(0,2,7,${edgeAlpha})`);
 ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);

 // Flashlight-reactive interaction glow is drawn AFTER darkness/lighting so it remains visible.
 for(const o of interactables){
   const completed =
     (o.id==='log'&&tasks.log) ||
     (o.id==='compressor'&&tasks.compressor) ||
     (o.id==='listedTray'&&trayInspected) ||
     (o.id==='realTray'&&tasks.tray);
   if(completed)continue;
   drawTaskGlow(o.x,o.y,o.id==='compressor'?48:38);
 }
 for(const b of truffleBoxes){
   if(!b.stored&&player.carryingBox!==b)drawTaskGlow(b.x,b.y,38);
   if(player.carryingBox===b)drawTaskGlow(b.homeX,b.homeY,44);
 }

 // Subtle floor-contact shadow keeps Chris visually grounded.
 ctx.save();
 ctx.fillStyle='rgba(0,0,0,.24)';
 ctx.beginPath();
 ctx.ellipse(player.x,player.y+18,12,4.5,0,0,Math.PI*2);
 ctx.fill();
 ctx.restore();

 // Chris uses the uploaded Night Shift directional sprite set and remains readable above room darkness.
 ctx.save();ctx.globalAlpha=1;
 let frames=chrisSprites[player.direction]||chrisSprites.down;
 let sprite=player.moving?frames[Math.floor(elapsed*8)%frames.length]:(player.direction==='down'?chrisSprites.idle:frames[0]);
 let pw=31,ph=45;
 // Forward/down artwork is naturally larger than the side/away sets, so scale it down 15%.
 if(player.direction==='down'){pw*=.85;ph*=.85;}
 if(sprite&&sprite.complete&&sprite.naturalWidth)ctx.drawImage(sprite,player.x-pw/2,player.y-ph/2,pw,ph);
 else{ctx.fillStyle='#e5c7a1';ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,7);ctx.fill();}
 ctx.restore();

 // Physically carry the Sea Salt Truffles tray once it has been picked up.
 if(player.hasTray){
   ctx.save();
   const ty=player.y+4;
   ctx.fillStyle='#aeb9bc';
   ctx.fillRect(player.x-16,ty-5,32,11);
   ctx.strokeStyle='#e7eef0';ctx.lineWidth=1.2;ctx.strokeRect(player.x-16,ty-5,32,11);
   ctx.fillStyle='#573223';
   for(let i=-11;i<=11;i+=7){
     ctx.beginPath();ctx.arc(player.x+i,ty,2.7,0,Math.PI*2);ctx.fill();
   }
   ctx.fillStyle='#f2e6c9';ctx.fillRect(player.x+7,ty-9,11,5);
   ctx.restore();
 }
 ctx.fillStyle='#ffffff';ctx.font='bold 13px Arial';
 if(announcement>0){
   if(state==='intro'){
     const boxW=660,boxH=126,boxX=(W-boxW)/2,boxY=(H-boxH)/2-42;
     ctx.save();
     ctx.fillStyle='rgba(9,18,24,.94)';
     ctx.fillRect(boxX,boxY,boxW,boxH);
     ctx.strokeStyle='#f0d765';ctx.lineWidth=3;ctx.strokeRect(boxX,boxY,boxW,boxH);
     ctx.fillStyle='#f0d765';ctx.font='bold 11px Arial';ctx.textAlign='center';
     ctx.fillText('THE WALK-IN',W/2,boxY+23);
     ctx.fillStyle='#fff';ctx.font='bold 18px Arial';
     const words=msg.text.split(' '),lines=[];let line='';
     for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>boxW-60&&line){lines.push(line);line=word}else line=test}
     if(line)lines.push(line);
     const lineH=21,dialogCenterY=boxY+70,startY=dialogCenterY-((lines.length-1)*lineH/2);
     lines.slice(0,3).forEach((ln,i)=>ctx.fillText(ln,W/2,startY+i*lineH));
     ctx.fillStyle='#aebdc3';ctx.font='11px Arial';
     ctx.fillText('CLICK · SPACEBAR · ENTER TO CONTINUE',W/2,boxY+114);
     ctx.restore();
   }else{
     ctx.fillStyle='#101820dd';ctx.fillRect(330,30,620,38);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(msg.text,640,54);ctx.textAlign='left';
   }
 }
 drawShiftClock();
 taskList();hud.textContent=`INTEGRITY ${Math.max(0,player.integrity|0)}% | TIME ${fmt(elapsed)} | FLASHLIGHT ${player.battery|0}% | STAMINA ${player.stamina|0}%   —   OBJECTIVE: ${objective()}`;
}
function loop(t){let dt=Math.min(.033,(t-last)/1000);last=t;update(dt);draw();requestAnimationFrame(loop)}
addEventListener('keydown',e=>{
 keys[e.key]=true;keys[e.key.toLowerCase()]=true;
 if(state==='intro'&&(e.key===' '||e.key==='Enter')){e.preventDefault();advanceIntro();return;}
 if(e.key.toLowerCase()==='e')use();
 if(e.key==='Escape')togglePause();
 if(e.key==='Tab'){e.preventDefault();taskExpanded=true;taskList();}
 if(e.key.toLowerCase()==='f'&&state==='play'){player.flashlightOn=!player.flashlightOn;msg(player.flashlightOn?'FLASHLIGHT ON':'FLASHLIGHT OFF');}
});
addEventListener('keyup',e=>{
 keys[e.key]=false;keys[e.key.toLowerCase()]=false;
 if(e.key==='Tab'){e.preventDefault();taskExpanded=false;taskList();}
});canvas.addEventListener('mousemove',e=>{let r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)*canvas.width/r.width;mouse.y=(e.clientY-r.top)*canvas.height/r.height});canvas.addEventListener('click',()=>{if(state==='intro')advanceIntro();else use();});
function togglePause(){if(state!=='play')return;paused=!paused;if(paused){card.innerHTML=`<h1>PAUSED</h1><p>Factory time has been temporarily suspended. Quality Control has not approved this.</p><button onclick='togglePause()'>RESUME</button><button onclick='music=!music'>MUSIC TOGGLE</button><button onclick='sfx=!sfx'>SFX TOGGLE</button>`;overlay.classList.add('show')}else overlay.classList.remove('show')};let music=true,sfx=true;document.querySelector('#pauseBtn').onclick=togglePause;
document.querySelector('#tasksBtn').onclick=()=>{taskExpanded=!taskExpanded;taskList()};
startScreen();requestAnimationFrame(loop);
