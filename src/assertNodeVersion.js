// Gagal cepat dengan pesan jelas bila dijalankan dengan Node yang terlalu lama.
// Tanpa ini, Node lama crash jauh di dalam node_modules (mis. undici memakai zlib zstd,
// yang baru ada di Node 22.15+) dengan pesan yang menyesatkan.
// Sengaja tanpa dependensi apa pun agar bisa dimuat paling awal.
const { engines } = require('../package.json');

const required = Number(/\d+/.exec(engines.node)[0]);
const current = Number(process.versions.node.split('.')[0]);

if (current < required) {
  console.error(
    `Node ${process.versions.node} terlalu lama: proyek ini butuh Node ${engines.node}.\n` +
      'Jalankan `nvm use` di folder proyek (membaca .nvmrc), lalu coba lagi.'
  );
  process.exit(1);
}
