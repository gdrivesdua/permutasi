# Ide Konten Berbasis Data D1 (`available_domains`): Linkable Assets & Layak AdSense

Dokumen ini merangkum ide konten yang dapat dibangun dari tabel Cloudflare D1 `available_domains` untuk dua tujuan utama:
1. **Memancing backlink organik (*Linkable Assets*)** dari blogger, jurnalis teknologi, praktisi SEO, konsultan branding, dan komunitas startup/UMKM.
2. **Memenuhi standar kelayakan Google AdSense** (*high-value original content*, informatif, terstruktur, dan bebas dari pola *thin content* / *Scaled Content Abuse*).

---

## Ringkasan Kolom Sumber Data (`available_domains`)

| Kelompok Kolom | Kolom yang Dimanfaatkan | Potensi Olahan Konten |
| --- | --- | --- |
| **Identitas & Struktur** | `domain`, `sld`, `extension`, `char_length`, `lang` | Distribusi panjang domain, rasio TLD global vs ccTLD lokal, perbandingan antar 8 bahasa |
| **Kualitas & Fonetik** | `pronunciation_comfort_score`, `brandability_score`, `structure_length_score`, `character_cleanliness_score`, `overall_heuristic_score` | Statistik kelolosan *radio test*, persentil kualitas brand, benchmark nama pendek vs panjang |
| **SEO & Intent** | `niche_clarity_score`, `emd_pmd_score`, `emd_pmd_match_type` (`nk`, `np`, `up`, `be`, `nc`, `nn`, `os`, `of`, `ol`), `extension_lang_fit_score` | Studi kasus risiko *over-optimization* EMD/PMD, analisis pola nama aman SEO |
| **Kategorisasi & Waktu** | `tags` (JSON array maks 6 tag), `checked_at`, `check_method`, `check_source` | Kurasi domain terbaik per niche (`ai-tech`, `ecommerce`, `tools`, dll.), pembaruan berkala dengan stempel waktu |

---

## 1. Konten Riset Data & Statistik (*Original Data Studies* — Magnet Backlink Terkuat)

Blogger, media, dan praktisi SEO cenderung menautkan ke **data empiris orisinal** yang tidak tersedia di tempat lain. Format artikel riset mendalam juga dinilai bernilai tinggi oleh peninjau AdSense.

### A. Laporan Statistik Panjang & Ketersediaan Domain per Ekstensi
- **Contoh Judul**: *"Studi Data Ribuan Domain Tersedia: Seberapa Sulit Menemukan `.com` vs `.id` di Bawah 10 Karakter yang Mudah Diucapkan?"*
- **Data D1**: `extension`, `char_length`, `pronunciation_comfort_score`, `overall_heuristic_score`, `checked_at`.
- **Isi Utama**:
  - Persentase domain tersedia berdasar rentang panjang SLD (`<= 6`, `7–9`, `10–12`, `13+` karakter).
  - Perbandingan rata-rata `pronunciation_comfort_score` dan `brandability_score` per ekstensi (`.com`, `.id`, `.my.id`, `.web.id`, `.ai`, `.io`).
  - Penjelasan metodologi skoring (7 sub-skor) dan kesimpulan praktis pemilihan panjang domain.

### B. Studi SEO: Fenomena *Over-Optimization* EMD/PMD vs Nama Brandable
- **Contoh Judul**: *"Mengapa Banyak Domain Keyword-Match Masih Tersedia Tapi Berisiko SEO? Analisis Data `emd_pmd_match_type`"*
- **Data D1**: `emd_pmd_score`, `emd_pmd_match_type` (`os`, `of`, `ol`, `np`, `be`), `pronunciation_comfort_score`, `character_cleanliness_score`.
- **Isi Utama**:
  - Proporsi domain tersedia yang masuk kategori `os` (*keyword stuffing*), `of` (*forced hyphen/number*), dan `ol` (*terlalu panjang mengejar keyword*) dibanding `np` (*natural PMD*) dan `be` (*balanced EMD*).
  - Contoh pola penamaan berisiko vs pola PMD alami yang lolos *radio test* (`pronunciation_comfort_score >= 72`).

### C. Riset Ekosistem Penamaan Lintas 8 Bahasa & ccTLD
- **Contoh Judul**: *"Peta Tren Kata Majemuk & Pemilihan Ekstensi Lokal vs Global di 8 Pasar Bahasa (EN, ID, ES, PT, FR, DE, RU, JA)"*
- **Data D1**: `lang`, `extension`, `extension_lang_fit_score`, `tags` (`<lang>-tld`, `multilingual`, `compound`).
- **Isi Utama**:
  - Perbandingan topik dan pola `compound` paling dominan di tiap bahasa.
  - Analisis kesesuaian TLD lokal (`.id`, `.es`, `.pt`, `.com.br`, `.fr`, `.de`, `.ru`, `.jp`) vs `.com`.

---

## 2. Halaman Kurasi Terpilih + Ulasan Editorial (*Curated Niche Lists*)

Daftar ide domain yang telah disaring ketat berdasarkan skor dan kebersihan karakter sangat sering di-*bookmark* dan dibagikan di komunitas startup, UMKM, indie hacker, maupun artikel referensi bisnis.

### A. Etalase Domain Berkualitas Tinggi per Niche Utama
- **Contoh Judul**:
  - *"50+ Ide Nama Domain AI & SaaS Tersedia dengan Skor Brandability > 85 (Update Berkala)"*
  - *"Rekomendasi Nama Domain Toko Online `.id` / `.my.id` yang Singkat & Lolos Radio Test"*
  - *"Ide Nama Domain Niche Tools & Kalkulator dengan Struktur Bersih Tanpa Angka/Strip"*
- **Kriteria Filter D1**:
  - `tags` mengandung topik target (mis. `ai-tech`, `ecommerce`, `tools`, `calculator`, `parenting-baby`, `cloud-tech`).
  - `overall_heuristic_score >= 80`
  - `pronunciation_comfort_score >= 75`
  - `character_cleanliness_score = 100`
  - Diurutkan berdasar `overall_heuristic_score DESC, checked_at DESC`.

### B. Syarat Wajib Agar Halaman Kurasi Tetap Layak AdSense
- **Jangan** membuat ratusan halaman tipis otomatis untuk setiap kombinasi tag kecil yang hanya berisi beberapa baris tabel.
- Buat halaman kurasi hanya untuk **kategori besar yang memiliki stok data memadai** (mis. minimal 25–50 domain berkualitas per halaman).
- Sertakan **panduan editorial khusus niche** (minimal ~800+ kata: analisis pola kata yang kuat di niche tersebut, tips pelafalan, pengingat cek merek dagang, serta penjelasan arti tiap kolom skor).
- Tampilkan waktu cek terakhir (`checked_at`) secara transparan dan sediakan tombol *Live Re-check* menuju pengecekan DoH/RDAP.

---

## 3. Halaman Alat Interaktif + *Benchmark* Database (*Interactive Linkbait Tools*)

Halaman alat (*web utility*) yang diperkaya data agregat nyata dari database memiliki rasio perolehan backlink paling konsisten di web.

### A. Domain Quality Explorer & Leaderboard per Niche
- **Data D1**: Seluruh 7 sub-skor, `overall_heuristic_score`, `tags`, `lang`, `extension`, `char_length`.
- **Konsep**: Pengunjung dapat memfilter kumpulan domain tersedia berdasarkan **Niche (`tags`)**, **Bahasa (`lang`)**, **Ekstensi**, dan **Skor Minimal**, lengkap dengan ringkasan statistik kategori tersebut.

### B. Radio-Test & Brandability Benchmark Calculator
- **Konsep**: Alat mandiri untuk menilai satu nama domain/brand menggunakan formula skoring yang sudah ada (`computeDomainScores`), lalu menampilkan **posisi persentilnya** terhadap data agregat di D1 (mis. *"Skor pelafalan 88/100 menempatkan nama ini di Top 10% dari domain `.id` yang terindeks"*), disertai dokumentasi rumus dan FAQ.

---

## 4. Contoh Query Agregasi D1 untuk Bahan Konten

Query berikut dapat dijalankan lewat Wrangler CLI (`npx wrangler d1 execute domainname_available_domains --remote --command="..."`) saat menyusun data artikel:

```sql
-- 1. Statistik rata-rata panjang & skor per ekstensi (minimal 20 sampel)
SELECT
  extension,
  COUNT(*) AS total_domains,
  ROUND(AVG(char_length), 1) AS avg_length,
  ROUND(AVG(pronunciation_comfort_score), 1) AS avg_pronunciation,
  ROUND(AVG(brandability_score), 1) AS avg_brandability,
  ROUND(AVG(overall_heuristic_score), 1) AS avg_overall
FROM available_domains
WHERE overall_heuristic_score IS NOT NULL
GROUP BY extension
HAVING total_domains >= 20
ORDER BY total_domains DESC;

-- 2. Distribusi kategori EMD/PMD (untuk artikel studi risiko SEO)
SELECT
  emd_pmd_match_type,
  COUNT(*) AS total,
  ROUND(AVG(overall_heuristic_score), 1) AS avg_overall
FROM available_domains
WHERE emd_pmd_match_type IS NOT NULL
GROUP BY emd_pmd_match_type
ORDER BY total DESC;

-- 3. Kurasi Top 50 domain niche tertentu yang bersih & mudah diucapkan
SELECT
  domain,
  extension,
  lang,
  pronunciation_comfort_score,
  brandability_score,
  overall_heuristic_score,
  tags,
  checked_at
FROM available_domains
WHERE tags LIKE '%"ecommerce"%'
  AND overall_heuristic_score >= 80
  AND pronunciation_comfort_score >= 75
  AND character_cleanliness_score = 100
ORDER BY overall_heuristic_score DESC, checked_at DESC
LIMIT 50;
```

---

## 5. Checklist Kepatuhan AdSense & Anti-Spam

1. **Hindari halaman 1 domain = 1 URL** (mis. `/domain/contohbisnis.com`): Halaman seperti itu tergolong *thin content* / *doorway page* dan berisiko tinggi ditolak AdSense (*Low Value Content*) serta terkena filter *Scaled Content Abuse*.
2. **Jangan tampilkan tabel mentah tanpa narasi**: Setiap halaman riset maupun kurasi wajib memiliki analisis tertulis yang jelas, metodologi, dan nilai edukatif bagi pembaca.
3. **Jaga transparansi data**: Selalu cantumkan bahwa status ketersediaan berdasar pengecekan NS/RDAP pada waktu `checked_at` dan dapat berubah sewaktu-waktu.
4. **Pastikan tautan trust lengkap**: Setiap halaman konten baru wajib menautkan halaman `about.html`, `privacy-policy.html`, `terms.html`, `disclaimer.html`, dan `contact.html`, serta tidak melanggar batas slot iklan.

---

## 6. Pillar Articles Murni untuk Penguatan E-E-A-T di SERP

Selain konten kurasi dan alat interaktif di atas, data `available_domains` juga dapat diolah menjadi **7 Pillar Articles** (*evergreen reference hubs*) yang dirancang khusus untuk membangun **E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)** di Google SERP, sekaligus tetap menarik backlink dan layak disetujui AdSense:

### 1. Pillar Metodologi & Transparansi: *"Metodologi Terbuka Penilaian Kualitas Domain (Radio Test, Struktur, & Risiko SEO)"*
- **Data D1**: Seluruh 7 sub-skor, `overall_heuristic_score`, serta distribusi nyata persentase domain yang lolos/gugur di database.
- **Isi Utama**: Menjelaskan alasan ilmiah di balik pembobotan (`pronunciation 0.22`, `brandability 0.20`, `structure 0.13`, `ext_fit 0.12`, `cleanliness 0.10`, `niche 0.11`, `emd_pmd 0.12`) serta penalti sinergis (`pronunciation < 72 && niche < 60`), dibuktikan dengan angka distribusi empiris dari ribuan baris D1.
- **Peran E-E-A-T & Linkbait**: Membuktikan **Expertise & Trustworthiness** dan menjadi halaman rujukan (*methodology citation*) bagi artikel lain.

### 2. Pillar Linguistik & Fonetik: *"Anatomi Nama Brand yang Lolos 'Radio Test' Berdasarkan Data Empiris Domain"*
- **Data D1**: `sld`, `pronunciation_comfort_score`, `brandability_score`, `char_length`, `lang`.
- **Isi Utama**: Membedah pola fonetik nyata dari kelompok `sld` berskor pelafalan tinggi (`>= 85`) vs rendah (`< 50`) — rasio vokal ideal (`30%–56%`), benturan konsonan berat (`bk`, `tp`, `qj`, `xz`), akhiran terputus, dan perbedaan toleransi fonetik lintas bahasa (mis. akhiran `-k` / `ng` / `ny` pada `.id` vs `.com`).
- **Peran E-E-A-T & Linkbait**: Membuktikan **Experience** riset linguistik terapan dari data primer sendiri; sering dikutip oleh blog branding, copywriter, dan konsultan startup.

### 3. Pillar Infrastruktur Teknis: *"Cara Kerja Pengecekan Ketersediaan Domain: Perbandingan Akurasi Sinyal `RDAP` vs DNS (`NS`)"*
- **Data D1**: `check_method` (`RDAP` vs `NS`), `check_source` (`auto` vs `manual`), `extension`, `checked_at`.
- **Isi Utama**: Panduan teknis mendalam mengenai alur verifikasi **RDAP-first, NS-secondary** (query registrasi resmi `RDAP` lebih dulu sebagai sumber primer, lalu verifikasi `NS`/DNS DoH hanya saat `RDAP` mengembalikan `404`), mengapa domain terdaftar tanpa `NS` tetap berstatus `Taken` (tidak menyesatkan sebagai `No NS`), keterbatasan TLD tanpa server RDAP resmi, serta statistik `check_method` di D1.
- **Peran E-E-A-T & Linkbait**: Mengokohkan **Authoritativeness** teknis di bidang DNS & standar RFC 1035; sering ditautkan oleh developer, sysadmin, dan media teknologi.

### 4. Pillar Audit & Anti-Pola Buruk: *"Domain Red Flags & Checklist Due Diligence Sebelum Mendaftarkan Nama Bisnis"*
- **Data D1**: `emd_pmd_match_type` (`os`, `of`, `ol`, `up`, `nn`), `character_cleanliness_score < 80`, dan proporsi domain yang jatuh ke kategori `brandable` (tak terpetakan kamus).
- **Isi Utama**: Mengungkap kesalahan penamaan paling umum di database nyata (tanda hubung ganda, pengulangan huruf `3x+`, angka tempelan, *keyword stuffing*), dipadukan dengan panduan audit riwayat Wayback Machine, profil backlink, dan pengecekan merek dagang.
- **Peran E-E-A-T & AdSense**: Memperkuat **Trustworthiness** karena melindungi pengguna dari kerugian registrasi domain berisiko—selaras dengan `disclaimer.html`.

### 5. Pillar Morfologi & Penamaan Bisnis: *"Pola Pembentukan Kata Majemuk & Akhiran Brand Terbaik di Berbagai Industri"*
- **Data D1**: `tags` (`business`, `ecommerce`, `tools`, `ai-tech`, `calculator`, `parenting-baby`, `geo-local`, `personal`), `sld`, `niche_clarity_score`, `brandability_score`.
- **Isi Utama**: Membedah struktur pembentuk nama yang konsisten meraih skor tinggi per sektor (mis. pola kata kerja + objek seperti `cek`/`hitung`/`scan`, sufiks kepemilikan `-ku`/`-mu` pada bahasa Indonesia, serta kombinasi 2 kata ringkas `<= 9` karakter).
- **Peran E-E-A-T & Linkbait**: Menjadi *evergreen playbook* rujukan bagi pendiri UMKM dan startup saat melakukan *brainstorming* nama brand.

### 6. Pillar SEO Internasional: *"Strategi ccTLD vs gTLD untuk Geotargeting & Ekspansi Multi-Bahasa (Analisis 8 Pasar)"*
- **Data D1**: `lang`, `extension`, `extension_lang_fit_score`, `tags` (`<lang>-tld`, `multilingual`).
- **Isi Utama**: Membandingkan dinamika ekstensi lokal (`.id`, `.co.id`, `.my.id`, `.de`, `.jp`, `.es`, `.com.br`, `.fr`, `.ru`) dengan gTLD (`.com`, `.io`, `.ai`, `.app`), serta panduan memilih ccTLD vs gTLD sesuai target audiens SERP Google.
- **Peran E-E-A-T**: Menguatkan *topical authority* di persimpangan topik **Domain Strategy + International SEO** (selaras dengan arsitektur 8 bahasa aplikasi).

### 7. Pillar Laporan Indeks Periodik: *"Indeks Kualitas & Kelangkaan Nama Domain (Laporan Kuartalan/Tahunan)"*
- **Data D1**: `checked_at` (*time-series*), `char_length`, `extension`, `tags`, `overall_heuristic_score`.
- **Isi Utama**: Laporan indeks berkala (mis. per kuartal) yang melacak perubahan rata-rata skor kualitas, niche mana (`ai-tech`, `ecommerce`, `tools`) yang variasi pendeknya makin langka, serta pergeseran tren ekstensi dari waktu ke waktu.
- **Peran E-E-A-T & Linkbait**: Laporan berarsip dari tahun ke tahun mengumpulkan backlink secara kumulatif dan memposisikan situs sebagai **sumber data primer** di industri domain.

---

## 7. Arsitektur Hub-and-Spoke & Query Tambahan untuk Pillar Articles

### A. Pola Hub-and-Spoke untuk Mengalirkan E-E-A-T di SERP
1. **Jangan jadikan halaman pillar sebagai katalog promosi domain**: Fokus pada edukasi, metodologi, analisis pola, dan data agregat.
2. **Sertakan sinyal E-E-A-T eksplisit pada tiap halaman pillar**:
   - Jumlah sampel (`N`) dan rentang tanggal pengambilan data (`checked_at`).
   - Tanggal publikasi & pembaruan artikel (*Last updated*).
   - Tautan langsung ke **Generator Utama (`/`)** sebagai bukti *first-hand experience* dan ke **Halaman Trust** (`about.html`, `disclaimer.html`, `privacy-policy.html`, `contact.html`).
3. **Internal Linking Terstruktur**: Tiap Pillar Article bertindak sebagai **Hub Topik** yang saling terhubung dengan artikel riset/kurasi turunan (*spoke*) dan alat interaktif, sehingga otoritas dari backlink eksternal mengalir merata ke seluruh domain.

### B. Contoh Query D1 Tambahan untuk Bahan Pillar Articles
```sql
-- 1. Distribusi skor pelafalan (untuk Pillar Metodologi & Linguistik Radio Test)
SELECT
  CASE
    WHEN pronunciation_comfort_score >= 85 THEN '85-100 (Sangat Lancar)'
    WHEN pronunciation_comfort_score >= 72 THEN '72-84 (Lolos Radio Test)'
    WHEN pronunciation_comfort_score >= 55 THEN '55-71 (Sedang/Agak Kaku)'
    ELSE '0-54 (Sulit Diucapkan)'
  END AS radio_test_tier,
  COUNT(*) AS total_domains,
  ROUND(AVG(brandability_score), 1) AS avg_brandability,
  ROUND(AVG(overall_heuristic_score), 1) AS avg_overall
FROM available_domains
WHERE pronunciation_comfort_score IS NOT NULL
GROUP BY radio_test_tier
ORDER BY avg_overall DESC;

-- 2. Proporsi metode pengecekan NS vs RDAP (untuk Pillar Infrastruktur DNS/RDAP)
SELECT
  check_method,
  check_source,
  COUNT(*) AS total_checks,
  ROUND(AVG(char_length), 1) AS avg_length
FROM available_domains
GROUP BY check_method, check_source
ORDER BY total_checks DESC;

-- 3. Tren bulanan kualitas domain tersedia (untuk Pillar Indeks Periodik)
SELECT
  strftime('%Y-%m', checked_at / 1000, 'unixepoch') AS month_utc,
  COUNT(*) AS total_logged,
  ROUND(AVG(char_length), 1) AS avg_length,
  ROUND(AVG(overall_heuristic_score), 1) AS avg_overall
FROM available_domains
GROUP BY month_utc
ORDER BY month_utc DESC;
```

---

## 8. Strategi URL Path & SEO Multilingual

Agar selaras dengan `scripts/site-builder.mjs`, redirect `_redirects` (`/en/*` -> `/*`), serta aturan *Clean URLs* Cloudflare Pages (yang me-redirect `.html` dengan status `308`), berikut standar URL path yang disarankan untuk seluruh artikel pillar, riset, kurasi, dan alat interaktif:

### A. Struktur Dasar & Pola Build (`200 OK` Tanpa Hop `308`)
- **Prefix Bahasa Konsisten**:
  - **English (`en`, default)**: berada di root tanpa prefix (`/guides/...`, `/research/...`, `/tools/...`).
  - **7 Bahasa Lain**: memakai prefix ISO 2-huruf (`/id/...`, `/es/...`, `/pt/...`, `/fr/...`, `/de/...`, `/ru/...`, `/ja/...`).
- **Format Direktori `.../index.html` + Trailing Slash (`/`)**:
  - Setiap artikel dibuild menjadi `dist/<path>/index.html` (contoh: `dist/guides/domain-scoring-methodology/index.html` dan `dist/id/guides/domain-scoring-methodology/index.html`).
  - Seluruh tag `canonical`, `hreflang`, `og:url`, tautan internal, dan `sitemap.xml` memakai **trailing slash (`/`)** yang sama sehingga langsung merespons `HTTP 200 OK` tanpa terkena redirect `308`.

### B. Peta Kategori URL (*Hub-and-Spoke* Maksimal 2 Level)
| Kategori | URL Hub Indeks (EN / ID) | Contoh URL Artikel | Peran SEO |
| --- | --- | --- | --- |
| **Pillar Articles** | `/guides/` & `/id/guides/` | `/guides/domain-scoring-methodology/`<br>`/guides/radio-test-brand-linguistics/`<br>`/guides/dns-ns-vs-rdap-availability/`<br>`/guides/domain-red-flags-due-diligence/`<br>`/guides/compound-word-morphology/`<br>`/guides/cctld-vs-gtld-international-seo/` | Penguatan E-E-A-T & rujukan metodologi/edukasi |
| **Studi Data, Indeks, & Kurasi** | `/research/` & `/id/research/` | `/research/tld-length-availability-study/`<br>`/research/emd-pmd-over-optimization-data/`<br>`/research/domain-quality-index-2026-q4/`<br>`/research/curated-ai-saas-domains/` | Magnet backlink (*data studies*) & kurasi editorial |
| **Alat Interaktif** | `/tools/` & `/id/tools/` | `/tools/domain-explorer/`<br>`/tools/radio-test-calculator/` | Utilitas *linkbait* berbasis data agregat D1 |

### C. Pemilihan Slug Multilingual: *Uniform ASCII Slugs* vs *Localized Slugs*
- **Opsi 1 — Uniform ASCII Slugs *(Direkomendasikan)***:
  - Prefix bahasa berubah, slug tetap seragam dalam ASCII Inggris (mis. `/guides/radio-test-brand-linguistics/` dan `/id/guides/radio-test-brand-linguistics/`), sementara `<title>`, `<meta description>`, `<h1>`, dan seluruh isi artikel 100% berbahasa lokal.
  - **Keunggulan**: Sinkronisasi otomatis `hreflang`, language switcher, dan `sitemap.xml` tanpa risiko broken link `404` atau URL ter-encode panjang (`%E3%83...`) pada bahasa non-Latin (`ja`, `ru`).
- **Opsi 2 — Localized ASCII Slugs *(Jika menargetkan kata kunci URL lokal)***:
  - Slug diterjemahkan dalam huruf ASCII/romaji per bahasa (mis. `/id/panduan/metodologi-radio-test/`), namun wajib memakai tabel peta `slugByLang` eksplisit di konfigurasi build agar `hreflang` dan language switcher tetap menunjuk ke pasangan halaman yang tepat (1-to-1).

### D. Aturan Teknis SEO Multilingual untuk Build & Sitemap
1. **Jangan Publikasikan Bahasa yang Belum Diterjemahkan**: Jika artikel baru tersedia untuk `en` dan `id` saja, build HTML, tag `hreflang`, dan entri `sitemap.xml` **hanya** untuk `en` dan `id` (+ `x-default` mengarah ke `en`). Jangan mencetak halaman `/es/...` berisi teks bahasa Inggris.
2. **Self-Referencing `canonical` + Bidirectional `hreflang`**: Setiap halaman bahasa menunjuk `canonical` ke URL dirinya sendiri dan mencantumkan seluruh versi bahasa aktif secara timbal balik.
3. **Language Switcher Kontekstual**: Jika pengguna berada di artikel yang belum memiliki terjemahan untuk bahasa target, arahkan ke halaman indeks `/<lang>/guides/` (atau `/<lang>/`), bukan ke URL `404`.
4. **Schema.org `TechArticle` / `Article` + `BreadcrumbList`**: Lengkapi JSON-LD tiap artikel dengan `inLanguage`, `datePublished`, `dateModified`, `author`/`publisher`, serta `BreadcrumbList` (`Home` -> `Guides/Research` -> `Judul Artikel`) untuk sinyal E-E-A-T di SERP.
5. **Akurasi `<lastmod>` di `sitemap.xml`**: Gunakan tanggal pembaruan aktual artikel (`dateModified`), bukan tanggal build massal yang selalu berubah setiap kali deploy.

---

## 9. Rancangan Arsitektur Direktori & Sumber Konten (`content/articles/`)

Agar artikel pillar, riset data D1, kurasi, dan alat interaktif terkelola rapi tanpa mencampuri halaman inti (`index.html`, `about.html`, `privacy-policy.html`, `terms.html`, `disclaimer.html`, `contact.html`) maupun halaman internal (`/admin-lexicon.html`), seluruh aset editorial dan builder ditempatkan di folder terpisah yang **tidak** di-copy langsung sebagai raw file ke `dist/`:

```text
/
├── content/
│   └── articles/
│       ├── manifest.json                         # Registry pusat semua artikel, section, slug, relasi, & status bahasa
│       ├── hubs.json                             # Copywriting judul, deskripsi, & SEO per bahasa untuk hub /guides/, /research/, /tools/
│       ├── data/                                 # (Opsional) Arsip snapshot JSON hasil query agregat D1
│       ├── guides/
│       │   ├── rfc-1035-domain-compliance/       # Pillar terbit (8 bahasa)
│       │   ├── no-tracking-privacy-architecture/ # Pillar terbit (8 bahasa)
│       │   ├── offline-browser-domain-generator/ # Pillar terbit (8 bahasa)
│       │   └── domain-scoring-methodology/       # (Rencana) Contoh folder pillar tambahan
│       ├── research/                             # (Rencana) Folder studi data & kurasi niche
│       └── tools/                                # (Rencana) Folder halaman alat interaktif
├── public/
│   ├── doku.writing.md                           # Panduan penulisan & publikasi artikel (live readable)
│   └── doku.article.md                           # Dokumen strategi konten & arsitektur ini (live readable)
├── templates/
│   ├── article.html                              # Template HTML artikel (berisi marker SITE_CONFIG:HEAD_START/END)
│   └── article-hub.html                          # Template HTML halaman indeks kategori (/guides/, /research/, /tools/)
└── scripts/
    ├── site-builder.mjs                          # Helper existing + validateArticleManifest(), renderArticlePage(), renderArticleHubPage(), & buildSitemapXml()
    └── build-static.mjs                          # Memanggil static pages + loop render semua hub & artikel ke dist/
```

**Aturan Isolasi Direktori:**
- `server.js` **wajib memblokir** akses publik langsung ke `/content/*` dan `/templates/*` (selain `/lib`, `/functions`, `/migrations`, `/scripts`), sehingga pengunjung hanya mengakses HTML hasil render.
- `scripts/build-static.mjs` hanya menulis output HTML final ke `dist/`, menyalin `dist/assets/`, serta menyalin file dokumentasi Markdown dari `public/` ke `dist/public/`. File sumber `.json`/template mentah di `content/` dan `templates/` tidak pernah ikut ter-deploy ke `dist/`.

---

## 10. Konvensi Skema `manifest.json` & Kontrak Data per Bahasa

### A. Skema Pusat `content/articles/manifest.json`
Setiap artikel didaftarkan sebagai satu objek di array `articles`. Bahasa yang belum siap **jangan** dimasukkan ke `locales` (atau set `"published": false`).

```json
{
  "schemaVersion": 1,
  "sections": ["guides", "research", "tools"],
  "articles": [
    {
      "id": "domain-scoring-methodology",
      "section": "guides",
      "defaultSlug": "domain-scoring-methodology",
      "slugByLang": {},
      "articleType": "TechArticle",
      "isPillar": true,
      "datePublished": "2026-11-20",
      "dateModified": "2026-11-24",
      "author": {
        "name": "Tim Riset Domain Name",
        "role": "Domain Linguistics & DNS Research",
        "url": "/about.html"
      },
      "dataSnapshot": {
        "file": "domain-quality-index-2026-q4.json",
        "table": "available_domains",
        "sampleSize": 18420,
        "dateRange": "2026-09-01 to 2026-11-20"
      },
      "relatedIds": [
        "radio-test-brand-linguistics",
        "tld-length-availability-study",
        "domain-red-flags-due-diligence"
      ],
      "locales": {
        "en": {
          "published": true,
          "title": "Domain Quality Scoring Methodology: Length, Flow & Lexicon",
          "metaDesc": "Technical breakdown of how overall_heuristic_score, structure_length_score, and hyphen signals evaluate brandable domain names.",
          "keywords": "domain quality score, brandable domain metrics, domain heuristics, RFC 1035",
          "h1": "Domain Quality Scoring Methodology (0–100 Scale)",
          "excerpt": "How length, syllable balance, TLD context, and lexical decomposition combine into overall_heuristic_score."
        },
        "id": {
          "published": true,
          "title": "Metodologi Skor Kualitas Domain: Panjang, Fonetik & Leksikon",
          "metaDesc": "Penjelasan teknis bagaimana overall_heuristic_score, char_length, dan sinyal tanda hubung menilai kualitas nama domain.",
          "keywords": "skor kualitas domain, metodologi penilaian domain, domain brandable, riset domain",
          "h1": "Metodologi Skor Kualitas Domain (Skala 0–100)",
          "excerpt": "Cara kerja kombinasi panjang SLD, keseimbangan suku kata, konteks TLD, dan pemisahan kata leksikon."
        },
        "es": {
          "published": false
        }
      }
    }
  ]
}
```

### B. Kontrak File Konten Artikel (`content/articles/<section>/<id>/<lang>.json`)
Setiap pasangan `<id>` dan `<lang>` yang memiliki `"published": true` wajib memiliki file JSON konten dengan struktur terstandar agar template mudah merender TOC, *Key Takeaways*, tabel data D1, serta FAQ:

```json
{
  "id": "domain-scoring-methodology",
  "lang": "id",
  "readingTimeMinutes": 8,
  "breadcrumbLabel": "Metodologi Skor Domain",
  "keyTakeaways": [
    "Skor 0–100 (overall_heuristic_score) dihitung deterministik dari 7 sub-skor termasuk panjang SLD dan pelafalan.",
    "Domain 1–2 kata tanpa tanda hubung rata-rata mencatat overall_heuristic_score lebih tinggi.",
    "Pemisahan kata per bahasa mencegah false-positive pada kata majemuk lokal."
  ],
  "sections": [
    {
      "anchor": "ringkasan-model-penilaian",
      "heading": "1. Ringkasan Model Penilaian Deterministik",
      "paragraphs": [
        "Paragraf editorial mendalam minimal 80–120 kata per sub-bagian..."
      ],
      "table": {
        "caption": "Distribusi Skor Berdasarkan Panjang SLD (Sampel D1 N = 18.420)",
        "headers": ["Rentang Panjang SLD", "Jumlah Sampel", "Rata-rata overall_heuristic_score"],
        "rows": [
          ["4–7 karakter", "2.140", "81.4"],
          ["8–12 karakter", "9.850", "72.8"]
        ]
      }
    }
  ],
  "methodologyNote": "Seluruh angka agregat dihitung dari tabel available_domains menggunakan kueri GROUP BY tanpa menampilkan domain sensitif pengguna secara mentah tanpa kurasi.",
  "faqs": [
    {
      "q": "Apakah skor kualitas domain tinggi menjamin peringkat #1 di Google?",
      "a": "Tidak. overall_heuristic_score mengukur kualitas linguistik dan struktur nama domain, sedangkan peringkat SERP tetap ditentukan oleh kualitas konten, otoritas, dan relevansi."
    }
  ]
}
```

**Aturan Validasi Konten:**
1. Nilai `slug` (baik `defaultSlug` maupun `slugByLang[lang]`) **wajib** memenuhi regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` (lowercase ASCII, tanpa spasi, tanpa underscore, tanpa ekstensi `.html`).
2. `section` hanya boleh bernilai `"guides"`, `"research"`, atau `"tools"`.
3. `articleType` hanya boleh `"TechArticle"` (panduan teknis/metodologi), `"Article"` (studi data/kurasi), atau `"WebApplication"` (halaman alat interaktif).
4. Jika `locales[lang].published !== true`, build **wajib melewatinya** (tidak membuat file HTML di `dist/`, tidak memasukkan ke `hreflang`, dan tidak memasukkan ke `sitemap.xml`).

---

## 11. Konvensi Routing, Build Output (`dist/`), & Sinkronisasi `server.js`

Seluruh artikel dan halaman hub menggunakan pola direktori `.../index.html` agar selaras dengan *Clean URLs* Cloudflare Pages (tanpa memicu hop redirect `308`).

### A. Peta Output Build Statis (`dist/`)
| Jenis Halaman | Bahasa | Output File di `dist/` | URL Publik Kanonik |
| --- | --- | --- | --- |
| Hub Kategori | `en` (default) | `dist/<section>/index.html` | `/guides/`, `/research/`, `/tools/` |
| Hub Kategori | non-`en` (`id`, dll.) | `dist/<lang>/<section>/index.html` | `/id/guides/`, `/id/research/`, `/id/tools/` |
| Artikel / Tool | `en` (default) | `dist/<section>/<slug>/index.html` | `/guides/domain-scoring-methodology/` |
| Artikel / Tool | non-`en` (`id`, dll.) | `dist/<lang>/<section>/<slug>/index.html` | `/id/guides/domain-scoring-methodology/` |

### B. Aturan Redirect & Normalisasi URL
1. **Prefix `/en/*` (`dist/_redirects` & `server.js`)**: Aturan existing di `buildCloudflareRedirects()` (`/en/* /:splat 301`) secara otomatis mengarahkan `/en/guides/...` ke `/guides/...` dengan status `301`.
2. **Enforce Trailing Slash di `server.js` (Express Preview)**:
   - Request tanpa trailing slash (`/guides/domain-scoring-methodology` atau `/id/guides`) di-redirect `301` ke versi dengan trailing slash (`/guides/domain-scoring-methodology/` atau `/id/guides/`).
   - Request dengan `/index.html` di akhir path (`/guides/domain-scoring-methodology/index.html`) di-redirect `301` ke `/guides/domain-scoring-methodology/` agar perilaku preview lokal identik dengan produksi Cloudflare Pages.
3. **Header Cache (`dist/_headers`)**:
   - Halaman HTML artikel tetap memakai header keamanan global (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`).
   - File aset statis (`/assets/*`) memakai cache panjang `public, max-age=86400, stale-while-revalidate=604800`, sedangkan file XML/TXT (`/sitemap.xml`, `/robots.txt`, `/ads.txt`) memakai `max-age=3600`.
4. **Placeholder Config Situs Wajib di Template**:
   - `templates/article.html` dan `templates/article-hub.html` **wajib** mempertahankan komentar marker `<!-- SITE_CONFIG:HEAD_START -->` dan `<!-- SITE_CONFIG:HEAD_END -->` agar `buildHeadTags(config)` di `scripts/site-builder.mjs` tetap menyuntikkan tag verifikasi GSC/Bing/Yandex/Ahrefs, GA4, dan meta AdSense secara otomatis, serta mengganti fallback URL `https://domainname.web.id` jika `site.config.json` berubah.

---

## 12. Konvensi Template `<head>` SEO & Schema.org JSON-LD Artikel

Setiap halaman artikel yang dirender wajib menghasilkan blok `<head>` lengkap berikut (disesuaikan per bahasa aktif):

### A. Tag Meta, Canonical, & `hreflang`
```html
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Metodologi Skor Kualitas Domain (Skala 0–100) — Domain Name</title>
  <meta name="description" content="Penjelasan teknis bagaimana overall_heuristic_score..." />
  <meta name="keywords" content="skor kualitas domain, metodologi penilaian domain..." />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />

  <!-- Self-referencing canonical wajib memakai trailing slash -->
  <link rel="canonical" href="https://domainname.web.id/id/guides/domain-scoring-methodology/" />

  <!-- Bidirectional hreflang: HANYA untuk bahasa yang published: true -->
  <link rel="alternate" hreflang="en" href="https://domainname.web.id/guides/domain-scoring-methodology/" />
  <link rel="alternate" hreflang="id" href="https://domainname.web.id/id/guides/domain-scoring-methodology/" />
  <link rel="alternate" hreflang="x-default" href="https://domainname.web.id/guides/domain-scoring-methodology/" />

  <!-- Open Graph Artikel -->
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:site_name" content="Domain Name — domainname.web.id" />
  <meta property="og:title" content="Metodologi Skor Kualitas Domain (Skala 0–100)" />
  <meta property="og:description" content="Penjelasan teknis bagaimana overall_heuristic_score..." />
  <meta property="og:url" content="https://domainname.web.id/id/guides/domain-scoring-methodology/" />
  <meta property="article:published_time" content="2026-11-20T00:00:00Z" />
  <meta property="article:modified_time" content="2026-11-24T00:00:00Z" />
  <meta property="article:section" content="Guides" />

  <!-- SITE_CONFIG:HEAD_START -->
  <!-- SITE_CONFIG:HEAD_END -->
</head>
```

### B. Template Schema.org JSON-LD (`@graph`)
Setiap artikel menyertakan satu blok `<script type="application/ld+json">` berisi `@graph` dengan 3 entitas inti untuk sinyal E-E-A-T dan *Breadcrumb Rich Result*:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechArticle",
      "@id": "https://domainname.web.id/id/guides/domain-scoring-methodology/#article",
      "mainEntityOfPage": "https://domainname.web.id/id/guides/domain-scoring-methodology/",
      "headline": "Metodologi Skor Kualitas Domain (Skala 0–100)",
      "description": "Penjelasan teknis bagaimana overall_heuristic_score, char_length, dan sinyal tanda hubung menilai kualitas nama domain.",
      "inLanguage": "id",
      "datePublished": "2026-11-20",
      "dateModified": "2026-11-24",
      "author": {
        "@type": "Organization",
        "name": "Tim Riset Domain Name",
        "url": "https://domainname.web.id/id/about.html"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Domain Name",
        "url": "https://domainname.web.id/"
      },
      "isPartOf": {
        "@type": "WebSite",
        "name": "Domain Name",
        "url": "https://domainname.web.id/"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://domainname.web.id/id/guides/domain-scoring-methodology/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Beranda", "item": "https://domainname.web.id/id/" },
        { "@type": "ListItem", "position": 2, "name": "Panduan", "item": "https://domainname.web.id/id/guides/" },
        { "@type": "ListItem", "position": 3, "name": "Metodologi Skor Domain", "item": "https://domainname.web.id/id/guides/domain-scoring-methodology/" }
      ]
    }
  ]
}
```
*(Catatan: Jika artikel memiliki daftar `faqs` minimal 2 butir, tambahkan node `FAQPage` ke dalam `@graph` yang sama.)*

---

## 13. Konvensi Struktur Halaman Artikel, E-E-A-T, & Kepatuhan AdSense

### A. Urutan Blok Wajib di Body Artikel (`templates/article.html`)
1. **Top Navigation Bar & Language Switcher**:
   - Tautan kembali ke Generator (`/` atau `/<lang>/`), Hub (`/guides/`, `/research/`), dan *Trust Pages* (`about.html`, `contact.html`).
   - **Aturan Fallback Language Switcher**: Saat pengguna memilih bahasa tujuan `targetLang`:
     1. Jika artikel aktif memiliki versi `published: true` pada `targetLang` -> arahkan ke URL artikel tersebut.
     2. Jika belum ada terjemahannya -> arahkan ke hub `/<targetLang>/<section>/` (jika hub tersedia), atau fallback aman ke `/<targetLang>/`. **Jangan pernah** mengarahkan ke URL `404`.
2. **Breadcrumb Nav**: `Home > Guides/Research/Tools > Judul Singkat`.
3. **Header Artikel & Bar Metadata E-E-A-T**:
   - Satu `<h1>` utama.
   - Metadata eksplisit: Penulis/Tim Riset (tautan ke `/about.html` lokal), Tanggal Terbit (`datePublished`), Terakhir Diperbarui (`dateModified`), serta lencana cakupan dataset jika memakai data D1 (contoh: `Dataset: available_domains · N = 18.420 · Periode Sep–Nov 2026`).
4. **Kotak Ringkasan (*Key Takeaways*)**: 3–5 poin inti berbasis data/metodologi agar pembaca dan crawler langsung menangkap nilai artikel.
5. **Daftar Isi (*Table of Contents*)**: Tautan anchor `#...` ke seluruh `<h2>` utama.
6. **Isi Editorial + Tabel/Visualisasi Data**:
   - Minimal **800–1.500 kata** editorial terstruktur (`<h2>`, `<h3>`, paragraf analisis, studi kasus baik vs buruk).
   - Untuk konten berbasiskan data `available_domains`, wajib menyertakan kotak **Catatan Metodologi & Keterbatasan Data** (menjelaskan perbedaan status `available` DNS/RDAP, ukuran sampel, dan ketidakpastian harga registrasi aktual).
7. **Blok Hub-and-Spoke (*Baca Juga & Alat Terkait*)**:
   - Minimal 2 tautan internal ke artikel pillar/riset lain dalam bahasa yang sama.
   - 1 CTA kontekstual menuju generator utama (`/` atau `/<lang>/`) atau alat interaktif (`/tools/domain-explorer/`).
8. **Footer Kepatuhan (*Trust Pages*)**:
   - Wajib memuat tautan lokal ke `about.html`, `privacy-policy.html`, `terms.html`, `disclaimer.html`, dan `contact.html` sesuai konvensi `assets/trust-i18n.js`.

### B. Disiplin Penempatan Iklan AdSense (Non-Auto Ads)
Selaras dengan konfigurasi `site.config.json` (`"enableAutoAdsScript": false`) dan kebijakan tata letak di `doku.md`:
- **Tanpa Auto Ads**: Jangan menyuntikkan skrip `adsbygoogle` dengan parameter Auto Ads global yang memecah struktur *above-the-fold* atau menempel di dalam tabel data.
- **Maksimal 2 Slot Manual per Artikel Panjang**:
  - Slot 1: Setelah blok *Key Takeaways* / di antara sub-bagian editorial ke-2 dan ke-3 (memiliki jarak margin vertikal minimal `24px` dari judul/tabel).
  - Slot 2: Di bawah isi editorial utama (sebelum blok *Baca Juga / Footer*).
- **Halaman Hub Indeks (`/guides/`, `/research/`, `/tools/`) & Halaman Pendek**: **0 slot iklan** apabila halaman hanya berisi daftar kartu ringkasan dan belum memiliki minimal 500 kata narasi pengantar editorial, guna menghindari pelanggaran *Valuable Inventory: Scraped/Thin Content*.
- **Halaman `/admin-lexicon` dan `/api/*`**: Dilarang keras memuat skrip AdSense atau analytics publik.

---

## 14. Konvensi `sitemap.xml` & Checklist Validasi Build Otomatis

### A. Aturan Pembuatan `sitemap.xml` (`buildSitemapXml`)
Extend `buildSitemapXml(config)` di `scripts/site-builder.mjs` agar menggabungkan 3 kelompok URL dalam urutan prioritas:
1. **Generator Utama & Halaman Inti**:
   - `/` (`priority: 1.0`) dan `/<lang>/` (`0.9`).
   - Trust pages (`about.html`, `privacy-policy.html`, `terms.html`, `disclaimer.html`, `contact.html`) dengan `priority: 0.6` (`en`) / `0.5` (non-`en`).
2. **Halaman Hub Kategori** (`/guides/`, `/research/`, `/tools/`):
   - Hanya dicetak untuk bahasa yang memiliki minimal 1 artikel `published: true` di kategori tersebut.
   - `priority`: `0.8` (`en`) / `0.7` (non-`en`), `changefreq: weekly`.
   - `<lastmod>`: tanggal `dateModified` terbaru dari artikel di dalam hub tersebut (bukan `new Date()` build).
3. **Halaman Artikel & Alat Interaktif**:
   - Hanya dicetak untuk bahasa dengan `locales[lang].published === true`.
   - `priority`: `0.8` (`en` pillar) / `0.7` (non-`en` pillar & `en` research/tool) / `0.6` (non-`en` research/tool).
   - `changefreq`: `monthly` untuk panduan/riset yang stabil, `weekly` untuk studi/indeks yang diperbarui berkala.
   - `<lastmod>`: wajib diambil langsung dari `article.dateModified` di `manifest.json`.
   - `<xhtml:link rel="alternate">`: hanya mendaftarkan bahasa yang berstatus `published: true` pada artikel tersebut (+ `x-default` mengarah ke URL `en`).

### B. Checklist Validasi Build Sebelum Deploy (`npm run build`)
Sebelum hasil build `dist/` di-push ke Cloudflare Pages, `validateArticleManifest()` di `scripts/site-builder.mjs` bersama pemeriksaan QA rilis memeriksa syarat berikut (kegagalan validasi manifest menghentikan build dengan exit code non-zero):
1. **Integritas Manifest & File Konten**: `schemaVersion === 1`, seluruh entri `published: true` memiliki `title`, `metaDesc`, dan `h1` terisi (ideal `title` 30–65 karakter, `metaDesc` 70–160 karakter), `dateModified >= datePublished`, serta file `<lang>.json` valid dengan minimal 1 item di `sections[]`.
2. **Anti-Duplikat & Format Slug**: Tidak ada tabrakan URL output antar artikel pada `(lang, section, slug)` yang sama; seluruh `id` dan `slug` cocok dengan `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
3. **Simetri Bidirectional `hreflang` & Trailing Slash**: Setiap URL yang tercantum di tag `<link rel="alternate">` pada halaman HTML maupun di `sitemap.xml` benar-benar ada di `dist/<path>/index.html` dan diakhiri `/`.
4. **Kebersihan Output `dist/`**: Pastikan `dist/admin-lexicon.html`, `dist/content/`, `dist/templates/`, serta file rahasia (`.admin-auth.json`, `.env`) **tidak** ada di dalam folder `dist/`.
5. **Validitas Syntax & Build**: Menjalankan `npm run lint` dan `npm run build` tanpa error sebelum deploy.

---

## Status Implementasi Saat Ini
1. **Struktur Konten & Template HTML**:
   - `content/articles/manifest.json` aktif mengelola 3 artikel pillar E-E-A-T terbit di `content/articles/guides/` (`rfc-1035-domain-compliance`, `no-tracking-privacy-architecture`, `offline-browser-domain-generator`) dalam 8 bahasa.
   - `content/articles/hubs.json` berisi copywriting lokal 8 bahasa (`en`, `id`, `es`, `pt`, `fr`, `de`, `ru`, `ja`) untuk halaman hub `/guides/` (label nav **Articles**/**Artikel**), `/research/`, dan `/tools/`.
   - Template (`templates/article.html` & `templates/article-hub.html`) mendukung `<head>` SEO lengkap (`canonical` trailing slash, `hreflang`, Open Graph artikel), JSON-LD `@graph`, bar metadata E-E-A-T, Key Takeaways, TOC otomatis, tabel/callout/kode, catatan metodologi, Hub-and-Spoke Related Articles, dan maksimal 2 slot AdSense manual kondisional.
2. **Builder & Sitemap (`scripts/site-builder.mjs` & `scripts/build-static.mjs`)**:
   - Menyediakan `loadArticleManifest`, `loadArticleHubs`, `validateArticleManifest`, `findPublishedArticleByRoute`, `getPublishedArticlesForHub`, `getActiveArticleHubs`, `renderArticlePage`, dan `renderArticleHubPage`.
   - `buildSitemapXml` otomatis menyertakan hub kategori aktif dan artikel `published: true` dengan `<lastmod>` dari `dateModified`.
   - `scripts/build-static.mjs` memvalidasi manifest terlebih dahulu sebelum merender halaman statis inti, 24 halaman hub kategori (`dist/<section>/index.html` & `dist/<lang>/<section>/index.html`), seluruh artikel terbit, serta menyalin dokumentasi `/public/*.md` ke `dist/public/`.
3. **Routing Express (`server.js`)**:
   - Menyediakan route untuk hub dan artikel pada bahasa default (`/<section>/`, `/<section>/<slug>/`) dan 7 bahasa lain (`/<lang>/<section>/`, `/<lang>/<section>/<slug>/`).
   - Menegakkan redirect `301` untuk `/en/<section>...` -> `/<section>...`, normalisasi non-trailing slash -> trailing `/`, serta `/index.html` -> `/`.
   - Memblokir akses publik langsung ke `/content/*` dan `/templates/*` (`404`), serta menyajikan `/public/doku.writing.md` dan `/public/doku.article.md` agar bisa dibaca live di browser.
4. **Panduan Penulisan Artikel (`/public/doku.writing.md`)**:
   - Menyediakan alur kerja publikasi dari query D1 ke build `dist/`, panduan penulisan spesifik untuk Studi Data & Statistik, Kurasi Niche Editorial, Alat Interaktif, 7 Pillar Articles E-E-A-T, dan Hub Kategori, referensi field JSON konten, standar lokalisasi 8 bahasa, serta checklist QC pra-publikasi.
