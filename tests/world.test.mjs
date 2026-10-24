import test from 'node:test';
import assert from 'node:assert/strict';
import {WIDTH,HEIGHT,SPAWN,MIRA,tileAt,walkable,step,near} from '../site/world.js';
test('map bounds and landmarks',()=>{
  assert.equal(WIDTH,46);assert.equal(HEIGHT,30);
  assert.equal(tileAt(-1,1),'void');
  assert.equal(tileAt(8,7),'roof');
  assert.equal(tileAt(8,24),'water');
});
test('spawn is walkable and Mira is a solid character',()=>{
  assert.equal(walkable(SPAWN.x,SPAWN.y),true);
  assert.equal(walkable(MIRA.x,MIRA.y),false);
});
test('invalid moves and collisions cannot leave the map',()=>{
  assert.deepEqual(step({x:8,y:7},'right'),{x:8,y:7,moved:false});
  assert.deepEqual(step({x:23,y:16},'right'),{x:24,y:16,moved:true});
  assert.deepEqual(step({x:23,y:16},'teleport'),{x:23,y:16,moved:false});
  assert.deepEqual(step({x:2,y:2},'left'),{x:2,y:2,moved:false});
});
test('interaction radius',()=>{
  assert.equal(near({x:19,y:15},MIRA),true);
  assert.equal(near({x:25,y:15},MIRA),false);
});
