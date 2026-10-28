# Setup Code.gs (Apps Script)
1. Buat Google Sheet baru > Ekstensi > Apps Script > tempel `Code.gs`.
2. Jalankan fungsi `setupAwal()` sekali (izinkan akses). Ini membuat sheet Members, Invoices, PointsLog, Profiles, Waitlist, Log dan trigger kedaluwarsa tagihan.
3. Project Settings > Script Properties, isi:
   - `ADMIN_USERNAMES` : username Pesaner superadmin, pisah koma (mis. `andu`)
   - `ADMIN_EMAIL`     : email notifikasi saat user menekan "Saya sudah bayar"
   - `GH_REPO` (`owner/repo`), `GH_TOKEN` (fine-grained PAT, izin Contents: read/write pada repo ini saja), `GH_BRANCH` (`main`)
   - `EARLY_TAKEN_BASE` (opsional, jumlah pelopor yang sudah dijanjikan di luar sistem; default 0)
4. Terapkan > Deployment baru > Aplikasi web > Jalankan sebagai: Saya, Akses: Siapa saja. Salin URL `/exec` ke `gas_url` di `_config.yml`.
5. Setiap mengubah Code.gs: Kelola deployment > Edit > Versi baru.
