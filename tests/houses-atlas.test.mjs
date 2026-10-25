import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WIDTH,HEIGHT,tileAt,noise,walkable} from '../site/world.js';
import {renderTerrain,HOUSES_ATLAS} from '../site/terrain.js';

test('green and red original house atlas is transparent PNG and copied to both sites',()=>{
 assert.deepEqual(HOUSES_ATLAS,{width:384,height:176,columns:2,frameWidth:192,frameHeight:176});
 const files=['docs','site'].map(dir=>readFileSync(new URL('../'+dir+'/assets/houses-atlas.png',import.meta.url)));
 assert.deepEqual(files[0],files[1]);
 assert.equal(files[0].subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(files[0].readUInt32BE(16),384);
 assert.equal(files[0].readUInt32BE(20),176);
 assert.ok(files[0].length>14000,'The detailed source should not be excessively compressed');
});
test('both house sprites replace the old cottages and align with the existing doors',()=>{
 const calls=[];
 const fake={
  imageSmoothingEnabled:true,
  set fillStyle(c){this.color=c;},
  fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},
  drawImage(...args){calls.push(args);}
 };
 const houses={};
 renderTerrain(fake,WIDTH,HEIGHT,tileAt,noise,null,houses);
 const houseDraws=calls.filter(call=>call[0]===houses);
 assert.equal(houseDraws.length,2);
 assert.ok(houseDraws.every(call=>call[3]===call[7] && call[4]===call[8]),'No destructive upscaling of houses');
 assert.deepEqual(houseDraws[0],[houses,0,0,192,176,272,240,192,176]);
 assert.deepEqual(houseDraws[1],[houses,192,0,192,176,1040,240,192,176]);
 assert.equal(walkable(11,12),true);
 assert.equal(walkable(35,12),true);
 assert.equal(fake.imageSmoothingEnabled,false);
});
test('both website versions reload the two new cottage sprites after fetching them',()=>{
 for(const dir of ['docs','site']){
  const js=readFileSync(new URL('../'+dir+'/game.js',import.meta.url),'utf8');
  assert.match(js,/houses-atlas\.png\?v=0\.1\.12/);
  assert.match(js,/g\.clearRect\(0,0,world\.width,world\.height\)/);
  assert.match(js,/housesReady\?housesAtlas:null/);
 }
});
