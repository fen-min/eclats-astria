import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WIDTH,HEIGHT,tileAt,noise,walkable,SPAWN} from '../site/world.js';
import {SOFT_GRASS_ATLAS,softGrassFrame,renderTerrain} from '../site/terrain.js';

test('the user-selected soft grass has eight clean 32×32 source tiles',()=>{
 assert.deepEqual(SOFT_GRASS_ATLAS,{width:256,height:32,variants:8,tile:32});
 const copies=['docs','site'].map(folder=>readFileSync(new URL('../'+folder+'/assets/soft-grass-atlas.png',import.meta.url)));
 assert.deepEqual(copies[0],copies[1]);
 assert.equal(copies[0].subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(copies[0].readUInt32BE(16),256);
 assert.equal(copies[0].readUInt32BE(20),32);
 assert.ok(copies[0].length>2000);
});
test('calm green sprites replace only ground, never paths or pond',()=>{
 const calls=[];
 const ctx={
  imageSmoothingEnabled:true,
  set fillStyle(color){this.color=color;},
  fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},
  drawImage(...args){calls.push(args);}
 };
 const pathAtlas={},waterAtlas={},newGrass={};
 renderTerrain(ctx,WIDTH,HEIGHT,tileAt,noise,null,null,pathAtlas,waterAtlas,'background',newGrass);
 const grassCalls=calls.filter(args=>args[0]===newGrass);
 const pathCalls=calls.filter(args=>args[0]===pathAtlas);
 const pondCalls=calls.filter(args=>args[0]===waterAtlas);
 assert.ok(grassCalls.length>400);
 assert.ok(pathCalls.length>50);
 assert.ok(pondCalls.length>20);
 assert.ok(grassCalls.every(args=>args[2]===0&&args[3]===32&&args[4]===32&&args[7]===32&&args[8]===32));
 assert.ok(pathCalls.every(args=>args[2]===32));
 assert.ok(grassCalls.every(args=>!['path','door','water'].includes(tileAt(args[5]/32,args[6]/32))));
 assert.equal(ctx.imageSmoothingEnabled,false);
 assert.equal(walkable(SPAWN.x,SPAWN.y),true);
});
test('plain grass variants are dominant and the original wind remains active',()=>{
 let simple=0,total=0;
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
  const frame=softGrassFrame(x,y,noise);
  assert.ok(frame>=0&&frame<8);
  total++;
  if([0,3,4,6].includes(frame))simple++;
 }
 assert.ok(simple/total>0.75);
 for(const folder of ['docs','site']){
  const code=readFileSync(new URL('../'+folder+'/game.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../'+folder+'/index.html',import.meta.url),'utf8');
  assert.match(code,/soft-grass-atlas\.png\?v=0\.1\.21/);
  assert.match(code,/softGrassReady\?softGrassAtlas:null/);
  assert.match(code,/drawWindFoliage\(/);
  assert.match(html,/game\.js\?v=0\.1\.23/);
 }
});