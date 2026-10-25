import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tileAt,walkable,SPAWN} from '../site/world.js';
test('compact houses have walkable visible entrances and no old invisible collision block',()=>{
 assert.equal(tileAt(11,12),'door');
 assert.equal(tileAt(35,12),'door');
 assert.ok(walkable(11,12));
 assert.ok(walkable(35,12));
 assert.equal(tileAt(9,9),'roof');
 assert.equal(tileAt(33,9),'roof2');
 assert.ok(walkable(8,7));
 assert.ok(walkable(SPAWN.x,SPAWN.y));
});
test('the wider viewport and compact hero are included in both published and local copies',()=>{
 for(const folder of ['docs','site']){
  const html=readFileSync(new URL('../'+folder+'/index.html',import.meta.url),'utf8');
  const game=readFileSync(new URL('../'+folder+'/game.js',import.meta.url),'utf8');
  const terrain=readFileSync(new URL('../'+folder+'/terrain.js',import.meta.url),'utf8');
  assert.match(html,/width="1008" height="648"/);
  assert.match(game,/Math\.round\(-84\+pose\.bobY\),54,84/);
  assert.match(terrain,/house\(g,9,9,'roof',2,noise\)/);
 }
});
