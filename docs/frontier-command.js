(() => {
  'use strict';
  const base='assets/cinematics/';
  const films=[
    ['01','silent-colony','The Silent Colony','STORY'],['02','bridge-of-glass','A Bridge of Glass','STORY'],['03','enemy-voice','The Enemy’s Voice','STORY'],['04','meridian-heart','The Meridian Heart','STORY'],
    ['05','hammer-siege','Hammer / Siege Battery','CONCORD'],['06','warden','Warden / Heavy Mech','CONCORD'],['07','skyhawk-launch','Skyhawk / Launch Sequence','CONCORD'],['08','bloom-behemoth','Behemoth / Living Siege','BLOOM'],['09','ravener-swarm','Raveners / The Swarm','BLOOM'],['10','luminar-beam','Luminar / Beam Array','LUMEN'],['11','lancet','Lancet / Precision Strike','LUMEN'],['12','light-civilization','A Civilization of Light','LUMEN'],['13','contact','Contact at the Relay','BATTLEFIELD'],['14','frontier','Beyond the Last Transmission','STORY'],['15','tony-studios','Tony Studios / The Ident','STUDIO']
  ].map(([id,slug,title,category])=>({id,slug,title,category,path:base+id+'-'+slug,duration:id==='15'?6:8}));
  const weapons=[
    {id:'07',name:'Skyhawk',faction:'concord',division:'AERIAL DIVISION',role:'Armored gunship',description:'The Concord’s armored VTOL brings heavy machinery into the sky. Examine the original game model in the interactive hangar below.'},
    {id:'05',name:'Hammer',faction:'concord',division:'SIEGE DIVISION',role:'Long-range siege armor',description:'Deploy the Hammer to turn open ground into a killing zone. Its charged bombardment has a minimum range: close the gap or get out of its sights.'},
    {id:'06',name:'Warden',faction:'concord',division:'HEAVY DIVISION',role:'Heavy combat mech',description:'Heavy armor takes a different form. The Warden brings the Concord’s industrial strength to the frontline alongside siege tanks and gunships.'},
    {id:'08',name:'Behemoth',faction:'bloom',division:'LIVING SIEGE',role:'Heavy melee creature',description:'Watch the wind-up. The Behemoth commits its enormous weight to a heavy melee strike. Withdraw from its reach before the blow lands.'},
    {id:'09',name:'Raveners',faction:'bloom',division:'SWARM DIVISION',role:'Paired swarm creatures',description:'Raveners hatch in pairs. Spread mycelium with Pulse Trees to give the Bloom’s creatures regeneration and faster movement.'},
    {id:'10',name:'Luminar',faction:'lumen',division:'BEAM ARRAY',role:'Charged beam weapon',description:'A visible charge announces the Luminar’s beam lane. Its power is precise, but committed: move sideways to escape the marked path.'},
    {id:'11',name:'Lancet',faction:'lumen',division:'HEAVY DIVISION',role:'Heavy weapons unit',description:'Sculpted armor and hard-light technology carry the Lumen into battle. Pair heavy units with a faction whose shields recover out of combat.'}
  ];
  const doctrine={concord:'Steel & discipline',bloom:'Instinct & evolution',lumen:'Precision & light'};
  const stage=document.querySelector('.arsenal-stage'),player=document.querySelector('#arsenal-film'),grid=document.querySelector('#arsenal-grid');
  let selected='05';
  const poster=f=>f.path+'.webp';
  weapons.forEach(w=>{
    const f=films.find(f=>f.id===w.id),button=document.createElement('button');
    button.className='weapon-card';button.dataset.faction=w.faction;button.dataset.weapon=w.id;button.setAttribute('aria-pressed',String(w.id===selected));
    button.innerHTML=`<img src="${poster(f)}" width="640" height="360" loading="lazy" alt="${w.name} cinematic interpretation"><div><small>${w.faction} / ${w.role}</small><strong>${w.name.toUpperCase()}</strong><b aria-hidden="true">↗</b></div>`;
    button.addEventListener('click',()=>select(w.id));grid.append(button);
  });
  function select(id){
    selected=id;const w=weapons.find(w=>w.id===id),f=films.find(f=>f.id===id);
    player.pause();player.src=f.path+'.mp4';player.poster=poster(f);player.setAttribute('aria-label',w.name+' cinematic study');player.load();
    stage.dataset.faction=w.faction;
    document.querySelector('#arsenal-code').textContent=w.faction.toUpperCase()+' / '+w.division;
    document.querySelector('#arsenal-name').textContent=w.name.toUpperCase();document.querySelector('#arsenal-role').textContent=w.role;
    document.querySelector('#arsenal-description').textContent=w.description;document.querySelector('#arsenal-doctrine').textContent=doctrine[w.faction];
    document.querySelector('#arsenal-model-link').dataset.weapon=id;
    grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.weapon===id)));
  }
  select(selected);
  document.querySelectorAll('[data-arsenal-filter]').forEach(button=>button.addEventListener('click',()=>{
    const faction=button.dataset.arsenalFilter;
    document.querySelectorAll('[data-arsenal-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    grid.querySelectorAll('button').forEach(b=>b.hidden=faction!=='all'&&b.dataset.faction!==faction);
    if(faction!=='all'&&weapons.find(w=>w.id===selected).faction!==faction)select(weapons.find(w=>w.faction===faction).id);
  }));
  const dialog=document.querySelector('#shot-dialog'),shotPlayer=document.querySelector('#shot-player');let trigger=null;
  films.forEach(f=>{
    const a=document.createElement('a');a.href=f.path+'.mp4';a.className='film-card';
    a.innerHTML=`<img src="${poster(f)}" width="640" height="360" loading="lazy" alt="${f.title}"><span class="film-play" aria-hidden="true">▶</span><div><small>${f.id} / ${f.category} · 00:0${f.duration}</small><h3>${f.title}</h3></div>`;
    a.addEventListener('click',event=>{
      if(typeof dialog.showModal!=='function'||event.metaKey||event.ctrlKey)return;
      event.preventDefault();trigger=a;document.querySelector('#shot-title').textContent=f.title;shotPlayer.src=f.path+'.mp4';shotPlayer.poster=poster(f);
      document.querySelector('#shot-download').href=f.path+'.mp4';dialog.showModal();document.body.classList.add('dialog-open');shotPlayer.play().catch(()=>{});
    });document.querySelector('#film-grid').append(a);
  });
  document.querySelector('#shot-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{shotPlayer.pause();shotPlayer.removeAttribute('src');shotPlayer.load();document.body.classList.remove('dialog-open');trigger?.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  // Opt-in background motion; never download video on a static first visit.
  const hero=document.querySelector('.hero-film'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let heroVisible=true;
  const otherPlaying=()=>[...document.querySelectorAll('video,audio')].some(m=>m!==hero&&!m.paused);
  function syncHero(){
    const play=document.body.dataset.motion==='on'&&!reduced.matches&&heroVisible&&!document.hidden&&!otherPlaying();
    if(play){if(!hero.getAttribute('src'))hero.src=hero.dataset.src;hero.play().then(()=>hero.classList.add('is-playing')).catch(()=>{});}else{hero.pause();hero.classList.remove('is-playing');}
  }
  new MutationObserver(syncHero).observe(document.body,{attributes:true,attributeFilter:['data-motion']});
  new IntersectionObserver(e=>{heroVisible=e[0].isIntersecting;syncHero();},{threshold:.05}).observe(document.querySelector('.hero'));
  reduced.addEventListener('change',syncHero);document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video,audio').forEach(m=>m.pause());else syncHero();});
  document.querySelectorAll('video,audio').forEach(m=>{if(m===hero)return;m.addEventListener('play',()=>{hero.pause();hero.classList.remove('is-playing');});m.addEventListener('ended',syncHero);});
  player.addEventListener('error',()=>{document.querySelector('#arsenal-description').textContent='This film could not load. Try its download in the cinematic archive below.';});
})();
