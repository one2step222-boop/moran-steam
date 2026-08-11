
let IDX=null,LOADING=false;
const RK='ssj_recent';
async function load(){if(IDX||LOADING)return;LOADING=true;
 try{IDX=await (await fetch('/search.json')).json()}catch(e){IDX=[]}LOADING=false;render()}
const CHO="ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
function cho(s){let o="";for(const c of s){const k=c.charCodeAt(0);
 if(k>=0xAC00&&k<=0xD7A3)o+=CHO[Math.floor((k-0xAC00)/588)];else if(c.trim())o+=c}return o}
function norm(s){return (s||"").toLowerCase().replace(/[\s:·\-–—'’!?,\.]/g,"")}
/* 음차는 사람마다 다르게 적는다 — Trine 을 우리는 '트리니'로 만들었는데 찾는 사람은
   '트라인'이라 친다. 자모로 풀어 비교하면 이런 차이가 한두 글자로 줄어 잡힌다. */
const JA="ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const MO="ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
const JONG=["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ",
"ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
function jamo(s){let o="";for(const ch of s||""){const k=ch.charCodeAt(0);
 if(k>=0xAC00&&k<=0xD7A3){const i=k-0xAC00;
  o+=JA[Math.floor(i/588)]+MO[Math.floor((i%588)/28)]+JONG[i%28]}
 else o+=ch}
 return o}
function dist(a,b,cap){ /* 편집거리. cap 을 넘으면 일찍 포기한다 */
 if(Math.abs(a.length-b.length)>cap)return cap+1;
 let prev=[...Array(b.length+1).keys()];
 for(let i=1;i<=a.length;i++){const cur=[i];let best=i;
  for(let j=1;j<=b.length;j++){
   const v=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
   cur[j]=v;if(v<best)best=v}
  if(best>cap)return cap+1;prev=cur}
 return prev[b.length]}
let CHOQ=false;      /* 이번 질의가 자음만으로 이뤄졌는가 */
function score(it,q,qc,qj){const e=norm(it.e),y=norm(it.y),c=(it.c||"").replace(/\s/g,"");
 if((it.al||[]).some(a=>norm(a)===q))return 120;
 if((it.al||[]).some(a=>norm(a).startsWith(q)))return 95;
 if(e===q||y===q)return 100;
 if(e.startsWith(q)||y.startsWith(q))return 80;
 if(e.includes(q)||y.includes(q))return 60;
 /* 초성 검색은 '자음만 쳤을 때' 쓰는 기능이다. '림보'처럼 글자를 다 친 질의에까지
    적용하면 초성 ㄹㅂ 으로 시작하는 게임이 전부 위로 올라와 정작 LIMBO 가 묻힌다
    (2026-08-11 실측). 자음만 친 질의일 때만 쓴다. */
 if(CHOQ){
   if(c.startsWith(qc))return 70;
   if(qc.length>=3&&c.includes(qc))return 45;
   return 0;
 }
 // 자모로 풀어 앞부분만 비교. 질의가 짧을수록 허용 오차를 좁힌다.
 if(qj.length>=4&&it.y){
   const yj=jamo(norm(it.y.split(" ").slice(0,3).join(""))).slice(0,qj.length+2);
   const cap=qj.length<=6?1:(qj.length<=10?2:3);
   if(dist(qj,yj.slice(0,qj.length),cap)<=cap)return 45;
 }
 /* 음차가 어긋나는 건 거의 모음 추측 탓이다 — Trine 을 우리는 '트리니'로 냈는데
    찾는 사람은 '트라인'이라 친다. 자음만 남기면 ㅌㄹㄴ vs ㅌㄹㅇㄴ 로 붙는다. */
 if(it.y){
   /* 부제까지 넣으면 골격이 오염된다 — '트리니 5 클라크워크 컨스피러시' 전체를 쓰면
      ㅌㄹㄴㅋㄹ 이 되어 안 붙는다. 앞 두 낱말만 본다. */
   const qk=skel(q), yk=skel(norm(it.y.split(" ").slice(0,2).join("")));
   if(qk.length>=3&&yk&&dist(qk,yk.slice(0,qk.length+1),1)<=1)return 38;
 }
 return 0}
function skel(s){return jamo(s).split("").filter(ch=>JA.indexOf(ch)>=0).join("")}
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
 const qj=jamo(q);
 CHOQ=/^[ㄱ-ㅎ]+$/.test(inp.value.replace(/\s/g,""));
 const hit=IDX.map(it=>[score(it,q,qc,qj),it]).filter(x=>x[0]>0)
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
