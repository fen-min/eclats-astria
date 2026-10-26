// Wouf — spritesheet originale de l'utilisateur. Le même atlas sert aux vues 3/4 et aux actions.
// Certaines bandes n'ont pas autant de poses distinctes que les cadences cibles :
// le moteur répète des poses plutôt que d'inventer de nouveaux dessins.
export const WOUF_SHEET=Object.freeze({width:420,height:669});
const ORIGINAL=Object.freeze({width:994,height:1583});
const ROWS=Object.freeze({
 sideIdle:{y:0,height:130,step:125,count:5},
 sideWalk:{y:130,height:120,step:125,count:6},
 front:{y:250,height:125,step:115,count:6},
 back:{y:375,height:130,step:112,count:6},
 jump:{y:505,height:130,step:150,count:6},
 reaction:{y:635,height:130,step:150,count:6},
 attack:{y:765,height:145,step:160,count:6},
 power:{y:910,height:140,step:158,count:5},
 scary:{y:1050,height:110,step:156,count:6},
 dodge:{y:1160,height:130,step:185,count:5},
 sleep:{y:1290,height:130,step:150,count:4},
 elemental:{y:1420,height:163,step:140,count:7}
});
const A={
 idle:{label:'Repos (profil)',frames:4,fps:3,row:'sideIdle'},
 idle_front:{label:'Repos (face)',frames:4,fps:3,row:'front'},
 idle_back:{label:'Repos (dos)',frames:4,fps:3,row:'back'},
 walk:{label:'Marche (profil)',frames:8,fps:8,row:'sideWalk'},
 walk_front:{label:'Marche (face)',frames:8,fps:8,row:'front'},
 walk_back:{label:'Marche (dos)',frames:8,fps:8,row:'back'},
 jump:{label:'Saut',frames:6,fps:9,row:'jump'},
 hit:{label:'Dégâts',frames:4,fps:8,row:'reaction',indices:[0,1,2,3]},
 fainted:{label:'K.O.',frames:5,fps:5,row:'reaction',indices:[1,2,3,4,5]},
 basic:{label:'Attaque normale',frames:6,fps:10,row:'attack'},
 special:{label:'Attaque spéciale',frames:8,fps:9,row:'elemental'},
 claw:{label:'Morsure / griffes',frames:6,fps:10,row:'attack'},
 boost:{label:'Amélioration',frames:6,fps:8,row:'power'},
 angry:{label:'Intimidation',frames:4,fps:6,row:'scary'},
 dodge:{label:'Esquive / fouille',frames:8,fps:10,row:'dodge'},
 sleep:{label:'Sommeil',frames:4,fps:3,row:'sleep'},
 elemental:{label:'Effet élémentaire',frames:8,fps:9,row:'elemental'}
};
export const WOUF_ANIMATIONS=Object.freeze(Object.fromEntries(
 Object.entries(A).map(([name,value])=>[name,Object.freeze(value)])
));
function clampFrame(value,frames){
 return Math.max(0,Math.min(frames-1,Number.isFinite(value)?Math.floor(value):0));
}
export function woufFrameRect(kind,frame=0){
 const animation=WOUF_ANIMATIONS[kind]||WOUF_ANIMATIONS.idle;
 const row=ROWS[animation.row];
 const i=clampFrame(frame,animation.frames);
 const source=animation.indices
  ?animation.indices[i]
  :Math.min(row.count-1,Math.floor(i*row.count/animation.frames));
 const factorX=WOUF_SHEET.width/ORIGINAL.width;
 const factorY=WOUF_SHEET.height/ORIGINAL.height;
 const x=Math.round(source*row.step*factorX);
 const y=Math.round(row.y*factorY);
 const endX=Math.round((source+1)*row.step*factorX);
 const endY=Math.round((row.y+row.height)*factorY);
 return {x,y,width:Math.max(1,Math.min(WOUF_SHEET.width-x,endX-x)),
  height:Math.max(1,Math.min(WOUF_SHEET.height-y,endY-y)),
  sourceFrame:source};
}
export function woufAnimation(now,dir,moving,forced=null){
 if(forced&&WOUF_ANIMATIONS[forced.kind]){
  const a=WOUF_ANIMATIONS[forced.kind];
  return {kind:forced.kind,frame:clampFrame(
   (now-forced.startedAt)/(1000/a.fps),a.frames)};
 }
 const kind=moving?(dir==='down'?'walk_front':dir==='up'?'walk_back':'walk')
                  :(dir==='down'?'idle_front':dir==='up'?'idle_back':'idle');
 const a=WOUF_ANIMATIONS[kind];
 return {kind,frame:Math.floor(Math.max(0,now)/(1000/a.fps))%a.frames};
}
