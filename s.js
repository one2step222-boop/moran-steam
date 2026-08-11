
let IDX=null,LOADING=false;
const RK='ssj_recent';
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
/* 검색 기록 — 로그인 없이 이 브라우저에만 남는다. 서버로 아무것도 안 보낸다. */
function recent(){try{return JSON.parse(localStorage.getItem(RK)||'[]')}catch(e){return[]}}
function remember(name,a){if(!name)return;
 const r=recent().filter(x=>x.a!==a);r.unshift({n:name,a:a});
 try{localStorage.setItem(RK,JSON.stringify(r.slice(0,8)))}catch(e){}}
function drawRecent(){const box=document.getElementById('recent');if(!box)return;
 const r=recent();if(!r.length){box.innerHTML='';return}
 box.innerHTML='<span class="rl">최근 본 게임</span>'+
  r.map(x=>`<a href="/g/${x.a}.html">${x.n}</a>`).join('')}
function render(){const inp=document.getElementById('q');if(!inp)return;
 const q=norm(inp.value),box=document.getElementById('sr');if(!box)return;
 if(!q){box.style.display='none';return}
 if(!IDX){box.style.display='block';box.innerHTML='<div class="no">불러오는 중…</div>';return}
 const qc=cho(inp.value).replace(/\s/g,"");
 const hit=IDX.map(it=>[score(it,q,qc),it]).filter(x=>x[0]>0)
  .sort((a,b)=>b[0]-a[0]||b[1].d-a[1].d||b[1].o-a[1].o).slice(0,12);
 if(!hit.length){box.style.display='block';
  box.innerHTML='<div class="no">찾는 게임이 없습니다. 영문 제목으로도 해보세요.</div>';return}
 box.style.display='block';
 box.innerHTML=hit.map(([s,it])=>it.d
  ?`<a href="/g/${it.a}.html" data-n="${it.e.replace(/"/g,'')}" data-a="${it.a}">${it.e}<span class="sm">${it.y?' · '+it.y:''}</span>${it.o?`<span class="so">-${it.o}%</span>`:''}</a>`
  :`<a href="https://store.steampowered.com/app/${it.a}/" target="_blank" rel="noopener">${it.e}
    <span class="sm"> · 분석 전 — 스팀에서 보기</span></a>`).join('');
 box.querySelectorAll('a[data-a]').forEach(a=>a.addEventListener('click',()=>
   remember(a.dataset.n,a.dataset.a)));}
function go(ev){ev.preventDefault();const a=document.querySelector('#sr a[data-a]');
 if(a){remember(a.dataset.n,a.dataset.a);location.href=a.href}return false}
/* 집계 — 개인정보는 안 보낸다. 어느 페이지가 몇 번 열렸는지, 어떤 상품이 눌렸는지만.
   정적 사이트라 서버 로그가 없어서 이게 유일한 유입 계측이다. */
const TRK=(document.querySelector('meta[name=trk]')||{}).content||'';
function sid(){let s=sessionStorage.getItem('ssj_s');
 if(!s){s=Math.random().toString(36).slice(2,10);sessionStorage.setItem('ssj_s',s)}return s}
function beat(path,params){if(!TRK)return;
 const q=new URLSearchParams({s:sid(),...params}).toString();
 const u=`${TRK}${path}?${q}`;
 if(navigator.sendBeacon)navigator.sendBeacon(u);else new Image().src=u}
document.addEventListener('DOMContentLoaded',()=>{
 beat('/v',{p:'steam',r:(document.referrer||'direct').slice(0,60)});
 document.querySelectorAll('a[rel~="sponsored"]').forEach(a=>a.addEventListener('click',()=>
   beat('/c',{i:a.dataset.sub||'sd',n:(a.dataset.pn||'').slice(0,50)})));
 drawRecent();
 const g=document.body.dataset.appid,gn=document.body.dataset.gname;
 if(g&&gn)remember(gn,g);            /* 게임 페이지를 열면 그것도 기록에 남긴다 */
 const i=document.getElementById('q');
 if(!i)return;i.addEventListener('focus',load);
 i.addEventListener('input',()=>{load();render()});
 document.addEventListener('click',e=>{if(!e.target.closest('.bigsearch')&&!e.target.closest('.sb')){
  const b=document.getElementById('sr');if(b)b.style.display='none'}})});
