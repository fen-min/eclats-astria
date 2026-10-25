import test from 'node:test';
import assert from 'node:assert/strict';
import {STEP_DURATION_MS,movementPosition,characterPose} from '../site/motion.js';
test('interpolation keeps endpoints and progresses continuously',()=>{
  const begin=movementPosition(3,4,4,4,100,100);
  const mid=movementPosition(3,4,4,4,100+STEP_DURATION_MS/2,100);
  const end=movementPosition(3,4,4,4,100+STEP_DURATION_MS,100);
  assert.equal(begin.x,3);
  assert.equal(begin.finished,false);
  assert.equal(mid.x,3.5);
  assert.equal(mid.y,4);
  assert.equal(end.x,4);
  assert.equal(end.finished,true);
});
test('movement is bounded after an interrupted or delayed frame',()=>{
  const pos=movementPosition(0,0,1,1,9999,0);
  assert.deepEqual(pos,{x:1,y:1,finished:true});
  const early=movementPosition(0,0,1,1,0,100);
  assert.equal(early.x,0);
});
test('idle breath is visible at character size, periodic, and feet stay planted',()=>{
  const half=characterPose(0,false,0);
  const expand=characterPose(475,false,0);
  const contract=characterPose(1425,false,0);
  const next=characterPose(1900,false,0);
  assert.equal(expand.frame,0);
  assert.equal(expand.bobY,0);
  assert.ok(expand.scaleY-contract.scaleY>=0.049);
  assert.ok(expand.scaleY<1.06);
  assert.ok(expand.scaleX<contract.scaleX);
  assert.ok(expand.shadowScale<contract.shadowScale);
  assert.ok(Math.abs(half.scaleY-next.scaleY)<1e-10);
  assert.ok(Math.abs(expand.swayX)<=0.9);
});
test('walking has eight distinct poses per direction and returns smoothly to frame zero',()=>{
  const frames=Array.from({length:8},(_,i)=>characterPose(i*72,true,0).frame);
  assert.deepEqual(frames,[0,1,2,3,4,5,6,7]);
  assert.ok(Math.abs(characterPose(70,true,0).bobY)<=1.5);
  assert.equal(characterPose(576,true,0).frame,0);
  assert.equal(characterPose(500,false,0).frame,0);
});
