# Portofolio Design — Dokumentasi Desain

Dokumentasi tema, struktur, dan design system untuk portofolio pribadi **Ary Kurnia** beserta area admin (CMS)-nya.

| | |
|---|---|
| **File kerja** | `Portofolio-Design-Redesign.figcraft` (FigCraft) · cadangan: `Portofolio-Design-Redesign.old.figcraft` (sebelum langkah 16), `Portofolio-Design-Redesign.backup.figcraft` |
| **File asli** | `Portofolio-Design.fig` · [Figma: Portofolio Design (Copy)](https://www.figma.com/design/mZ26QNItsO0451C7HZf55Z/Portofolio-Design--Copy-?node-id=2-2) |
| **Halaman kerja** | `Redesign` (hasil redesain) · `Original (archive)` (arsip desain asli) |
| **Platform** | Web responsif — Desktop 1366 · Tablet 768 · Mobile 375 |
| **Kontrak API** | [`openapi.yaml`](../openapi.yaml) (sumber kebenaran) · [Panduan Integrasi Frontend](<Panduan Integrasi Frontend — Portofolio API.md>) · [`PROPOSAL-certificates-api.md`](PROPOSAL-certificates-api.md) (arsip usulan; sertifikat kini di `openapi.yaml` v1.1.0) · [`API.md`](API.md) (rancangan awal, sudah digantikan) |
| **Terakhir diperbarui** | 12 November 2026 |

---

## 1. Deskripsi Project

Portofolio satu halaman (single-page) yang memperkenalkan Ary Kurnia sebagai **Web & Back-End Developer** — lulusan S1 Teknik Informatika, kini menempuh S2, dengan fokus rekayasa perangkat lunak di sisi backend dan infrastruktur.

Tujuan:
- Memperkenalkan diri secara singkat dan meyakinkan (hero + about).
- Menampilkan teknologi yang dikuasai (skill, per kategori).
- Memamerkan hasil kerja (kartu project + halaman arsip project).
- Menampilkan riwayat pendidikan, pekerjaan, dan organisasi (timeline model LinkedIn).
- Menampilkan sertifikat beserta file dan tautan verifikasinya.
- Menyediakan jalur kontak dan tautan media sosial.
- Mengelola seluruh konten lewat **Admin / Content Manager** (CRUD).

---

## 2. Tema & Konsep Visual

**Konsep: "Developer Terminal" — gelap, monokrom, monospace.**

- **Dark mode sebagai default.** Latar hampir hitam dengan dua nada abu yang berselang-seling antar-section. Mode **Light** tersedia lewat `Theme Toggle` (memakai primitive yang sama, tanpa warna baru).
- **Monokrom.** Warna hanya datang dari konten (logo teknologi, gambar project).
- **Satu keluarga font: Courier Prime** (Regular & Bold) di seluruh frame.
- **Judul bergaya anchor** (`#about-me`, `#skills`, `#project`, `#experience`, `#certificates`, `#contact-me`).
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
| `00 · Brand (Site icon)` | `Brand/Icon` (512) · `Brand/Icon 16` · `Brand/Icon 32` · `Brand/Icon Maskable` · `Example/Site icon in use` |
| `00 · Components — Portfolio` | Ikon (termasuk Refresh), Skeleton, Button, Theme Toggle, Nav Link, Social Links, Skill Tile, Pagination Dots, Timeline Item / Group / Position, Certificate Item, Pagination, Input, Back Link |
| `00 · Components — Admin` | Admin/List Item, Admin/Section Header, Form Field, Checkbox, Toast, Dialog/Confirm, Empty State, Error State, Status/Loading, Alert, Picker/Cell, Month Year Picker |
| `01 · Portfolio` | `Desktop - Redesign` · `Tablet - Redesign` · `Mobile - Redesign` · `Menu - Mobile` (overlay) |
| `02 · Projects Archive` | `Projects - Desktop` · `Projects - Tablet` · `Projects - Mobile` · `Example/Projects - Paginated (Mobile)` |
| `03 · Admin Login` | `Login - Desktop` (1366×768) · `Login - Tablet` (768×1024) · `Login - Mobile` (375×812) · `Example/Login - Invalid Credentials (Desktop)` · `Example/Login - Too Many Attempts (Mobile)` · `Example/Login - Session Expired (Mobile)` |
| `04 · Admin — Content Manager` | `Admin - Desktop` · `Admin - Tablet` · `Admin - Mobile` |
| `05 · Admin Overlays` | `Panel/{Project, Skill, Experience, Social} - Desktop` & `- Mobile` · `Panel/Skill Category - Desktop` · `Panel/Organization - Desktop` · `Panel/Certificate - Desktop` · `Example/Panel Certificate - Errors (Desktop, full height)` · `Overlay/Certificate Viewer - Desktop` & `- Mobile` · `Example/Month Picker - Step 1 Year (Desktop)` · `- Step 2 Month (Desktop)` · `- End after Start (Desktop)` · `- Mobile (Sheet)` · `Example/Panel Timeline - Edit (Desktop)` · `Example/Panel Timeline - Education (Desktop)` · `Overlay/Delete Confirm` · `Overlay/Delete Confirm - Organization` · `Overlay/Toast - Saved` · `Overlay/Toast - Deleted` · `Overlay/Toast - Category Not Empty` · `Example/Empty Project List` |
| `06 · States (Loading · Saving · Error)` | `Example/Loading - Portfolio Mobile` · `Example/Loading - Portfolio Desktop` · `Example/Loading - Admin List` · `Example/Saving - Admin Panel` · `Example/Error - Portfolio Projects` · `Example/Admin - Checking Session (Desktop)` · `Overlay/Toast - Error` |

Nama frame tiap section portofolio = anchor-nya: `home`, `about-me`, `skills`, `project`, `experience`, `certificates`, `contact-me`.

---

## 4. Halaman Portofolio

### Navigasi
`#home #about-me #skills #project #experience #certificates #contact-me` — urutan sama dengan section. Bila tidak ada sertifikat terbit, section dan tautannya disembunyikan.
- **Desktop:** navbar (logo · tautan `Nav Link` · pemisah · `Theme Toggle`), #home aktif.
- **Tablet & Mobile:** `Theme Toggle` + ikon hamburger → overlay `Menu - Mobile` (tablet: kanan atas, mobile: kiri atas).

### Section
| # | Section | Latar | Isi |
|---|---|---|---|
| 1 | **home** (hero) | `bg/primary` | Sapaan "Hi, I'm Ary Kurnia", tagline "a Web and Back-End developer", `Button` "Scroll down", `Social Links` (ikon). Desktop: 2 kolom dengan foto & dekorasi; tablet: ditumpuk; mobile: tanpa foto. |
| 2 | **#about-me** | `bg/secondary` | Paragraf profil. |
| 3 | **#skills** | `bg/primary` | Grid `Skill Tile` per kategori: **Frontend** (HTML5, CSS3, JavaScript) · **Backend** (Node.js, hapi). |
| 4 | **#project** | `bg/secondary` | Paragraf intro + `Card/Project`. Mobile: carousel + `Pagination Dots` + "See all"; tablet 2 kolom, desktop 3 kolom + "See all projects" → **Projects Archive**. Project open source: chip "Open source", baris info repo, dan tombol **Source** (lihat §8). |
| 5 | **#experience** | `bg/primary` | Timeline 2 grup: **Education** dan **Work & Organization** (model LinkedIn, lihat §8). Mobile 1 kolom, tablet/desktop 2 kolom. |
| 6 | **#certificates** | `bg/secondary` | Daftar `Certificate Item`: nama, "Issuer · Mon YYYY", detail (kedaluwarsa, credential ID, tipe file), tombol **View** (file) dan **Verify** (credential URL). Desktop & tablet 2 kolom, mobile 1 kolom. Gambar sertifikat tidak ditampilkan di halaman. |
| 7 | **#contact-me** | `bg/primary` | Email + `Social Links` (chip berlabel). |

### Layout
| | Mobile (375) | Tablet (768) | Desktop (1366) |
|---|---|---|---|
| Padding section | 64 / 24 | 80 / 40 | 96 / 120 |
| Judul → konten | 24 | 40 | 40 |
| Judul section | `Modern/Heading` 24 | `Modern/Display` 32 | `Modern/Display` 32 |
| Lebar `Skill Tile` | 101 | 124 | 174 |
| Project | carousel 240 + peek | grid 2 kolom (332) | grid 3 kolom (359) |
| Timeline | 1 kolom | 2 kolom | 2 kolom |
| Certificates | 1 kolom | 2 kolom (324, gap 40) | 2 kolom (531, gap 64) |

### Projects Archive (`02 · Projects Archive`)
Halaman tujuan tombol "See all projects" / "See all".
- Top bar (logo + `Theme Toggle`), `Back Link` "Back to portfolio" → kembali ke frame portofolio ukuran yang sama.
- Header: `#project`, paragraf intro, jumlah project ("3 projects").
- Grid `Card/Project`: desktop 3 kolom (359) · tablet 2 kolom (332) · mobile 1 kolom (fill), gap 24 (mobile 16). Kartu dalam satu baris sama tinggi; tombol menempel di bawah kartu.
- **Filter** di bawah jumlah project: `Nav Link` Active "All · 3" / Default "Open source · 2" (query `?type=open-source`, jumlah dari `meta.total`).
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

### 5.4 Ikon situs (favicon)
**Konsep "^|<"** — inisial **A K** dalam gaya leetspeak: caret `^` (chevron prompt yang diputar ke atas) = A, `|<` = K. Glyph putih bergoresan persegi di atas kotak gelap `bg/primary`, sehingga terbaca di tab terang maupun gelap.

| Varian | Ukuran | Dipakai untuk |
|---|---|---|
| `Brand/Icon` (master, radius 96, garis 4 px `border/subtle`) | 512 | `favicon.svg`, `icon-192.png`, `icon-512.png` |
| `Brand/Icon 16` / `Brand/Icon 32` (digambar per piksel, peta yang sama ×2) | 16 / 32 (48 = 16 ×3) | `favicon-16/32/48.png` → `favicon.ico` |
| `Brand/Icon Maskable` (tanpa radius, glyph di zona aman 80%) | 512 / 180 | `icon-maskable-512.png`, `apple-touch-icon.png` |

- Jangan mengecilkan master 512 untuk 16 px — pakai versi piksel. Jangan mengganti warna atau menambah efek.
- Berkas ada di `frontend-handoff/design/assets/brand/` bersama `site.webmanifest`; tag HTML ada di README handoff.
- Contoh pemakaian (tab terang/gelap, home screen): section `00 · Brand (Site icon)`.

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
| `Card/Project` | State (Default/Loading) · Title · Show Title · Description · Show Button · Show Open Source · Repo Info · Show Repo Info · Show Source | Gambar → chip "Open source" → judul + deskripsi (maks 2 baris) → info repo (Caption) → tombol "Visit" (Filled Small) & "Source" (Outline Small, ikon panah). Properti open source default off |
| `Pagination Dots` | Active (1/2/3) | Indikator carousel mobile |
| `Timeline Item` | Last · State (Default/Loading) · Current · Date · Description · Show Place/Place · Show Summary/Summary | Instansi dengan 1 posisi; Current = titik bercincin + chip. Summary = `positions.description` (Body Small, `text/secondary`), tersembunyi bila kosong — saat ditampilkan, ubah tinggi instance ke hug |
| `Timeline Group` | Last · Organization · slot Positions | Instansi dengan 2+ posisi |
| `Timeline Position` | Date · Role · Current · Show Summary/Summary | Sub-posisi di `Timeline Group` |
| `Certificate Item` | State (Default/Loading) · Name · Meta · Expiry · Show Expiry · Credential ID · Show Credential ID · File Type · Show View · Show Verify | Garis bawah `border/subtle`. View & Verify = `Button` Outline Small; File Type ikut Show View. Lihat §7 untuk perilaku tombol |
| `Pagination` | — | Previous · nomor halaman (aktif = `bg/button`) · Next, kotak 44 px. Tampil di Projects Archive bila `meta.total` > 12 |
| `Icon/Social X` · `Icon/Social Link` | — | 32×32, `icon/default`; untuk platform `x` dan `other` (set ikon sosial lain berasal dari library impor dan tidak bisa ditambah variant) |
| `Input` | State (Default/Focus) · Placeholder · Show Visibility | Tombol mata untuk password |
| `Icon/Eye` | State (Hidden/Shown) | Klik bergantian |
| `Back Link` | Label | "Back to portfolio" |
| `Skeleton` | Shape (Line/Block/Circle) | Fill `color/bg/skeleton`; dipakai di semua variant Loading |
| Ikon 16×16 | — | Arrow Down/Right/Left, Plus, Sun, Moon, Grip, Chevron Down, Check, Upload, Close, Refresh |

### Admin
| Komponen | Properti | Catatan |
|---|---|---|
| `Admin/Section Header` | Title · Description · Show Add | Header kartu section admin |
| `Admin/List Item` | State (Default/Loading) · Title · Meta · Show Thumbnail · Show Grip · Show Draft | Grip (urutan), thumbnail opsional, chip "Draft" (`is_published=false`; di mobile ditulis di Meta), Edit & Delete (Delete → dialog) |
| `Form Field` | Type (Text/Textarea/Select/Upload) · State (Default/Error/Disabled*/Filled**/Filled Stacked**) · Label · Value · Error · Hint · File Meta | Placeholder `text/secondary`. Error: border 2 px `border/default` + ikon × + pesan Caption (`details[].message` dari API). *Disabled hanya Text & Select: border `border/subtle`, teks `text/secondary`, tanpa chevron. **Filled hanya Upload, lihat §7 "Field upload" |
| `Checkbox` | Checked · State (Default/Disabled*) · Label | *Disabled hanya Checked=false |
| `Picker/Cell` | State (Default/Hover/Selected/Current/Disabled) · Label | Sel 44 px untuk tahun/bulan. Selected = `bg/button` + teks Bold `text/on-light`; Current = garis 1 px `border/default`; Disabled = `text/secondary` 40% |
| `Month Year Picker` | Step (Year / Year + Month) · Layout (Popover / Sheet) · Range · Month Label · Title · Show Clear | Pengganti dropdown bulan/tahun; lihat §7 "Field tanggal" |
| `Alert` | Message | Banner di atas form login (401 / 429 / sesi habis); `role=alert` |
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
  - **#home:** Greeting, Tagline, Photo (upload `profile_photo`) → Save changes
  - **#about-me:** About (textarea) → Save changes
  - **#skills:** list Name · Category + sub-list **Categories** (nama · "3 skills", grip, Edit/Delete)
  - **#project:** Section intro + list (thumbnail, judul, deskripsi, chip Draft) → Save changes
  - **#experience:** list dikelompokkan **EDUCATION** / **WORK & ORGANIZATION**; instansi dengan banyak posisi menampilkan sub-list posisi menjorok
  - **#certificates:** list Name · "Issuer · Mon YYYY · PDF/Image/Verify link only" + chip Draft; urutan disimpan langsung (seperti skills)
  - **#contact-me:** Email + list Social links (meta = URL) → Save changes
- **Panel form** (desktop/tablet: panel kanan 400 px; mobile: layar penuh 375; footer Cancel / Save):
  - **Project:** Title, Description, Image (PNG/JPG/WebP · maks 2 MB · min 1200 px), Link, ☐ Show visit button (Disabled selama Link kosong), ☐ Published
    - **Repository URL (optional)** setelah Link: URL repo GitHub publik. Setelah disimpan, di bawahnya tampil status sinkronisasi "TypeScript · ★ 12 · MIT · synced 2 h ago". Repo tidak ada/privat → State=Error "Repository not found or private.". Daftar project admin: Meta diawali "Open source ·".
  - **Skill:** Name, Category, Logo (PNG/JPG/WebP/SVG · maks 2 MB), ☐ Published
  - **Skill Category:** Name
  - **Timeline item:** Group (Education / Work & Organization), Organization, Title, Type, Event name (khusus Committee), Start & End (bulan + tahun), ☐ I currently work or study here, Description (opsional). **Mode Edit:** Group & Organization Disabled. **Grup Education:** Type (otomatis `education`) & Event name disembunyikan, label Title → "Degree & major". Opsi Type: Full-time · Part-time · Freelance · Contract · Internship · Self-employed · Member · Board · Committee · Volunteer.
  - **Organization:** Name; Group read-only. Location tidak diedit (tidak tampil di portofolio).
  - **Social link:** Platform, URL, Label (opsional, default nama platform), ☐ Published
  - **Certificate:** Name, Issuer, Issued & Expires (bulan + tahun), ☐ No expiry (Expires Disabled), Credential ID (opsional), Credential URL (opsional), File (PDF/PNG/JPG/WebP · maks 5 MB), ☐ Published. Terbit wajib punya File **atau** Credential URL. Credential URL hanya `https`. Gambar disimpan sebagai WebP (800/1600), PDF apa adanya (`width`/`height` null). Issued tidak boleh setelah bulan berjalan; Expires boleh sama dengan bulan Issued. Body di-scroll pada tinggi 768.
- **Field tanggal** (Start/End, Issued/Expires; nilai `YYYY-MM`, trigger `Form Field` Select "Mar 2025" / "Select") membuka **`Month Year Picker`**:
  - **Tahun dulu:** field kosong → Step=Year (grid 4×3, 12 tahun per halaman, ‹ › / PageUp-PageDown), halaman memuat tahun ini (sel Current), teks "Pick a year".
  - **Lalu bulan:** setelah tahun dipilih, grid bulan (Jan–Dec, 4×3) muncul di bawah dengan label "Month · 2025"; tahun tetap terlihat untuk dikoreksi. Memilih bulan mengisi nilai dan menutup picker — tanpa tombol Done.
  - **Mengedit:** field yang sudah terisi langsung membuka Step=Year + Month dengan tahun & bulan terpilih.
  - **Ganti tahun:** bulan dipertahankan bila masih valid, kalau tidak dikosongkan. Menutup sebelum memilih bulan (Esc, klik luar, swipe) tidak mengubah nilai.
  - **Batas:** Start/End/Issued maksimal bulan berjalan; Expires boleh di masa depan. End/Expires: tahun & bulan sebelum Start/Issued Disabled, picker dibuka di tahun Start. Bila Start digeser melewati End → End State=Error "End must be after the start date." — untuk sertifikat (Expires) pakai pesan API "Expiry must be after the issue date." (nilai tidak dihapus).
  - **Opsional:** End & Expires punya tombol **Clear**. Checkbox "currently here" / "No expiry" → trigger Disabled.
  - **Tampilan:** Popover 320 px di desktop/tablet (di bawah field, pindah ke atas bila tidak muat); **Sheet** di mobile dengan scrim, handle, dan judul field (`Title`).
- **Field upload** (`Form Field` Type=Upload):
  - **Kosong:** kotak garis putus-putus, ikon Upload, "Upload {label}", dan hint. Seluruh kotak bisa diklik atau menerima drag & drop.
  - **Nama & meta file:** nama = nama berkas lokal selama sesi upload; data dari API (tanpa nama asli) → "Current {label}" (mis. "Current photo"), bukan basename URL. Meta dari skema `Image`: gambar "1600 × 1131 px · WebP · 340 KB", PDF "PDF · 1.2 MB" (`size`: < 1 MB → KB bulat, ≥ 1 MB → MB 1 desimal).
  - **Sudah ada file:** garis **solid** `border/subtle`, padding 12. Berisi pratinjau gambar (*contain*, latar `bg/primary`, radius 6), nama file, "lebar × tinggi px · format" (`File Meta`), hint, lalu tombol `Button` Outline Small **Replace** (ikon Upload) dan **Remove**. Tidak ada lagi teks "Remove photo" kecil di luar kotak.
  - **State=Filled** (lebar ≥ ±480 px, kartu admin desktop/tablet): pratinjau 120×120 di kiri, info dan tombol di kanan.
  - **State=Filled Stacked** (panel 400 px dan mobile): pratinjau selebar field, tinggi 160 (logo 120), info di bawahnya, lalu dua tombol dengan lebar sama.
  - Saat mengunggah: spinner di atas pratinjau dan "Uploading…"; tombol nonaktif. File PDF (sertifikat) tidak punya pratinjau, sehingga cukup nama file dan meta.
  - Panel Project memakai body yang di-scroll karena field gambar terisi lebih tinggi.
- **Feedback:** Delete → `Dialog/Confirm` → toast "Item deleted"; hapus instansi → dialog "This also deletes its N positions."; Save → toast "Changes saved" (hilang otomatis 2 detik); 400 → pesan per field (`Form Field` State=Error); 409 kategori berisi skill → toast "Remove its skills before deleting this category."; sertifikat: "Expiry must be after the issue date.", "Issue date cannot be in the future.", "Add a file or a credential URL to publish.", "Invalid file."; validasi umum semua resource: "This field is required." / "Enter a valid URL."; daftar kosong → `Empty State`.
- **Sertifikat di portofolio:** **View membuka `Overlay/Certificate Viewer` untuk gambar maupun PDF** (nama, "Issuer · Mon YYYY", "Open original", tutup dengan ×/Esc/klik scrim; scrim = primitive `black` 85%).
  - Gambar: `<img>` `object-fit: contain`.
  - PDF (`Overlay/Certificate Viewer - PDF (Desktop)`): area konten berisi penampil PDF bawaan browser — `<iframe src="{url}#navpanes=0&view=FitH" title={nama}>` (panel thumbnail disembunyikan, halaman selebar area; toolbar zoom/unduh bawaan tetap) — yang bisa di-scroll per halaman; Skeleton selama memuat. API menyajikan PDF dengan `Content-Disposition: inline`.
  - **Keyboard:** iframe PDF `tabIndex=-1` (tidak masuk urutan Tab), karena fokus di dalam penampil PDF bawaan menelan Esc/Tab sehingga overlay tak bisa ditutup. Pengguna keyboard menutup dengan ×/Esc di halaman dan membuka PDF penuh lewat "Open original"; pengguna mouse yang mengklik ke dalam PDF perlu klik di luar (atau ×) sebelum Esc berfungsi lagi.
  - Fallback: bila browser tidak bisa menampilkan PDF di halaman (`navigator.pdfViewerEnabled === false`, mis. kebanyakan browser mobile/Chrome Android), View langsung membuka PDF di tab baru.
  - Verify → credential URL di tab baru.
- **Sesi:** saat admin dimuat → "Checking session_" (refresh sekali); refresh gagal → Admin Login + Alert "Your session has expired. Please log in again."; 401 login → Alert "Invalid username or password."; 429 → Alert "Too many attempts. Try again later."

---

## 8. Aturan Konten yang Bisa Bertambah

- **Skill:** tambah instance `Skill Tile` di grid kategori; kategori baru (mis. "Tools") = duplikat `Group/*`. Grid wrap otomatis.
- **Project:** tambah instance `Card/Project`. Halaman portofolio menampilkan maks 6 kartu (desktop/tablet), sisanya di **Projects Archive**. Mobile: carousel + `Pagination Dots` (jumlah titik = jumlah kartu).
- **Timeline (model LinkedIn: instansi → posisi), 2 grup:**
  - **Education:** jenjang & jurusan sebagai posisi, mis. "(S1)", "(S2)".
  - **Work & Organization:** pekerjaan dan organisasi.
  - Instansi dengan 1 posisi → `Timeline Item` (Description = jabatan, Place = "Instansi · Type"); 2+ posisi → `Timeline Group` + `Timeline Position`.
  - **Type:** Full-time · Part-time · Freelance · Contract · Internship · Self-employed · Member · Board · Committee · Volunteer (Education otomatis `education`).
  - **Periode:** `2021 – 2025` (en dash); masih berjalan `2025 – Present` + `Current=true`; **Committee** cukup satu tahun + nama acara.
  - **Urutan:** item Current paling atas, lalu terbaru. Item terakhir `Last=true`. Maks 3 per grup; jika lebih, tampilkan layer `Button/See All`.
  - **Data implementasi:** `start_date`, `end_date` (`YYYY-MM`, nullable), `is_current`; label periode memakai `period_label` dari API apa adanya. Placeholder "20XX" harus diganti tahun & bulan asli sebelum seed.
- **Project open source** (`repo_url` terisi):
  - Kartu menampilkan chip "Open source" dan tombol **Source** (tab baru, `rel="noopener"`, `aria-label` "Source code of {title} on GitHub"). Tombol Visit tetap opsional — project backend (API, CLI, library) boleh hanya punya Source.
  - Info repo = bahasa · ★ stars · lisensi, hasil sinkronisasi backend dengan GitHub (cache 6–12 jam). ★ disembunyikan bila 0; bagian yang kosong tidak ditulis; repo yang diarsipkan diberi "· Archived"; bila belum/gagal sinkron seluruh baris info disembunyikan (Source tetap tampil). Monokrom — tanpa warna bahasa ala GitHub.
- **Certificate:** urutan manual (`sort_order`); tanggal `YYYY-MM` ditampilkan "Mon YYYY"; tanpa batas jumlah (tidak ada "See all").

---

## 9. Prototype & Aksesibilitas

**Alur prototype**
- Navbar/menu → scroll ke section; hamburger → overlay `Menu - Mobile`; `Theme Toggle` → ganti mode Dark/Light.
- "See all projects" / "See all" → **Projects Archive**; "Back to portfolio" → portofolio.
- Login → Admin (ukuran layar sama) · Log out → Login · sidebar/tab admin → scroll ke section.
- Edit/Add → Panel · Delete → Dialog → toast · Save → toast. Tautan `#certificates` (navbar, menu, sidebar admin) → scroll ke section.
- Hover pada `Button`, `Nav Link`, `Theme Toggle`; klik `Input` → Focus; klik ikon mata → tampil/sembunyi.

**Aksesibilitas**
- Area sentuh ≥ 44 px untuk tombol ikon (menu, toggle, ikon sosial, tutup).
- Anotasi `aria-label`/`role` pada tombol ikon, `Theme Toggle` (`role=switch`), tombol mata (`aria-pressed`).
- Focus state 2 px di `Button`, `Input`, `Theme Toggle`.
- Viewer sertifikat PDF: iframe tidak masuk urutan Tab (lihat §7); "Open original" adalah jalur keyboard ke PDF penuh.
- `Month Year Picker`: `role=dialog` berlabel nama field, grid `role=grid`, sel `aria-selected` / `aria-disabled`; panah pindah sel, Enter memilih, Esc menutup, PageUp/PageDown ±12 tahun; fokus kembali ke trigger; `aria-live` "Choose a month for {tahun}".

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
| Status open source & info repo | **Dummy**: Nature Music App (TypeScript · ★ 12 · MIT, Visit + Source), Personal Portfolio (TypeScript · MIT, Source saja) |
| Co-Founder — Ikhwannet Somba Palioi | Tipe **Full-time** masih placeholder |
| UKM MAPALA — Ketua Panitia | **20XX** · **[Nama Acara]** |
| UKM MAPALA — Anggota | **20XX – 20XX** |
| S2 Universitas Hasanuddin | Tahun mulai **2025** (asumsi) |
| Tautan sosial | URL belum diisi ("URL not set" di admin) |
| Sertifikat | **Dummy**: "Certificate name", "Issuer", "Mon 20XX", gambar viewer berupa placeholder |

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
| 16 | **Penyesuaian dengan kontrak `openapi.yaml`**: `Form Field` State Error/Disabled + properti Error & Hint; `Checkbox` Disabled; chip Draft di `Admin/List Item`; komponen `Alert`, `Pagination`, `Icon/Social X`, `Icon/Social Link`; Photo di #home admin; sub-list & panel Skill Category; Published di panel Project/Skill/Social; Label opsional di Social; hint upload per jenis; visit button Disabled tanpa link; contoh panel Timeline Edit/Education, panel Organization, Delete Confirm organisasi, toast 409 kategori; contoh login error (401/429/sesi habis), Checking session, Projects Archive berpaginasi; properti Summary di timeline; meta social link = URL; anotasi kaitan API pada setiap contoh. |
| 17 | **Sertifikat**: komponen `Certificate Item` (Default/Loading); section `#certificates` di Desktop/Tablet/Mobile (contact-me berganti ke `bg/primary`); tautan di navbar, menu mobile, sidebar & tab admin; kartu admin #certificates; `Panel/Certificate - Desktop` + contoh error; `Overlay/Certificate Viewer` desktop & mobile; skeleton sertifikat di contoh Loading; usulan kontrak `PROPOSAL-certificates-api.md`. |
| 18 | **Field upload terisi**: `Form Field` Upload State=Filled (pratinjau 120 di kiri) & Filled Stacked (pratinjau atas), properti `File Meta`, tombol Replace/Remove, garis solid saat terisi; diterapkan di Photo (#home admin desktop/tablet/mobile), Image (panel Project & contoh Saving), Logo (panel Skill); body panel Project di-scroll. |
| 19 | **Month Year Picker**: pengganti dropdown bulan/tahun — tahun dulu (grid 12 tahun), lalu grid bulan muncul di bawah; komponen `Picker/Cell` (5 state) dan `Month Year Picker` (Step × Layout Popover/Sheet, Title, Show Clear); contoh Step 1, Step 2, End setelah Start, dan sheet mobile di section 05; aturan batas tanggal, Clear, dan aksesibilitas. |
| 20 | **Project open source**: `Card/Project` + chip Open source, info repo, tombol Source (properti default off); kartu satu baris sama tinggi; dummy pada Nature Music App & Personal Portfolio di portofolio, archive, dan contoh state; filter All / Open source di Projects Archive; field Repository URL + status sinkronisasi di panel Project (desktop, mobile, Saving) dan contoh panel repo/repo error; Meta "Open source ·" di daftar admin. |
| 21 | **Ikon situs "^\|<"** (A K leetspeak): master 512, versi 16/32 px digambar per piksel, varian maskable; ekspor favicon.svg/.ico, PNG 16–512, apple-touch-icon, site.webmanifest; contoh tab terang/gelap dan home screen. |
| 22 | **Viewer sertifikat untuk PDF**: `Overlay/Certificate Viewer - PDF (Desktop)` — PDF dibuka di overlay dengan penampil PDF browser; fallback tab baru bila `navigator.pdfViewerEnabled` false (umumnya mobile). |

---

## 12. Pekerjaan Berikutnya

**Butuh masukan pemilik**
- [ ] Data project asli: judul, deskripsi, gambar, link (menggantikan dummy).
- [ ] Data placeholder timeline: tipe posisi Co-Founder, Ketua Panitia (tahun & nama acara), periode Anggota, tahun mulai S2.
- [ ] URL tautan sosial.
- [ ] Daftar skill lengkap, terutama backend & infrastruktur (database, Docker, Linux, cloud).
- [ ] Bahasa konten (paragraf about, intro project, deskripsi timeline) masih Indonesia sementara UI Inggris — putuskan apakah konten diterjemahkan.

- [ ] Daftar sertifikat asli (nama, penerbit, tanggal, file/URL verifikasi).
- [x] **Backend:** sertifikat masuk `openapi.yaml` v1.1.0 (`/certificates`, `certificates` di `/portfolio`, `/admin/certificates` + reorder, upload `certificate_file` ≤ 5 MB).

- [ ] **Backend (open source) — DITAHAN** (token GitHub belum ada; tidak ada di `openapi.yaml` v1.1.0, frontend pakai mock/sembunyikan): field `repo_url` di project; objek `repo` { language, stars, license, archived, synced_at } dari sinkronisasi GitHub API (cache 6–12 jam, token server); filter `?type=open-source` di `/projects`; validasi URL repo publik (400 "Repository not found or private."). Belum ada di `openapi.yaml`.
- [ ] Tandai project mana yang benar-benar open source (data dummy saat ini).

**Bisa dikerjakan langsung**
- [ ] Tombol "Kirim Email" di #contact-me (opsional).
- [ ] Frame contoh state "Currently" tercentang di panel Timeline item.

- [ ] Panel Timeline desktop (768 px) lebih tinggi dari layar: bagian bawah body di-scroll; pertimbangkan merapatkan jarak field.
- [ ] Error dan Focus memakai border 2 px yang sama; pembedanya hanya pesan + ikon ×.
- [ ] Contoh panel/dialog baru baru ada versi desktop (mobile mengikuti pola panel layar penuh yang sama), termasuk `Panel/Certificate`.
- [ ] Panel Certificate desktop juga lebih tinggi dari 768 px (body di-scroll), sama seperti panel Timeline.

**Keterbatasan alat**
- Navbar sticky saat scroll belum didukung FigCraft.
- Prototype belum diuji langsung; tujuan interaksi diverifikasi lewat data layer.
- Set ikon sosial berasal dari library impor (read-only), sehingga ikon X/Link dibuat sebagai komponen lokal terpisah.
