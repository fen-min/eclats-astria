import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WIDTH,HEIGHT,tileAt,noise,walkable,SPAWN} from '../site/world.js';
import {GROUND_ATLAS,renderTerrain} from '../site/terrain.js';

test('the selected second image provides eight sharp grass and earth variations',()=>{
 assert.deepEqual(GROUND_ATLAS,{width:256,height:64,columns:8,variants:8,tile:32});
 const copies=['docs','site'].map(folder=>readFileSync(new URL('../'+folder+'/assets/ground-atlas.png',import.meta.url)));
 assert.deepEqual(copies[0],copies[1]);
 const png=copies[0];
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),256);
 assert.equal(png.readUInt32BE(20),64);
 assert.ok(png.length>5000);
});

test('the terrain displays the new pixels on grass and paths without changing water or collisions',()=>{
 const calls=[];
 const g={
  imageSmoothingEnabled:true,
  set fillStyle(c){this.color=c;},
  fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},
  drawImage(...args){calls.push(args);}
 };
 const selected={};
 renderTerrain(g,WIDTH,HEIGHT,tileAt,noise,null,null,selected);
 const ground=calls.filter(c=>c[0]===selected);
 const grassy=ground.filter(c=>c[2]===0);
 const paths=ground.filter(c=>c[2]===32);
 assert.ok(grassy.length>500);
 assert.ok(paths.length>80);
 assert.ok(ground.every(c=>c.length===9&&c[3]===32&&c[4]===32&&c[7]===32&&c[8]===32));
 assert.equal(g.imageSmoothingEnabled,false);
 assert.ok(walkable(SPAWN.x,SPAWN.y));
});

test('published and local versions load the new textures with a cache-busting version',()=>{
 for(const dir of ['docs','site']){
  const game=readFileSync(new URL('../'+dir+'/game.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../'+dir+'/index.html',import.meta.url),'utf8');
  assert.match(game,/ground-atlas\.png\?v=0\.1\.17/);
  assert.match(game,/groundReady\?groundAtlas:null/);
  assert.match(html,/game\.js\?v=0\.1\.\d+/);
 }
});
