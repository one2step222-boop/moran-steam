
let IDX=null,LOADING=false;
async function load(){if(IDX||LOADING)return;LOADING=true;
 try{IDX=await (await fetch('/search.json')).json()}catch(e){IDX=[]}LOADING=false;render()}
const CHO="ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
function cho(s){let o="";for(const c of s){const k=c.charCodeAt(0);
 if(k>=0xAC00&&k<=0xD7A3)o+=CHO[Math.floor((k-0xAC00)/588)];else if(c.trim())o+=c}return o}
function norm(s){return (s||"").toLowerCase().replace(/[\s:·\-–—'’!?,\.]/g,"")}
function score(it,q,qc){const e=norm(it.e),y=norm(it.y),c=(it.c||"").replace(/\s/g,"");
 if(e===q||y===q)return 100;
 if(e.startsWith(q)||y.startsWith(q))return 80;
 if(e.includes(q)||y.includes(q))return 60;
 if(qc.length>=2&&c.includes(qc))return 40;
 return 0}
function boxes(){return [document.getElementById('sr')].filter(Boolean)}
function render(){const inp=document.getElementById('q');if(!inp)return;
 const q=norm(inp.value),box=document.getElementById('sr');if(!box)return;
 if(!q){box.style.display='none';return}
 if(!IDX){box.style.display='block';box.innerHTML='<div class="no">불러오는 중…</div>';return}
 const qc=cho(inp.value).replace(/\s/g,"");
 const hit=IDX.map(it=>[score(it,q,qc),it]).filter(x=>x[0]>0)
  .sort((a,b)=>b[0]-a[0]||b[1].d-a[1].d||b[1].o-a[1].o).slice(0,12);
 if(!hit.length){box.style.display='block';
  box.innerHTML='<div class="no">찾는 게임이 없어요. 영문 제목으로도 해보세요.</div>';return}
 box.style.display='block';
 box.innerHTML=hit.map(([s,it])=>it.d
  ?`<a href="/g/${it.a}.html">${it.e}<span class="sm">${it.y?' · '+it.y:''}</span>${it.o?`<span class="so">-${it.o}%</span>`:''}</a>`
  :`<a href="https://store.steampowered.com/app/${it.a}/" target="_blank" rel="noopener">${it.e}
    <span class="sm"> · 아직 분석 전 — 스팀에서 보기</span></a>`).join('')}
function go(ev){ev.preventDefault();const a=document.querySelector('#sr a');if(a)location.href=a.href;return false}
document.addEventListener('DOMContentLoaded',()=>{const i=document.getElementById('q');
 if(!i)return;i.addEventListener('focus',load);
 i.addEventListener('input',()=>{load();render()});
 document.addEventListener('click',e=>{if(!e.target.closest('.bigsearch')&&!e.target.closest('.sb')){
  const b=document.getElementById('sr');if(b)b.style.display='none'}})});
