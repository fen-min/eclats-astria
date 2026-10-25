import test from 'node:test';
import assert from 'node:assert/strict';
import {WIDTH,HEIGHT,SPAWN,tileAt,walkable,step,blockedByTreeCanopy} from '../site/world.js';
import {readFileSync} from 'node:fs';
test('forest density decreases while borders remain blocked',()=>{
 let count=0;
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
  if(tileAt(x,y)==='tree')count++;
 }
 assert.ok(count>=200&&count<=300,'Forest should have fewer trees than the old 439');
 assert.ok(walkable(SPAWN.x,SPAWN.y));
 assert.equal(tileAt(0,20),'tree');
 assert.equal(blockedByTreeCanopy(1,20),true);
 assert.equal(walkable(1,20),false);
 assert.equal(step({x:1,y:20},'left').moved,false);
});
test('larger trees and smaller hero are deployed in both variants',()=>{
 for(const folder of ['docs','site']){
  const tree=readFileSync(new URL('../'+folder+'/terrain.js',import.meta.url),'utf8');
  const game=readFileSync(new URL('../'+folder+'/game.js',import.meta.url),'utf8');
  const world=readFileSync(new URL('../'+folder+'/world.js',import.meta.url),'utf8');
  assert.match(tree,/py-33/);
  assert.match(tree,/cx-26/);
  assert.match(game,/Math\.round\(-68\+topTrim\+pose\.bobY\)/);
  assert.match(world,/noise\(x,y,31\)<\.30/);
 }
});
