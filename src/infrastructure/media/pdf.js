// PDF dikenali dari ISI file (signature `%PDF-` di awal), bukan dari nama/Content-Type klien.
const PDF_SIGNATURE = '%PDF-';
const EOF_MARKER = '%%EOF';
// Penanda akhir boleh diikuti sedikit data sisa (umum pada PDF hasil ekspor).
const EOF_SEARCH_BYTES = 1024;

const looksLikePdf = (buffer) =>
  buffer.subarray(0, PDF_SIGNATURE.length).toString('latin1') === PDF_SIGNATURE;

// File terpotong (unggahan gagal di tengah) tidak punya penanda %%EOF di bagian akhir.
const hasEndMarker = (buffer) =>
  buffer.subarray(-EOF_SEARCH_BYTES).toString('latin1').includes(EOF_MARKER);

module.exports = { looksLikePdf, hasEndMarker };
