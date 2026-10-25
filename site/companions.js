// Miaw : planche finale 13 animations, compagnon et logique de suivi.
export const COMPANIONS=Object.freeze([
 Object.freeze({id:'miaw',name:'Miaw',role:'DPS',sprite:'miaw-actions.base64',description:'Chaton démon orange et noir'})
]);
export const MIAW_SHEET=Object.freeze({width:984,height:1599});
// Coordonnées de chaque bande de la planche fournie. Elle ne contient qu'une vue
// latérale ; la vue gauche est retournée horizontalement au rendu.
const ANIMS={
 idle:     {label:'Repos',frames:4,fps:3, y:25,  height:108,step:125},
 walk:     {label:'Marche',frames:8,fps:8, y:140, height:114,step:123},
 jump:     {label:'Saut',frames:6,fps:9, y:252, height:134,step:125},
 hit:      {label:'Dégâts',frames:4,fps:8, y:386, height:108,step:125},
 fainted:  {label:'K.O.',frames:5,fps:6, y:494, height:126,step:130,crops:[[0,125],[121,270],[261,410],[392,613],[598,780]]},
 basic:    {label:'Attaque normale',frames:6,fps:9,y:620,height:123,step:125},
 special:  {label:'Attaque spéciale',frames:8,fps:9,y:740,height:127,step:123},
 claw:     {label:'Griffes / morsure',frames:6,sourceFrames:5,fps:10,y:868,height:111,step:148,crops:[[0,126],[116,292],[278,466],[423,595],[584,777]]},
 boost:    {label:'Amélioration',frames:6,fps:8,y:975,height:152,step:130},
 angry:    {label:'Intimidation',frames:4,fps:6,y:1120,height:125,step:125},
 dodge:    {label:'Esquive / fouille',frames:8,fps:10,y:1243,height:107,step:123},
 sleep:    {label:'Sommeil',frames:4,fps:3,y:1350,height:115,step:125},
 elemental:{label:'Effet élémentaire',frames:8,fps:9,y:1465,height:134,step:123}
};
export const MIAW_ANIMATIONS=Object.freeze(Object.fromEntries(
 Object.entries(ANIMS).map(([name,entry])=>[name,Object.freeze(entry)])
));
export function miawFrameRect(kind,frame=0){
 const anim=MIAW_ANIMATIONS[kind]||MIAW_ANIMATIONS.idle;
 const sourceFrames=anim.sourceFrames||anim.frames;
 const safeFrame=Math.min(sourceFrames-1,Math.max(0,Math.floor(Number.isFinite(frame)?frame:0)));
 const crop=anim.crops?.[safeFrame];
 const x=crop?crop[0]:safeFrame*anim.step;
 const width=crop?crop[1]-crop[0]:anim.step;
 return {x,y:anim.y,width:Math.min(width,MIAW_SHEET.width-x),height:anim.height};
}
export function catIdleFrame(now){
 return Math.floor(Math.max(0,now)/360)%MIAW_ANIMATIONS.idle.frames;
}
export function miawAnimation(now,dir,moving,idleFor=0,forced=null){
 if(forced&&MIAW_ANIMATIONS[forced.kind]){
  const animation=MIAW_ANIMATIONS[forced.kind];
  return {kind:forced.kind,frame:Math.min(animation.frames-1,
   Math.max(0,Math.floor((now-forced.startedAt)/(1000/animation.fps))))};
 }
 if(moving)return {kind:'walk',frame:Math.floor(Math.max(0,now)/(1000/MIAW_ANIMATIONS.walk.fps))%8};
 return {kind:'idle',frame:catIdleFrame(now)};
}
export function companionById(id){
 return COMPANIONS.find(c=>c.id===(id==='chat-rouge'?'miaw':id))||null;
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
