import {WIDTH,HEIGHT,TILE,SPAWN,MIRA,DIRECTIONS,noise,tileAt,walkable,near,step} from './world.js';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const mini=document.getElementById('minimap'),mc=mini.getContext('2d');
const dialog=document.getElementById('dialog'),hint=document.getElementById('hint');
const toast=document.getElementById('toast'),quest=document.getElementById('quest');
const position=document.getElementById('position'),miniPos=document.getElementById('miniPos');
ctx.imageSmoothingEnabled=false; mc.imageSmoothingEnabled=false;
let saved={};try{saved=JSON.parse(localStorage.getItem('astria-save')||'{}')||{};}catch{}
const initial=walkable(saved.x,saved.y)?{x:saved.x,y:saved.y}:SPAWN;
const player={x:initial.x,y:initial.y,rx:initial.x,ry:initial.y,dir:'down',moving:false};
let talked=!!saved.talked,lastStep=0,last=performance.now(),camera={x:0,y:0},noticeTimer=0;
const keys=new Set();
const colors={grass:'#659b70',path:'#c4b48a',roof:'#ae655d',roof2:'#4e8292',water:'#407f91'};
function persist(){try{localStorage.setItem('astria-save',JSON.stringify({x:player.x,y:player.y,talked}));}catch{}}
function notify(msg){toast.textContent=msg;toast.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>toast.hidden=true,3100);}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
const world=document.createElement('canvas');world.width=WIDTH*TILE;world.height=HEIGHT*TILE;
const g=world.getContext('2d');g.imageSmoothingEnabled=false;
function paint(x,y){
 const px=x*TILE,py=y*TILE,t=tileAt(x,y),n=noise(x,y,15);
 rect(g,px,py,32,32,n<.3?'#5b9069':n<.7?'#679b70':'#6e9f72');
 for(let j=0;j<4;j++){rect(g,px+(noise(x+j,y,3)*27|0),py+(noise(x,y+j,7)*27|0),2,3,j%2?'#3f8057':'#91b47c');}
 if(t==='path'||t==='door'){
   rect(g,px,py,32,32,n<.5?'#c7b88d':'#bca981');
   for(let i=0;i<6;i++)rect(g,px+(noise(x+i,y,20)*28|0),py+(noise(x,y+i,22)*28|0),3,2,'#a89575');
 }
 if(t==='flower'){
   for(let i=0;i<2;i++){let a=7+(noise(x,y,i+30)*16|0),b=7+(noise(x,y,i+35)*17|0);
   rect(g,px+a,py+b,2,11,'#318255');rect(g,px+a-3,py+b-2,8,5,i?'#f4d2d7':'#f2dfa6');}
 }
 if(t==='tallgrass'){
   for(let i=0;i<4;i++){rect(g,px+4+i*7,py+11+(i%2)*3,5,19,'#347954');rect(g,px+7+i*6,py+9+(i%2)*6,2,17,'#96bf7a');}
 }
 if(t==='tree'||t==='void'){
   rect(g,px+12,py+17,8,15,'#62564b');
   rect(g,px+3,py+10,26,19,'#28583e');rect(g,px,py+14,32,9,'#376e4d');
   rect(g,px+6,py+3,20,21,'#397e55');rect(g,px+12,py+2,12,12,'#4a9362');
   rect(g,px+11,py+6,7,3,'#85b57b');
 }
 if(t==='water'){rect(g,px,py,32,32,'#407f91');rect(g,px+3,py+6,20,2,'#80b8b2');rect(g,px+12,py+20,17,2,'#5e9daa');}
 if(t==='roof'||t==='roof2'){
   rect(g,px,py,32,32,t==='roof'?'#8e5154':'#3f697a');
   rect(g,px+1,py+3,30,25,t==='roof'?'#ae665e':'#568999');
   rect(g,px+2,py+11,28,3,t==='roof'?'#d08b78':'#84acac');rect(g,px+1,py+29,30,3,'#393d42');
 }
 if(t==='wall'){rect(g,px,py,32,32,'#d3c19b');rect(g,px+10,py+11,12,15,'#577b8a');rect(g,px+12,py+12,8,12,'#9bc4bd');rect(g,px,py+28,32,4,'#8e8270');}
 if(t==='door'){rect(g,px+2,py,28,32,'#805b46');rect(g,px+7,py+4,18,24,'#aa7654');rect(g,px+21,py+17,3,3,'#f2d495');}
}
for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++)paint(x,y);
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
heroWalkAtlas.onload = () => { heroWalkReady = true; };
heroWalkAtlas.onerror = () => { heroWalkReady = false; };
heroWalkAtlas.src = new URL('./assets/hero-walk.png?v=0.1.2', import.meta.url).href;
const heroRows = Object.freeze({down:0,left:1,right:2,up:3});
function drawHero(px,py,dir,moving,now){
 if(!heroWalkReady){drawHeroFallback(px,py,dir,moving,now);return;}
 const walking = moving || Math.abs(player.rx-player.x)>0.02 || Math.abs(player.ry-player.y)>0.02;
 const frame = walking ? Math.floor(now/125)%4 : 0;
 const row = heroRows[dir] ?? 0;
 // Sprite sheet 4 columns x 4 rows, derived from our first anime pixel-art skin.
 // The sprite's feet stay anchored on the same ground position.
 ctx.fillStyle='#1931296a';
 ctx.beginPath();ctx.ellipse(px,py,14,4,0,0,Math.PI*2);ctx.fill();
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(heroWalkAtlas,frame*32,row*48,32,48,
   Math.round(px-29),Math.round(py-86),58,87);
}
function drawMira(px,py,now){
 const bob=Math.sin(now/400)*1.5,x=Math.round(px),y=Math.round(py+bob);
 ctx.fillStyle='#263a3160';ctx.beginPath();ctx.ellipse(x,y,14,4,0,0,Math.PI*2);ctx.fill();
 r(x-10,y-48,20,21,'#554463');r(x-9,y-37,18,16,'#ecc0a4');
 r(x-13,y-43,25,10,'#674d71');r(x-11,y-25,22,25,'#6e5379');
 r(x-8,y-3,6,6,'#2a2939');r(x+3,y-3,6,6,'#2a2939');
 r(x-2,y-21,4,14,'#e4cf9d');
 ctx.textAlign='center';ctx.font='bold 11px system-ui';ctx.fillStyle='#f3e0a8';ctx.fillText('✦ MIRA',x,y-55);
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
 mc.fillStyle='#f7edd2';mc.fillRect(player.x*sx-2,player.y*sy-2,6,6);
}
function attempt(dir){
 const now=performance.now();
 if(dialog.open||!DIRECTIONS[dir]||now-lastStep<120)return;
 lastStep=now;player.dir=dir;
 const result=step(player,dir);
 if(result.moved){player.x=result.x;player.y=result.y;player.moving=true;persist();}
 else player.moving=false;
}
const keysMap={arrowup:'up',z:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',q:'left',arrowright:'right',d:'right'};
window.addEventListener('keydown',e=>{
 const key=e.key.toLowerCase();
 if(key==='e'||key==='enter'){if(!e.repeat)talk();e.preventDefault();return;}
 if(!keysMap[key]||dialog.open)return;
 e.preventDefault();keys.add(keysMap[key]);attempt(keysMap[key]);
});
window.addEventListener('keyup',e=>{const dir=keysMap[e.key.toLowerCase()];if(dir){keys.delete(dir);if(!keys.size)player.moving=false;}});
window.addEventListener('blur',()=>{keys.clear();player.moving=false;});
for(const b of document.querySelectorAll('[data-dir]')){
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.dir);attempt(b.dataset.dir);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{keys.delete(b.dataset.dir);if(!keys.size)player.moving=false;});
}
function talk(){
 if(dialog.open)return;
 if(near(player,MIRA,2)){
   talked=true;persist();quest.textContent='✓ Tu as rencontré Mira. À toi d’explorer le Vallon !';
   document.getElementById('speech').textContent='Mira : « Bienvenue dans les Prairies d’Astria ! Cette région est le commencement de ton aventure. Bientôt, des créatures mystérieuses peupleront les hautes herbes. Pour le moment, explore notre petit village et profite du paysage. »';
   dialog.showModal();keys.clear();player.moving=false;
 } else notify('Approche-toi de Mira, la guide du village.');
}
document.getElementById('talk').addEventListener('click',talk);
document.getElementById('close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
if(talked)quest.textContent='✓ Tu as rencontré Mira. À toi d’explorer le Vallon !';
function animate(now){
 const dt=Math.min(now-last,60);last=now;
 if(keys.size&&now-lastStep>140)attempt([...keys].at(-1));
 if(!keys.size&&now-lastStep>160)player.moving=false;
 const ratio=Math.min(1,dt/90);
 player.rx+=(player.x-player.rx)*ratio;player.ry+=(player.y-player.ry)*ratio;
 const w=canvas.width,h=canvas.height;
 const targetX=Math.max(0,Math.min(WIDTH*TILE-w,(player.rx+.5)*TILE-w/2));
 const targetY=Math.max(0,Math.min(HEIGHT*TILE-h,(player.ry+.5)*TILE-h/2));
 camera.x+=(targetX-camera.x)*Math.min(1,dt/130);
 camera.y+=(targetY-camera.y)*Math.min(1,dt/130);
 const cx=Math.round(camera.x),cy=Math.round(camera.y);
 ctx.drawImage(world,cx,cy,w,h,0,0,w,h);
 const heroX=Math.round((player.rx+.5)*TILE-cx),heroY=Math.round((player.ry+.8)*TILE-cy);
 const miraX=(MIRA.x+.5)*TILE-cx,miraY=(MIRA.y+.8)*TILE-cy;
 if(heroY>miraY){drawMira(miraX,miraY,now);drawHero(heroX,heroY,player.dir,player.moving,now);}
 else{drawHero(heroX,heroY,player.dir,player.moving,now);drawMira(miraX,miraY,now);}
 ctx.fillStyle='#f7e5a7';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('VOUS',heroX,heroY-96);
 position.textContent='X '+player.x+' / Y '+player.y;miniPos.textContent=player.x+' · '+player.y;
 hint.hidden=!near(player,MIRA,2);
 if((now|0)%8===0)drawMinimap();
 requestAnimationFrame(animate);
}
notify('Bienvenue dans le Vallon ! Trouve Mira, la guide.');
requestAnimationFrame(animate);
