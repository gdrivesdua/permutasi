# Panduan Penulisan & Publikasi Konten (`doku.writing.md`)

Dokumen ini menjadi panduan operasional bagi penulis dan developer untuk menyusun, melokalisasi, dan mempublikasikan artikel pada arsitektur `content/articles/` + `templates/` + `scripts/site-builder.mjs`.

Seluruh artikel dikelompokkan ke dalam 3 jalur URL (`section`):
- `/guides/` (`section: "guides"`) — **Pillar Articles E-E-A-T** & panduan metodologi *evergreen* (di navbar/header tampil dengan label **Articles** / **Artikel** agar tidak rancu dengan `/guide.html`).
- `/research/` (`section: "research"`) — **Studi Data Empiris D1** & **Kurasi Editorial per Niche**.
- `/tools/` (`section: "tools"`) — **Halaman Alat Interaktif** & *benchmark* berbasis data agregat.

---

## 1. Alur Kerja End-to-End (Dari Data D1 ke Halaman Terbit)

1. **Siapkan Data Agregat (jika memakai data `available_domains`)**:
   - Jalankan query agregasi (`GROUP BY` / statistik) melalui Wrangler D1 CLI:
     ```bash
     npx wrangler d1 execute domainname_available_domains --remote --command="SELECT ..."
     ```
   - *(Opsional)* Simpan ringkasan snapshot JSON di `content/articles/data/<nama-snapshot>.json` sebagai arsip referensi, lalu pastikan angka `sampleSize` dan `dateRange` pada `dataSnapshot` di `content/articles/manifest.json` (yang langsung dibaca builder untuk metadata E-E-A-T) konsisten dengan isi tabel artikel.
2. **Buat Direktori Artikel & File Bahasa**:
   - Buat folder `content/articles/<section>/<id>/` (gunakan slug ASCII huruf kecil + tanda hubung, mis. `domain-scoring-methodology`).
   - Tulis konten per bahasa yang sudah siap terbit, misalnya `en.json` dan `id.json`.
3. **Daftarkan Artikel di `content/articles/manifest.json`**:
   - Tambahkan entri artikel ke array `"articles"`.
   - Set `"published": true` **hanya** untuk bahasa yang file `<lang>.json`-nya sudah 100% diterjemahkan secara alami dan selesai ditinjau. Bahasa yang belum siap wajib `"published": false` atau tidak ditulis dulu.
4. **Preview Lokal via `server.js`**:
   - Jalankan dev server dan buka langsung `http://localhost:3000/<section>/<slug>/` atau `/<lang>/<section>/<slug>/`.
   - Perubahan di `manifest.json` maupun `<lang>.json` langsung terbaca saat halaman di-refresh.
5. **Validasi & Build Statis**:
   - Jalankan `npm run lint && npm run build`. Skrip build otomatis memvalidasi integritas `manifest.json`, menghasilkan file `dist/<section>/<slug>/index.html`, serta memperbarui `dist/sitemap.xml`.

---

## 2. Panduan Penulisan untuk Setiap Jenis Artikel

### Jenis 1: Studi Data & Statistik (*Original Data Studies* — `/research/...`)
**Tujuan Utama**: Magnet backlink (*linkbait* rujukan media/blogger SEO) dan halaman bernilai tinggi untuk AdSense.

- **Target Panjang**: 1.200 – 2.000 kata.
- **`articleType` di manifest**: `"Article"`.
- **Struktur Wajib**:
  1. **Ringkasan Temuan Utama (`keyTakeaways`)**: 3–5 angka paling mengejutkan/jelas dari dataset (contoh: persentase `.com` <= 10 huruf vs `.id`, atau selisih rata-rata `overall_heuristic_score`).
  2. **Konteks Masalah & Pertanyaan Riset**: Mengapa topik ini penting bagi pemilik brand/SEO.
  3. **Metodologi & Cakupan Sampel**: Sebutkan jumlah sampel `N`, periode pengambilan (`checked_at`), dan definisi metrik (`sld`, `pronunciation_comfort_score`, `brandability_score`, dll.).
  4. **Minimal 2 Tabel Data (`table`) + Analisis Sebab-Akibat**: Jangan sekadar mengulang angka di tabel dalam bentuk kalimat. Jelaskan *mengapa* pola itu muncul (mis. mengapa domain 1–2 kata dengan rasio vokal 35%–50% mendominasi skor tinggi).
  5. **Rekomendasi Praktis (*Actionable Playbook*)**: Langkah nyata yang bisa diterapkan pembaca saat memilih nama domain.
  6. **Catatan Metodologi & Keterbatasan Data (`methodologyNote`)**: Jelaskan bahwa status ketersediaan berbasis pengecekan `RDAP` utama dan verifikasi `NS`/DNS sekunder pada tanggal cek (`checked_at`), serta tidak mencerminkan status merek dagang (*trademark*).
  7. **FAQ (`faqs`)**: 3–5 pertanyaan umum yang sering muncul di SERP.
- **Hal yang Dilarang**:
  - Mengklaim korelasi sebagai jaminan peringkat Google.
  - Menampilkan daftar domain mentah tanpa kurasi/analisis.

---

### Jenis 2: Kurasi Terpilih + Ulasan Editorial (*Curated Niche Lists* — `/research/...`)
**Tujuan Utama**: *Bookmarkable resource* untuk pendiri startup, UMKM, dan komunitas indie hacker yang tetap aman dari filter *Thin Content* AdSense.

- **Target Panjang**: Minimal 900 – 1.500 kata **narasi editorial di luar tabel domain**.
- **`articleType` di manifest**: `"Article"`.
- **Kriteria Ketat Pemilihan Data D1**:
  - Filter minimal: `overall_heuristic_score >= 80`, `pronunciation_comfort_score >= 75`, `character_cleanliness_score = 100`.
  - Pastikan jumlah domain kurasi memadai (**25–50 domain** per halaman kurasi, bukan 3–5 domain).
- **Struktur Wajib**:
  1. **Pengantar Niche & Kriteria Seleksi**: Jelaskan standar skor dan alasan mengapa pola tertentu cocok untuk niche tersebut (mis. `ai-tech`, `ecommerce`, `tools`, `calculator`).
  2. **Analisis Pola Penamaan di Niche Tersebut**: Bedah 3–4 pola kuat (mis. akhiran kata kerja + kata benda, penggunaan TLD `.ai`/`.io`/`.id`, panjang ideal SLD).
  3. **Tabel Kurasi Domain Terkelompok**: Jangan hanya 1 tabel panjang tanpa konteks. Kelompokkan menjadi sub-kategori (mis. *"Nama Pendek 1 Kata / Singkatan"*, *"Kombinasi 2 Kata Deskriptif"*, *"Nama Brandable Abstrak"*) dengan kolom `Domain`, `Skor Pelafalan`, `Skor Brandability`, `Skor Total`, dan `Catatan Penggunaan` atau `Tanggal Cek`.
  4. **Panduan Due Diligence Wajib Sebelum Registrasi**: Ingatkan pembaca untuk mengecek arsip Wayback Machine, indeks merek dagang (DJKI/USPTO/WIPO), dan pengecekan ulang live via RDAP/registrar.
  5. **Tautan Silang ke Generator Utama (`/`)** agar pembaca bisa memvariasikan kata kunci sendiri.
- **Hal yang Dilarang**:
  - Membuat 1 halaman per 1 domain atau halaman tipis untuk tag mikro dengan sedikit data.
  - Menyajikan daftar domain sebagai "pasti masih kosong selamanya" tanpa mencantumkan tanggal pengecekan (`checked_at`).

---

### Jenis 3: Halaman Alat Interaktif + Benchmark (*Interactive Tools* — `/tools/...`)
**Tujuan Utama**: Utilitas *linkbait* yang mendapatkan tautan berkelanjutan karena membantu pengguna mengambil keputusan langsung.

- **Target Panjang**: Minimal 800 – 1.200 kata dokumentasi & interpretasi di bawah/sekitar area alat.
- **`articleType` di manifest**: `"WebApplication"`.
- **Struktur Wajib**:
  1. **Penjelasan Cara Kerja Alat (`interactiveWidgetNotice` / blok pengantar)**: Fungsi alat, input yang dibutuhkan, dan bagaimana hasil benchmark dibandingkan terhadap data agregat `available_domains`.
  2. **Contoh Kasus & Interpretasi Skor**: Berikan 2–3 contoh nyata (skor rendah vs sedang vs tinggi) lengkap dengan arti tiap sub-skor.
  3. **Rumus & Transparansi Penilaian**: Tautkan ke Pillar Artikel *Metodologi Penilaian Domain* untuk memperkuat E-E-A-T.
  4. **Batasan Teknis & FAQ**: Jelaskan bahwa kalkulasi berjalan di browser tanpa menyimpan input pengguna (*privacy-first*).

---

### Jenis 4: Pillar Articles E-E-A-T Murni (*Evergreen Guides* — `/guides/...`)
**Tujuan Utama**: Fondasi otoritas (*Topical Authority*) dan sinyal E-E-A-T (**Experience, Expertise, Authoritativeness, Trustworthiness**) di SERP.

- **Target Panjang**: 1.500 – 2.500 kata (mendalam, terstruktur rapi, tanpa basa-basi filler).
- **`articleType` di manifest**: `"TechArticle"` (untuk topik metodologi, linguistik, DNS/RDAP, SEO internasional) atau `"Article"` (untuk audit red flags, morfologi branding).
- **Set `"isPillar": true`** di `manifest.json` agar mendapat prioritas `0.8` (`en`) / `0.7` (lokal) di `sitemap.xml` (catatan: seluruh entri dengan `section: "guides"` otomatis juga diperlakukan sebagai pillar oleh `scripts/site-builder.mjs`).
- **Checklist Khusus untuk Ke-7 Topik Pillar (dari `/public/doku.article.md` Bagian 6)**:
  1. *Metodologi Penilaian Kualitas Domain*: Jelaskan 7 bobot sub-skor (`0.22` hingga `0.10`), penalti sinergis, serta bukti distribusi persentase nyata dari D1.
  2. *Anatomi Nama Brand Lolos Radio Test*: Bahas rasio vokal ideal (`30%–56%`), benturan konsonan berat, dan perbedaan fonetik antar bahasa (`.id` vs `.com`).
  3. *Perbandingan Akurasi `RDAP` vs DNS (`NS`)*: Jelaskan alur pengecekan `RDAP` lebih dulu sebagai sumber utama status registrasi, lalu verifikasi sekunder `NS`/DNS saat `RDAP` mengembalikan `404`, mengapa domain terdaftar tanpa `NS` tetap berstatus `Taken` (bukan `No NS`), serta statistik `check_method` di D1.
  4. *Domain Red Flags & Checklist Due Diligence*: Bahas pola `os`/`of`/`ol`/`nn`, cara audit Wayback Machine, profil backlink spam, dan merek dagang.
  5. *Pola Morfologi & Kata Majemuk Bisnis*: Bedah kombinasi kata kerja + objek, sufiks lokal (`-ku`, `-id`, dll.), dan batas panjang ringkas.
  6. *Strategi ccTLD vs gTLD (8 Pasar Bahasa)*: Bahas sinyal geotargeting Google Search, `extension_lang_fit_score`, dan studi kasus `.id`, `.de`, `.jp`, `.es`, `.com.br`, `.fr`, `.ru` vs `.com`.
  7. *Laporan Indeks Periodik (Kuartalan/Tahunan)*: Format arsip berkala dengan perbandingan antar periode (`checked_at`) dan tren kelangkaan domain pendek per niche.
- **Bukti E-E-A-T Wajib pada Setiap Pillar**:
  - Cantumkan `dataSnapshot` pada `manifest.json` bila merujuk data agregat D1.
  - Gunakan contoh **Buruk vs Baik** yang konkret pada sub-bagian atau tabel.
  - Isi `relatedIds` dengan 2–4 artikel spoke/pillar terkait agar jaring *Hub-and-Spoke* aktif otomatis.

---

### Jenis 5: Copywriting Halaman Hub (`content/articles/hubs.json`)
Halaman `/guides/`, `/research/`, dan `/tools/` bertindak sebagai pintu masuk tematik.
- Pastikan `h1`, `metaDesc`, dan `intro` singkat, jelas, serta menggunakan istilah alami per bahasa.
- Jangan menaruh iklan AdSense di halaman hub sebelum kategori memiliki narasi pengantar editorial yang cukup (template hub saat ini menonaktifkan slot iklan secara default).
- Hub yang belum memiliki minimal 1 artikel `"published": true` pada bahasa tersebut otomatis memakai `<meta name="robots" content="noindex, follow">` dan **tidak** dimasukkan ke `sitemap.xml`.

---

## 3. Referensi Lengkap Field JSON Artikel

### A. Entri di `content/articles/manifest.json`
```json
{
  "id": "radio-test-brand-linguistics",
  "section": "guides",
  "defaultSlug": "radio-test-brand-linguistics",
  "slugByLang": {},
  "articleType": "TechArticle",
  "isPillar": true,
  "changefreq": "monthly",
  "datePublished": "2026-11-24",
  "dateModified": "2026-11-24",
  "author": {
    "name": "Tim Riset Domain Name",
    "role": "Domain Linguistics & DNS Research",
    "url": "/about.html"
  },
  "dataSnapshot": {
    "file": "tld-length-stats-2026-q4.json",
    "table": "available_domains",
    "sampleSize": 12500,
    "dateRange": "2026-09-01 to 2026-11-20"
  },
  "relatedIds": ["domain-scoring-methodology"],
  "locales": {
    "en": {
      "published": true,
      "title": "The Radio Test in Domain Naming: Empirical Phonetics Data",
      "metaDesc": "Meta description 110–155 karakter yang spesifik merangkum temuan dan manfaat artikel.",
      "keywords": "radio test domain, brandable phonetics, domain pronunciation score",
      "h1": "Anatomi Judul H1 Artikel yang Jelas dan Spesifik",
      "excerpt": "Ringkasan 1–2 kalimat untuk subjudul artikel dan kartu preview di halaman hub."
    }
  }
}
```

### B. File Konten `content/articles/<section>/<id>/<lang>.json`
Seluruh nilai teks di-escape otomatis oleh `scripts/site-builder.mjs` (tulis sebagai teks biasa, **jangan** menulis tag HTML mentah di dalam JSON).

| Field | Wajib? | Keterangan |
| --- | --- | --- |
| `id` | Ya | Harus sama persis dengan `id` di `manifest.json`. |
| `lang` | Ya | Kode ISO 2-huruf (`en`, `id`, `es`, `pt`, `fr`, `de`, `ru`, `ja`). |
| `readingTimeMinutes` | Ya | Estimasi waktu baca (angka bulat, mis. `7` atau `9`). |
| `breadcrumbLabel` | Ya | Label singkat untuk item ke-3 pada breadcrumb (maks ~35–45 karakter). |
| `keyTakeaways` | Disarankan | Array string berisi 3–5 poin inti temuan/panduan. |
| `interactiveWidgetNotice` | Opsional | Kotak info khusus untuk artikel kategori `tools`. |
| `sections` | Ya (min. 1) | Array blok isi artikel (`heading`, `anchor`, `paragraphs`, `bullets`, `callout`, `table`, `codeBlock`, `subsections`). |
| `methodologyNote` | Disarankan | Catatan transparansi sumber data, periode `checked_at`, dan batasan klaim. |
| `faqs` | Disarankan | Array `{ "q": "...", "a": "..." }`. Jika minimal 2 item, otomatis dirender menjadi Schema.org `FAQPage`. |

**Struktur Elemen di dalam `sections[]`:**
```json
{
  "anchor": "slug-jangkar-huruf-kecil",
  "heading": "1. Judul Bagian Utama (Dirender sebagai <h2> & Masuk TOC)",
  "paragraphs": [
    "Paragraf pertama...",
    "Paragraf kedua..."
  ],
  "bullets": [
    "Item daftar polos",
    { "label": "Label Tebal", "text": "Penjelasan detail item." }
  ],
  "callout": {
    "tone": "info",
    "title": "Catatan Penting (opsional)",
    "body": "Isi kotak sorotan; gunakan tone: 'warning' untuk peringatan risiko."
  },
  "table": {
    "caption": "Judul Tabel + Sumber Sampel",
    "headers": ["Kolom 1", "Kolom 2", "Kolom 3"],
    "rows": [
      ["Baris 1A", "Baris 1B", "Baris 1C"]
    ]
  },
  "codeBlock": {
    "caption": "Contoh Query / Rumus (opsional)",
    "code": "SELECT extension, COUNT(*) FROM available_domains GROUP BY extension;"
  },
  "subsections": [
    {
      "heading": "1.1 Sub-bagian (Dirender sebagai <h3>)",
      "paragraphs": ["Uraian mendalam sub-bagian..."],
      "bullets": ["Poin pendukung 1", "Poin pendukung 2"]
    }
  ]
}
```

---

## 4. Standar SEO On-Page & Lokalisasi 8 Bahasa

1. **Panjang Karakter Meta**:
   - `title`: 40–62 karakter agar tidak terpotong di SERP.
   - `metaDesc`: 115–155 karakter, sebutkan nilai unik (data/metodologi/studi kasus).
   - `slug`: gunakan huruf kecil ASCII + tanda hubung (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), maksimal 4–6 kata.
2. **Transkreasi Nyata (Bukan Terjemahan Kaku)**:
   - Jangan menerjemahkan istilah teknis secara harfiah jika istilah aslinya lebih lazim dipakai praktisi lokal (contoh: tetap pertahankan *Radio Test*, *Exact Match Domain (EMD)*, *ccTLD*, *RDAP*, lalu beri penjelasan lokal).
   - Sesuaikan contoh domain dan ekstensi per pasar bahasa:
     - `id`: sorot `.id`, `.co.id`, `.my.id`, `.web.id` di samping `.com`.
     - `de`: sorot `.de`, `.at`, `.ch`.
     - `es`: sorot `.es`, `.mx`, `.ar`.
     - `pt`: sorot `.pt`, `.com.br`.
     - `fr`: sorot `.fr`, `.be`, `.ch`.
     - `ru`: sorot `.ru`, `.su`.
     - `ja`: sorot `.jp`, `.co.jp`.
3. **Aturan Ketat Bahasa Belum Terjemah**:
   - Dilarang keras mengisi `id.json` dengan teks bahasa Inggris lalu menyetel `"published": true`.
   - Saat artikel baru hanya terbit di `en` dan `id`, `site-builder.mjs` otomatis hanya mengeluarkan tag `hreflang` dan entri `sitemap.xml` untuk `en` dan `id`, serta mengarahkan language switcher bahasa lain ke halaman hub kategori (`/es/guides/`, dll.) agar tidak pernah memunculkan halaman `404`.

---

## 5. Checklist Pra-Publikasi (Sebelum Set `"published": true`)

Pastikan seluruh poin berikut terpenuhi sebelum artikel dirilis:
- [ ] **Nilai Orisinal & Kedalaman**: Artikel memiliki narasi analisis nyata (minimal 800–1.500 kata untuk riset/kurasi, 1.500+ kata untuk pillar), bukan sekadar tabel mentah atau paragraf generik hasil pengulangan.
- [ ] **Akurasi Data D1**: Semua angka di tabel sesuai dengan snapshot query D1 dan mencantumkan `sampleSize` + rentang tanggal di `manifest.json`.
- [ ] **Bebas Klaim Menyesatkan**: Tidak menjanjikan ranking #1 Google dan mencantumkan pengingat cek merek dagang + status ketersediaan berbasis `checked_at`.
- [ ] **Kualitas HTML & Schema**: Terdapat minimal 2 sub-bagian (`<h2>`), minimal 2 `faqs`, dan minimal 1–2 tautan `relatedIds` ke artikel lain yang sudah `published: true` di bahasa yang sama.
- [ ] **Validasi Build Bersih**: Perintah `npm run lint && npm run build` selesai dengan exit code `0`, tidak ada error manifest, dan URL artikel muncul di `dist/sitemap.xml` dengan `<lastmod>` sesuai `dateModified`.
