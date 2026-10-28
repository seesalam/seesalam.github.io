(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],A=window.ASN||{},API=A.pesaner;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('show'),2600)};
const api=async(action,d={})=>{const r=await fetch(API+'?'+new URLSearchParams({action,...d}),{redirect:'follow'});const t=await r.text();try{return JSON.parse(t)}catch(e){throw new Error('Respons server tidak valid')}};
const ago=s=>{const m=Math.floor((Date.now()-new Date(s))/6e4);return m<1?'baru saja':m<60?m+' mnt':m<1440?Math.floor(m/60)+' jam':Math.floor(m/1440)+' hari'};
const TAG=/^\[(IDE|KRITIK|SARAN|REQUEST)\]\s*/,tagOf=c=>{const m=TAG.exec(c||'');return m?m[1]:'DISKUSI'},body=c=>(c||'').replace(TAG,'');
const ICON={IDE:'💡',KRITIK:'🧐',SARAN:'🤝',REQUEST:'🧩',DISKUSI:'💬'};
let U=null,PREM=[],POSTS=[],chatWith=null,poll=null,listPoll=null;
try{U=JSON.parse(localStorage.getItem('asn_user'))}catch(e){}
const isPrem=()=>!!U&&(U.role==='admin'||PREM.includes(U.username));
const lnk=s=>esc(s).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

/* ===== Autentikasi ===== */
let mode='in';
$$('[data-auth]').forEach(b=>b.onclick=()=>{mode=b.dataset.auth;$$('[data-auth]').forEach(x=>x.classList.toggle('on',x===b));$('#a-up').hidden=mode!=='up';$('#a-go').textContent=mode==='up'?'Daftar':'Masuk'});
$('#a-go').onclick=async()=>{const err=$('#ae2'),u=$('#ru').value.trim().toLowerCase().replace(/\s+/g,''),p=$('#rp').value,n=$('#rn').value.trim();err.textContent='';
 if(!u||!p)return err.textContent='Isi username dan kata sandi.';if(mode==='up'&&(!n||p.length<6))return err.textContent='Isi nama dan kata sandi minimal 6 karakter.';
 $('#a-go').disabled=true;
 try{if(mode==='up'){const r=await api('register',{name:n,username:u,password:p});if(!r.success)throw new Error(r.message||'Pendaftaran gagal');toast('Akun dibuat. Silakan masuk.');$('[data-auth=in]').click()}
 else{const r=await api('login',{username:u,password:p});if(!r.success)throw new Error(r.message||'Login gagal');U=r.user;localStorage.setItem('asn_user',JSON.stringify(U));start()}}
 catch(e){err.textContent=e.message||'Gagal terhubung ke server'}
 $('#a-go').disabled=false};
$('#out').onclick=()=>{localStorage.removeItem('asn_user');U=null;clearInterval(poll);clearInterval(listPoll);show()};
function show(){$('#p-auth').hidden=!!U;$('#p-app').hidden=!U}

/* ===== Mulai ===== */
async function start(){show();if(!U)return;
 try{PREM=await (await fetch(A.gas?A.gas+'?action=premium':'/premium.json',{cache:'no-cache'})).json();if(!Array.isArray(PREM))throw 0}catch(e){try{PREM=await (await fetch('/premium.json',{cache:'no-cache'})).json()}catch(x){PREM=[]}}
 $('#me-name').textContent=U.name||U.username;$('#me-user').textContent='@'+U.username;
 $('#me-plan').innerHTML=isPrem()?'<span class="pill ok">✔ PREMIUM</span>':'<span class="pill">TRIAL</span>';$('#up-btn').hidden=isPrem();
 loadFeed();loadChats();clearInterval(listPoll);listPoll=setInterval(()=>{if(!document.hidden)loadChats(true)},15000)}

/* ===== Tab ===== */
$$('[data-ptab]').forEach(b=>b.onclick=()=>{$$('[data-ptab]').forEach(x=>x.classList.toggle('on',x===b));['feed','req','chat','road'].forEach(k=>$('#pt-'+k).hidden=k!==b.dataset.ptab);if(b.dataset.ptab!=='chat'){clearInterval(poll)}});
if(location.hash==='#request')setTimeout(()=>$('#request').click(),0);

/* ===== Feed ===== */
const card=p=>{const liked=(p.likedBy||[]).includes(U.username),t=tagOf(p.content),own=p.authorUsername===U.username||U.role==='admin';
 return `<div class="card pp" data-id="${esc(p.id)}"><div class="pav" data-chat="${esc(p.authorUsername)}" data-name="${esc(p.authorName)}" title="Kirim pesan" style="cursor:pointer">${esc((p.authorName||'?')[0].toUpperCase())}</div><div style="flex:1;min-width:0"><span class="pill ${t==='REQUEST'?'eb':''}">${ICON[t]} ${t}</span> <small class="mut">${esc(p.authorName)} @${esc(p.authorUsername)} · ${ago(p.createdAt)}</small><p style="margin:6px 0">${lnk(body(p.content))}</p><div class="row"><button class="like ${liked?'on':''}" data-like="${esc(p.id)}">▲ <span>${p.likes||0}</span></button>${own?`<button class="like" data-del="${esc(p.id)}">Hapus</button>`:''}</div></div></div>`};
function paintFeed(){const sort=$('#psort').value,cmp=sort==='top'?(a,b)=>(b.likes||0)-(a.likes||0):(a,b)=>new Date(b.createdAt)-new Date(a.createdAt);
 const f=POSTS.filter(p=>tagOf(p.content)!=='REQUEST').sort(cmp),r=POSTS.filter(p=>tagOf(p.content)==='REQUEST').sort((a,b)=>(b.likes||0)-(a.likes||0));
 $('#pfeed').innerHTML=f.map(card).join('')||'<p class="mut">Belum ada postingan. Jadilah yang pertama!</p>';$('#preq').innerHTML=r.map(card).join('')||'<p class="mut">Belum ada request.</p>';reqBox()}
async function loadFeed(){try{const r=await api('getPosts',{username:U.username,offset:0,limit:60});POSTS=r.posts||[];paintFeed()}catch(e){toast('Gagal memuat feed')}}
$('#psort').onchange=paintFeed;
async function send(tag,text){if(!text)return toast('Tulis dulu ya');if(text.length>260)return toast('Maksimal 260 karakter');
 const r=await api('createPost',{username:U.username,content:`[${tag}] ${text}`,privacy:'public'});if(!r.success)throw new Error(r.message||'Gagal mengirim');return r}
$('#psend').onclick=async()=>{const t=$('#pc').value.trim();try{await send($('#pcat').value,t);$('#pc').value='';toast('Terkirim');loadFeed()}catch(e){toast(e.message)}};
document.addEventListener('click',async e=>{
 const l=e.target.closest('[data-like]');if(l){const id=l.dataset.like;l.classList.toggle('on');const s=l.querySelector('span');s.textContent=+s.textContent+(l.classList.contains('on')?1:-1);try{await api('toggleLike',{username:U.username,postId:id})}catch(x){toast('Gagal menyimpan like')}return}
 const d=e.target.closest('[data-del]');if(d){if(!confirm('Hapus postingan ini?'))return;try{await api('deletePost',{username:U.username,postId:d.dataset.del});loadFeed()}catch(x){toast('Gagal menghapus')}return}
 const c=e.target.closest('[data-chat]');if(c&&c.dataset.chat!==U.username){$('[data-ptab=chat]').click();openChat(c.dataset.chat,c.dataset.name)}});

/* ===== Request (Premium 1x) ===== */
async function usedRequest(){try{const r=await api('getUserPosts',{username:U.username,viewerUsername:U.username});return (r.posts||[]).some(p=>tagOf(p.content)==='REQUEST')}catch(e){return POSTS.some(p=>p.authorUsername===U.username&&tagOf(p.content)==='REQUEST')}}
function reqBox(){const b=$('#req-box'),mine=POSTS.some(p=>p.authorUsername===U.username&&tagOf(p.content)==='REQUEST');
 if(!isPrem()){b.innerHTML='<h3>🔒 Akun Trial</h3><p class="mut">Akun trial hanya bisa melihat dan memberi like pada request. Upgrade Premium untuk mengirim 1 request aplikasi baru.</p><button class="btn amb sm" data-act="25">Upgrade Premium</button>';return}
 if(mine){b.innerHTML='<h3>✅ Kuota request terpakai</h3><p class="mut">Setiap akun Premium dapat mengirim 1 request aplikasi. Beri like pada request rekan untuk menentukan prioritas.</p>';return}
 b.innerHTML='<label for="rq" style="margin-top:0">Request aplikasi baru (1× per akun Premium)</label><textarea id="rq" maxlength="260" placeholder="Ceritakan masalah administrasi yang ingin dibantu aplikasi…"></textarea><button class="btn sm" id="rqs" style="margin-top:10px">Kirim Request</button>';
 $('#rqs').onclick=async()=>{const t=$('#rq').value.trim();$('#rqs').disabled=true;try{if(await usedRequest()){toast('Kuota request sudah terpakai');loadFeed();return}await send('REQUEST',t);toast('Request terkirim');loadFeed()}catch(e){toast(e.message);$('#rqs').disabled=false}}}

/* ===== Chat ===== */
async function loadChats(quiet){try{const r=await api('getConversations',{username:U.username}),cs=r.conversations||[];
 $('#clist').innerHTML=cs.map(c=>`<div class="ci" data-open="${esc(c.username)}" data-name="${esc(c.name)}"><div class="pav">${esc((c.name||'?')[0].toUpperCase())}</div><div style="flex:1;min-width:0"><b>${esc(c.name)}</b><div class="small mut" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.lastFromMe?'Kamu: ':''}${esc(c.lastMessage||'')}</div></div>${c.unread>0?`<span class="pill eb">${c.unread}</span>`:''}</div>`).join('')||'<p class="small mut">Belum ada percakapan.</p>';
 const u=cs.reduce((a,c)=>a+(c.unread||0),0),b=$('#unread');b.hidden=!u;b.textContent=u}catch(e){if(!quiet)$('#clist').innerHTML='<p class="small mut">Gagal memuat.</p>'}}
let st;$('#cs').oninput=()=>{clearTimeout(st);const q=$('#cs').value.trim();if(q.length<2){$('#cres').innerHTML='';return}st=setTimeout(async()=>{try{const r=await api('searchUsers',{query:q,excludeUsername:U.username});$('#cres').innerHTML=(r.users||[]).map(u=>`<div class="ci" data-open="${esc(u.username)}" data-name="${esc(u.name)}"><div class="pav">${esc((u.name||'?')[0].toUpperCase())}</div><div><b>${esc(u.name)}</b><div class="small mut">@${esc(u.username)}</div></div></div>`).join('')||'<p class="small mut">Tidak ditemukan.</p>'}catch(e){}},350)};
document.addEventListener('click',e=>{const o=e.target.closest('[data-open]');if(o){$('#cres').innerHTML='';openChat(o.dataset.open,o.dataset.name)}});
function openChat(u,n){chatWith=u;$('#cthread').innerHTML=`<h3>${esc(n||u)} <span class="small mut">@${esc(u)}</span></h3><div class="msgs" id="msgs"><p class="small mut">Memuat…</p></div><div class="row" style="margin-top:10px;flex-wrap:nowrap"><input id="cm" placeholder="Tulis pesan…" maxlength="500"><button class="btn sm" id="cmsend">Kirim</button></div>`;
 $('#cmsend').onclick=sendMsg;$('#cm').onkeydown=e=>{if(e.key==='Enter')sendMsg()};loadMsgs(true);clearInterval(poll);poll=setInterval(()=>{if(!document.hidden)loadMsgs()},5000)}
let last='';
async function loadMsgs(first){if(!chatWith)return;try{const r=await api('getConversation',{username:U.username,otherUsername:chatWith,offset:0,limit:60}),m=(r.messages||[]).slice().sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)),sig=m.length+(m.length?m[m.length-1].id:'');if(!first&&sig===last)return;last=sig;
 const box=$('#msgs');if(!box)return;box.innerHTML=m.map(x=>{const me=x.fromUsername===U.username,txt=x.type&&x.type!=='text'?'📎 Lampiran (buka di Pesaner)':lnk(x.content);return `<div class="b ${me?'me':''}">${txt}<small>${ago(x.createdAt)}</small></div>`}).join('')||'<p class="small mut">Belum ada pesan. Sapa dulu!</p>';box.scrollTop=box.scrollHeight;if(m.some(x=>x.fromUsername!==U.username))loadChats(true)}catch(e){}}
async function sendMsg(){const i=$('#cm'),c=i.value.trim();if(!c||!chatWith)return;i.value='';try{const r=await api('sendMessage',{fromUsername:U.username,toUsername:chatWith,content:c});if(!r.success)throw new Error(r.message||'Gagal');last='';loadMsgs(true)}catch(e){toast(e.message||'Pesan gagal terkirim');i.value=c}}
addEventListener('beforeunload',()=>{clearInterval(poll);clearInterval(listPoll)});
start();
})();
