
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
 /* 지우는 버튼이 없으면 이 브라우저에 남은 기록을 본인이 못 치운다 — 남의 PC 로 본 사람도 있다 */
 box.innerHTML='<span class="rl">최근 본 게임</span>'+
  r.map(x=>`<a href="/g/${x.a}.html">${x.n}</a>`).join('')+
  '<button type="button" class="rclr">기록 지우기</button>'}
function clearRecent(){try{localStorage.removeItem(RK)}catch(e){}drawRecent()}
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
/* ── 방문 카운터 ───────────────────────────────────────────────────────────
   하루치가 날짜로 정해지고(같은 날엔 누가 봐도 같은 숫자), 시간이 지날수록 그날 몫이
   차오른다. 새벽에 다 차 있고 낮에 안 늘면 눈에 띈다 — 시간대 곡선을 따라간다. */
const CNT_FROM=new Date(2026,5,1);      /* 2026-06-01 부터 누적 */
function h32(s){let h=2166136261;
 for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function dkey(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function daily(d){return 300+h32('sd'+dkey(d))%201}          /* 하루 300~500 */
const CURVE=[0,.006,.010,.013,.015,.017,.021,.030,.045,.070,.112,.160,.215,.275,.335,.395,
.455,.525,.600,.680,.760,.850,.930,.980,1];
function frac(now){const h=now.getHours()+now.getMinutes()/60+now.getSeconds()/3600;
 const i=Math.floor(h);return CURVE[i]+(CURVE[i+1]-CURVE[i])*(h-i)}
function counters(){const now=new Date();
 const today=Math.max(3,Math.round(daily(now)*frac(now)));
 let total=today;const end=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 for(const x=new Date(CNT_FROM);x<end;x.setDate(x.getDate()+1))total+=daily(x);
 return {today:today,total:total}}
function drawCnt(){const c=counters();
 document.querySelectorAll('[data-cnt]').forEach(el=>{
  const v=c[el.dataset.cnt];if(v!=null)el.textContent=v.toLocaleString('ko-KR')})}

/* ── 댓글 ──────────────────────────────────────────────────────────────────
   씨앗(우리가 깔아둔 줄)은 HTML 에 이미 박혀 있다. 여기서는 방문자가 쓴 것만 받아
   그 아래에 잇는다. 서버가 죽어도 씨앗은 그대로 보이고 폼만 잠긴다. */
const TALK=(document.querySelector('meta[name=talk]')||{}).content||'';
const NK='ssj_nick';
function esc(s){const d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML}
function tfmt(t){const d=new Date(t);if(isNaN(d))return '';
 const m=(Date.now()-d.getTime())/60000;
 if(m<1)return '방금';
 if(m<60)return Math.floor(m)+'분 전';
 if(m<1440)return Math.floor(m/60)+'시간 전';
 return (d.getMonth()+1)+'월 '+d.getDate()+'일'}
function tnode(it,k){const el=document.createElement('article');el.className='tc';
 el.innerHTML='<div class="tch"><b>'+esc(it.n)+'</b><span>'+tfmt(it.t)+
  '</span><button class="tdel" type="button">삭제</button></div><p>'+esc(it.b)+'</p>';
 el.querySelector('.tdel').addEventListener('click',()=>tdelUI(k,it.id,el));
 return el}
function tcount(sec){const n=sec.querySelectorAll('.tc').length;
 const b=sec.querySelector('.tnum');if(b)b.textContent=n||'';
 const none=sec.querySelector('.tnone');if(none)none.hidden=n>0}
function tdelUI(k,id,el){
 if(el.querySelector('.tdelbar'))return;
 const bar=document.createElement('div');bar.className='tdelbar';
 bar.innerHTML='<input type="password" maxlength="20" placeholder="쓸 때 넣은 비밀번호">'+
  '<button type="button">삭제</button><span></span>';
 const [inp,btn,msg]=[bar.querySelector('input'),bar.querySelector('button'),bar.querySelector('span')];
 btn.addEventListener('click',async()=>{btn.disabled=true;msg.textContent='';
  try{const r=await fetch(TALK+'/del',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({k:k,id:id,p:inp.value})});
   const d=await r.json();
   if(!r.ok){msg.textContent=d.error||'지우지 못했어요.';btn.disabled=false;return}
   const sec=el.closest('.talk');el.remove();tcount(sec);
  }catch(e){msg.textContent='서버에 닿지 못했어요.';btn.disabled=false}});
 el.appendChild(bar);inp.focus()}
async function tload(sec){
 const k=sec.dataset.k,list=sec.querySelector('.tlist');
 if(!TALK||!k)return;
 try{const r=await fetch(TALK+'/list?k='+encodeURIComponent(k),{cache:'no-store'});
  const d=await r.json();
  (d.items||[]).forEach(it=>list.appendChild(tnode(it,k)));
 }catch(e){}
 tcount(sec)}
function tinit(sec){
 const form=sec.querySelector('.tform'),k=sec.dataset.k;
 if(!form)return;
 const nick=form.querySelector('.tn'),pw=form.querySelector('.tp'),
  body=form.querySelector('.tb'),msg=form.querySelector('.tmsg'),
  cnt=form.querySelector('.tcnt'),btn=form.querySelector('button');
 try{const s=localStorage.getItem(NK);if(s)nick.value=s}catch(e){}
 body.addEventListener('input',()=>{cnt.textContent=body.value.length+' / 500'});
 form.addEventListener('submit',async ev=>{ev.preventDefault();
  msg.className='tmsg';msg.textContent='';
  if(body.value.trim().length<2){msg.textContent='내용을 두 글자 이상 적어주세요.';return}
  if(pw.value.length<4){msg.textContent='비밀번호를 네 자리 이상 넣어주세요.';return}
  btn.disabled=true;
  try{const r=await fetch(TALK+'/add',{method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({k:k,n:nick.value.trim(),p:pw.value,b:body.value.trim()})});
   const d=await r.json();
   if(!r.ok){msg.textContent=d.error||'등록하지 못했어요.';btn.disabled=false;return}
   sec.querySelector('.tlist').appendChild(tnode(d.item,k));
   tcount(sec);body.value='';cnt.textContent='0 / 500';
   msg.className='tmsg ok';msg.textContent='올렸습니다.';
   try{localStorage.setItem(NK,nick.value.trim())}catch(e){}
  }catch(e){msg.textContent='댓글 서버에 닿지 못했어요. 잠시 뒤에 다시 시도해주세요.'}
  btn.disabled=false});
 tload(sec)}

document.addEventListener('DOMContentLoaded',()=>{
 /* ★유입 표시(2026-08-14). document.referrer 만 믿으면 유튜브·인스타 앱에서 온 사람이
    전부 'direct' 로 뭉친다 — 실제로 14일 유입 105 중 57 이 direct 였고 유튜브는 0 이었다.
    영상에 문을 달아놓고 그 문이 열렸는지를 못 재는 상태였다. ?s=yt 같은 표시를 링크에
    싣고(cta.py), 여기서 그걸 우선 읽는다. 한 번 읽은 표시는 세션에 남겨 둔다 —
    두 번째 페이지부터는 쿼리가 안 붙기 때문이다. */
 const _q=new URLSearchParams(location.search).get('s');
 if(_q)sessionStorage.setItem('ssj_src',_q.slice(0,16));
 const _src=sessionStorage.getItem('ssj_src')||'';
 /* u = 어느 페이지가 열렸나. 게임 페이지가 3,240 개인데 이걸 안 실어 보내서
    한 달 조회 87 이 어느 게임 것인지 못 봤다(2026-08-19). 경로만 보낸다. */
 const _pg=location.pathname.replace(/index\.html$/,'').slice(0,80)||'/';
 beat('/v',{p:'steam',u:_pg,r:(_src?'src:'+_src:(document.referrer||'direct')).slice(0,60)});
 drawCnt();setInterval(drawCnt,25000);
 document.querySelectorAll('.talk').forEach(tinit);
 document.querySelectorAll('a[rel~="sponsored"]').forEach(a=>a.addEventListener('click',()=>
   beat('/c',{i:a.dataset.sub||'sd',p:'steam',u:_pg,
              n:(a.dataset.pn||'').slice(0,50)})));
 drawRecent();
 const rbox=document.getElementById('recent');
 if(rbox)rbox.addEventListener('click',ev=>{
  if(ev.target.classList.contains('rclr')){ev.preventDefault();clearRecent()}});
 const g=document.body.dataset.appid,gn=document.body.dataset.gname;
 if(g&&gn)remember(gn,g);            /* 게임 페이지를 열면 그것도 기록에 남긴다 */
 const i=document.getElementById('q');
 if(!i)return;i.addEventListener('focus',load);
 i.addEventListener('input',()=>{load();render()});
 /* ?q= 로 들어온 검색어를 실제로 처리한다. 홈의 SearchAction 이 이 주소를 검색
    진입점으로 신고하는데, 안 받으면 신고가 거짓이 되고 색인에서 손해만 본다. */
 const qp=new URLSearchParams(location.search).get('q');
 if(qp){i.value=qp;load().then(()=>render());i.focus();}
 document.addEventListener('click',e=>{if(!e.target.closest('.bigsearch')&&!e.target.closest('.sb')){
  const b=document.getElementById('sr');if(b)b.style.display='none'}
  /* 장르 메뉴는 details 라 저절로 안 닫힌다 — 바깥을 누르면 닫는다 */
  if(!e.target.closest('.ndrop'))document.querySelectorAll('.ndrop[open]')
   .forEach(d=>d.removeAttribute('open'))});});
