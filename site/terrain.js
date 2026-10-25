// Décors originaux d'Éclats d'Astria : pixel art 32 px, sprites originaux arbres et herbes validés version 0.1.10.
const TILE_SIZE=32;
const C={
  grass:['#4d8d55','#478950','#52935a','#44874e'],
  blades:['#357645','#367b47','#81b979','#326f43'],
  earth:['#ac8d64','#a68760','#b59a6e','#9d7f58'],
  earthShade:'#ac9875',
  water:['#30778e','#387f95','#438fa2','#286d87'],
  timber:'#765542',timberDark:'#49382f',
  evergreen:['#214c48','#285a4c','#2c6651','#347556','#438763','#63a36e','#94bd74']
};
const choose=(noise,x,y,seed,n)=>Math.floor(noise(x,y,seed)*n);
// 8 variantes de prairie + 8 variantes de terre, extraites de la proposition n°2.
// Elles sont affichées à leur taille native de 32 px, sans lissage.
export const GROUND_ATLAS=Object.freeze({width:256,height:64,columns:8,variants:8,tile:32});
function atlasGround(g,img,px,py,type,noise,x,y){
 const variant=choose(noise,x,y,205,GROUND_ATLAS.variants);
 const sy=(type==='path'||type==='door')?32:0;
 g.drawImage(img,variant*32,sy,32,32,px,py,32,32);
}
function pathFringe(g,px,py,x,y,noise,tileAt){
 const path=t=>t==='path'||t==='door';
 // Bord de chemin irrégulier, conservé même lorsque les tuiles sont adjacentes.
 if(!path(tileAt(x,y-1))){
   for(let i=0;i<8;i++){
     const dy=choose(noise,x*9+i,y,252+i,3);
     box(g,px+i*4,py,4,1+dy,i%3===0?'#2e703c':'#357c41');
     if(i%3===1)box(g,px+i*4+2,py+2,2,1,'#b18a55');
   }
 }
 if(!path(tileAt(x,y+1))){
   for(let i=0;i<8;i++){
     const dy=choose(noise,x*11+i,y,261+i,3);
     box(g,px+i*4,py+30-dy,4,2+dy,i%2?'#28713d':'#3f8349');
   }
 }
 if(!path(tileAt(x-1,y))){
   for(let i=0;i<8;i++)box(g,px,py+i*4,1+choose(noise,x,y*11+i,280+i,3),4,i%2?'#367840':'#276c38');
 }
 if(!path(tileAt(x+1,y))){
   for(let i=0;i<8;i++)box(g,px+30,py+i*4,1+choose(noise,x,y*9+i,290+i,2),4,i%2?'#367840':'#276c38');
 }
}
function box(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h);}
function poly(g,points,color){
 g.fillStyle=color;g.beginPath();g.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);
 g.closePath();g.fill();
}
function ground(g,x,y,type,noise,tileAt,groundAtlas=null){
 const px=x*32, py=y*32, n=choose(noise,x,y,5,4);
 if(groundAtlas&&type!=='water'){
   atlasGround(g,groundAtlas,px,py,type,noise,x,y);
   if(type==='path'||type==='door')pathFringe(g,px,py,x,y,noise,tileAt);
   return;
 }
 box(g,px,py,32,32,C.grass[n]);
 for(let j=0;j<9;j++){
  const ax=choose(noise,x*19+j*7,y,18+j,29)+1;
  const ay=choose(noise,x,y*13+j*11,23+j,28)+2;
  const cc=C.blades[(j+n)%4];
  box(g,px+ax,py+ay,2,j%3===0?4:2,cc);
  if(j%4===0)box(g,px+ax+3,py+ay+2,2,2,'#9abe82');
 }
 if(type==='path'||type==='door'){
  // Bordure de terre irrégulière, sans jointure artificielle entre les cases.
  box(g,px,py,32,32,C.earth[(n+1)%4]);
  if(!['path','door'].includes(tileAt(x,y-1))){
   box(g,px,py,32,3,'#8e9b6f');box(g,px+3,py+3,26,2,'#e5d2aa');
  }
  if(!['path','door'].includes(tileAt(x,y+1))){
   box(g,px,py+28,32,4,'#957f62');
   box(g,px+2,py+27,29,2,'#e3cc9f');
  }
  if(!['path','door'].includes(tileAt(x-1,y)))box(g,px,py+5,3,22,'#9eab7a');
  if(!['path','door'].includes(tileAt(x+1,y)))box(g,px+29,py+5,3,22,'#967e5b');
  for(let j=0;j<8;j++){
   const dx=choose(noise,x*17+j,y,40+j,27)+2;
   const dy=choose(noise,x,y*17+j,55+j,25)+3;
   box(g,px+dx,py+dy,j%3===0?4:2,2,j%2?'#f2dbb0':'#b49c77');
  }
  if(noise(x,y,39)<.20){box(g,px+13,py+12,6,3,'#e6d4ab');box(g,px+12,py+15,7,1,'#ad9879');}
 }
 if(type==='water'){
  box(g,px,py,32,32,C.water[n]);
  for(let j=0;j<5;j++){
   const sx=choose(noise,x+j,y,76+j,25);
   const sy=choose(noise,x,y+j,92+j,29);
   box(g,px+sx,py+sy,5+j%3,2,j%2?'#4e9fb0':'#276b85');
  }
  for(const [dx,dy,side] of [[0,-1,'top'],[0,1,'bottom'],[-1,0,'left'],[1,0,'right']]){
   if(tileAt(x+dx,y+dy)!=='water'){
    const color='#84ad88', foam='#c0ceb0';
    if(side==='top'){box(g,px,py,32,3,color);box(g,px+4,py+3,22,2,foam);}
    if(side==='bottom'){box(g,px,py+28,32,4,color);box(g,px+5,py+26,21,2,foam);}
    if(side==='left'){box(g,px,py,3,32,color);box(g,px+3,py+6,2,20,foam);}
    if(side==='right'){box(g,px+29,py,3,32,color);box(g,px+27,py+4,2,23,foam);}
   }
  }
  if(noise(x,y,128)<.11){
   box(g,px+12,py+16,13,4,'#638d5e');box(g,px+16,py+12,5,6,'#91b973');
   box(g,px+19,py+15,2,2,'#3b6c46');
  }
 }
}
function wildflower(g,px,py,petals){
 box(g,px-1,py+2,2,8,'#377a57');
 box(g,px-5,py+5,5,3,'#4f9a6c');
 box(g,px+1,py+6,5,2,'#5da36c');
 box(g,px-3,py-2,5,4,petals);
 box(g,px-5,py,3,3,petals);box(g,px+2,py,3,3,petals);
 box(g,px-2,py+2,4,3,petals);box(g,px-1,py,2,2,'#f6d57e');
}

function shrub(g,px,py,variant=0){
 // Petits buissons occupant seulement le centre d'une tuile.
 const x=px+5,y=py+8;
 box(g,x+2,y+12,21,7,'#264d45');
 box(g,x,y+7,25,10,'#286751');
 box(g,x+4,y+4,18,11,variant?'#367a5a':'#398360');
 box(g,x+7,y,13,8,'#469969');
 box(g,x+6,y+5,6,2,'#81b976');
 box(g,x+17,y+11,4,2,'#6eac75');
}
function drawReeds(g,px,py,noise,x,y){
 // Grappes d'herbes espacées, avec des tiges étroites et lisibles.
 for(let j=0;j<2;j++){
  const bx=px+3+j*13+(noise(x,y,j+91)*3|0);
  const top=py+9+(j===0?3:0);
  box(g,bx,top+9,12,12,'#244f3b');
  for(let i=0;i<4;i++){
   const h=11+((i+j)%3)*3;
   box(g,bx+i*3,py+29-h,2,h,'#2e6449');
   box(g,bx+i*3+1,py+26-h,2,h, i%2?'#4f985d':'#3c8454');
   box(g,bx+i*3+1,py+29-h,1,5,'#a4ca7a');
  }
 }
}
// Planche 320x145 : 4 arbres (80x90), 4 herbes (80x55).
// Les images se placent par le pied afin de suivre les cases de collision.
export const FOLIAGE_ATLAS=Object.freeze({width:320,height:145,columns:4,frameWidth:80,treeHeight:90,grassHeight:55});
function atlasTree(g,atlas,x,y,noise){
 const frame=choose(noise,x,y,46,4);
 const centerX=(x+.5)*32,footY=(y+1)*32;
 g.drawImage(atlas,frame*80,0,80,90,Math.round(centerX-56),Math.round(footY-126),112,126);
}
function atlasGrass(g,atlas,x,y,noise){
 const frame=choose(noise,x,y,47,4);
 const centerX=(x+.5)*32,footY=(y+1)*32;
 g.drawImage(atlas,frame*80,90,80,55,Math.round(centerX-44),Math.round(footY-61),88,61);
}
function grasses(g,x,y,type,noise,atlas=null){
 const px=x*32,py=y*32;
 if(type==='tallgrass'){
  if(atlas)atlasGrass(g,atlas,x,y,noise);
  else drawReeds(g,px,py,noise,x,y);
 }
 if(type==='flower'){
  if(noise(x,y,57)<.25){
   shrub(g,px,py,choose(noise,x,y,58,2));
  }else{
   wildflower(g,px+11,py+14,noise(x,y,37)<.5?'#f0d4e3':'#fff0ba');
   wildflower(g,px+23,py+19,noise(x,y,52)<.5?'#f8b4b9':'#f7e8ad');
  }
 }
 if(type==='grass'&&noise(x,y,105)<.085){
  box(g,px+9,py+15,8,4,'#6daf70');
  box(g,px+10,py+11,2,8,'#447e52');
  box(g,px+19,py+14,3,5,'#5b945c');
 }
}
function tree(g,x,y,noise){
 const px=x*32,py=y*32,cx=px+16+choose(noise,x,y,61,3)-1;
 // Houppiers environ 30% plus volumineux, racines ancrées dans la case.
 box(g,cx-16,py+27,32,6,'#315f4a');
 box(g,cx-6,py+5,13,26,'#463c36');
 box(g,cx-3,py+8,6,21,'#795744');
 box(g,cx-9,py+27,5,3,'#665044');box(g,cx+6,py+28,7,3,'#695044');
 if(noise(x,y,66)<.22){
  for(const [yy,half] of [[-31,9],[-22,15],[-11,20],[2,24]]){
   box(g,cx-half,py+yy+7,half*2,11,'#163f3f');
   box(g,cx-half+3,py+yy+2,half*2-6,10,'#28654d');
   box(g,cx-half+6,py+yy,half*2-12,6,'#3b8658');
   box(g,cx-half+8,py+yy+4,7,3,'#7dae6c');
  }
  box(g,cx-5,py-26,10,4,'#94bb78');
 }else{
  box(g,cx-21,py+8,43,16,'#183e3c');
  box(g,cx-26,py+1,53,19,'#1c5144');
  box(g,cx-22,py-15,45,29,'#245f49');
  box(g,cx-17,py-26,35,22,'#2b7352');
  box(g,cx-11,py-33,24,16,'#397f54');
  box(g,cx-22,py-6,19,17,'#368154');
  box(g,cx+10,py-14,17,23,'#2e744e');
  box(g,cx-21,py+6,12,7,'#3f9260');
  box(g,cx+12,py-22,8,5,'#46925c');
  for(let i=0;i<11;i++){
   const ox=(noise(x+i*13,y,113+i)*36|0)-18;
   const oy=(noise(x,y+i*17,132+i)*31|0)-24;
   box(g,cx+ox,py+oy,5+(i%2),3,
    i%3===0?'#a0c776':i%3===1?'#6fb16d':'#4a985f');
  }
 }
}
function pane(g,x,y){
 box(g,x-3,y-3,37,35,'#614938');
 box(g,x,y,30,28,'#e3bd7d');
 box(g,x+3,y+3,24,22,'#365e72');
 box(g,x+5,y+5,20,17,'#79bbca');
 box(g,x+7,y+6,7,13,'#a2d7d9');box(g,x+15,y+5,2,19,'#f1d7a3');
 box(g,x+4,y+15,22,2,'#f1d7a3');
 box(g,x-4,y+27,39,5,'#9b7454');
 box(g,x-2,y+27,33,2,'#e4c38c');
}

function house(g,x,y,roofVariant,doorColumn,noise){
 // Façade compacte : largeur cinq cases, entrée toujours sur la bonne case.
 const sx=x*32,sy=y*32,w=160;
 const red=roofVariant==='roof';
 const p=red?{dark:'#713f45',mid:'#aa5a59',lit:'#d88674',hi:'#efac82'}:
             {dark:'#354e60',mid:'#507f85',lit:'#6b9da1',hi:'#a1bec1'};
 box(g,sx+5,sy+64,150,62,'#6d5544');
 box(g,sx+8,sy+66,144,57,red?'#e4ce9d':'#d6d2ac');
 box(g,sx+9,sy+69,142,5,'#f2ddaa');
 box(g,sx+8,sy+116,144,8,'#a38d6a');
 // Charpente : toiture à pente et petits rangs de tuiles.
 poly(g,[[sx,sy+65],[sx+13,sy+13],[sx+28,sy+1],[sx+131,sy+1],[sx+147,sy+13],[sx+w,sy+65]],p.dark);
 poly(g,[[sx+5,sy+61],[sx+19,sy+17],[sx+33,sy+6],[sx+127,sy+6],[sx+141,sy+17],[sx+155,sy+61]],p.mid);
 box(g,sx+31,sy+6,99,4,p.hi);
 for(let row=0;row<5;row++){
  const yy=sy+18+row*9;
  box(g,sx+17,yy,126,2,row%2?p.dark:p.lit);
  for(let col=0;col<8;col++){
   const xx=sx+20+col*17+(row%2?7:0);
   if(xx>sx+137)break;
   box(g,xx,yy+2,2,5,p.dark);
  }
 }
 box(g,sx+1,sy+60,158,6,p.dark);
 box(g,sx+6,sy+62,148,3,p.hi);
 // Cheminée basse, lucarne et poutres.
 box(g,sx+120,sy-3,17,23,'#6f5446');
 box(g,sx+118,sy-5,21,5,'#c08f72');
 box(g,sx+124,sy+2,8,10,'#a9785d');
 for(const bx of [12,143]){
  box(g,sx+bx,sy+69,5,53,'#684a3e');
  box(g,sx+bx+1,sy+72,2,47,'#ae7e55');
 }
 // Deux fenêtres qui restent sur les cases logiques du bâtiment.
 for(const wx of [sx+23,sx+121]){
  box(g,wx-2,sy+78,24,26,'#614938');
  box(g,wx,sy+79,20,21,'#e3bd7d');
  box(g,wx+3,sy+81,14,15,'#79bbca');
  box(g,wx+9,sy+81,2,15,'#f1d7a3');
  box(g,wx+2,sy+88,16,2,'#f1d7a3');
  box(g,wx-3,sy+100,26,4,'#9b7454');
 }
 // Porte visuellement alignée sur x=11 ou x=35.
 const dx=sx+doorColumn*32+4;
 box(g,dx-3,sy+83,30,42,'#604334');
 box(g,dx,sy+87,24,38,'#b38359');
 box(g,dx+4,sy+91,16,34,'#7a4e40');
 box(g,dx+19,sy+105,3,3,'#efca83');
 box(g,dx-6,sy+124,36,4,'#bdafa0');
 // Jardinières basses pour une façade vivante.
 for(const ax of [sx+10,sx+140]){
  box(g,ax,sy+112,14,11,'#805a42');
  box(g,ax+1,sy+108,12,5,'#4d9561');
  wildflower(g,ax+7,sy+107,red?'#f0abc0':'#f8deb2');
 }
}
// Deux cottages RPG transparents (gauche : vert, droite : rouge).
export const HOUSES_ATLAS=Object.freeze({width:384,height:176,columns:2,frameWidth:192,frameHeight:176});
function atlasHouse(g,atlas,x,y,frame){
 const centerX=(x+2.5)*32;
 const bottomY=(y+4)*32;
 // La porte tombe au centre de la case d'entrée existante (x11 ou x35).
 // Sprite source affiché pixel pour pixel : aucun agrandissement destructeur.
 g.drawImage(atlas,frame*192,0,192,176,Math.round(centerX-96),Math.round(bottomY-176),192,176);
}
export function renderTerrain(g,width,height,tileAt,noise,atlas=null,houses=null,groundAtlas=null){
 g.imageSmoothingEnabled=false;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  ground(g,x,y,tileAt(x,y),noise,tileAt,groundAtlas);
 }
 // Avant les grands objets, poser les fleurs et buissons.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const type=tileAt(x,y);
  if(['grass','tallgrass','flower'].includes(type))grasses(g,x,y,type,noise,atlas);
 }
 // Arbres en profondeur, de la rangée du fond vers celle de l'avant.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  if(['tree','void'].includes(tileAt(x,y))){
   if(atlas)atlasTree(g,atlas,x,y,noise);
   else tree(g,x,y,noise);
  }
 }
 // Images validées par l'utilisateur ; tracés existants en secours si l'atlas tarde.
 if(houses){
  atlasHouse(g,houses,9,9,0);
  atlasHouse(g,houses,33,9,1);
 }else{
  house(g,9,9,'roof',2,noise);
  house(g,33,9,'roof2',2,noise);
 }
}
export function drawWaterAnimation(ctx,camX,camY,now,tileAt,width,height){
 // Quelques reflets animés, sans allocation d'image par frame.
 const wave=Math.floor(now/260);
 const x0=Math.max(0,Math.floor(camX/32)-1),x1=Math.min(width,Math.ceil((camX+ctx.canvas.width)/32)+1);
 const y0=Math.max(0,Math.floor(camY/32)-1),y1=Math.min(height,Math.ceil((camY+ctx.canvas.height)/32)+1);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  if(tileAt(x,y)!=='water')continue;
  const offset=(x*7+y*3+wave)%23;
  box(ctx,x*32-camX+offset,y*32-camY+11,6,2,'#86c9ca');
 }
}
