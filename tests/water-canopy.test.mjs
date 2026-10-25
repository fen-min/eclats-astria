import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WIDTH,HEIGHT,SPAWN,MIRA,tileAt,walkable,step,blockedByTreeCanopy,noise} from '../site/world.js';
import {renderTerrain,waterFrame,WATER_ATLAS} from '../site/terrain.js';

test('the approved pond atlas is installed in both published and local games',()=>{
 assert.deepEqual(WATER_ATLAS,{width:128,height:128,columns:4,rows:4,tile:32});
 const files=['docs','site'].map(dir=>readFileSync(new URL('../'+dir+'/assets/water-atlas.png',import.meta.url)));
 assert.deepEqual(files[0],files[1]);
 assert.equal(files[0].subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(files[0].readUInt32BE(16),128);
 assert.equal(files[0].readUInt32BE(20),128);
 assert.ok(files[0].length>2000);
 // La planche doit être un atlas jointif, sans couleur crème provenant des
 // anciennes marges de présentation entre les sprites.
 const paletteAt=files[0].indexOf(Buffer.from('PLTE'));
 assert.ok(paletteAt>0,'The rebuilt atlas should have an indexed color palette');
 const paletteSize=files[0].readUInt32BE(paletteAt-4);
 for(let i=0;i<paletteSize;i+=3){
  const [r,g,b]=files[0].subarray(paletteAt+4+i,paletteAt+7+i);
  assert.ok(!(r>244&&g>236&&b>218),
    'The old beige/white sprite-sheet gutters must not appear in the pond');
 }
});
test('shore and center water tiles use new water sprites and no smoothing',()=>{
 const atlas={};
 const calls=[];
 const g={
  imageSmoothingEnabled:true,
  set fillStyle(v){this.color=v;},fillRect(){},
  drawImage(...args){calls.push(args);},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){}
 };
 renderTerrain(g,WIDTH,HEIGHT,tileAt,noise,null,null,null,atlas);
 const waterCalls=calls.filter(call=>call[0]===atlas);
 const waterCount=Array.from({length:HEIGHT},(_,y)=>Array.from({length:WIDTH},(_,x)=>tileAt(x,y)==='water').filter(Boolean).length).reduce((a,b)=>a+b,0);
 assert.equal(waterCalls.length,waterCount);
 assert.ok(waterCalls.every(a=>a.length===9&&a[3]===32&&a[4]===32&&a[7]===32&&a[8]===32));
 assert.equal(g.imageSmoothingEnabled,false);
 assert.equal(walkable(8,24),false);
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
  if(tileAt(x,y)==='water'){
   const frame=waterFrame(x,y,tileAt,noise);
   assert.ok(frame.col>=0&&frame.col<4&&frame.row>=0&&frame.row<4);
  }
 }
});
test('tree crowns block movement while village paths, houses and guide remain accessible',()=>{
 let crowns=0;
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
  if(['grass','flower','tallgrass'].includes(tileAt(x,y))&&blockedByTreeCanopy(x,y)){
   crowns++;
   assert.equal(walkable(x,y),false);
  }
 }
 assert.ok(crowns>100,'tree leaves should be solid beyond the trunk');
 assert.ok(walkable(SPAWN.x,SPAWN.y));
 assert.ok(walkable(11,12)&&walkable(35,12));
 assert.equal(walkable(MIRA.x,MIRA.y),false);
 const seen=new Set([SPAWN.x+','+SPAWN.y]),frontier=[SPAWN];
 for(let i=0;i<frontier.length;i++){
  const from=frontier[i];
  for(const dir of ['up','down','left','right']){
   const r=step(from,dir),key=r.x+','+r.y;
   if(r.moved&&!seen.has(key)){seen.add(key);frontier.push(r);}
  }
 }
 assert.ok(frontier.some(p=>Math.abs(p.x-MIRA.x)+Math.abs(p.y-MIRA.y)<=2));
 assert.ok(seen.has('11,12')&&seen.has('35,12'));
});
test('new water and collisions are loaded in both websites',()=>{
 for(const dir of ['docs','site']){
  const js=readFileSync(new URL('../'+dir+'/game.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../'+dir+'/index.html',import.meta.url),'utf8');
  assert.match(js,/water-atlas\.png\?v=0\.1\.19/);
  assert.match(js,/waterReady\?waterAtlas:null/);
  assert.match(html,/game\.js\?v=0\.1\.19/);
 }
});