# Usulan Kontrak API — Sertifikat

> **Status: sudah diimplementasikan di `openapi.yaml` v1.1.0 — dokumen ini arsip.** Pakai `openapi.yaml` sebagai sumber kebenaran. Perbedaan dari usulan: Certificate admin punya `file_id` + `file` (skema `Image`, kini dengan `size` dan `mime` bisa `application/pdf`); gambar dikonversi ke WebP 800/1600; `credential_url` hanya https; tambahan validasi `issued_at` tidak boleh di masa depan ("Issue date cannot be in the future."); `expires_at` sama dengan bulan `issued_at` diterima; `file_id` tidak valid → "Invalid file.".
>
> Desain terkait ada di `Portofolio-Design-Redesign.figcraft`: section `#certificates`, komponen `Certificate Item`, `Panel/Certificate - Desktop`, dan `Overlay/Certificate Viewer`. Lihat DESIGN.md §4, §6, dan §7.

## Ringkasan

Portofolio mendapat section baru **#certificates** (setelah #experience, sebelum #contact-me). Setiap sertifikat tampil sebagai baris ringkas dengan dua aksi:
- **View**: membuka file sertifikat. Gambar tampil di lightbox, sedangkan PDF dibuka di tab baru.
- **Verify**: membuka `credential_url`, yaitu halaman verifikasi dari penerbit.

Gambar sertifikat tidak ditampilkan langsung di halaman, jadi backend tidak perlu membuat thumbnail atau pratinjau PDF.

Semua pola mengikuti kontrak yang sudah ada: envelope `{ data }`, error `{ error: { code, message, details } }`, ID integer, `is_published` + `sort_order`, reorder `PATCH … /reorder` dengan `ReorderInput`, dan upload dua langkah lewat `POST /admin/uploads`.

## Skema

### `Certificate` (admin)
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | integer | |
| `name` | string, 1–150 | Wajib |
| `issuer` | string, 1–100 | Wajib |
| `issued_at` | string `YYYY-MM` | Wajib |
| `expires_at` | string `YYYY-MM` \| null | null = tidak kedaluwarsa. Harus ≥ `issued_at` |
| `credential_id` | string, ≤ 100 \| null | |
| `credential_url` | string (uri, http/https) \| null | |
| `file` | `CertificateFile` \| null | |
| `is_published` | boolean | Default `false` |
| `sort_order` | integer | |

### `CertificateFile`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | integer | Dipakai sebagai `file_id` |
| `url` | string (uri) | File asli; `Cache-Control: immutable` seperti gambar lain |
| `mime` | `application/pdf` \| `image/webp` \| `image/png` \| `image/jpeg` | Menentukan perilaku tombol View |
| `size` | integer (byte) | |
| `width`, `height` | integer \| null | Hanya untuk gambar; dipakai untuk memesan rasio di lightbox |

### `PublicCertificate`
Sama dengan `Certificate`, tanpa `is_published` dan `sort_order`. Field `file` hanya berisi `{ url, mime, width, height }`.

### Input
- `CertificateCreateInput`: `name`, `issuer`, `issued_at` wajib; `expires_at`, `credential_id`, `credential_url`, `file_id` (integer \| null), dan `is_published` opsional.
- `CertificateUpdateInput`: semua field opsional (PATCH sebagian).

## Endpoint

| Method | Path | Respons |
|---|---|---|
| GET | `/certificates` | `200 { data: PublicCertificate[] }`. Hanya yang terbit, diurutkan berdasarkan `sort_order` |
| GET | `/admin/certificates` | `200 { data: Certificate[] }`, termasuk draft |
| POST | `/admin/certificates` | `201 { data: Certificate }`, ditaruh paling akhir · 400 · 401 |
| PATCH | `/admin/certificates/{id}` | `200 { data: Certificate }` · 400 · 401 · 404 |
| DELETE | `/admin/certificates/{id}` | `204` · 401 · 404. File yang terlepas dibersihkan oleh `media:cleanup` |
| PATCH | `/admin/certificates/reorder` | `204`, body `ReorderInput { ids }` · 400 · 401 |

### Perubahan pada endpoint yang ada
- **`GET /portfolio`**: tambahkan `certificates: PublicCertificate[]` ke `data` (tanpa batas jumlah).
- **`POST /admin/uploads`**: tambahkan `kind=certificate_file`.
  - Format: PDF, PNG, JPEG, atau WebP. Jenis file dibaca dari isi file, sama seperti sekarang.
  - **Maksimal 5 MB**; kind lain tetap 2 MB.
  - Gambar boleh dikonversi ke WebP 1600 px (variants opsional). PDF disimpan apa adanya, dengan `Content-Disposition: inline`.
  - Respons memakai `CertificateFile` + `kind`.
  - 413 bila melebihi 5 MB, 415 bila jenisnya tidak didukung.
- **`DELETE /admin/uploads/{id}`**: 409 juga berlaku bila file masih dipakai sertifikat.

## Validasi (400 `VALIDATION_ERROR`)

Pesan berikut sudah dipakai di desain (`Form Field` State=Error):

| Kondisi | `details[].field` | `message` |
|---|---|---|
| `name` kosong | `name` | This field is required. |
| `issuer` kosong | `issuer` | This field is required. |
| `expires_at` < `issued_at` | `expires_at` | Expiry must be after the issue date. |
| `credential_url` bukan http(s) | `credential_url` | Enter a valid URL. |
| `is_published=true` tanpa `file_id` dan tanpa `credential_url` | `file_id` | Add a file or a credential URL to publish. |
| `file_id` bukan upload `certificate_file` | `file_id` | Invalid file. |

## Contoh

`GET /api/v1/certificates`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Certificate name",
      "issuer": "Issuer",
      "issued_at": "2025-03",
      "expires_at": null,
      "credential_id": "ABC-123456",
      "credential_url": "https://issuer.example/verify/ABC-123456",
      "file": { "url": "https://cdn.example/certificates/1.pdf", "mime": "application/pdf", "width": null, "height": null }
    }
  ]
}
```

`POST /api/v1/admin/certificates`
```json
{ "name": "Certificate name", "issuer": "Issuer", "issued_at": "2025-03", "file_id": 42, "is_published": true }
```

## Perilaku frontend (untuk konteks)
- Bila tidak ada sertifikat terbit, section #certificates dan tautan navigasinya disembunyikan.
- Meta di daftar: "Issuer · Mar 2025". Detail: "Expires Mar 2028" atau "No expiry", "ID …", dan "PDF" atau "Image".
- `file == null` → tombol View disembunyikan. `credential_url == null` → tombol Verify disembunyikan.

## Pertanyaan terbuka untuk backend
1. Apakah file PDF boleh disajikan dari origin/CDN yang sama dengan gambar, dengan `Content-Disposition: inline`?
2. Apakah batas 5 MB dan 1 file per sertifikat cukup?
3. Apakah `/certificates` perlu paginasi? Usulan saat ini: tidak, karena jumlahnya diperkirakan kecil.
