import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {characterPose} from '../site/motion.js';

test('an idle atlas actually exists and has four 44x68 direction sprites',()=>{
 const binary=['docs','site'].map(dir=>readFileSync(new URL('../'+dir+'/assets/hero-idle-4.png',import.meta.url)));
 assert.equal(binary[0].subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(binary[0].readUInt32BE(16),176);
 assert.equal(binary[0].readUInt32BE(20),68);
 assert.deepEqual(binary[0],binary[1]);
});
test('idle torso breathes visibly while feet remain fixed',()=>{
 const contracted=characterPose(1425,false,0);
 const expanded=characterPose(475,false,0);
 assert.equal(contracted.chestRise,0);
 assert.equal(expanded.chestRise,3);
 assert.equal(expanded.frame,0);
 for(const dir of ['docs','site']){
  const game=readFileSync(new URL('../'+dir+'/game.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../'+dir+'/index.html',import.meta.url),'utf8');
  assert.match(game,/const idle=!moving && heroIdleReady/);
  assert.match(game,/const seam=49/);
  assert.match(game,/idleX,seam,HERO_FRAME_WIDTH,footHeight/);
  assert.match(game,/idleX,0,HERO_FRAME_WIDTH,seam/);
  assert.match(game,/-22,-footHeight,HERO_FRAME_WIDTH,footHeight/);
  assert.match(game,/-68-pose.chestRise/);
  assert.match(game,/hero-idle-4\.png\?v=0\.1\.16/);
  assert.match(game,/hero-walk-8\.png\?v=0\.1\.13/);
  assert.match(html,/game\.js\?v=0\.1\.17/);
 }
});
