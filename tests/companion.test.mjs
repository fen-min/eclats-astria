import test from 'node:test';
import {WOUF_SHEET,WOUF_CELL,WOUF_ANIMATIONS,woufFrameRect,woufAnimation} from '../site/wouf.js';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {SPAWN,walkable} from '../site/world.js';
import {
 COMPANIONS,MIAW_SHEET,MIAW_ANIMATIONS,miawFrameRect,miawAnimation,
 companionById,initialCompanionPosition,appendFootstep,followTarget,
 facingDirection,catIdleFrame,COMPANION_WANDER,companionDistance,planCompanionRoute
} from '../site/companions.js';

test('Miaw is recruitable and old save IDs still migrate',()=>{
 assert.equal(COMPANIONS.length,2);
 assert.equal(companionById('miaw')?.name,'Miaw');
 assert.equal(companionById('wouf')?.name,'Wouf');
 assert.equal(companionById('wouf')?.role,'Tank');
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
  assert.deepEqual(miawAnimation(start+1000*(desc.frames-0.25)/desc.fps,'right',false,0,{kind,startedAt:start}),
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
  assert.match(js,/updateCompanionMovement\(now\)/);
  assert.match(js,/notifyCompanionHeroMoved\(now\)/);
  assert.match(js,/drawCompanion\(px,py,now\)/);
  assert.match(js,/renderCompanionChoices\(/);
  assert.match(js,/miaw-actions\.base64\?v=0\.1\.26/);
  assert.match(js,/miawFrameRect\(/);
  assert.match(js,/companionPreview/);
  assert.match(js,/woufFrameRect\(/);
  assert.match(js,/wouf-actions\.base64\?v=0\.1\.29/);
  assert.match(html,/id="companion-animation-play"/);
  assert.match(html,/id="companion-animation-select"/);
  assert.match(html,/PARLER À MARIA/);
  assert.match(html,/game\.js\?v=0\.1\.30/);
 }
});

test('Wouf atlas has 17 playable animations and preserves the requested frame counts',()=>{
 const expected={
  idle:4,idle_front:4,idle_back:4,walk:8,walk_front:8,walk_back:8,
  jump:6,hit:4,fainted:5,basic:6,special:8,claw:6,boost:6,
  angry:4,dodge:8,sleep:4,elemental:8
 };
 assert.deepEqual(Object.fromEntries(Object.entries(WOUF_ANIMATIONS)
  .map(([k,value])=>[k,value.frames])),expected);
 assert.equal(Object.values(expected).reduce((a,b)=>a+b,0),101);
 assert.deepEqual(WOUF_SHEET,{width:896,height:1300});
 assert.deepEqual(WOUF_CELL,{width:112,height:100});
 for(const [kind,anim] of Object.entries(WOUF_ANIMATIONS)){
  for(let frame=0;frame<anim.frames;frame++){
   const r=woufFrameRect(kind,frame);
   assert.ok(r.width>0&&r.height>0,kind);
   assert.equal(r.width,WOUF_CELL.width,kind);
   assert.equal(r.height,WOUF_CELL.height,kind);
   assert.equal(r.x%WOUF_CELL.width,0,kind);
   assert.equal(r.y%WOUF_CELL.height,0,kind);
   assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=WOUF_SHEET.width,kind);
   assert.ok(r.y+r.height<=WOUF_SHEET.height,kind);
  }
 }

 const files=['docs','site'].map(dir=>readFileSync(new URL('../'+dir+'/assets/wouf-actions.base64',import.meta.url),'utf8').replace(/\\s/g,''));
 assert.equal(files[0],files[1]);
 const png=Buffer.from(files[0],'base64');
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),WOUF_SHEET.width);
 assert.equal(png.readUInt32BE(20),WOUF_SHEET.height);
 assert.ok(png.length>400000);
 // Les directions qui ne sont pas présentes dans la nouvelle planche
 // réutilisent provisoirement le profil (aucune image de l'ancien Wouf bleu).
 assert.equal(WOUF_ANIMATIONS.idle_front.row,'idle');
 assert.equal(WOUF_ANIMATIONS.idle_back.row,'idle');
 assert.equal(WOUF_ANIMATIONS.walk_front.row,'walk');
 assert.equal(WOUF_ANIMATIONS.walk_back.row,'walk');
 for(const dir of ['docs','site'])
  assert.equal(existsSync(new URL('../'+dir+'/assets/wouf-actions.png',import.meta.url)),false);
});
test('Wouf automatically faces side, front and back and all previews reach their final frames',()=>{
 for(const [dir,expected] of [['right','idle'],['left','idle'],['down','idle_front'],['up','idle_back']]){
  assert.equal(woufAnimation(0,dir,false).kind,expected);
 }
 for(const [dir,expected] of [['right','walk'],['left','walk'],['down','walk_front'],['up','walk_back']]){
  assert.equal(woufAnimation(0,dir,true).kind,expected);
 }
 for(const [kind,anim] of Object.entries(WOUF_ANIMATIONS)){
  assert.deepEqual(woufAnimation(1000,'down',false,{kind,startedAt:1000}),{kind,frame:0});
  assert.equal(woufAnimation(1000+(anim.frames-0.3)*1000/anim.fps,'up',true,{kind,startedAt:1000}).frame,anim.frames-1);
 }
});

test('autonomous companions keep their distance and avoid blocked cells',()=>{
 const hero={x:5,y:5}, open=(x,y)=>x>=0&&x<=10&&y>=0&&y<=10;
 assert.deepEqual(COMPANION_WANDER.minDistance,2);
 assert.deepEqual(COMPANION_WANDER.maxDistance,4);
 assert.equal(companionDistance(hero,{x:7,y:7}),4);
 const spawn=initialCompanionPosition({...hero,dir:'down'},open);
 assert.equal(companionDistance(spawn,hero),2);
 const wander=planCompanionRoute({x:6,y:7},hero,open,'roam',()=>.25);
 assert.ok(wander.length>=1&&wander.length<=3);
 let prev={x:6,y:7};
 for(const tile of wander){
  assert.ok(open(tile.x,tile.y));
  assert.notDeepEqual(tile,hero);
  assert.equal(companionDistance(tile,prev),1);
  prev=tile;
 }
 assert.ok(companionDistance(prev,hero)>=2);
 assert.ok(companionDistance(prev,hero)<=4);
 const far={x:0,y:0};
 const route=planCompanionRoute(far,hero,open,'return');
 assert.ok(route.length>0);
 assert.ok(companionDistance(route.at(-1),hero)>=2);
 assert.ok(companionDistance(route.at(-1),hero)<=4);
 prev=far;
 for(const tile of route){
  assert.equal(companionDistance(tile,prev),1);
  assert.notDeepEqual(tile,hero);
  prev=tile;
 }
});
test('companion pathfinding goes around obstacles instead of crossing them',()=>{
 const hero={x:6,y:2},from={x:0,y:2};
 // Mur avec ouverture au sud : le compagnon doit contourner.
 const solid=(x,y)=>x>=0&&x<=7&&y>=0&&y<=5&&!(x===2&&y<5);
 const path=planCompanionRoute(from,hero,solid,'return');
 assert.ok(path.length>0);
 assert.ok(path.some(p=>p.x===2&&p.y===5));
 assert.ok(path.every(p=>solid(p.x,p.y)&&!(p.x===hero.x&&p.y===hero.y)));
 assert.ok(companionDistance(path.at(-1),hero)>=2);
 assert.ok(companionDistance(path.at(-1),hero)<=4);
 // Aucune case disponible : surtout ne jamais traverser le mur.
 assert.deepEqual(planCompanionRoute({x:0,y:0},{x:4,y:4},
  (x,y)=>x===0&&y===0,'return'),[]);
});
