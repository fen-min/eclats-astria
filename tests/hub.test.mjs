import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GAMES,isGameActive} from '../site/hub.js';

test('the launcher contains one playable RPG and future placeholders',()=>{
 assert.equal(GAMES.length,3);
 assert.equal(GAMES.filter(g=>g.status==='available').length,1);
 assert.equal(GAMES[0].id,'astria');
 assert.ok(GAMES.slice(1).every(g=>g.status==='planned'));
 assert.equal(new Set(GAMES.map(g=>g.id)).size,GAMES.length);
 assert.equal(isGameActive(),false);
});
test('the launcher and return control are present in local and published versions',()=>{
 for(const folder of ['docs','site']){
  const html=readFileSync(new URL('../'+folder+'/index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../'+folder+'/game.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../'+folder+'/style.css',import.meta.url),'utf8');
  const hub=readFileSync(new URL('../'+folder+'/hub.js',import.meta.url),'utf8');
  assert.match(html,/id="game-hub"/);
  assert.match(html,/id="game-list"/);
  assert.match(html,/id="astria-app" hidden/);
  assert.match(html,/id="return-to-menu"/);
  assert.match(js,/mountHub\(\{onReturn/);
  assert.match(js,/if\(!isGameActive\(\)\)return/);
  assert.match(css,/\[hidden\]\{display:none!important\}/);
  assert.match(hub,/status:'planned'/);
 }
});
