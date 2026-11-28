# Panduan Lengkap Persiapan GitHub Repo, Domain (`domainname.web.id`), Cloudflare DNS & Cloudflare Secrets

Dokumen ini berisi hasil pemeriksaan kesiapan repositori saat ini serta panduan langkah demi langkah untuk menaruh proyek ke **GitHub**, menghubungkan domain **`domainname.web.id`** ke **Cloudflare DNS**, men-deploy HTML statis di **Cloudflare Pages**, dan menyimpan seluruh ID/token konfigurasi sebagai **Environment Variables / Secrets di Cloudflare**.

---

## 1. Hasil Pemeriksaan Kesiapan Repository

Berdasarkan audit langsung terhadap seluruh file sumber (`package.json`, `site.config.json`, `scripts/site-builder.mjs`, `scripts/build-static.mjs`, `.gitignore`, `.env.example`, `server.js`, dan seluruh file HTML):

| Komponen | Status | Keterangan & Hasil Audit |
| --- | --- | --- |
| **Keamanan GitHub (`.gitignore`)** | Siap | `node_modules/`, `dist/`, `.env`, `.env.local`, `.env.*.local`, `*.log`, `.DS_Store`, `.admin-auth.json`, dan `.local-d1.sqlite*` sudah dikecualikan agar tidak ikut ter-commit. |
| **Kebersihan Kode Sumber** | Siap | `site.config.json` bebas dari token/ID sensitif (`measurementId`, `verificationToken`, `publisherId` kosong). Tidak ada `localhost` atau *hardcoded secret* di HTML/JS. Password admin dan token GitHub dibaca eksklusif dari environment/secret sisi server. |
| **Build Statis (`npm run build`)** | Siap | Menjalankan `node scripts/build-static.mjs` tanpa bergantung pada `express` atau library native eksternal; menghasilkan **48 file HTML halaman inti** (`index.html`, `about.html`, `privacy-policy.html`, `terms.html`, `disclaimer.html`, `contact.html` × 8 bahasa), **16 file HTML edukasi** (`guide.html` & `faq.html` × 8 bahasa), **24 hub artikel** (`guides`, `research`, `tools` × 8 bahasa), seluruh artikel `published: true` di `content/articles/manifest.json`, `robots.txt`, `sitemap.xml`, `_redirects`, `_headers`, `assets/`, `ads.txt` (jika `ADSENSE_CLIENT_ID` terisi), 4 UI studio (`dist/admin-articles/`, `dist/adsense-studio/`, `dist/admin-lexicon/`, `dist/admin-data/` berlabel `noindex, nofollow`), serta salinan dokumen di `dist/public/`. |
| **Validasi Sintaks (`npm run lint`)** | Siap | Memverifikasi **26 file JS/MJS** menggunakan `node --check`: `server.js`, `scripts/*`, `assets/*` (`trust-i18n.js`, `article-markdown.js`, `adsense-slots.js`, `article-reader.js`, `adsense-studio-sample.js`), `lib/*` (`domain-tagger.js`, `lexicon-store.js`, `admin-auth.js`, `lexicon/bundle.js`, `article-schema.js`, `github-articles.js`, `worker-article-auth.js`, `d1-admin-domains.js`, `local-d1-adapter.js`), serta `functions/api/*` (`log-available-domain.js`, `articles/{auth,index,save,delete}.js`, `admin-data/{index,update,delete,export}.js`). |
| **Cache Ketersediaan (`localStorage` / `sessionStorage`)** | Siap | Hasil cek RDAP/DNS disimpan di cache memori + `localStorage` dengan fallback `sessionStorage` (`domainAvailabilityCacheV1`), kunci lowercase ternormalisasi, TTL (default 6 jam untuk `available`/`taken`, 5 menit untuk `check`), pruning otomatis, fallback aman `try...catch`, serta tombol re-check per baris yang mem-bypass cache. |
| **Cloudflare Secrets / Env Vars** | Siap | `scripts/site-builder.mjs` membaca override dari `process.env` saat proses build Cloudflare berjalan (`SITE_URL`, `CONTACT_EMAIL`, `GA_MEASUREMENT_ID`, `GSC_VERIFICATION`, `ADSENSE_CLIENT_ID`, `ADSENSE_DIRECT_SELLER_ID`, `ADSENSE_ENABLE_AUTO_ADS`, `BING_VERIFICATION`, `YANDEX_VERIFICATION`, `AHREFS_SITE_VERIFICATION`). Sisi server/Functions membaca `ARTICLE_ADMIN_PASSWORD`, `ADMIN_PASSWORD`, `ARTICLE_SESSION_SECRET`, dan `GITHUB_TOKEN`/`OWNER`/`REPO`/`BRANCH` untuk 4 studio terpadu & D1 `backfill-*`. |
| **Mode AdSense Non-Auto Ads** | Siap | `enableAutoAdsScript` bernilai `false` di `site.config.json` dan dapat dikontrol via `ADSENSE_ENABLE_AUTO_ADS=false`. Penempatan iklan dikelola terstruktur untuk **10 slot lintas 4 grup halaman** (`Artikel` 5 slot, `Front Page` 2 slot, `Guide` 2 slot, `FAQ` 1 slot) via `/adsense-studio/` dan `site.config.json`; slot kosong/simulasi/nonaktif otomatis disembunyikan (`hidden`) di halaman publik. |
| **Security & Cache Headers (`_headers`)** | Siap | Build otomatis menghasilkan `dist/_headers` (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, dan `Cache-Control`). |
| **Redirect Bahasa Inggris (`_redirects`)** | Siap | Build otomatis menghasilkan `dist/_redirects` untuk mengarahkan `/en`, `/en/`, dan `/en/*` ke `/` dengan status `301`. |

### Catatan Penting Arsitektur Static + Cloudflare Secrets
1. **Build-Time vs Runtime & Apa yang Boleh/Tidak Boleh Masuk ke HTML Statis**:
   - Di Cloudflare Pages (static hosting), file HTML dibangun sekali saat `npm run build` berjalan di server build Cloudflare. Nilai Environment Variables / Secrets yang Anda isi di Cloudflare akan dibaca oleh `scripts/build-static.mjs` lalu dicetak ke dalam HTML (`<meta>`, tag GA4, `ads.txt`, `sitemap.xml`).
   - ID seperti **GA4 (`G-...`)**, **GSC Verification**, **Bing/Yandex/Ahrefs token**, dan **AdSense Publisher ID (`ca-pub-...`)** memang bersifat **publik di sisi browser/HTML** (agar Googlebot & browser bisa membacanya), namun menyimpannya di Cloudflare Environment Variables membuat repo GitHub Anda tetap bersih dan mudah dikelola tanpa mengedit kode sumber tiap kali ganti akun/ID.
   - **JANGAN PERNAH** memasukkan *private secret key* (misalnya API Key berbayar, Gemini/OpenAI Key, Database Password, atau OAuth Client Secret) ke variabel build HTML statis. Jika kelak Anda menambah fitur berbasis private key, wajib memakai **Cloudflare Pages Functions (`/functions/*`)** atau **Cloudflare Workers** sisi server—bukan disuntikkan ke HTML statis.
2. **Catatan Perilaku `.html` di Cloudflare Pages (Clean URLs 308)**:
   - Cloudflare Pages secara bawaan menerapkan *Clean URLs* yang me-redirect URL berekstensi `.html` (misalnya `/disclaimer.html` -> `/disclaimer`, `/id/disclaimer.html` -> `/id/disclaimer`) dengan status `308 Permanent Redirect`.
   - Saat ini `canonical`, `hreflang`, dan `sitemap.xml` memakai format `.html` (`/disclaimer.html`, `/id/disclaimer.html`), sedangkan homepage edisi bahasa memakai format direktori (`/`, `/id/`, `/es/`, dst.) yang langsung merespons `200 OK`.
   - Setelah deploy pertama, uji URL `/disclaimer.html` dan `/id/disclaimer.html` dengan `curl -I`. Jika Google Search Console melaporkan status redirect `308` pada halaman trust/legal, Anda memiliki 2 pilihan:
     - Memperbarui rute halaman trust menjadi URL bersih (`/disclaimer` atau `/disclaimer/index.html`) agar cocok 100% tanpa hop `308`, **atau**
     - Menggunakan **Cloudflare Workers Static Assets** dengan pengaturan `assets.html_handling: "none"` jika ingin mempertahankan ekstensi `.html` merespons `200 OK` secara ketat.

---

## 2. Langkah 1 — Menyiapkan & Push ke GitHub Repository

1. **Pastikan tidak ada file rahasia lokal yang ikut ter-track**:
   - Jangan membuat file `.env` berisi data rahasia lalu memaksanya masuk ke Git.
   - Biarkan `site.config.json` dalam kondisi bersih (tanpa token pribadi) jika seluruh nilai ingin dikelola dari Cloudflare.
2. **Buat Repository Baru di GitHub**:
   - Buka [github.com](https://github.com) -> **New repository**.
   - Beri nama misalnya `domainname-web-id` (disarankan **Private** bila Anda ingin menjaga riwayat commit internal, atau **Public** karena kode sumber sudah bebas secret).
   - **Jangan** centang *Add a README file* atau *.gitignore* (karena sudah ada di proyek ini).
3. **Inisialisasi dan Push dari Lokal/Workspace**:
   ```bash
   git init
   git branch -M main
   git status   # Pastikan folder dist/ dan node_modules/ serta .env TIDAK muncul
   git add .
   git commit -m "Initial commit: static SEO build for domainname.web.id"
   git remote add origin https://github.com/<USERNAME_GITHUB>/<NAMA_REPO>.git
   git push -u origin main
   ```

---

## 3. Langkah 2 — Menyiapkan Domain & DNS Cloudflare

1. **Tambahkan Domain ke Cloudflare**:
   - Login ke [dash.cloudflare.com](https://dash.cloudflare.com).
   - Klik **Add a domain** (atau **Onboard a domain**), masukkan **`domainname.web.id`**.
   - Pilih paket **Free** (`$0`).
2. **Ganti Nameserver di Registrar Domain (`.web.id`)**:
   - Cloudflare akan menampilkan 2 Nameserver (contoh: `alice.ns.cloudflare.com` dan `bob.ns.cloudflare.com`).
   - Buka panel registrar domain Indonesia tempat `domainname.web.id` terdaftar.
   - Ubah **Nameserver** dari bawaan registrar menjadi 2 Nameserver Cloudflare tersebut (hapus nameserver lama).
   - Tunggu propagasi DNS (biasanya 10 menit – 2 jam) hingga status di Cloudflare menjadi **Active**.
3. **Konfigurasi SSL/TLS & Keamanan Dasar di Cloudflare Dashboard**:
   - Buka menu **SSL/TLS -> Overview**: pilih mode **`Full (strict)`**.
   - Buka menu **SSL/TLS -> Edge Certificates**:
     - **Always Use HTTPS**: **ON**.
     - **Automatic HTTPS Rewrites**: **ON**.
     - **Minimum TLS Version**: **TLS 1.2**.

---

## 4. Langkah 3 — Deploy ke Cloudflare Pages & Simpan Secrets di Cloudflare

### A. Menghubungkan GitHub Repo ke Cloudflare Pages
1. Di Cloudflare Dashboard, buka **Workers & Pages -> Create -> Pages -> Connect to Git**.
2. Hubungkan akun GitHub Anda dan pilih repository `domainname-web-id`.
3. Isi pengaturan Build:
   - **Project name**: `domainname-web-id`
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### B. Mengisi Secrets & Environment Variables di Cloudflare
Sebelum (atau tepat setelah) klik **Save and Deploy**, masuk ke project Cloudflare Pages Anda -> **Settings -> Environment variables** -> tambahkan variabel di bawah ini untuk **Production** (dan **Preview** bila perlu):

| Nama Variabel | Tipe di Cloudflare | Contoh Nilai / Keterangan |
| --- | --- | --- |
| `NODE_VERSION` | Text (Plaintext) | `22` (memastikan Node.js 22+ untuk ESM, `fs.cpSync`, dan dukungan `node:sqlite` lokal; proyek memakai `npm`) |
| `SITE_URL` | Text (Plaintext) | `https://domainname.web.id` |
| `CONTACT_EMAIL` | Secret / Text | `admin@domainname.web.id` |
| `GA_MEASUREMENT_ID` | **Secret** | `G-XXXXXXXXXX` (ID Google Analytics 4 Anda) |
| `GSC_VERIFICATION` | **Secret** | Token dari tag `<meta name="google-site-verification" content="TOKEN">` |
| `ADSENSE_CLIENT_ID` | **Secret** | `ca-pub-XXXXXXXXXXXXXXXX` (otomatis mengisi meta tag & membuat `dist/ads.txt`) |
| `ADSENSE_DIRECT_SELLER_ID` | Text / Secret | `f08c47fec0942fa0` (ID Google di `ads.txt`, biarkan default jika tidak berubah) |
| `ADSENSE_ENABLE_AUTO_ADS` | Text (Plaintext) | `false` (wajib `false` karena memakai unit iklan terstruktur non-Auto Ads) |
| `BING_VERIFICATION` | **Secret** | Token `msvalidate.01` (opsional) |
| `YANDEX_VERIFICATION` | **Secret** | Token `yandex-verification` (opsional) |
| `AHREFS_SITE_VERIFICATION` | **Secret** | Token `ahrefs-site-verification` (opsional) |
| `ADMIN_PASSWORD` | **Secret** | Password admin untuk otorisasi D1 `action=backfill-*` dan fallback login 4 studio (`/admin-articles/`, `/adsense-studio/`, `/admin-lexicon`, `/admin-data/`) |
| `ARTICLE_ADMIN_PASSWORD` | **Secret** | Password login utama untuk 4 studio terpadu (jika kosong, memakai fallback `ADMIN_PASSWORD`) |
| `ARTICLE_SESSION_SECRET` | **Secret** | Kunci acak HMAC-SHA256 min. 32 karakter untuk menandatangani cookie sesi `dn_article_session` |
| `GITHUB_TOKEN` | **Secret** | Fine-grained GitHub PAT (**Contents: Read & Write**) untuk simpan/hapus artikel dari `/admin-articles/` |
| `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_BRANCH` | Text (Plaintext) | Pemilik repo, nama repo, dan branch target auto-deploy (default: `main`) |

> **Penting**: Setiap kali Anda menambah atau mengubah *Secret / Environment Variable* di Cloudflare Pages, Cloudflare **tidak otomatis** membangun ulang HTML lama. Buka tab **Deployments -> titik tiga pada deployment terbaru -> Retry deployment** agar `npm run build` berjalan ulang dengan nilai secret yang baru.

### C. Menghubungkan Custom Domain ke Cloudflare Pages
1. Buka project Cloudflare Pages -> tab **Custom domains -> Set up a custom domain**.
2. Tambahkan **`domainname.web.id`**. Cloudflare otomatis membuat record DNS `CNAME` (`@` -> `<project>.pages.dev`, status **Proxied / Awan Oranye**) dan menerbitkan sertifikat SSL Edge.
3. Opsional (Direkomendasikan): Tambahkan juga **`www.domainname.web.id`** di Custom Domains, lalu buat aturan redirect di Cloudflare (**Rules -> Redirect Rules**) agar `https://www.domainname.web.id/*` diarahkan permanen (**301**) ke `https://domainname.web.id/${1}` supaya tidak terjadi duplikasi `www` vs non-`www` di Google.

---

## 5. Langkah 4 — Checklist Verifikasi Pasca-Deploy

Setelah status deployment **Success** dan domain aktif, lakukan pengecekan berikut dari terminal atau browser:

1. **Cek URL Utama & Edisi Bahasa**:
   ```bash
   curl -I https://domainname.web.id/
   curl -I https://domainname.web.id/id/
   curl -I https://domainname.web.id/en/
   ```
   Pastikan `/` dan `/id/` mengembalikan `HTTP/2 200`, sedangkan `/en/` mengembalikan redirect `301` ke `/`.

2. **Cek File Wajib SEO & AdSense**:
   - `https://domainname.web.id/robots.txt` -> pastikan `Sitemap: https://domainname.web.id/sitemap.xml`
   - `https://domainname.web.id/sitemap.xml` -> pastikan seluruh `<loc>` memakai `https://domainname.web.id/...`
   - `https://domainname.web.id/ads.txt` -> pastikan muncul baris `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` (muncul setelah `ADSENSE_CLIENT_ID` diisi dan di-redeploy).

3. **Cek Meta Tag & Non-Auto Ads di Source HTML (`Ctrl+U`)**:
   - Pastikan `<meta name="google-site-verification" ...>` dan `<meta name="google-adsense-account" ...>` hadir di HTML statis hasil build.
   - Pastikan tidak ada skrip Auto Ads (`adsbygoogle.js`) sampai Anda memasang unit iklan `<ins class="adsbygoogle">` manual nantinya.

4. **Submit ke Google Search Console & AdSense**:
   - Verifikasi properti domain `domainname.web.id` di Google Search Console (via DNS TXT record Cloudflare atau meta tag `GSC_VERIFICATION`).
   - Submit sitemap `https://domainname.web.id/sitemap.xml` di menu **Sitemaps** GSC.
   - Daftarkan `domainname.web.id` di Google AdSense (pastikan **Auto ads = OFF** pada pengaturan situs di dashboard AdSense).

---

## 6. Mengatasi Masalah GitHub TOS Suspend / Fork Limitation & Alternatif Aman

Jika akun atau repository GitHub Anda terkena *suspend* atau *limitation* oleh sistem moderasi otomatis GitHub:

### Mengapa Kode & Fork Bisa Terkena Limitasi?
1. **Pemicu Filter Anti-Spam Otomatis (Sudah Dibersihkan)**:
   - Sebelumnya `metadata.json` mengandung istilah `"pSEO"` dan `index.html` (di 8 bahasa) berisi contoh domain negatif yang mencantumkan merek dagang nyata (`iphone`, `nike`), pola URL menyerupai clickbait/phishing (`.xyz`/`.top`), serta kata kunci sensitif (`judi/gambling`, `casino`, `adult`, `malware`, `phishing`, `obat kuat`, `PBN`, `link farm`) meski konteksnya hanya edukasi.
   - Seluruh kata kunci berisiko tinggi tersebut **telah dibersihkan** dan diganti dengan contoh domain netral berstandar RFC 2606 (`.example`).
2. **Mengapa Melakukan *Fork* ke Akun Lain Ikut Terkena Limit**:
   - Fitur **Fork** di GitHub mempertahankan relasi grafik (`forked_from`) dan hash objek Git dari repo yang sudah ditandai (*flagged*). Akibatnya, akun kedua yang melakukan *fork* dari repo bermasalah langsung terkena deteksi *ban evasion* / propagasi risiko secara otomatis.

### Solusi Aman Agar Tidak Terkena Suspend Ulang
1. **JANGAN Gunakan Tombol Fork dari Repo Lama**:
   - Unduh kode bersih ini lalu buat repository **baru dari nol** (`git init`) dengan **akun GitHub yang sudah aktif 2FA** (hindari langsung mengunggah *bulk dump* dari akun baru yang belum terverifikasi).
2. **Alternatif 1 — Deploy Langsung ke Cloudflare Pages Tanpa GitHub (Paling Aman dari Filter GitHub)**:
   - Cloudflare Pages mendukung **Direct Upload** lewat Wrangler CLI tanpa perlu menaruh repo di GitHub sama sekali:
     ```bash
     GA_MEASUREMENT_ID=G-XXXX GSC_VERIFICATION=XXXX ADSENSE_CLIENT_ID=ca-pub-XXXX ADSENSE_ENABLE_AUTO_ADS=false npm run build
     npx wrangler pages deploy dist --project-name=domainname-web-id
     ```
   - Anda tetap menggunakan DNS Cloudflare, domain `domainname.web.id`, dan build statis HTML yang sama persis.
3. **Alternatif 2 — Gunakan GitLab + Cloudflare Pages**:
   - Cloudflare Pages mendukung integrasi Git resmi dengan **GitLab** (`Connect to Git -> GitLab`) selain GitHub.
4. **Banding Akun GitHub yang Sudah Terlanjur Kena Limit**:
   - Ajukan permohonan peninjauan resmi di [support.github.com/contact/reinstatement](https://support.github.com/contact/reinstatement) dan jelaskan bahwa repositori adalah utilitas riset penamaan domain & validasi DNS RFC 1035 (*false positive*), serta tidak melakukan aktivitas spam/scraping otomatis.

---

## 7. Dokumentasi Teknis Fitur Terbaru (`index.html` & `dist/`)

Bagian ini merangkum arsitektur antarmuka, optimasi mobile, serta mekanisme cache lokal yang aktif pada aplikasi:

### A. Cache Ketersediaan Domain (`localStorage` + Fallback `sessionStorage`)
- **Kunci Penyimpanan**: `domainAvailabilityCacheV1` berisi objek JSON `{ version: 1, entries: { "<domain_lowercase>": { status, rawStatus, method, checkedAt, ttlMs } } }`. Data dibaca/ditulis ke `localStorage` dengan fallback otomatis ke `sessionStorage` dan memori JS.
- **Normalisasi & Status**: Kunci domain selalu dinormalisasi ke huruf kecil (`normalizeDomainCacheKey`). Nilai `status` distandarkan menjadi `available | taken | check` (dengan `rawStatus` menyimpan detail `available | taken | no-ns | error` dan `method` menyimpan `RDAP | NS | DNS`).
- **TTL & Konfigurasi**:
  - Rentang TTL aman dikunci antara **1 menit** (`60.000 ms`) hingga **24 jam** (`86.400.000 ms`).
  - Default TTL adalah **6 jam** untuk status `available` dan `taken`, serta **5 menit** untuk status `check` (`no-ns` / `error`).
  - Dapat dikonfigurasi ulang via `window.__AVAILABILITY_CACHE_TTL_MS__` atau item `localStorage` `domainAvailabilityCacheTtlMs`.
- **Cache-First Lookup, Hidrasi & Keamanan Kuota**:
  - Saat `DOMContentLoaded`, `hydrateAvailabilityCacheFromStorage()` memuat entri yang masih valid ke `Map` memori sebelum generasi awal dan pengecekan otomatis berjalan, sehingga reload halaman, ganti filter status (`Available & Check`, `All`, `Available`, `Taken`, `Check`), filter teks, maupun klik `Start Over` tidak memicu query ulang jaringan untuk domain yang masih valid di cache.
  - Seluruh baca/tulis storage dibungkus `try...catch` dengan fallback bertingkat (`localStorage` → `sessionStorage` → memori) jika storage diblokir atau melebihi kuota (`QuotaExceededError`), disertai *periodic pruning* tiap **5 menit** dan batas maksimal **1.000 entri**.
- **Force Re-Check (Bypass Cache)**:
  - Tombol cek manual per baris (`Check`) dan tombol **Re-check** (`↻`, `data-recheck-domain`) memanggil `checkSingleDomainAvailability(..., forceRecheck = true)` sehingga melewati (*bypass*) cache lama untuk domain tersebut, mengambil status terbaru dari RDAP/DNS, lalu memperbarui entri cache.

### B. Sistem Warna, Layout Responsif & Token Desain
1. **Form Generator (`#generatorSection`)**:
   - **Header Ringkas Tanpa Judul Terpisah**: Baris header kartu terpisah `"Nama Bisnis Anda"` (`#uiSectionGenTitle`) dihilangkan agar area form dan daftar hasil domain tampil lebih tinggi di layar; `#generatorSection` langsung dibuka dengan bilah `#quickExamplesBar` di atas kotak merah `#primaryKeywordBox`.
   - **Quick Examples Bar & Reset Input (`#quickExamplesBar`)**: Ditempatkan di bagian atas area utama form (tepat di atas `#primaryKeywordBox` dan sebelum `#advancedOptionsDetails`), berisi label, tombol rotasi ringkas (`#uiQuickExRotateBtn`), serta 4 tombol contoh kata kunci cepat (`#uiQuickExBtn1`–`#uiQuickExBtn4`) dari katalog **20 contoh per bahasa** (8 bahasa = 5 batch per bahasa) di sisi kiri, serta tombol **Reset Form / Reset Input (`#uiResetFormBtn`)** sejajar di sisi kanan pada baris yang sama (dengan `flex-wrap` otomatis untuk layar mobile sempit). Mendukung rotasi otomatis saat reload, rotasi manual tanpa mengubah `#keywordInput`/`?kw=`, reset ke batch pertama (`0..3`) saat bahasa diganti, serta pemecahan otomatis frasa multi-kata saat diklik (kata pertama → `#keywordInput`, sisa kata → `#keyword2Input`, mengosongkan `#keyword3Input`, dan menjaga mode **Tanpa Dash** tetap bersih tanpa menyisipkan `-`).
   - **Primary Keyword & Extensions (`#primaryKeywordBox`)**: Memakai latar merah matang yang lebih kalem (`#B02E24`, serta `#8E241C` pada mode gelap) dengan border halus dan padding lega; panel quick-pick ekstensi (`#extQuickPickWrap`) diberi bingkai padding tersendiri (`bg-black/15`) dengan perbedaan tegas chip belum dipilih (`+`, border tipis semi-transparan) vs sudah dipilih (`✓`, latar terang solid `#FFFFFF` teks `#131354`). Tombol CTA utama **Generate Domain Names** (`#uiGenBtn`, `#131354`, border putih tegas, hover kontras `#FFFFFF` / `#131354`) disejajarkan simetris tepat di tengah di bawah kedua kolom input dengan pemisah vertikal yang lega.
   - **Mobile Toggle `Add / Customize`**: Latar biru `#2165b3` dengan teks putih.
   - **Secondary & Tertiary Keyword**: Latar `#578686` dengan label putih dan input berlatar `#FFFFFF`.
   - **Shuffle Keywords (Word Count & Separator)**: Latar `#669999` dengan teks putih (`Shuffle Keywords` untuk label bahasa Inggris dari *Acak Urutan Kata Kunci*).
   - **Add Your Own Patterns**: Latar terang lembut (`#F7FAFC`–`#ECF2F2`) teks gelap, tombol sisip placeholder berkode warna berbeda (`+ [primary]`, `+ [secondary]`, `+ [tertiary]`, `+ [dash]`, `+ [number]`, `+ [vowel]`, `+ [consonant]`), serta tombol **Generate Domain Names** oranye tua (`#c83e0c`, rata tengah, lebar sesuai isi tombol, border putih, hover kontras `#FFFFFF` / `#c83e0c`).
   - Kedua tombol **Generate Domain Names** bekerja secara *mutually exclusive* (`activeGenerateSlot: 'basic' | 'pattern'`).
   - **Tombol Hapus Cepat (`×`) Merah pada Seluruh Input Form & Filter**: Keenam kolom input (`#keywordInput`, `#extInput`, `#keyword2Input`, `#keyword3Input`, `#formulaInput`, serta `#analysisFilterInput`) dibungkus kontainer `relative` dengan padding kanan lega (`pr-10` / `pr-8`) dan tombol `<button type="button">` ikon `×` merah di sisi kanan dalam yang sejajar vertikal (`top-1/2 -translate-y-1/2`). Tombol hanya tampil saat input terisi (`syncInputClearButton` / `syncAllInputClearButtons`), dilengkapi `aria-label` & `title` 8 bahasa (`CLEAR_INPUT_LABELS_I18N`), serta saat diklik (`clearInputFieldById`) mengosongkan nilai, mengembalikan fokus ke input terkait, dan memicu event `input` serta `change` agar chip ekstensi, hasil domain, filter tabel, maupun state SEO/URL ikut terbarui instan.
   - **Pemisahan Tombol Reset (`Reset Form` vs `Start Over`)**:
     - **Form Reset (`#uiResetFormBtn` → `resetFormInputs`)**: Berada di sisi kanan baris `#quickExamplesBar` sejajar dengan tombol rotasi dan pilihan contoh cepat (`Reset Form` / `Reset Input`, ikon penghapus) untuk mengosongkan input kata kunci (`#keywordInput`, `#keyword2Input`, `#keyword3Input`), mengembalikan ekstensi ke default bahasa aktif, dan mereset field formulir tanpa menggulir halaman ke atas atau menghapus cache ketersediaan.
     - **Global Reset `Start Over` / `Mulai Ulang` (`resetToHome`)**: Tersedia di header atas (`#uiHeaderResetBtn`), bagian bawah panel opsi lanjutan (`#uiResetAdvBtn`), toolbar tabel analisis (`#uiResetAnalysisBtn`), layar tabel kosong/tanpa hasil filter, dan Langkah 5 pada panduan pengetahuan. Mengembalikan seluruh input ke kata kunci default (`business`), ekstensi default, checkbox permutasi, formula kustom, filter tabel, seleksi baris, scroll tabel, serta parameter URL ke kondisi awal bersih, lalu menggulir layar kembali ke atas halaman dengan dukungan `prefers-reduced-motion`.
2. **Bagian Permutasi & Tabel Analisis (`#domainAnalysisPanel`)**:
   - Blok `#resultsSection` (*Generated Domain Permutations*) disembunyikan secara aman (`hidden`) tanpa menghapus state maupun logika copy/export/bulk-check.
   - Header dan toolbar hasil (`#domainBatchActionBar`) disatukan ke dalam bar ringkas dua tingkat yang menempel langsung (*flush*) dengan bagian atas tabel hasil, tanpa subjudul panjang `#uiAnalysisSub` maupun hitungan `GENERATED ... · SHOWING ...` (`#domainAnalysisMeta`), serta mendukung mode terang & gelap (*light/dark mode*).
   - Baris atas menampilkan judul `Domain Results`, indikator seleksi dinamis (`#domainSelectionBadgeWrap` yang hanya muncul saat ≥ 1 baris dipilih beserta tombol `Clear`), toggle `Available only` (`#uiAvailOnlyBtn`), filter teks cepat (`#analysisFilterInput`, dilengkapi tombol `×` merah adaptif mode terang/gelap `#clearAnalysisFilterInputBtn`), tombol `Copy` (`#uiBatchCopyBtn`), dan tombol toggle `More Tools / Bulk` (`#uiMoreToolsToggleBtn`).
   - Baris kedua (`#domainSecondaryToolbarRow`) menggabungkan deretan tombol shortcut ekstensi aktif (`#domainExtShortcutBar`: `FILTER EXT:` + `All` + ekstensi aktif) di kiri dengan panel kontrol lanjutan (`#domainAdvancedToolsPanel`) di sisi kanan pada **satu baris horizontal yang sama** (dengan `flex-wrap` otomatis bila lebar layar sempit, sehingga membuka `More Tools / Bulk` tidak menambah tinggi vertikal pada layar desktop).
   - Kontrol lanjutan (*power-user*: `Start Over`, `#analysisStatusFilter`, `Remove Selected`, `Copy MD`, `Export .txt`, dan `Bulk Check`) dirender langsung di dalam HTML DOM statis sejak awal pada `#domainAdvancedToolsPanel` (default tersembunyi dengan class `hidden` agar tetap terbaca oleh perayap/Googlebot tanpa bergantung pada injeksi JS).
   - Tabel domain memakai header oranye `#EA580C` (hover `#C2410C` saat kolom disortir) dengan baris selang-seling adaptif terang/gelap (`#FFFFFF`/`#F8FAFC` dan `dark:bg-slate-900`/`dark:bg-slate-800/40`), menampilkan kolom berurutan `AVAILABILITY` · `[checkbox]` · `DOMAIN NAME` · `SCORE` · `CHARS` · `EXT` (sortable, berisi ekstensi TLD/ccTLD seperti `.com`, `.net`, `.co`, `.id`, `.my.id`, `.co.jp`, dll.) · `INSPECT` (`BL`, `WM`, `GG`) · `#`.
3. **Share & Export Link (`#shareExportSection`)**:
   - Responsif penuh: bertumpuk full-width (`grid-cols-1`) di smartphone, sejajar di tablet/desktop (`sm:flex` / `sm:grid-cols-3` / `md:flex`), dengan tombol berwarna-warni selaras palet halaman (`#0C723F`, `#131354`, `#578686`, `#2165b3`, `#f05422`, `#B87900`, `#de3723`).
4. **Konten Edukasi, FAQ, & Context Cards (`#editorial-design-tokens`)**:
   - Menggunakan token warna CSS *framework-agnostic* (`--surface-base: #FFFFFF`, `--surface-teal-soft: #ECF2F2`, `--surface-neutral: #EDEDED`, `--surface-teal-accent: #578686`, `--text-primary: #292929`, `--text-secondary: #3F3042`, `--text-on-teal: #FDFEFE`, `--accent-positive: #0C723F`) secara konsisten pada 6 bagian panduan/referensi (termasuk Langkah 5 panduan tombol `Start Over`), **Frequently Asked Questions**, serta kartu **AI Search Engine & Domain Indexing Context** dan **Domain Name Formula Summary**.
5. **Navigasi Mobile Hamburger & Drawer Terstruktur (Beranda & Halaman Editorial)**:
   - **Beranda (`index.html` & `localizeIndexHtml` di `scripts/site-builder.mjs`)**: Drawer `#mobileNavDrawer` beserta `#mobileNavBackdrop` disusun ulang menjadi 3 kelompok yang intuitif dengan target sentuh minimal `44px`:
     - **Grup 1 (`Workspace` / `uiMobileWorkspaceLabel`)**: Grid `2×2` berisi pintasan cepat *Generator*, *Results*, *Guide* (`#uiMobileNavGuideLink`), dan *FAQ* (`#uiMobileNavFaqLink`).
     - **Grup 2 (`Articles & Tools` / `uiMobileExploreLabel`)**: Tiga kartu tautan bernilai (`min-h-[56px]`) untuk `/guides/` (**Articles**), `/research/` (**Research**), dan `/tools/` (**Tools**) lengkap dengan ikon pembeda, deskripsi singkat 1 baris terlokalisasi 8 bahasa (`hubGuidesDesc`, `hubResearchDesc`, `hubToolsDesc` di `uiExtraDict` dan `MOBILE_NAV_CHROME_BY_LANG`), serta ikon panah untuk menarik minat pengunjung.
     - **Grup 3 (`Information` / `uiMobileInfoLabel` & Mobile Reset)**: Tautan *About*, *Privacy*, *Terms*, *Disclaimer*, *Contact*, serta tombol `Start Over` khusus mobile. Mendukung toggle ikon `#menuIconOpen`/`#menuIconClose`, tutup via klik backdrop, dan tombol `Escape` (mengembalikan fokus ke `#mobileMenuBtn`).
   - **Halaman Hub (`/guides/`, `/research/`, `/tools/`), Artikel, `/guide.html`, & `/faq.html`**: Template `templates/article-hub.html`, `templates/article.html`, `templates/guide.html`, dan `templates/faq.html` kini seluruhnya dilengkapi tombol hamburger mobile (`#mobileMenuBtn`, `md:hidden`, `min-h-[44px] min-w-[44px]`), `#mobilePageBackdrop`, `#mobilePageDrawer`, fungsi `togglePageMobileMenu()` / `closePageMobileMenu(restoreFocus)`, serta penutup `Escape`. Isi drawer dirender secara SSR/lokal oleh `buildEditorialMobileNav` di `scripts/site-builder.mjs` dengan 3 grup serupa (*Workspace* untuk Generator/Guide/FAQ, kartu *Articles / Research / Tools* dengan deskripsi 8 bahasa dan penanda aktif `aria-current="page"`, serta grup *Information*).

### C. Logging Otomatis Domain Tersedia (≤ 25 Karakter) ke Cloudflare D1
- **Cloudflare Pages Function**: `functions/api/log-available-domain.js` melayani endpoint `POST /api/log-available-domain` menggunakan binding D1 `env.DB`.
- **Auto-Bootstrap Ringan, Auto-Migrasi Schema & Manual Backfill Terukur (SLD + Skor + Auto-Tagging 8 Bahasa)**: Pada request pertama, `ensureAvailableDomainsSchema` hanya menjalankan bootstrap DDL ringan tanpa memicu pemindaian backfill penuh di cold start: menjalankan `CREATE TABLE IF NOT EXISTS available_domains`, mengecek `PRAGMA table_info(available_domains)` untuk menambah kolom `sld TEXT`, `tags TEXT`, `lang TEXT NOT NULL DEFAULT 'en'`, `emd_pmd_match_type TEXT`, serta 9 kolom integer skor bila belum ada (dan menghapus kolom lama `checked_at_iso` bila masih ada), lalu membuat 6 indeks standar serta 3 *partial index* via `db.batch` (`idx_available_domains_missing_sld`, `idx_available_domains_missing_tags`, dan `idx_available_domains_brandable_tags`). Saat domain baru disimpan via `POST`, kolom `tags` (`?19`) diisi otomatis secara idempoten (`COALESCE(NULLIF(trim(available_domains.tags), ''), excluded.tags)`) tanpa menimpa tag yang sudah ada. Untuk mengisi data lama secara terukur dalam batch 50 baris per `db.batch`, tersedia helper manual `POST /api/log-available-domain` dengan `{ "action": "backfill-sld" }`, `{ "action": "backfill-scores", "limit": 200 }`, dan `{ "action": "backfill-tags", "mode": "null-only" | "retag-brandable" | "repair-invalid" | "force", "limit": 200, "offset": 0, "dryRun": true, "skipCount": false }` (di mana `repair-invalid` memperbaiki baris `tags` non-JSON / bukan JSON array / array kosong, dan `retag-brandable` memanfaatkan partial index `idx_available_domains_brandable_tags` dengan kursor `nextOffset` serta melewatkan baris yang tidak berubah). **Otorisasi Admin**: Ketiga aksi `backfill-*` di produksi mewajibkan secret `ADMIN_PASSWORD` terpasang di Cloudflare dan dikirim lewat header `Authorization: Bearer <ADMIN_PASSWORD>` atau `X-Admin-Password` (pencatatan domain normal dari pengunjung tetap berjalan tanpa password). File migrasi SQL terpisah tersedia di `migrations/0001_add_domain_scores.sql`, `migrations/0002_add_pronunciation_comfort_score.sql`, `migrations/0003_add_emd_pmd_score.sql`, `migrations/0004_add_sld_and_tags.sql`, dan `migrations/0005_add_tag_partial_indexes.sql`.
- **Formula Penilaian Otomatis (7 Aspek, Total Bobot = `1.00`) & Validasi Server-Side**: Hanya menerima payload `status === 'available'` dengan panjang `domain.length <= 25`, memisahkan SLD secara akurat untuk ekstensi multi-bagian (`.web.id`, `.my.id`, `.co.id`, `.co.uk`, dll.), serta menghitung skor `0–100` yang identik antara klien dan Worker:
  - `pronunciation_comfort_score` (**`0.22`**) — kelancaran pelafalan (*radio test*), penalti gugus/hiatus, akhiran janggal (`/[jq]$/` `-20`, `[^aeiou][vwzx]$` `-10` non-kamus, `-ik/-uk/-ok` `-6` non-Indonesia, serta `-iy/-iw/-uc/-uf`), dan tabrakan 2 konsonan berat (`bk`, `tp`, `qj`, `xz`, dll. `-20`) pada kata rekaan.
  - `brandability_score` (**`0.20`**) — daya ingat, panjang SLD ideal, dan kekhasan merek (bonus merek ciptaan dibatasi bila pelafalan lemah).
  - `structure_length_score` (**`0.13`**) — keringkasan panjang SLD & struktur token.
  - `extension_lang_fit_score` (**`0.12`**) — peringkat popularitas TLD sesuai bahasa UI aktif (mis. untuk `en`: `.com > .edu > .gov > .net > .org > .co > .online > .io > .ai > .app/.dev > .biz > .me`; untuk `id`: `.id > .com > .ac.id > .co.id > .net.id > .or.id > .web.id > .my.id > .biz.id`).
  - `character_cleanliness_score` (**`0.10`**) — kebersihan dari angka, tanda hubung (`-`), dan pengulangan huruf `3x+`.
  - `niche_clarity_score` (**`0.11`**) — kejelasan topik/kamus kata (permutasi acak tanpa akar kata bermakna ditahan di skor rendah/moderat `38–58`).
  - `emd_pmd_score` (**`0.12`**) — evaluasi risiko *over-optimization* EMD/PMD terhadap kata kunci target (`kw`, `kw2`, `kw3`): netral `75` bila tanpa keyword, tinggi `85–95` untuk PMD alami & ringkas yang mudah dilafalkan, serta penalti tegas `15–45` untuk keyword stuffing, tanda hubung/angka dipaksakan, atau domain terlalu panjang mengejar keyword.
  - **Penjaga Skor Gabungan**: Penalti sinergis diterapkan bila `pronunciation_comfort_score < 72 && niche_clarity_score < 60`, serta penalti tambahan `(50 - emd_pmd_score) * 0.45` bila `emd_pmd_score < 50`.
- **Kode Hemat Byte 2 Huruf (`emd_pmd_match_type`)**:
  - `nk` = `neutral_no_kw` (tanpa kata kunci target)
  - `np` = `natural_pmd` (PMD alami & ringkas)
  - `up` = `unnatural_pmd` (PMD kaku / sulit dilafalkan)
  - `be` = `balanced_emd` (EMD ringkas & bersih)
  - `nc` = `non_match_clean` (non-match bersih)
  - `nn` = `non_match_noisy` (non-match berisik / panjang)
  - `os` = `over_optimized_stuffing` (pengulangan / tumpukan keyword)
  - `of` = `over_optimized_forced` (tanda hubung / angka dipaksakan)
  - `ol` = `over_optimized_long` (terlalu panjang mengejar keyword)
  - Endpoint `onRequestPost` otomatis menormalisasi string lama (mis. `"natural_pmd"` → `"np"`) via `normalizeEmdPmdMatchType` sebelum upsert ke D1.

#### Skema Tabel & Perintah SQL Cloudflare D1 (`available_domains`)
```sql
-- 1. Skema penuh tabel available_domains (19 kolom)
CREATE TABLE IF NOT EXISTS available_domains (
  domain TEXT PRIMARY KEY,
  sld TEXT,
  extension TEXT NOT NULL,
  char_length INTEGER NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  check_method TEXT NOT NULL,
  check_source TEXT NOT NULL,
  checked_at INTEGER NOT NULL,
  pronunciation_comfort_score INTEGER,
  brandability_score INTEGER,
  structure_length_score INTEGER,
  extension_lang_fit_score INTEGER,
  character_cleanliness_score INTEGER,
  niche_clarity_score INTEGER,
  emd_pmd_score INTEGER,
  emd_pmd_match_type TEXT,
  overall_heuristic_score INTEGER,
  scored_at INTEGER,
  tags TEXT
);

-- 2. Migrasi bertahap jika tabel lama belum memiliki kolom skor / sld / tags (migrations/0001–0005)
ALTER TABLE available_domains ADD COLUMN sld TEXT;
ALTER TABLE available_domains ADD COLUMN pronunciation_comfort_score INTEGER;
ALTER TABLE available_domains ADD COLUMN brandability_score INTEGER;
ALTER TABLE available_domains ADD COLUMN structure_length_score INTEGER;
ALTER TABLE available_domains ADD COLUMN extension_lang_fit_score INTEGER;
ALTER TABLE available_domains ADD COLUMN character_cleanliness_score INTEGER;
ALTER TABLE available_domains ADD COLUMN niche_clarity_score INTEGER;
ALTER TABLE available_domains ADD COLUMN emd_pmd_score INTEGER;
ALTER TABLE available_domains ADD COLUMN emd_pmd_match_type TEXT;
ALTER TABLE available_domains ADD COLUMN overall_heuristic_score INTEGER;
ALTER TABLE available_domains ADD COLUMN scored_at INTEGER;
ALTER TABLE available_domains ADD COLUMN tags TEXT;

CREATE INDEX IF NOT EXISTS idx_available_domains_checked_at
ON available_domains (checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_available_domains_sld
ON available_domains (sld, extension, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_available_domains_extension
ON available_domains (extension, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_available_domains_char_length
ON available_domains (char_length, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_available_domains_lang
ON available_domains (lang, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_available_domains_emd_pmd
ON available_domains (emd_pmd_score, emd_pmd_match_type, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_available_domains_missing_sld
ON available_domains (checked_at DESC)
WHERE sld IS NULL OR trim(sld) = '';

CREATE INDEX IF NOT EXISTS idx_available_domains_missing_tags
ON available_domains (checked_at DESC)
WHERE tags IS NULL OR trim(tags) = '';

CREATE INDEX IF NOT EXISTS idx_available_domains_brandable_tags
ON available_domains (checked_at DESC)
WHERE tags LIKE '%"brandable"%';

-- Backfill aman sld untuk baris lama yang masih NULL (termasuk .my.id, .web.id)
UPDATE available_domains
SET sld = substr(domain, 1, length(domain) - length(extension))
WHERE (sld IS NULL OR trim(sld) = '')
  AND extension LIKE '.%'
  AND length(domain) > length(extension)
  AND lower(substr(domain, length(domain) - length(extension) + 1)) = lower(extension);

-- 3. Opsional: padatkan baris lama yang masih memakai label panjang menjadi kode 2 huruf
UPDATE available_domains
SET emd_pmd_match_type = CASE emd_pmd_match_type
  WHEN 'neutral_no_kw' THEN 'nk'
  WHEN 'natural_pmd' THEN 'np'
  WHEN 'unnatural_pmd' THEN 'up'
  WHEN 'balanced_emd' THEN 'be'
  WHEN 'non_match_clean' THEN 'nc'
  WHEN 'non_match_noisy' THEN 'nn'
  WHEN 'over_optimized_stuffing' THEN 'os'
  WHEN 'over_optimized_forced' THEN 'of'
  WHEN 'over_optimized_long' THEN 'ol'
  ELSE emd_pmd_match_type
END
WHERE length(emd_pmd_match_type) > 2;
```

- **Konfigurasi `wrangler.toml`**: Menyediakan binding `[[d1_databases]]` dengan `binding = "DB"` dan `pages_build_output_dir = "dist"` (serta `database_id` D1 Anda). Pastikan binding `DB` juga terhubung di **Cloudflare Pages -> Settings -> Functions -> D1 database bindings** bila deploy lewat GitHub.
- **Trigger & Tampilan Skor Sisi Klien**: Setiap pengecekan jaringan (`auto` maupun klik manual tombol `Check` / re-check) yang menghasilkan `available` otomatis menampilkan kolom `Score` (`XX/100` beserta rincian 7 sub-skor termasuk `Pronunciation` dan `EMD / PMD` di tooltip dalam 8 bahasa) khusus baris `available` pada tabel analisis, dan untuk domain `<= 25` karakter mengirim `POST` non-blocking (`keepalive: true`) beserta `keywords` (`kw`, `kw2`, `kw3`) dan `scores` ke `/api/log-available-domain`. Error jaringan diabaikan diam-diam agar UI tetap responsif.

### D. Verifikasi Sebelum Commit / Deploy
Jalankan kedua perintah berikut untuk memastikan sintaks JS dan build statis bersih:
```bash
npm run lint
npm run build
```

### E. Penjelasan Rumus & Perhitungan Skor Akhir (`overall_heuristic_score`)

Skor akhir disimpan di kolom `overall_heuristic_score` (skala integer `0–100`) dan dihitung secara deterministik dari **7 kolom sub-skor** melalui fungsi `computeOverallHeuristicScore` di `functions/api/log-available-domain.js` (dan identik di sisi klien pada `index.html`).

#### 1. Pengelompokan 19 Kolom pada Tabel `available_domains`
- **Identitas & Metadata Pengecekan** *(tidak ikut bobot skor, kecuali `domain`, `sld`, `extension`, `lang` sebagai input evaluator)*:
  - `domain`, `sld`, `extension`, `char_length`, `lang`
  - `check_method` (`NS` / `RDAP`), `check_source` (`auto` / `manual`), `checked_at` (epoch ms), `scored_at` (epoch ms)
- **7 Kolom Sub-Skor** *(input langsung ke `overall_heuristic_score`, masing-masing bernilai `0–100`, total bobot = `1.00`)*:
  - `pronunciation_comfort_score` (`P`) — bobot **`0.22`**
  - `brandability_score` (`B`) — bobot **`0.20`**
  - `structure_length_score` (`S`) — bobot **`0.13`**
  - `extension_lang_fit_score` (`E`) — bobot **`0.12`**
  - `character_cleanliness_score` (`C`) — bobot **`0.10`**
  - `niche_clarity_score` (`N`) — bobot **`0.11`**
  - `emd_pmd_score` (`M`) — bobot **`0.12`**
- **Kolom Kategori Pendukung & Output Akhir**:
  - `emd_pmd_match_type` — label hemat 2 huruf (`nk`, `np`, `up`, `be`, `nc`, `nn`, `os`, `of`, `ol`) sebagai penjelas kategori `emd_pmd_score` (tidak masuk rumus bobot).
  - `overall_heuristic_score` — skor akhir hasil penjumlahan terbobot dikurangi penalti penjaga (*safeguard*).
  - `tags` — array JSON berisi hingga 6 tag topik/niche hasil auto-tagging 8 bahasa (`lib/domain-tagger.js`, tidak masuk rumus bobot).

#### 2. Rumus Exact `overall_heuristic_score`

1. **Langkah A — Rata-rata Terbobot (`total bobot = 1.00`)**:
   ```text
   rawOverall =
     (P * 0.22) +   // pronunciation_comfort_score
     (B * 0.20) +   // brandability_score
     (S * 0.13) +   // structure_length_score
     (E * 0.12) +   // extension_lang_fit_score
     (C * 0.10) +   // character_cleanliness_score
     (N * 0.11) +   // niche_clarity_score
     (M * 0.12)     // emd_pmd_score
   ```

2. **Langkah B — Dua Penalti Sinergis Tambahan (*Safeguard*)**:
   - **Penalti nama canggung & tanpa makna jelas**:
     Jika `pronunciation_comfort_score < 72` **dan** `niche_clarity_score < 60`:
     ```text
     rawOverall -= (72 - P) * 0.45 + (60 - N) * 0.35
     ```
     *(Mencegah domain bersih tanpa tanda hubung/angka atau berekstensi `.com` mendapat skor akhir tinggi jika sulit diucapkan dan tidak bermakna.)*
   - **Penalti risiko *over-optimization* EMD/PMD**:
     Jika `emd_pmd_score < 50`:
     ```text
     rawOverall -= (50 - M) * 0.45
     ```
     *(Menekan skor akhir domain yang mengalami keyword stuffing, dipaksakan dengan `-`/angka, atau terlalu panjang mengejar keyword.)*

3. **Langkah C — Pembulatan & Batas Rentang (`clampScore`)**:
   ```text
   overall_heuristic_score = Math.max(0, Math.min(100, Math.round(rawOverall)))
   ```

> **Catatan Server-Side**: Pada endpoint `POST /api/log-available-domain`, Worker selalu menghitung ulang `overall_heuristic_score` melalui `computeOverallHeuristicScore(...)` dari 7 skor yang sudah di-*clamp* (`0–100`) sebelum menyimpannya ke D1, sehingga skor akhir tidak bisa dimanipulasi sepihak dari payload.

#### 3. Ringkasan Perhitungan Tiap Sub-Skor
- **`pronunciation_comfort_score`**: Dipisahkan dulu nama inti (SLD) dari `extension` (termasuk TLD multi-bagian seperti `.web.id`, `.co.id`, `.co.uk`). Menilai rasio vokal, deret konsonan/vokal, hiatus/diftong canggung (`oi`, `eu`, `ouj`, `iy/uy/yy`), akhiran terputus (`/[jq]$/` `-20`, `[^aeiou][vwzx]$` non-kamus `-10`, `[iu]w$` `-44`, `-[iuo]k$` non-Indonesia `-6`, dll.), huruf berat (`q/x/z`, `k` non-Indonesia), serta tabrakan 2 konsonan berat (`bk`, `tp`, `qj`, `xz`, dll. `-20`). Bonus transisi mulus (`+10`/`+5`) hanya diberikan bila tidak ada penalti fonetik maupun tabrakan konsonan.
- **`brandability_score`**: Menilai panjang huruf SLD ideal (puncak 4–7 huruf), variasi huruf unik, daya ingat merek ciptaan/kamus, serta potongan bertahap bila `pronunciation_comfort_score < 76` (*radio test*).
- **`structure_length_score`**: Fokus pada keringkasan panjang SLD (puncak 2–4 huruf, lalu 5–7 huruf) dengan penyesuaian moderat untuk penggunaan tanda hubung atau angka.
- **`extension_lang_fit_score`**: Peringkat popularitas `extension` berdasarkan bahasa UI `lang` (mis. untuk `en`: `.com > .edu > .gov > .net > .org > .co > .online > .io > .ai > .app/.dev > .biz > .me > lainnya`; untuk `id`: `.id > .com > .ac.id > .co.id > .net.id > .or.id > .web.id > .my.id > .biz.id > lainnya`).
- **`character_cleanliness_score`**: Mulai dari `100`, dipotong proporsional bila ada angka, tanda hubung (`-`), atau pengulangan karakter identik `3x+` berurutan.
- **`niche_clarity_score`**: Mengutamakan kecocokan utuh terhadap kamus akar kata multi-bahasa (`90–94`), lalu kecocokan batas sub-kata minimal 4 huruf (`73–78`), dan menahan kata rekaan non-kamus pada skor rendah/moderat (`38–58`).
- **`emd_pmd_score` (dan `emd_pmd_match_type`)**:
  - Tanpa keyword acuan → netral `75` (`nk`).
  - PMD ringkas, alami, dan pelafalan baik (`pronunciation_comfort_score >= 72`) → `85–95` (`np`).
  - PMD dengan pelafalan canggung (`pronunciation_comfort_score < 72`) → `38–54` (`up`).
  - EMD ringkas & bersih → `74–80` (`be`).
  - Non-match → `70` (`nc`) atau `58` (`nn`).
  - *Keyword stuffing*, dipaksakan dengan `-`/angka, atau terlalu panjang mengejar keyword → penalti `15–45` (`os`, `of`, `ol`).

#### 4. Contoh Hitungan Nyata
1. **`cloudly.com`** (`lang = 'en'`, target keyword `["cloud"]`):
   - **Sub-skor**: `pron = 88`, `brand = 100`, `structure = 94`, `ext = 98`, `cleanliness = 100`, `niche = 73`, `emd = 94` (`np`)
   - **Terbobot**: `88(0.22) + 100(0.20) + 94(0.13) + 98(0.12) + 100(0.10) + 73(0.11) + 94(0.12) = 19.36 + 20.00 + 12.22 + 11.76 + 10.00 + 8.03 + 11.28 = 92.65`
   - **Penalti tambahan**: tidak ada (`pron >= 72`, `emd >= 50`)
   - **`overall_heuristic_score`** = `round(92.65)` = **`93`**

2. **`simoj.io`** (`lang = 'en'`, tanpa target keyword):
   - **Sub-skor**: `pron = 62`, `brand = 76`, `structure = 94`, `ext = 76`, `cleanliness = 100`, `niche = 38`, `emd = 75` (`nk`)
   - **Terbobot**: `62(0.22) + 76(0.20) + 94(0.13) + 76(0.12) + 100(0.10) + 38(0.11) + 75(0.12) = 13.64 + 15.20 + 12.22 + 9.12 + 10.00 + 4.18 + 9.00 = 73.36`
   - **Penalti sinergis** (`pron < 72 && niche < 60`): `(72 - 62) * 0.45 + (60 - 38) * 0.35 = 4.50 + 7.70 = 12.20`
   - **`overall_heuristic_score`** = `round(73.36 - 12.20)` = `round(61.16)` = **`61`**

---

### F. Kamus Tagging per Bahasa (`lib/lexicon/*.json`), Admin UI Lokal (`/admin-lexicon`), & Panduan Menambah Entri (How-To)

Kamus untuk segmentasi dan auto-tagging domain D1 (`lib/domain-tagger.js`) dipisah per bahasa agar rapi dirawat di GitHub, mudah di-edit lewat antarmuka admin lokal berpassword, dan tetap kompatibel 100% dengan Cloudflare Pages Functions.

#### 1. Struktur File Kamus & Keamanan Repo GitHub
| File / Direktori | Fungsi | Masuk GitHub? | Masuk `dist/` Publik? |
| --- | --- | --- | --- |
| `lib/lexicon/en.json`, `id.json`, `es.json`, `pt.json`, `fr.json`, `de.json`, `ru.json`, `ja.json` | Data kamus tagging per bahasa (format JSON terurut alfabetis) | Ya | Tidak |
| `lib/lexicon/short-exact.json` | Token khusus tepat 2 huruf yang hanya cocok berdiri sendiri / dipisah `-` (mis. `ai`, `go`, `ui`, `ux`, `id`) | Ya | Tidak |
| `lib/lexicon/bundle.js` | Modul ES hasil generasi otomatis dari seluruh `lib/lexicon/*.json` agar `lib/domain-tagger.js` bisa berjalan di Node.js ESM maupun Cloudflare Workers tanpa `fs` runtime | Ya | Tidak (dibundel otomatis ke Worker Function) |
| `lib/lexicon-store.js` | Helper validasi entri, baca/tulis JSON aman (path confinement), dan generator `bundle.js` | Ya | Tidak |
| `lib/admin-auth.js` | Verifikasi password admin (`ADMIN_PASSWORD` / hash `scrypt` lokal), token sesi HMAC-SHA256 Bearer, dan rate limiting | Ya | Tidak |
| `admin-lexicon.html` | Antarmuka Admin UI kamus (`/admin-lexicon` -> `dist/admin-lexicon/index.html`) | Ya | Ya (berlabel `noindex, nofollow` & terhubung sesi terpadu; endpoint tulis `/api/admin/lexicon*` khusus server lokal/Express) |
| `.admin-auth.json` | Penyimpan hash `scrypt` ber-salt saat mode *First-Run Setup* lokal (jika `ARTICLE_ADMIN_PASSWORD` / `ADMIN_PASSWORD` env belum diset) | **Tidak** (`.gitignore`) | Tidak |

#### 2. Mekanisme Password Admin (Tanpa Menyimpan Rahasia di GitHub)
- **Prioritas 1 — Environment Variable (`ARTICLE_ADMIN_PASSWORD` atau `ADMIN_PASSWORD`)**:
  - Di lokal: set `ARTICLE_ADMIN_PASSWORD=...` / `ADMIN_PASSWORD=...` di `.env` (masuk `.gitignore`) atau environment container/Secrets.
  - Di produksi Cloudflare Pages: tambahkan sebagai **Secret** di **Settings -> Environment variables** untuk melindungi login 4 studio (`/admin-articles/`, `/adsense-studio/`, `/admin-lexicon`, `/admin-data/`), endpoint `/api/articles/*`, `/api/admin-data/*`, serta `action=backfill-*` pada `POST /api/log-available-domain`.
- **Prioritas 2 — First-Run Setup Lokal (`.admin-auth.json`)**:
  - Jika `ARTICLE_ADMIN_PASSWORD` dan `ADMIN_PASSWORD` belum diisi saat menjalankan preview lokal (`npm run dev`), membuka `/admin-lexicon` atau `/admin-articles/` akan menampilkan form pembuatan password admin awal (minimal 8 karakter).
  - Server menyimpannya sebagai hash `scrypt` ber-salt ke `.admin-auth.json` (bukan plaintext dan diabaikan oleh `.gitignore`), lalu mengunci form setup secara otomatis.
- **Keamanan Sesi & Endpoint**:
  - Sesi login terpadu memakai cookie `HttpOnly` bertanda tangan HMAC-SHA256 (`dn_article_session` lewat `/api/articles/auth`) dan/atau token Bearer HMAC-SHA256 di memori (`/api/admin/auth/*`), dengan masa berlaku 12 jam dan rate limit 10 kali gagal login / 15 menit.
  - Endpoint `/api/admin/lexicon*` di `server.js` dilindungi `requireUnifiedAdminAuth` beserta verifikasi `Origin`/`X-Requested-With` anti-CSRF.
  - Server Express lokal memblokir akses HTTP ke dotfiles (`.env`, `.admin-auth.json`, `.local-d1.sqlite*`) serta direktori `/lib`, `/functions`, `/migrations`, `/scripts`, `/content`, dan `/templates`.

#### 3. Di Mana `/admin-lexicon` Bisa Dibuka & Mode Eksekusinya?
- **Komputer / Laptop Lokal & Preview Node.js (`server.js`)**: Jalankan `npm run dev` (`node server.js`), lalu buka `http://localhost:3000/admin-lexicon` (atau `<URL_PREVIEW>/admin-lexicon`). Seluruh operasi baca, tambah/ubah kata (`PUT /api/admin/lexicon/:lang`), hapus (`DELETE /api/admin/lexicon/:lang/:word`), regenerasi `lib/lexicon/bundle.js`, dan *Sandbox Uji Tagger Langsung* (`POST /api/admin/lexicon/test`) berjalan penuh secara lokal agar siap di-`git commit` dan `git push`.
- **Cloudflare Pages Produksi (`dist/admin-lexicon/index.html`)**: Halaman UI ikut disalin ke `dist/admin-lexicon/index.html` dengan `<meta name="robots" content="noindex, nofollow">` dan header `_headers` (`X-Robots-Tag: noindex, nofollow`, `Cache-Control: no-store`) agar navigasi 4 studio tetap konsisten. Karena `lib/lexicon/*.json` merupakan berkas repositori lokal yang dibundel ke Worker, endpoint mutasi `/api/admin/lexicon*` **tidak** disediakan di Cloudflare Pages Functions (`404`); saat dibuka di mode statis, `/admin-lexicon` otomatis menampilkan banner **`Mode Read-Only / Statis Terdeteksi`** dan menonaktifkan tombol simpan/uji, sementara tab serta dropdown pemilih bahasa tetap tampil agar struktur editor tetap jelas.


#### 4. How-To: Menambah atau Mengubah Entri Dictionary via Admin UI (`/admin-lexicon`)
1. **Jalankan server lokal** (`npm run dev`) dan buka `http://localhost:3000/admin-lexicon` (atau `<URL_PREVIEW>/admin-lexicon`).
2. **Login** menggunakan `ARTICLE_ADMIN_PASSWORD` / `ADMIN_PASSWORD` (atau buat password awal lintas 4 studio bila muncul form *Inisialisasi Password Admin Terpadu*).
3. **Pilih bahasa / kamus target**:
   - Pilih tab di **`Pilih Kamus Bahasa yang Dikelola`** (`EN (English)` .. `JA (Romaji)`, atau `2-Char Exact`) **atau** langsung ubah dropdown **`Bahasa / Kamus Target`** (`#entryLangSelect`) di dalam form editor — keduanya tersinkron dua arah dan menampilkan badge bahasa aktif (`#activeLangBadge`) serta file JSON target (`lib/lexicon/<lang>.json`).
   - *(Catatan arsitektur)*: Memilih bahasa di sini menentukan file `lib/lexicon/<lang>.json` pemilik kata tersebut; saat proses tagging berjalan (`lib/domain-tagger.js`), sistem menggabungkan seluruh 8 kamus bahasa secara otomatis.
4. **Isi form `Tambah / Perbarui Kata`** (atau klik **Edit** pada baris tabel untuk masuk ke mode **`Edit Kata: "<kata>"`**):
   - **Kata (`ASCII a-z`)**: huruf kecil ASCII `a-z` tanpa spasi/tanda hubung (`3–32` huruf untuk kata reguler, `2–12` huruf jika mencentang `suffixOnly`, atau tepat `2` huruf di kamus `2-Char Exact`). Untuk `ru`/`ja` gunakan transliterasi Latin/romaji; untuk aksen Eropa tulis tanpa diakritik (mis. `buero`, `preco`). Jika Anda mengubah ejaan kata saat mode **Edit** di kamus yang sama, setelah `PUT` berhasil sistem otomatis menghapus kata lama via `DELETE /api/admin/lexicon/:lang/:oldWord` agar tidak meninggalkan entri ganda.
   - **Bobot (`0.1 – 20`)**: menentukan prioritas pemotongan kata pada algoritma *dynamic programming* (`SPLIT_PENALTY = 1.2`, penalti huruf tak dikenal `-1.6`).
     - Token sangat pendek / umum (2–3 huruf): `2.2 – 5.2` (hindari bobot terlalu tinggi agar tidak salah memotong di tengah kata lain).
     - Kata standar (4–6 huruf): `5.5 – 6.5`.
     - Kata panjang/spesifik (7+ huruf): `6.5 – 8.5`.
   - **Tag (`dipisah koma, 1–5`)**: format kebab-case huruf kecil/angka/`-`. Tombol quick-tag interaktif di bawah input mendukung toggle aktif/nonaktif (`✓` vs `+`) dan memberi peringatan bila jumlah tag sudah mencapai batas 5 tag.
   - **Tombol Hapus Cepat (`×`) Merah**: Seluruh kolom input di editor (`#wordInput`, `#weightInput`, `#tagsInput`, `#testDomainInput`, `#searchInput`) dilengkapi tombol **`×`** merah di sisi kanan dalam input untuk mengosongkan nilai dalam satu klik.
   - **Opsi tambahan**:
     - Centang **Token khusus akhiran / `suffix-only`** bila kata hanya boleh cocok di akhir kata (contoh: `ku`, `mu` pada bahasa Indonesia).
     - Di kamus **2-Char Exact (`short-exact`)**, centang bahasa pemilik (`langs`) untuk token 2 huruf.
5. **Simpan**: Klik **Simpan ke JSON & Rebuild Bundle** (atau **Simpan Perubahan & Rebuild Bundle** saat mode edit). Server otomatis mengurutkan kunci secara alfabetis, menyimpan `lib/lexicon/<lang>.json`, dan memperbarui `lib/lexicon/bundle.js`.
6. **Uji di Sandbox**: Gunakan panel **Sandbox Uji Tagger Langsung** di kiri bawah halaman admin, masukkan contoh domain (mis. `fintechku.id` atau `calculadorapro.es`), atur **Preferensi UI** (`#testLangSelect`, berfungsi khusus sebagai *tie-breaker* saat skor kandidat imbang), lalu klik **Uji** untuk memverifikasi `Token`, `Cakupan`, `Tag`, atau catatan fallback `brandable` (bila cakupan `0%`).

#### 5. How-To: Edit Manual via File JSON (Opsional)
Jika Anda mengedit file `lib/lexicon/<lang>.json` langsung di editor teks tanpa memakai Admin UI:
- Format entri pada `lib/lexicon/<lang>.json` (`en.json`, `id.json`, dst.):
  ```json
  {
    "fintech": [6.5, ["business", "tools"]],
    "ku": [2.2, ["personal"], { "suffixOnly": true }]
  }
  ```
- Format entri pada `lib/lexicon/short-exact.json`:
  ```json
  {
    "ai": [4.5, ["ai-tech"], ["en"]]
  }
  ```
- Setelah edit manual `.json`, **wajib sinkronkan `lib/lexicon/bundle.js`** sebelum commit (bisa dengan menyimpan/membuka dari `/admin-lexicon` atau menjalankan perintah berikut di terminal):
  ```bash
  node -e "import('./lib/lexicon-store.js').then(m => { const d = m.readAllLexicons(); m.writeBundleModule(d.shortExact, d.byLang); })"
  ```
- *(Catatan)*: Bila Anda menambah kategori tag baru yang sifatnya kata sifat/modifier (bukan topik utama), tambahkan nama tag tersebut ke `MODIFIER_TAGS` di `lib/domain-tagger.js`.

#### 6. Sinkronisasi ke GitHub & Backfill D1 Produksi
1. Verifikasi sintaks & build sebelum push:
   ```bash
   npm run lint
   npm run build
   ```
2. Commit perubahan kamus (`lib/lexicon/*.json` dan `lib/lexicon/bundle.js`) ke GitHub lalu push — Cloudflare Pages otomatis melakukan deploy ulang Worker terbaru:
   ```bash
   git add lib/lexicon/
   git commit -m "chore(lexicon): add new domain tagger dictionary entries"
   git push origin main
   ```
3. *(Opsional)* Untuk memperbarui tag domain lama yang sudah tersimpan di D1 produksi agar mengikuti kamus terbaru, jalankan `backfill-tags` secara bertahap dengan header `Authorization: Bearer <ADMIN_PASSWORD>`:
   ```bash
   # Simulasi terlebih dahulu (dryRun=true) untuk domain yang sebelumnya jatuh ke 'brandable'
   curl -X POST "https://domainname.web.id/api/log-available-domain" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_PASSWORD>" \
     -d '{"action":"backfill-tags","mode":"retag-brandable","limit":200,"offset":0,"dryRun":true}'

   # Eksekusi nyata (ubah dryRun menjadi false, ulangi dengan offset = nextOffset hingga done: true)
   curl -X POST "https://domainname.web.id/api/log-available-domain" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_PASSWORD>" \
     -d '{"action":"backfill-tags","mode":"retag-brandable","limit":200,"offset":0,"dryRun":false}'
   ```

---

### G. Kebijakan Generasi Domain, Pemeringkatan Ejaan Alami, Auto-Check 24 Teratas & Filter Default (`index.html`)

Bagian ini mendokumentasikan aturan aktif pada mesin generator, pemeringkatan, dan pengecekan ketersediaan sisi klien di `index.html` (yang dikompilasi ke halaman beranda statis 8 bahasa di `dist/`):

#### 1. Ekstensi Default, Netral vs Bahasa Eksplisit, Quick-Pick Chips & IDN/Punycode (`index.html`)
- **Mode Netral (Tanpa Pilihan Bahasa Eksplisit / `Auto`)**:
  Saat pengunjung membuka beranda akar (`/`) tanpa rute bahasa (`/id/`, `/es/`, dst.), tanpa parameter `?lang=`, dan tanpa pilihan bahasa eksplisit tersimpan (`preferredLangExplicit`), dropdown `#langSelect` berada pada posisi netral `Auto` (`value=""`), kolom `#extInput` default ke **`.com, .net`**, dan quick-pick chips (`#extQuickPickWrap`) hanya menampilkan **`.com`** dan **`.net`**.
- **Pemetaan TLD/ccTLD Dinamis 8 Bahasa (`LANGUAGE_EXTENSION_CONFIG` & `defaultExts`)**:
  - **EN (English)**: Global `.com, .net, .io, .ai, .co` | Lokal/Regional `.us, .co.uk, .ca, .au`
  - **ID (Indonesia)**: Global `.com, .net, .org, .ai` | Lokal `.id, .co.id, .my.id, .web.id`
  - **ES (Español)**: Global `.com, .net, .org, .io` | Lokal `.es, .mx, .com.ar, .co`
  - **PT (Português)**: Global `.com, .net, .org, .io` | Lokal `.com.br, .pt, .net.br`
  - **FR (Français)**: Global `.com, .net, .org, .io` | Lokal `.fr, .ca, .be, .ch`
  - **DE (Deutsch)**: Global `.com, .net, .eu, .io` | Lokal `.de, .at, .ch`
  - **RU (Русский)**: Global `.com, .net, .org, .io` | Lokal `.ru, .рф, .su, .by`
  - **JA (日本語)**: Global `.com, .net, .io, .ai` | Lokal `.jp, .co.jp, .ne.jp, .or.jp`
- **Quick-Pick Chips & Auto-Normalisasi Input (`#extInput` & `#extQuickPickWrap`)**:
  - Pengguna tetap dapat mengetik bebas pada `#extInput` dengan pemisah koma, spasi, titik koma, maupun `Enter`.
  - Panel `#extQuickPickWrap` memiliki padding internal (`p-3 sm:p-3.5`) di bawah `#extInput` dengan status visual dua arah yang kontras: tombol belum dipilih menampilkan border tipis semi-transparan dan ikon **`+`**, sedangkan tombol sudah dipilih memakai latar putih solid (`#FFFFFF`, teks `#131354`) dan ikon **`✓`**. Klik chip langsung men-toggle ekstensi masuk/keluar daftar aktif serta memicu regenerasi daftar domain secara instan.
  - Fungsi `parseExtensionsInput` & `normalizeExtInputField` menormalkan setiap token (memastikan awalan `.`, huruf kecil NFC, trim spasi/titik ganda, serta deduplikasi termasuk ekuivalensi Unicode dan Punycode seperti `.рф` ↔ `.xn--p1ai`) pada saat `blur`, `Enter`, maupun pergantian chip.
- **Form Card Refinement (`#generatorSection`) & Katalog Contoh Cepat Rotatif (`#quickExamplesBar`)**:
  - Kartu `#generatorSection` meniadakan baris header terpisah `"Nama Bisnis Anda"` dan langsung menampilkan `#quickExamplesBar` di bagian atas (tepat di atas `#primaryKeywordBox`) sebelum `#advancedOptionsDetails`, dengan katalog **20 contoh kata kunci per bahasa** di semua **8 bahasa** (`id`, `en`, `es`, `pt`, `fr`, `de`, `ru`, `ja`) yang dibagi menjadi 5 batch @ 4 item.
  - Pointer batch per bahasa disimpan aman di `localStorage` (`dnQuickExamplesStateV1`, fallback `sessionStorage` & memori): saat halaman dimuat ulang (*reload*), pointer maju otomatis ke batch berikutnya (*wrap-around* modulo 5); tombol putar `#uiQuickExRotateBtn` memajukan batch secara instan tanpa mengubah `#keywordInput` maupun parameter URL `?kw=`; dan saat pengguna mengganti bahasa aktif (lewat `#langSelect`, `Auto`, footer, maupun navigasi rute khusus bahasa via flag `resetPendingLang`), pointer untuk bahasa baru tersebut di-reset ke set pertama (indeks `0..3`).
  - Saat diklik (`applyQuickExample` + `splitQuickExamplePhrase`, selaras dengan atribut `data-kw1`/`data-kw2` hasil render JS maupun `scripts/site-builder.mjs`), teks contoh dipisah berdasarkan spasi: frasa dua kata mengisi kata pertama ke **Primary Keyword (`#keywordInput`)** dan kata kedua ke **Secondary Keyword (`#keyword2Input`)**; frasa ≥3 kata meletakkan kata pertama di `#keywordInput` dan sisa kata di `#keyword2Input`; sedangkan kata tunggal mengisi `#keywordInput` saja dan mengosongkan `#keyword2Input`. Seluruh klik contoh cepat selalu mengosongkan `#keyword3Input`, memicu event `input` dan `change` pada ketiga input agar tombol hapus `×` merah tampil sesuai isi, memperbarui SEO/URL, serta menjalankan `generateDomains()`.
  - Tombol reset form (`#uiResetFormBtn` → `resetFormInputs`, label `Reset Form` / `Reset Input`) berada di sisi kanan baris `#quickExamplesBar` sejajar dengan tombol contoh cepat dan dibedakan jelas dari tombol global `Start Over` (`#uiHeaderResetBtn` → `resetToHome`). Saat seluruh keyword dikosongkan, `generateDomains()` menahan ekspansi formula berbasis placeholder kata kunci agar tidak menghasilkan kombinasi 2 huruf acak, melainkan menampilkan state kosong yang bersih.
  - Setiap kolom input generator (`#keywordInput`, `#extInput`, `#keyword2Input`, `#keyword3Input`, `#formulaInput`) dan kolom filter daftar domain (`#analysisFilterInput`) menyediakan tombol hapus cepat `×` merah di sisi kanan dalam input (`data-clear-for`, `clearInputFieldById`, `initClearableInputs`) yang otomatis mengikuti isi input baik saat diketik pengguna maupun saat diubah secara programatis (`applyQuickExample`, `toggleExtensionQuickPick`, `toggleExtensionShortcutFilter`, `applyPatternPreset`, `resetFormInputs`, `resetToHome`, dan `changeLanguage`).
- **Dukungan IDN / Punycode (`xn--...`) & Validasi RFC 1035**:
  - Mesin generator menyertakan encoder/decoder **RFC 3492 Punycode** murni (`punycodeEncode`, `punycodeDecode`, `toAsciiLabel`, `toAsciiExtension`, `toAsciiDomain`) tanpa dependensi eksternal.
  - `sanitizeKeywordToken` (dan `buildWordsDashVariants` berbasis code point Unicode `Array.from`) menormalisasi input ke NFC, mengatur penggantian spasi serta pembersihan tanda hubung sesuai opsi pemisah aktif (`spaceReplacement: ''` dan `stripDash: true` saat **Tanpa Dash** / `includeDash === false`, atau `'-'` saat **Pakai Dash (-)** aktif), mempertahankan huruf/angka/tanda diakritik Unicode (`\p{L}\p{N}\p{M}-`), serta memangkas aman label non-ASCII bila panjang Punycode `toAsciiLabel()` melampaui 63 karakter ASCII sehingga kata kunci non-Latin (seperti bahasa **RU** Kiril dan **JA** Jepang) tetap menghasilkan domain IDN yang valid. `buildWordOrderVariants` juga memastikan seluruh varian saat **Tanpa Dash** aktif terbebas dari tanda hubung (`-`) yang tidak disengaja, termasuk untuk sisa frasa multi-kata di `#keyword2Input`.
  - `validateRfc1035Domain` memvalidasi setiap label dalam bentuk ASCII/ACE (`xn--...`, panjang label 1–63 karakter, huruf/angka/tanda hubung internal, total panjang ASCII ≤ 253 karakter) sehingga keyword maupun ekstensi non-Latin (seperti **`.рф`** / `xn--p1ai`) lolos validasi, tampil rapi dalam bentuk Unicode di tabel, dan otomatis dikonversi ke Punycode untuk lookup RDAP (`rdap.tcinet.ru`), NS DoH, pencatatan D1 (`/api/log-available-domain`), maupun tautan cek massal.

#### 2. Urutan Eksekusi Wajib & Pemeringkatan Berbasis Kealamian Ejaan
- **Alur Eksekusi (`generateDomains`)**:
  `Generate` → `Hitung Skor Gabungan (70% Brand/Pronounceability + 30% Natural Spelling)` → `Sortir Tertinggi ke Terendah` → `Batas Tampilan (MAX_DOMAINS = 200)` → `Auto-Check 24 Teratas`.
- **Evaluasi SLD Murni (`calculateSpellingNaturalness(label, lang)`)**:
  - Menilai **hanya bagian SLD/label sebelum TLD** (mis. `"boxal"` dari `"boxal.com"`, bukan ekstensinya), menghasilkan skor **`0–100`** untuk 8 bahasa aktif (`EN`, `ID`, `ES`, `PT`, `FR`, `DE`, `RU`, `JA`), serta di-*memoize* per `sld` agar ringan.
  - **Rumus Peringkat Gabungan**:
    ```text
    combinedScore = round((overall_heuristic_score * 0.70 + naturalScore * 0.30) * 100) / 100
    ```
  - **Urutan *Tie-Breaker***: `combinedScore` lebih tinggi → `naturalScore` lebih tinggi → panjang SLD lebih pendek → panjang domain penuh lebih pendek → alfabetis (`localeCompare`).
- **Aturan Skor & Penyesuaian Bahasa**:
  - **Boost Akhiran Mulus (`SPELLING_BRANDABLE_SMOOTH_SUFFIXES`)**: Memberi bonus bila label tidak memiliki penalti fonetik mayor dan berakhiran pola yang mudah dieja (`-tools`, `-ify`, `-hub`, `-lab`, `-box`, `-ly`, `-io`, `-al`, `-el`, `-er`, `-or`, `-o`, `-a`, `-y`).
  - **Bahasa Inggris (`EN`)**: Menurunkan skor akhiran canggung `-j`, `-q`, `-v`, `-x`, `-z` pada kata rekaan/gabungan (kecuali kata umum/singkatan standar seperti `fix`, `box`, `mix`, `quiz`, `jazz`, `buzz`), akhiran rawan salah ketik `-ah`/`-ih`/`-uh`, akhiran huruf ganda tak wajar (`-yy`, `-aa`, `-ckk`, `-ssz`, di luar `EN_RECOGNIZED_DOUBLE_ENDINGS` seperti `ll`, `ss`, `ff`, `tt`, `dd`, `rr`, `gg`, `bb`, `nn`, `mm`, `pp`), serta gugus konsonan berat (`HEAVY_UNNATURAL_CLUSTERS_RE`: `xtr`, `qzt`, `pph`, `ngh`, `zzk`, `vwx`, `jq`, `qj`, `qz`, `zq`, `qx`, `xq`, `xz`, `zx`, `vx`, `xv`), sementara akhiran alami Inggris (`-st`, `-nd`, `-ld`, `-ft`, `-mp`, `-nt`, `-ck`, `-sh`, `-ch`, `-th`, `-ng`) tetap diizinkan.
  - **Bahasa Indonesia (`ID`)**: Menurunkan skor kombinasi/akhiran yang kaku atau membelit lidah (`-cj`, `-dj`, `-qh`, `-xh`, `-zj`, `-nstr`, `-bstr`, `-qzt`, `-vwx`, `HEAVY_UNNATURAL_CLUSTERS_RE`, dan akhiran huruf ganda tak wajar), dengan pengecualian untuk bunyi/kata alami Indonesia (`-ng`, `-ny`, `-kh`, `-sy`, `max`, `pro`, `fix`, `id`, `ku`, `mu`, `in`, dll.).
  - **Bahasa Lain (`ES`, `PT`, `FR`, `DE`, `RU`, `JA`)**: Penyesuaian fonetik & keterbacaan ringan sesuai karakter tiap bahasa (mis. akhiran vokal/`-n` pada `JA`, `-er/-el/-en/-ig/-ik/-sch` pada `DE`, `-ov/-ev/-in/-sk` pada `RU`, `-a/-o/-e/-ar/-er/-or/-al` pada `ES`/`PT`, `-e/-er/-ir/-ie/-io/-st` pada `FR`).
- **Kebijakan Non-Destruktif (Dilarang Menghapus Domain)**:
  Domain berskor rendah **tidak pernah dihapus, difilter keluar, atau disembunyikan** dari daftar hasil—hanya diturunkan peringkatnya agar domain yang lebih alami muncul di posisi teratas terlebih dahulu.
- **Paritas Skor D1 (`overall_heuristic_score`)**:
  `computeDomainScores(...)` beserta 7 sub-skornya tetap identik 100% dengan `functions/api/log-available-domain.js` (termasuk penambahan `.eu`, `.by`, dan `.xn--p1ai` / `.рф`) untuk menjaga keselarasan pencatatan skor ke Cloudflare D1.

#### 3. Pipeline Pengecekan Ketersediaan Domain (Cache-First, Cap 24 Teratas, RDAP-First & Throttling)
- **Pra-Cek (Urutkan → Baca Cache → Batas 24 Teratas)**:
  - Kandidat hasil selalu diurutkan lebih dulu berdasarkan skor gabungan **Brand + Natural Spelling** agar domain terbaik menempati 24 posisi teratas.
  - Sebelum melakukan permintaan jaringan, `scheduleAutoAvailabilityChecks` dan `checkSingleDomainAvailability` membaca cache sesi/lokal (`localStorage` + fallback `sessionStorage`) melalui `isCachedDomainReadyForAutoSkip`. Domain yang sudah valid di cache (misalnya setelah ganti filter atau menekan `Start Over`) langsung ditampilkan tanpa memanggil RDAP/DNS ulang.
  - Auto-check hanya dijalankan pada **24 domain teratas** (`AUTO_CHECK_LIMIT = 24`, indeks `0` sampai `23`, panjang ASCII ≤ `MAX_CHECK_DOMAIN_LENGTH = 30`). Baris tambahan (termasuk hasil klik **Show More (+24)**) tetap berstatus **`Check`** sampai pengguna menekan tombol cek per baris atau **Bulk Check**.
- **Verifikasi Utama (RDAP-First, Lalu NS Sekunder)**:
  - Setiap lookup memanggil **RDAP terlebih dahulu** (`checkRdapAvailability`) sebagai sumber primer status registrasi.
  - Jika RDAP menyatakan domain sudah terdaftar (`taken`), domain langsung ditandai **`Taken`** (`method: 'RDAP'`) dan **tetap `Taken` meskipun tidak memiliki nameserver (NS) aktif**.
  - Jika RDAP melaporkan belum terdaftar (`not-registered` / `404`), pipeline melakukan verifikasi sekunder terhadap record **NS lewat DNS-over-HTTPS** (`checkNsViaDoh`): hanya ditandai **`Available`** (`method: 'RDAP'`) jika RDAP mengonfirmasi belum terdaftar dan tidak ditemukan NS aktif; jika justru ditemukan NS aktif, status menjadi **`Taken`** (`method: 'NS'`).
  - Untuk TLD tanpa endpoint RDAP resmi (`no-rdap`), lookup memeriksa NS lewat DNS lalu menetapkan **`Taken`** bila ada NS aktif atau **`Check`** bila tidak ada.
  - Jika RDAP atau DNS mengalami *timeout*, error jaringan, atau *rate limit* (`429` / `5xx`), status **tidak pernah** jatuh ke `Available`, melainkan tetap/ditetapkan ke **`Check`** (`rawStatus: 'error'`, cooldown retry `20 detik`) agar aman dicoba ulang.
- **Throttling Batch & Manual Re-Check (Bypass Cache)**:
  - Antrean auto-check dijalankan dalam batch kecil (`AUTO_CHECK_BATCH_SIZE = 4`) dengan konkurensi ringan (`AUTO_CHECK_CONCURRENCY = 2`, stagger worker `60 ms`, jeda antar-domain `AUTO_CHECK_STAGGER_MS = 120 ms`, jeda antar-batch `AUTO_CHECK_BATCH_PAUSE_MS = 180 ms`), *coalescing* refresh tabel (`60 ms`), serta *backoff* `429`/`503` dan *cooldown* per host RDAP (`rdapHostCooldownUntil`).
  - Klik manual tombol **Check** atau **↻** (**Re-check**) pada baris menjalankan `forceRecheck = true` yang melewati cache untuk domain tersebut, mengambil hasil terbaru dari RDAP/DNS, dan memperbarui data cache.

#### 4. Filter Status Ketersediaan Default (`#analysisStatusFilter`), Toolbar Ringkas & Shortcut Filter Ekstensi (`#domainExtShortcutBar`)
- **Toolbar Ringkas & Pemisahan Kontrol Basic vs Advanced (SEO-Crawlable)**:
  - Baris atas `#domainBatchActionBar` langsung menampilkan judul `Domain Results`, badge jumlah pilihan dinamis (`#domainSelectionBadgeWrap`, tampil hanya saat minimal 1 baris dipilih), toggle `Available only` (`#uiAvailOnlyBtn`), filter cepat (`#analysisFilterInput`), tombol `Copy` (`#uiBatchCopyBtn`), dan tombol toggle `More Tools / Bulk` (`#uiMoreToolsToggleBtn` → `toggleResultsAdvancedTools()`).
  - Baris kedua `#domainSecondaryToolbarRow` menyatukan shortcut filter ekstensi (`#domainExtShortcutBar`) di kiri dan panel kontrol lanjutan (`#domainAdvancedToolsPanel`) di sebelah kanan pada **baris horizontal yang sama** (dengan padding/gap ringkas `4px–6px` dan `flex-wrap` sebagai fallback saat layar sempit).
  - Panel `#domainAdvancedToolsPanel` menampung tombol `Start Over` (`#uiResetAnalysisBtn`), filter status (`#analysisStatusFilter`), `Remove Selected`, `Copy MD`, `Export .txt`, dan `Bulk Check` secara berurutan langsung di dalam HTML DOM statis (`class="hidden"` secara default) agar tetap dapat di-crawl Googlebot dan terbuka sebaris dengan `FILTER EXT:` tanpa menambah tinggi vertikal pada layar desktop.
- **Default Awal & Setelah Generate**: Dropdown filter `#analysisStatusFilter` secara bawaan disetel ke **`"available_or_check"` (`Available & Check`)**, yang menyembunyikan domain berstatus `taken` namun tetap menampilkan domain `available` maupun yang masih berstatus `check` / belum dicek.
- **Pelestarian Pilihan Pengguna (`userChangedStatusFilter`)**:
  - Selama `userChangedStatusFilter === false`, setiap pemanggilan `generateDomains()` menjaga filter pada `"available_or_check"`.
  - Begitu pengguna mengganti dropdown secara manual (`onchange`) atau mengklik tombol toggle `Available Only`, `userChangedStatusFilter` menjadi `true` sehingga pilihan pengguna tetap dipertahankan saat generate ulang.
  - Tombol **Start Over / Mulai Ulang (`resetToHome`)** mereset `userChangedStatusFilter = false`, menutup `#domainAdvancedToolsPanel` (dan menyelaraskan visibilitas `#domainSecondaryToolbarRow`), membersihkan `activeExtensionFilter`, dan mengembalikan filter ke `"available_or_check"`.
- **Shortcut Filter Ekstensi (`#domainExtShortcutBar`)**:
  - Di dalam `#domainSecondaryToolbarRow`, deretan tombol shortcut dirender otomatis berdasarkan ekstensi aktif pada `#extInput` (beserta tombol **All** untuk reset cepat), dan `syncSecondaryToolbarRowVisibility()` menyembunyikan baris kedua bila tidak ada ekstensi aktif sekaligus panel `More Tools / Bulk` sedang tertutup.
  - Klik salah satu tombol ekstensi menyaring tabel hasil secara **eksak per TLD/ccTLD** (mis. memilih `.co` tidak akan mencocokkan `.com` atau `.co.id`, dan `.id` tidak mencocokkan `.co.id`), menyinkronkan nilai ke `#analysisFilterInput`, serta menandai tombol aktif. Klik ulang tombol aktif atau klik **All** mengembalikan tampilan seluruh ekstensi.

---

### H. Online Article Editor (`/admin-articles/`) & Auto-Commit GitHub

Bagian ini mendokumentasikan arsitektur sistem editor artikel berbasis blok di web yang dapat diakses online (Cloudflare Pages + Pages Functions) maupun lokal/preview (`server.js`), beserta mekanisme commit atomik ke GitHub untuk memicu auto-build statis.

#### 1. Struktur File & Kompatibilitas Dual-Runtime
| Komponen | Lokasi | Peran Teknis |
| --- | --- | --- |
| **UI Editor Web** | `admin-articles.html` -> `dist/admin-articles/index.html` | Antarmuka editor blok (login 1 kolom Password, daftar artikel lintas 8 bahasa, editor blok `sections[]`, 3 tingkat panel lipat, **Mode Fokus**, tombol **Batal Edit** & **Hapus Artikel**, tombol hapus cepat **`×`** merah di seluruh input/textarea Panel Edit Artikel beserta modal tabel/gambar, sisip tabel Markdown `+Tabel Dalam Paragraf (MD)` & gambar `![alt](url)`, callout, FAQ, live SEO meter, pratinjau aman berbasis DOM API). Memakai `<meta name="robots" content="noindex, nofollow">` dan tidak masuk `sitemap.xml`. |
| **Mesin Markdown Bersama** | `assets/article-markdown.js` | Parser & renderer Markdown UMD nol-dependensi (`globalThis.__ARTICLE_MARKDOWN__`) untuk **bold**, *italic*, `` `code` ``, `[link](url)`, gambar `![alt](url "judul")`, daftar (`-`/`1.`), `> blockquote`, dan tabel pipe. Men-escape seluruh HTML mentah, membatasi protokol tautan/gambar ke `https:`/`http:`/`/`/`#`, serta menyediakan `stripMarkdownToPlainText` untuk penghitungan kata & JSON-LD `FAQPage`. |
| **Panduan Penulis & AdSense** | `public/doku.writer.html`, `public/doku.adsense.html` -> `dist/public/` | Buku pegangan penulis & admin monetisasi (`noindex, nofollow`) yang dapat dibaca langsung di `/public/doku.writer.html` dan `/public/doku.adsense.html`. |
| **Validasi & Normalisasi** | `lib/article-schema.js` | Modul ESM murni (`validateAndNormalizeArticleSave`, `applyArticleSaveToManifest`, `applyArticleDeleteToManifest`, `countArticleWords` berbasis `stripMarkdownToPlainText`) yang menyamakan aturan validasi `scripts/site-builder.mjs` (`slug` `^[a-z0-9]+(?:-[a-z0-9]+)*$`, `section`, `articleType`, `dateModified >= datePublished`, `published: true` wajib punya `title`/`metaDesc`/`h1` dan min. 1 section, bebas tabrakan rute). |
| **Klien GitHub Atomik** | `lib/github-articles.js` | Memakai Web `fetch()` standar (`getRepoFileText`, `listRepoDirectoryFiles`, `commitRepoFilesAtomic` dengan dukungan tulis & hapus blob) memakai **Git Data API** (`git/ref` -> `git/commits` -> `git/blobs` -> `git/trees` -> `git/commits` -> `PATCH git/refs`) sehingga perubahan `content/articles/manifest.json` dan berkas `<lang>.json` masuk dalam **1 commit atomik** (mencegah 2 build bertumpuk atau *race condition* di Cloudflare Pages). |
| **Auth & Sesi Edge** | `lib/worker-article-auth.js` | Autentikasi password-only (SHA-256 constant-time), verifikasi `Origin`/`X-Requested-With` anti-CSRF, rate limiter IP, cookie **`HttpOnly; SameSite=None; Secure; Partitioned`** (`dn_article_session`), serta tabel D1 `article_editor_sessions` (auto-bootstrap saat login) untuk pelacakan & pencabutan sesi sisi server. |
| **Cloudflare Pages Functions** | `functions/api/articles/auth.js`, `index.js`, `save.js`, `delete.js` | Endpoint produksi `/api/articles/auth` (`GET`/`POST`/`DELETE`), `/api/articles` (`GET`), `/api/articles/save` (`POST`), dan `/api/articles/delete` (`POST`). |
| **Preview Express Lokal** | `server.js` | Melayani `/admin-articles/` dan `/api/articles/*`: otomatis memakai mode GitHub bila `GITHUB_TOKEN`/`GITHUB_OWNER`/`GITHUB_REPO` terisi, atau membaca/menulis/menghapus ke disk `content/articles/` dengan pengecekan batas direktori (`resolveConfinedArticleFile`) bila berjalan lokal tanpa token GitHub. |

#### 2. Perlindungan SEO, Keamanan & Sesi
- **Tidak Terindeks Search Engine**: `scripts/site-builder.mjs` menambahkan `Disallow: /admin-articles/`, `Disallow: /admin-data/`, `Disallow: /api/articles/`, dan `Disallow: /api/admin-data/` pada `robots.txt`, serta header `X-Robots-Tag: noindex, nofollow` + `Cache-Control: no-store` pada `_headers` dan `server.js`.
- **Sanitasi Markdown & Zero Raw HTML**: Baik pratinjau DOM (`admin-articles.html`) maupun output HTML statis (`scripts/site-builder.mjs`) mem-parsing Markdown melalui `assets/article-markdown.js`. Tag HTML mentah (`<script>`, `<iframe>`, `<object>`, atribut `onclick`/`onerror`) selalu di-escape menjadi teks biasa, dan tautan/gambar hanya menerima protokol aman (`https://`, `http://`, path relatif `/...`, atau `#anchor` untuk tautan).
- **Zero Secret di Browser**: Password editor, `ARTICLE_SESSION_SECRET`, dan `GITHUB_TOKEN` hanya dibaca di server/Pages Function. Token sesi tidak pernah ditulis ke `localStorage`/`sessionStorage`, melainkan disimpan sebagai cookie `HttpOnly` bertanda tangan HMAC-SHA256 dengan validasi `jti` di D1 (`article_editor_sessions`) / memori server Express.
- **Proteksi CSRF**: Semua endpoint mutasi (`POST`/`DELETE` `/api/articles/auth`, `POST` `/api/articles/save`, `POST` `/api/articles/delete`) memvalidasi kesesuaian header `Origin` dengan `Host`/`X-Forwarded-Host` serta header `X-Requested-With`.

#### 3. Environment Variables / Secrets Cloudflare yang Diperlukan
Tambahkan variabel berikut di **Cloudflare Pages -> Settings -> Environment variables** sebelum menguji login, publish/hapus artikel, maupun manajemen D1:

| Variabel | Tipe | Keterangan |
| --- | --- | --- |
| `ARTICLE_ADMIN_PASSWORD` | **Secret** | Password login tunggal untuk `/admin-articles/`, `/adsense-studio/`, `/admin-lexicon`, dan `/admin-data/`. Bila dikosongkan, backend memakai fallback `ADMIN_PASSWORD`. |
| `ARTICLE_SESSION_SECRET` | **Secret** *(Disarankan)* | String acak min. 32 karakter untuk menandatangani cookie sesi HMAC-SHA256 di Cloudflare Workers. |
| `GITHUB_TOKEN` | **Secret** | Fine-grained Personal Access Token GitHub dengan izin **Contents: Read & Write** khusus ke repositori proyek ini. |
| `GITHUB_OWNER` | Text (Plaintext) | Username atau nama organisasi GitHub pemilik repositori. |
| `GITHUB_REPO` | Text (Plaintext) | Nama repositori GitHub tempat kode dan `content/articles/` berada. |
| `GITHUB_BRANCH` | Text (Opsional) | Nama branch target auto-deploy Cloudflare Pages (default: `main`). |

---

### I. Riwayat Perubahan Infrastruktur, Studio Admin, AdSense & Database D1

Bagian ini mencatat pembaruan infrastruktur, monetisasi AdSense multi-halaman, autentikasi admin terpadu lintas 4 studio, manajemen Database D1, serta konfigurasi build dan runtime:

#### 1. Autentikasi Terpadu & Interlink Lintas 4 Studio (`/admin-articles/`, `/adsense-studio/`, `/admin-lexicon`, `/admin-data/`)
- **Satu Password & Satu Sesi Terpadu**: Halaman **Article Studio** (`/admin-articles/`), **Layout & AdSense Studio** (`/adsense-studio/`), **Admin Lexicon** (`/admin-lexicon`), dan **Database D1** (`/admin-data/`) menggunakan sistem autentikasi dan sesi yang sama (`/api/articles/auth` dengan cookie `HttpOnly` `dn_article_session`).
- **Gerbang Akses Ketat di `/admin-data/`**: Halaman `/admin-data/` tidak menyediakan form login sendiri; bila belum terautentikasi, layar terkunci dan mengarahkan admin untuk login lewat `/admin-articles/` terlebih dahulu sebelum membuka workspace data D1 maupun memanggil `/api/admin-data/*`.
- **Urutan Prioritas Kredensial Server**: Backend Express (`server.js`) maupun Cloudflare Pages Functions (`lib/worker-article-auth.js`) membaca `ARTICLE_ADMIN_PASSWORD`, lalu fallback ke `ADMIN_PASSWORD`, dan pada mode lokal/preview memakai berkas hash lokal `.admin-auth.json` (`lib/admin-auth.js`).
- **Middleware Sesi Terpadu (`requireUnifiedAdminAuth`)**: Endpoint kamus (`/api/admin/lexicon`, `PUT /api/admin/lexicon/:lang`, `DELETE /api/admin/lexicon/:lang/:word`, `POST /api/admin/lexicon/test`) di `server.js` menerima cookie sesi terpadu `dn_article_session` maupun `Authorization: Bearer`, disertai verifikasi `Origin`/`X-Requested-With` anti-CSRF.
- **Navigasi Interlinked**: Sticky header pada `admin-articles.html`, `admin-adsense.html`, `admin-lexicon.html`, dan `admin-data.html` saling terhubung langsung (**Article Studio**, **Layout & AdSense**, **Admin Lexicon**, dan **Database D1**) sehingga berpindah antar-studio tidak memerlukan login ulang selama sesi masih aktif.

#### 2. Studio Konfigurasi & Pratinjau Google AdSense Multi-Halaman 10 Slot (`/adsense-studio/`) & Tipografi Baca Artikel
- **Berkas Terkait**: `admin-adsense.html`, `assets/adsense-slots.js` (UMD dual-runtime Node/Browser), `assets/adsense-studio-sample.js`, `assets/article-reader.js`, `templates/article.html`, `templates/guide.html`, `templates/faq.html`, `index.html`, dan `site.config.json` (`googleAdSense.slots`).
- **Pengaturan 10 Slot Lintas 4 Grup Halaman (`PAGE_GROUPS`)**:
  - **`Artikel` (5 slot)**: `slot1` (di bawah Key Takeaways, sebelum TOC), `slot2` (setelah Bagian 2 / Tabel Ringkasan Metrik), `slot3` (rata tengah di antara Tabel Kurasi), `slot4` (setelah Bagian 4 / sebelum Metodologi & FAQ), dan `slot5` (Anchor Ad sticky bawah layar dengan tombol tutup `×` tersimpan di `sessionStorage` `dn_adsense_anchor_dismissed_v1`).
  - **`Front Page` (2 slot)**: `home-slot1` dan `home-slot2` pada `index.html` & 7 edisi bahasa (`/id/`–`/ja/`).
  - **`Guide` (2 slot)**: `guide-slot1` dan `guide-slot2` pada `/guide.html` & 7 edisi bahasa.
  - **`FAQ` (1 slot)**: `faq-slot1` pada `/faq.html` & 7 edisi bahasa.
  - Mendukung ukuran terpisah **Desktop** vs **Mobile** (termasuk Multiplex `2x3` / `1x3` / vertikal), margin vertikal min. `20–24px` (maks. `64px`), toggle aktif/nonaktif, tombol `Buka Semua` / `Tutup Semua`, serta **Override per Bahasa (`langOverrides`)** khusus halaman multibahasa (`Front Page`, `Guide`, `FAQ`).
- **Prinsip Slot Bersih di Publik & Parser Aman (`parseAdSenseSnippet`)**: Hanya mengekstrak atribut `<ins class="adsbygoogle">` yang masuk allowlist (`data-ad-client`, `data-ad-slot`, `data-ad-format`, `data-ad-layout`, `data-ad-layout-key`, `data-full-width-responsive`). Pada situs publik, slot yang masih kosong, nonaktif, atau masih berstatus `simulation` **tidak pernah** merender kotak putus-putus (*wireframe*), melainkan tersembunyi bersih (`dn-ad-mount hidden`).
- **Switcher Viewport, Uji Lokal & Ekspor**: Menyediakan pratinjau **Desktop vs Mobile (390px)**, switcher 8 bahasa pratinjau, opsi simpan uji lokal ke `localStorage` (`dn_adsense_studio_config_v1`), serta modal **Salin JSON / Cuplikan Kode HTML** untuk diterapkan permanen ke `site.config.json`.
- **Kontrol Ukuran Font Pengunjung Terpadu (`A− / A+`)**: Halaman artikel publik (`templates/article.html` + `assets/article-reader.js`) menyediakan tombol `A−`, badge persentase yang dapat diklik untuk reset ke `100%`, dan `A+` secara global (`--article-font-scale`, rentang `85%–130%`, step `5%`, tersimpan di `localStorage` `dn_article_font_scale_v1`), sementara baseline per bagian (`--art-scale-*`) dapat disetel di pratinjau AdSense Studio.

#### 3. Build Statis, Halaman Edukasi/FAQ Terpisah, Routing, & Normalisasi Runtime (Node 22 + npm)
- **Normalisasi Runtime & Paket (`package.json`)**: Proyek distandardisasi untuk Node.js 22+ dan `npm` (berkas `bun.lock` telah dihapus). Server lokal `server.js` berjalan dengan `express` v5 pada port `3000` dan memakai modul bawaan Node **`node:sqlite`** (`DatabaseSync`) tanpa dependensi native tambahan.
- **Pemisahan Template Edukasi & FAQ**: Menambahkan `templates/guide.html`, `templates/faq.html`, dan data terjemahan `scripts/edu-faq-i18n.json` sehingga `/guide.html` dan `/faq.html` (beserta `/<lang>/guide.html` dan `/<lang>/faq.html`) dirender di `dist/` dan `server.js` terpisah dari hub artikel `/guides/`.
- **Output Build Statis (`scripts/build-static.mjs`)**: Selain halaman inti, `/guide.html`, `/faq.html`, 24 hub, dan artikel terbit, skrip menyalin `admin-articles.html` -> `dist/admin-articles/index.html`, `admin-adsense.html` -> `dist/adsense-studio/index.html`, `admin-lexicon.html` -> `dist/admin-lexicon/index.html`, `admin-data.html` -> `dist/admin-data/index.html`, serta menyalin `/public/*.md`, `doku.writer.html`, dan `doku.adsense.html` ke `dist/public/`.
- **Proteksi Indeks & Header Keamanan (`server.js`, `scripts/site-builder.mjs`)**: Rute `/admin-articles/`, `/adsense-studio/`, `/admin-lexicon`, `/admin-data/`, `/api/articles/*`, `/api/admin-data/*`, `/public/doku.writer.html`, dan `/public/doku.adsense.html` ditandai `noindex, nofollow` pada `_headers` (dan `Cache-Control: no-store` untuk area admin/API); `/admin-articles/`, `/admin-data/`, `/api/articles/`, dan `/api/admin-data/` tercantum pada `Disallow` di `robots.txt`.

#### 4. Manajemen Database D1, Filter Lanjutan & Export Multi-Format (`/admin-data/`)
- **Berkas Terkait**: `admin-data.html`, `lib/d1-admin-domains.js`, `lib/local-d1-adapter.js` (SQLite lokal `.local-d1.sqlite` berbasis `node:sqlite` + 12 domain seed contoh untuk preview lokal), serta endpoint `functions/api/admin-data/index.js` (`GET /api/admin-data`), `update.js` (`POST`/`PATCH /api/admin-data/update`), `delete.js` (`POST`/`DELETE /api/admin-data/delete`), dan `export.js` (`GET /api/admin-data/export`).
- **7 Filter + Pencarian Umum + Facets Autocomplete**:
  - Pencarian umum (`q`), **SLD** (`sld`), **Keyword** (`keyword`), **Char Length Min–Max** (`charLenMin`/`charLenMax`), **Tags** (`tags` + `<datalist>` tag teratas dari D1), **Extension** (`extension` multi-nilai + `<datalist>` ekstensi), **Check Source** (`auto` / `manual`), dan **Lang** (`en`–`ja`).
  - Mendukung pengurutan (`sortBy`) pada 12 kolom (`checked_at`, `overall_heuristic_score`, `brandability_score`, `pronunciation_comfort_score`, `emd_pmd_score`, `domain`, `sld`, `char_length`, `extension`, `lang`, `check_source`, `check_method`), arah `DESC`/`ASC`, dan paginasi `25 / 50 / 100 / 200` baris per halaman.
- **Tampilan Kolom Tabel Terpisah (`SLD`, `Ext TLD`, `Len`) & Tautan Cek Keyword Eksternal**:
  - Kolom `SLD` hanya menampilkan teks SLD murni (tanpa domain penuh), dipisahkan dari kolom **`Ext TLD`** (`extension`) dan kolom **`Len`** (`char_length`) di sebelahnya, diikuti `Lang`, `Source / Method`, `Tags`, `Skor Heuristik`, `Checked At`, dan `Aksi`.
  - Setiap nilai `SLD` terhubung langsung ke tautan eksternal halaman depan (`<siteUrl>/?kw=...&kw2=...&kw3=...`, terbuka di tab baru `target="_blank" rel="noopener noreferrer"`) berdasarkan token kata kunci hasil segmentasi leksikon 8 bahasa (`extractSldKeywords` di `lib/d1-admin-domains.js` + `lib/domain-tagger.js`) agar admin dapat langsung menguji variasi dan ketersediaan keyword tersebut di generator utama.
- **Edit, Hapus Baris Aman & Tombol Hapus Cepat (`×`) Merah**:
  - Seluruh **20 kolom input** pada kartu filter (`#filterQuery`, `#filterSld`, `#filterKeyword`, `#filterCharMin`, `#filterCharMax`, `#filterTags`, `#filterExtension`) dan modal Edit Baris (`#editSld`, `#editExtension`, `#editCharLength`, `#editLang`, `#editTags`, serta 8 input skor heuristik) dilengkapi tombol hapus cepat **`×`** merah di sisi kanan dalam input (`attachClearButtonToField` / `syncAllAdminDataClearButtons`) yang hanya muncul saat input terisi, mengosongkan kolom + mengembalikan fokus, dan langsung memicu event `input` & `change` agar filter/state modal langsung terbarui.
  - Modal **Edit** memperbarui `sld`, `extension`, `char_length`, `lang`, `check_method`, `check_source`, `emd_pmd_match_type`, `tags`, dan 8 kolom skor.
  - Modal **Hapus** mendukung hapus tunggal per baris maupun hapus massal hingga **200 domain** dalam satu batch.
- **Pemilih Kolom Export (`EXPORT_COLUMN_META`, 20 Kolom) & 4 Tombol Unduhan Sederhana**:
  - Tombol **Kolom Export (`20/20`)** membuka panel ceklis **20 kolom** (`domain`, `sld`, `extension`, `char_length`, `lang`, `check_method`, `check_source`, `checked_at`, `checked_at_iso`, `overall_heuristic_score`, `pronunciation_comfort_score`, `brandability_score`, `structure_length_score`, `extension_lang_fit_score`, `character_cleanliness_score`, `niche_clarity_score`, `emd_pmd_score`, `emd_pmd_match_type`, `scored_at`, `tags`) lengkap dengan 3 tombol preset: **`Semua`**, **`Sesuai Tabel`**, dan **`Ringkas (SLD + Ext + Len + Skor)`**.
  - Hasil terfilter (maks. 10.000 baris per export) dapat langsung diunduh lewat 4 tombol ringkas (**`To CSV`**, **`To XLS`**, **`To JSON`**, dan **`To MD Table`**) sesuai filter & kolom yang dipilih:
    - **`To CSV`** (UTF-8 BOM dengan netralisasi sel formula spreadsheet),
    - **`To XLS`** (SpreadsheetML XML),
    - **`To JSON`** (menyertakan `columns` terpilih & `rows` terproyeksi), dan
    - **`To MD Table`** (`format=md` / `markdown`) yang menghasilkan tabel GFM (`d1-available-domains-YYYY-MM-DD.md`) dengan **heading kolom (`EXPORT_COLUMN_META.label`) dan perataan (`:---`, `:---:`, `---:`) otomatis menyesuaikan kolom yang di-export**.


