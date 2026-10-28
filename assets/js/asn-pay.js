/* ASN Andu – pembayaran QRIS (kode tagihan + nominal unik) */
(()=>{
const A=window.ASN||{},G=A.gas;if(!G)return;
const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const R=n=>'Rp'+Number(n).toLocaleString('id-ID');
const toast=m=>{const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('show'),3000)};
let tok=null,poll=null,tick=null;try{tok=JSON.parse(localStorage.asn_tok)}catch(e){}
const call=async(action,d={})=>{const r=await fetch(G,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action,token:tok&&tok.token,...d})});const j=await r.json();
 if(j.code==='AUTH'){tok=null;localStorage.removeItem('asn_tok')}if(!j.ok)throw new Error(j.message||'Gagal');return j};
const loggedIn=()=>tok&&tok.exp>Date.now();
const cache=s=>{try{localStorage.asn_pay=JSON.stringify({premium:s.premium,until:s.until,nama:tok&&tok.name})}catch(e){}};
const M=h=>{$('#sheet').innerHTML=h;$('#mod').classList.add('open')},X=()=>{$('#mod').classList.remove('open');clearInterval(poll);clearInterval(tick)};
let qrLib;const lib=()=>qrLib||(qrLib=new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)}));

function login(){let u='';try{u=JSON.parse(localStorage.asn_user).username}catch(e){}
 M(`<h3>Masuk dulu</h3><p class="small mut">Gunakan akun komunitas (Pesaner) yang sama. Kata sandi tidak disimpan di perangkat.</p><label for="lu">Username</label><input id="lu" value="${esc(u)}" autocomplete="username"><label for="lp2">Kata sandi</label><input id="lp2" type="password" autocomplete="current-password"><p class="small" id="le" style="color:#ba1a1a"></p><div class="row" style="margin-top:10px"><button class="btn" id="lg">Masuk</button><button class="btn gh" id="lx">Batal</button></div><p class="small mut">Belum punya akun? Daftar di <a href="/komunitas/">Komunitas</a>.</p>`);
 $('#lx').onclick=X;$('#lg').onclick=async()=>{$('#lg').disabled=true;$('#le').textContent='';
  try{const j=await fetch(G,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'authLogin',username:$('#lu').value,password:$('#lp2').value})}).then(r=>r.json());
   if(!j.ok)throw new Error(j.message);tok={token:j.token,exp:Date.now()+6.9*864e5,username:j.user.username,name:j.user.name,admin:j.user.admin};localStorage.asn_tok=JSON.stringify(tok);cache(j.status);open()}
  catch(e){$('#le').textContent=e.message||'Gagal terhubung';$('#lg').disabled=false}}}

async function open(){
 if(!loggedIn())return login();
 M('<p class="mut">Memuat…</p>');
 try{const s=await call('myStatus');cache(s.status);
  if(s.invoice&&s.invoice.status==='CLAIMED')return waiting(s.invoice);
  if(s.invoice)return invoice(s.invoice);
  form(s)}catch(e){if(!loggedIn())return login();M(`<h3>Gagal memuat</h3><p class="small">${esc(e.message)}</p><button class="btn gh" onclick="document.getElementById('mod').classList.remove('open')">Tutup</button>`)}}

function form(s){const st=s.status,n=s.next,left=s.slots.left;
 M(`<h3>${st.premium?'Perpanjang Premium':'Aktivasi Premium'}</h3>
 ${st.premium?`<p class="small"><span class="pill ok">Aktif sampai ${new Date(st.until).toLocaleDateString('id-ID',{dateStyle:'long'})}</span></p>`:''}
 <div class="card lv2"><b style="font-size:1.4em">${R(n.price)}</b>/bulan <span class="pill eb">${n.tier==='early'?'Harga Pelopor':n.tier==='promo'?'Promo Launching':'Harga Normal'}</span>
 ${n.tier==='early'&&!st.lockedPrice?`<p class="small mut" style="margin:6px 0 0">Sisa kuota harga ini: <b>${left}</b> dari ${s.slots.total}. Harga terkunci selama langganan aktif.</p>`:''}${st.lockedPrice?'<p class="small mut" style="margin:6px 0 0">Harga kunci Pelopor berlaku. Perpanjang maksimal 7 hari setelah habis agar tidak hangus.</p>':''}</div>
 <label for="pn">Nama lengkap</label><input id="pn" value="${esc(tok.name||'')}"><label for="pi">Instansi / daerah</label><input id="pi" placeholder="mis. SDN 1 Jatisampurna, Kota Bekasi"><label for="pp">NIP (18 digit, untuk verifikasi ASN)</label><input id="pp" inputmode="numeric" maxlength="18">
 ${st.points>0?`<label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="up" style="width:auto"> Pakai ${R(st.points)} poin sebagai potongan</label>`:''}
 <p class="small" id="fe" style="color:#ba1a1a"></p><div class="row" style="margin-top:10px"><button class="btn amb" id="mk">Buat Tagihan QRIS</button><button class="btn gh" id="fx">Batal</button></div>
 <p class="small mut">Nominal akan ditambah kode unik (1–499). Kode unik tidak hilang: setelah diverifikasi, jumlahnya masuk sebagai poin di akunmu.</p>`);
 $('#fx').onclick=X;$('#mk').onclick=async()=>{$('#mk').disabled=true;$('#fe').textContent='';
  try{const j=await call('createInvoice',{nama:$('#pn').value,instansi:$('#pi').value,nip:$('#pp').value,usePoints:!!($('#up')&&$('#up').checked)});invoice(j.invoice)}
  catch(e){$('#fe').textContent=e.message;$('#mk').disabled=false}}}

async function invoice(v){
 const uc=String(v.uniqueCode).padStart(3,'0'),tt=String(v.total),head=tt.slice(0,-3),tail=tt.slice(-3);
 M(`<h3>Bayar dengan QRIS</h3><p class="small mut">Kode tagihan <b>${esc(v.code)}</b> · berlaku <span id="cd"></span></p>
 <div style="text-align:center"><div id="qr" style="display:inline-block;background:#fff;padding:10px;border-radius:12px;min-height:160px"></div>
 <p class="small mut" style="margin:8px 0 2px">Transfer tepat sebesar</p><div style="font-size:1.7em;font-weight:800">Rp${Number(head).toLocaleString('id-ID')}.<span style="color:#d97706">${tail}</span></div>
 <button class="btn sm gh" id="cp">Salin nominal</button></div>
 <ol class="small" style="padding-left:18px"><li>Scan QR memakai e-wallet/m-banking apa saja. Nominal sudah terisi otomatis.</li><li>Pastikan nominal <b>sama persis</b> hingga 3 digit terakhir (kode unik ${uc}).</li><li>Setelah membayar, tekan <b>Saya sudah bayar</b> di bawah.</li></ol>
 ${v.pointsUsed?`<p class="small mut">Harga ${R(v.price)} dipotong ${R(v.pointsUsed)} poin.</p>`:''}
 <details class="small"><summary>QR tidak bisa dipindai?</summary><p>Pakai QRIS statis di bawah, lalu ketik nominal manual <b>${R(v.total)}</b>.</p><img src="/assets/img/qris-static.jpg" alt="QRIS El-Salam Technology" style="max-width:220px;border-radius:10px"></details>
 <label for="py">Nama pengirim di e-wallet/bank (membantu admin mencocokkan)</label><input id="py" value="${esc(tok.name||'')}">
 <p class="small" id="ie" style="color:#ba1a1a"></p><div class="row" style="margin-top:10px"><button class="btn amb" id="paid">✔ Saya sudah bayar</button><button class="btn gh" id="cx">Batalkan tagihan</button><button class="btn gh" id="cl">Tutup</button></div>`);
 $('#cl').onclick=X;$('#cp').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(tt).then(()=>toast('Nominal disalin'))};
 clearInterval(tick);const end=new Date(v.expiresAt).getTime(),cd=()=>{const m=Math.max(0,Math.floor((end-Date.now())/6e4));const e=$('#cd');if(e)e.textContent=m>=60?Math.floor(m/60)+' jam '+m%60+' mnt':m+' mnt'};cd();tick=setInterval(cd,3e4);
 try{await lib();new QRCode($('#qr'),{text:v.qris,width:220,height:220,correctLevel:QRCode.CorrectLevel.M})}catch(e){$('#qr').innerHTML='<p class="small" style="color:#111">QR gagal dimuat. Pakai QRIS statis di bawah.</p>'}
 $('#paid').onclick=async()=>{$('#paid').disabled=true;try{const j=await call('claimPaid',{code:v.code,payerName:$('#py').value});waiting(j.invoice)}catch(e){$('#ie').textContent=e.message;$('#paid').disabled=false}};
 $('#cx').onclick=async()=>{if(!confirm('Batalkan tagihan ini?'))return;try{await call('cancelInvoice',{code:v.code});toast('Tagihan dibatalkan');X()}catch(e){$('#ie').textContent=e.message}}}

function waiting(v){
 M(`<h3>⏳ Menunggu verifikasi admin</h3><p>Konfirmasi pembayaranmu sudah terkirim.</p><div class="card lv2"><p class="small mut" style="margin:0">Kode tagihan</p><b>${esc(v.code)}</b><p class="small mut" style="margin:8px 0 0">Nominal</p><b>${R(v.total)}</b></div>
 <p class="small mut">Admin mencocokkan nominal dengan mutasi masuk. Halaman ini otomatis berubah saat disetujui. Butuh cepat? <a href="https://wa.me/${A.wa}?text=${encodeURIComponent('Halo admin, konfirmasi pembayaran '+v.code+' sebesar '+R(v.total))}" target="_blank" rel="noopener">Hubungi admin</a>.</p><button class="btn gh" id="wx">Tutup</button>`);
 $('#wx').onclick=X;clearInterval(poll);
 poll=setInterval(async()=>{try{const s=await call('myStatus');if(s.status.premium&&(!s.invoice)){clearInterval(poll);cache(s.status);M(`<h3>🎉 Premium aktif!</h3><p>Terima kasih. Poin saat ini: <b>${R(s.status.points)}</b>.</p><button class="btn amb" onclick="location.reload()">Mulai</button>`)}else if(!s.invoice){clearInterval(poll);X();toast('Tagihan ditutup. Cek status di profil.')}}catch(e){}},20000)}

/* ambil alih tombol aktivasi lama (fase tangkap) */
document.addEventListener('click',e=>{if(e.target.closest('[data-act]')||e.target.closest('.tile.locked')){e.preventDefault();e.stopImmediatePropagation();open()}},true);
window.ASNPay={open,call,getTok:()=>tok,setTok:t=>{tok=t;localStorage.asn_tok=JSON.stringify(t)}};
})();
