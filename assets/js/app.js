(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],A=window.ASN||{};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* IndexedDB dengan cadangan memori */
const mem={};let dbp=new Promise(r=>{try{const q=indexedDB.open('asn-andu',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv',{keyPath:'id'});q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)}catch(e){r(null)}});
const get=async k=>{const d=await dbp;if(!d)return mem[k];return new Promise(r=>{try{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>r(q.result&&q.result.v);q.onerror=()=>r()}catch(e){r(mem[k])}})};
const set=async(k,v)=>{mem[k]=v;const d=await dbp;if(d)try{d.transaction('kv','readwrite').objectStore('kv').put({id:k,v})}catch(e){}};
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('show'),2600)};
const sync=(type,data)=>{if(!A.gas)return;try{fetch(A.gas,{method:'POST',mode:'no-cors',body:JSON.stringify({type,...data})}).catch(()=>{})}catch(e){}};
let S={premium:false,nama:'',instansi:'',nip:'',kuota:3,voted:[],pin:'',req:[],taken:A.taken};
/* Tema, offline, service worker */
$('#thm').onclick=()=>{const d=document.documentElement,c=d.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');d.dataset.theme=c==='dark'?'light':'dark';try{localStorage.th=d.dataset.theme}catch(e){}};
const off=()=>$('#off').style.display=navigator.onLine?'none':'block';addEventListener('online',off);addEventListener('offline',off);off();
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
/* Notifikasi */
async function notify(body){try{const r=await navigator.serviceWorker.ready;r.showNotification('ASN Andu',{body,icon:'/assets/icon.svg'})}catch(e){try{new Notification('ASN Andu',{body})}catch(x){}}}
async function remind(){try{if(!('Notification' in window))return toast('Peramban belum mendukung notifikasi');if(await Notification.requestPermission()!=='granted')return toast('Izin notifikasi ditolak');toast('Pengingat aktif. Tes dalam 5 detik');setTimeout(()=>notify('Jangan lupa laporan akhir bulan ya!'),5000)}catch(e){toast('Notifikasi tidak tersedia')}}
$('#bell').onclick=remind;const rb=$('#remind');if(rb)rb.onclick=remind;
/* Modal aktivasi */
function closeM(){$('#mod').classList.remove('open')}
function openAct(h){$('#sheet').innerHTML=`<h3>Aktivasi akun ASN</h3><p class="small mut">NIP 18 digit dipakai untuk verifikasi awal. Pembayaran dikonfirmasi admin via WhatsApp.</p><label for="an">Nama lengkap</label><input id="an" value="${esc(S.nama)}"><label for="ai">Instansi / daerah</label><input id="ai" value="${esc(S.instansi)}"><label for="anip">NIP</label><input id="anip" inputmode="numeric" maxlength="18" value="${esc(S.nip)}" placeholder="18 digit angka"><p class="small" id="ae" style="color:#ba1a1a"></p><div class="row" style="margin-top:12px"><button class="btn amb" id="go">Lanjut Konfirmasi WhatsApp</button><button class="btn gh" id="no">Batal</button></div><p class="small mut">Batalkan langganan kapan saja.</p>`;$('#mod').classList.add('open');$('#no').onclick=closeM;
$('#go').onclick=async()=>{const n=$('#an').value.trim(),i=$('#ai').value.trim(),p=$('#anip').value.trim();if(n.length<3||i.length<3)return $('#ae').textContent='Nama dan instansi wajib diisi.';if(!/^\d{18}$/.test(p))return $('#ae').textContent='NIP harus 18 digit angka.';
S={...S,nama:n,instansi:i,nip:p,premium:true,kuota:10,taken:Math.min(A.total,S.taken+(h==25?1:0))};await set('state',S);sync('aktivasi',{nama:n,instansi:i,paket:h});closeM();paint();toast('Akun aktif sementara. Admin akan memverifikasi.');window.open(`https://wa.me/${A.wa}?text=${encodeURIComponent(`Halo admin, saya ${n} (NIP ${p}, ${i}) ingin aktivasi paket Rp${h||25}.000/bulan`)}`,'_blank')}}
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(a){e.preventDefault();openAct(+a.dataset.act||25)}const l=e.target.closest('.tile.locked');if(l){e.preventDefault();openAct(25)}});
$('#mod').addEventListener('click',e=>{if(e.target.id==='mod')closeM()});
/* Tampilan berdasarkan status */
function paint(){
 $$('[data-name]').forEach(e=>e.textContent=S.nama||'Sahabat ASN');$$('[data-inst]').forEach(e=>e.textContent=S.instansi);
 $$('[data-status]').forEach(e=>e.innerHTML=S.premium?'<span class="pill ok">✔ PREMIUM AKTIF</span> <span class="pill eb">🏅 ASN PELOPOR</span>':'<span class="pill">GRATIS</span>');
 $$('[data-hide-premium]').forEach(e=>e.hidden=S.premium);
 $$('[data-premium]').forEach(e=>e.classList.toggle('locked',!S.premium));
 const sl=Math.max(0,A.total-A.taken);$$('[data-slot]').forEach(e=>e.textContent=sl);$$('[data-fill]').forEach(e=>e.style.width=(A.taken/A.total*100)+'%');
 $$('[data-kuota]').forEach(e=>e.textContent=S.kuota);$$('[data-kbar]').forEach(e=>e.style.width=Math.min(100,S.kuota*10)+'%');
 $('#sticky').hidden=S.premium;
 const dl=$('[data-deadline]');if(dl){const d=new Date(new Date().getFullYear(),new Date().getMonth()+1,0);dl.textContent=d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}}
/* Komunitas */
function feed(){const f=$('#feed');if(!f)return;const cards=$$('#feed .post');
 cards.forEach(c=>{const id=c.dataset.id,on=S.voted.includes(id),n=(+c.dataset.base)+(on?1:0);c.querySelector('b').textContent=n;c.querySelector('.vote').classList.toggle('on',on);c.dataset.n=n});
 cards.sort((a,b)=>b.dataset.n-a.dataset.n).forEach(c=>f.appendChild(c))}
const fd=$('#feed');if(fd){fd.addEventListener('click',async e=>{const v=e.target.closest('.vote');if(!v)return;if(!S.premium)return openAct(25);const id=v.closest('.post').dataset.id;S.voted=S.voted.includes(id)?S.voted.filter(x=>x!==id):[...S.voted,id];await set('state',S);sync('vote',{id,on:S.voted.includes(id)});feed()})}
$$('[data-tab]').forEach(b=>b.onclick=()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('on',x===b));$('#t-feed').hidden=b.dataset.tab!=='feed';$('#t-req').hidden=b.dataset.tab!=='req'});
if(location.hash==='#request'&&$('#request'))$('#request').click();
const send=$('#send');if(send)send.onclick=async()=>{const t=$('#np').value.trim();if(!t)return toast('Tulis dulu ya');if(!S.premium)return openAct(25);const id='u'+Date.now(),c=document.createElement('div');c.className='card post';c.dataset.id=id;c.dataset.base=0;c.innerHTML=`<button class="vote"><span>▲</span><b>0</b></button><div><span class="pill">${esc($('#nc').value)}</span><p style="margin:6px 0">${esc(t)}</p><small class="mut">${esc(S.nama)}</small></div>`;$('#feed').prepend(c);$('#np').value='';sync('post',{id,t,cat:$('#nc').value,nama:S.nama});toast('Terkirim');feed()};
function myreq(){const m=$('#myreq');if(m)m.innerHTML=S.req.map(r=>`<div class="card">${esc(r)}</div>`).join('')}
const sr=$('#sendreq');if(sr)sr.onclick=async()=>{const v=$('#nr').value.trim();if(!v)return toast('Isi request dulu');if(!S.premium)return openAct(25);S.req.push(v);await set('state',S);sync('request',{v,nama:S.nama});$('#nr').value='';myreq();toast('Request terkirim')};
/* Generator e-Kin */
const rw=$('#rw');if(rw){const out=$('#out');get('ekin').then(d=>{if(d){rw.value=d.raw||'';if(d.out)out.innerHTML=d.out}});let t;rw.oninput=()=>{clearTimeout(t);t=setTimeout(()=>{set('ekin',{raw:rw.value,out:out.innerHTML});toast('Draf tersimpan')},600)};
 $('#gen').onclick=async()=>{const r=rw.value.trim();if(!r)return toast('Isi catatan kerja dulu');if(S.kuota<1)return S.premium?toast('Kuota bulan ini habis'):openAct(25);out.innerHTML='Menyusun laporan…';await new Promise(x=>setTimeout(x,900));
 const it=r.split(/[\n,;.]+/).map(s=>s.trim()).filter(Boolean);out.innerHTML=`<h3 style="text-align:center">LAPORAN KINERJA HARIAN</h3><p>Nama: ${esc(S.nama||'…')}<br>Instansi: ${esc(S.instansi||'…')}<br>Tanggal: ${new Date().toLocaleDateString('id-ID',{dateStyle:'long'})}</p><ol>${it.map(i=>`<li>Melaksanakan kegiatan ${esc(i.toLowerCase())} sesuai ketentuan dan target SKP.</li>`).join('')}</ol><p>Demikian laporan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>`;S.kuota--;await set('state',S);await set('ekin',{raw:r,out:out.innerHTML});toast('Laporan tersusun')}}
/* Profil: backup, PIN, referral */
const bk=$('#bkp');if(bk){bk.onclick=async()=>{const b=new Blob([JSON.stringify({S,ekin:await get('ekin')})],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='asn-andu-backup.json';a.click();toast('Backup diunduh')};
 $('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=async()=>{try{const j=JSON.parse(r.result);S={...S,...j.S};await set('state',S);if(j.ekin)await set('ekin',j.ekin);paint();toast('Data dipulihkan')}catch(x){toast('Berkas tidak valid')}};r.readAsText(f)};
 $('#setpin').onclick=async()=>{S.pin=$('#pin').value.replace(/\D/g,'').slice(0,4);await set('state',S);toast(S.pin?'PIN tersimpan':'PIN dihapus')};
 $('#copyref').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(location.origin+'/?ref='+encodeURIComponent(S.nama||'teman')).then(()=>toast('Tautan disalin'))};
 $('#pubprof').onclick=()=>window.open(`https://wa.me/${A.wa}?text=${encodeURIComponent('Halo admin, mohon buatkan halaman profil publik untuk '+(S.nama||'saya'))}`,'_blank')}
/* Kunci otomatis */
let idle;const bump=()=>{clearTimeout(idle);if(S.pin)idle=setTimeout(()=>{$('#sheet').innerHTML='<h3>🔐 Sesi terkunci</h3><input id="lp" inputmode="numeric" maxlength="4" placeholder="Masukkan PIN"><button class="btn" id="ul" style="margin-top:12px">Buka</button>';$('#mod').classList.add('open');$('#ul').onclick=()=>$('#lp').value===S.pin?closeM():toast('PIN salah')},18e4)};
['click','keydown','touchstart'].forEach(e=>addEventListener(e,bump,{passive:true}));
get('state').then(async s=>{if(s)S={...S,...s};const was=S.premium;S.premium=false;
let U0=null;try{U0=JSON.parse(localStorage.asn_user||'null')}catch(e){}
if(!U0){try{localStorage.removeItem('asn_pay');localStorage.removeItem('asn_tok')}catch(e){}S.nama='';S.instansi='';S.nip='';S.pin=''}
try{const p=JSON.parse(localStorage.asn_pay||'null');if(U0&&p&&p.premium&&p.username===U0.username&&new Date(p.until)>new Date())S.premium=true;if(U0&&p&&p.nama&&!S.nama)S.nama=p.nama}catch(e){}
await set('state',S);paint();feed();myreq();bump();
try{const U=JSON.parse(localStorage.asn_user||'null');if(U){S.nama=U.name||U.username||S.nama;let P=[];try{P=await (await fetch(A.gas?A.gas+'?action=premium':'/premium.json',{cache:'no-cache'})).json()}catch(e){try{P=await (await fetch('/premium.json',{cache:'no-cache'})).json()}catch(x){}}
if(U.role==='admin'||(Array.isArray(P)&&P.includes(U.username)))S.premium=true}}catch(e){}
if(S.premium&&!was){S.kuota=Math.max(S.kuota,10)}await set('state',S);paint();feed()});
})();
