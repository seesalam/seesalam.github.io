# ASN Andu (Jekyll + GitHub Pages)
1. Buat repo GitHub, unggah isi folder ini ke branch `main`.
2. Settings > Pages > Source: GitHub Actions. Domain kustom ada di `CNAME`.
3. Ubah `wa`, `gas_url`, `early_taken` di `_config.yml`.
4. Profil anggota: tambah berkas `_profiles/nama.md` (lihat contoh), tampil di `/u/nama/`.
5. Artikel blog: tambah berkas di `_posts/` dari pertanyaan komunitas.
6. Feed dan roadmap awal ada di `_data/feed.yml` dan `_data/roadmap.yml`. Vote, post, request dikirim ke Google Apps Script bila `gas_url` diisi.
Jalankan lokal: `bundle install && bundle exec jekyll serve`.

## Akun, feed, dan chat (dipakai ulang dari Pesaner)
Halaman `/komunitas/` memakai backend Apps Script Pesaner (`pesaner_url` di `_config.yml`): register, login, getPosts, createPost, toggleLike, deletePost, getUserPosts, searchUsers, getConversations, getConversation, sendMessage.
- Ide, kritik, saran: bebas untuk semua akun. Dikirim sebagai postingan berawalan `[IDE]`, `[KRITIK]`, `[SARAN]`.
- Request aplikasi: awalan `[REQUEST]`, 1× per akun Premium. Akun trial hanya melihat dan like.
- Status Premium: tambahkan username ke `_data/premium.yml` setelah pembayaran terverifikasi.
- Penegakan di server (disarankan): di `createPost` pada Apps Script, tolak isi berawalan `[REQUEST]` bila username tidak ada di sheet Premium atau sudah punya request. Tanpa itu, aturan hanya ditegakkan di antarmuka.

## Backend pembayaran (Code.gs)
Lihat `README_BACKEND.md`. Isi `gas_url` di `_config.yml` dengan URL web app Code.gs. Panel admin: `/admin/`.
