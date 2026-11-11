# Portofolio Design — Dokumentasi Desain

Dokumentasi tema, struktur, dan design system untuk portofolio pribadi **Ary Kurnia** beserta area admin (CMS)-nya.

| | |
|---|---|
| **File kerja** | `Portofolio-Design-Redesign.figcraft` (FigCraft) |
| **File asli** | `Portofolio-Design.fig` · [Figma: Portofolio Design (Copy)](https://www.figma.com/design/mZ26QNItsO0451C7HZf55Z/Portofolio-Design--Copy-?node-id=2-2) |
| **Halaman kerja** | `Redesign` (hasil redesain) · `Original (archive)` (arsip desain asli) |
| **Platform** | Web responsif — Desktop 1366 · Tablet 768 · Mobile 375 |
| **Terakhir diperbarui** | 11 November 2026 |

---

## 1. Deskripsi Project

Portofolio satu halaman (single-page) yang memperkenalkan Ary Kurnia sebagai **Web & Back-End Developer** — lulusan S1 Teknik Informatika, kini menempuh S2, dengan fokus rekayasa perangkat lunak di sisi backend dan infrastruktur.

Tujuan:
- Memperkenalkan diri secara singkat dan meyakinkan (hero + about).
- Menampilkan teknologi yang dikuasai (skill, per kategori).
- Memamerkan hasil kerja (kartu project + halaman arsip project).
- Menampilkan riwayat pendidikan, pekerjaan, dan organisasi (timeline model LinkedIn).
- Menyediakan jalur kontak dan tautan media sosial.
- Mengelola seluruh konten lewat **Admin / Content Manager** (CRUD).

---

## 2. Tema & Konsep Visual

**Konsep: "Developer Terminal" — gelap, monokrom, monospace.**

- **Dark mode sebagai default.** Latar hampir hitam dengan dua nada abu yang berselang-seling antar-section. Mode **Light** tersedia lewat `Theme Toggle` (memakai primitive yang sama, tanpa warna baru).
- **Monokrom.** Warna hanya datang dari konten (logo teknologi, gambar project).
- **Satu keluarga font: Courier Prime** (Regular & Bold) di seluruh frame.
- **Judul bergaya anchor** (`#about-me`, `#skills`, `#project`, `#experience`, `#contact-me`).
- **Minimalis.** Hierarki dibangun dari ukuran teks, ketebalan, dan ruang kosong; dekorasi hanya di hero (kotak outline & zigzag).

---

## 3. Struktur File & Kanvas

### Halaman
| Halaman | Isi |
|---|---|
| `Redesign` | Semua frame hasil redesain (lihat Section di bawah). |
| `Original (archive)` | Arsip desain asli (sebelumnya `Page 1`): `iPhone 14 & 15 Pro - 1`, `Desktop - 1`, `Login Page`, `Dashboard`, `Frame 7` (menu), `Frame 1` (swatch), komponen utama `Card/Project`. Tidak diubah, kecuali kartu project yang ikut perubahan komponen `Card/Project`. |

### Section di halaman `Redesign`
Setiap baris berurutan **Desktop → Tablet → Mobile**, jarak 200 px.

| Section | Frame |
|---|---|
| `00 · Components — Portfolio` | Ikon (termasuk Refresh), Skeleton, Button, Theme Toggle, Nav Link, Social Links, Skill Tile, Pagination Dots, Timeline Item / Group / Position, Input, Back Link |
| `00 · Components — Admin` | Admin/List Item, Admin/Section Header, Form Field, Checkbox, Toast, Dialog/Confirm, Empty State, Error State, Status/Loading |
| `01 · Portfolio` | `Desktop - Redesign` · `Tablet - Redesign` · `Mobile - Redesign` · `Menu - Mobile` (overlay) |
| `02 · Projects Archive` | `Projects - Desktop` · `Projects - Tablet` · `Projects - Mobile` |
| `03 · Admin Login` | `Login - Desktop` (1366×768) · `Login - Tablet` (768×1024) · `Login - Mobile` (375×812) |
| `04 · Admin — Content Manager` | `Admin - Desktop` · `Admin - Tablet` · `Admin - Mobile` |
| `05 · Admin Overlays` | `Panel/{Project, Skill, Experience, Social} - Desktop` & `- Mobile` · `Overlay/Delete Confirm` · `Overlay/Toast - Saved` · `Overlay/Toast - Deleted` · `Example/Empty Project List` |
| `06 · States (Loading · Saving · Error)` | `Example/Loading - Portfolio Mobile` · `Example/Loading - Portfolio Desktop` · `Example/Loading - Admin List` · `Example/Saving - Admin Panel` · `Example/Error - Portfolio Projects` · `Overlay/Toast - Error` |

Nama frame tiap section portofolio = anchor-nya: `home`, `about-me`, `skills`, `project`, `experience`, `contact-me`.

---

## 4. Halaman Portofolio

### Navigasi
`#home #about-me #skills #project #experience #contact-me` — urutan sama dengan section.
- **Desktop:** navbar (logo · tautan `Nav Link` · pemisah · `Theme Toggle`), #home aktif.
- **Tablet & Mobile:** `Theme Toggle` + ikon hamburger → overlay `Menu - Mobile` (tablet: kanan atas, mobile: kiri atas).

### Section
| # | Section | Latar | Isi |
|---|---|---|---|
| 1 | **home** (hero) | `bg/primary` | Sapaan "Hi, I'm Ary Kurnia", tagline "a Web and Back-End developer", `Button` "Scroll down", `Social Links` (ikon). Desktop: 2 kolom dengan foto & dekorasi; tablet: ditumpuk; mobile: tanpa foto. |
| 2 | **#about-me** | `bg/secondary` | Paragraf profil. |
| 3 | **#skills** | `bg/primary` | Grid `Skill Tile` per kategori: **Frontend** (HTML5, CSS3, JavaScript) · **Backend** (Node.js, hapi). |
| 4 | **#project** | `bg/secondary` | Paragraf intro + `Card/Project`. Mobile: carousel + `Pagination Dots` + "See all"; tablet 2 kolom, desktop 3 kolom + "See all projects" → **Projects Archive**. |
| 5 | **#experience** | `bg/primary` | Timeline 2 grup: **Education** dan **Work & Organization** (model LinkedIn, lihat §8). Mobile 1 kolom, tablet/desktop 2 kolom. |
| 6 | **#contact-me** | `bg/secondary` | Email + `Social Links` (chip berlabel). |

### Layout
| | Mobile (375) | Tablet (768) | Desktop (1366) |
|---|---|---|---|
| Padding section | 64 / 24 | 80 / 40 | 96 / 120 |
| Judul → konten | 24 | 40 | 40 |
| Judul section | `Modern/Heading` 24 | `Modern/Display` 32 | `Modern/Display` 32 |
| Lebar `Skill Tile` | 101 | 124 | 174 |
| Project | carousel 240 + peek | grid 2 kolom (332) | grid 3 kolom (359) |
| Timeline | 1 kolom | 2 kolom | 2 kolom |

### Projects Archive (`02 · Projects Archive`)
Halaman tujuan tombol "See all projects" / "See all".
- Top bar (logo + `Theme Toggle`), `Back Link` "Back to portfolio" → kembali ke frame portofolio ukuran yang sama.
- Header: `#project`, paragraf intro, jumlah project ("3 projects").
- Grid `Card/Project`: desktop 3 kolom (359) · tablet 2 kolom (332) · mobile 1 kolom (fill), gap 24 (mobile 16).
- Padding body: desktop 48/120/96 · tablet 40/40/80 · mobile 24/24/64.

---

### Bahasa & kapitalisasi UI
- **Label UI portofolio: bahasa Inggris**, konten (paragraf) tetap Indonesia untuk sementara. Admin seluruhnya Inggris.
- **Sentence case** untuk semua tombol & label: "Scroll down", "Visit", "See all projects", "See all", "Back to portfolio", "Save changes". Anchor judul section tetap huruf kecil (`#skills`).

---

## 5. Design System

### 5.1 Warna
**`Primitives`** (disembunyikan dari pemilih warna)

| Variable | Hex |
|---|---|
| `gray/950` | `#1A1A1A` |
| `gray/900` | `#212121` |
| `gray/800` | `#2E2E2E` |
| `gray/600` | `#727272` |
| `gray/400` | `#A4A4A4` |
| `gray/200` | `#D9D9D9` |
| `white` / `black` | `#FFFFFF` / `#000000` |

**`Color`** (semantik) — mode **Dark** (default) & **Light**

| Variable | Dark | Light | Dipakai untuk |
|---|---|---|---|
| `color/bg/primary` | gray/950 | white | Latar halaman & section ganjil |
| `color/bg/secondary` | gray/900 | gray/200 | Section genap, kartu admin, input |
| `color/bg/surface` | gray/900 | gray/200 | Nav link aktif, hover tombol outline |
| `color/bg/hover` | gray/800 | white | Hover/aktif menu link mobile |
| `color/bg/card` | gray/600 | gray/600 | (warisan desain asli) |
| `color/bg/button` | gray/200 | gray/950 | Tombol Filled, toast |
| `color/text/primary` | white | gray/950 | Teks utama |
| `color/text/secondary` | gray/400 | gray/600 | Paragraf, tanggal, placeholder |
| `color/text/on-light` | black | white | Teks di atas tombol Filled |
| `color/border/default` | white | gray/950 | Tombol outline (opacity 40%), focus ring |
| `color/border/subtle` | gray/800 | gray/200 | Border kartu, tile, list, garis navbar |
| `color/icon/default` | white | gray/950 | Ikon & dekorasi hero |
| `color/icon/secondary` | gray/400 | gray/600 | Ikon sekunder, garis timeline |
| `color/icon/inverse` | black | white | Ikon di atas permukaan terang |
| `color/bg/skeleton` | gray/800 | gray/200 | Blok skeleton loader |

Border input memakai `gray/600` langsung (kontras ≈ 3.9:1, lolos 3:1). Variable `green/*` dan `color/accent/*` ada di file tetapi **tidak dipakai** (di luar palet).

**Kontras:** teks primary ≈ 16:1; `text/secondary` ≈ 7.8:1 di #1A1A1A dan ≈ 6.5:1 di #212121 (Dark); ≈ 4.8:1 di putih (Light).

### 5.2 Tipografi — Courier Prime
| Style | Ukuran / line-height | Dipakai untuk |
|---|---|---|
| `Modern/Display XL` | Bold 48/56 | Nama hero desktop & tablet |
| `Modern/Display` | Bold 32/38 | Judul section desktop/tablet, judul Login, judul Projects (nama hero mobile: override 28/34) |
| `Modern/Heading` | Bold 24/32 | Judul section mobile, judul section admin |
| `Modern/Title` | Bold 16/24 | Judul grup timeline, logo, judul kartu, judul panel |
| `Modern/Body` | Regular 16/24 | Tagline, paragraf desktop, input, menu |
| `Modern/Body Small` | Regular 14/22 | Paragraf mobile, deskripsi kartu, timeline |
| `Modern/Label` | Regular 14/20 | Tautan navbar, label field |
| `Modern/Caption` | Regular 12/16 | Tanggal, meta, hint, label grup |
| `Modern/Button` | Bold 14/14 | Label tombol |

Style lama (`Heading/*`, `Body/*`, `Label/Button`) tetap ada untuk frame di halaman `Original (archive)`.

### 5.3 Spacing, radius & efek
- Skala spacing 4/8 (`space/4 … space/64`); variable lama `spacing/*` untuk frame arsip.
- Radius: `radius/sm` 8 (tombol, input, list item), `radius/md` 12 (kartu, tile, panel menu), 16 (kartu login, dialog), pill (toggle, chip).
- Border 1 px; focus ring 2 px `border/default`.
- Shadow hanya untuk lapisan mengambang: menu `0 8 24 #00000066`, dialog `0 16 40 #00000066`, toast `0 8 24 #00000040`.

---

## 6. Komponen

### Portofolio
| Komponen | Properti | Catatan |
|---|---|---|
| `Button` | Type (Outline/Filled) · State (Default/Hover/Focus/Loading*) · Size (Large 48/Small 40) · Label · Show Icon · Icon (swap) | Hover terpasang di prototype. *Loading hanya Filled (Small & Large): spinner + label "…ing", nonaktif |
| `Theme Toggle` | Mode (Dark/Light) · State (Default/Hover/Focus) | Pill 64×32, ikon matahari/bulan; klik → ganti variant + mode `Color` |
| `Nav Link` | Size (Desktop/Mobile) · State (Default/Hover/Active) · Label | Navbar, menu mobile, sidebar & tab admin |
| `Social Links` | Style (Icon/Labeled) | Icon di hero (area 44), Labeled (chip) di contact-me |
| `Skill Tile` | State (Default/Loading) · Name · slot Logo | Logo asli dipindah ke slot |
| `Card/Project` | State (Default/Loading) · Title · Show Title · Description · Show Button | Gambar → judul + deskripsi (maks 2 baris) → tombol "Visit" (`Button` Filled Small) |
| `Pagination Dots` | Active (1/2/3) | Indikator carousel mobile |
| `Timeline Item` | Last · State (Default/Loading) · Current · Date · Description · Show Place/Place | Instansi dengan 1 posisi; Current = titik bercincin + chip |
| `Timeline Group` | Last · Organization · slot Positions | Instansi dengan 2+ posisi |
| `Timeline Position` | Date · Role · Current | Sub-posisi di `Timeline Group` |
| `Input` | State (Default/Focus) · Placeholder · Show Visibility | Tombol mata untuk password |
| `Icon/Eye` | State (Hidden/Shown) | Klik bergantian |
| `Back Link` | Label | "Back to portfolio" |
| `Skeleton` | Shape (Line/Block/Circle) | Fill `color/bg/skeleton`; dipakai di semua variant Loading |
| Ikon 16×16 | — | Arrow Down/Right/Left, Plus, Sun, Moon, Grip, Chevron Down, Check, Upload, Close, Refresh |

### Admin
| Komponen | Properti | Catatan |
|---|---|---|
| `Admin/Section Header` | Title · Description · Show Add | Header kartu section admin |
| `Admin/List Item` | State (Default/Loading) · Title · Meta · Show Thumbnail · Show Grip | Grip (urutan), thumbnail opsional, Edit & Delete (Delete → dialog) |
| `Form Field` | Type (Text/Textarea/Select/Upload) · Label · Value | Placeholder memakai `text/secondary` |
| `Checkbox` | Checked · Label | |
| `Toast` | Type (Success/Error) · Message | "Changes saved" / "Item deleted" / "Couldn't save changes" |
| `Dialog/Confirm` | Title · Body | Cancel / Delete |
| `Empty State` | Title · Body | Dengan tombol Add |
| `Error State` | Title · Body | Border solid, tombol "Try again" (ikon Refresh) |
| `Status/Loading` | Cursor (On/Off) · Label | Teks status ala terminal "Loading_", kursor berkedip 530 ms |

---

## 7. Admin / Content Manager (bahasa Inggris)

"Dashboard" diganti **Admin / Content Manager** karena fungsinya CRUD konten, bukan ringkasan statistik.

- **Admin Login:** top bar (logo, `Theme Toggle`); judul "Admin Login"; `Input` Username & Password; `Button` "Login"; `Back Link`. Tablet & desktop memakai kartu 440 px di tengah; mobile form selebar layar.
- **Halaman Admin:** top bar "Ary Kurnia / Content Manager" + `Theme Toggle` + "Log out". Navigasi section = anchor portofolio — sidebar 264 px (desktop) atau Section Tabs geser (tablet & mobile).
- **Section (kartu radius 12):**
  - **#home:** Greeting, Tagline → Save changes
  - **#about-me:** About (textarea) → Save changes
  - **#skills:** list Name · Category
  - **#project:** Section intro + list (thumbnail, judul, deskripsi) → Save changes
  - **#experience:** list dikelompokkan **EDUCATION** / **WORK & ORGANIZATION**; instansi dengan banyak posisi menampilkan sub-list posisi menjorok
  - **#contact-me:** Email + list Social links → Save changes
- **Panel form** (desktop/tablet: panel kanan 400 px; mobile: layar penuh 375; footer Cancel / Save):
  - **Project:** Title, Description, Image (upload), Link, ☐ Show visit button
  - **Skill:** Name, Category, Logo (upload)
  - **Timeline item:** Group (Education / Work & Organization), Organization, Title, Type, Event name (khusus Committee), Start, End (opsional), ☐ I currently work or study here, Description (opsional)
  - **Social link:** Platform, URL
- **Feedback:** Delete → `Dialog/Confirm` → toast "Item deleted"; Save → toast "Changes saved" (hilang otomatis 2 detik); daftar kosong → `Empty State`.

---

## 8. Aturan Konten yang Bisa Bertambah

- **Skill:** tambah instance `Skill Tile` di grid kategori; kategori baru (mis. "Tools") = duplikat `Group/*`. Grid wrap otomatis.
- **Project:** tambah instance `Card/Project`. Halaman portofolio menampilkan maks 6 kartu (desktop/tablet), sisanya di **Projects Archive**. Mobile: carousel + `Pagination Dots` (jumlah titik = jumlah kartu).
- **Timeline (model LinkedIn: instansi → posisi), 2 grup:**
  - **Education:** jenjang & jurusan sebagai posisi, mis. "(S1)", "(S2)".
  - **Work & Organization:** pekerjaan dan organisasi.
  - Instansi dengan 1 posisi → `Timeline Item` (Description = jabatan, Place = "Instansi · Type"); 2+ posisi → `Timeline Group` + `Timeline Position`.
  - **Type:** Full-time · Part-time · Freelance · Contract · Internship · Member · Board · Committee · Volunteer.
  - **Periode:** `2021 – 2025` (en dash); masih berjalan `2025 – Present` + `Current=true`; **Committee** cukup satu tahun + nama acara.
  - **Urutan:** item Current paling atas, lalu terbaru. Item terakhir `Last=true`. Maks 3 per grup; jika lebih, tampilkan layer `Button/See All`.
  - **Data implementasi:** `start_date`, `end_date` (nullable), `is_current`.

---

## 9. Prototype & Aksesibilitas

**Alur prototype**
- Navbar/menu → scroll ke section; hamburger → overlay `Menu - Mobile`; `Theme Toggle` → ganti mode Dark/Light.
- "See all projects" / "See all" → **Projects Archive**; "Back to portfolio" → portofolio.
- Login → Admin (ukuran layar sama) · Log out → Login · sidebar/tab admin → scroll ke section.
- Edit/Add → Panel · Delete → Dialog → toast · Save → toast.
- Hover pada `Button`, `Nav Link`, `Theme Toggle`; klik `Input` → Focus; klik ikon mata → tampil/sembunyi.

**Aksesibilitas**
- Area sentuh ≥ 44 px untuk tombol ikon (menu, toggle, ikon sosial, tutup).
- Anotasi `aria-label`/`role` pada tombol ikon, `Theme Toggle` (`role=switch`), tombol mata (`aria-pressed`).
- Focus state 2 px di `Button`, `Input`, `Theme Toggle`.

---

## 9b. Loading, Saving & Error States

**Prinsip**
- Hanya data dari CMS yang memakai skeleton (paragraf about, intro project, tile skill, kartu project, timeline, email/list admin). UI statis (navbar, judul section, tombol) langsung tampil. **Teks hero dirender di server (SSR/ISR)**, tanpa skeleton.
- Ukuran skeleton = ukuran konten asli (gambar kartu 120/200 px, 1 baris judul + 2 baris deskripsi), agar tidak terjadi layout shift.
- Waktu: < 300 ms tidak menampilkan apa pun · 300 ms–5 dtk skeleton · > 5 dtk atau gagal → `Error State` dengan "Try again".
- Gambar: ruang & rasio dipesan dengan warna skeleton, lalu fade-in.
- Animasi: pulse opacity 50% ↔ 100%, 1,4 dtk; statis jika `prefers-reduced-motion`. Spinner tombol 360°/0,8 dtk.

**Aksesibilitas:** kontainer data `aria-busy="true"` + satu label tersembunyi "Loading …"; blok skeleton `aria-hidden`; status admin `aria-live="polite"`; tombol loading `aria-disabled`.

**Admin:** daftar memakai `Admin/List Item` State=Loading + `Status/Loading` ("Loading projects_"); tombol Save → `Button` State=Loading ("Saving…", Cancel dinonaktifkan); gagal simpan → `Toast` Type=Error "Couldn't save changes".

**Contoh frame:** section `06 · States`.

---

## 10. Konten Placeholder / Dummy

| Item | Status |
|---|---|
| Judul, deskripsi, gambar project | **Dummy**: Nature Music App, FitAI Coach, Personal Portfolio |
| Co-Founder — Ikhwannet Somba Palioi | Tipe **Full-time** masih placeholder |
| UKM MAPALA — Ketua Panitia | **20XX** · **[Nama Acara]** |
| UKM MAPALA — Anggota | **20XX – 20XX** |
| S2 Universitas Hasanuddin | Tahun mulai **2025** (asumsi) |
| Tautan sosial | URL belum diisi ("URL not set" di admin) |

---

## 11. Riwayat Perubahan

| Langkah | Perubahan |
|---|---|
| 1 | Variable warna (`Primitives`, `Color`) dan text style awal; mengikat warna & teks ke token. |
| 2 | Margin & padding seragam, constraint Left/Top, variable `Spacing`. |
| 3 | Komponen `Card/Project` dengan properti `Description`. |
| 4 | Perbaikan typo (Back-End, individu, Sekretaris, Informatika, Experience, Co-Founder). |
| 5 | Skala teks mobile, kartu & tombol "visit" diperbesar, overlay kartu digelapkan. |
| 6 | **Redesign modern** di halaman `Redesign`: semua frame auto layout; skala tipografi Courier Prime `Modern/*`; komponen `Button`, `Input`, `Nav Link`, `Timeline Item`; prototype navigasi; anotasi aksesibilitas; typo "#sambuta" → "#sambutan". |
| 7 | Desktop dilengkapi semua section; frame **Tablet 768**; frame mobile disamakan ke **375**. |
| 8 | Konten yang bisa bertambah: `Skill Tile` per kategori, `Pagination Dots`, tombol "Lihat semua", `Social Links` (hero + contact-me). |
| 9 | **Theme Toggle** dan mode **Light** pada koleksi `Color`; ikon mata untuk password. |
| 10 | **Admin Login** desktop/tablet/mobile; **Admin / Content Manager** dengan pola CRUD lengkap (panel, dialog, toast, empty state) dalam bahasa Inggris. |
| 11 | Judul project (dummy) di `Card/Project`; timeline format en dash + `Current`; S2 Universitas Hasanuddin; model **LinkedIn** (`Timeline Group`/`Position`) dengan grup Education & Work & Organization. |
| 12 | Tata letak kanvas dalam Section berlabel; frame **Projects Archive** desktop/tablet/mobile. |
| 13 | `Page 1` diganti nama menjadi `Original (archive)`; `Page 2` (kosong) dihapus. |
| 14 | Label UI portofolio diseragamkan ke bahasa Inggris + Sentence case (Scroll down, Visit, See all projects, See all); judul "#skill" → "#skills". |
| 15 | **Loading & error states**: token `color/bg/skeleton`, komponen `Skeleton`, variant Loading pada `Card/Project`, `Skill Tile`, `Timeline Item`, `Admin/List Item`, `Button`; `Error State`, `Toast` Type=Error, `Status/Loading` (kursor terminal); contoh frame di section `06 · States`. |

---

## 12. Pekerjaan Berikutnya

**Butuh masukan pemilik**
- [ ] Data project asli: judul, deskripsi, gambar, link (menggantikan dummy).
- [ ] Data placeholder timeline: tipe posisi Co-Founder, Ketua Panitia (tahun & nama acara), periode Anggota, tahun mulai S2.
- [ ] URL tautan sosial.
- [ ] Daftar skill lengkap, terutama backend & infrastruktur (database, Docker, Linux, cloud).
- [ ] Bahasa konten (paragraf about, intro project, deskripsi timeline) masih Indonesia sementara UI Inggris — putuskan apakah konten diterjemahkan.

**Bisa dikerjakan langsung**
- [ ] Tombol "Kirim Email" di #contact-me (opsional).
- [ ] Frame contoh state "Currently" tercentang di panel Timeline item.

**Keterbatasan alat**
- Navbar sticky saat scroll belum didukung FigCraft.
- Prototype belum diuji langsung; tujuan interaksi diverifikasi lewat data layer.
