/* ASN Andu – perilaku halaman v2 (tanpa angka rekayasa) */
(()=>{
const A=window.ASN||{},$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=m=>{const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('show'),2800)};
const R=n=>'Rp'+Number(n).toLocaleString('id-ID');

/* 1. Kuota early bird nyata dari backend */
const paintSlots=l=>{const t=$('#annc-t');
 $$('[data-slot]').forEach(e=>e.textContent=l);$$('[data-fill]').forEach(e=>e.style.width=((A.total-l)/A.total*100)+'%');
 if(t)t.textContent=l>0?`Harga Pelopor Rp${(A.early||25000).toLocaleString('id-ID')}/bulan: tersisa ${l} dari ${A.total} slot.`:'Harga Pelopor sudah penuh. Lihat harga yang berlaku saat ini.'};
paintSlots(Math.max(0,A.total-A.taken));
if(A.gas)fetch(A.gas+'?action=slots').then(r=>r.json()).then(j=>{if(j&&j.ok){A.taken=j.taken;paintSlots(j.left)}}).catch(()=>{});

/* 2. Chip pengguna di header */
try{const U=JSON.parse(localStorage.asn_user||'null');if(U&&U.username){const n=U.name||U.username;$('#chipu').classList.add('on');$('#chipn').textContent=n.split(' ')[0];$('#chipi').textContent=n.charAt(0).toUpperCase();$('#loginb').classList.add('off')}}catch(e){}

/* 3. Simulator Beranda (contoh tetap, bukan hasil AI sungguhan) */
const SIM={
 a:{raw:'Pak Kabid minta bikinin nota dinas buat undangan rapat evaluasi serapan anggaran triwulan, hari Rabu jam 9 pagi di aula lt 2, jangan lupa bawa laptop sama rekapan spj ya.',
  out:'<div class="c">NOTA DINAS</div><div>Yth. : Para Kepala Bidang dan Kepala Subbagian<br>Hal : Undangan Rapat Evaluasi Serapan Anggaran Triwulan<br><br>Sehubungan dengan evaluasi kinerja triwulan berjalan, kami mengundang Saudara untuk hadir pada rapat evaluasi serapan anggaran pada hari Rabu pukul 09.00 WIB di Aula Lantai 2. Mohon membawa laptop dan rekapitulasi SPJ.</div>'},
 b:{raw:'rapat koordinasi, rekap data layanan, input surat masuk, bantu verifikasi berkas',
  out:'<div class="c">LAPORAN KINERJA HARIAN</div><div>1. Mengikuti rapat koordinasi internal sesuai agenda unit kerja.<br>2. Merekapitulasi data layanan administrasi untuk bahan pelaporan.<br>3. Menginput surat masuk ke dalam sistem persuratan.<br>4. Membantu verifikasi kelengkapan berkas permohonan.</div>'}};
const sr=$('#sim-raw');if(sr){const run=k=>{sr.textContent=SIM[k].raw;$('#sim-out').innerHTML='<span style="color:#64748b">Menyusun draf…</span>';setTimeout(()=>{$('#sim-out').innerHTML=SIM[k].out},650);$$('[data-sim]').forEach(b=>b.classList.toggle('on',b.dataset.sim===k))};
 $$('[data-sim]').forEach(b=>b.onclick=()=>run(b.dataset.sim));run('a')}

/* 4. Filter katalog Vault */
const vg=$('#vgrid');if(vg){let cat='Semua',q='';const f=()=>{$$('#vgrid [data-cat]').forEach(c=>{const ok=(cat==='Semua'||c.dataset.cat===cat)&&(!q||c.textContent.toLowerCase().includes(q));c.hidden=!ok});$('#vnone').hidden=!!$$('#vgrid [data-cat]:not([hidden])').length};
 $$('[data-vc]').forEach(b=>b.onclick=()=>{cat=b.dataset.vc;$$('[data-vc]').forEach(x=>x.classList.toggle('on',x===b));f()});$('#vq').oninput=e=>{q=e.target.value.toLowerCase().trim();f()}}

/* 5. Pusat Bantuan: cari + kategori */
const fq=$('#hq');if(fq){let cat='Semua',q='';const f=()=>{let n=0;$$('#faq details').forEach(d=>{const ok=(cat==='Semua'||d.dataset.cat===cat)&&(!q||d.textContent.toLowerCase().includes(q));d.hidden=!ok;if(ok)n++});$('#hnone').hidden=n>0};
 fq.oninput=e=>{q=e.target.value.toLowerCase().trim();f()};$$('[data-hc]').forEach(b=>b.onclick=()=>{cat=b.dataset.hc;$$('[data-hc]').forEach(x=>x.classList.toggle('on',x===b));f();$('#faq').scrollIntoView({behavior:'smooth',block:'start'})})}
const hf=$('#hform');if(hf)hf.onsubmit=e=>{e.preventDefault();const g=i=>$('#'+i).value.trim();if(g('hn').length<2||g('hd').length<10)return toast('Isi nama dan uraian masalah (min. 10 karakter).');
 const t=`Halo admin ASN Andu.\nKategori: ${g('hk')}\nNama: ${g('hn')}\nKode tagihan (jika ada): ${g('hc')||'-'}\nMasalah: ${g('hd')}`;window.open(`https://wa.me/${A.wa}?text=${encodeURIComponent(t)}`,'_blank','noopener')};

/* 6. Daftar isi halaman legal */
const pr=$('#prose'),toc=$('#toc');if(pr&&toc){toc.innerHTML=[...pr.querySelectorAll('h2')].map((h,i)=>{h.id='b'+(i+1);return `<a href="#b${i+1}">${esc(h.textContent)}</a>`}).join('')}

/* 7. Riwayat langganan & poin (Profil) */
const ph=$('#payhist');if(ph)ph.onclick=async()=>{const P=window.ASNPay;if(!P)return toast('Fitur pembayaran belum aktif.');if(!P.getTok())return P.open();
 try{const s=await P.call('myStatus'),st=s.status,m=$('#mod');
  $('#sheet').innerHTML=`<h3>Langganan &amp; Poin</h3><div class="card" style="margin-top:10px"><span class="pill ${st.premium?'ok':''}">${st.premium?'PREMIUM AKTIF':'GRATIS'}</span>${st.until?`<p class="small mut" style="margin:8px 0 0">Berlaku sampai ${new Date(st.until).toLocaleDateString('id-ID',{dateStyle:'long'})} (${st.daysLeft} hari lagi)</p>`:''}<p style="margin:8px 0 0"><b>${R(st.points)}</b> <span class="small mut">poin tersedia</span></p></div>
  <h3 style="margin:16px 0 6px;font-size:14px">Riwayat tagihan</h3>${s.history.length?s.history.map(h=>`<div class="ci" style="cursor:default;justify-content:space-between"><div><b>${esc(h.code)}</b><br><span class="small mut">${new Date(h.createdAt).toLocaleDateString('id-ID')}</span></div><div style="text-align:right"><b>${R(h.total)}</b><br><span class="st ${h.status==='APPROVED'?'tersedia':'segera'}">${esc(h.status)}</span></div></div>`).join(''):'<p class="small mut">Belum ada tagihan.</p>'}
  <div class="row" style="margin-top:14px"><button class="btn amb sm" id="phb">${st.premium?'Perpanjang':'Aktivasi Premium'}</button><button class="btn gh sm" id="phx">Tutup</button></div>`;
  m.classList.add('open');$('#phx').onclick=()=>m.classList.remove('open');$('#phb').onclick=()=>P.open()}catch(e){toast(e.message||'Gagal memuat')}};

/* 8. Salin tautan (profil publik) */
$$('[data-copy]').forEach(b=>b.onclick=()=>navigator.clipboard&&navigator.clipboard.writeText(location.href).then(()=>toast('Tautan disalin')));
})();
