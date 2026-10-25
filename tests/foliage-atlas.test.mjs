import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WIDTH,HEIGHT,tileAt,noise,walkable,SPAWN} from '../site/world.js';
import {renderTerrain,FOLIAGE_ATLAS} from '../site/terrain.js';

test('original foliage atlas is a valid png with eight sprite cells',()=>{
 assert.deepEqual(FOLIAGE_ATLAS,{width:320,height:145,columns:4,frameWidth:80,treeHeight:90,grassHeight:55});
 const paths=['docs','site'].map(folder=>readFileSync(new URL('../'+folder+'/assets/foliage-atlas.png',import.meta.url)));
 assert.deepEqual(paths[0],paths[1]);
 const png=paths[0];
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),320);
 assert.equal(png.readUInt32BE(20),145);
 assert.ok(png.length>3000);
});
test('renderer uses tree and grass sprites with nearest-neighbour scaling',()=>{
 const sprites=[];
 const fake={
  canvas:{width:WIDTH*32,height:HEIGHT*32},
  imageSmoothingEnabled:true,
  set fillStyle(c){this.color=c;},
  fillRect(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},
  drawImage(...args){sprites.push(args);}
 };
 const atlas={};
 renderTerrain(fake,WIDTH,HEIGHT,tileAt,noise,atlas);
 assert.equal(fake.imageSmoothingEnabled,false);
 const trees=sprites.filter(s=>s[2]===0&&s[4]===90);
 const grass=sprites.filter(s=>s[2]===90&&s[4]===55);
 assert.ok(trees.length>150,'Expected a forest of atlas trees');
 assert.ok(grass.length>50,'Expected clumps of atlas grass');
 assert.ok(sprites.every(s=>s[0]===atlas));
 assert.ok(trees.every(s=>s[7]===112&&s[8]===126));
 assert.ok(grass.every(s=>s[7]===88&&s[8]===61));
 assert.ok(walkable(SPAWN.x,SPAWN.y));
});
test('the browser loads the sprite sheet in both copies of the game',()=>{
 for(const folder of ['docs','site']){
  const code=readFileSync(new URL('../'+folder+'/game.js',import.meta.url),'utf8');
  assert.match(code,/foliage-atlas\.png\?v=0\.1\.10/);
  assert.match(code,/renderTerrain\(g,WIDTH,HEIGHT,tileAt,noise,foliageAtlas\)/);
 }
});
