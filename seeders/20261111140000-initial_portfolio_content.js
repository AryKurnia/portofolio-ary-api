// Konten awal portofolio dari desain (docs/design/API.md §11).
// Hanya data yang sudah pasti; data placeholder (Ketua Panitia, Anggota MAPALA, MA PP Nurul Falah)
// sengaja dilewati dan diisi lewat admin. Tanggal hanya diketahui tahunnya → disimpan YYYY-01-01.
// Email kontak = ADMIN_EMAIL (.env), bisa diubah lewat admin.

const now = () => new Date();
const withTimestamps = (row) => ({ ...row, created_at: now(), updated_at: now() });

const ORGANIZATIONS = [
  {
    name: 'Universitas Hasanuddin Makassar',
    group_type: 'education',
    positions: [
      // ⚠️ tahun mulai 2025 masih asumsi desain
      {
        title: 'S2 Teknik Informatika, Fakultas Teknik',
        type: 'education',
        start_date: '2025-01-01',
        is_current: true,
      },
    ],
  },
  {
    name: 'Universitas Handayani Makassar',
    group_type: 'education',
    positions: [
      {
        title: 'S1 Teknik Informatika',
        type: 'education',
        start_date: '2021-01-01',
        end_date: '2025-01-01',
      },
    ],
  },
  {
    name: 'Ikhwannet Somba Palioi',
    group_type: 'work_organization',
    positions: [
      // ⚠️ tipe full_time masih placeholder desain
      { title: 'Co-Founder', type: 'full_time', start_date: '2025-01-01', is_current: true },
    ],
  },
  {
    name: 'UKM MAPALA Universitas Handayani Makassar',
    group_type: 'work_organization',
    positions: [
      { title: 'Sekretaris Umum', type: 'board', start_date: '2023-01-01', end_date: '2025-01-01' },
    ],
  },
];

const DUMMY_PROJECTS = ['Nature Music App', 'FitAI Coach', 'Personal Portfolio'];

module.exports = {
  async up(queryInterface) {
    if (!process.env.ADMIN_EMAIL) throw new Error('ADMIN_EMAIL wajib diisi untuk seeder konten');

    await queryInterface.bulkInsert('profile', [
      withTimestamps({
        id: 1,
        greeting: "Hi, I'm Ary Kurnia",
        tagline: 'a Web and Back-End developer',
        about:
          'Saya adalah lulusan S1 Teknik Informatika yang memiliki ketertarikan mendalam pada ' +
          'rekayasa perangkat lunak, khususnya di sisi backend dan infrastruktur.',
        project_intro:
          'Berikut merupakan project yang pernah dikerjakan baik individu dan juga tim',
        email: process.env.ADMIN_EMAIL,
      }),
    ]);

    await queryInterface.bulkInsert('skill_categories', [
      withTimestamps({ name: 'Frontend', sort_order: 1 }),
      withTimestamps({ name: 'Backend', sort_order: 2 }),
    ]);

    // Dummy dari desain: tidak terbit, tanpa gambar & link, hanya contoh di admin.
    await queryInterface.bulkInsert(
      'projects',
      DUMMY_PROJECTS.map((title, index) =>
        withTimestamps({
          title,
          description: 'Deskripsi dummy dari desain — ganti lewat admin.',
          show_button: false,
          is_published: false,
          sort_order: index + 1,
        })
      )
    );

    for (const { positions, ...organization } of ORGANIZATIONS) {
      await queryInterface.bulkInsert('organizations', [withTimestamps(organization)]);
      const [[{ id }]] = await queryInterface.sequelize.query(
        'SELECT id FROM organizations WHERE name = ? AND group_type = ?',
        { replacements: [organization.name, organization.group_type] }
      );
      await queryInterface.bulkInsert(
        'positions',
        positions.map((position) =>
          withTimestamps({ is_current: false, end_date: null, ...position, organization_id: id })
        )
      );
    }
  },

  async down(queryInterface) {
    // positions ikut terhapus (ON DELETE CASCADE)
    await queryInterface.bulkDelete('organizations', {
      name: ORGANIZATIONS.map((organization) => organization.name),
    });
    await queryInterface.bulkDelete('projects', { title: DUMMY_PROJECTS, is_published: false });
    await queryInterface.bulkDelete('skill_categories', { name: ['Frontend', 'Backend'] });
    await queryInterface.bulkDelete('profile', { id: 1 });
  },
};
