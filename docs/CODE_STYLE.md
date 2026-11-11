# Panduan Gaya Kode — portofolio-ary-api

Dokumen ini merangkum gaya penulisan kode yang **sudah dipakai** di repo ini
(hasil pembacaan `src/`, `migrations/`, `seeders/`, tes, dan konfigurasi pada
11 November 2026), lalu menetapkan aturan untuk **semua kode baru** selama
modernisasi. Kalau ada konflik antara kode lama dan dokumen ini, ikuti dokumen
ini, lalu rapikan kode lama secara bertahap (commit `refactor:`/`style:` terpisah).

Label yang dipakai:
- **[pertahankan]** — kebiasaan bagus yang sudah ada.
- **[perbaiki]** — kebiasaan yang sebaiknya diubah, beserta alasannya.
- **[baru]** — aturan tambahan untuk kode baru.

---

## 1. Struktur folder & pembagian lapisan

Arsitektur saat ini mengikuti pola *clean architecture* sederhana: entity →
use-case → repository (interface) → implementasi infrastruktur, dengan HTTP
sebagai lapisan paling luar.

```
config/config.js                  # konfigurasi DB untuk Sequelize (dipakai CLI & runtime)
migrations/                       # migrasi sequelize-cli (timestamp-nama_snake_case.js)
seeders/                          # seeder sequelize-cli
src/
  server.js                       # bootstrap Hapi, strategi JWT, error handler global
  entities/                       # objek domain (class, extends Entity)
  exceptions/                     # error domain (class, extends Error)
  use-cases/<resource>/           # 1 class = 1 aksi bisnis, method execute()
    CreateSkill.js
    CreateSkill.test.js           # unit test di sebelah file-nya
  repositories/                   # interface (class abstrak, _notImplemented)
    SkillRepository.js
    mariadb/MariaDBSkillRepository.js   # implementasi Sequelize
  storages/FileStorage.js         # interface penyimpanan file
  infrastructure/
    container.js                  # composition root: rakit repository + use-case
    db/sequelizeClient.js
    db/models/<Name>.js           # model Sequelize (SkillModel, dst)
    storage/minioClient.js
    storage/MinioFileStorage.js   # implementasi FileStorage
  interfaces/http/<resource>/     # 1 plugin Hapi per resource
    index.js                      # { name, register(server) { server.route(routes) } }
    routes.js                     # array route + options (auth, validate, payload)
    handler.js                    # objek berisi async (request, h) => ...
    validator.js                  # skema Joi
```

Aliran dependensi yang benar:

```
routes → handler → container.<useCase>.execute() → <Repository>/FileStorage (interface)
                                                    ↑ diimplementasi oleh infrastructure/
```

**[pertahankan]**
- Pemisahan use-case/repository/infrastruktur. Use-case hanya bergantung pada
  interface yang diinjeksi lewat constructor, sehingga bisa dites dengan mock
  tanpa DB/MinIO (terbukti: 40 tes unit berjalan ±2,5 detik tanpa layanan luar).
- Satu plugin Hapi per resource dengan empat file (`index/routes/handler/validator`).
- Satu composition root (`container.js`) — tidak ada `new Repository()` tersebar.
- Interface repository sebagai class dengan `_notImplemented()` — kontraknya
  terbaca jelas walau JavaScript tidak punya `interface`.

**[perbaiki]**
- `handler.detail` di skills memanggil `container.skillRepository.findById`
  langsung (melewati use-case) dan membuat respons 404 sendiri. Alasan: dua jalur
  error berbeda untuk kasus yang sama, dan repository bocor ke lapisan HTTP.
  → Buat use-case `GetSkill`; container **tidak** mengekspor repository.
- Interface `FileStorage` ada di `src/storages/`, sedangkan interface repository
  ada di `src/repositories/`. → Untuk kode baru, letakkan interface penyimpanan di
  `src/storages/` (tetap) tetapi jangan menambah folder interface baru lain;
  konsisten: *interface di `src/<jenis>/`, implementasi di `src/infrastructure/`*
  — **kecuali** repository yang implementasinya sudah di `src/repositories/mariadb/`
  (biarkan, memindah tidak memberi manfaat).
- File mati: `models/index.js` (boilerplate sequelize-cli yang me-`require`
  `config/config.json` yang tidak ada → crash bila dipanggil) dan
  `src/use-cases/register.js` (memakai `ValidationError` yang tidak didefinisikan,
  method `call` bukan `execute`). → Hapus pada milestone pembersihan.
- Entity/repository `Education`, `Job`, `Profile`, `Project` belum dipakai dan
  modelnya tidak cocok dengan desain baru (lihat `docs/AUDIT.md`). → Ganti, jangan
  dipertahankan hanya karena sudah ada.

**[baru]**
- `server.js` dipecah: `src/server.js` mengekspor `createServer()` (register
  plugin, auth, ext — **tanpa** `start()`), dan `src/index.js` (atau
  `src/main.js`) yang memanggil `createServer()` lalu `start()`. Alasan: tes
  integrasi bisa memakai `server.inject()` tanpa membuka port.
- Konfigurasi lingkungan dipusatkan di `src/config.js` (lihat §5).
- Lapisan HTTP admin dan publik dipisah per prefix (`/api/v1/admin/...` vs
  `/api/v1/...`) tetapi boleh berbagi `validator.js` dalam satu folder resource.

## 2. Konvensi penamaan

| Hal | Konvensi yang dipakai | Contoh |
|---|---|---|
| Folder | kebab-case, jamak untuk koleksi | `use-cases/`, `social-media/`, `entities/` |
| File berisi class | PascalCase, sama dengan nama class | `CreateSkill.js`, `MinioFileStorage.js` |
| File modul non-class | camelCase | `sequelizeClient.js`, `minioClient.js`, `container.js` |
| File HTTP plugin | huruf kecil tetap | `index.js`, `routes.js`, `handler.js`, `validator.js` |
| File tes | `<NamaFile>.test.js` di folder yang sama | `UpdateSkill.test.js` |
| Migrasi/seeder | `YYYYMMDDHHmmss-verb_snake_case.js` | `20260722100438-create_skills_table.js` |
| Use-case | `KataKerjaBenda` | `ListSkills`, `UploadSkillLogo`, `GetSocialMediaByPlatform` |
| Implementasi repository | `<Teknologi><Resource>Repository` | `MariaDBSkillRepository` |
| Model Sequelize | `<Name>Model` sebagai variabel, `define('<Name>')` | `SkillModel` |
| Properti privat | prefiks `_` | `this._skillRepository`, `this._client` |
| Instance di container | camelCase dari nama class | `listSkills`, `uploadSkillLogo` |
| Skema Joi | `<aksi><Resource><Bagian>Schema` | `createSkillPayloadSchema`, `idParamSchema` |
| Nama plugin Hapi | `<resource>-plugin` | `skills-plugin` |
| Kolom DB | snake_case, dipetakan ke camelCase via `field:`/`underscored: true` | `logo_url` ↔ `logoUrl` |
| Tabel DB | snake_case jamak | `skills`, `social_media`, `users` |
| Endpoint | kebab-case, kata benda jamak | `/skills/{id}/logo`, `/profile/social-media` |
| Variabel env | SCREAMING_SNAKE, berprefiks layanan | `DATABASE_HOST`, `MINIO_BUCKET`, `JWT_SECRET` |

**[perbaiki]**
- Nama `MariaDB...Repository` dipertahankan, tetapi dialek Sequelize di
  `config/config.js` adalah `mysql`. Itu sah (MariaDB kompatibel dengan driver
  `mysql2`), namun tulis di README bahwa server-nya MariaDB agar tidak membingungkan.
- Repository interface `SocialMediaRepository` memakai `platform` sebagai kunci.
  Desain baru memerlukan `id` + urutan (lihat AUDIT). Kunci alami boleh dipakai
  hanya bila memang unik dan tidak bisa diubah pengguna.

**[baru]**
- Bentuk JSON di HTTP mengikuti keputusan di AUDIT §5 (snake_case atau camelCase).
  Apa pun pilihannya, konversi dilakukan **di handler/presenter**, bukan di entity
  atau repository, supaya domain tetap camelCase seperti sekarang.
- Endpoint reorder: `PATCH /<resource>/reorder`.

## 3. Gaya modul, async, dan format

| Aspek | Yang dipakai | Status |
|---|---|---|
| Modul | CommonJS (`"type": "commonjs"`, `require`/`module.exports`) | **[pertahankan]** — tidak ada alasan kuat pindah ke ESM sekarang; Jest, sequelize-cli, dan migrasi semuanya CommonJS. Pindah ESM menambah risiko tanpa fitur baru. |
| Built-in Node | campuran `'crypto'`, `'path'` dan `'node:stream/consumers'` | **[perbaiki]** — pakai prefiks `node:` untuk semua modul bawaan (`require('node:crypto')`), lebih eksplisit. |
| Asinkron | `async/await` di semua lapisan, tanpa callback | **[pertahankan]** |
| Return promise | `return this._repo.save(x)` tanpa `await` bila tidak perlu try/catch | **[pertahankan]** |
| Indentasi | 2 spasi (juga di `.vscode/settings.json`) | **[pertahankan]** |
| Tanda kutip | kutip tunggal `'...'`; template literal untuk interpolasi | **[pertahankan]** |
| Titik koma | dipakai hampir di semua file; **hilang** di beberapa (`social-media/handler.js`, `social-media/validator.js`, `UpdateSocialMedia.js`, beberapa tes) | **[perbaiki]** — wajib titik koma. |
| Trailing comma | dipakai pada objek/array multi-baris, tidak konsisten di beberapa migrasi | **[perbaiki]** — wajib pada multi-baris (`es5`). |
| Panjang baris | sebagian besar < 100, beberapa > 110 | **[baru]** — batas 100 (dibungkus otomatis oleh Prettier). |
| `'use strict'` | hanya di `server.js` dan sebagian migrasi | **[perbaiki]** — tidak wajib di CommonJS modern; untuk konsistensi **jangan** ditambahkan ke file baru, dan hapus saat file disentuh. |
| Import tak terpakai | `NotFoundError` di `skills/handler.js`, `streamConsumers` di `social-media/handler.js` | **[perbaiki]** — dicegah oleh ESLint `no-unused-vars`. |
| Dependensi implisit | `@hapi/boom` dipakai tetapi tidak ada di `package.json` (terbawa transitif dari Hapi) | **[perbaiki]** — semua `require` paket luar wajib terdaftar. |

**Lint/format:** tidak ada konfigurasi ESLint/Prettier di repo (hanya
`.vscode/settings.json` dengan `formatOnSave`; formatter default-nya tidak bisa
diverifikasi dari repo). **[baru]** Tambahkan:

```jsonc
// .prettierrc  — mengunci gaya yang sudah dominan di repo
{ "singleQuote": true, "semi": true, "trailingComma": "es5", "printWidth": 100, "tabWidth": 2 }
```

ESLint flat config (`eslint.config.js`, CommonJS) dengan `@eslint/js`
recommended + `eslint-config-prettier` + `globals.node`/`globals.jest`. Script:
`"lint": "eslint ."`, `"format": "prettier --write ."`.

## 4. Penanganan error

Pola sekarang:
1. Use-case melempar error domain (`NotFoundError`, `AuthenticationError`),
   class yang extends `Error` dengan `this.name` diset.
2. Hapi otomatis membungkus error yang dilempar handler menjadi Boom 500, lalu
   `server.ext('onPreResponse')` di `server.js` memetakan berdasarkan
   `instanceof` ke 404/401; error Boom < 500 diteruskan apa adanya; sisanya
   dicatat `console.error` dan dibalas 500 dengan pesan generik.

**[pertahankan]**
- Error domain sebagai class, dipetakan di **satu** tempat (`onPreResponse`).
- Pesan 500 generik ke klien, detail hanya di log.
- Use-case melakukan *fail-fast* (`if (!existing) throw new NotFoundError(...)`)
  sebelum memanggil dependensi berikutnya.

**[perbaiki]**
- `social-media/handler.js` mengecek `if (!result) throw new NotFoundError` lagi,
  padahal use-case sudah melempar → kode mati; hapus.
- `skills/handler.js` punya `errorResponse()` sendiri dengan format beda → hapus,
  lempar error domain saja.
- Setiap error domain baru harus menambah cabang `instanceof` di `server.js`.
  → **[baru]** buat base class:

```js
// src/exceptions/ClientError.js
class ClientError extends Error {
  constructor(message, { statusCode = 400, code = 'BAD_REQUEST', details } = {}) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
module.exports = ClientError;

// src/exceptions/NotFoundError.js
const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message) {
    super(message, { statusCode: 404, code: 'NOT_FOUND' });
    this.name = 'NotFoundError';
  }
}
module.exports = NotFoundError;
```

  `onPreResponse` cukup memeriksa `instanceof ClientError`, dan juga memetakan
  Boom bawaan (400 validasi, 401 JWT, 413 payload, 415 media type) ke format
  error yang sama (`{ error: { code, message, details } }`, lihat AUDIT §5).
  Error domain yang dibutuhkan: `NotFoundError`, `AuthenticationError`
  (`INVALID_CREDENTIALS`), `ConflictError`, `InvariantError`/`ValidationError`
  (aturan bisnis, mis. `show_button` tanpa `link_url`), `PayloadTooLargeError`,
  `UnsupportedMediaTypeError`.
- Entity `User` melempar `Error` biasa untuk input kosong → jadi 500. Gunakan
  `InvariantError` agar menjadi 400 bila sampai ke klien.

**Bahasa pesan:** kode lama memakai bahasa Indonesia (`'Skill dengan id 1 tidak
ditemukan'`). UI admin berbahasa Inggris dan menampilkan pesan dari API
(Toast/field error). → Keputusan pemilik (AUDIT §6). Sampai diputuskan: **`code`
mesin-baca wajib ada**, sehingga UI bisa memetakan teksnya sendiri.

## 5. Validasi input & konfigurasi lingkungan

**Validasi**
- **[pertahankan]** Joi di `validator.js`, dipasang lewat `options.validate`
  (`params`, `query`, `payload`) di `routes.js` — validasi terjadi sebelum handler.
- **[pertahankan]** Validasi tipe/format di Joi; aturan bisnis (mis. relasi antar
  field yang butuh data DB) di use-case.
- **[perbaiki]** Belum ada `failAction` → Hapi membalas 400 generik
  ("Invalid request payload input") tanpa detail field; UI butuh pesan per field.
  → set `routes.validate.failAction` global di `createServer()` yang mengubah
  `err.details` Joi menjadi `details: [{ field, message }]`.
- **[perbaiki]** Validasi MIME upload memakai header `content-type` dari klien
  (bisa dipalsukan) dan ekstensi file diambil dari nama file pengguna.
  → periksa *magic bytes* isi file (lihat AUDIT strategi upload).
- **[baru]** Skema Joi: `.trim()` untuk string teks, `.uri({ scheme: ['https'] })`
  untuk URL, `.max()` sesuai kolom DB, `options: { stripUnknown: true }` untuk
  payload admin agar field liar tidak lolos ke use-case.

**Konfigurasi lingkungan**
- Saat ini `process.env` dibaca di empat tempat (`server.js`, `container.js`,
  `minioClient.js`, `config/config.js`) dan `dotenv` dipanggil di tiga tempat.
  Tidak ada validasi: env yang hilang baru ketahuan saat runtime
  (mis. `Number(undefined)` → `NaN` untuk `JWT_EXPIRES_IN_SECONDS`).
- `config/config.js` hanya punya `development` dan `test`; `NODE_ENV=production`
  menghasilkan `config === undefined` → crash di `sequelizeClient.js`.
- `.env.example` hanya berisi `SERVER_HOST`/`SERVER_PORT`; variabel lain tidak
  terdokumentasi. `.env` masih memuat komentar & `DATABASE_URL` sisa Prisma.

**[baru]**
```js
// src/config.js — satu-satunya tempat membaca process.env di src/
require('dotenv').config();
const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  SERVER_HOST: Joi.string().default('localhost'),
  SERVER_PORT: Joi.number().port().default(3000),
  JWT_SECRET: Joi.string().min(32).required(),
  // ...
}).unknown(true);

const { value: env, error } = schema.validate(process.env);
if (error) throw new Error(`Konfigurasi env tidak valid: ${error.message}`);

module.exports = {
  env: env.NODE_ENV,
  server: { host: env.SERVER_HOST, port: env.SERVER_PORT },
  jwt: { secret: env.JWT_SECRET /* ... */ },
};
```
`config/config.js` (untuk sequelize-cli) tetap ada dan menambah blok
`production`. `.env.example` memuat **semua** kunci dengan nilai contoh palsu.

## 6. Logging

Saat ini: `console.log` (server start, `unhandledRejection`) dan `console.error`
(error 500). Tidak ada log request, tidak ada level, `logging: false` di Sequelize.

**[perbaiki/baru]**
- Pakai logger Hapi (`request.log` / `server.log`) dengan plugin `hapi-pino`
  (JSON terstruktur, ada level, cocok untuk `docker logs`/Loki di homelab).
- Log 500 lewat `request.log(['error'], err)` di `onPreResponse`, bukan `console`.
- Jangan pernah mencatat password, token, header `authorization`, atau cookie
  (`redact` di pino).
- `unhandledRejection` memakai `console.error` + `process.exit(1)`; tambahkan
  penanganan `SIGTERM`/`SIGINT` → `server.stop({ timeout })` +
  `sequelize.close()` agar container berhenti rapi.

## 7. Tes

**[pertahankan]** (sudah terdokumentasi rapi di `docs/Testing.md`)
- Jest, file `*.test.js` bersebelahan dengan kode.
- Pola AAA dengan komentar `// ARRANGE`, `// ACT`, `// ASSERT`.
- Judul tes dalam bahasa Indonesia yang menjelaskan perilaku
  (`'melempar NotFoundError kalau skill tidak ditemukan'`).
- Mock dependensi lewat constructor (`jest.fn().mockResolvedValue(...)`),
  `jest.mock()` hanya untuk modul pihak ketiga (`bcrypt`, `@hapi/jwt`).
- Checklist skenario per use-case (happy path, fail-fast, 1 skenario error per
  dependensi, proteksi field, default parameter).

**[perbaiki]**
- Tes hanya di lapisan use-case + `MinioFileStorage`. Tidak ada tes route/handler
  (validasi, auth, kode status, format error) dan tidak ada tes repository ke DB.
- Data pribadi nyata (email admin) dipakai sebagai fixture di tes. → Pakai
  `admin@example.com`.

**[baru]**
- Tes integrasi HTTP: `createServer()` + `server.inject()` dengan container yang
  use-case-nya di-mock, di `src/interfaces/http/<resource>/routes.test.js`.
- Tes repository terhadap DB tes nyata (MariaDB tes / container) dijalankan
  terpisah: `npm run test:integration`, tidak ikut `npm test` default.
- Script `"test:coverage": "jest --coverage"`.

## 8. Migrasi & seeder

**[pertahankan]** sequelize-cli dengan migrasi `up/down`, kolom snake_case,
`created_at`/`updated_at`, `seederStorage: 'sequelize'` agar seeder tidak
dijalankan dua kali, password admin dari env (`ADMIN_PASSWORD`).

**[perbaiki]**
- Migrasi tidak menyetel `charset`/`collate`, sehingga bergantung pada default
  server (tidak bisa diverifikasi dari repo). → Tambahkan
  `{ charset: 'utf8mb4', collate: 'utf8mb4_uca1400_ai_ci' }` (default server MariaDB 11.4 kita) pada `createTable`
  baru (emoji diizinkan oleh desain).
- Seeder social media menulis `platform: 'linkedIn'`, validator menerima
  `'linkedin'`. Saat ini lolos hanya karena collation default case-insensitive.
  → Normalisasi ke huruf kecil.
- `bcrypt.hash(..., 10)` → cost 12 (sesuai API.md §10).
- Email admin di-hardcode di seeder → baca dari env (`ADMIN_EMAIL`).
- **[baru]** Satu migrasi = satu perubahan skema; perubahan data (mis. memindah
  `social_media` → `social_links`) dibuat sebagai migrasi tersendiri dengan
  `down` yang bisa membalik, dan dijalankan **setelah** backup.

## 9. Templat kode baru

Contoh minimal yang mengikuti seluruh aturan di atas.

```js
// src/use-cases/project/UpdateProject.js
const Project = require('../../entities/Project');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class UpdateProject {
  constructor(projectRepository) {
    this._projectRepository = projectRepository;
  }

  async execute(id, payload) {
    const existingProject = await this._projectRepository.findById(id);
    if (!existingProject) {
      throw new NotFoundError(`Project dengan id ${id} tidak ditemukan`);
    }

    const updatedProject = new Project({ ...existingProject, ...payload, id });
    if (updatedProject.showButton && !updatedProject.linkUrl) {
      throw new InvariantError('show_button membutuhkan link_url');
    }

    return this._projectRepository.update(id, updatedProject);
  }
}

module.exports = UpdateProject;
```

```js
// src/interfaces/http/projects/handler.js
const container = require('../../../infrastructure/container');

module.exports = {
  async update(request, h) {
    const project = await container.updateProject.execute(request.params.id, request.payload);
    return h.response({ data: project }).code(200);
  },
};
```

Aturan handler: hanya (1) mengambil input dari `request`, (2) memanggil satu
use-case, (3) membentuk respons. Tidak ada `try/catch`, tidak ada akses
repository, tidak ada logika bisnis.

**Pola yang sudah diterapkan (M1)** — ikuti untuk resource baru:
- `src/interfaces/http/<resource>/presenter.js` berisi `to<Resource>Response(entity)` yang
  memilih field **secara eksplisit** dan mengubahnya ke snake_case (K4). Handler selalu
  membalas `{ data: presenter(x) }` atau `{ data: [...], meta }`.
- Plugin didaftarkan di `createServer()` dalam array dengan `routes: { prefix: '/api/v1' }`.
- Pesan error untuk klien berbahasa Inggris (K10); komentar kode dan judul tes tetap Indonesia.
- Kegagalan non-fatal di use-case dicatat lewat `logger` yang diinjeksi dari container
  (`src/infrastructure/logger.js`), contoh: `DeleteSkill`.
- Tes route: `src/interfaces/http/<resource>/routes.test.js`, container di-mock dengan
  `jest.mock(..., () => require('<root>/test/helpers/http').createContainerMock())`, token
  dari `authHeader()`. Env palsu dipasang otomatis oleh `test/setupEnv.js`. Use-case baru
  wajib ditambahkan ke daftar `USE_CASES` di `test/helpers/http.js`.
- **Setiap endpoint/status baru wajib** didokumentasikan di `docs/openapi.yaml` dan diberi
  skenario di `test/contract/openapi.test.js`. Tes kontrak gagal bila route tidak
  terdokumentasi, body tidak cocok skema, atau ada status terdokumentasi yang tidak diuji.
  `docs/openapi.yaml` hanya memuat endpoint yang sudah ada — rencana tetap di `docs/design/API.md`.
- Kemampuan keamanan (hash password, token) memakai interface di `src/security/`
  (`PasswordHasher`, `TokenManager`) dengan implementasi di `src/infrastructure/security/`,
  sama seperti pola repository. Use-case tidak me-`require` `bcrypt`/`@hapi/jwt` langsung.
- Waktu "sekarang" yang memengaruhi logika diinjeksi (`{ now = () => new Date() }`) agar bisa diuji.
- Pemrosesan gambar memakai interface `src/media/ImageProcessor.js` (implementasi
  `src/infrastructure/media/SharpImageProcessor.js`). Jenis file SELALU ditentukan dari isi file,
  tidak pernah dari header/ekstensi klien.
- Container hanya mengekspor use-case, dengan satu pengecualian: `mediaUrlFor(key)` (fungsi murni
  object key → URL publik) yang dipakai presenter lewat `src/interfaces/http/shared/media.js`.
- Simpan *object key* di database, bukan URL penuh; URL dibentuk saat respons.
- Skema Joi yang dipakai lintas resource ada di `src/interfaces/http/shared/validation.js`
  (`plainText` menolak HTML, `httpsUrl`, `yearMonth`, `idParamSchema`, `reorderPayloadSchema`).
- Update parsial (PATCH) memakai `src/use-cases/pickDefined.js`: `undefined` = tidak diubah,
  `null` = dikosongkan.
- **Tes integrasi** (`test/integration/`, `npm run test:integration`) memakai database tes
  sungguhan dari `.env` (`DATABASE_TEST_NAME`) dan menolak berjalan di database lain
  (`assertTestDatabase()`). Data uji diberi penanda (mis. prefiks `[it] `) dan dibersihkan di
  `afterAll`. Tidak ikut `npm test`, jadi `npm test` tetap bisa jalan tanpa database.

## 10. Ringkasan cepat

| Lakukan | Hindari |
|---|---|
| CommonJS, `async/await`, 2 spasi, kutip tunggal, titik koma | Callback, ESM campuran, file tanpa titik koma |
| Use-case class + `execute()` + DI constructor | Logika bisnis/akses repository di handler |
| Lempar error domain (extends `ClientError`) | Membuat `h.response({...}).code(4xx)` manual |
| Joi di `validator.js` + `failAction` global | Validasi manual di handler |
| `require('../../config')` | `process.env.X` di luar `src/config.js` |
| `request.log` / pino | `console.log` |
| Tes use-case + tes route dengan `server.inject()` | Fixture berisi data pribadi asli |
| Migrasi baru dengan `utf8mb4` dan `down` yang membalik | Mengubah migrasi yang sudah dijalankan |
