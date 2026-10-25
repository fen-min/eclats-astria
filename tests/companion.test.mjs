import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {SPAWN,walkable} from '../site/world.js';
import {
 COMPANIONS,MIAW_SHEET,MIAW_ANIMATIONS,miawFrameRect,miawAnimation,
 companionById,initialCompanionPosition,appendFootstep,followTarget,
 facingDirection,catIdleFrame
} from '../site/companions.js';

test('Miaw is recruitable and old save IDs still migrate',()=>{
 assert.equal(COMPANIONS.length,1);
 assert.equal(companionById('miaw')?.name,'Miaw');
 assert.equal(companionById('chat-rouge')?.id,'miaw');
 assert.equal(companionById('fake'),null);
 assert.equal(COMPANIONS[0].role,'DPS');
});
test('the uploaded atlas has all 13 sequences and source rectangles remain in bounds',()=>{
 const expected={
  idle:4,walk:8,jump:6,hit:4,fainted:5,basic:6,special:8,
  claw:6,boost:6,angry:4,dodge:8,sleep:4,elemental:8
 };
 assert.deepEqual(Object.fromEntries(Object.entries(MIAW_ANIMATIONS)
  .map(([kind,desc])=>[kind,desc.frames])),expected);
 assert.equal(Object.values(expected).reduce((a,b)=>a+b,0),77);
 assert.deepEqual(MIAW_SHEET,{width:984,height:1599});
 for(const [kind,desc] of Object.entries(MIAW_ANIMATIONS)){
  for(let frame=0;frame<desc.frames;frame++){
   const rect=miawFrameRect(kind,frame);
   assert.ok(rect.x>=0&&rect.y>=0&&rect.width>0&&rect.height>0);
   assert.ok(rect.x+rect.width<=MIAW_SHEET.width,kind);
   assert.ok(rect.y+rect.height<=MIAW_SHEET.height,kind);
  }
 }
 // La rangée griffes contient cinq poses distinctes ; une sixième reprend
 // la pose finale, conformément à la cadence de six images demandée.
 assert.deepEqual(miawFrameRect('claw',5),miawFrameRect('claw',4));
 const assets=['docs','site'].map(dir=>readFileSync(new URL('../'+dir+'/assets/miaw-actions.base64',import.meta.url),'utf8').trim());
 assert.equal(assets[0],assets[1]);
 const png=Buffer.from(assets[0],'base64');
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),MIAW_SHEET.width);
 assert.equal(png.readUInt32BE(20),MIAW_SHEET.height);
 assert.ok(png.length>100000);
 for(const old of ['miaw-idle.png','miaw-walk.png','miaw-meow.png']){
  for(const dir of ['docs','site'])
   assert.equal(existsSync(new URL('../'+dir+'/assets/'+old,import.meta.url)),false);
 }
});
test('Miaw plays 8 walk frames, 4 idle frames, and previews every action',()=>{
 assert.deepEqual(Array.from({length:8},(_,i)=>miawAnimation(i*125,'right',true).frame),[0,1,2,3,4,5,6,7]);
 assert.equal(miawAnimation(1000,'left',true).frame,0);
 assert.equal(miawAnimation(0,'down',false).kind,'idle');
 assert.deepEqual(Array.from({length:4},(_,i)=>catIdleFrame(i*360)),[0,1,2,3]);
 for(const [kind,desc] of Object.entries(MIAW_ANIMATIONS)){
  const start=2000;
  assert.equal(miawAnimation(start,'right',false,0,{kind,startedAt:start}).frame,0);
  assert.deepEqual(miawAnimation(start+1000*(desc.frames-1)/desc.fps,'right',false,0,{kind,startedAt:start}),
   {kind,frame:desc.frames-1});
 }
});
test('Miaw follows the hero path without bypassing the collision grid',()=>{
 const hero={...SPAWN,dir:'down'};
 const origin=initialCompanionPosition(hero,walkable);
 assert.ok(walkable(origin.x,origin.y));
 let trail=[{x:hero.x,y:hero.y}];
 trail=appendFootstep(trail,{x:hero.x+1,y:hero.y});
 assert.deepEqual(followTarget(trail),{x:hero.x,y:hero.y});
 trail=appendFootstep(trail,{x:hero.x+1,y:hero.y+1});
 assert.deepEqual(followTarget(trail),{x:hero.x+1,y:hero.y});
 assert.equal(facingDirection({x:2,y:2},{x:3,y:2}),'right');
 assert.equal(facingDirection({x:2,y:2},{x:2,y:1}),'up');
 for(let i=0;i<20;i++)trail=appendFootstep(trail,{x:i,y:2});
 assert.ok(trail.length<=10);
});
test('the browser and Pages builds preserve recruitment, save, and preview controls',()=>{
 for(const dir of ['docs','site']){
  const js=readFileSync(new URL('../'+dir+'/game.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../'+dir+'/index.html',import.meta.url),'utf8');
  assert.match(js,/companionId:selectedCompanion\?\.id\|\|null/);
  assert.match(js,/followerOnHeroStep\(now\)/);
  assert.match(js,/drawCompanion\(px,py,now\)/);
  assert.match(js,/renderCompanionChoices\(/);
  assert.match(js,/miaw-actions\.base64\?v=0\.1\.26/);
  assert.match(js,/miawFrameRect\(/);
  assert.match(js,/miawPreview/);
  assert.match(html,/id="miaw-animation-play"/);
  assert.match(html,/id="miaw-animation-select"/);
  assert.match(html,/PARLER À MARIA/);
  assert.match(html,/game\.js\?v=0\.1\.26/);
 }
});
