export const WIDTH = 46;
export const HEIGHT = 30;
export const TILE = 32;
export const SPAWN = Object.freeze({x:23,y:16});
export const MIRA = Object.freeze({x:19,y:13});
export const DIRECTIONS = Object.freeze({up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]});
export function noise(x,y,seed=1) {
  let n=(Math.imul(x+53,374761393)+Math.imul(y+91,668265263)+Math.imul(seed,1442695041))|0;
  n=Math.imul(n^(n>>>13),1274126177);
  return ((n^(n>>>16))>>>0)/4294967295;
}
export function tileAt(x,y) {
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=WIDTH||y>=HEIGHT) return 'void';
  const pond=((x-8)/5.2)**2+((y-24)/3.5)**2;
  if(pond<1&&x<15&&y>19) return 'water';
  if(x>=9&&x<=13&&y>=9&&y<=12) {
    if(y<=10) return 'roof';
    if(x===11&&y===12) return 'door';
    return 'wall';
  }
  if(x>=33&&x<=37&&y>=9&&y<=12) {
    if(y<=10) return 'roof2';
    if(x===35&&y===12) return 'door';
    return 'wall';
  }
  if((y>=15&&y<=17&&x>=2&&x<=43)||(x>=22&&x<=24&&y>=4&&y<=27)||
     (x>=11&&x<=12&&y>=12&&y<=17)||(x>=35&&x<=36&&y>=12&&y<=17)) return 'path';
  if(x>=17&&x<=29&&y>=11&&y<=19) return noise(x,y,5)<.1?'flower':'grass';
  // Le bord conserve un rempart infranchissable d'une seule case.
  if(x<1||y<1||x>=WIDTH-1||y>=HEIGHT-1) return 'tree';
  const forest=(x<8&&y<17)||(x>37&&y<14)||(x>35&&y>20)||(x<19&&y<7);
  if(forest&&noise(x,y,31)<.30) return 'tree';
  if(noise(x,y,34)<.035&&y>19&&x>15) return 'tree';
  if(noise(x,y,2)<.14) return 'flower';
  if(noise(x,y,3)<.20) return 'tallgrass';
  return 'grass';
}
// Les houppiers dépassent leur tronc de 1 case sur les côtés et
// de 2 cases vers le haut. Leur ombre est désormais solide.
export function blockedByTreeCanopy(x,y) {
  if(!Number.isInteger(x)||!Number.isInteger(y))return false;
  for(let dy=1;dy<=2;dy++)for(let dx=-1;dx<=1;dx++){
    if(tileAt(x+dx,y+dy)==='tree')return true;
  }
  return false;
}
export function walkable(x,y) {
  const type=tileAt(x,y);
  if(!['path','grass','flower','tallgrass','door'].includes(type))return false;
  if(x===MIRA.x&&y===MIRA.y)return false;
  // Laisser libres les chemins construits, les portes et la route vers Mira.
  if(type==='path'||type==='door')return true;
  return !blockedByTreeCanopy(x,y);
}
export function step(from, direction) {
  const offset=DIRECTIONS[direction];
  if(!offset) return {x:from.x,y:from.y,moved:false};
  const x=from.x+offset[0],y=from.y+offset[1];
  return walkable(x,y)?{x,y,moved:true}:{x:from.x,y:from.y,moved:false};
}
export function near(a,b,radius=2){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)<=radius;}
