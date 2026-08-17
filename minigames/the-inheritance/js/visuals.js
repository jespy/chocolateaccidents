/* Visual system: procedural textures and low-poly set dressing. No external assets. */
(function(){
  const V={m:{}};
  const mat=(color,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
  const box=(parent,x,y,z,w,h,d,material,rot=0)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.rotation.y=rot;o.castShadow=o.receiveShadow=true;parent.add(o);return o};
  const cyl=(parent,x,y,z,rt,rb,h,material,segments=10)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o};
  const sphere=(parent,x,y,z,r,material)=>{const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),material);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o};
  function canvasTexture(kind,a,b){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=a;g.fillRect(0,0,256,256);
    if(kind==='wallpaper'){g.fillStyle=b;g.globalAlpha=.32;for(let y=0;y<256;y+=32)for(let x=0;x<256;x+=32){g.beginPath();g.moveTo(x+16,y+3);g.lineTo(x+27,y+16);g.lineTo(x+16,y+29);g.lineTo(x+5,y+16);g.closePath();g.stroke();g.beginPath();g.arc(x+16,y+16,4,0,7);g.fill()}}
    if(kind==='rug'){g.strokeStyle=b;g.lineWidth=5;for(let i=9;i<128;i+=16)g.strokeRect(i,i,256-i*2,256-i*2);g.lineWidth=2;g.globalAlpha=.6;for(let x=0;x<256;x+=18){g.beginPath();g.moveTo(x,0);g.lineTo(256-x,256);g.stroke()}}
    if(kind==='tile'){g.strokeStyle=b;g.lineWidth=4;for(let x=0;x<=256;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,256);g.stroke()}for(let y=0;y<=256;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke()}}
    if(kind==='wood'){g.strokeStyle=b;g.globalAlpha=.3;for(let y=4;y<256;y+=10){g.beginPath();g.moveTo(0,y+Math.sin(y)*3);g.bezierCurveTo(70,y-4,180,y+6,256,y);g.stroke()}}
    g.globalAlpha=.09;for(let i=0;i<1800;i++){const q=Math.random()*55+70;g.fillStyle=`rgb(${q},${q},${q})`;g.fillRect(Math.random()*256,Math.random()*256,1,1)}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t
  }
  function init(){
    const woodTex=canvasTexture('wood','#3d261b','#b48250');woodTex.repeat.set(3,2);
    V.m.wood=new THREE.MeshStandardMaterial({map:woodTex,color:0x6a4934,roughness:.78});
    V.m.darkWood=mat(0x2b1a14,.77);V.m.brass=mat(0xa88442,.35,.72);V.m.burgundy=mat(0x542c35,.96);V.m.olive=mat(0x59604b,.94);V.m.cream=mat(0xb5aa8a,.92);V.m.green=mat(0x385448,.6);V.m.paper=mat(0xc9c0a5,.95);V.m.black=mat(0x151918,.68);V.m.blood=mat(0x5b1415,.62);V.m.glass=new THREE.MeshPhysicalMaterial({color:0x8ba5a3,transparent:true,opacity:.38,roughness:.2});
  }
  function lamp(parent,x,z,color=0xffbf6f){const stand=cyl(parent,x,.72,z,.055,.08,1.25,V.m.brass,10);cyl(parent,x,1.39,z,.34,.18,.38,mat(0xc7a36d,.85),12);const light=new THREE.PointLight(color,1.45,6,1.6);light.position.set(x,1.35,z);parent.add(light);return stand}
  function couch(parent){box(parent,-3,.48,2.45,2.5,.72,.7,V.m.burgundy);box(parent,-3,.93,2.7,2.5,.72,.25,V.m.burgundy);box(parent,-4.32,.65,2.45,.25,.65,.78,V.m.darkWood);box(parent,-1.68,.65,2.45,.25,.65,.78,V.m.darkWood);for(const x of[-3.6,-2.4])box(parent,x,.74,2.14,1.05,.18,.56,mat(0x683844,.98));}
  function fireplace(parent){box(parent,-6.82,1.15,-1.1,.22,2.25,2.45,V.m.darkWood);box(parent,-6.65,1.0,-1.1,.16,1.25,1.35,mat(0x161211,.9));box(parent,-6.53,.46,-1.1,.1,.2,1.05,mat(0xb35529,.75));for(let i=0;i<5;i++){const l=new THREE.PointLight(i%2?0xe45a25:0xffa23d,.28,3);l.position.set(-6.3,.55,-1.45+i*.18);parent.add(l)}}
  function bookcase(parent,x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;box(g,0,1.25,0,1.65,2.5,.35,V.m.darkWood);for(let y=.35;y<2.3;y+=.58){box(g,0,y,-.22,1.5,.08,.5,V.m.wood);for(let i=0;i<7;i++)box(g,-.62+i*.2,y+.24,-.43,.13,.38+((i*3)%4)*.04,.16,mat([0x59353a,0x455044,0x7a5c39,0x343c48][i%4],.9))}parent.add(g)}
  function doorFrame(parent,x,z,rot=0,color=0x8a6e3f){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;box(g,-.88,1.35,0,.16,2.7,.22,V.m.darkWood);box(g,.88,1.35,0,.16,2.7,.22,V.m.darkWood);box(g,0,2.62,0,1.9,.18,.22,V.m.darkWood);const l=new THREE.PointLight(color,1.05,5);l.position.set(0,2.3,.35);g.add(l);parent.add(g)}
  function windowFrame(parent,x,z,w=1.7){box(parent,x,1.65,z,w,1.25,.04,mat(0x17262a,.28));box(parent,x,1.65,z-.03,.06,1.35,.06,V.m.darkWood);box(parent,x,1.65,z-.03,w+.12,.06,.06,V.m.darkWood);box(parent,x,1.02,z-.02,w+.28,.1,.12,V.m.darkWood);const moon=new THREE.PointLight(0x809eb4,.42,4);moon.position.set(x,1.7,z-.4);parent.add(moon)}
  function desk(parent){box(parent,4.5,.77,3.05,2.7,.18,1.15,V.m.wood);for(const x of[3.38,5.62]){box(parent,x,.38,3.05,.42,.75,.94,V.m.darkWood);for(const y of[.2,.44,.68])box(parent,x,y,2.56,.32,.16,.04,V.m.brass)}box(parent,4.5,.12,3.05,2.6,.08,1.05,V.m.darkWood)}
  function endTable(parent,x,z){box(parent,x,.57,z,1.02,.13,.78,V.m.wood);for(const px of[-.4,.4])for(const pz of[-.28,.28])box(parent,x+px,.28,z+pz,.1,.58,.1,V.m.darkWood);box(parent,x,.16,z,.82,.05,.58,V.m.darkWood)}
  function kitchenSet(parent){
    // All cabinetry is rotated onto the Kitchen's right wall instead of crossing into the Bedroom.
    for(const z of[-6.2,-7.45,-8.7]){box(parent,8.48,.52,z,.62,1.02,1.05,V.m.cream);box(parent,8.38,1.08,z,.76,.14,1.2,mat(0x5e675d,.62));box(parent,8.57,2.08,z,.42,.92,1.05,V.m.cream);box(parent,8.32,2.08,z,.04,.06,.13,V.m.brass)}
  }
  function nightstand(parent,x,z){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.PI;box(g,0,.48,0,1.05,.12,.88,V.m.wood);box(g,0,.25,0,.9,.42,.72,V.m.darkWood);box(g,0,.32,-.38,.5,.16,.04,V.m.wood);box(g,0,.32,-.42,.12,.035,.04,V.m.brass);parent.add(g)}
  function bedroomSet(parent){
    const bed=new THREE.Group();bed.position.set(-3.25,0,-9.55);box(bed,0,.38,0,2.55,.45,4.25,V.m.darkWood);box(bed,0,.7,.15,2.42,.42,3.65,mat(0x9b9178,.98));box(bed,0,.96,1.7,2.45,.34,.72,mat(0x68505a,.98));box(bed,0,1.1,-2.0,2.65,1.45,.18,V.m.darkWood);for(const x of[-.65,.65])box(bed,x,.96,-1.45,1.05,.16,.68,V.m.cream);parent.add(bed);
    nightstand(parent,-5.05,-10.9);nightstand(parent,-1.45,-10.9);lamp(parent,-6.1,-10.7,0xffb96b)
  }
  function wallPanels(parent){
    // Wallpaper planes sit slightly inside the structural walls.
    const living=canvasTexture('wallpaper','#61333d','#b58a65');living.repeat.set(5,2);
    const office=canvasTexture('wallpaper','#59604c','#a89a70');office.repeat.set(5,2);
    const lm=new THREE.MeshStandardMaterial({map:living,color:0x9a7475,roughness:1});const om=new THREE.MeshStandardMaterial({map:office,color:0x879078,roughness:1});
    box(parent,-3,1.45,3.79,7.7,2.65,.025,lm);box(parent,-6.84,1.45,0,.025,2.65,7.65,lm);
    box(parent,5,1.45,3.79,7.7,2.65,.025,om);box(parent,8.84,1.45,0,.025,2.65,7.65,om);
    for(let x=-6.4;x<8.5;x+=.8)box(parent,x,.62,3.72,.7,1.04,.08,V.m.darkWood);
  }
  function dust(parent){const n=180,p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=-6.5+Math.random()*15;p[i*3+1]=.2+Math.random()*2.5;p[i*3+2]=-11+Math.random()*14}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p,3));const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xd8c69a,size:.018,transparent:true,opacity:.32}));pts.userData.dust=true;parent.add(pts)}
  V.buildEnvironment=function(scene){if(!V.m.wood)init();const g=new THREE.Group();g.name='HALE_HOUSE_SET';scene.add(g);wallPanels(g);
    box(g,-3,2.83,0,7.8,.08,7.8,mat(0x7f7865,1));box(g,5,2.83,0,7.8,.08,7.8,mat(0x6f735f,1));box(g,-3,2.83,-8,7.8,.08,7.8,mat(0x837969,1));box(g,5,2.83,-8,7.8,.08,7.8,mat(0x9a9278,1));
    // Living room composition
    const rugTex=canvasTexture('rug','#4d2630','#b38b5c');rugTex.repeat.set(1.5,1);const rug=new THREE.Mesh(new THREE.PlaneGeometry(5.6,4.9),new THREE.MeshStandardMaterial({map:rugTex,roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(-3,.015,.25);rug.receiveShadow=true;g.add(rug);couch(g);fireplace(g);lamp(g,-1.45,2.65);box(g,-1.45,.42,2.65,.72,.72,.72,V.m.wood);doorFrame(g,1,1.7,Math.PI/2,0x8eb6b1);windowFrame(g,-4.1,3.64,1.75);
    // Office composition
    desk(g);endTable(g,6.8,3.18);bookcase(g,8.48,1.45,Math.PI/2);lamp(g,7.75,3.15,0x8dc79b);doorFrame(g,6.75,-4,0,0xd8bf82);windowFrame(g,5.25,3.64,1.55);
    // Bedroom floor and furniture occupy the left-hand lower room.
    const bedroomFloor=new THREE.Mesh(new THREE.PlaneGeometry(7.7,7.7),new THREE.MeshStandardMaterial({color:0x46342d,roughness:1}));bedroomFloor.rotation.x=-Math.PI/2;bedroomFloor.position.set(-3,.006,-8);g.add(bedroomFloor);const bedroomRug=new THREE.Mesh(new THREE.PlaneGeometry(5.4,5.9),new THREE.MeshStandardMaterial({color:0x4f2e36,roughness:1}));bedroomRug.rotation.x=-Math.PI/2;bedroomRug.position.set(-3,.012,-8.3);g.add(bedroomRug);bedroomSet(g);
    // Kitchen tiles and fitted cabinetry occupy only the right-hand room.
    const tile=canvasTexture('tile','#60695f','#333b36');tile.repeat.set(4,4);const tf=new THREE.Mesh(new THREE.PlaneGeometry(7.7,7.7),new THREE.MeshStandardMaterial({map:tile,roughness:1}));tf.rotation.x=-Math.PI/2;tf.position.set(5,.005,-8);g.add(tf);kitchenSet(g);
    // Architectural trim across all rooms
    for(const y of[.12,2.68]){box(g,-3,y,3.68,7.7,.12,.1,V.m.darkWood);box(g,5,y,3.68,7.7,.12,.1,V.m.darkWood);box(g,-6.72,y,0,.1,.12,7.4,V.m.darkWood);box(g,8.72,y,-4,.1,.12,15.4,V.m.darkWood)}
    dust(g)
  };
  function paper(parent,x,y,z,w=.42,d=.28,rot=0){const p=box(parent,x,y,z,w,.018,d,V.m.paper,rot);p.castShadow=false;return p}
  function human(mesh){const g=new THREE.Group();g.rotation.y=.25;g.position.set(0,-.22,0);box(g,0,.16,0,.72,.24,1.12,mat(0x303740,.9));sphere(g,0,.28,-.72,.23,mat(0xb89b7b,.92));for(const x of[-.42,.42]){const arm=box(g,x,.14,-.05,.18,.18,.92,mat(0x313641,.9),x>0?.24:-.24);arm.rotation.z=x>0?.12:-.12}for(const x of[-.22,.22])box(g,x,.12,.72,.2,.2,.8,mat(0x24272a,.9),x>0?.18:-.18);box(g,0,.33,-.7,.18,.06,.3,mat(0x725c4a,.95));mesh.add(g)}
  function computer(mesh){const g=new THREE.Group();box(g,0,.29,.14,.72,.55,.18,V.m.cream);const screen=box(g,0,.33,.035,.55,.36,.02,mat(0x183c32,.45));screen.material.emissive=new THREE.Color(0x183c32);screen.material.emissiveIntensity=.7;box(g,0,-.025,.14,.15,.25,.14,V.m.cream);box(g,0,-.17,.14,.4,.06,.3,V.m.cream);box(g,0,-.16,-.32,.75,.08,.32,V.m.cream);mesh.add(g)}
  function phone(mesh){const g=new THREE.Group();box(g,0,0,0,.5,.16,.36,V.m.black);const h=box(g,0,.16,0,.58,.12,.16,V.m.black);h.rotation.z=-.07;cyl(g,-.23,.16,0,.1,.1,.16,V.m.black,10);cyl(g,.23,.16,0,.1,.1,.16,V.m.black,10);mesh.add(g)}
  function bottle(mesh){const g=new THREE.Group();g.scale.setScalar(.62);cyl(g,0,0,0,.09,.1,.36,mat(0xb97422,.5),12);cyl(g,0,.22,0,.11,.11,.08,V.m.cream,12);box(g,0,.02,-.096,.13,.16,.01,V.m.paper);mesh.add(g)}
  function candlestick(mesh){const g=new THREE.Group();cyl(g,0,.05,0,.18,.24,.1,V.m.brass,12);cyl(g,0,.42,0,.055,.09,.72,V.m.brass,12);cyl(g,0,.79,0,.14,.08,.12,V.m.brass,12);const stain=sphere(g,.11,.11,0,.08,V.m.blood);stain.scale.y=.25;mesh.add(g)}
  V.decorate=function(mesh,name){if(!V.m.wood)init();mesh.material.transparent=true;mesh.material.opacity=.13;mesh.material.depthWrite=false;
    switch(name){
      case'Arthur Hale':human(mesh);break;
      case'Coffee Table':box(mesh,0,.1,0,1.95,.18,1.05,V.m.wood);for(const x of[-.78,.78])for(const z of[-.37,.37])box(mesh,x,-.16,z,.11,.55,.11,V.m.darkWood);paper(mesh,-.38,.21,-.05,.62,.38,-.1);cyl(mesh,.34,.27,-.12,.1,.08,.24,V.m.glass,12);break;
      case'Family Portrait':{const portrait=new THREE.Group();portrait.rotation.y=Math.PI/2;box(portrait,0,0,0,2.15,1.7,.1,V.m.brass);box(portrait,0,0,-.07,1.8,1.38,.05,mat(0x50483f,.9));sphere(portrait,-.45,.18,-.11,.22,mat(0xb79a7c));sphere(portrait,.05,.3,-.11,.25,mat(0xa9886d));sphere(portrait,.48,.08,-.11,.2,mat(0xc3a083));mesh.add(portrait);break}
      case'Landline Phone':phone(mesh);break;
      case'Locked Wooden Box':box(mesh,0,0,0,.95,.5,.62,V.m.wood);box(mesh,0,.08,-.32,.12,.18,.05,V.m.brass);break;
      case'Computer':computer(mesh);break;
      case'Tape Recorder':box(mesh,0,0,0,.85,.28,.5,V.m.black);for(const x of[-.23,.23])cyl(mesh,x,.15,-.26,.13,.13,.03,V.m.glass,16);break;
      case'Wall Safe':box(mesh,0,0,0,.24,1.05,1.05,mat(0x333b39,.45,.35));cyl(mesh,-.14,0,-.55,.17,.17,.05,V.m.brass,12);break;
      case'Filing Cabinet':box(mesh,0,0,0,.72,1.36,.7,mat(0x4f5754,.58,.3));for(const y of[-.42,0,.42]){box(mesh,0,y,-.365,.66,.35,.04,mat(0x69716d,.55,.28));box(mesh,0,y,-.41,.2,.04,.05,V.m.brass)}break;
      case'Calendar':{const cal=new THREE.Group();cal.scale.setScalar(.7);box(cal,0,0,0,1.05,1.22,.05,V.m.paper);for(let y=-.35;y<.35;y+=.18)for(let x=-.35;x<.35;x+=.18)box(cal,x,y,-.04,.1,.08,.01,mat(0x8c8879));mesh.add(cal);break}
      case'Tea Tray':box(mesh,0,0,0,1,.05,.64,V.m.brass);for(const x of[-.25,.25]){cyl(mesh,x,.15,0,.11,.09,.24,V.m.cream,12);cyl(mesh,x,.1,0,.17,.17,.03,V.m.cream,12)}break;
      case'Prescription Bottle':bottle(mesh);break;
      case'Refrigerator':{
        box(mesh,0,0,0,1.45,2.35,1.12,V.m.cream);
        // Raised 1980s freezer and refrigerator door faces.
        box(mesh,0,.73,-.585,1.34,.68,.045,mat(0xc7bea0,.86));
        box(mesh,0,-.31,-.585,1.34,1.32,.045,mat(0xbdb394,.88));
        box(mesh,0,.365,-.615,1.34,.035,.055,V.m.darkWood);
        box(mesh,.55,.69,-.64,.055,.42,.055,V.m.brass);
        box(mesh,.55,-.22,-.64,.055,.72,.055,V.m.brass);
        for(const y of[-.89,1.09])box(mesh,-.62,y,-.61,.055,.12,.055,mat(0x777264,.5,.35));
        box(mesh,-.42,.92,-.64,.24,.075,.02,V.m.brass);
        box(mesh,-.25,.02,-.645,.38,.28,.018,V.m.paper,.04);
        break
      }
      case'Pantry':box(mesh,0,0,0,1.25,2.05,.6,V.m.darkWood);for(const x of[-.48,.48])box(mesh,x,0,-.33,.04,1.85,.04,V.m.brass);candlestick(mesh);break;
      case'Boarded Back Door':box(mesh,0,0,0,1.65,2.55,.16,V.m.darkWood);for(let y=-.85;y<1;y+=.55)box(mesh,0,y,-.11,1.35,.06,.04,V.m.wood);break;
      case'Boards':box(mesh,0,0,0,2.15,.2,.12,V.m.wood);break;
    }
  };
  V.animate=function(scene,time){const d=scene.getObjectByName('HALE_HOUSE_SET')?.children.find(x=>x.userData.dust);if(d){d.rotation.y=time*.006;d.position.y=Math.sin(time*.15)*.03}};
  window.GameVisuals=V;
})();
