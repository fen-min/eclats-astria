// Wouf : atlas sombre aux flammes rouges validé le 26/10/2026.
// La nouvelle planche ne possède que des vues de profil : les orientations
// face/dos réutilisent ces mêmes dessins, sans mélanger l'ancien Wouf bleu.
// Les nombres de frames indiquent les étapes de lecture ; lorsqu'il manque
// des dessins différents, le moteur reprend les poses disponibles.
export const WOUF_SHEET=Object.freeze({width:492,height:800});
const ORIGINAL=Object.freeze({width:984,height:1599});
// Coordonnées de la planche ORIGINALE, ensuite mises à l'échelle pour l'atlas optimisé.
const ROWS=Object.freeze({
 idle:     {y:0,height:124,crops:[[0,124],[124,248],[248,372],[372,500]]},
 walk:     {y:124,height:125,crops:[[0,124],[124,247],[247,370],[370,493],[493,616],[616,739],[739,861],[861,984]]},
 jump:     {y:250,height:125,crops:[[0,140],[140,275],[275,418],[418,558],[558,710]]},
 hit:      {y:375,height:136,crops:[[0,132],[132,261],[261,395]]},
 fainted:  {y:470,height:64,crops:[[390,535],[525,674],[661,830]]},
 basic:    {y:530,height:125,crops:[[0,144],[144,288],[288,438],[438,582],[582,733]]},
 special:  {y:649,height:154,crops:[[0,132],[132,263],[263,400],[400,536],[536,689],[689,828],[828,984]]},
 claw:     {y:805,height:128,crops:[[0,151],[151,319],[319,497],[497,650],[650,811]]},
 boost:    {y:931,height:137,crops:[[0,142],[142,281],[281,422],[422,560],[560,719]]},
 angry:    {y:1066,height:123,crops:[[0,128],[128,261],[261,389]]},
 dodge:    {y:1189,height:136,crops:[[0,147],[147,297],[297,447],[447,565],[565,686],[686,820],[820,984]]},
 sleep:    {y:1306,height:108,crops:[[0,153],[153,307],[307,464],[464,631]]},
 elemental: {y:1412,height:187,crops:[[0,127],[127,247],[247,367],[367,497],[497,627],[627,770],[770,984]]}
});
const A={
 idle:       {label:'Repos (profil)',frames:4,fps:3,row:'idle'},
 idle_front: {label:'Repos (face : profil provisoire)',frames:4,fps:3,row:'idle'},
 idle_back:  {label:'Repos (dos : profil provisoire)',frames:4,fps:3,row:'idle'},
 walk:       {label:'Marche (profil)',frames:8,fps:8,row:'walk'},
 walk_front: {label:'Marche (face : profil provisoire)',frames:8,fps:8,row:'walk'},
 walk_back:  {label:'Marche (dos : profil provisoire)',frames:8,fps:8,row:'walk'},
 jump:       {label:'Saut',frames:6,fps:9,row:'jump'},
 hit:        {label:'Dégâts',frames:4,fps:8,row:'hit'},
 fainted:    {label:'K.O.',frames:5,fps:5,row:'fainted'},
 basic:      {label:'Attaque normale',frames:6,fps:10,row:'basic'},
 special:    {label:'Attaque spéciale',frames:8,fps:9,row:'special'},
 claw:       {label:'Morsure / griffes',frames:6,fps:10,row:'claw'},
 boost:      {label:'Amélioration',frames:6,fps:8,row:'boost'},
 angry:      {label:'Intimidation',frames:4,fps:6,row:'angry'},
 dodge:      {label:'Esquive / fouille',frames:8,fps:10,row:'dodge'},
 sleep:      {label:'Sommeil',frames:4,fps:3,row:'sleep'},
 elemental:  {label:'Effet élémentaire',frames:8,fps:9,row:'elemental'}
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
 const source=Math.min(row.crops.length-1,Math.floor(i*row.crops.length/animation.frames));
 const [fromX,toX]=row.crops[source];
 const factorX=WOUF_SHEET.width/ORIGINAL.width;
 const factorY=WOUF_SHEET.height/ORIGINAL.height;
 const x=Math.round(fromX*factorX);
 const y=Math.round(row.y*factorY);
 const endX=Math.round(toX*factorX);
 const endY=Math.round((row.y+row.height)*factorY);
 return {x,y,width:Math.max(1,Math.min(WOUF_SHEET.width-x,endX-x)),
  height:Math.max(1,Math.min(WOUF_SHEET.height-y,endY-y)),sourceFrame:source};
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