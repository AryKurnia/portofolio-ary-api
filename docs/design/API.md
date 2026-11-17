# Portofolio API — Spesifikasi RESTful

Panduan untuk sesi pembuatan REST API yang melayani **halaman portofolio** (publik) dan **Admin / Content Manager** (CRUD). Spesifikasi ini diturunkan dari desain di `Portofolio-Design-Redesign.figcraft` dan `DESIGN.md`.

| | |
|---|---|
| **Base URL** | `/api/v1` |
| **Format** | JSON (`application/json; charset=utf-8`), upload `multipart/form-data` |
| **Auth** | JWT — access token (Bearer) + refresh token (cookie `httpOnly`) |
| **Konvensi** | Field `snake_case`, ID `uuid` (atau integer, lihat §12), waktu ISO 8601 UTC |
| **Status dokumen** | Draft 1 — 11 November 2026 |

---

## 1. Ringkasan Kebutuhan dari Desain

| Area UI (DESIGN.md) | Resource API |
|---|---|
| Hero (#home): greeting, tagline | `profile` |
| #about-me: paragraf | `profile.about` |
| #skills: tile per kategori (Frontend/Backend) | `skill_categories`, `skills` |
| #project: kartu + Projects Archive | `projects` (+ `profile.project_intro`) |
| #experience: Education & Work & Organization (model LinkedIn) | `organizations`, `positions` |
| #contact-me: email + social links | `profile.email`, `social_links` |
| Admin Login / Log out | `auth` |
| Upload gambar/logo (PNG, JPG, SVG ≤ 2 MB) | `uploads` |
| Drag untuk urutan (ikon Grip) | endpoint `reorder` per resource |

---

## 2. Model Data

### 2.1 `admins`
| Field | Tipe | Aturan |
|---|---|---|
| `id` | uuid | PK |
| `username` | string(50) | unik, wajib |
| `password_hash` | string | bcrypt/argon2, **tidak pernah dikirim** di response |
| `created_at`, `updated_at` | timestamp | otomatis |

### 2.2 `profile` (singleton — selalu 1 baris)
| Field | Tipe | Aturan | Dipakai di |
|---|---|---|---|
| `greeting` | string(80) | wajib | Hero — "Hi, I'm Ary Kurnia" |
| `tagline` | string(120) | wajib | Hero — "a Web and Back-End developer" |
| `about` | text(1000) | wajib | #about-me |
| `project_intro` | string(200) | opsional | Intro #project & Projects Archive |
| `email` | string(254) | wajib, format email | #contact-me |
| `updated_at` | timestamp | otomatis | |

### 2.3 `social_links`
| Field | Tipe | Aturan |
|---|---|---|
| `id` | uuid | PK |
| `platform` | enum | `github` · `facebook` · `instagram` · `linkedin` · `discord` · `other` |
| `label` | string(40) | opsional; default dari `platform` (mis. "GitHub") |
| `url` | string(2048) | wajib, `https://` |
| `sort_order` | int | urutan tampil |

### 2.4 `skill_categories`
| Field | Tipe | Aturan |
|---|---|---|
| `id` | uuid | PK |
| `name` | string(40) | unik — mis. "Frontend", "Backend", "Tools" |
| `sort_order` | int | |

### 2.5 `skills`
| Field | Tipe | Aturan |
|---|---|---|
| `id` | uuid | PK |
| `category_id` | uuid | FK → `skill_categories.id`, wajib |
| `name` | string(40) | wajib — mis. "Node.js" |
| `logo_url` | string | wajib (hasil `uploads`) |
| `sort_order` | int | urutan di dalam kategori |

### 2.6 `projects`
| Field | Tipe | Aturan | Catatan UI |
|---|---|---|---|
| `id` | uuid | PK | |
| `title` | string(60) | wajib | Judul kartu (1 baris) |
| `description` | string(300) | wajib | Kartu menampilkan maks 2 baris (dipotong di frontend) |
| `image_url` | string | wajib | Rasio kartu ±2:1 (min 800×400 disarankan) |
| `link_url` | string(2048) | opsional, `https://` | Tombol "Visit" |
| `show_button` | boolean | default `true` | Wajib `false` bila `link_url` kosong |
| `is_published` | boolean | default `true` | Hanya yang `true` tampil di publik |
| `sort_order` | int | | Portofolio menampilkan 6 teratas |
| `created_at`, `updated_at` | timestamp | | |

### 2.7 `organizations` (instansi — model LinkedIn)
| Field | Tipe | Aturan |
|---|---|---|
| `id` | uuid | PK |
| `name` | string(120) | wajib — mis. "UKM MAPALA Universitas Handayani Makassar" |
| `group` | enum | `education` · `work_organization` |
| `location` | string(80) | opsional |
| `sort_order` | int | opsional (default urutan dihitung, lihat §6) |

### 2.8 `positions` (posisi di dalam instansi)
| Field | Tipe | Aturan | Catatan UI |
|---|---|---|---|
| `id` | uuid | PK | |
| `organization_id` | uuid | FK → `organizations.id`, wajib, `ON DELETE CASCADE` | |
| `title` | string(120) | wajib | Jabatan, atau jenjang & jurusan untuk Education (mis. "S2 Teknik Informatika, Fakultas Teknik") |
| `type` | enum | lihat tabel di bawah | Ditampilkan "Title · Type" |
| `event_name` | string(120) | **wajib jika `type = committee`**, selain itu `null` | "Ketua Panitia · Committee · [Nama Acara]" |
| `start_date` | date (`YYYY-MM`) | wajib | Ditampilkan tahunnya saja |
| `end_date` | date (`YYYY-MM`) | opsional | `null` + `is_current=false` untuk committee 1 tahun |
| `is_current` | boolean | default `false` | Chip "Current", periode "… – Present" |
| `description` | text(500) | opsional | |
| `sort_order` | int | opsional | |

**Enum `type`**

| Kelompok | Nilai |
|---|---|
| Pekerjaan | `full_time` · `part_time` · `freelance` · `contract` · `internship` · `self_employed` |
| Organisasi / kegiatan | `member` · `board` · `committee` · `volunteer` |
| Pendidikan | `education` (dipakai untuk posisi di organisasi grup `education`) |

---

## 3. Aturan Bisnis & Validasi

1. **Periode**
   - `is_current = true` → `end_date` wajib `null`.
   - `end_date` (jika ada) ≥ `start_date`.
   - `type = committee` → `event_name` wajib; `end_date` opsional (acara 1 tahun cukup `start_date`).
   - `start_date` tidak boleh di masa depan lebih dari 1 tahun.
2. **Konsistensi grup**: posisi di organisasi `group = education` memakai `type = education`; organisasi `work_organization` tidak boleh memakai `type = education`.
3. **Project**: `show_button = true` mensyaratkan `link_url` terisi.
4. **Teks**: trim spasi; tolak HTML (simpan plain text). Emoji diizinkan (UTF-8 / `utf8mb4`).
5. **URL**: hanya `https://`; tolak `javascript:` dan sejenisnya.
6. **Upload**: `image/png`, `image/jpeg`, `image/svg+xml`, maks **2 MB**; SVG wajib disanitasi (hapus `<script>`, event handler, `foreignObject`).
7. **Hapus organisasi** ikut menghapus semua posisinya (UI menampilkan dialog konfirmasi).

---

## 4. Format Response

### Sukses
```json
{ "data": { ... } }
```
List:
```json
{ "data": [ ... ], "meta": { "total": 3, "page": 1, "limit": 12 } }
```

### Error (dipakai untuk Toast/Error State di UI)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields are invalid.",
    "details": [
      { "field": "event_name", "message": "Event name is required for committee positions." }
    ]
  }
}
```

| HTTP | `code` | Kapan | Pesan UI |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Input tidak valid | Pesan per field di panel form |
| 401 | `UNAUTHORIZED` | Token hilang/kedaluwarsa | Redirect ke Admin Login |
| 401 | `INVALID_CREDENTIALS` | Login salah | "Invalid username or password." |
| 403 | `FORBIDDEN` | Akses ditolak | — |
| 404 | `NOT_FOUND` | Resource tidak ada | — |
| 409 | `CONFLICT` | Nama duplikat (mis. kategori) | Pesan di field |
| 413 | `PAYLOAD_TOO_LARGE` | File > 2 MB | "File must be 2 MB or smaller." |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Format file salah | "Use PNG, JPG or SVG." |
| 429 | `RATE_LIMITED` | Terlalu banyak percobaan | "Too many attempts. Try again later." |
| 500 | `INTERNAL_ERROR` | Kesalahan server | Toast "Couldn't save changes" / Error State "Couldn't load content" |

---

## 5. Endpoint Publik (tanpa auth)

Dipakai halaman portofolio. Hanya data `is_published = true`.

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/portfolio` | **Semua data dalam satu request** (untuk SSR/ISR halaman utama) |
| GET | `/profile` | Greeting, tagline, about, project_intro, email |
| GET | `/skills` | Dikelompokkan per kategori |
| GET | `/projects?page=1&limit=12` | Untuk Projects Archive (urut `sort_order`) |
| GET | `/projects/:id` | Detail project (cadangan untuk halaman detail) |
| GET | `/timeline` | Education & Work & Organization, sudah terurut & terkelompok |
| GET | `/social-links` | Urut `sort_order` |

### Contoh `GET /portfolio`
```json
{
  "data": {
    "profile": {
      "greeting": "Hi, I'm Ary Kurnia",
      "tagline": "a Web and Back-End developer",
      "about": "Saya adalah lulusan S1 Teknik Informatika ...",
      "project_intro": "Berikut merupakan project yang pernah dikerjakan baik individu dan juga tim",
      "email": "user@example.com"
    },
    "skills": [
      { "category": "Frontend", "items": [ { "id": "…", "name": "HTML5", "logo_url": "…" } ] },
      { "category": "Backend",  "items": [ { "id": "…", "name": "Node.js", "logo_url": "…" } ] }
    ],
    "projects": {
      "items": [
        { "id": "…", "title": "FitAI Coach", "description": "…", "image_url": "…", "link_url": "https://…", "show_button": true }
      ],
      "total": 3,
      "has_more": false
    },
    "timeline": {
      "education": [ /* lihat contoh /timeline */ ],
      "work_organization": [ /* … */ ]
    },
    "social_links": [ { "platform": "github", "label": "GitHub", "url": "https://github.com/…" } ]
  }
}
```
`projects.items` berisi maks **6** item; `has_more = true` memunculkan tombol "See all projects".

### Contoh `GET /timeline`
Organisasi dengan 1 posisi tampil sebagai `Timeline Item`; dengan ≥ 2 posisi tampil sebagai `Timeline Group`. API selalu mengirim struktur organisasi → posisi; frontend memilih komponennya.
```json
{
  "data": {
    "work_organization": [
      {
        "id": "…",
        "name": "Ikhwannet Somba Palioi",
        "is_current": true,
        "positions": [
          {
            "id": "…", "title": "Co-Founder", "type": "full_time", "type_label": "Full-time",
            "event_name": null, "start_date": "2025-01", "end_date": null, "is_current": true,
            "period_label": "2025 – Present"
          }
        ]
      },
      {
        "id": "…",
        "name": "UKM MAPALA Universitas Handayani Makassar",
        "is_current": false,
        "positions": [
          { "title": "Sekretaris Umum", "type": "board", "type_label": "Board", "period_label": "2023 – 2025" },
          { "title": "Ketua Panitia", "type": "committee", "type_label": "Committee", "event_name": "Nama Acara", "period_label": "2024" },
          { "title": "Anggota", "type": "member", "type_label": "Member", "period_label": "2022 – 2025" }
        ]
      }
    ],
    "education": [ /* struktur sama, type = "education" */ ]
  }
}
```
`period_label` dihitung server: `"YYYY – YYYY"` (en dash, spasi), `"YYYY – Present"` bila `is_current`, atau `"YYYY"` bila tanpa `end_date`.

---

## 6. Aturan Urutan

| Data | Urutan |
|---|---|
| Skill | kategori `sort_order` → skill `sort_order` |
| Project | `sort_order` ASC, lalu `created_at` DESC |
| Social link | `sort_order` ASC |
| Posisi di organisasi | `is_current` DESC → `start_date` DESC → `sort_order` |
| Organisasi di tiap grup | punya posisi current lebih dulu → `start_date` posisi terbaru DESC → `sort_order` |

Drag & drop di admin mengirim urutan baru lewat endpoint `reorder` (§7).

---

## 7. Endpoint Admin (Bearer token wajib)

Prefix: `/api/v1/admin`. Seluruh endpoint mengembalikan data lengkap (termasuk `is_published = false`).

### 7.1 Auth
| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ "username", "password" }` | `{ data: { access_token, expires_in, admin: { id, username } } }` + set cookie `refresh_token` |
| POST | `/auth/refresh` | — (cookie) | access token baru |
| POST | `/auth/logout` | — | 204, hapus cookie |
| GET | `/auth/me` | — | profil admin |

Access token berlaku 15 menit, refresh token 7 hari (rotasi setiap refresh). Login dibatasi 5 percobaan / 15 menit per IP.

### 7.2 Profile (#home, #about-me, intro, email)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/profile` | |
| PATCH | `/profile` | Partial update — tombol "Save changes" per section mengirim field section itu saja |

### 7.3 Skill categories & skills
| Method | Endpoint |
|---|---|
| GET / POST | `/skill-categories` |
| PATCH / DELETE | `/skill-categories/:id` (DELETE ditolak 409 bila masih berisi skill) |
| GET / POST | `/skills` |
| GET / PATCH / DELETE | `/skills/:id` |
| PATCH | `/skills/reorder` — `{ "category_id": "…", "ids": ["…","…"] }` |

### 7.4 Projects
| Method | Endpoint |
|---|---|
| GET / POST | `/projects` |
| GET / PATCH / DELETE | `/projects/:id` |
| PATCH | `/projects/reorder` — `{ "ids": [ … ] }` |

### 7.5 Organizations & positions (timeline)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/organizations?group=education` | Termasuk `positions` |
| POST | `/organizations` | `{ name, group, location? }` |
| PATCH / DELETE | `/organizations/:id` | DELETE menghapus posisinya (cascade) |
| POST | `/positions` | Panel "Timeline item". Field `organization_id` **atau** `organization_name` + `group` (membuat organisasi baru bila belum ada) |
| PATCH / DELETE | `/positions/:id` | |
| PATCH | `/organizations/:id/positions/reorder` | `{ "ids": [ … ] }` |

Contoh `POST /positions` (Ketua Panitia):
```json
{
  "organization_id": "…",
  "title": "Ketua Panitia",
  "type": "committee",
  "event_name": "Nama Acara",
  "start_date": "2024-01",
  "end_date": null,
  "is_current": false,
  "description": null
}
```

### 7.6 Social links
| Method | Endpoint |
|---|---|
| GET / POST | `/social-links` |
| PATCH / DELETE | `/social-links/:id` |
| PATCH | `/social-links/reorder` |

### 7.7 Uploads
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/uploads` | `multipart/form-data`, field `file`, query `kind=project_image\|skill_logo` → `{ data: { url, width, height, mime } }` |
| DELETE | `/uploads/:id` | Opsional; file yatim dibersihkan oleh job berkala |

Gambar project dikonversi ke WebP + ukuran responsif (mis. 400/800/1200 px); logo SVG disimpan apa adanya setelah sanitasi.

---

## 8. Kaitan dengan State UI

| State di desain | Perilaku API / klien |
|---|---|
| Skeleton (Loading) | Klien menampilkan skeleton bila request > 300 ms |
| Error State "Couldn't load content" | Timeout klien 5 dtk atau status 5xx pada GET publik |
| Button "Saving…" | Selama POST/PATCH/DELETE berlangsung |
| Toast "Changes saved" / "Item deleted" | Respons 200/201/204 |
| Toast "Couldn't save changes" | 5xx atau jaringan gagal; 400 ditampilkan per field |
| Empty State | List kosong (`data: []`) |

---

## 9. Caching & Revalidasi

- GET publik: `Cache-Control: public, max-age=60, stale-while-revalidate=300` + `ETag`.
- Setiap write di admin memicu **revalidasi** halaman portofolio (mis. webhook ISR `POST /revalidate` di frontend, atau purge CDN).
- Admin GET: `Cache-Control: no-store`.

---

## 10. Keamanan

- Password di-hash (argon2id atau bcrypt cost ≥ 12).
- Refresh token di cookie `httpOnly; Secure; SameSite=Strict`; access token hanya di memori klien.
- CORS hanya untuk domain portofolio & admin.
- Header keamanan: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`.
- Rate limit login (§7.1) dan endpoint upload.
- Validasi skema di setiap endpoint (Joi/Zod); query DB terparameter.
- Log audit sederhana: siapa mengubah apa & kapan.

---

## 11. Data Awal (Seed)

Isi dari desain (placeholder ditandai ⚠️):
- **Profile**: greeting, tagline, about, project_intro (lihat §5), email.
- **Skill categories**: Frontend (HTML5, CSS3, JavaScript), Backend (Node.js, hapi).
- **Projects** ⚠️ dummy: Nature Music App, FitAI Coach, Personal Portfolio.
- **Education**: Universitas Hasanuddin Makassar — S2 Teknik Informatika, Fakultas Teknik (2025 – Present ⚠️ tahun mulai asumsi) · Universitas Handayani Makassar — S1 Teknik Informatika (2021 – 2025) · MA PP Nurul Falah Borong Ganjeng (2016 – 2019).
- **Work & Organization**: Ikhwannet Somba Palioi — Co-Founder, `full_time` ⚠️ (2025 – Present) · UKM MAPALA Universitas Handayani Makassar — Sekretaris Umum `board` (2023 – 2025), Ketua Panitia `committee` ⚠️ (20XX, [Nama Acara]), Anggota `member` ⚠️ (20XX – 20XX).
- **Social links** ⚠️ URL belum ada: GitHub, Facebook, Instagram, LinkedIn, Discord.
- **Admin**: 1 akun, password diatur lewat variabel lingkungan saat seed (jangan di-commit).

---

## 12. Keputusan yang Perlu Diambil di Awal Sesi

| Topik | Rekomendasi | Alternatif |
|---|---|---|
| Framework | **Node.js + hapi** (sesuai skill di portofolio) | Express, Fastify, NestJS |
| Database | **PostgreSQL** | MySQL/MariaDB (`utf8mb4` untuk emoji) |
| Query/ORM | Knex + migrasi, atau Prisma | Sequelize |
| Validasi | Joi (bawaan ekosistem hapi) | Zod |
| ID | uuid v7 (terurut waktu) | auto-increment integer |
| Penyimpanan file | S3-compatible (Cloudflare R2/MinIO) | disk lokal + CDN |
| Dokumentasi API | OpenAPI 3.1 (`hapi-swagger`) | — |
| Frontend | SSR/ISR (Next.js/Nuxt) agar hero tidak perlu skeleton | SPA + prerender |

---

## 13. Checklist Implementasi

- [ ] Inisialisasi proyek, lint/format, environment (`.env.example`).
- [ ] Migrasi semua tabel §2 + indeks (`sort_order`, FK, `is_published`).
- [ ] Seed §11.
- [ ] Auth (login, refresh dengan rotasi, logout, me) + rate limit.
- [ ] Endpoint publik §5 termasuk agregat `/portfolio` dan `period_label`.
- [ ] CRUD admin §7 + reorder + validasi §3.
- [ ] Upload + sanitasi SVG + konversi gambar.
- [ ] Format error §4 konsisten di semua endpoint.
- [ ] Caching & revalidasi §9.
- [ ] OpenAPI + koleksi contoh request.
- [ ] Test: unit (aturan periode/committee/urutan), integrasi (CRUD + auth), dan uji batas upload.
