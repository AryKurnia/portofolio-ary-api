# Deploy dengan Docker (homelab)

Topologi yang dipakai:

```
Internet ──HTTPS──▶ Nginx (host)
                     ├─ api.example.com      ──▶ 127.0.0.1:3000 ──▶ container `api` (compose ini)
                     └─ storage.example.com  ──▶ 127.0.0.1:9000 ──▶ container `minio` (sudah ada)

Network Docker `portfolio_net`:  api ──▶ mariadb-db-1:3306
                                 api ──▶ minio:9000
```

- `docker-compose.yml` **hanya** berisi API. MariaDB dan MinIO tetap container yang sudah berjalan, jadi
  datanya tidak dipindah.
- Port API hanya dibuka ke `127.0.0.1`. Rate limit login/upload ada di Nginx
  ([`deploy/nginx.conf.example`](deploy/nginx.conf.example)), jadi jangan buka API langsung ke internet.
- Container berjalan sebagai user `node` (bukan root), filesystem read-only, memori dibatasi 512 MB.

## 1. Persiapan sekali saja

```bash
# Network bersama untuk API, MariaDB, dan MinIO.
docker network create portfolio_net
docker network connect portfolio_net mariadb-db-1
docker network connect portfolio_net minio

# Cek: kedua container sekarang juga ada di portfolio_net.
docker network inspect portfolio_net --format '{{range .Containers}}{{.Name}} {{end}}'
```

`docker network connect` tidak me-restart container dan tidak memutus network lamanya. Bila nama container
di server berbeda, sesuaikan nama di atas dan di `DATABASE_HOST` / `MINIO_ENDPOINT`.

## 2. Berkas env production

```bash
cp .env.example .env.production
chmod 600 .env.production
```

Isi `.env.production` (jangan di-commit; sudah di-ignore git dan tidak ikut masuk image):

| Variabel | Nilai production |
| --- | --- |
| `NODE_ENV` | `production` (juga dipaksa oleh compose) |
| `SERVER_HOST` / `SERVER_PORT` | dipaksa compose ke `0.0.0.0` / `3000`, tidak perlu diisi |
| `CORS_ORIGINS` | domain web, mis. `https://arykurnia.my.id`; **tidak boleh** `*` |
| `DATABASE_HOST` | `mariadb-db-1` (nama container, bukan `localhost`) |
| `DATABASE_USER` / `DATABASE_PASSWORD` / `DATABASE_NAME` | user & DB production |
| `MINIO_ENDPOINT` / `MINIO_PORT` / `MINIO_USE_SSL` | `minio` / `9000` / `false` (jalur internal Docker) |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` / `MINIO_BUCKET` | kredensial & bucket |
| `MINIO_PUBLIC_URL` | URL publik storage, mis. `https://storage.example.com` |
| `JWT_SECRET` | minimal 32 karakter: `openssl rand -base64 48` |
| `JWT_EXPIRES_IN_SECONDS` | `900` (15 menit; sesi diperpanjang lewat refresh token) |
| `COOKIE_SECURE` | kosongkan (otomatis `true` di production) |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | hanya untuk seeder admin; boleh dihapus setelah seed |

Aplikasi memvalidasi semua env saat start (`src/config.js`). Kalau ada yang salah, container langsung
berhenti dengan pesan `Konfigurasi env tidak valid: ...` di `docker compose logs api`.

## 3. Backup database, lalu migrasi

Lakukan **setiap** kali ada migrasi baru.

```bash
mkdir -p ~/backups/portofolio-ary-api && chmod 700 ~/backups/portofolio-ary-api
( umask 077; docker exec mariadb-db-1 sh -c \
  'mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --routines --triggers portfolio_db' \
  > ~/backups/portofolio-ary-api/portfolio_db-$(date +%Y%m%d-%H%M)-sebelum-deploy.sql )

docker compose build
docker compose run --rm api npm run db:migrate
```

Untuk instalasi baru (DB kosong), lanjutkan dengan seeder admin dan konten awal:

```bash
docker compose run --rm api npx sequelize-cli db:seed:all
```

## 4. Jalankan

```bash
docker compose up -d
docker compose ps                                   # STATUS harus (healthy)
curl -s http://127.0.0.1:3000/api/v1/health         # {"data":{"status":"ok",...}}
docker compose logs -f api                          # log JSON (pino)
```

Healthcheck memanggil `/api/v1/health`, yang membalas 503 bila DB atau storage tidak terjangkau. Pada kondisi
itu container ditandai `unhealthy`.

## 5. Nginx

Salin [`deploy/nginx.conf.example`](deploy/nginx.conf.example), ganti domain dan path sertifikat TLS, lalu:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 6. Pembersihan media yatim (cron)

File yang diunggah tapi tidak dipakai lebih dari 24 jam dihapus oleh `npm run media:cleanup`. Jadwalkan di host
(`crontab -e`):

```cron
0 3 * * * cd /path/ke/portofolio-ary-api && docker compose exec -T api npm run media:cleanup >> /var/log/portfolio-media-cleanup.log 2>&1
```

## 7. Update versi

```bash
git pull
# bila ada berkas baru di migrations/: backup dulu (langkah 3)
docker compose build
docker compose run --rm api npm run db:migrate
docker compose up -d          # container lama dihentikan rapi (SIGTERM, maks. 10 detik)
docker image prune -f
```

Rollback cepat: kembali ke commit sebelumnya, `docker compose up -d --build`. Bila migrasi sudah jalan dan
perlu dibatalkan: `docker compose run --rm api npx sequelize-cli db:migrate:undo` atau pulihkan dari backup.

## Catatan keamanan lanjutan (belum dikerjakan)

- Pisahkan user DB: aplikasi cukup DML (`SELECT/INSERT/UPDATE/DELETE`), migrasi memakai user lain.
- Cek kebijakan bucket MinIO di server: anonim hanya `s3:GetObject` (seperti lokal, lihat AUDIT.md S10).
