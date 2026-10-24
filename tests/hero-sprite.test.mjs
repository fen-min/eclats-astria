import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('the detailed hero atlas has all 16 frames at 64 x 100',()=>{
 const docs=readFileSync(new URL('../docs/assets/hero-reference.png',import.meta.url));
 const site=readFileSync(new URL('../site/assets/hero-reference.png',import.meta.url));
 assert.equal(docs.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(docs.readUInt32BE(16),4*64);
 assert.equal(docs.readUInt32BE(20),4*100);
 assert.deepEqual(docs,site);
});

test('the browser renderer references the detailed sprite on both sites',()=>{
 for(const folder of ['docs','site']){
  const js=readFileSync(new URL(`../${folder}/game.js`,import.meta.url),'utf8');
  assert.match(js,/hero-reference\.png/);
  assert.match(js,/down:0,left:1,right:2,up:3/);
  assert.match(js,/walkFrame\*HERO_FRAME_WIDTH/);
  assert.match(js,/imageSmoothingEnabled=false/);
 }
});
