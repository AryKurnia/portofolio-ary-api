# Panduan Skenario Unit Test — Use-Case Layer

Checklist ini dipakai untuk menentukan skenario test yang perlu ditulis
untuk tiap use-case di `src/usecases/` (atau `src/use-cases/`). Prinsip
utamanya: **jumlah skenario mengikuti jumlah jalur logic di kode**,
bukan angka pasti yang harus dipenuhi.

Cara pakai: baca `execute()` baris per baris, cocokkan tiap baris ke
kategori di bawah, lalu tulis 1 skenario test per kategori yang cocok.

---

## 1. Happy path — jalur sukses normal

Selalu ada di setiap use-case. Assert 2 hal:
- **Input** yang diteruskan ke dependency benar (`toHaveBeenCalledWith`)
- **Output** yang dikembalikan `execute()` benar (`expect(result)`)

```js
it('mengupdate skill dan mengembalikan hasilnya', async () => {
  // ARRANGE, ACT
  // ASSERT
  expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({...}));
  expect(result).toEqual({...});
});
```

## 2. Fail-fast — precondition tidak terpenuhi

Muncul tiap kali ada pola:
```js
if (!existingX) {
  throw new NotFoundError(...);
}
```

Wajib assert **2 hal**:
- Error yang tepat dilempar (`rejects.toThrow(NotFoundError)`)
- Langkah setelahnya **tidak ikut terpanggil** (`not.toHaveBeenCalled()`)
  — ini yang membuktikan proses benar-benar berhenti, bukan cuma error
  di ujung.

Contoh: `NotFoundError` di `UpdateSkill`, `DeleteSkill`,
`GetSocialMediaByPlatform`.

## 3. Setiap dependency yang bisa gagal → 1 skenario error terpisah

**Patokan**: hitung berapa banyak `await this._xxx.yyy(...)` ada di
`execute()`. Tiap satu adalah 1 titik potensi gagal, butuh 1 skenario
"meneruskan error kalau gagal" **sendiri** — jangan asumsikan 1
skenario error mewakili semua dependency call.

Contoh: `UploadSkillLogo` punya 2 dependency call
(`fileStorage.upload`, `skillRepository.update`) → 2 skenario error
terpisah, bukan 1.

## 4. Field yang "seharusnya tidak bisa berubah" → 1 skenario proteksi per field

**Cara mendeteksi**: lihat field mana di entity yang **tidak** ada di
parameter `execute()`, tapi ikut ter-spread dari `existingX`:

```js
const updated = new Skill({
  ...existingSkill, // <- field di sini yang tidak disebut ulang di bawah
  name,
  description,
  enabled,
  // logoUrl TIDAK disebut -> field terproteksi
});
```

Tiap field seperti ini berisiko diam-diam berubah kalau ada bug
refactor. Tulis 1 test yang sengaja "mencoba menipu" (kirim payload
dengan field itu diisi nilai lain), lalu buktikan tetap tidak berubah
di argumen yang dikirim ke repository:

```js
it('platform tidak berubah walau dikirim di payload update', async () => {
  await updateSocialMedia.execute('instagram', { ...payload, platform: 'lain' });

  expect(mockRepo.update).toHaveBeenCalledWith(
    'instagram',
    expect.objectContaining({ platform: 'instagram' })
  );
});
```

Contoh: `logoUrl` di `UpdateSkill`, `platform` di `UpdateSocialMedia`.

## 5. Default value / optional parameter

Kalau `execute()` punya default:
```js
async execute({ page = 1, limit = 10 } = {}) { ... }
```
butuh 2 skenario terpisah: pakai nilai custom yang dikirim, dan pakai
default kalau tidak diisi.

Contoh: `ListSkills.test.js`.

---

## Ringkasan cepat

| Pola di kode | Kategori | Wajib assert |
|---|---|---|
| `if (...) throw` | 2 | error dilempar + langkah setelahnya `not.toHaveBeenCalled()` |
| `await this._xxx.yyy()` | 3 | 1 skenario reject per dependency call |
| Field di-spread, tidak disebut ulang | 4 | field tetap dari `existingX` walau "ditipu" di payload |
| Parameter dengan `= default` | 5 | custom value + default value, 2 skenario terpisah |

Bukan tiap use-case butuh semua 5 kategori. Contoh:
- `ListSocialMedia` — cuma butuh kategori 1 dan 3 (tidak ada
  precondition, tidak ada field protection, tidak ada default).
- `UpdateSocialMedia` — butuh kategori 1, 2, 3 (x2, karena 2
  dependency call: `findByPlatform` + `update`), dan 4 → 5 skenario
  total.

## Prinsip umum

- Assert **sedetail level di mana logic use-case bisa salah**. Kalau
  logic-nya cuma "terusin data apa adanya" (contoh: `ListSocialMedia`),
  cukup buktikan "dipanggil" + "balikin sesuatu" — assert isi field
  satu-satu tidak menambah bukti apa pun kalau tidak ada transformasi
  data di use-case-nya.
- Pola AAA (Arrange-Act-Assert) di tiap `it`.
- Judul test menjelaskan **perilaku yang diharapkan**, bukan nama
  fungsi — supaya kalau gagal, langsung jelas apa yang rusak dari
  judulnya saja.
- Jangan menumpangkan pembuktian skenario baru ke test lain yang sudah
  ada (happy path, dst) — buat test terpisah dengan judul eksplisit,
  supaya laporan Jest yang gagal langsung mengarahkan ke akar masalah.