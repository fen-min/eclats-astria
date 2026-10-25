// Créatures recrutables et comportement de suivi, indépendants du rendu.
export const COMPANIONS=Object.freeze([
  Object.freeze({id:'miaw',name:'Miaw',role:'DPS',sprite:'miaw-idle.png',description:'Chaton démon orange et noir'})
]);
export const CAT_FRAME=Object.freeze({width:52,height:48,frames:4,rows:4});
export const CAT_ROWS=Object.freeze({down:0,up:1,left:2,right:3});
// Miaw : une spritesheet de marche de 256 × 256, 4 frames par direction.
export const MIAW_WALK_FRAME=Object.freeze({width:64,height:64,frames:4,rows:4});
export const MIAW_WALK_FPS=8;
// Nouvelle planche validée : 8 poses de 64 × 64 à 8 images/seconde.
export const MIAW_MEOW_FRAME=Object.freeze({width:64,height:64,frames:8,rows:1});
export const MIAW_MEOW_FPS=8;
export function companionById(id){
  // Le compagnon reste choisi sur les anciennes sauvegardes.
  return COMPANIONS.find(c=>c.id===(id==='chat-rouge'?'miaw':id))||null;
}
export function miawAnimation(now,dir,moving,idleFor=0){
 if(moving){
  // 4 directions : face, dos, gauche, droite.
  return {kind:'walk',row:CAT_ROWS[dir]??0,frame:Math.floor(now/(1000/MIAW_WALK_FPS))%4};
 }
 if(dir==='down'&&idleFor>=3500){
  // Une seule seconde de miaulement, puis une pause calme.
  // La frame 8 est identique à la frame 1 pour une boucle sans saut.
  const cycle=(idleFor-3500)%8400;
  if(cycle<1000)
   return {kind:'meow',row:0,frame:Math.floor(cycle/(1000/MIAW_MEOW_FPS))};
 }
 return {kind:'idle',row:CAT_ROWS[dir]??0,frame:catIdleFrame(now)};
}
export function initialCompanionPosition(hero,canWalk){
 const offsets={down:[0,-1],up:[0,1],left:[1,0],right:[-1,0]};
 const options=[offsets[hero.dir]||offsets.down,offsets.down,offsets.left,offsets.right,offsets.up];
 for(const [dx,dy] of options){
  const x=hero.x+dx,y=hero.y+dy;
  if(canWalk(x,y))return {x,y};
 }
 return {x:hero.x,y:hero.y};
}
export function appendFootstep(trail,position,maxLength=10){
 const next=[...trail,{x:position.x,y:position.y}];
 return next.slice(-maxLength);
}
export function followTarget(trail){
 return trail.length>1?trail[trail.length-2]:trail[0];
}
export function facingDirection(from,to,previous='down'){
 const dx=to.x-from.x,dy=to.y-from.y;
 if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';
 if(dy!==0)return dy<0?'up':'down';
 return previous;
}
export function catIdleFrame(now){
 return Math.floor(Math.max(0,now)/360)%CAT_FRAME.frames;
}
