# Audit & Rencana Modernisasi — portofolio-ary-api

| | |
|---|---|
| **Tanggal** | 11 November 2026 |
| **Branch** | `modernisasi-api` |
| **Status** | Draf untuk ditinjau — **belum ada kode yang diubah** |
| **Panduan gaya** | `docs/CODE_STYLE.md` |

Label: ✅ terverifikasi dari kode/konfigurasi · ⚠️ **tidak bisa diverifikasi dari
repo** (perlu dicek di server/oleh pemilik) · 📚 berdasarkan pengetahuan umum
saya, bukan isi repo (mohon dicek ulang sebelum dijadikan dasar keputusan).

---

## 0. Ruang lingkup & bahan

Dibaca: `package.json`, `package-lock.json` (via `npm ls`/`npm audit`), seluruh
`src/`, `config/`, `models/`, `migrations/`, `seeders/`, 10 file tes,
`docs/openapi.yaml`, `docs/index.html`, `docs/Testing.md`,
`docs/Commit-convention.md`, `docs/design/DESIGN.md`, `docs/design/API.md`,
`README.md`, `.gitignore`, `.vscode/settings.json`. Dari `.env`, `.env.example`,
`.env.test` hanya **nama kunci** yang diambil (nilainya disensor, tidak ditampilkan).

Perintah yang dijalankan (read-only): `npm ls`, `npm outdated`, `npm audit`,
`npx jest` (hasil: **10 suite, 40 tes, semua lulus**, ±2,5 dtk).

**File yang diminta tetapi tidak ada di repo:**
- `docs/baseline.txt` — tidak ditemukan di mana pun.
- `REQUIREMENTS.md` — tidak ditemukan. Kebutuhan UI diambil dari
  `docs/design/API.md` (§1–§13, diturunkan dari desain FigCraft) dan
  `docs/design/DESIGN.md` (§4 portofolio, §7 admin, §9b state). Bila ada
  REQUIREMENTS.md terpisah, §4 dokumen ini perlu dicocokkan ulang.
- `docker-compose.yml` — tidak ada; topologi deploy (reverse proxy, domain,
  versi image DB/MinIO) ⚠️ tidak bisa diverifikasi.
- `docs/DESIGN.md` dan `docs/API.md` sebenarnya berada di `docs/design/`.

---

## Status perbaikan (diperbarui 11 November 2026)

| Butir | Status |
|---|---|
| D1 Node 26 LTS | ✅ `.nvmrc`, `engines` |
| D2 hapi 21.4.13 · D3 joi 18.3.2 · mysql2/jest/dotenv-cli minor · `npm audit fix` (moment, fast-xml-parser) | ✅ audit produksi tersisa D4/D5 saja |
| D6 hapus `save` · D7 `@hapi/boom` eksplisit | ✅ |
| C1 blok `production` di `config/config.js` | ✅ server start di `NODE_ENV=production` |
| C2 bug `enabled` di `UpdateSocialMedia` | ✅ + 2 tes |
| C3 urutan hapus di `DeleteSkill` | ⏸ ditahan — tes yang ada sengaja mengunci urutan file→DB; menunggu keputusan pemilik |
| C6 handler: `GetSkill` use-case, hapus `errorResponse`/import mati/cek ganda | ✅ |
| C7 hapus `models/index.js`, `src/use-cases/register.js` | ✅ |
| C8 `src/config.js` tervalidasi Joi, `createServer()` + `src/index.js`, graceful shutdown | ✅ |
| C10 seeder `linkedin` huruf kecil | ✅ (instalasi baru) |
| S5 header keamanan (`routes.security`) | ✅ diuji di `skills/routes.test.js` |
| S8 bcrypt cost 12 · S11 email admin dari `ADMIN_EMAIL`, fixture `admin@example.com` | ✅ (seeder untuk instalasi baru) |
| S12 `.env.example` lengkap | ✅ 19 kunci, nilai contoh palsu (komentar/`DATABASE_URL` sisa Prisma di `.env` pribadi Anda masih perlu dibersihkan manual) |
| ESLint + Prettier | ✅ konfigurasi & lint bersih; format massal (`npm run format`) menunggu commit `style:` terpisah |
| C3 urutan hapus di `DeleteSkill` | ✅ diputuskan: DB dulu, file best-effort + log warning (tes diperbarui) |
| **M1** prefix `/api/v1` (K9: endpoint lama langsung dipindah) | ✅ |
| **M1** envelope `{ data }`, presenter snake_case eksplisit (K4) — juga menutup C9 untuk resource yang ada | ✅ |
| **M1** format error `{ error: { code, message, details? } }`, `ClientError`, `failAction` per field, pesan Inggris (K10) | ✅ |
| **M1** CORS via `CORS_ORIGINS` (kosong = mati), `GET /api/v1/health` (503 bila DB mati), `hapi-pino` + `redact`, logger di `DeleteSkill` | ✅ |
| Tes (M1) | 74: use-case + route semua plugin + perilaku lintas route (404, 500 tidak bocor, header, CORS, 413) |
| C11 `docs/openapi.yaml` disinkronkan (hanya endpoint yang ada, snake_case, format error baru) | ✅ dijaga tes kontrak `test/contract/openapi.test.js`: route↔dokumen, skema respons, dan cakupan setiap status |
| Bug baru: upload logo tanpa field `logo` → 500 | ✅ jadi 400 `VALIDATION_ERROR` (validasi payload multipart) + tes regresi |
| Lint Redocly untuk `openapi.yaml` | ⏳ belum dijalankan (unduhan paket eksternal ditolak di sesi ini) — jalankan manual: `npx @redocly/cli lint docs/openapi.yaml` |
| **M2** login dengan `username` (K5) di `/api/v1/admin/auth/login`; `email` tetap tersimpan | ✅ kode + migrasi `add_username_to_users` — dijalankan di DB tes & utama 11 Nov 2026 |
| **M2** refresh token di cookie (K6): `refresh`, `logout`, `me`, rotasi + deteksi pemakaian ulang, hanya hash SHA-256 di DB | ✅ kode + migrasi `create_refresh_tokens_table` — dijalankan di DB tes & utama 11 Nov 2026; uji ujung-ke-ujung 19/19 di DB tes |
| S6 JWT tanpa revokasi | ✅ access token pendek (disarankan 900 dtk) + refresh token yang bisa dicabut |
| S8 bcrypt cost 12 untuk akun yang sudah ada | ✅ rehash otomatis saat login berhasil |
| S9 enumerasi via timing | ✅ bcrypt tetap dijalankan dengan hash palsu bila username tidak ada |
| Verifikasi DB (8.1, 8.5) | ✅ MariaDB 11.4.12, utf8mb4/uca1400; data: 1 user, 2 skill, 5 social media. `SequelizeMeta` semula kosong (tabel dibuat sebelum sequelize-cli) — aman karena `createTable` memakai `IF NOT EXISTS` dan struktur identik dengan migrasi |
| Backup sebelum migrasi M2 | ✅ `~/backups/portofolio-ary-api/portfolio_db-20261111-0810-sebelum-migrasi-M2.sql` (izin 600) |
| Database tes `portfolio_test_db` | ✅ dibuat pemilik; dipakai untuk uji migrasi & e2e (berisi data palsu) |
| User DB aplikasi `ary@%` punya `ALL PRIVILEGES` | ⏳ M7: pisahkan user aplikasi (DML saja) dan user migrasi |
| S1 rate limit login (K11b) | ➡️ dipindah ke reverse proxy — contoh konfigurasi di §5.6; **belum terpasang** |
| **M3** tabel baru `media`, `profile`, `skill_categories`, `projects`, `organizations`, `positions` + seed konten | ✅ diuji di DB tes (maju/mundur, 16 constraint); ✅ dijalankan di `portfolio_db` 11 Nov 2026 setelah backup `portfolio_db-20261111-0953-sebelum-migrasi-M3.sql`; smoke test endpoint admin & lama OK |
| **M5 (bagian 1)** admin profile: `GET/PATCH /admin/profile` | ✅ |
| **M5 (bagian 1)** admin timeline: CRUD organizations & positions + reorder; aturan API.md §3 per field; urutan §6; `type_label`/`period_label` | ✅ |
| **M5 (bagian 2)** admin skill categories: CRUD + reorder (409 nama duplikat) | ✅ — `skill_count` & 409 "masih berisi skill" menyusul di bagian 3 (butuh `skills.category_id`) |
| **M5 (bagian 2)** admin projects: CRUD + reorder + paginasi; `show_button` ⇒ link https, terbit ⇒ `image_id` yang ada | ✅ — URL gambar & varian menyusul di M4; project baru bisa terbit setelah upload tersedia |
| **M6** publik: `GET /portfolio`, `/profile`, `/projects`, `/projects/{id}`, `/timeline`, `/social-links` — hanya data terbit; `Cache-Control` publik + `ETag`/304 | ✅ — `skills` per kategori di `/portfolio` menyusul bagian 3; gambar project menyusul M4; social links sementara dari `social_media` (hanya yang aktif, platform dinormalkan huruf kecil) |
| S7 data non-publik bocor di endpoint publik | ✅ semua endpoint publik hanya menampilkan data terbit (endpoint lama dihapus di M5 bagian 3) |
| **M4** `POST /admin/uploads?kind=` + `DELETE /admin/uploads/{id}`: tipe dari isi file (S3), WebP multi-ukuran, EXIF dibuang, batas 36 MP, SVG disanitasi hanya untuk logo (K7, S2), object key (C5), `Cache-Control: immutable`, rollback objek bila gagal | ✅ unit (sharp/DOMPurify sungguhan) + route + kontrak |
| **M4** gambar di respons project & profile (`image`/`photo` + varian), `PATCH /admin/profile` `photo_id` (K13), validasi jenis media | ✅ |
| **M4** `npm run media:cleanup` (media yatim > 24 jam) | ✅ — **jadwalkan via cron** saat deploy (M7) |
| **M4** tes integrasi MinIO (`test/integration/media.flow.test.js`, prefix `it-test/`) | ✅ lulus terhadap MinIO lokal; bucket bersih setelah tes. **Menemukan bug `isReferenced`** (Sequelize membuang `NOT` pada `Op.not` + literal → media yang dipakai bisa terhapus) — diperbaiki + tes repository langsung |
| S10 kebijakan bucket MinIO **lokal** | ✅ 11 Nov 2026: semula anonim boleh `PutObject`/`DeleteObject`/`ListBucket`; pemilik mengganti ke `s3:GetObject` saja. Terverifikasi: anonim PUT/DELETE/list → 403, GET gambar tetap 200, 43 tes integrasi lulus. ⏳ MinIO di server lain (bila ada) perlu dicek dengan cara sama |
| Endpoint lama `POST /skills/{id}/logo` | ✅ dihapus di M5 bagian 3 (diganti `POST /admin/uploads?kind=skill_logo`) |
| Jest + jsdom 31 | `npm test` memakai `NODE_OPTIONS=--experimental-vm-modules` karena dependensi jsdom ESM-only; runtime Node 26 memuatnya native |
| **M5 (bagian 3)** skills: `category_id` (FK RESTRICT), `sort_order`, logo via media (`skill_logo`), `is_published` (terbit ⇒ logo), nama unik per kategori; `description` (K14) & `logo_url` dihapus | ✅ kode + migrasi diuji di DB tes (maju/mundur/maju, gladi data produksi); ✅ dijalankan di `portfolio_db` 11 Nov 2026 setelah backup `portfolio_db-20261111-1150-sebelum-migrasi-M5c.sql`; 2 skill uji "HTML" dihapus, 5 skill desain di-seed |
| **M5 (bagian 3)** admin `/admin/skills` CRUD + reorder per kategori; kategori: `skill_count` + DELETE 409 bila berisi skill | ✅ |
| **M5 (bagian 3)** `social_links` menggantikan `social_media` (data disalin: lowercase, `twitter`→`x`, urutan dipertahankan; `username` dibuang); admin `/admin/social-links` CRUD + reorder; label kustom / default platform | ✅ — memperbaiki C10 (`linkedIn`) di level data |
| **M5 (bagian 3)** publik `GET /skills` per kategori; `/portfolio` kini memuat `skills`; endpoint lama `/skills*`, `/skills/{id}/logo`, `/profile/social-media*` dihapus (K9) | ✅ — menutup S3 lama & S7 sepenuhnya |
| Aset desain (`docs/design/asset`) diunggah lewat use-case ke `portfolio_db` + MinIO lokal | ✅ 5 logo skill (PNG tersisip di SVG Figma, 250–1129 px) → 5 skill **terbit**; `Photo.png` → foto profil; 3 gambar project → project dummy (tetap draf). ⚠️ gambar project hanya 344×200 px — varian 800/1200 tetap 344 px; sediakan versi ≥ 1200 px untuk kualitas layar besar |
| Upload SVG yang hanya membungkus bitmap (`<image href="data:image/...">`, pola ekspor Figma) | ✅ kini ditolak 415 dengan pesan jelas (sebelumnya tersimpan sebagai logo kosong setelah sanitasi) |
| Tes perakitan container asli (`src/infrastructure/container.test.js`) | ✅ ditambahkan setelah tes integrasi menangkap dependensi `GetPortfolio` yang lupa diteruskan |
| Tes unit + route + kontrak | 498 lulus (39 suite) |
| Tes integrasi `npm run test:integration` (DB tes + MinIO sungguhan) | 52 lulus (termasuk alur media MinIO): repository timeline/profile/kategori/project, endpoint publik, alur auth ujung-ke-ujung, constraint skema |

---

## 1. Arsitektur saat ini

```
Hapi 21 server (src/server.js)
 ├─ @hapi/jwt strategy 'jwt' (HS256, aud/iss tetap, validate selalu isValid:true)
 ├─ plugin auth          → handler → LoginUser
 ├─ plugin skills        → handler → ListSkills/CreateSkill/UpdateSkill/DeleteSkill/UploadSkillLogo
 ├─ plugin social-media  → handler → ListSocialMedia/GetSocialMediaByPlatform/UpdateSocialMedia
 └─ onPreResponse: NotFoundError→404, AuthenticationError→401, Boom<500 diteruskan, sisanya 500
                    │
       infrastructure/container.js (composition root)
        ├─ MariaDB*Repository → Sequelize 6 (dialect mysql, driver mysql2) → MariaDB ⚠️versi
        └─ MinioFileStorage   → minio SDK 8 → MinIO, URL publik `${MINIO_PUBLIC_URL}/${bucket}/${key}`
```

Runtime: Node **v20.19.5** saat audit (✅ terpasang di mesin ini; sudah dipindah ke v26 — lihat D1), CommonJS, tanpa lint,
tanpa Dockerfile/compose, tanpa CI (⚠️ tidak ada folder `.github/`).

### 1.1 Endpoint yang ada (✅ dari `routes.js`)

Tidak ada prefix — **berbeda** dengan `docs/openapi.yaml` yang mendeklarasikan
server `.../api/v1`.

| Metode | Path | Auth | Validasi | Respons |
|---|---|---|---|---|
| POST | `/auth/login` | — | payload `{ email, password }` | `200 { accessToken, expiresIn }` |
| GET | `/skills` | — | query `page`, `limit≤100` | `200 { data: Skill[], meta: { page, limit, total } }` — termasuk `enabled=false` |
| GET | `/skills/{id}` | — | `id` int | `200 Skill` (tanpa envelope) / 404 |
| POST | `/skills` | JWT | `{ name≤100, description?, enabled? }` | `201 Skill` |
| PUT | `/skills/{id}` | JWT | semua field wajib | `200 Skill` |
| DELETE | `/skills/{id}` | JWT | `id` | `204` |
| POST | `/skills/{id}/logo` | JWT | multipart `logo`, ≤2 MB, MIME dari header klien | `200 Skill` |
| GET | `/profile/social-media` | — | — | `200 SocialMedia[]` — termasuk `enabled=false` |
| GET | `/profile/social-media/{platform}` | — | enum `github·linkedin·instagram·twitter·facebook` | `200 SocialMedia` / 404 |
| PUT | `/profile/social-media/{platform}` | JWT | `{ url?, username?, enabled? }` | `200 SocialMedia` |

Didokumentasikan di `docs/openapi.yaml` tetapi **belum ada** di kode:
`/profile`, `/profile/photo`, `/projects*`, `/experience/educations*`,
`/experience/jobs*`. Entity & interface repository untuk Profile/Project/
Education/Job ada tetapi tidak diimplementasikan.

### 1.2 Skema DB (✅ dari `migrations/`)

| Tabel | Kolom |
|---|---|
| `skills` | `id` INT AI, `name` VARCHAR(255), `logo_url` VARCHAR(255) NULL, `description` TEXT NULL, `enabled` BOOL, `created_at`, `updated_at` |
| `users` | `id` INT AI, `email` UNIQUE, `password_hash`, timestamps |
| `social_media` | `id` INT AI, `platform` UNIQUE, `url`, `username`, `enabled`, timestamps |

Tidak ada charset/collation eksplisit (⚠️ bergantung default server).

---

## 2. Masalah yang ditemukan

Tingkat: 🔴 tinggi · 🟠 sedang · 🟡 rendah.

### 2.1 Dependensi & runtime

| # | Temuan | Tingkat |
|---|---|---|
| D1 | **Node 20 sudah EOL** (📚 akhir April 2026). ✅ **Selesai 11 Nov 2026**: pindah ke Node 26 LTS (v26.13.0 via nvm, `.nvmrc` + `engines`), 40 tes lulus. | 🔴 |
| D2 | `@hapi/hapi` 21.4.7 → 21.4.13. Versi terpasang menarik `@hapi/content` rentan (ReDoS header, *parameter smuggling* yang bisa mem-*bypass* filter upload, parsing Content-Disposition kuadratik). Relevan karena ada endpoint multipart. `npm audit fix` cukup (non-breaking). | 🔴 |
| D3 | `joi` 18.2.3 → 18.3.2 (high: beberapa *prototype pollution* lewat pesan kustom/`rename`, ReDoS `isoDate`, `email({multiple})`). Non-breaking. | 🔴 |
| D4 | `minio` 8.0.7 (sudah versi terbaru di npm) membawa `query-string`/`decode-uri-component`/`stream-json` rentan. `npm audit` menyarankan *downgrade* ke 7.1.3 — **jangan diikuti**. Jalurnya mem-*parse* respons dari server MinIO milik sendiri (sumber tepercaya), jadi risiko praktis rendah. Pantau rilis SDK. | 🟡 |
| D5 | `sequelize` 6.37.8 → `uuid@8` (moderate, hanya v3/v5/v6 dengan argumen `buf`; Sequelize memakai v1/v4) dan `moment` (path traversal via locale non-string; tidak menerima input pengguna). Praktis tidak tereksploitasi; tidak ada perbaikan tanpa mengganti versi mayor. | 🟡 |
| D6 | Paket `save@2.9.0` di `dependencies` tidak dipakai di mana pun (kemungkinan salah ketik `npm install --save`). Hapus. | 🟡 |
| D7 | `@hapi/boom` di-`require` tetapi tidak terdaftar di `package.json` (ikut transitif dari Hapi). | 🟡 |
| D8 | `mysql2` 3.23.1 → 3.24.6, `jest` 30.5.2, `dotenv-cli` 11.1.0 (minor). `dotenv` 18 adalah versi mayor — opsional. | 🟡 |
| D9 | Dev dependencies total 30 temuan audit (4 low, 17 moderate, 9 high, termasuk yang di atas) — sebagian besar dari `sequelize-cli`/`jest`/`nodemon`, tidak ikut produksi. | 🟡 |

### 2.2 Keamanan

| # | Temuan | Tingkat |
|---|---|---|
| S1 | **Tidak ada rate limit** di `POST /auth/login` → brute force password admin tak terbatas. | 🔴 |
| S2 | **Upload SVG tanpa sanitasi** (`image/svg+xml` diizinkan) dan disajikan dari bucket publik → SVG berisi `<script>` dieksekusi bila dibuka langsung (XSS tersimpan di origin MinIO). | 🔴 |
| S3 | Validasi tipe file memakai header `content-type` dari klien (bisa dipalsukan); ekstensi objek diambil dari `filename` pengguna (`logo.png` bisa berisi apa saja, atau nama `x.html`). Tidak ada cek *magic bytes* / dimensi. | 🟠 |
| S4 | CORS tidak dikonfigurasi (default Hapi: tanpa header CORS). Akan memblokir panel admin di browser bila beda origin dengan API. ⚠️ Topologi domain belum diketahui. | 🟠 |
| S5 | Tidak ada header keamanan (`routes.security` Hapi: HSTS, `nosniff`, `X-Frame-Options`). | 🟠 |
| S6 | JWT: `validate` selalu `isValid: true` (tidak cek user masih ada), tidak ada logout/revokasi/refresh; TTL dari env (⚠️ nilai tidak dibaca; tes memakai 7 hari). Bila token bocor, berlaku sampai kedaluwarsa. | 🟠 |
| S7 | Data non-publik bocor ke endpoint publik: `GET /skills` dan `GET /profile/social-media` mengembalikan baris `enabled=false`. | 🟠 |
| S8 | bcrypt cost 10 di seeder (API.md meminta ≥ 12). | 🟡 |
| S9 | Saat email tidak ditemukan, `bcrypt.compare` dilewati → beda waktu respons (enumerasi email via timing). Dampak kecil untuk 1 admin. | 🟡 |
| S10 | Kebijakan bucket MinIO ⚠️ tidak bisa diverifikasi. Format URL menyiratkan *anonymous read*; pastikan hanya `s3:GetObject` (bukan `ListBucket`) dan hanya pada prefix publik. | 🟠 |
| S11 | Data pribadi (email admin) di-hardcode di seeder dan fixture tes. | 🟡 |
| S12 | `.env` masih berisi `DATABASE_URL` dan komentar sisa Prisma; `.env.example` tidak lengkap sehingga orang lain cenderung menyalin `.env` asli. | 🟡 |

### 2.3 Struktur kode & kebenaran

| # | Temuan | Tingkat |
|---|---|---|
| C1 | `config/config.js` tidak punya blok `production` → `NODE_ENV=production` membuat `sequelizeClient.js` crash (`config` undefined). | 🔴 |
| C2 | **Bug**: `UpdateSocialMedia` — entity `SocialMedia` punya default `enabled = true`; `PUT` yang hanya mengirim `{ url }` meneruskan `enabled: undefined` → menjadi `true`, sehingga platform yang dinonaktifkan (mis. twitter) aktif kembali. `url`/`username` yang tidak dikirim juga ikut `undefined` (⚠️ perilaku Sequelize terhadap `undefined` pada `update()` belum diuji; bisa diabaikan atau gagal NOT NULL). Tes yang ada tidak menangkap kasus ini. | 🟠 |
| C3 | `DeleteSkill` menghapus file dulu, baru baris DB → bila DB gagal, skill tetap ada dengan logo rusak. Urutan aman: hapus baris → hapus file (best-effort, dicatat bila gagal). | 🟡 |
| C4 | `UploadSkillLogo` tidak menghapus logo lama → objek yatim menumpuk; bila `repository.update` gagal setelah upload, file baru juga yatim. | 🟡 |
| C5 | DB menyimpan **URL penuh** (`logo_url`). Mengganti domain/endpoint MinIO = semua URL rusak; `MinioFileStorage.delete` mem-*parse* URL dengan `replace(prefix)` yang gagal diam-diam bila prefix berubah. Simpan *object key*, bentuk URL saat respons. | 🟠 |
| C6 | Handler skills mengakses repository langsung untuk detail; format 404-nya beda dengan error global; import tak terpakai; pengecekan NotFound ganda di handler social-media. | 🟡 |
| C7 | File mati: `models/index.js` (require `config.json` yang tidak ada), `src/use-cases/register.js` (`ValidationError` tak terdefinisi). | 🟡 |
| C8 | `process.env` dibaca di 4 file, `dotenv.config()` di 3 file, tanpa validasi saat start. `server.js` memanggil `init()` saat di-`require` → tidak bisa dipakai di tes `server.inject()`. | 🟠 |
| C9 | `Entity` memakai `Object.assign(this, attrs)` → atribut apa pun (termasuk `password` hash pada `User`, timestamps) ikut terbawa ke objek dan berpotensi ikut terserialisasi ke respons. Tambahkan presenter/serializer eksplisit per resource. | 🟠 |
| C10 | Seeder `platform: 'linkedIn'` vs validator `'linkedin'` — hanya cocok karena collation case-insensitive (⚠️). | 🟡 |
| C11 | `docs/openapi.yaml` tidak sinkron dengan kode (prefix, endpoint yang tidak ada, bentuk respons). | 🟠 |
| C12 | Tidak ada graceful shutdown (`SIGTERM`), tidak ada endpoint health, Sequelize tidak di-`authenticate()` saat start (DB mati baru ketahuan saat request pertama). | 🟡 |

### 2.4 Penanganan error

- Format error saat ini: `{ statusCode, error, message }` (gaya Boom). UI
  (API.md §4) membutuhkan `{ error: { code, message, details[] } }` dengan `code`
  seperti `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `CONFLICT`, `RATE_LIMITED`.
- Error validasi Joi: tanpa `failAction` → 400 generik tanpa detail per field.
- 413 (file > 2 MB) dan 415 diteruskan sebagai Boom mentah, bukan kode UI.
- Pesan dalam bahasa Indonesia; UI admin berbahasa Inggris (keputusan K10).
- Hanya 2 error domain; penambahan error baru menuntut cabang `instanceof` baru
  (usulan `ClientError` di CODE_STYLE §4).

### 2.5 Cakupan tes

| Lapisan | Ada? |
|---|---|
| Use-case (auth, skill ×5, social-media ×3) | ✅ 35 tes, mengikuti `docs/Testing.md` |
| `MinioFileStorage` | ✅ 5 tes (mock client) |
| Route/handler (validasi, auth 401, kode status, format error, upload) | ❌ |
| Repository ke DB nyata / migrasi | ❌ (`test:migrate` ada, tetapi tidak ada tes yang memakainya) |
| Entity | ❌ |
| Coverage report | ❌ (tidak ada script; tidak diukur) |

Bug C2 lolos karena tes `UpdateSocialMedia` selalu mengirim ketiga field.

---

## 3. Evaluasi database & storage

### 3.1 Apa yang benar-benar dipakai (verifikasi)

| Komponen | Bukti di repo | Kesimpulan |
|---|---|---|
| Database | `config/config.js`: `dialect: 'mysql'`; deps `sequelize@6.37.8` + `mysql2@3.23.1`; folder `repositories/mariadb/`, kelas `MariaDB*Repository`; README "Dibutuhkan: maria db"; riwayat commit "pindah dari Prisma ke Sequelize untuk akses MariaDB". | ✅ **Server-nya MariaDB**, diakses lewat dialek/driver MySQL. Asumsi "MySQL" kurang tepat — yang dipakai MariaDB. ⚠️ Versi server tidak tercantum di mana pun; cek dengan `SELECT VERSION();` dan `SHOW VARIABLES LIKE 'character_set_server';`. |
| Storage | `minio@8.0.7`; `infrastructure/storage/minioClient.js` + `MinioFileStorage.js`; env `MINIO_ENDPOINT/PORT/USE_SSL/ACCESS_KEY/SECRET_KEY/BUCKET/PUBLIC_URL`. | ✅ **MinIO** (API S3), satu bucket, prefix `skills/`, URL publik path-style. ⚠️ Versi server, kebijakan bucket, dan apakah ada reverse proxy/TLS di depannya tidak bisa diverifikasi. |
| ORM/migrasi | Sequelize 6 model `define()`, `sequelize-cli` 6.6.5 (memakai `config/config.js` karena `config.json` tidak ada), `seederStorage: 'sequelize'`. | ✅ |

### 3.2 Apakah MariaDB tetap cocok?

**Ya.** Alasan:
- **Bentuk data relasional murni**: kategori→skill, organisasi→posisi (FK +
  `ON DELETE CASCADE`), profil singleton, urutan via `sort_order`. Tidak ada
  kebutuhan dokumen bebas, full-text, atau geospasial.
- **Skala sangat kecil** (perkiraan < 1.000 baris total, 1 penulis/admin).
  Mesin DB apa pun berlebih; yang menentukan adalah biaya operasional, dan
  MariaDB **sudah berjalan** di homelab.
- **Migrasi skema**: sequelize-cli sudah terbukti jalan di server ini tanpa
  *shadow database* (masalah yang membuat Prisma ditinggalkan). MariaDB
  mendukung `CHECK` constraint (📚 sejak 10.2) untuk aturan periode/committee.
- **Emoji**: butuh `utf8mb4` — didukung penuh; harus dipastikan di
  database/tabel (⚠️).

Yang perlu diperbaiki (bukan diganti):
1. **Versi**: ⚠️ belum diketahui. 📚 MariaDB 10.6 LTS EOL Juli 2026; target
   10.11 LTS atau 11.4/11.8 LTS. (Bila ternyata MySQL: 8.0 EOL April 2026 →
   8.4 LTS.)
2. **Charset**: ✅ terverifikasi 11 Nov 2026 — server & database sudah `utf8mb4` / `utf8mb4_uca1400_ai_ci`; cukup samakan collation di migrasi baru (sebelumnya: `ALTER DATABASE ... CHARACTER SET utf8mb4`)
   + charset eksplisit di setiap migrasi baru.
3. **User DB terpisah** untuk aplikasi dengan hak minimal (`SELECT, INSERT,
   UPDATE, DELETE` + akun terpisah untuk migrasi), ⚠️ belum diketahui.
4. **Backup**: `mariadb-dump --single-transaction` terjadwal (cron/systemd timer),
   retensi 7 harian + 4 mingguan, disalin ke disk/mesin lain; **uji restore**
   ke database tes tiap bulan. Dump portofolio hanya beberapa ratus KB.
5. **Resource**: untuk beban ini, `innodb_buffer_pool_size` 128–256 MB cukup.

### 3.3 Apakah MinIO tetap cocok?

**Cukup cocok, dengan catatan.** Kebutuhan: < ratusan gambar, semuanya
**publik**, ≤ 2 MB, ditulis hanya oleh admin lewat API.

- **Akses publik vs presigned URL**: semua gambar adalah konten publik
  portofolio → **public-read** (hanya `GetObject`) + nama objek unik (UUID) +
  `Cache-Control: public, max-age=31536000, immutable`. Presigned URL tidak
  diperlukan untuk baca. Presigned *upload* (browser langsung ke MinIO) juga
  tidak disarankan: file harus diproses server (cek magic bytes, sanitasi SVG,
  konversi WebP), dan ukurannya kecil.
- **Kebijakan bucket**: buat kebijakan yang hanya mengizinkan `s3:GetObject`
  pada `arn:aws:s3:::<bucket>/public/*` (atau seluruh bucket bila semuanya
  publik), **tanpa** `s3:ListBucket`. Access key aplikasi dibatasi ke bucket itu.
- **Validasi & optimasi**: dilakukan di API, bukan di storage (lihat §5.3).
- **Backup**: `mc mirror` terjadwal ke disk lain, atau backup volume data
  MinIO bersama dump DB (keduanya harus konsisten — DB menyimpan key).
- 📚 **Status MinIO Community Edition** (mohon diverifikasi): sepanjang 2025
  MinIO menghapus fitur admin dari console edisi komunitas, berhenti merilis
  binary/image Docker siap pakai, lalu menyatakan repositori komunitas dalam
  mode *maintenance*. Dampak untuk homelab: pembaruan keamanan ke depan tidak
  pasti. Ini **bukan** alasan migrasi darurat (MinIO yang sudah berjalan tetap
  berfungsi), tetapi alasan untuk **menjaga jalan keluar murah** — yaitu
  menyimpan *object key* (C5) dan tetap memakai interface `FileStorage`.

### 3.4 Lapisan akses data

Saat ini: Sequelize 6 di balik interface repository (3 implementasi kecil).

### 3.5 Perbandingan alternatif

**Database**

| Opsi | Kelebihan | Kekurangan | Biaya migrasi |
|---|---|---|---|
| **MariaDB (sekarang)** | Sudah jalan & dikenal; sequelize-cli terbukti; FK, CHECK, utf8mb4; tooling dump/restore matang | Proses server terpisah (RAM ±100–300 MB); perlu backup terjadwal | — |
| PostgreSQL | Tipe & constraint lebih kaya (partial unique index, `DEFERRABLE`), direkomendasikan generik di API.md §12 | Tidak ada fitur yang **dibutuhkan** UI ini yang tidak dimiliki MariaDB; server baru di homelab; ganti driver (`pg`) & uji ulang migrasi | Sedang: dialek baru, pindah data, konfigurasi backup baru |
| SQLite | Tanpa server; backup = salin file (`.backup`/Litestream); RAM minimal; cocok 1 penulis | `ALTER TABLE` terbatas (Sequelize merekonstruksi tabel); harus di volume persisten satu host; kehilangan infrastruktur yang sudah ada; modul native `sqlite3` | Rendah–sedang |

**Storage**

| Opsi | Kelebihan | Kekurangan | Biaya migrasi |
|---|---|---|---|
| **MinIO (sekarang)** | API S3 standar; sudah terintegrasi + teruji; kebijakan bucket granular | 📚 masa depan edisi komunitas tidak pasti; satu layanan lagi untuk dipantau | — |
| Filesystem lokal + reverse proxy (Caddy/Nginx) | Paling sederhana; backup ikut restic/rsync; tidak ada kredensial S3 | Terikat satu host; perlu implementasi `LocalFileStorage` + konfigurasi static serving & header | Rendah (kelas baru ±50 baris + salin file), **asal DB menyimpan key** |
| Garage (S3-compatible, self-host) | Ringan, dirancang untuk homelab, API S3 → `MinioFileStorage` hampir tanpa perubahan | Subset API S3; model izin berbeda (akses publik via mode website) | Rendah: `rclone copy` + ganti endpoint/kredensial |
| Cloudflare R2 / S3 cloud | Tanpa operasional, CDN | Keluar dari homelab; biaya/akun pihak ketiga | Rendah (S3) |

**Akses data / migrasi**

| Opsi | Kelebihan | Kekurangan | Biaya migrasi |
|---|---|---|---|
| **Sequelize 6 + sequelize-cli (sekarang)** | Sudah dipakai, migrasi terbukti jalan, tim paham; repository sudah mengisolasinya | 📚 v6 dalam mode pemeliharaan, v7 lama berstatus alpha; audit `uuid`/`moment` (tidak tereksploitasi) | — |
| Knex | Query builder tipis + migrasi matang, CommonJS-friendly | Tulis ulang 3 repository + riwayat migrasi | Sedang |
| Kysely / Drizzle | Type-safety kuat | Nilai utamanya di TypeScript; repo ini JS/CommonJS | Sedang–tinggi |
| Prisma | Skema deklaratif | **Sudah dicoba dan gagal** (butuh shadow DB di server ini) | Tinggi |
| `mysql2` mentah | Paling transparan | Kehilangan alat migrasi; boilerplate mapping | Sedang |

### 3.6 Rekomendasi akhir

1. **Database: pertahankan MariaDB.** Tidak ada keuntungan jelas dari migrasi.
   Perbaiki: pastikan versi LTS yang masih didukung, `utf8mb4`, user DB
   hak-minimal, backup terjadwal + uji restore, blok `production` di config.
2. **Akses data: pertahankan Sequelize 6 + sequelize-cli.** Gunakan transaksi
   untuk reorder dan pembuatan organisasi+posisi; jangan pakai `sync()`. Karena
   repository sudah terisolasi, penggantian ORM bisa ditunda tanpa biaya.
3. **Storage: pertahankan MinIO untuk sekarang**, dengan syarat:
   simpan *object key* (bukan URL penuh), kebijakan bucket `GetObject`-saja,
   image di-*pin* ke versi tertentu, backup `mc mirror`. **Bila** pengecekan di
   M0 menunjukkan image MinIO yang dipakai tidak lagi mendapat pembaruan
   keamanan, pindah ke **filesystem lokal + reverse proxy** (paling sederhana
   untuk skala ini) — biayanya rendah setelah C5 diperbaiki. (Keputusan K2.)

---

## 4. Pemetaan kebutuhan UI → endpoint

Sumber kebutuhan: `docs/design/API.md` dan `docs/design/DESIGN.md`.
Status: **Ada** (bisa dipakai apa adanya) · **Ubah** (ada tetapi perlu
diubah) · **Belum**.

| Kebutuhan UI | Endpoint sekarang | Status | Catatan |
|---|---|---|---|
| Hero: greeting, tagline (SSR) | — | Belum | `Profile` entity hanya stub, field berbeda (`name`, `photoUrl`, …) |
| Hero: foto (desktop) | — | Belum | **Tidak ada di API.md** — perlu `profile.photo` (K13) |
| #about-me | — | Belum | `profile.about` |
| #skills per kategori | `GET /skills` | Ubah | Kini datar, berpaginasi, tanpa kategori/urutan, ikut menampilkan `enabled=false` |
| Admin skill CRUD (Name, Category, Logo) | `POST/PUT/DELETE /skills`, `POST /skills/{id}/logo` | Ubah | Tambah `category_id`, `sort_order`; PATCH parsial; logo via upload umum; `description` tidak dipakai UI (K14) |
| Kategori skill | — | Belum | Tabel + CRUD baru |
| #project kartu (6 teratas) + Projects Archive | — | Belum | |
| Admin project (Title, Description, Image, Link, Show visit button) | — | Belum | Aturan `show_button` ⇒ `link_url` |
| Intro project | — | Belum | `profile.project_intro` |
| #experience timeline (organisasi → posisi) | — | Belum | Stub `Education`/`Job` tidak cocok model LinkedIn; diganti `organizations` + `positions` |
| #contact-me email | — | Belum | `profile.email` |
| Social links publik | `GET /profile/social-media` | Ubah | Path, `id`, `label`, `sort_order`, filter publikasi, enum platform (+discord/other, twitter?) (K12) |
| Admin social link (Platform, URL) + tambah/hapus | `PUT /profile/social-media/{platform}` | Ubah | Kini hanya update baris seed; perlu POST/DELETE/reorder; bug C2 |
| Admin Login | `POST /auth/login` | Ubah | Envelope `data`, kode `INVALID_CREDENTIALS`, rate limit, username vs email (K5), refresh cookie (K6) |
| Log out / refresh / me | — | Belum | |
| Upload gambar/logo (PNG/JPG/SVG ≤2 MB) | `POST /skills/{id}/logo` | Ubah | Jadi `POST /admin/uploads` umum; magic bytes; sanitasi SVG; WebP |
| Drag untuk urutan | — | Belum | `PATCH /<resource>/reorder` |
| Toast/field error | format Boom | Ubah | Format `{ error: { code, message, details } }` |
| Data agregat untuk SSR | — | Belum | `GET /portfolio` |
| Error State/Skeleton (timeout klien) | — | Belum | `Cache-Control` + `ETag` agar GET publik cepat |
| Revalidasi halaman setelah simpan | — | Belum | Webhook ke frontend (K11) |

---

## 5. Usulan target

### 5.1 Prinsip umum

- Prefix **`/api/v1`** (didaftarkan via `server.register(plugin, { routes: { prefix } })`).
  Publik: `/api/v1/...`; admin: `/api/v1/admin/...` dengan `auth: 'jwt'`
  sebagai default plugin admin.
- Respons sukses `{ data }`, list `{ data, meta }`; error
  `{ error: { code, message, details? } }` (API.md §4).
- Contoh di bawah memakai **snake_case** sesuai kontrak UI di API.md
  (keputusan K4). Konversi dilakukan oleh presenter di lapisan HTTP; domain
  tetap camelCase (CODE_STYLE §2).
- ID: **integer auto-increment** (konsisten dengan tabel yang ada; data
  publik sehingga ID yang bisa ditebak bukan masalah) — keputusan K3.
- Admin memakai **PATCH** (partial update), sesuai tombol "Save changes" per
  section. Ini menyimpang dari pola `PUT` lama — alasannya kebutuhan UI.
- Rute literal `.../reorder` dan rute parameter `.../{id}` dapat hidup
  berdampingan: router Hapi memprioritaskan segmen literal.
- Endpoint lama (tanpa prefix) **dihapus** setelah v1 jalan, kecuali ada
  konsumen lain (K9). ⚠️ `portfolio-ary-web` di mesin ini masih kosong, jadi
  kemungkinan belum ada konsumen.

### 5.2 Daftar endpoint `/api/v1`

**Publik** (tanpa auth, hanya data `is_published = true`,
`Cache-Control: public, max-age=60, stale-while-revalidate=300` + `ETag`)

| Metode | Path | Query/Request | Respons `data` |
|---|---|---|---|
| GET | `/health` | — | `{ status: 'ok', db: 'ok' }` (tanpa cache) |
| GET | `/portfolio` | — | `{ profile, skills, projects: { items≤6, total, has_more }, timeline, social_links }` |
| GET | `/profile` | — | `{ greeting, tagline, about, project_intro, email, photo: Image\|null }` |
| GET | `/skills` | — | `[{ category: { id, name }, items: [{ id, name, logo: Image }] }]` |
| GET | `/projects` | `page=1`, `limit=12 (≤50)` | `[Project]` + `meta { total, page, limit }` |
| GET | `/projects/{id}` | — | `Project` / 404 |
| GET | `/timeline` | — | `{ education: [Org], work_organization: [Org] }`, posisi dengan `type_label`, `period_label` |
| GET | `/social-links` | — | `[{ id, platform, label, url }]` |

`Image` = `{ url, width, height, mime, variants?: { "400": url, "800": url, "1200": url } }`.

**Admin** (`Authorization: Bearer <access_token>`, `Cache-Control: no-store`)

| Metode | Path | Request | Respons |
|---|---|---|---|
| POST | `/admin/auth/login` | `{ username\|email, password }` (K5) | `200 { access_token, expires_in, admin: { id, username } }` + cookie `refresh_token` (K6); 401 `INVALID_CREDENTIALS`; 429 `RATE_LIMITED` |
| POST | `/admin/auth/refresh` | cookie | `200 { access_token, expires_in }` (rotasi refresh token) |
| POST | `/admin/auth/logout` | cookie | `204`, cabut refresh token, hapus cookie |
| GET | `/admin/auth/me` | — | `{ id, username }` |
| GET | `/admin/profile` | — | Profile lengkap |
| PATCH | `/admin/profile` | subset `{ greeting, tagline, about, project_intro, email, photo_id }` | Profile |
| GET | `/admin/skill-categories` | — | `[{ id, name, sort_order, skill_count }]` |
| POST | `/admin/skill-categories` | `{ name }` | `201` / 409 `CONFLICT` nama duplikat |
| PATCH | `/admin/skill-categories/{id}` | `{ name }` | Category |
| DELETE | `/admin/skill-categories/{id}` | — | `204` / 409 bila masih berisi skill |
| PATCH | `/admin/skill-categories/reorder` | `{ ids: [] }` | `204` |
| GET | `/admin/skills` | `category_id?` | `[Skill]` (termasuk tidak terbit) |
| POST | `/admin/skills` | `{ category_id, name, logo_id, is_published? }` | `201 Skill` |
| GET / PATCH / DELETE | `/admin/skills/{id}` | PATCH: subset field di atas | Skill / `204` |
| PATCH | `/admin/skills/reorder` | `{ category_id, ids: [] }` | `204` |
| GET | `/admin/projects` | `page`, `limit` | `[Project]` + meta |
| POST | `/admin/projects` | `{ title, description, image_id, link_url?, show_button?, is_published? }` | `201 Project` |
| GET / PATCH / DELETE | `/admin/projects/{id}` | PATCH parsial | Project / `204` |
| PATCH | `/admin/projects/reorder` | `{ ids: [] }` | `204` |
| GET | `/admin/organizations` | `group?` | `[Org + positions]` |
| POST | `/admin/organizations` | `{ name, group, location? }` | `201 Org` |
| PATCH / DELETE | `/admin/organizations/{id}` | DELETE cascade posisi | Org / `204` |
| POST | `/admin/positions` | `{ organization_id \| (organization_name + group), title, type, event_name?, start_date 'YYYY-MM', end_date?, is_current?, description? }` | `201 Position` (dalam transaksi bila membuat organisasi baru) |
| PATCH / DELETE | `/admin/positions/{id}` | PATCH parsial, aturan §3 API.md divalidasi ulang terhadap gabungan data lama+baru | Position / `204` |
| PATCH | `/admin/organizations/{id}/positions/reorder` | `{ ids: [] }` | `204` |
| GET / POST | `/admin/social-links` | `{ platform, label?, url, is_published? }` | list / `201` |
| PATCH / DELETE | `/admin/social-links/{id}` | | SocialLink / `204` |
| PATCH | `/admin/social-links/reorder` | `{ ids: [] }` | `204` |
| POST | `/admin/uploads` | multipart `file`, query `kind=project_image\|skill_logo\|profile_photo` | `201 { id, url, width, height, mime, variants }`; 413 / 415 |
| DELETE | `/admin/uploads/{id}` | — | `204` / 409 bila masih dipakai |

Reorder: validasi `ids` adalah permutasi lengkap dari himpunan saat ini
(bila tidak → 400), lalu update `sort_order` dalam satu transaksi.

### 5.3 Model data (MariaDB 11.4, `utf8mb4_uca1400_ai_ci`)

| Tabel | Kolom utama | Constraint / indeks |
|---|---|---|
| `users` (sudah ada) | `id`, `email`, `password_hash`, **+** `username` VARCHAR(50) UNIQUE (bila K5 = username), `last_login_at` | — |
| `refresh_tokens` (baru) | `id`, `user_id` FK, `token_hash` CHAR(64) UNIQUE, `expires_at`, `revoked_at` NULL, `replaced_by_id` NULL, `created_at` | FK `ON DELETE CASCADE`; idx `expires_at` |
| `media` (baru) | `id`, `kind` ENUM, `object_key` VARCHAR(255) UNIQUE, `mime`, `size_bytes`, `width`, `height`, `variants` JSON NULL, `created_at` | — |
| `profile` (baru, singleton) | `id` TINYINT=1, `greeting` VARCHAR(80), `tagline` VARCHAR(120), `about` TEXT, `project_intro` VARCHAR(200) NULL, `email` VARCHAR(254), `photo_media_id` NULL, `updated_at` | `CHECK (id = 1)`; FK media `ON DELETE SET NULL` |
| `skill_categories` (baru) | `id`, `name` VARCHAR(40), `sort_order` INT, timestamps | UNIQUE `name` |
| `skills` (ubah) | **+** `category_id` FK, **+** `sort_order`, **+** `logo_media_id` FK; `enabled` → `is_published` (K8); `logo_url` & `description` dihapus setelah data dipindah (K14) | FK category `ON DELETE RESTRICT`; idx (`category_id`, `sort_order`) |
| `projects` (baru) | `id`, `title` VARCHAR(60), `description` VARCHAR(300), `image_media_id` FK, `link_url` VARCHAR(2048) NULL, `show_button` BOOL, `is_published` BOOL, `sort_order`, timestamps | `CHECK (show_button = 0 OR link_url IS NOT NULL)`; idx (`is_published`, `sort_order`) |
| `organizations` (baru) | `id`, `name` VARCHAR(120), **`group_type`** ENUM('education','work_organization'), `location` NULL, `sort_order` NULL, timestamps | `group` adalah kata kunci SQL → nama kolom `group_type`, dipetakan ke `group` di API; UNIQUE (`name`, `group_type`) |
| `positions` (baru) | `id`, `organization_id` FK, `title` VARCHAR(120), `type` ENUM(11 nilai), `event_name` NULL, `start_date` DATE (tgl 1), `end_date` DATE NULL, `is_current` BOOL, `description` VARCHAR(500) NULL, `sort_order` NULL, timestamps | FK `ON DELETE CASCADE`; `CHECK (NOT (is_current AND end_date IS NOT NULL))`; `CHECK (end_date IS NULL OR end_date >= start_date)`; `CHECK ((type = 'committee') = (event_name IS NOT NULL))` |
| `social_links` (pengganti `social_media`) | `id`, `platform` ENUM(github, facebook, instagram, linkedin, discord, other), `label` VARCHAR(40) NULL, `url` VARCHAR(2048), `is_published`, `sort_order`, timestamps | Migrasi data: `platform` di-lowercase; `twitter` → `other` + label "X" atau dibuang (K12); `username` dibuang atau jadi `label` |
| `audit_logs` (opsional, API.md §10) | `id`, `user_id`, `action`, `entity`, `entity_id`, `created_at` | Ditunda ke milestone akhir |

Aturan bisnis yang tidak bisa dinyatakan sebagai CHECK (konsistensi
`group` ↔ `type = education`, `start_date` ≤ hari ini + 1 tahun) divalidasi di
use-case. CHECK di DB adalah jaring pengaman kedua.

Penyimpanan `start_date`/`end_date` sebagai `DATE` tanggal 1 memungkinkan
pengurutan langsung; API menerima & mengirim `YYYY-MM`.

### 5.4 Strategi upload gambar

Alur dua langkah, cocok dengan panel form (pilih file → lihat pratinjau →
"Save"):

1. `POST /api/v1/admin/uploads?kind=...` (multipart, `maxBytes` 2 MB,
   `output: 'stream'`, rate limit).
2. Server:
   - Baca buffer; deteksi format dari **isi file**: `sharp(buffer).metadata()`
     untuk PNG/JPEG (tolak bila format tidak cocok dengan `kind`); SVG dideteksi
     sebagai teks XML dengan root `<svg>`. (Paket `file-type` versi baru
     berformat ESM-only — tidak cocok dengan CommonJS, jadi tidak dipakai.)
   - Batasi dimensi (`limitInputPixels`) untuk mencegah *decompression bomb*.
   - **Raster**: hapus metadata EXIF, konversi ke **WebP**; `project_image` →
     varian 400/800/1200 px lebar; `skill_logo` → 128/256 px;
     `profile_photo` → 400/800 px.
   - **SVG**: sanitasi (hapus `<script>`, atribut `on*`, `foreignObject`,
     `href` eksternal) atau tolak/rasterisasi — keputusan K7.
   - Nama objek `<kind>/<uuid>-<w>.webp`, `Content-Type` dari hasil deteksi
     (bukan dari klien), `Cache-Control: public, max-age=31536000, immutable`.
   - Simpan baris `media`, kembalikan `{ id, url, ... }`.
3. Form menyimpan `image_id`/`logo_id`/`photo_id` saat "Save".
4. Saat gambar diganti/resource dihapus: update DB dulu, lalu hapus objek lama
   (best-effort, gagal → dicatat). Job berkala (cron harian di dalam proses
   atau script terpisah) menghapus `media` yatim berumur > 24 jam.

Dependensi baru: `sharp` (📚 modul native berbasis libvips; perhatikan
image Docker berbasis musl/Alpine) dan sanitizer SVG (mis. `dompurify` +
`jsdom`, cukup berat) — atau tanpa sanitizer bila K7 memilih tolak/rasterisasi.

### 5.5 Dokumentasi OpenAPI

- **Sumber kebenaran**: `docs/openapi.yaml` (OpenAPI **3.1**, ditulis tangan,
  seperti sekarang) ditulis ulang sesuai §5.2, dengan `components/schemas`
  untuk setiap resource dan `Error`.
- 📚 `hapi-swagger` (setahu saya) menghasilkan Swagger/OpenAPI **2.0**, bukan
  3.1, sehingga tidak dipakai sebagai generator meskipun API.md §12 menyebutnya.
  Mohon diverifikasi bila ingin generator otomatis.
- Pencegah *drift*:
  - `npx @redocly/cli lint docs/openapi.yaml` di script `docs:lint`.
  - Tes route (`server.inject`) memvalidasi body respons terhadap skema di
    `openapi.yaml` (Ajv 2020 untuk JSON Schema OpenAPI 3.1).
- Penyajian: `docs/index.html` (Swagger UI) tetap; opsional disajikan di
  `GET /api/v1/docs` hanya di non-produksi.

### 5.6 Hal lintas-lapisan

| Aspek | Usulan |
|---|---|
| CORS | `routes.cors: { origin: [PORTFOLIO_ORIGIN, ADMIN_ORIGIN], credentials: true }` dari env |
| Header keamanan | `routes.security: { hsts: true, xframe: 'deny', noSniff: true, referrer: 'strict-origin-when-cross-origin' }` |
| Rate limit | **Di reverse proxy (K11b).** Login 5 / 15 menit / IP, upload 30 / jam. Contoh Nginx di bawah tabel; Caddy butuh modul `caddy-ratelimit`. Pastikan proxy meneruskan IP asli dan aplikasi tidak diekspos langsung tanpa proxy. |
| Validasi | `failAction` global → `VALIDATION_ERROR` + `details[]`; `stripUnknown` untuk payload admin |
| Logging | `hapi-pino` dengan `redact` header auth/cookie |
| Config | `src/config.js` tervalidasi Joi; `.env.example` lengkap |
| Shutdown | `SIGTERM` → `server.stop()` + `sequelize.close()` |
| Revalidasi | Setelah write sukses, panggil `FRONTEND_REVALIDATE_URL` (secret) secara fire-and-forget (K11) |

Contoh rate limit di Nginx (K11b) — sesuaikan nama upstream:

```nginx
# di blok http {}
limit_req_zone $binary_remote_addr zone=admin_login:10m rate=5r/15m;
limit_req_zone $binary_remote_addr zone=admin_upload:10m rate=30r/h;

# di blok server {}
location = /api/v1/admin/auth/login {
    limit_req zone=admin_login burst=5 nodelay;
    limit_req_status 429;
    proxy_pass http://portfolio_api;
}
location ~ ^/api/v1/(admin/uploads|skills/\d+/logo)$ {
    limit_req zone=admin_upload burst=10 nodelay;
    limit_req_status 429;
    client_max_body_size 3m;
    proxy_pass http://portfolio_api;
}
```

Respons 429 dari Nginx berbentuk HTML, bukan `{ error: { code: 'RATE_LIMITED' } }`; UI cukup
mengandalkan status 429. Bila ingin JSON, tambahkan `error_page 429` yang mengembalikan body JSON.

---

## 6. Rencana milestone

Setiap milestone: branch/PR sendiri, tes hijau, commit mengikuti
`docs/Commit-convention.md`. Urutan dipilih agar setiap langkah bisa
dirilis sendiri.

| # | Milestone | Isi | Risiko & mitigasi | Selesai bila |
|---|---|---|---|---|
| **M0** | Fondasi & kebersihan | ✅ Node 26 LTS (`engines`, `.nvmrc`); `npm audit fix` non-breaking (hapi, joi), update minor; hapus `save`; tambah `@hapi/boom` eksplisit; ESLint+Prettier sesuai CODE_STYLE; `src/config.js` + `.env.example` lengkap + blok `production`; pecah `createServer()`; hapus file mati; cek versi MariaDB/MinIO & kebijakan bucket | 🟢 Rendah. Format ulang Prettier menyentuh banyak file → commit `style:` terpisah agar diff mudah ditinjau | Lint & 40 tes hijau; server start di `NODE_ENV=production` |
| **M1** | Kerangka HTTP v1 | Prefix `/api/v1`; envelope `data`; format error + `ClientError` + `failAction`; CORS; header keamanan; `/health`; `hapi-pino`; graceful shutdown; tes route dengan `server.inject` untuk endpoint lama | 🟡 Mengubah bentuk respons endpoint lama (breaking) → jalankan bila K9 = tidak ada konsumen | Tes route untuk auth/skills/social hijau |
| **M2** | Auth | Rate limit login; bcrypt 12 (rehash saat login berhasil); `refresh_tokens` + cookie + rotasi; logout; `/me`; username (K5); perbaiki S9 | 🟠 Konfigurasi cookie `SameSite`/`Secure` + CORS `credentials` mudah salah antar-domain → uji dari origin admin sebenarnya | Login→refresh→logout teruji; 6× login salah → 429 |
| **M3** | Skema & data | **Backup dulu.** Migrasi: charset DB, `media`, `profile`, `skill_categories`, ubah `skills`, `projects`, `organizations`, `positions`, `social_media`→`social_links` (migrasi data), `users.username`; seeder data desain (API.md §11) | 🔴 Tertinggi: migrasi data di produksi. Mitigasi: dump + uji restore, jalankan dulu di DB tes dengan salinan data produksi, setiap migrasi punya `down` | `db:migrate` & `db:migrate:undo:all` bersih di DB tes |
| **M4** | Upload | `media` + `POST/DELETE /admin/uploads`; sharp + WebP; deteksi isi; SVG (K7); simpan key; perbaiki C3/C4/C5; job yatim; kebijakan bucket & header cache | 🟠 `sharp` native di image Docker; memori saat konversi → batasi piksel & concurrency 1 | Uji batas: 2 MB+1 → 413, PNG berekstensi .svg → 415, SVG berisi script → ditolak/bersih |
| **M5** | CRUD admin | Use-case + repository + route untuk profile, skill-categories, skills, projects, organizations, positions, social-links, semua `reorder` (transaksi); aturan bisnis §3 API.md; perbaiki C2 | 🟡 Banyak kode, risiko teknis rendah; aturan periode/committee rawan kasus tepi → tes use-case per aturan (Testing.md) | Semua endpoint §5.2 admin teruji |
| **M6** | Endpoint publik | `/portfolio`, `/profile`, `/skills`, `/projects`, `/timeline` (urutan §6 API.md, `period_label`, `type_label`), `/social-links`; `Cache-Control` + `ETag` | 🟡 Logika urutan timeline → tes unit khusus | Respons cocok contoh API.md §5 |
| **M7** | Dokumentasi & operasional | `openapi.yaml` 3.1 + lint + validasi kontrak di tes; webhook revalidasi; Dockerfile + `docker-compose` (api, mariadb, minio/alternatif); script backup DB + storage; README; hapus endpoint lama; `audit_logs` (opsional) | 🟡 Drift dokumentasi → dicegah tes kontrak | Swagger UI menampilkan semua endpoint; restore dari backup teruji |

---

## 7. Keputusan yang perlu Anda tentukan

| # | Keputusan | Rekomendasi saya | Alternatif |
|---|---|---|---|
| K1 | Database | ✅ **Terverifikasi: MariaDB 11.4.12 (LTS), utf8mb4** — tetap MariaDB (§3.6) | PostgreSQL, SQLite |
| K2 | Storage | **Tetap MinIO sekarang**, simpan key; pindah ke filesystem bila image tak lagi dipatch | Filesystem + reverse proxy, Garage, R2 |
| K3 | Tipe ID | **Integer auto-increment** (konsisten, data publik) | UUID v7 (API.md) |
| K4 | Penamaan field JSON | ✅ **Diputuskan: snake_case** (kontrak UI di API.md; frontend belum ditulis) | camelCase (perilaku kode sekarang) |
| K5 | Identitas login | ✅ **Diputuskan: username** sesuai desain (field "Username") dengan email tetap tersimpan | Tetap email (tanpa migrasi kolom) |
| K6 | Refresh token cookie | ✅ **Diputuskan: ya**, bila API & admin berada di domain induk yang sama (same-site) | Access token saja, TTL pendek, login ulang |
| K7 | SVG | **Sanitasi** (logo teknologi umumnya SVG) | Tolak SVG / rasterisasi ke PNG/WebP |
| K8 | Nama kolom status | **`is_published`** untuk semua resource | Tetap `enabled` |
| K9 | Endpoint lama tanpa prefix | ✅ **Diputuskan: langsung pindah ke `/api/v1`** (tidak terlihat ada konsumen) | Pertahankan sementara dengan header `Deprecation` |
| K10 | Bahasa pesan error API | ✅ **Diputuskan: Inggris** + `code` stabil (UI admin berbahasa Inggris) | Indonesia; atau UI memetakan dari `code` saja |
| K11 | Frontend & revalidasi | Butuh info: framework (Next.js/Nuxt/SPA?), domain portofolio & admin, URL webhook | — |
| K11b | Rate limit | ✅ **Diputuskan: di reverse proxy** | Di aplikasi |
| K12 | Twitter/X di social links | Tambah `x` ke enum, atau `other` + label | Dibuang |
| K13 | Foto hero | **Tambah `profile.photo`** (ada di desain desktop, tidak ada di API.md) | Foto statis di frontend |
| K14 | `skills.description` | **Hapus** (tidak ada di panel Skill) | Pertahankan sebagai opsional |
| K15 | Versi Node | ✅ **Diputuskan: Node 26 LTS** (LTS terbaru per `nvm ls-remote --lts`; koreksi dari rekomendasi awal Node 24) | Node 24 / 22 LTS |
| K16 | Paginasi admin | Tanpa paginasi kecuali projects (data sedikit) | Paginasi seragam |
| K17 | Audit log | Tunda (M7, opsional) | Wajib sejak M5 |

---

## 8. Hal yang tidak bisa diverifikasi dari repo

1. Jenis & versi server DB yang sebenarnya, charset/collation, hak akses user DB.
2. Versi server MinIO, kebijakan bucket, apakah diekspos lewat reverse proxy/TLS,
   dan nilai `MINIO_PUBLIC_URL`.
3. Topologi deploy (domain, reverse proxy, Docker) — tidak ada compose/Dockerfile.
4. Kekuatan `JWT_SECRET` dan nilai `JWT_EXPIRES_IN_SECONDS` (nilai env tidak dibaca).
5. Isi data produksi (jumlah baris `skills`/`social_media`, logo yang sudah ada)
   — memengaruhi migrasi data M3.
6. Ada tidaknya konsumen endpoint lama; framework frontend
   (`../portfolio-ary-web` masih kosong).
7. `docs/baseline.txt` dan `REQUIREMENTS.md` tidak ada.
8. Butir bertanda 📚 (status EOL Node/MariaDB/MySQL, status MinIO komunitas,
   kemampuan `hapi-swagger`, status Sequelize v7, ESM-only `file-type`) berasal
   dari pengetahuan umum saya, bukan dari repo.
