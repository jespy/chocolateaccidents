(function(){
  'use strict';
  const S=window.GameState;
  let scene,camera,renderer,clock,raycaster,locked=false,modal=false,current=null,previousCurrent=null,suppressPause=false,resumeOnEscapeRelease=false;
  const keys={},interactables=[],blockers=[];let yaw=Math.PI,pitch=0,activeExamine=null;const examineStack=[];
  const $=id=>document.getElementById(id);
  const screens=['intro','pause','examine','terminal','choice','ending','journal'];
  const roomNames={living:'LIVING ROOM',office:'OFFICE',kitchen:'KITCHEN',bedroom:'BEDROOM'};

  window.UI={
    refresh(){
      $('inventory-list').textContent=[...S.inventory].join(' · ')||'Empty';
      $('evidence-count').textContent=`${S.evidence.size}/10 EVIDENCE`;
      const f=S.flags;let o='Examine Arthur.';
      if(f.key&&!f.box)o='Use the silver key on the wooden box.';
      else if(f.box&&!f.tapePlayed)o='Play the cassette in the office.';
      else if(f.tapePlayed&&(!f.computer||!f.safe))o='Use 1987 on the computer and wall safe.';
      else if(f.computer&&f.safe&&!f.weapon)o='Search the kitchen for the murder weapon.';
      else if(f.weapon&&!f.doorOpen)o='Use the screwdriver on the back door.';
      else if(f.doorOpen)o='Decide what to do—and whom to accuse.';
      $('objective').textContent=o;
    },
    toast(text){const p=$('prompt');p.textContent=text;p.classList.remove('hidden');setTimeout(()=>{if(!current)p.classList.add('hidden')},1300)}
  };
  function show(id){screens.forEach(s=>$(s).classList.toggle('active',s===id));modal=!!id;if(id&&locked){document.exitPointerLock();locked=false}}
  function closeAll(captureMouse=true){screens.forEach(s=>$(s).classList.remove('active'));modal=false;suppressPause=true;if(captureMouse)renderer.domElement.requestPointerLock()}
  function renderExamine(data){$('examine-title').textContent=data.title;$('examine-type').textContent=data.type;$('examine-copy').innerHTML=data.copy;const a=$('examine-actions');a.innerHTML='';data.actions.forEach(x=>{const b=document.createElement('button');b.textContent=x.label;b.onclick=x.run;a.appendChild(b)});$('examine-close').textContent=examineStack.length?'Back · E / Esc':'Close · E / Esc'}
  function examine(title,copy,actions=[],type='EXAMINE'){if($('examine').classList.contains('active')&&activeExamine)examineStack.push(activeExamine);else examineStack.length=0;activeExamine={title,copy,actions,type};renderExamine(activeExamine);show('examine')}
  function backExamine(fromEscape=false){if(examineStack.length){activeExamine=examineStack.pop();renderExamine(activeExamine);show('examine')}else{activeExamine=null;closeAll(!fromEscape);if(fromEscape)resumeOnEscapeRelease=true}}
  function evidence(id){S.addEvidence(id)}
  function obj(name,room,x,z,color,interaction,scale=[1,1,1],y=.5){const g=new THREE.BoxGeometry(...scale),m=new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.05,emissive:0x000000});const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.userData={name,room,interaction};scene.add(mesh);interactables.push(mesh);GameVisuals.decorate(mesh,name);return mesh}
  function wall(x,z,w,d){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,2.8,d),new THREE.MeshStandardMaterial({color:0x41443f,roughness:.92}));mesh.position.set(x,1.4,z);scene.add(mesh);blockers.push({x,z,hx:w/2+.35,hz:d/2+.35});return mesh}
  function floor(x,z,w,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,.1,d),new THREE.MeshStandardMaterial({color,roughness:1}));m.position.set(x,-.07,z);scene.add(m)}
  function doorwayLight(x,z,color=0xd8bd82){const glow=new THREE.PointLight(color,1.65,7,1.6);glow.position.set(x,2.25,z);scene.add(glow)}
  function buildWorld(){
    scene=new THREE.Scene();scene.background=new THREE.Color(0x161a18);scene.fog=new THREE.FogExp2(0x161a18,.018);
    camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,70);camera.rotation.order='YXZ';camera.position.set(-3.25,1.3,-10.55);camera.rotation.set(0,yaw,0);
    renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;$('renderer').appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xc4d0c9,0x2d2922,1.05));
    scene.add(new THREE.AmbientLight(0x6c756f,.62));
    const lamp=new THREE.PointLight(0xffc980,2.7,14);lamp.position.set(-3,2.35,0);lamp.castShadow=true;scene.add(lamp);
    const cold=new THREE.PointLight(0xa9d0da,2.1,13);cold.position.set(5,2.25,-1);scene.add(cold);
    const kitchenLight=new THREE.PointLight(0xffe6a8,2.2,13);kitchenLight.position.set(1,2.3,-8);scene.add(kitchenLight);
    const flashlight=new THREE.SpotLight(0xfff1d0,2.4,13,Math.PI/5,.58,1.1);flashlight.position.set(0,0,0);flashlight.target.position.set(0,-.08,-1);camera.add(flashlight,flashlight.target);scene.add(camera);
    // Exactly three contiguous rooms: living west, office east, kitchen north.
    floor(-3,0,8,8,0x211f1b);floor(5,0,8,8,0x181b1b);floor(1,-8,8,8,0x252723);
    wall(-7,0,.3,8);wall(9,0,.3,8);wall(1,4,16,.3);wall(-3,-4,8,.3);wall(5,-4,2.6,.3);wall(8.1,-4,1.8,.3);
    wall(-3,-12,8,.3);wall(5,-12,8,.3);wall(-7,-8,.3,8);wall(9,-8,.3,8);wall(1,-4,.3,2.5);wall(1,-9.1,.3,5.8);
    wall(1,0,.3,2.4);wall(1,3.1,.3,1.8);
    doorwayLight(1,1.7,0x9fc4c2,Math.PI/2);doorwayLight(6.75,-4,0xd7be84,0);
    GameVisuals.buildEnvironment(scene);
    // Living room
    obj('Arthur Hale','living',-4.2,-1.4,0x3d382f,()=>{if(!S.flags.key){S.flags.key=true;S.addItem('Small Silver Key');examine('Arthur Hale',`<p>The elderly man lies beside the hearth. No pulse. A dark wound marks his temple. In his clenched hand: a small silver key.</p><blockquote>Why can’t I remember coming here?</blockquote>`);UI.refresh()}else examine('Arthur Hale','<p>Arthur Hale. Your uncle. The head wound is narrow and heavy—consistent with a blunt metal object.</p>')},[.65,.35,1.8],.22);
    obj('Coffee Table','living',-3,1,0x493a2c,()=>examine('Coffee Table','<p>Three things demand attention.</p>',[
      {label:'READ THE NEW WILL',run(){evidence('will');examine('Last Will of Arthur Hale','<blockquote>All residual assets pass to the Hale-Voss Medical Research Trust, administered by Dr. Lena Voss.</blockquote><p>Signed three days ago. The signature looks unsteady.</p>')}},
      {label:'EXAMINE WHISKEY GLASS',run(){evidence('whiskey');examine('Whiskey Glass','<p>A chalky sediment coats the bottom. The medicinal smell turns your stomach. A flash: Lena handing you a drink. Then darkness.</p>')}},
      {label:'EXAMINE BROKEN FRAME',run(){evidence('frame');examine('Broken Picture Frame','<p>Arthur and Elena, smiling years ago. The glass is smashed, but there is no blood on it. An argument, not the weapon.</p>')}}
    ]),[2,.35,1.1],.3);
    obj('Family Portrait','living',-6.8,1.2,0x725c3f,()=>examine('The Hale Family','<p>Arthur stands behind his daughter Elena and his nephew Marcus—you. A brass plaque reads: <em>Summer, 1987.</em></p><p>The year feels important.</p>'),[.12,1.6,2],1.5);
    const wallPhone=obj('Landline Phone','living',.82,.15,0x161817,()=>{evidence('voicemail');examine('Voicemail — 9:41 PM',`<blockquote>Dad, I’m sorry I shouted. I’m back at my apartment. I know Dr. Voss has been pressuring you. Don’t sign anything else. Call me.</blockquote><p>Elena sounds angry—and frightened.</p>`,[],'PLAYBACK')},[.5,.55,.35],1.55);wallPhone.rotation.y=Math.PI/2;
    const woodenBox=obj('Locked Wooden Box','living',-5.35,3.48,0x5b4027,()=>{if(!S.has('Small Silver Key'))return examine('Wooden Box','<p>The lock is small and silver. You need a key.</p>');if(!S.flags.box){S.flags.box=true;S.addItem('Cassette Tape');examine('Inside the Box','<p>A cassette labeled <em>FOR MARCUS</em>, and a torn journal page.</p><blockquote>Lena asked again about the policy. She says Elena is unstable. I told her I intend to undo it all. If anything happens, 1987 opens what matters.</blockquote>');evidence('journal');UI.refresh()}else examine('Empty Wooden Box','<p>You took the cassette. The torn page is safe in your evidence record.</p>')},[1,.55,.65],.28);woodenBox.rotation.y=0;
    // Office
    obj('Computer','office',4.5,3.08,0x182627,()=>{if(S.flags.computer)return examine('Arthur’s Computer','<p>The insurance email is already copied into your evidence.</p>');show('terminal');$('terminal-output').textContent='ENTER FOUR-DIGIT PASSWORD';$('terminal-input').value='';setTimeout(()=>$('terminal-input').focus(),50)},[1.15,1.2,.95],1.08);
    obj('Tape Recorder','office',6.8,3.18,0x232525,()=>{if(!S.has('Cassette Tape'))return examine('Tape Recorder','<p>The deck is empty.</p>');S.flags.tapePlayed=true;examine('Arthur’s Recording',`<blockquote>Marcus—if you’re hearing this, I failed. Lena changed the policy while I was ill. The password and safe combination are the year of the family portrait: 1987. Trust records, not tempers.</blockquote>`,[],'CASSETTE PLAYBACK');UI.refresh()},[.8,.3,.5],.78);
    obj('Wall Safe','office',8.75,-2.3,0x2a2e2d,()=>{if(S.flags.safe)return examine('Open Safe','<p>Arthur’s unsigned codicil remains inside.</p>');if(!S.flags.tapePlayed)return examine('Wall Safe','<p>A four-digit combination lock. Guessing feels dangerous.</p>');examine('Wall Safe','<p>Enter the combination.</p>',[{label:'1 · 9 · 8 · 7',run(){S.flags.safe=true;evidence('safe');examine('Unsigned Codicil',`<blockquote>I revoke all benefit granted to Dr. Lena Voss and restore Elena Hale as beneficiary.</blockquote><p>Dated tonight. Arthur died before he could sign it.</p>`);UI.refresh()}},{label:'CANCEL',run(){closeAll()}}])},[.2,1.1,1.1],1.25);
    const files=obj('Filing Cabinet','office',8.3,-.55,0x343a38,()=>examine('Medical Files','<p>Invoices from Dr. Lena Voss. House visits grew more frequent after Arthur changed his life insurance.</p>'),[.75,1.4,.75],.7);files.rotation.y=Math.PI/2;
    obj('Calendar','office',6.8,3.72,0xaaa28c,()=>examine('Desk Calendar','<p>Tonight is circled: <em>“Lena — policy / medication. Elena 8 PM.”</em> A later note says: <em>“Marcus, 9:30. Tell him everything.”</em></p>'),[.7,.84,.08],1.68);
    // Kitchen
    obj('Tea Tray','bedroom',-1.45,-10.9,0x726a58,()=>examine('Tea Tray','<p>Two cups. One smells faintly medicinal. Arthur expected company; the tray was prepared before the violence.</p>'),[1,.18,.65],.58);
    obj('Prescription Bottle','bedroom',-5.05,-10.9,0xc08b36,()=>{evidence('prescription');examine('Prescription Bottle','<p><strong>ARTHUR HALE — CLONAZEPAM</strong><br>Prescriber: Dr. Lena Voss.</p><p>The bottle was filled yesterday. Nearly half the tablets are gone. The dose would cause confusion, weakness, and memory loss.</p>')},[.12,.25,.12],.68);
    const fridge=obj('Refrigerator','kitchen',2.75,-11.22,0xc5c5ba,()=>{evidence('receipt');examine('Takeout Receipt','<p>Magneted to the door: Thai takeout, paid by Elena Hale at 9:18 PM. The restaurant is across town. It supports the voicemail’s timeline.</p>')},[1.5,2.4,1.2],1.2);fridge.rotation.y=Math.PI;
    const pantry=obj('Pantry','kitchen',8.52,-10.05,0x4a3729,()=>{if(!S.flags.weapon){S.flags.weapon=true;S.addItem('Screwdriver');evidence('weapon');examine('Hidden in the Pantry','<p>A bloody brass candlestick wrapped in a dish towel. A torn fragment of blue nitrile glove is caught beneath its base. Beside it: a flathead screwdriver.</p><p>Lena wore blue medical gloves during her visit.</p>');UI.refresh()}else examine('Pantry','<p>The murder weapon’s location and glove fragment are recorded.</p>')},[1.3,2.1,.65],1.05);pantry.rotation.y=Math.PI/2;
    const openBackDoor=()=>{if(!S.has('Screwdriver'))return examine('Boarded Back Door','<p>Two boards are screwed across it. You need a tool.</p>');S.flags.doorOpen=true;UI.refresh();beginChoice()};
    obj('Boarded Back Door','kitchen',4.8,-11.85,0x4b3528,openBackDoor,[1.7,2.6,.18],1.3);
    const board1=obj('Boards','kitchen',4.8,-11.62,0x725234,openBackDoor,[2.2,.25,.15],1.65);board1.rotation.z=.18;
  }
  function beginChoice(){const high=S.knowsTruth();$('choice-summary').innerHTML=high?'You have enough evidence to prove Lena killed Arthur—but the house is unsecured.':'Pieces are still missing. Leaving now may let the killer shape the story.';const a=$('choice-actions');a.innerHTML='';const choices=[
    ['LEAVE NOW',()=>finish(high?'late':'wrong')],
    ['SECURE THE EVIDENCE, THEN LEAVE',()=>finish(high?'full':'wrong')],
    ['MAKE AN ACCUSATION',accusation]
  ];choices.forEach(([t,f])=>{const b=document.createElement('button');b.textContent=t;b.onclick=f;a.appendChild(b)});show('choice')}
  function accusation(){const a=$('choice-actions');a.innerHTML='';[['ACCUSE ELENA HALE','wrong'],['ACCUSE DR. LENA VOSS',S.knowsTruth()?'full':'wrong'],['ACCUSE MARCUS HALE','wrong']].forEach(([t,e])=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>finish(e);a.appendChild(b)})}
  function finish(kind){const endings={
    wrong:['ENDING I · WRONG ACCUSATION','The Wrong Story','You leave with fragments and certainty where there should have been doubt. The police follow your accusation. By morning, Dr. Lena Voss has disappeared—and so have Arthur’s insurance files. The truth survives only as a suspicion no one can prove.'],
    late:['ENDING II · HIGH KNOWLEDGE','The Truth, Too Late','You run into the rain with the killer’s name and the shape of her plan. When police return, the pantry is empty, the computer wiped, the unsigned codicil gone. They believe you—but belief is not evidence. Lena collects the policy and vanishes.'],
    full:['ENDING III · COMPLETE TRUTH','Full Circle','You photograph every document, seal the candlestick and glove fragment, and call the police from Arthur’s landline. Dr. Lena Voss is arrested before dawn. Elena is cleared. Your memory returns in pieces: Lena drugged your whiskey when you arrived early and killed Arthur when he tried to expose her. The inheritance was never the house. It was the truth Arthur trusted you to preserve.']};
    const e=endings[kind];$('ending-kicker').textContent=e[0];$('ending-title').textContent=e[1];$('ending-copy').innerHTML=`<p>${e[2]}</p><p>Evidence recovered: ${S.evidence.size}/10</p>`;show('ending')
  }
  function init(){buildWorld();clock=new THREE.Clock();raycaster=new THREE.Raycaster();raycaster.far=3.1;bind();UI.refresh();animate()}
  function bind(){
    $('begin').onclick=()=>{AudioFX.init();closeAll()};$('resume').onclick=()=>closeAll();$('exit-game').onclick=()=>{if(window.self!==window.top)window.parent.postMessage({type:'arcade-game-exit',game:'the-inheritance'},'*');else location.reload()};$('examine-close').onclick=()=>backExamine(false);$('journal-close').onclick=()=>closeAll();$('terminal-close').onclick=()=>closeAll();$('restart').onclick=()=>location.reload();
    $('terminal-submit').onclick=()=>{if($('terminal-input').value==='1987'){S.flags.computer=true;evidence('computer');examine('Insurance Correspondence',`<blockquote>Lena—The beneficiary amendment is processed. Upon Arthur Hale’s death, $2,000,000 is payable to the Hale-Voss Trust under your control.</blockquote><p>A reply from Lena: <em>“He won’t reconsider. I’ll handle tonight.”</em></p>`);UI.refresh()}else{$('terminal-output').textContent='ACCESS DENIED'}};
    $('terminal-input').onkeydown=e=>{if(e.key==='Enter')$('terminal-submit').click()};
    renderer.domElement.addEventListener('click',()=>{if(modal)return;if(locked&&current)current.userData.interaction();else renderer.domElement.requestPointerLock()});
    document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===renderer.domElement;if(locked){suppressPause=false;return}if(suppressPause)return;if(!modal&&!$('intro').classList.contains('active'))show('pause')});
    // Browsers may reject pointer-lock requests made from Escape. While a resume
    // is pending, ordinary mouse deltas keep camera-look responsive until click recaptures it.
    document.addEventListener('mousemove',e=>{if(modal||$('intro').classList.contains('active'))return;if(!locked&&!suppressPause)return;yaw-=e.movementX*.0022;pitch-=e.movementY*.0022;pitch=Math.max(-1.45,Math.min(1.45,pitch));camera.rotation.set(pitch,yaw,0)});
    addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Escape'){if($('examine').classList.contains('active')){e.preventDefault();e.stopPropagation();backExamine(true);return}if($('terminal').classList.contains('active')){e.preventDefault();e.stopPropagation();closeAll(false);resumeOnEscapeRelease=true;return}if($('pause').classList.contains('active')){e.preventDefault();e.stopPropagation();closeAll(false);resumeOnEscapeRelease=true;return}}if(e.code==='KeyE'){if($('examine').classList.contains('active'))backExamine(false);else if(locked&&current)current.userData.interaction()}if(e.code==='KeyI'){if($('journal').classList.contains('active'))closeAll();else{renderJournal();show('journal')}}});addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='Escape'&&resumeOnEscapeRelease){e.preventDefault();resumeOnEscapeRelease=false;suppressPause=true;renderer.domElement.requestPointerLock()}});addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)})
  }
  function renderJournal(){const j=$('journal-list');j.innerHTML='';Object.entries(S.catalog).forEach(([id,[name,desc]])=>{const has=S.evidence.has(id),d=document.createElement('div');d.className='evidence'+(has?'':' locked');d.innerHTML=`<strong>${has?name:'UNKNOWN EVIDENCE'}</strong>${has?desc:'Keep searching.'}`;j.appendChild(d)})}
  function canMove(x,z){return !blockers.some(b=>Math.abs(x-b.x)<b.hx&&Math.abs(z-b.z)<b.hz)&&x>-6.55&&x<8.55&&z>-11.55&&z<3.55}
  function room(){const x=camera.position.x,z=camera.position.z;if(z<-4)return x<1?'bedroom':'kitchen';return x>1?'office':'living'}
  function highlightObject(target,on){if(!target?.material?.emissive)return;target.material.emissive.setHex(on?0x8a6f32:0x000000);target.material.emissiveIntensity=on ? .68 : 0;target.material.opacity=on ? .28 : .13}
  function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(!modal&&!$('intro').classList.contains('active')){const speed=(keys.ShiftLeft||keys.ShiftRight)?4.4:2.5;let forward=0,strafe=0;if(keys.KeyW)forward+=1;if(keys.KeyS)forward-=1;if(keys.KeyA)strafe-=1;if(keys.KeyD)strafe+=1;const len=Math.hypot(forward,strafe)||1;forward/=len;strafe/=len;const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*strafe)*speed*dt,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*strafe)*speed*dt;const nx=camera.position.x+dx,nz=camera.position.z+dz;if(canMove(nx,camera.position.z))camera.position.x=nx;if(canMove(camera.position.x,nz))camera.position.z=nz;raycaster.setFromCamera({x:0,y:0},camera);const hits=raycaster.intersectObjects(interactables,false);current=hits[0]?.object||null;if(previousCurrent!==current){highlightObject(previousCurrent,false);highlightObject(current,true);previousCurrent=current}const p=$('prompt');if(current){p.textContent=`E / CLICK · ${current.userData.name.toUpperCase()}`;p.classList.remove('hidden')}else p.classList.add('hidden');$('room-label').textContent=roomNames[room()]}
    GameVisuals.animate(scene,performance.now()/1000);renderer.render(scene,camera)}
  init();
})();
