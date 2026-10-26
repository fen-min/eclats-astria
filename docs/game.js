import {WIDTH,HEIGHT,TILE,SPAWN,MIRA,DIRECTIONS,noise,tileAt,walkable,near,step} from './world.js?v=0.1.18';
import {STEP_DURATION_MS, movementPosition, characterPose} from './motion.js?v=0.1.16';
import {renderTerrain,renderHouses,drawWindFoliage,drawWaterAnimation} from './terrain.js?v=0.1.21';
import {mountHub,isGameActive} from './hub.js';
import {COMPANIONS,MIAW_SHEET,MIAW_ANIMATIONS,miawFrameRect,miawAnimation,companionById,initialCompanionPosition,COMPANION_WANDER,companionDistance,planCompanionRoute,facingDirection} from './companions.js?v=0.1.30';
import {WOUF_SHEET,WOUF_ANIMATIONS,woufFrameRect,woufAnimation} from './wouf.js?v=0.1.29';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const mini=document.getElementById('minimap'),mc=mini.getContext('2d');
const dialog=document.getElementById('dialog'),hint=document.getElementById('hint');
const toast=document.getElementById('toast'),quest=document.getElementById('quest');
const position=document.getElementById('position'),miniPos=document.getElementById('miniPos');
ctx.imageSmoothingEnabled=false; mc.imageSmoothingEnabled=false;
let saved={};try{saved=JSON.parse(localStorage.getItem('astria-save')||'{}')||{};}catch{}
const initial=walkable(saved.x,saved.y)?{x:saved.x,y:saved.y}:SPAWN;
const player={x:initial.x,y:initial.y,rx:initial.x,ry:initial.y,dir:'down',moving:false,fromX:initial.x,fromY:initial.y,stepStartedAt:-Infinity,walkStartedAt:0,lastSuccessfulStepAt:-Infinity};
let talked=!!saved.talked,lastStep=-Infinity,last=performance.now(),camera={x:0,y:0},noticeTimer=0;
let selectedCompanion=companionById(saved.companionId);
let follower=null;
const companionStatus=document.getElementById('companion-status');
const companionList=document.getElementById('companion-list');
const dialogTitle=document.getElementById('dialog-title');
const miawAtlas=new Image();
let miawReady=false;
miawAtlas.onload=()=>{miawReady=miawAtlas.naturalWidth===MIAW_SHEET.width&&miawAtlas.naturalHeight===MIAW_SHEET.height;};
miawAtlas.onerror=()=>{miawReady=false;};
fetch(new URL('./assets/miaw-actions.base64?v=0.1.26',import.meta.url))
 .then(response=>{if(!response.ok)throw new Error('Atlas Miaw indisponible');return response.text();})
 .then(encoded=>{miawAtlas.src='data:image/png;base64,'+encoded.replace(/\s/g,'');})
 .catch(error=>console.warn('Miaw : image de secours',error));
const woufAtlas=new Image();
let woufReady=false;
woufAtlas.onload=()=>{woufReady=woufAtlas.naturalWidth===WOUF_SHEET.width&&woufAtlas.naturalHeight===WOUF_SHEET.height;};
woufAtlas.onerror=()=>{woufReady=false;};
fetch(new URL('./assets/wouf-actions.base64?v=0.1.29',import.meta.url))
 .then(response=>{if(!response.ok)throw new Error('Atlas Wouf indisponible');return response.text();})
 .then(encoded=>{woufAtlas.src='data:image/png;base64,'+encoded.replace(/\s/g,'');})
 .catch(error=>console.warn('Wouf : image de secours',error));
const companionPreview={kind:null,startedAt:0};
const animationSelect=document.getElementById('companion-animation-select');
const animationPlay=document.getElementById('companion-animation-play');
const animationTitle=document.getElementById('companion-animation-title');
function currentCompanionAnimations(){
 return selectedCompanion?.id==='wouf'?WOUF_ANIMATIONS:MIAW_ANIMATIONS;
}
function updateAnimationControls(){
 const options=currentCompanionAnimations();
 animationSelect.replaceChildren();
 for(const [kind,animation] of Object.entries(options)){
  const option=document.createElement('option');
  option.value=kind;option.textContent=animation.label+' · '+animation.frames+' images';
  animationSelect.append(option);
 }
 animationTitle.textContent='Animations de '+(selectedCompanion?.name||'créature');
 animationPlay.disabled=!selectedCompanion;
 companionPreview.kind=null;
}
animationPlay.addEventListener('click',()=>{
 if(!selectedCompanion)return;
 const kind=animationSelect.value;
 const animation=currentCompanionAnimations()[kind];
 if(!animation)return;
 companionPreview.kind=kind;
 companionPreview.startedAt=performance.now();
 notify(selectedCompanion.name+' : '+animation.label);
});
function resetFollower(){
 if(!selectedCompanion){follower=null;return;}
 const spot=initialCompanionPosition(player,walkable);
 const now=performance.now();
 follower={x:spot.x,y:spot.y,fromX:spot.x,fromY:spot.y,toX:spot.x,toY:spot.y,
  dir:player.dir,stepStartedAt:-Infinity,lastMoveAt:now,route:[],
  nextWanderAt:now+COMPANION_WANDER.restMinMs};
}
resetFollower();
function updateCompanionUI(){
 companionStatus.textContent=selectedCompanion
 ?selectedCompanion.name+' · '+selectedCompanion.role+' · Se promène à proximité'
 :'Aucun compagnon — parle à Maria.';
 updateAnimationControls();
}
updateCompanionUI();
const keys=new Set();
const colors={grass:'#659b70',path:'#c4b48a',roof:'#ae655d',roof2:'#4e8292',water:'#407f91'};
function persist(){try{localStorage.setItem('astria-save',JSON.stringify({x:player.x,y:player.y,talked,companionId:selectedCompanion?.id||null}));}catch{}}
function notify(msg){toast.textContent=msg;toast.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>toast.hidden=true,3100);}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
const world=document.createElement('canvas');
world.width=WIDTH*TILE;
world.height=HEIGHT*TILE;
const g=world.getContext('2d');
const houseLayer=document.createElement('canvas');
houseLayer.width=world.width;houseLayer.height=world.height;
const hg=houseLayer.getContext('2d');
hg.imageSmoothingEnabled=false;
// Chaque ressource peut se charger indépendamment, sans perdre les autres décors.
// Effacer avant chaque rendu évite que les anciennes maisons restent visibles
// derrière les contours transparents des nouvelles.
const foliageAtlas=new Image();
const housesAtlas=new Image();
const groundAtlas=new Image();
const waterAtlas=new Image();
const softGrassAtlas=new Image();
let foliageReady=false, housesReady=false, groundReady=false, waterReady=false, softGrassReady=false;
function redrawTerrain(){
 g.clearRect(0,0,world.width,world.height);
 hg.clearRect(0,0,world.width,world.height);
 renderTerrain(g,WIDTH,HEIGHT,tileAt,noise,
  foliageReady?foliageAtlas:null,housesReady?housesAtlas:null,
  groundReady?groundAtlas:null,waterReady?waterAtlas:null,
  foliageReady?'background':'all',softGrassReady?softGrassAtlas:null);
 if(foliageReady)renderHouses(hg,noise,housesReady?housesAtlas:null);
}
redrawTerrain();
foliageAtlas.onload=()=>{
 if(foliageAtlas.naturalWidth===320&&foliageAtlas.naturalHeight===145){
  foliageReady=true;redrawTerrain();
 }else console.warn('Planche de végétation aux dimensions inattendues.');
};
foliageAtlas.onerror=()=>console.warn('Décors de secours affichés : feuillages indisponibles.');
housesAtlas.onload=()=>{
 if(housesAtlas.naturalWidth===384&&housesAtlas.naturalHeight===176){
  housesReady=true;redrawTerrain();
 }else console.warn('Planche de maisons aux dimensions inattendues.');
};
housesAtlas.onerror=()=>console.warn('Décors de secours affichés : maisons indisponibles.');
groundAtlas.onload=()=>{
 if(groundAtlas.naturalWidth===256&&groundAtlas.naturalHeight===64){
  groundReady=true;redrawTerrain();
 }else console.warn('Planche des textures de prairie aux dimensions inattendues.');
};
groundAtlas.onerror=()=>console.warn('Textures de prairie indisponibles, anciens sols conservés.');
softGrassAtlas.onload=()=>{
 if(softGrassAtlas.naturalWidth===256&&softGrassAtlas.naturalHeight===32){
  softGrassReady=true;redrawTerrain();
 }else console.warn('Dimensions inattendues des nouvelles tuiles d’herbe.');
};
softGrassAtlas.onerror=()=>console.warn('Herbe douce indisponible, texture précédente conservée.');
softGrassAtlas.src=new URL('./assets/soft-grass-atlas.png?v=0.1.21',import.meta.url).href;
waterAtlas.onload=()=>{
 if(waterAtlas.naturalWidth===128&&waterAtlas.naturalHeight===128){
  waterReady=true;redrawTerrain();
 }else console.warn('Dimensions incorrectes de la planche d’eau.');
};
waterAtlas.onerror=()=>console.warn('Planche d’eau indisponible, dessin de secours conservé.');
waterAtlas.src=new URL('./assets/water-atlas.png?v=0.1.19',import.meta.url).href;
groundAtlas.src=new URL('./assets/ground-atlas.png?v=0.1.17',import.meta.url).href;
foliageAtlas.src=new URL('./assets/foliage-atlas.png?v=0.1.10',import.meta.url).href;
housesAtlas.src=new URL('./assets/houses-atlas.png?v=0.1.12',import.meta.url).href;
function r(x,y,w,h,color){rect(ctx,x,y,w,h,color);}
function drawHeroFallback(px,py,dir,moving,now){
 const x=Math.round(px-16),y=Math.round(py-69);
 const cycle=moving?Math.floor(now/130)%4:0,stepLeg=cycle===1?-4:cycle===3?4:0;
 ctx.fillStyle='#1931296a';ctx.beginPath();ctx.ellipse(px,py,14,4,0,0,Math.PI*2);ctx.fill();
 // Pixel-art silhouette, black hair, red eyes and jacket; four directions.
 r(x+7,y+8,19,21,'#171821');r(x+5,y+15,23,13,'#27232d');
 r(x+9,y+28,16,26,'#202530');r(x+12,y+31,10,15,'#34323e');
 r(x+8,y+29,3,24,'#34333f');r(x+24,y+29,3,24,'#373541');
 r(x+11,y+43,12,5,'#9f313b');
 r(x+7,y+49,9,14+stepLeg,'#242633');r(x+18,y+49,9,14-stepLeg,'#272b37');
 r(x+6,y+60+stepLeg,12,5,'#1c202a');r(x+17,y+60-stepLeg,13,5,'#1c202a');
 r(x+7,y+61+stepLeg,10,2,'#a83741');r(x+19,y+61-stepLeg,10,2,'#a83741');
 const swing=cycle===1?4:cycle===3?-4:0;
 r(x+2,y+31+swing,7,19,'#252730');r(x+26,y+31-swing,7,19,'#282932');
 r(x+3,y+46+swing,6,5,'#edc1aa');r(x+27,y+46-swing,6,5,'#edc1aa');
 if(dir==='up'){r(x+7,y+19,20,15,'#20202b');r(x+10,y+27,14,18,'#303039');r(x+15,y+33,4,8,'#a83a43');}
 else {
   r(x+8,y+17,18,14,'#efc1a4');r(x+8,y+5,20,13,'#21212a');r(x+4,y+10,23,10,'#181a23');
   r(x+7,y+17,19,5,'#25212c');r(x+9,y+5,9,5,'#32313b');
   if(dir==='down'){r(x+11,y+23,4,3,'#bd3647');r(x+21,y+23,4,3,'#bd3647');}
   if(dir==='left')r(x+9,y+23,4,3,'#c23649');
   if(dir==='right')r(x+23,y+23,4,3,'#c23649');
   r(x+14,y+31,6,3,'#a53643');
 }
}

const heroWalkAtlas = new Image();
let heroWalkReady = false;
heroWalkAtlas.onload = () => { heroWalkReady = heroWalkAtlas.naturalWidth===352 && heroWalkAtlas.naturalHeight===272; };
heroWalkAtlas.onerror = () => { heroWalkReady = false; };
heroWalkAtlas.src = new URL('./assets/hero-walk-8.png?v=0.1.13', import.meta.url).href;
// Planche dédiée aux positions immobiles : face, gauche, droite, dos.
const heroIdleAtlas = new Image();
let heroIdleReady = false;
heroIdleAtlas.onload = () => {
  heroIdleReady = heroIdleAtlas.naturalWidth===176 && heroIdleAtlas.naturalHeight===68;
};
heroIdleAtlas.onerror = () => { heroIdleReady = false; };
heroIdleAtlas.src = new URL('./assets/hero-idle-4.png?v=0.1.16', import.meta.url).href;
const heroRows = Object.freeze({down:0,left:1,right:2,up:3});
// Nouvelle planche : 8 poses par direction, découpées à la taille d'affichage native.
const HERO_FRAME_WIDTH=44;
const HERO_FRAME_HEIGHT=68;
function drawHero(px,py,dir,moving,now){
 const pose=characterPose(now,moving,player.walkStartedAt);
 const row=heroRows[dir] ?? 0;
 // L'ombre reste au sol pendant que le personnage respire ou marche.
 ctx.fillStyle='#1931296a';
 ctx.beginPath();ctx.ellipse(px,py,12*pose.shadowScale,4*pose.shadowScale,0,0,Math.PI*2);ctx.fill();
 // L'image de repos est distincte de l'animation à huit poses de marche.
 // Tant que l'atlas de repos charge, une pose immobile de la marche sert de secours.
 const idle=!moving && heroIdleReady;
 if(!idle && !heroWalkReady){
   ctx.save();ctx.translate(px,py);ctx.scale(pose.scaleX*0.8,pose.scaleY*0.8);
   drawHeroFallback(pose.swayX,pose.bobY,dir,moving,now);
   ctx.restore();
   return;
 }
 ctx.save();
 ctx.translate(px,py);
 ctx.imageSmoothingEnabled=false;
 if(idle){
   // Véritable animation de repos : jambes fixes et haut du corps animé.
   // On évite de simplement étirer le sprite entier (trop discret à 44x68).
   // Ligne de séparation située entre le bassin et les jambes.
   const seam=49;
   const footHeight=HERO_FRAME_HEIGHT-seam;
   const idleX=row*HERO_FRAME_WIDTH;
   // Les pieds conservent exactement leur position sur la carte.
   ctx.drawImage(heroIdleAtlas,
     idleX,seam,HERO_FRAME_WIDTH,footHeight,
     -22,-footHeight,HERO_FRAME_WIDTH,footHeight);
   // Thorax et tête montent de 0 à 3 pixels pendant la respiration.
   ctx.drawImage(heroIdleAtlas,
     idleX,0,HERO_FRAME_WIDTH,seam,
     -22+pose.idleDriftX,-68-pose.chestRise,
     HERO_FRAME_WIDTH,seam+pose.chestRise);
 }else{
   ctx.scale(pose.scaleX,pose.scaleY);
   // Marche : les huit images par direction sont conservées.
   // On ignore le trait noir parasite des premières lignes latérales/dos.
   const topTrim=row===0?0:4;
   ctx.drawImage(heroWalkAtlas,
     pose.frame*HERO_FRAME_WIDTH,row*HERO_FRAME_HEIGHT+topTrim,
     HERO_FRAME_WIDTH,HERO_FRAME_HEIGHT-topTrim,
     Math.round(-22+pose.swayX),Math.round(-68+topTrim+pose.bobY),
     HERO_FRAME_WIDTH,HERO_FRAME_HEIGHT-topTrim);
 }
 ctx.restore();
}
function drawCompanion(px,py,now){
 if(!selectedCompanion||!follower)return;
 ctx.fillStyle='#14261b6e';ctx.beginPath();ctx.ellipse(px,py,12,3,0,0,Math.PI*2);ctx.fill();
 const walking=Math.abs(follower.fromX-follower.toX)+Math.abs(follower.fromY-follower.toY)>.01
   && now-follower.stepStartedAt<COMPANION_WANDER.stepMs;
 const isWouf=selectedCompanion.id==='wouf';
 let override=null;
 if(companionPreview.kind){
  const animation=currentCompanionAnimations()[companionPreview.kind];
  if(animation&&now-companionPreview.startedAt<animation.frames*1000/animation.fps)
   override=companionPreview;
  else companionPreview.kind=null;
 }
 const pose=isWouf
  ?woufAnimation(now,follower.dir,walking,override)
  :miawAnimation(now,follower.dir,walking,Math.max(0,now-follower.lastMoveAt),override);
 if(isWouf&&woufReady){
  ctx.save();ctx.translate(Math.round(px),Math.round(py));
  // Les poses face et dos ne doivent pas être retournées pour les déplacements latéraux.
  const directional=pose.kind==='idle_front'||pose.kind==='idle_back'
   ||pose.kind==='walk_front'||pose.kind==='walk_back';
  if(!directional&&follower.dir==='left')ctx.scale(-1,1);
  ctx.imageSmoothingEnabled=false;
  function drawWouf(kind,index){
   const source=woufFrameRect(kind,index);
   const dw=source.width,dh=source.height;
   ctx.drawImage(woufAtlas,source.x,source.y,source.width,source.height,
    -Math.round(dw/2),-dh+3,dw,dh);
  }
  // Les flammes élémentaires de la nouvelle planche ne contiennent pas le chien :
  // dessiner l'effet, puis Wouf, pour conserver la silhouette sombre et rouge.
  if(pose.kind==='elemental'){
   drawWouf('elemental',pose.frame);
   drawWouf('idle',0);
  }else drawWouf(pose.kind,pose.frame);
  ctx.restore();
 }else if(!isWouf&&miawReady){
  ctx.save();
  ctx.translate(Math.round(px),Math.round(py));
  if(follower.dir==='left')ctx.scale(-1,1);
  ctx.imageSmoothingEnabled=false;
  function frame(kind,index,scale=.55,lift=0){
   const source=miawFrameRect(kind,index);
   const dw=Math.round(source.width*scale),dh=Math.round(source.height*scale);
   ctx.drawImage(miawAtlas,source.x,source.y,source.width,source.height,
    -Math.round(dw/2),-dh+3+lift,dw,dh);
  }
  if(pose.kind==='elemental'){
   frame('idle',0);
   frame('elemental',pose.frame,.55,-5);
  }else frame(pose.kind,pose.frame);
  ctx.restore();
 }else{
  // Silhouette de secours si l'asset concerné n'est pas encore chargé.
  const color=isWouf?'#293f86':'#e15c25';
  rect(ctx,px-11,py-22,22,20,color);
  rect(ctx,px-9,py-31,6,10,isWouf?'#e8e1d9':'#30212c');
  rect(ctx,px+3,py-31,6,10,isWouf?'#e8e1d9':'#30212c');
  rect(ctx,px-5,py-16,4,4,'#f1bd76');
  rect(ctx,px+2,py-16,4,4,'#f1bd76');
 }
}
function notifyCompanionHeroMoved(now){
 if(!follower)return;
 // Le trajet de flânerie n'est plus pertinent si le héros a changé de case.
 follower.route=[];
 follower.nextWanderAt=now+700;
}
function updateCompanionMovement(now){
 if(!selectedCompanion||!follower)return;
 const position=movementPosition(follower.fromX,follower.fromY,follower.toX,
  follower.toY,now,follower.stepStartedAt,COMPANION_WANDER.stepMs);
 follower.x=position.x;follower.y=position.y;
 if(!position.finished)return; // ne jamais interrompre un pas : pas de téléportation.
 const current={x:follower.toX,y:follower.toY};
 follower.x=current.x;follower.y=current.y;
 follower.fromX=current.x;follower.fromY=current.y;
 const distance=companionDistance(current,player);
 // Plus près de 2 cases : se dégager. Au-delà de 4 : rejoindre l'entourage.
 if(distance<COMPANION_WANDER.minDistance||distance>COMPANION_WANDER.maxDistance){
  follower.route=planCompanionRoute(current,player,walkable,'return');
  follower.nextWanderAt=now+COMPANION_WANDER.restMinMs;
 }else if(!follower.route.length&&now>=follower.nextWanderAt){
  follower.route=planCompanionRoute(current,player,walkable,'roam');
  follower.nextWanderAt=now+COMPANION_WANDER.restMinMs+
   Math.random()*COMPANION_WANDER.restJitterMs;
 }
 if(!follower.route.length)return;
 const next=follower.route.shift();
 // La carte ou la position du héros peut changer après le calcul du trajet.
 if(!walkable(next.x,next.y)||(next.x===player.x&&next.y===player.y)){
  follower.route=[];
  return;
 }
 follower.dir=facingDirection(current,next,follower.dir);
 follower.toX=next.x;follower.toY=next.y;
 follower.stepStartedAt=now;
 follower.lastMoveAt=now;
}
function drawMira(px,py,now){
 const bob=Math.sin(now/400)*1.5,x=Math.round(px),y=Math.round(py+bob);
 ctx.fillStyle='#263a3160';ctx.beginPath();ctx.ellipse(x,y,14,4,0,0,Math.PI*2);ctx.fill();
 r(x-10,y-48,20,21,'#554463');r(x-9,y-37,18,16,'#ecc0a4');
 r(x-13,y-43,25,10,'#674d71');r(x-11,y-25,22,25,'#6e5379');
 r(x-8,y-3,6,6,'#2a2939');r(x+3,y-3,6,6,'#2a2939');
 r(x-2,y-21,4,14,'#e4cf9d');
 ctx.textAlign='center';ctx.font='bold 11px system-ui';ctx.fillStyle='#f3e0a8';ctx.fillText('✦ MARIA',x,y-55);
}
function drawMinimap(){
 mc.clearRect(0,0,mini.width,mini.height);
 const sx=mini.width/WIDTH,sy=mini.height/HEIGHT;
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   const t=tileAt(x,y);
   mc.fillStyle=t==='path'||t==='door'?'#d3c49d':t==='tree'||t==='void'?'#2c5949':t==='water'?'#428a99':t==='roof'?'#af7166':t==='roof2'?'#648f9f':t==='wall'?'#d9c49d':'#6eae79';
   mc.fillRect(x*sx|0,y*sy|0,Math.ceil(sx),Math.ceil(sy));
 }
 mc.fillStyle='#f4d48d';mc.fillRect(MIRA.x*sx-2,MIRA.y*sy-2,5,5);
 if(selectedCompanion&&follower){
  mc.fillStyle='#ea8155';mc.fillRect(follower.toX*sx-1,follower.toY*sy-1,3,3);
 }
 mc.fillStyle='#f7edd2';mc.fillRect(player.x*sx-2,player.y*sy-2,6,6);
}
function updatePlayerPosition(now){
 const pos=movementPosition(player.fromX,player.fromY,player.x,player.y,now,player.stepStartedAt);
 player.rx=pos.x;player.ry=pos.y;
 player.moving=!pos.finished;
}
function attempt(dir){
 if(!isGameActive())return;
 const now=performance.now();
 if(dialog.open||!DIRECTIONS[dir]||now-lastStep<STEP_DURATION_MS)return;
 updatePlayerPosition(now);
 lastStep=now;player.dir=dir;
 const result=step(player,dir);
 if(result.moved){
   if(now-player.lastSuccessfulStepAt>STEP_DURATION_MS+85) player.walkStartedAt=now;
   player.fromX=player.rx;player.fromY=player.ry;
   player.x=result.x;player.y=result.y;
   player.stepStartedAt=now;player.lastSuccessfulStepAt=now;
   player.moving=true;notifyCompanionHeroMoved(now);persist();
 }
}
const keysMap={arrowup:'up',z:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',q:'left',arrowright:'right',d:'right'};
window.addEventListener('keydown',e=>{
 if(!isGameActive())return;
 const key=e.key.toLowerCase();
 if(key==='e'||key==='enter'){if(!e.repeat)talk();e.preventDefault();return;}
 if(!keysMap[key]||dialog.open)return;
 e.preventDefault();keys.add(keysMap[key]);attempt(keysMap[key]);
});
window.addEventListener('keyup',e=>{const dir=keysMap[e.key.toLowerCase()];if(dir)keys.delete(dir);});
window.addEventListener('blur',()=>{keys.clear();});
for(const b of document.querySelectorAll('[data-dir]')){
 b.addEventListener('pointerdown',e=>{if(!isGameActive())return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.dir);attempt(b.dataset.dir);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{keys.delete(b.dataset.dir);});
}
function renderCompanionChoices(){
 companionList.replaceChildren();
 for(const companion of COMPANIONS){
  const choice=document.createElement('button');
  choice.type='button';choice.className='companion-choice';
  choice.dataset.companion=companion.id;
  choice.textContent=(selectedCompanion?.id===companion.id?'✓ ':'✦ ')+
    companion.name+' · '+companion.role+
    (selectedCompanion?.id===companion.id?' (actuel)':' — Choisir');
  choice.addEventListener('click',()=>{
   if(selectedCompanion?.id!==companion.id){
    selectedCompanion=companionById(companion.id);
    resetFollower();
    persist();updateCompanionUI();
    companionPreview.kind=null;
    notify(companion.name+' rejoint ton équipe !');
   }
   dialog.close();
  });
  companionList.append(choice);
 }
 const future=document.createElement('p');
 future.className='companion-future';
 future.textContent='D’autres créatures originales rejoindront bientôt la liste.';
 companionList.append(future);
}
function talk(){
 if(!isGameActive()||dialog.open)return;
 if(near(player,MIRA,2)){
   talked=true;persist();
   quest.textContent=selectedCompanion
    ?'✓ Tu as recruté '+selectedCompanion.name+'. Il te suit !'
    :'✧ Parle à Maria et choisis ta première créature.';
   dialogTitle.textContent='✦ Maria — Choisis une créature';
   document.getElementById('speech').textContent='Maria : « Bienvenue ! Choisis un compagnon pour explorer le Vallon à tes côtés. Tu peux revenir me voir pour changer d’équipe plus tard. »';
   renderCompanionChoices();
   dialog.showModal();keys.clear();player.moving=false;
 }else notify('Approche-toi de Maria, la guide du village.');
}
document.getElementById('talk').addEventListener('click',talk);
document.getElementById('close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
if(talked)quest.textContent=selectedCompanion
 ?'✓ '+selectedCompanion.name+' fait partie de ton équipe.'
 :'✧ Maria te propose une première créature.';
function animate(now){
 if(!isGameActive()){last=now;requestAnimationFrame(animate);return;}
 const dt=Math.min(now-last,60);last=now;
 if(keys.size&&now-lastStep>=STEP_DURATION_MS)attempt([...keys].at(-1));
 updatePlayerPosition(now);
 updateCompanionMovement(now);
 // Un déplacement déjà commencé se termine sans saut quand la touche est relâchée.
 const walking=player.moving||(keys.size>0&&now-player.lastSuccessfulStepAt<=STEP_DURATION_MS+40);
 const w=canvas.width,h=canvas.height;
 const targetX=Math.max(0,Math.min(WIDTH*TILE-w,(player.rx+.5)*TILE-w/2));
 const targetY=Math.max(0,Math.min(HEIGHT*TILE-h,(player.ry+.5)*TILE-h/2));
 camera.x+=(targetX-camera.x)*Math.min(1,dt/130);
 camera.y+=(targetY-camera.y)*Math.min(1,dt/130);
 const cx=Math.round(camera.x),cy=Math.round(camera.y);
 ctx.drawImage(world,cx,cy,w,h,0,0,w,h);
 drawWaterAnimation(ctx,cx,cy,now,tileAt,WIDTH,HEIGHT);
 if(foliageReady){
  drawWindFoliage(ctx,cx,cy,now,tileAt,noise,foliageAtlas,WIDTH,HEIGHT);
  ctx.drawImage(houseLayer,cx,cy,w,h,0,0,w,h);
 }
 const heroX=Math.round((player.rx+.5)*TILE-cx),heroY=Math.round((player.ry+.8)*TILE-cy);
 const miraX=(MIRA.x+.5)*TILE-cx,miraY=(MIRA.y+.8)*TILE-cy;
 const actors=[
  {y:miraY,render:()=>drawMira(miraX,miraY,now)},
  {y:heroY,render:()=>drawHero(heroX,heroY,player.dir,walking,now)}
 ];
 if(follower&&selectedCompanion){
  const p=movementPosition(follower.fromX,follower.fromY,follower.toX,follower.toY,now,follower.stepStartedAt,COMPANION_WANDER.stepMs);
  follower.x=p.x;follower.y=p.y;
  const px=Math.round((p.x+.5)*TILE-cx),py=Math.round((p.y+.8)*TILE-cy);
  actors.push({y:py,render:()=>drawCompanion(px,py,now)});
 }
 actors.sort((a,b)=>a.y-b.y);
 for(const actor of actors)actor.render();
 ctx.fillStyle='#f7e5a7';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('VOUS',heroX,heroY-80);
 position.textContent='X '+player.x+' / Y '+player.y;miniPos.textContent=player.x+' · '+player.y;
 hint.hidden=!near(player,MIRA,2);
 if((now|0)%8===0)drawMinimap();
 requestAnimationFrame(animate);
}

// Mode plein écran : utilisable sans extension et avec une alternative si bloqué.
const gameFrame=document.querySelector('.frame');
const fullscreenButton=document.getElementById('fullscreen-toggle');
function updateFullscreenLabel(){
 const active=document.fullscreenElement===gameFrame || gameFrame.classList.contains('fullscreen-fallback');
 fullscreenButton.textContent=active?'⤢ Réduire':'⛶ Plein écran';
 fullscreenButton.setAttribute('aria-label',active?'Quitter le plein écran':'Agrandir le jeu en plein écran');
 fullscreenButton.setAttribute('aria-pressed',String(active));
}
async function toggleGameFullscreen(){
 if(document.fullscreenElement===gameFrame){
  try{await document.exitFullscreen();}catch(error){console.warn('Sortie du plein écran impossible',error);}
 }else if(gameFrame.classList.contains('fullscreen-fallback')){
  gameFrame.classList.remove('fullscreen-fallback');
 }else{
  try{
   if(!gameFrame.requestFullscreen)throw new Error('API plein écran non disponible');
   await gameFrame.requestFullscreen();
  }catch(error){
   gameFrame.classList.add('fullscreen-fallback');
  }
 }
 updateFullscreenLabel();
}
fullscreenButton.addEventListener('click',toggleGameFullscreen);
document.addEventListener('fullscreenchange',updateFullscreenLabel);
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&gameFrame.classList.contains('fullscreen-fallback')){
  gameFrame.classList.remove('fullscreen-fallback');updateFullscreenLabel();
 }
});
updateFullscreenLabel();

// L'accueil est désormais la première page. Le jeu conserve son état si on revient à la liste.
mountHub({onReturn:()=>{keys.clear();player.moving=false;}});
notify(selectedCompanion?'Ton compagnon est prêt à explorer !':'Bienvenue ! Rencontre Maria pour choisir ta créature.');
requestAnimationFrame(animate);
