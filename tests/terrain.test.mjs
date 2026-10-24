import test from 'node:test';
import assert from 'node:assert/strict';
import {WIDTH,HEIGHT,tileAt,noise} from '../site/world.js';
import {renderTerrain,drawWaterAnimation} from '../site/terrain.js';
test('the pixel-art map contains detailed scenery while preserving logical tiles',()=>{
 const calls=[];
 const mock={
  imageSmoothingEnabled:true,
  set fillStyle(value){this.color=value;},
  get fillStyle(){return this.color;},
  fillRect(x,y,w,h){calls.push([x,y,w,h,this.color]);},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){}
 };
 renderTerrain(mock,WIDTH,HEIGHT,tileAt,noise);
 assert.equal(mock.imageSmoothingEnabled,false);
 assert.ok(calls.length>10000,'Expect richer terrain details');
 assert.ok(calls.some(a=>a[4]==='#a0c776'),'Tree canopy highlights');
 assert.ok(calls.some(a=>a[4]==='#b38359'),'Cottage doors');
 assert.ok(calls.some(a=>a[4]==='#79bbca'),'Window glass');
 assert.ok(calls.some(a=>a[4]==='#30778e'||a[4]==='#387f95'),'Water');
});
test('shimmer paints only on water tiles in visible area',()=>{
 const pixels=[];
 const mock={
  canvas:{width:896,height:576},
  set fillStyle(v){this.color=v;},
  fillRect(...args){pixels.push([...args,this.color]);}
 };
 drawWaterAnimation(mock,0,0,600,tileAt,WIDTH,HEIGHT);
 assert.ok(pixels.every(p=>p[4]==='#86c9ca'));
 assert.equal(pixels.length,0,'No water visible at top-left of map');
 drawWaterAnimation(mock,3*32,19*32,800,tileAt,WIDTH,HEIGHT);
 assert.ok(pixels.length>0);
});
