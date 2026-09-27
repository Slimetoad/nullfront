const units = [
  {id:'skyhawk',film:'07',name:'Skyhawk',faction:'Concord',role:'Armored gunship',model:'./assets/showcase-unit.glb'},
  {id:'hammer',film:'05',name:'Hammer',faction:'Concord',role:'Siege tank'},
  {id:'warden',film:'06',name:'Warden',faction:'Concord',role:'Heavy combat mech'},
  {id:'behemoth',film:'08',name:'Behemoth',faction:'Bloom',role:'Living siege beast'},
  {id:'ravener',film:'09',name:'Ravener',faction:'Bloom',role:'Swarm predator'},
  {id:'luminar',film:'10',name:'Luminar',faction:'Lumen',role:'Charged beam array'},
  {id:'lancet',film:'11',name:'Lancet',faction:'Lumen',role:'Heavy weapons construct'}
];
const host=document.querySelector('#hangar-viewport');
const loadButton=document.querySelector('#hangar-load');
const status=document.querySelector('#hangar-status');
const selector=document.querySelector('.model-selector');
let selected=units[0],session=null,revision=0;
units.forEach(unit=>{
  unit.model ||= `./assets/models/${unit.id}.glb`;
  const button=document.createElement('button');
  button.type='button';button.dataset.modelId=unit.id;
  button.innerHTML=`<small>${unit.faction}</small><strong>${unit.name}</strong><span>3D ↗</span>`;
  button.setAttribute('aria-pressed',String(unit===selected));
  button.addEventListener('click',()=>open(unit));selector.append(button);
});
async function open(unit){
  const ticket=++revision;selected=unit;
  session?.dispose();session=null;
  host.dataset.state='loading';host.removeAttribute('data-model');
  loadButton.disabled=true;status.textContent=`Loading ${unit.name}…`;
  document.querySelector('#hangar-controls').hidden=true;
  document.querySelector('#model-label').textContent=`${unit.name.toUpperCase()} / 360°`;
  document.querySelector('#model-role').textContent=unit.role;
  const download=document.querySelector('#model-download');download.href=unit.model;download.textContent=`Download ${unit.name} GLB ↓`;
  document.querySelector('#model-faction').textContent=unit.faction;
  document.querySelector('#model-source').textContent=unit.id==='skyhawk'?'Original Skyhawk game model · interactive studio presentation':'New 3D showcase interpretation · original game model not supplied';
  selector.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modelId===unit.id)));
  try{
    const {mountHangar}=await import('./hangar.js');
    if(ticket!==revision)return;
    const mounted=await mountHangar(host,unit);
    if(ticket!==revision){mounted?.dispose();return;}
    if(!mounted)return;
    session=mounted;document.querySelector('#hangar-controls').hidden=false;
    document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view==='hero')));
    document.querySelector('#hangar-spin').setAttribute('aria-pressed','false');
    document.querySelector('#hangar-light').setAttribute('aria-pressed','false');
    document.querySelector('#hangar-help-live').textContent=`${unit.name} ready. Drag to rotate or use camera buttons.`;
  }catch{
    if(ticket!==revision)return;
    host.dataset.state='error';loadButton.disabled=false;
    loadButton.textContent=`Retry ${unit.name} in 3D`;
    status.textContent='The model could not load. Try again or select another unit.';
  }
}
loadButton.addEventListener('click',()=>open(selected));
document.querySelector('#arsenal-model-link').addEventListener('click',()=>{
  const unit=units.find(u=>u.film===document.querySelector('#arsenal-model-link').dataset.weapon);
  if(unit)open(unit);
});
