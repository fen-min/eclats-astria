// Wouf, chien démon sombre aux flammes rouges.
// Chaque pose est désormais isolée dans une cellule transparente de l'atlas :
// les anciennes découpes irrégulières faisaient apparaître des fragments voisins.
// La planche d'origine ne comporte pas de face/dos : on réutilise le profil.
export const WOUF_CELL=Object.freeze({width:112,height:100});
export const WOUF_SHEET=Object.freeze({width:896,height:1300});
const ROWS=Object.freeze({
 idle:0,walk:1,jump:2,hit:3,fainted:4,basic:5,special:6,
 claw:7,boost:8,angry:9,dodge:10,sleep:11,elemental:12
});
const A={
 idle:{label:'Repos (profil)',frames:4,fps:3,row:'idle'},
 idle_front:{label:'Repos (face : profil provisoire)',frames:4,fps:3,row:'idle'},
 idle_back:{label:'Repos (dos : profil provisoire)',frames:4,fps:3,row:'idle'},
 walk:{label:'Marche (profil)',frames:8,fps:8,row:'walk'},
 walk_front:{label:'Marche (face : profil provisoire)',frames:8,fps:8,row:'walk'},
 walk_back:{label:'Marche (dos : profil provisoire)',frames:8,fps:8,row:'walk'},
 jump:{label:'Saut',frames:6,fps:9,row:'jump'},
 hit:{label:'Dégâts',frames:4,fps:8,row:'hit'},
 fainted:{label:'K.O.',frames:5,fps:5,row:'fainted'},
 basic:{label:'Attaque normale',frames:6,fps:10,row:'basic'},
 special:{label:'Attaque spéciale',frames:8,fps:9,row:'special'},
 claw:{label:'Morsure / griffes',frames:6,fps:10,row:'claw'},
 boost:{label:'Amélioration',frames:6,fps:8,row:'boost'},
 angry:{label:'Intimidation',frames:4,fps:6,row:'angry'},
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
 const index=clampFrame(frame,animation.frames);
 return {x:index*WOUF_CELL.width,y:ROWS[animation.row]*WOUF_CELL.height,
  width:WOUF_CELL.width,height:WOUF_CELL.height,sourceFrame:index};
}
export function woufAnimation(now,dir,moving,forced=null){
 if(forced&&WOUF_ANIMATIONS[forced.kind]){
  const a=WOUF_ANIMATIONS[forced.kind];
  return {kind:forced.kind,frame:clampFrame((now-forced.startedAt)/(1000/a.fps),a.frames)};
 }
 const kind=moving?(dir==='down'?'walk_front':dir==='up'?'walk_back':'walk')
                  :(dir==='down'?'idle_front':dir==='up'?'idle_back':'idle');
 const a=WOUF_ANIMATIONS[kind];
 return {kind,frame:Math.floor(Math.max(0,now)/(1000/a.fps))%a.frames};
}
