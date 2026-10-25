// Liste centralisée des jeux : ajouter une entrée disponible lors du lancement d'un nouveau jeu.
// Les jeux externes au prototype peuvent utiliser {status:'available', href:'./jeux/mon-jeu/'}.
export const GAMES = Object.freeze([
  Object.freeze({
    id:'astria',
    name:'Éclats d’Astria',
    description:'Explore le Vallon dans notre aventure RPG en pixel art.',
    kind:'Aventure · RPG',
    status:'available',
    icon:'✦'
  }),
  Object.freeze({
    id:'next-1', name:'Prochain jeu',
    description:'Un nouvel univers pourra rejoindre cette collection.',
    kind:'Emplacement 02', status:'planned', icon:'＋'
  }),
  Object.freeze({
    id:'next-2', name:'Autre jeu à venir',
    description:'Une place réservée pour nos prochaines idées.',
    kind:'Emplacement 03', status:'planned', icon:'＋'
  })
]);
let active=false;
export function isGameActive(){return active;}

export function mountHub({onReturn}={}){
 const hub=document.getElementById('game-hub');
 const app=document.getElementById('astria-app');
 const list=document.getElementById('game-list');
 const returnButton=document.getElementById('return-to-menu');
 if(!hub||!app||!list||!returnButton)throw new Error('Menu de jeux incomplet');

 function launch(game){
  if(game.status!=='available')return;
  if(game.href){
   window.location.assign(new URL(game.href,document.baseURI).href);
   return;
  }
  if(game.id!=='astria')return;
  active=true;
  hub.hidden=true;
  app.hidden=false;
  document.title='Éclats d’Astria — Le Premier Voyage';
  window.scrollTo({top:0,behavior:'instant'});
  document.getElementById('game')?.focus({preventScroll:true});
 }
 
 async function showMenu(){
  if(!active)return;
  active=false;
  if(typeof onReturn==='function')onReturn();
  const frame=app.querySelector('.frame');
  if(document.fullscreenElement){
   try{await document.exitFullscreen();}catch{/* return to the list even if fullscreen is unsupported */}
  }
  if(frame?.classList.contains('fullscreen-fallback')){
   frame.classList.remove('fullscreen-fallback');
   document.dispatchEvent(new Event('fullscreenchange'));
  }
  const dlg=document.getElementById('dialog');
  if(dlg?.open)dlg.close();
  app.hidden=true;
  hub.hidden=false;
  document.title='Mes jeux — Atelier Astria';
  window.scrollTo({top:0,behavior:'instant'});
  list.querySelector('[data-game="astria"]')?.focus({preventScroll:true});
 }
 
 for(const game of GAMES){
  const available=game.status==='available';
  const row=document.createElement(available?'button':'div');
  row.className='hub-game'+(available?' is-playable':' is-planned');
  if(available){
   row.type='button';
   row.dataset.game=game.id;
   row.addEventListener('click',()=>launch(game));
  }else{
   row.setAttribute('aria-disabled','true');
  }
  const badge=document.createElement('span');
  badge.className='hub-game-icon';badge.textContent=game.icon;
  const info=document.createElement('span');info.className='hub-game-info';
  const title=document.createElement('strong');title.textContent=game.name;
  const detail=document.createElement('span');detail.textContent=game.description;
  const kind=document.createElement('small');kind.textContent=game.kind;
  info.append(title,detail,kind);
  const state=document.createElement('span');
  state.className='hub-game-state';
  state.textContent=available?'JOUER  →':'À VENIR';
  row.append(badge,info,state);
  list.append(row);
 }
 returnButton.addEventListener('click',showMenu);
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||!active)return;
  if(document.fullscreenElement||app.querySelector('.fullscreen-fallback')||document.getElementById('dialog')?.open)return;
  event.preventDefault();
  void showMenu();
 });
 return Object.freeze({showMenu,launch});
}
