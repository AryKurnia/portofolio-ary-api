const Organization = require('./Organization');
const Position = require('./Position');

describe('Organization', () => {
  const position = (attrs) =>
    new Position({ organizationId: 1, title: 'x', type: 'member', startDate: '2020-01', ...attrs });

  it('isCurrent true bila salah satu posisinya current', () => {
    const organization = new Organization({
      name: 'A',
      group: 'work_organization',
      positions: [position({}), position({ isCurrent: true })],
    });
    expect(organization.isCurrent).toBe(true);
  });

  describe('sortForTimeline', () => {
    it('mengurutkan posisi: current dulu, lalu start_date terbaru, lalu sort_order', () => {
      // ARRANGE
      const organization = new Organization({
        name: 'MAPALA',
        group: 'work_organization',
        positions: [
          position({ id: 1, startDate: '2022-01' }),
          position({ id: 2, startDate: '2024-01', sortOrder: 2 }),
          position({ id: 3, startDate: '2024-01', sortOrder: 1 }),
          position({ id: 4, startDate: '2019-01', isCurrent: true }),
        ],
      });

      // ACT
      const [sorted] = Organization.sortForTimeline([organization]);

      // ASSERT
      expect(sorted.positions.map((p) => p.id)).toEqual([4, 3, 2, 1]);
    });

    it('mengurutkan organisasi: yang punya posisi current dulu, lalu posisi terbaru, lalu sort_order', () => {
      // ARRANGE
      const organizations = [
        new Organization({ id: 1, name: 'Lama', positions: [position({ startDate: '2018-01' })] }),
        new Organization({ id: 2, name: 'Baru', positions: [position({ startDate: '2023-01' })] }),
        new Organization({
          id: 3,
          name: 'Aktif',
          positions: [position({ startDate: '2010-01', isCurrent: true })],
        }),
        new Organization({
          id: 4,
          name: 'Seri B',
          sortOrder: 2,
          positions: [position({ startDate: '2018-01' })],
        }),
        new Organization({
          id: 5,
          name: 'Seri A',
          sortOrder: 1,
          positions: [position({ startDate: '2018-01' })],
        }),
      ];

      // ACT
      const sorted = Organization.sortForTimeline(organizations);

      // ASSERT
      expect(sorted.map((o) => o.id)).toEqual([3, 2, 5, 4, 1]);
    });

    it('tidak mengubah array maupun urutan posisi pada input', () => {
      // ARRANGE
      const positions = [
        position({ id: 1, startDate: '2020-01' }),
        position({ id: 2, startDate: '2024-01' }),
      ];
      const input = [new Organization({ id: 1, name: 'A', positions })];

      // ACT
      Organization.sortForTimeline(input);

      // ASSERT
      expect(input[0].positions.map((p) => p.id)).toEqual([1, 2]);
    });
  });
});
