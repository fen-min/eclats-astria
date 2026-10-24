// Décors originaux d'Éclats d'Astria : pixel art 32 px, aucune image Pokémon.
const TILE_SIZE=32;
const C={
  grass:['#659c76','#6da680','#75ae81','#5e966f'],
  blades:['#4f8b60','#40865e','#98c483','#3e7856'],
  earth:['#d7c29a','#cbb58d','#decaa2','#c1a77c'],
  earthShade:'#ac9875',
  water:['#30778e','#387f95','#438fa2','#286d87'],
  timber:'#765542',timberDark:'#49382f',
  evergreen:['#214c48','#285a4c','#2c6651','#347556','#438763','#63a36e','#94bd74']
};
const choose=(noise,x,y,seed,n)=>Math.floor(noise(x,y,seed)*n);
function box(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h);}
function poly(g,points,color){
 g.fillStyle=color;g.beginPath();g.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);
 g.closePath();g.fill();
}
function ground(g,x,y,type,noise,tileAt){
 const px=x*32, py=y*32, n=choose(noise,x,y,5,4);
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
 box(g,px+2,py+13,28,13,'#264d45');
 box(g,px+0,py+10,32,10,'#286751');
 box(g,px+4,py+6,25,15,variant?'#367a5a':'#398360');
 box(g,px+8,py+3,17,12,'#469969');
 box(g,px+9,py+6,8,3,'#81b976');box(g,px+21,py+11,5,3,'#6eac75');
 box(g,px+3,py+20,25,4,'#255743');
}
function grasses(g,x,y,type,noise){
 const px=x*32,py=y*32;
 if(type==='tallgrass'){
  box(g,px+1,py+24,30,6,'#457d57');
  for(let i=0;i<6;i++){
   const ox=px+1+i*5, h=13+(i%3)*4;
   box(g,ox+1,py+30-h,5,h,'#2c684f');
   box(g,ox+2,py+29-h,3,h-2,(i%2?'#4a925e':'#36845d'));
   box(g,ox+3,py+31-h,2,8,'#a2cb7a');
   box(g,ox,py+21,2,7,'#216447');
  }
 }
 if(type==='flower'){
  if(noise(x,y,57)<.35){shrub(g,px+1,py+5,choose(noise,x,y,58,2));return;}
  wildflower(g,px+10,py+12,noise(x,y,37)<.5?'#f0d4e3':'#fff0ba');
  wildflower(g,px+23,py+18,noise(x,y,52)<.5?'#f8b4b9':'#f7e8ad');
  box(g,px+3,py+6,6,3,'#a3c785');
 }
 if(type==='grass'&&noise(x,y,105)<.085){
  box(g,px+9,py+13,9,5,'#6daf70');box(g,px+10,py+9,3,9,'#447e52');
  box(g,px+19,py+12,4,7,'#5b945c');
 }
}
function tree(g,x,y,noise){
 const px=x*32,py=y*32;
 const sway=choose(noise,x,y,61,5)-2;
 const cx=px+16+sway;
 // Ombre profonde et racines.
 box(g,cx-16,py+25,35,8,'#315f4a');
 box(g,cx-6,py+9,14,24,'#463c36');
 box(g,cx-3,py+13,5,16,'#795744');
 box(g,cx-11,py+27,7,3,'#665044');box(g,cx+6,py+28,7,3,'#695044');
 if(noise(x,y,66)<.24){
  // Pin élancé : plusieurs étages en chevrons pixellisés.
  const tiers=[[py-25,9],[py-17,16],[py-8,22],[py+2,26],[py+12,28]];
  tiers.forEach(([yy,half],i)=>{
   box(g,cx-half-1,yy+6,half*2+3,9,'#163f3f');
   box(g,cx-half+3,yy+1,half*2-5,8,'#28654d');
   box(g,cx-half+8,yy-3,half*2-15,6,'#3b8658');
   box(g,cx-half+9,yy,7,3,'#7dae6c');
   if(i>1)box(g,cx+8,yy+8,9,3,'#1f5643');
  });
 }else{
  // Houppier volumineux : silhouettes étagées + reflets en touffes.
  box(g,cx-17,py-2,35,30,'#183e3c');
  box(g,cx-24,py+5,48,14,'#1c5144');
  box(g,cx-20,py-14,40,29,'#245f49');
  box(g,cx-13,py-25,29,22,'#2b7352');
  box(g,cx-7,py-30,18,16,'#397f54');
  box(g,cx-19,py-11,27,16,'#368154');
  box(g,cx+3,py-14,21,25,'#2e744e');
  box(g,cx-22,py+2,14,11,'#3f9260');
  box(g,cx+6,py-23,12,9,'#46925c');
  for(let i=0;i<12;i++){
   const ox=(noise(x+i*13,y,113+i)*35|0)-18;
   const oy=(noise(x,y+i*17,132+i)*31|0)-21;
   box(g,cx+ox,py+oy,4+(i%2)*2,3,
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
 const sx=x*32, sy=y*32, w=256;
 const red=roofVariant==='roof';
 const p=red?{dark:'#713f45',mid:'#aa5a59',lit:'#d88674',hi:'#efac82'}:
             {dark:'#354e60',mid:'#507f85',lit:'#6b9da1',hi:'#a1bec1'};
 // Maison complète : toit incliné, façade en bois/plâtre, fenêtres et porte.
 box(g,sx+2,sy+171,w+5,17,'#446048');
 box(g,sx+8,sy+93,w-16,94,'#735742');
 box(g,sx+13,sy+99,w-26,85,red?'#e4ce9d':'#d6d2ac');
 box(g,sx+16,sy+105,w-32,8,red?'#f2ddaa':'#e9dfba');
 for(let j=0;j<9;j++)box(g,sx+20+j*25,sy+116,2,63,'#c5b181');
 // Wooden uprights and corners.
 for(const off of [11,36,219,241]){
  box(g,sx+off,sy+99,7,86,C.timberDark);
  box(g,sx+off+2,sy+102,2,78,'#ab7e56');
 }
 box(g,sx+11,sy+175,w-22,10,'#876b4f');
 box(g,sx+12,sy+176,w-24,3,'#c7aa7c');
 // Shingled roof with a stepped upper silhouette.
 poly(g,[[sx-6,sy+101],[sx+8,sy+26],[sx+33,sy+8],[sx+w-35,sy+8],[sx+w-9,sy+26],[sx+w+7,sy+101]],p.dark);
 poly(g,[[sx,sy+92],[sx+16,sy+29],[sx+40,sy+13],[sx+w-42,sy+13],[sx+w-17,sy+29],[sx+w,sy+92]],p.mid);
 box(g,sx+32,sy+13,w-64,5,p.hi);
 for(let row=0;row<8;row++){
  const yy=sy+25+row*9;
  if(yy>sy+89)break;
  box(g,sx+20,yy,w-40,2,row%2?p.dark:p.lit);
  for(let col=0;col<13;col++){
   const xx=sx+20+col*18+(row%2?9:0);
   if(xx>=sx+w-22)break;
   box(g,xx,yy+2,2,5,row%2?p.lit:p.dark);
  }
 }
 box(g,sx-4,sy+91,w+8,11,p.dark);
 box(g,sx+1,sy+92,w-2,3,p.hi);
 box(g,sx+3,sy+99,w-6,4,'#e3cf9c');
 // Cheminée, ventilateurs, tuiles d'ornement.
 box(g,sx+w-56,sy-2,27,36,'#6f5446');
 box(g,sx+w-59,sy-4,33,8,'#c08f72');
 box(g,sx+w-51,sy+4,17,14,'#a9785d');
 box(g,sx+w-45,sy+11,5,5,'#634940');
 for(let k=0;k<4;k++)box(g,sx+51+k*47,sy+54,17,3,p.hi);
 // Deux fenêtres écartées de l'accès central.
 pane(g,sx+45,sy+125);
 pane(g,sx+179,sy+125);
 // Porte à la colonne du tile logique (accessible par les routes).
 const dx=sx+doorColumn*32+1;
 box(g,dx-5,sy+115,42,70,'#604334');
 box(g,dx-1,sy+119,34,67,'#b38359');
 box(g,dx+5,sy+125,24,61,'#7a4e40');
 box(g,dx+18,sy+126,3,60,'#573b34');
 box(g,dx+25,sy+151,4,4,'#efca83');
 box(g,dx-12,sy+183,55,6,'#bdafa0');
 box(g,dx-6,sy+187,43,5,'#8a7c69');
 // Plantes et caisses décoratives en façade.
 for(const ax of [sx+26,sx+214]){
  box(g,ax,sy+167,21,15,'#805a42');
  box(g,ax+3,sy+169,15,8,'#477c50');
  box(g,ax-2,sy+164,24,5,'#4d9561');
  box(g,ax+8,sy+157,6,6,'#78b96d');
  wildflower(g,ax+11,sy+159,red?'#f0abc0':'#f8deb2');
 }
}
export function renderTerrain(g,width,height,tileAt,noise){
 g.imageSmoothingEnabled=false;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  ground(g,x,y,tileAt(x,y),noise,tileAt);
 }
 // Avant les grands objets, poser les fleurs et buissons.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const type=tileAt(x,y);
  if(['grass','tallgrass','flower'].includes(type))grasses(g,x,y,type,noise);
 }
 // Arbres en profondeur, de la rangée du fond vers celle de l'avant.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  if(['tree','void'].includes(tileAt(x,y)))tree(g,x,y,noise);
 }
 // Les maisons couvrent les tuiles techniques roof / wall / door.
 house(g,8,7,'roof',3,noise);
 house(g,31,7,'roof2',4,noise);
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
