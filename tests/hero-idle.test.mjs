import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {characterPose,WALK_FRAMES} from '../site/motion.js';

test('the new idle sheet contains exactly four directional frames with transparency',()=>{
 const docs=readFileSync(new URL('../docs/assets/hero-idle-4.png',import.meta.url));
 const site=readFileSync(new URL('../site/assets/hero-idle-4.png',import.meta.url));
 assert.deepEqual(docs,site);
 assert.equal(docs.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(docs.readUInt32BE(16),4*44);
 assert.equal(docs.readUInt32BE(20),68);
 assert.ok(docs.includes(Buffer.from('tRNS')),'Image must have transparent background');
});
test('the game shows a dedicated idle sprite only while stopped and keeps walking animation',()=>{
 for(const folder of ['docs','site']){
  const js=readFileSync(new URL('../'+folder+'/game.js',import.meta.url),'utf8');
  assert.match(js,/hero-idle-4\.png\?v=0\.1\.15/);
  assert.match(js,/hero-walk-8\.png\?v=0\.1\.13/);
  assert.match(js,/const idle=!moving && heroIdleReady/);
  assert.match(js,/if\(idle\)\{/);
  assert.match(js,/ctx\.drawImage\(heroIdleAtlas,/);
  assert.match(js,/row\*HERO_FRAME_WIDTH,0,HERO_FRAME_WIDTH,HERO_FRAME_HEIGHT/);
  assert.match(js,/ctx\.drawImage\(heroWalkAtlas,/);
  assert.match(js,/pose\.frame\*HERO_FRAME_WIDTH/);
  assert.match(js,/imageSmoothingEnabled=false/);
 }
 assert.equal(WALK_FRAMES,8);
 const idle=characterPose(475,false,0);
 assert.equal(idle.frame,0);
 assert.ok(idle.scaleY>1.04);
});
