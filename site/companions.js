// Compagnons : Miaw et Wouf, choix, navigation libre et collisions.
export const COMPANIONS=Object.freeze([
 Object.freeze({id:'miaw',name:'Miaw',role:'DPS',sprite:'miaw-actions.base64',description:'Chaton démon orange et noir'}),
 Object.freeze({id:'wouf',name:'Wouf',role:'Tank',sprite:'wouf-actions.base64',description:'Chien démon sombre aux flammes rouges'})
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
// La distance se mesure en cases de la grille (Manhattan) : elle
// laisse respirer les grands sprites, sans bloquer le héros.
export const COMPANION_WANDER=Object.freeze({
 minDistance:2,maxDistance:4,stepMs:225,restMinMs:1200,restJitterMs:1600
});
export function companionDistance(a,b){
 return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
}
const COMPANION_DIRECTIONS=Object.freeze([[0,-1],[1,0],[0,1],[-1,0]]);
export function initialCompanionPosition(hero,canWalk){
 // À deux cases si le trajet intermédiaire est libre ; jamais sur le héros.
 const preferred=hero.dir==='down'?[[0,-1],[1,0],[-1,0],[0,1]]:
  hero.dir==='up'?[[0,1],[-1,0],[1,0],[0,-1]]:
  hero.dir==='left'?[[1,0],[0,-1],[0,1],[-1,0]]:
  [[-1,0],[0,1],[0,-1],[1,0]];
 for(const [dx,dy] of preferred){
  const mid={x:hero.x+dx,y:hero.y+dy};
  const destination={x:hero.x+dx*2,y:hero.y+dy*2};
  if(canWalk(mid.x,mid.y)&&canWalk(destination.x,destination.y))return destination;
 }
 for(const [dx,dy] of preferred){
  const x=hero.x+dx,y=hero.y+dy;
  if(canWalk(x,y))return {x,y};
 }
 return {x:hero.x,y:hero.y};
}
/**
 * Calcule un vrai chemin orthogonal sur les cases accessibles, sans traverser
 * ni le héros ni les obstacles (arbres, eau, maisons, limites du monde).
 * Le mode roam choisit aléatoirement une courte promenade de 1 à 3 cases.
 * Le mode return choisit un chemin court vers un anneau à 2–4 cases du héros.
 * Pure et testable : aucun accès au Canvas, au temps ou au localStorage.
 */
export function planCompanionRoute(start,hero,canWalk,mode='return',random=Math.random){
 if(!Number.isInteger(start.x)||!Number.isInteger(start.y)||
    !Number.isInteger(hero.x)||!Number.isInteger(hero.y))return [];
 const roaming=mode==='roam';
 const queue=[{x:start.x,y:start.y,parent:-1,depth:0}];
 const visited=new Set([start.x+','+start.y]);
 const candidates=[];
 const maxNodes=1600; // carte actuelle : 46 × 30 cases.
 for(let index=0;index<queue.length&&queue.length<maxNodes;index++){
  const node=queue[index];
  const distance=companionDistance(node,hero);
  if(node.depth>0&&distance>=COMPANION_WANDER.minDistance&&
     distance<=COMPANION_WANDER.maxDistance&&
     (!roaming||node.depth<=3))candidates.push(index);
  if(roaming&&node.depth>=3)continue;
  for(const [dx,dy] of COMPANION_DIRECTIONS){
   const x=node.x+dx,y=node.y+dy,key=x+','+y;
   if(visited.has(key)||(x===hero.x&&y===hero.y)||!canWalk(x,y))continue;
   visited.add(key);
   queue.push({x,y,parent:index,depth:node.depth+1});
  }
 }
 if(!candidates.length)return [];
 let choice;
 if(roaming){
  const roll=random();
  const sample=Number.isFinite(roll)?roll:0.5;
  choice=candidates[Math.min(candidates.length-1,
   Math.max(0,Math.floor(Math.min(0.999999,Math.max(0,sample))*candidates.length)))];
 }else{
  choice=candidates.reduce((best,index)=>{
   const candidate=queue[index],previous=queue[best];
   const score=candidate.depth*10+Math.abs(companionDistance(candidate,hero)-3);
   const bestScore=previous.depth*10+Math.abs(companionDistance(previous,hero)-3);
   return score<bestScore?index:best;
  },candidates[0]);
 }
 const steps=[];
 for(let i=choice;queue[i].parent!==-1;i=queue[i].parent)
  steps.push({x:queue[i].x,y:queue[i].y});
 return steps.reverse();
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
