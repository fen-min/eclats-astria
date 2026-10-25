// Créatures recrutables et comportement de suivi, indépendants du rendu.
export const COMPANIONS=Object.freeze([
  Object.freeze({id:'chat-rouge',name:'Chat rouge tigré',role:'DPS',sprite:'chat-rouge-idle.png'})
]);
export const CAT_FRAME=Object.freeze({width:52,height:48,frames:4,rows:4});
export const CAT_ROWS=Object.freeze({down:0,up:1,left:2,right:3});
export function companionById(id){return COMPANIONS.find(c=>c.id===id)||null;}
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
