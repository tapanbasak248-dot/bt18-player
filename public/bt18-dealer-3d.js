/* BT18 procedural 3D dealer stage — browser-rendered, no AI/GPU API */
(function(){
  const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
  const looks={
    "head-and-tail":{skin:0xd99a72,hair:0x21151b,outfit:0x123f78,trim:0xe7bd68,style:"long",name:"AARNA"},
    "dragon-vs-tiger":{skin:0xc98767,hair:0x17131a,outfit:0x7b2034,trim:0xe4b85e,style:"wave",name:"MEHER"},
    "teen-patti":{skin:0xe0a47e,hair:0x302019,outfit:0x174d43,trim:0xd6b36c,style:"bun",name:"KAVYA"},
    "lucky-dice":{skin:0xb9785d,hair:0x19151b,outfit:0x563c83,trim:0xe4c3a0,style:"bob",name:"RIYA"},
    "roulette":{skin:0xe6ae88,hair:0x40251c,outfit:0x8a5427,trim:0xf0cf78,style:"long",name:"SANA"},
    "big-small":{skin:0xc98b69,hair:0x211b25,outfit:0x176078,trim:0xe9c47c,style:"wave",name:"TARA"}
  };
  let THREE,renderer,scene,camera,root,arms=[],raf=0,active=false,slug="";
  const $=id=>document.getElementById(id);
  function loadThree(){return new Promise((resolve,reject)=>{if(window.THREE){THREE=window.THREE;resolve();return}const s=document.createElement("script");s.src=THREE_URL;s.onload=()=>{THREE=window.THREE;resolve()};s.onerror=reject;document.head.appendChild(s)})}
  function mat(color,rough=.72,metal=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal})}
  function ball(parent,x,y,z,sx,sy,sz,material){const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m}
  function limb(parent,a,b,r1,r2,material){const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),16),material);m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(m);return m}
  function makeDealer(key){
    const p=looks[key]||looks["big-small"],g=new THREE.Group();arms=[];
    const skin=mat(p.skin),hair=mat(p.hair),cloth=mat(p.outfit,.48),gold=mat(p.trim,.28,.55),dark=mat(0x101a2b);
    // torso and fitted jacket/dress
    ball(g,0,1.62,0,.48,.64,.28,cloth);
    ball(g,0,2.04,0,.35,.28,.27,skin);
    ball(g,0,2.53,0,.31,.38,.29,skin);
    // neck
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,.25,18),skin);neck.position.y=2.27;g.add(neck);
    // hair cap, side locks, and distinct hairstyle
    ball(g,0,2.72,-.035,.34,.36,.32,hair);
    if(p.style==="bun")ball(g,0,2.98,-.18,.2,.2,.2,hair);
    if(p.style==="long"||p.style==="wave"){ball(g,-.29,2.38,-.04,.13,.55,.18,hair);ball(g,.29,2.38,-.04,.13,.55,.18,hair)}
    if(p.style==="wave"){ball(g,-.32,2.18,.02,.11,.3,.14,hair);ball(g,.32,2.18,.02,.11,.3,.14,hair)}
    if(p.style==="bob"){ball(g,0,2.39,-.11,.36,.34,.3,hair)}
    // facial features
    const eye=mat(0x211820),white=mat(0xffeee1),lip=mat(0x8d3944);
    for(const x of [-.12,.12]){ball(g,x,2.57,.264,.045,.035,.022,white);ball(g,x,2.57,.284,.018,.027,.012,eye)}
    ball(g,0,2.45,.29,.035,.07,.025,skin);ball(g,0,2.36,.285,.085,.025,.018,lip);
    // earrings and neckline accents
    for(const x of [-.32,.32]){ball(g,x,2.42,.02,.045,.065,.045,gold)}
    ball(g,0,1.99,.285,.22,.035,.025,gold);
    // waist sash
    const sash=new THREE.Mesh(new THREE.TorusGeometry(.34,.035,8,32),gold);sash.rotation.x=Math.PI/2;sash.position.y=1.38;g.add(sash);
    // shoulders and articulated upper arms
    for(const side of [-1,1]){
      ball(g,side*.43,1.99,0,.19,.2,.2,cloth);
      const pivot=new THREE.Group();pivot.position.set(side*.43,1.96,.02);g.add(pivot);
      limb(pivot,[0,0,0],[side*.08,-.36,.05],.115,.09,cloth);
      ball(pivot,side*.08,-.36,.05,.095,.1,.1,skin);
      limb(pivot,[side*.08,-.36,.05],[side*.12,-.66,.28],.085,.065,skin);
      ball(pivot,side*.12,-.68,.29,.09,.065,.11,skin);
      arms.push({pivot,side});
    }
    // lower body behind table
    ball(g,0,.98,-.01,.37,.4,.25,cloth);
    // decorative shoulder piping
    limb(g,[-.38,1.82,.18],[.38,1.82,.18],.025,.025,gold);
    return g;
  }
  function build(){
    const wrap=$("host-video-wrap")||document.querySelector(".host-video-wrap");if(!wrap)return;
    let mount=$("dealer3dMount");if(!mount){mount=document.createElement("div");mount.id="dealer3dMount";wrap.appendChild(mount)}
    mount.innerHTML="";mount.style.cssText="width:100%;height:100%;min-height:230px;position:absolute;inset:0;z-index:2;overflow:hidden;border-radius:14px";
    scene=new THREE.Scene();scene.background=new THREE.Color(0x0b1a2b);
    camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,2.25,7.9);camera.lookAt(0,1.55,0);
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;mount.appendChild(renderer.domElement);renderer.domElement.style.cssText="width:100%;height:100%;display:block";
    scene.add(new THREE.HemisphereLight(0xbad9ff,0x18202c,2));
    const key=new THREE.DirectionalLight(0xffdfb1,3);key.position.set(-3,6,5);key.castShadow=true;scene.add(key);
    const rim=new THREE.PointLight(0x299bff,32,10);rim.position.set(3,3,-2);scene.add(rim);
    const table=new THREE.Mesh(new THREE.CylinderGeometry(2.9,3.2,.22,48),mat(0x123b36,.36));table.position.set(0,.72,0);table.scale.z=.62;table.receiveShadow=true;scene.add(table);
    const edge=new THREE.Mesh(new THREE.TorusGeometry(2.1,.055,12,64),mat(0xd5ad63,.25,.5));edge.rotation.x=Math.PI/2;edge.position.y=.84;edge.scale.set(1,.62,1);scene.add(edge);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),mat(0x081321));floor.rotation.x=-Math.PI/2;floor.position.y=.59;scene.add(floor);
    root=makeDealer(slug);root.position.y=.02;scene.add(root);
    // table props for each game
    const prop=slug==="head-and-tail"?"🪙":slug==="dragon-vs-tiger"||slug==="teen-patti"?"🂠":slug==="roulette"?"🎡":"🎲";
    const label=document.createElement("div");label.id="dealer3dLabel";label.textContent=looks[slug].name+" · 3D DEALER";label.style.cssText="position:absolute;left:10px;bottom:9px;color:#ffe2a5;font:900 10px system-ui;letter-spacing:1.5px;text-shadow:0 2px 8px #000;z-index:3";mount.appendChild(label);
    const action=document.createElement("div");action.id="dealer3dProp";action.textContent=prop;action.style.cssText="position:absolute;left:50%;bottom:24px;transform:translateX(-50%);font-size:36px;filter:drop-shadow(0 4px 8px #000);z-index:3;transition:transform .4s";mount.appendChild(action);
    resize();if(raf)cancelAnimationFrame(raf);active=true;animate();
  }
  function resize(){const m=$("dealer3dMount");if(!m||!renderer)return;const w=m.clientWidth||360,h=m.clientHeight||240;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  function animate(){if(!active)return;raf=requestAnimationFrame(animate);if(root){root.rotation.y=Math.sin(performance.now()*.00045)*.035;root.position.y=.02+Math.sin(performance.now()*.002)*.018}if(arms.length){arms.forEach((a,i)=>{const target=actionMode?(.55*Math.sin(performance.now()*.006+i*1.3)):(.035*Math.sin(performance.now()*.0015+i));a.pivot.rotation.x=target;a.pivot.rotation.z=a.side*(actionMode?-.25:.03)})}renderer.render(scene,camera)}
  let actionMode=false;
  function start(key){slug=key;const video=$("dealerVideo"),fallback=$("dealerVideoFallback");if(video){video.pause();video.hidden=true}if(fallback)fallback.hidden=true;const tag=document.querySelector(".dealer-video-tag");if(tag)tag.textContent="3D BROWSER DEALER · GAME-SYNCED ANIMATION";loadThree().then(()=>{build();window.addEventListener("resize",resize)}).catch(()=>{if(fallback){fallback.hidden=false;fallback.textContent="3D Dealer could not load. Check internet connection."}})}
  function action(key){actionMode=true;const prop=$("dealer3dProp");if(prop){prop.style.transform="translateX(-50%) translateY(-25px) rotate(360deg) scale(1.25)";setTimeout(()=>{prop.style.transform="translateX(-50%)"},900)}setTimeout(()=>actionMode=false,1800)}
  function stop(){active=false;if(raf)cancelAnimationFrame(raf);if(renderer){renderer.dispose();renderer=null}const m=$("dealer3dMount");if(m)m.innerHTML="";const video=$("dealerVideo");if(video){video.pause();video.removeAttribute("src");video.load()}const fallback=$("dealerVideoFallback");if(fallback)fallback.hidden=true}
  window.BT18Dealer3D={start,action,stop};
  function hook(){if(typeof window.openGame==="function"&&!window.openGame.__bt18wrapped){const old=window.openGame;window.openGame=function(key){old(key);if(!$("gamePanel").classList.contains("hide"))start(key)};window.openGame.__bt18wrapped=true}
    if(typeof window.closeGame==="function"&&!window.closeGame.__bt18wrapped){const old=window.closeGame;window.closeGame=function(){old();if($("gamePanel").classList.contains("hide"))stop()};window.closeGame.__bt18wrapped=true}
    window.playDealerAction=function(key){if(window.BT18Dealer3D){window.BT18Dealer3D.action(key||slug);if(typeof window.animateGameAction==="function")window.animateGameAction(key||slug)}};
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",hook);else hook();
  setTimeout(hook,0);
})();