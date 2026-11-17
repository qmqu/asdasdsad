(() => {
'use strict';
const MODES=['vanilla','uhc','pot','nethop','smp','sword','axe','mace'];
const KEY='mctiers-local-editor-v1';
const $=id=>document.getElementById(id);
let players=[];let editing=null;
const clean=p=>({name:String(p.name||'').slice(0,40),region:String(p.region||'NA').slice(0,4),points:Math.max(0,Number(p.points)||0),tiers:Object.fromEntries(MODES.map(m=>[m,String(p.tiers?.[m]||'').slice(0,8)]))});
const avatar=name=>`https://mc-heads.net/avatar/${encodeURIComponent(name)}/48`;
const icon=m=>`https://mctiers.gg/tier_icons/${m}.svg`;
function el(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;}
function draw(){
const root=$('mc-rows');root.replaceChildren();const search=$('mc-search').value.trim().toLowerCase();
const sorted=players.slice().sort((a,b)=>b.points-a.points);
sorted.filter(p=>p.name.toLowerCase().includes(search)).forEach(p=>{
const rank=sorted.indexOf(p)+1,row=el('article','mc-player');
row.append(el('span','mc-rank',String(rank)));
const av=el('img','mc-avatar');av.src=avatar(p.name);av.alt='';av.loading='lazy';av.onerror=()=>{av.onerror=null;av.src='https://mctiers.gg/icons/nav_skip.png';};row.append(av);
const who=el('div');who.append(el('div','mc-name',p.name),el('div','mc-points',`${p.points} points`));row.append(who);
row.append(el('span','mc-region',p.region));
const tiers=el('div','mc-tier-grid');for(const m of MODES){if(!p.tiers[m])continue;const badge=el('div','mc-tier');const img=el('img');img.src=icon(m);img.alt=m;badge.append(img,el('span','',p.tiers[m]));badge.title=m.toUpperCase();tiers.append(badge);}row.append(tiers);root.append(row);
});if(!root.children.length)root.append(el('p','mc-note','No se encontraron jugadores.'));
}
function saveLocal(){localStorage.setItem(KEY,JSON.stringify(players));draw();drawEditor();}
function resetForm(){editing=null;$('mc-name').value='';$('mc-region').value='NA';$('mc-points').value='0';for(const m of MODES)$('tier-'+m).value='';}
function fill(p){editing=p.name;$('mc-name').value=p.name;$('mc-region').value=p.region;$('mc-points').value=p.points;for(const m of MODES)$('tier-'+m).value=p.tiers[m]||'';}
function drawEditor(){const root=$('mc-player-list');root.replaceChildren();players.slice().sort((a,b)=>b.points-a.points).forEach(p=>{const row=el('div','mc-managed'),actions=el('div');row.append(el('span','',`${p.name} — ${p.points} pts`));const edit=el('button','','Editar'),del=el('button','','Quitar');edit.type=del.type='button';edit.onclick=()=>fill(p);del.onclick=()=>{if(confirm(`¿Quitar a ${p.name}?`)){players=players.filter(x=>x!==p);saveLocal();}};actions.append(edit,del);row.append(actions);root.append(row);});}
async function init(){
const slots=$('mc-edit-tiers');for(const m of MODES){const label=el('label','',m.toUpperCase()),select=el('select');select.id='tier-'+m;for(const opt of ['','HT1','LT1','HT2','LT2','HT3','LT3','HT4','LT4','HT5','LT5','LT2-']){const x=el('option','',opt||'Sin tier');x.value=opt;select.append(x);}label.append(select);slots.append(label);}
try{const res=await fetch('data.json',{cache:'no-store'});if(!res.ok)throw Error('No se encontró data.json');players=(JSON.parse(localStorage.getItem(KEY)||'null')||await res.json()).map(clean);}catch(err){try{players=JSON.parse(localStorage.getItem(KEY)||'[]').map(clean);}catch{players=[];}console.warn('Abrí la web mediante GitHub Pages o un servidor local para cargar data.json',err);}
$('mc-search').addEventListener('input',draw);
$('mc-admin').onclick=()=>{$('mc-dialog').showModal();drawEditor();};
$('mc-save').onclick=()=>{const name=$('mc-name').value.trim();if(!name)return alert('Ingresá un nombre');const p=clean({name,region:$('mc-region').value,points:$('mc-points').value,tiers:Object.fromEntries(MODES.map(m=>[m,$('tier-'+m).value]))});if(editing)players=players.filter(x=>x.name!==editing);players=players.filter(x=>x.name.toLowerCase()!==p.name.toLowerCase());players.push(p);saveLocal();resetForm();};
$('mc-clear').onclick=resetForm;
$('mc-export').onclick=()=>{const data=new Blob([JSON.stringify(players,null,2)],{type:'application/json'}),url=URL.createObjectURL(data),a=document.createElement('a');a.href=url;a.download='data.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('mc-import').onclick=()=>$('mc-import-file').click();
$('mc-import-file').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data))throw Error('Se esperaba un array');players=data.map(clean).filter(p=>p.name);saveLocal();resetForm();}catch{alert('JSON inválido');}e.target.value='';};
draw();drawEditor();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
