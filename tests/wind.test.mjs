import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WIDTH,HEIGHT,tileAt,noise,SPAWN,walkable} from '../site/world.js';
import {WIND,windOffset,drawWindFoliage,renderTerrain,renderHouses} from '../site/terrain.js';

function createContext(w=1008,h=648){
 const calls=[];
 const ctx={canvas:{width:w,height:h},imageSmoothingEnabled:true,
  set fillStyle(c){this.color=c;},fillRect(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},
  drawImage(...args){calls.push(args);}
 };
 return {ctx,calls};
}
test('wind has modest offsets, different phases and no collision effects',()=>{
 assert.ok(WIND.treeAmplitude<=2&&WIND.grassAmplitude<=2);
 const series=Array.from({length:10},(_,k)=>windOffset(k*650,3,7,noise,'tree'));
 assert.ok(new Set(series).size>=3,'wind should visibly sway over time');
 assert.ok(Math.max(...series)<=2&&Math.min(...series)>=-2);
 assert.ok(Math.abs(windOffset(800,3,7,noise,'grass'))<=2);
 assert.notEqual(windOffset(1000,3,7,noise,'tree'),windOffset(1000,12,4,noise,'tree'));
 assert.ok(walkable(SPAWN.x,SPAWN.y));
});
test('only visible foliage is animated with stationary bases',()=>{
 const atlas={};
 const {ctx,calls}=createContext();
 const camX=128,camY=128;
 drawWindFoliage(ctx,camX,camY,0,tileAt,noise,atlas,WIDTH,HEIGHT);
 assert.equal(ctx.imageSmoothingEnabled,false);
 assert.ok(calls.length>40);
 assert.ok(calls.length<8000,"don't redraw the full forest outside the camera");
 assert.ok(calls.every(a=>a[0]===atlas&&a[3]===80&&a[7]>0&&a[8]>0));
 const tree= calls.filter(a=>a[2]<90);
 const grass=calls.filter(a=>a[2]>=90);
 assert.ok(tree.length>0&&grass.length>0);
 assert.ok(calls.some(a=>a[2]===66),'trunks must be drawn as fixed base segments');
 assert.ok(calls.some(a=>a[2]===135),'grass bases must be fixed');
 const first=calls.map(a=>a[5]);
 calls.length=0;
 drawWindFoliage(ctx,camX,camY,900,tileAt,noise,atlas,WIDTH,HEIGHT);
 assert.equal(calls.length,first.length);
 assert.ok(calls.some((a,i)=>a[5]!==first[i]),'wind must alter sprite positions');
});
test('background avoids doubled sprites and house layer is independent',()=>{
 const {ctx,calls}=createContext(WIDTH*32,HEIGHT*32);
 const foliage={},houses={};
 renderTerrain(ctx,WIDTH,HEIGHT,tileAt,noise,foliage,houses,null,null,'background');
 assert.equal(calls.filter(a=>a[0]===foliage).length,0);
 assert.equal(calls.filter(a=>a[0]===houses).length,0);
 calls.length=0;
 renderHouses(ctx,noise,houses);
 assert.equal(calls.filter(a=>a[0]===houses).length,2);
});
test('game reloads animated foliage and retains the original walk cycle',()=>{
 for(const dir of ['docs','site']){
  const game=readFileSync(new URL('../'+dir+'/game.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../'+dir+'/index.html',import.meta.url),'utf8');
  assert.match(game,/drawWindFoliage\(ctx,cx,cy,now,tileAt,noise,foliageAtlas,WIDTH,HEIGHT\)/);
  assert.match(game,/foliageReady\?'background':'all'/);
  assert.match(game,/renderHouses\(hg,noise,housesReady\?housesAtlas:null\)/);
  assert.match(game,/hero-walk-8\.png/);
  assert.match(game,/hero-idle-4\.png/);
  assert.match(html,/game\.js\?v=0\.1\.21/);
 }
});