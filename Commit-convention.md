# Panduan Commit Message

Format dasar:
```
<prefix>: <ringkasan singkat, huruf kecil, kata kerja perintah>
```

## Prefix yang dipakai

| Prefix | Kapan dipakai |
|---|---|
| `add` | Menambah file/fitur/kode baru yang belum ada sebelumnya |
| `update` | Mengubah perilaku/isi kode yang sudah ada (bukan bug fix) |
| `fix` | Memperbaiki bug/error |
| `remove` | Menghapus file/kode/dependency |
| `refactor` | Mengubah struktur/cara penulisan kode **tanpa** mengubah perilaku |
| `test` | Menambah/mengubah unit test atau integration test |
| `docs` | Mengubah dokumentasi (README, komentar, file panduan) |
| `chore` | Pekerjaan pendukung yang tidak menyentuh logic (setup tooling, config, migration, seeder) |
| `style` | Perubahan format/gaya kode saja (indentasi, penamaan) tanpa efek fungsional |

## Aturan penulisan ringkasan

- **Kata kerja perintah** (imperative), bukan lampau atau progresif:
  - Benar: `add: skill entity`
  - Salah: `add: added skill entity` / `add: adding skill entity`
- **Huruf kecil** di awal ringkasan (kecuali nama proper seperti `Skill`, `MariaDB`, `Prisma`)
- **Tidak diakhiri titik**
- **Ringkas** — idealnya di bawah 72 karakter, cukup jelaskan **apa**, detail **kenapa/bagaimana** taruh di body (baris kosong, lalu paragraf) kalau perlu
- **1 commit = 1 perubahan logis** — jangan gabung `add` fitur baru dengan `fix` bug tidak berhubungan dalam 1 commit

## Contoh dari histori kerja project ini

```
add: User dan Skill entity
add: SkillRepository interface
add: ListSkills use-case beserta unit test
add: CreateSkill use-case beserta unit test
fix: CreateSkill tidak import Skill entity
add: UploadSkillLogo use-case dan FileStorage interface
add: MariaDBSkillRepository dengan Sequelize
refactor: pindah dari Prisma ke Sequelize untuk akses MariaDB
fix: path require prismaClient salah lokasi generate
add: migration dan seeder tabel users
add: JWT auth strategy dan LoginUser use-case
refactor: pusatkan error handling lewat onPreResponse
add: route HTTP untuk resource skills
chore: tambah seederStorage supaya seeder tidak duplikat
add: SocialMedia entity dan use-case (List, Get, Update)
test: skenario proteksi field platform di UpdateSocialMedia
```

## Body commit (opsional, untuk perubahan yang perlu konteks)

Dipakai kalau ringkasan 1 baris tidak cukup menjelaskan **kenapa**
perubahan ini dilakukan — terutama untuk keputusan arsitektur atau
perbaikan bug yang tidak jelas dari judulnya saja:

```
refactor: pindah dari Prisma ke Sequelize

Prisma Migrate butuh shadow database untuk deteksi drift, tapi
CREATE DATABASE gagal terus di server MariaDB (kemungkinan
read_only atau restriksi lain). Sequelize migration tidak butuh
shadow database, jadi migration bisa jalan langsung ke database asli.
```

## Yang TIDAK perlu masuk commit message

- Detail proses debugging (percobaan yang gagal, dst) — cukup
  kesimpulan/hasil akhirnya
- Nama file yang diubah (sudah otomatis tercatat oleh git, tidak
  perlu diulang di pesan)