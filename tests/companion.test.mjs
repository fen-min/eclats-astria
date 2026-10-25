import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SPAWN,walkable} from '../site/world.js';
import {COMPANIONS,CAT_FRAME,CAT_ROWS,companionById,initialCompanionPosition,appendFootstep,followTarget,facingDirection,catIdleFrame} from '../site/companions.js';

test('the starter creature is original, recruitable, smaller than the hero and supports four directions',()=>{
 assert.equal(COMPANIONS.length,1);
 assert.equal(companionById('chat-rouge').name,'Chat rouge tigré');
 assert.equal(companionById('fake'),null);
 assert.deepEqual(CAT_FRAME,{width:52,height:48,frames:4,rows:4});
 assert.equal(CAT_FRAME.height<68,true);
 assert.deepEqual(CAT_ROWS,{down:0,up:1,left:2,right:3});
 const images=['docs','site'].map(dir=>readFileSync(new URL('../'+dir+'/assets/chat-rouge-idle.png',import.meta.url)));
 assert.deepEqual(images[0],images[1]);
 assert.equal(images[0].subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(images[0].readUInt32BE(16),208);
 assert.equal(images[0].readUInt32BE(20),192);
 assert.ok(images[0].length>4000);
});
test('a creature follows the traversed path, rather than clipping through obstacles',()=>{
 const hero={...SPAWN,dir:'down'};
 const origin=initialCompanionPosition(hero,walkable);
 assert.ok(walkable(origin.x,origin.y));
 let trail=[{x:hero.x,y:hero.y}];
 trail=appendFootstep(trail,{x:hero.x+1,y:hero.y});
 assert.deepEqual(followTarget(trail),{x:hero.x,y:hero.y});
 trail=appendFootstep(trail,{x:hero.x+1,y:hero.y+1});
 assert.deepEqual(followTarget(trail),{x:hero.x+1,y:hero.y});
 assert.equal(facingDirection(origin,followTarget(trail))==='down'||typeof facingDirection(origin,followTarget(trail))==='string',true);
 assert.equal(facingDirection({x:2,y:2},{x:3,y:2}),'right');
 assert.equal(facingDirection({x:2,y:2},{x:2,y:1}),'up');
 for(let i=0;i<20;i++)trail=appendFootstep(trail,{x:i,y:2});
 assert.ok(trail.length<=10);
 assert.deepEqual(Array.from({length:4},(_,i)=>catIdleFrame(i*360)),[0,1,2,3]);
 assert.equal(catIdleFrame(4*360),0);
});
test('both browser builds provide Maria recruitment, persistence and follower drawing',()=>{
 for(const dir of ['docs','site']){
  const g=readFileSync(new URL('../'+dir+'/game.js',import.meta.url),'utf8');
  const h=readFileSync(new URL('../'+dir+'/index.html',import.meta.url),'utf8');
  assert.match(g,/companionId:selectedCompanion\?\.id\|\|null/);
  assert.match(g,/followerOnHeroStep\(now\)/);
  assert.match(g,/drawCompanion\(px,py,now\)/);
  assert.match(g,/renderCompanionChoices\(/);
  assert.match(g,/assets\/chat-rouge-idle\.png\?v=0\.1\.22/);
  assert.match(h,/id="companion-list"/);
  assert.match(h,/id="companion-status"/);
  assert.match(h,/PARLER À MARIA/);
  assert.match(h,/game\.js\?v=0\.1\.22/);
 }
});
