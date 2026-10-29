/* Mode AI cloud opsional untuk e-Kin (lewat Code.gs). Mode template tetap di perangkat. */
(()=>{const A=window.ASN||{};if(!A.gas)return;
const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=m=>{const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('show'),3200)};
const box=$('#modebox');if(!box)return;
box.innerHTML=`<div class="card lv2" style="margin-top:12px"><b>Mode penyusunan</b>
<label style="display:flex;gap:10px;margin-top:10px;align-items:flex-start"><input type="radio" name="mm" value="tpl" checked style="width:auto;margin-top:4px"><span><b>Template otomatis</b> (bukan AI)<br><span class="small mut">Berjalan di perangkatmu. Tidak ada data yang dikirim.</span></span></label>
<label style="display:flex;gap:10px;margin-top:10px;align-items:flex-start"><input type="radio" name="mm" value="ai" style="width:auto;margin-top:4px"><span><b>AI cloud</b> (opsional)<br><span class="small mut">Teks catatanmu dikirim lewat server ASN Andu ke penyedia AI pihak ketiga. Hasilnya lebih luwes, tapi bukan lagi sepenuhnya di perangkat.</span></span></label>
<div id="aic" hidden style="margin-top:10px"><label style="display:flex;gap:8px;align-items:flex-start" class="small"><input type="checkbox" id="aicons" style="width:auto;margin-top:3px"><span>Saya paham catatan ini dikirim ke penyedia AI dan dapat diproses sesuai ketentuannya. Saya tidak memasukkan data rahasia atau data pribadi pihak lain. <a href="/privasi/#b6">Pelajari</a></span></label><p class="small mut" id="aiq" style="margin:8px 0 0"></p></div></div>`;
const mode=()=>(document.querySelector('input[name=mm]:checked')||{}).value;
const quota=async()=>{const P=window.ASNPay;if(!P||!P.getTok())return $('#aiq').textContent='Masuk dulu untuk memakai AI cloud.';
 try{const q=await P.call('aiQuota');$('#aiq').textContent=!q.enabled?'AI cloud belum diaktifkan admin. Pakai mode template.':q.premium?`Sisa hari ini: ${q.day} · bulan ini: ${q.month}`:(q.trialLeft?'Kamu punya 1 percobaan gratis.':'Percobaan gratis sudah dipakai. Aktifkan Premium untuk lanjut.')}catch(e){$('#aiq').textContent=''}};
document.querySelectorAll('input[name=mm]').forEach(r=>r.onchange=()=>{$('#aic').hidden=mode()!=='ai';if(mode()==='ai')quota()});
document.addEventListener('click',async e=>{if(!e.target.closest('#gen')||mode()!=='ai')return;e.preventDefault();e.stopImmediatePropagation();
 const raw=$('#rw').value.trim(),out=$('#out');if(!raw)return toast('Isi catatan kerja dulu');if(!$('#aicons').checked)return toast('Centang persetujuan dulu');
 const P=window.ASNPay;if(!P)return toast('Fitur belum aktif');await P.ensure();$('#gen').disabled=true;out.innerHTML='Menyusun laporan dengan AI…';
 try{const j=await P.call('aiCompose',{text:raw});const d=new Date().toLocaleDateString('id-ID',{dateStyle:'long'});
  out.innerHTML=`<h3 style="text-align:center">LAPORAN KINERJA HARIAN</h3><p>Nama: ${esc(j.profile.name||'…')}<br>Instansi: ${esc(j.profile.instansi||'…')}<br>Tanggal: ${d}</p><ol>${j.items.map(i=>`<li>${esc(i.out)}</li>`).join('')}</ol><p>Demikian laporan ini dibuat untuk dipergunakan sebagaimana mestinya.</p><p class="small mut no-print">Draf disusun AI. Tinjau dan sesuaikan dengan kegiatan sebenarnya sebelum diserahkan.</p>`;
  $('#aiq').textContent=j.trial?'Percobaan gratis terpakai.':`Sisa hari ini: ${j.remaining.day} · bulan ini: ${j.remaining.month}`;toast('Draf tersusun')}
 catch(x){out.innerHTML=`<span style="color:#ba1a1a">${esc(x.message||'Gagal')}</span>`+(/Premium/.test(x.message||'')?' <button class="btn amb sm" id="goprem">Aktifkan Premium</button>':'');const g=$('#goprem');if(g)g.onclick=()=>P.open()}
 $('#gen').disabled=false},true);
})();
