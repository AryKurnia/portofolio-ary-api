# portofolio-ary-api

Backend API untuk website portofolio Ary Kurnia: konten publik (profil, skill, project, timeline,
sertifikat, social link) dan panel admin untuk mengelolanya.

- **Stack:** Node.js 26, Hapi 21, Sequelize 6 + MariaDB, MinIO (penyimpanan file), sharp (konversi gambar ke WebP).
- **Base URL:** `/api/v1`, mis. `GET /api/v1/portfolio`. Endpoint admin ada di `/api/v1/admin/*` (JWT).
- **Dokumentasi API:** [`docs/openapi.yaml`](docs/openapi.yaml) (OpenAPI 3.1).
- Dokumen lain: [`docs/DEPLOY.md`](docs/DEPLOY.md) (deploy Docker), [`docs/CODE_STYLE.md`](docs/CODE_STYLE.md),
  [`docs/Testing.md`](docs/Testing.md), [`docs/Commit-convention.md`](docs/Commit-convention.md),
  [`docs/AUDIT.md`](docs/AUDIT.md) (status milestone).

## Kebutuhan

| Komponen            | Versi                                                   | Keterangan                                             |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Node.js             | **26** (`.nvmrc`, `engines >=26`)                       | Versi lebih lama ditolak saat start dengan pesan jelas |
| npm                 | bawaan Node 26                                          |                                                        |
| MariaDB             | 11.4                                                    | Charset `utf8mb4`; satu DB utama + satu DB tes         |
| MinIO               | S3-compatible (dipakai: `RELEASE.2025-04-22T22-12-26Z`) | Satu bucket, publik **hanya baca**                     |
| Docker + Compose v2 | opsional untuk lokal, dipakai untuk deploy              | Cara termudah menjalankan MariaDB & MinIO              |

## 1. Instalasi

### Node.js (dengan nvm)

```bash
nvm install      # membaca .nvmrc → Node 26
nvm use
npm ci
```

### MariaDB & MinIO (lewat Docker)

Lewati bagian ini bila keduanya sudah berjalan.

```bash
# MariaDB 11.4
docker run -d --name mariadb-db-1 --restart unless-stopped \
  -e MARIADB_ROOT_PASSWORD='<password-root>' \
  -p 127.0.0.1:3306:3306 -v mariadb_data:/var/lib/mysql \
  mariadb:11.4 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

# MinIO (port 9000 = API S3, 9001 = console web)
docker run -d --name minio --restart unless-stopped \
  -e MINIO_ROOT_USER='<user-minio>' -e MINIO_ROOT_PASSWORD='<password-minio>' \
  -p 127.0.0.1:9000:9000 -p 127.0.0.1:9001:9001 -v minio_data:/data \
  minio/minio:RELEASE.2025-04-22T22-12-26Z server /data --console-address ':9001'
```

### Database

```bash
docker exec -it mariadb-db-1 mariadb -uroot -p
```

```sql
CREATE DATABASE portfolio_db      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE portfolio_test_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'portfolio'@'%' IDENTIFIED BY '<password-db>';
GRANT ALL PRIVILEGES ON portfolio_db.*      TO 'portfolio'@'%';
GRANT ALL PRIVILEGES ON portfolio_test_db.* TO 'portfolio'@'%';
```

### Storage (bucket MinIO)

Pakai MinIO Client `mc`, atau buat lewat console di `http://localhost:9001`:

```bash
mc alias set local http://localhost:9000 '<user-minio>' '<password-minio>'
mc mb local/portfolio
mc anonymous set download local/portfolio   # publik hanya boleh GET, tidak boleh upload/hapus/list
```

Disarankan membuat access key khusus aplikasi di console MinIO, alih-alih memakai user root.

## 2. Konfigurasi (wajib sebelum run)

```bash
cp .env.example .env
```

Isi `.env`. Semua variabel divalidasi saat start (`src/config.js`); kalau ada yang hilang atau salah, server
langsung berhenti dengan pesan `Konfigurasi env tidak valid: ...`.

| Variabel                                            | Wajib        | Default              | Keterangan                                                                                 |
| --------------------------------------------------- | ------------ | -------------------- | ------------------------------------------------------------------------------------------ |
| `NODE_ENV`                                          |              | `development`        | `development` / `test` / `production`                                                      |
| `SERVER_HOST`                                       |              | `localhost`          | `0.0.0.0` di dalam container                                                               |
| `SERVER_PORT`                                       |              | `3000`               |                                                                                            |
| `CORS_ORIGINS`                                      |              | kosong               | Origin web dipisah koma. Kosong = CORS mati. `*` hanya untuk lokal (ditolak di production) |
| `LOG_LEVEL`                                         |              | `info`               | `fatal` … `trace`, `silent`                                                                |
| `DATABASE_HOST`                                     | ✔            |                      | `localhost` lokal; nama container di Docker                                                |
| `DATABASE_USER`                                     | ✔            |                      |                                                                                            |
| `DATABASE_PASSWORD`                                 |              | kosong               |                                                                                            |
| `DATABASE_NAME`                                     | ✔            |                      | mis. `portfolio_db`                                                                        |
| `DATABASE_TEST_NAME`                                | untuk tes    |                      | mis. `portfolio_test_db`                                                                   |
| `MINIO_ENDPOINT`                                    | ✔            |                      | host saja, tanpa `http://`                                                                 |
| `MINIO_PORT`                                        | ✔            |                      | `9000`                                                                                     |
| `MINIO_USE_SSL`                                     |              | `false`              |                                                                                            |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`             | ✔            |                      |                                                                                            |
| `MINIO_BUCKET`                                      | ✔            |                      | mis. `portfolio`                                                                           |
| `MINIO_PUBLIC_URL`                                  | ✔            |                      | URL yang dipakai browser, mis. `http://localhost:9000`                                     |
| `JWT_SECRET`                                        | ✔            |                      | Production minimal 32 karakter: `openssl rand -base64 48`                                  |
| `JWT_EXPIRES_IN_SECONDS`                            | ✔            |                      | Masa berlaku access token; disarankan `900`                                                |
| `REFRESH_TOKEN_TTL_SECONDS`                         |              | `604800` (7 hari)    | Masa berlaku refresh token (cookie HttpOnly)                                               |
| `COOKIE_SECURE`                                     |              | `true` di production | Biarkan `false` untuk `http://localhost`                                                   |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | untuk seeder |                      | Akun admin awal                                                                            |
| `MEDIA_ORPHAN_MIN_AGE_HOURS`                        |              | `24`                 | Umur minimum media yatim yang dihapus `media:cleanup`                                      |

`.env` jangan pernah di-commit (sudah ada di `.gitignore`).

## 3. Migrasi & data awal

```bash
npm run db:migrate          # buat/ubah tabel di DATABASE_NAME
npx sequelize-cli db:seed:all   # akun admin (ADMIN_*) + konten awal portofolio
npm run test:migrate        # tabel di DB tes (untuk tes integrasi)
```

Backup database utama sebelum menjalankan migrasi baru (contoh perintah ada di [`docs/DEPLOY.md`](docs/DEPLOY.md#3-backup-database-lalu-migrasi)).

## 4. Menjalankan

```bash
npm run start-dev   # pengembangan, auto-restart (nodemon)
npm start           # tanpa auto-restart
```

Cek: `curl http://localhost:3000/api/v1/health` harus membalas `{"data":{"status":"ok",...}}`.
Kalau DB atau MinIO tidak terjangkau, statusnya 503.

Kalau muncul `EADDRINUSE: address already in use 127.0.0.1:3000`, berarti server lain (biasanya `npm run start-dev`
di terminal lain) masih berjalan. Hentikan dulu, atau pakai port lain: `SERVER_PORT=3001 npm run start-dev`.

## 5. Tes & kualitas kode

```bash
npm test                  # unit + route + kontrak OpenAPI (tanpa DB/MinIO)
npm run test:coverage
npm run test:integration  # DB tes + MinIO sungguhan (jalankan `npm run test:migrate` dulu)
npm run lint
npm run format:check      # `npm run format` untuk merapikan
```

Tes integrasi hanya memakai `DATABASE_TEST_NAME` dan objek berawalan `it-test/` di bucket, lalu
membersihkannya kembali.

## 6. Menjalankan dengan Docker

Image berisi API saja. MariaDB dan MinIO memakai container yang sudah ada, tersambung lewat network
`portfolio_net`. Ringkasnya:

```bash
docker network create portfolio_net
docker network connect portfolio_net mariadb-db-1
docker network connect portfolio_net minio

cp .env.example .env.production && chmod 600 .env.production
# isi: DATABASE_HOST=mariadb-db-1, MINIO_ENDPOINT=minio, MINIO_PORT=9000, CORS_ORIGINS, JWT_SECRET, dst.

docker compose build
docker compose run --rm api npm run db:migrate   # backup DB dulu
docker compose up -d
docker compose ps                                # tunggu (healthy)
```

API terbuka di `127.0.0.1:3000` untuk diteruskan oleh Nginx (HTTPS + rate limit). Panduan lengkap (backup,
Nginx, cron, update, rollback) ada di [`docs/DEPLOY.md`](docs/DEPLOY.md).

## 7. Pemeliharaan

- `npm run media:cleanup` menghapus file upload yang tidak dipakai lebih dari 24 jam. Jadwalkan harian (cron).
- Struktur kode (entities → use-cases → repositories → interfaces/http) dijelaskan di
  [`docs/CODE_STYLE.md`](docs/CODE_STYLE.md).
