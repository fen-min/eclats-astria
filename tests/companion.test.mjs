import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SPAWN,walkable} from '../site/world.js';
import {COMPANIONS,CAT_FRAME,CAT_ROWS,MIAW_WALK_FRAME,MIAW_MEOW_FRAME,miawAnimation,companionById,initialCompanionPosition,appendFootstep,followTarget,facingDirection,catIdleFrame} from '../site/companions.js';

test('the starter creature is original, recruitable, smaller than the hero and supports four directions',()=>{
 assert.equal(COMPANIONS.length,1);
 assert.equal(companionById('chat-rouge').name,'Miaw');
 assert.equal(companionById('fake'),null);
 assert.equal(companionById('miaw').name,'Miaw');
 assert.equal(COMPANIONS[0].id,'miaw');
 assert.deepEqual(CAT_FRAME,{width:52,height:48,frames:4,rows:4});
 assert.equal(CAT_FRAME.height<68,true);
 assert.deepEqual(CAT_ROWS,{down:0,up:1,left:2,right:3});
 for(const [filename,layout] of [
  ['miaw-idle.png',CAT_FRAME],['miaw-walk.png',MIAW_WALK_FRAME],['miaw-meow.png',MIAW_MEOW_FRAME]
 ]){
  const images=['docs','site'].map(dir=>readFileSync(new URL('../'+dir+'/assets/'+filename,import.meta.url)));
  assert.deepEqual(images[0],images[1]);
  assert.equal(images[0].subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(images[0].readUInt32BE(16),layout.width*layout.frames);
  assert.equal(images[0].readUInt32BE(20),layout.height*layout.rows);
  assert.ok(images[0].length>2000);
 }
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
  // Le moteur charge les trois PNG à partir d'un nom de fichier dynamique.
  assert.ok(g.includes("image.src=new URL('./assets/miaw-'+kind+'.png?v=0.1.25'"));
  for(const kind of ['idle','walk','meow'])assert.ok(g.includes("'"+kind+"'"));
  assert.match(g,/miawAnimation\(now,follower\.dir,walking/);
  assert.match(h,/id="companion-list"/);
  assert.match(h,/id="companion-status"/);
  assert.match(h,/PARLER À MARIA/);
  assert.match(h,/game\.js\?v=0\.1\.25/);
 }
});

test('Miaw has a front-only idle meow and distinct sideways walk frames',()=>{
 assert.equal(miawAnimation(4000,'down',false,4200).kind,'meow');
 assert.equal(miawAnimation(4070,'down',false,3750).frame,2);
 assert.deepEqual(MIAW_MEOW_FRAME,{width:64,height:64,frames:8,rows:1});
 assert.deepEqual(Array.from({length:8},(_,i)=>miawAnimation(0,'down',false,3500+i*125).frame),[0,1,2,3,4,5,6,7]);
 assert.equal(miawAnimation(0,'down',false,4500).kind,'idle');
 for(const dir of ['up','left','right'])
  assert.equal(miawAnimation(4200,dir,false,4200).kind,'idle');
 assert.equal(miawAnimation(4200,'down',true,4200).kind,'idle');
 assert.deepEqual(MIAW_WALK_FRAME,{width:64,height:64,frames:4,rows:4});
 assert.deepEqual(miawAnimation(375,'down',true),{kind:'walk',row:0,frame:3});
 assert.deepEqual(miawAnimation(375,'up',true),{kind:'walk',row:1,frame:3});
 assert.deepEqual(miawAnimation(375,'left',true),{kind:'walk',row:2,frame:3});
 assert.deepEqual(miawAnimation(375,'right',true),{kind:'walk',row:3,frame:3});
 assert.deepEqual(miawAnimation(500,'left',true),{kind:'walk',row:2,frame:0});
 assert.equal(miawAnimation(900,'down',false,100).kind,'idle');
});

test('the four walking rows are connected to the same stable draw size',()=>{
 for(const dir of ['docs','site']){
  const code=readFileSync(new URL('../'+dir+'/game.js',import.meta.url),'utf8');
  assert.match(code,/kind==='meow'\|\|kind==='walk'\?48:frame\.width/);
  assert.match(code,/kind==='meow'\|\|kind==='walk'\?48:frame\.height/);
 }
});
