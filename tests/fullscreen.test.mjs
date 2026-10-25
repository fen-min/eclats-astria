import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('fullscreen button is present in the published page and game can toggle it',()=>{
 for(const dir of ['docs','site']){
  const html=readFileSync(new URL('../'+dir+'/index.html',import.meta.url),'utf8');
  const css=readFileSync(new URL('../'+dir+'/style.css',import.meta.url),'utf8');
  const js=readFileSync(new URL('../'+dir+'/game.js',import.meta.url),'utf8');
  assert.match(html,/id="fullscreen-toggle"/);
  assert.match(css,/\.frame:fullscreen/);
  assert.match(css,/calc\(100% - 28px\)/);
  assert.match(js,/requestFullscreen\(\)/);
  assert.match(js,/exitFullscreen\(\)/);
 }
});
