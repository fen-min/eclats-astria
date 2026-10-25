import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WALK_FRAMES,WALK_FRAME_MS} from '../site/motion.js';

test('the approved hero atlas contains 32 transparent frames at native display resolution',()=>{
 const docs=readFileSync(new URL('../docs/assets/hero-walk-8.png',import.meta.url));
 const site=readFileSync(new URL('../site/assets/hero-walk-8.png',import.meta.url));
 assert.equal(docs.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(docs.readUInt32BE(16),8*44);
 assert.equal(docs.readUInt32BE(20),4*68);
 assert.deepEqual(docs,site);
 assert.equal(WALK_FRAMES,8);
 assert.ok(WALK_FRAME_MS>=50&&WALK_FRAME_MS<=110);
});
test('the browser renders the 8-frame animation in every direction without resampling',()=>{
 for(const folder of ['docs','site']){
  const js=readFileSync(new URL('../'+folder+'/game.js',import.meta.url),'utf8');
  assert.match(js,/hero-walk-8\.png\?v=0\.1\.13/);
  assert.match(js,/down:0,left:1,right:2,up:3/);
  assert.match(js,/pose\.frame\*HERO_FRAME_WIDTH/);
  assert.match(js,/const HERO_FRAME_WIDTH=44/);
  assert.match(js,/const HERO_FRAME_HEIGHT=68/);
  assert.match(js,/characterPose\(now,moving,player\.walkStartedAt\)/);
  assert.match(js,/imageSmoothingEnabled=false/);
  assert.match(js,/Math\.round\(-68\+pose\.bobY\),44,68/);
 }
});
