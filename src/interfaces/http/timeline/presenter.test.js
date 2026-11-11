const { periodLabel, toOrganizationResponse } = require('./presenter');

describe('timeline presenter', () => {
  it.each([
    [{ startDate: '2023-01', endDate: '2025-06', isCurrent: false }, '2023 – 2025'],
    [{ startDate: '2025-01', endDate: null, isCurrent: true }, '2025 – Present'],
    [{ startDate: '2024-03', endDate: null, isCurrent: false }, '2024'],
    [{ startDate: '2024-03', endDate: '2024-09', isCurrent: false }, '2024'],
  ])('periodLabel(%o) = "%s" (en dash, spasi)', (position, expected) => {
    expect(periodLabel(position)).toBe(expected);
  });

  it('organisasi berisi is_current turunan dan posisi dengan type_label + period_label', () => {
    // ARRANGE
    const organization = {
      id: 1,
      name: 'MAPALA',
      group: 'work_organization',
      location: null,
      sortOrder: null,
      positions: [
        {
          id: 5,
          organizationId: 1,
          title: 'Ketua Panitia',
          type: 'committee',
          eventName: 'Diksar',
          startDate: '2024-01',
          endDate: null,
          isCurrent: false,
          description: null,
          sortOrder: 1,
        },
      ],
    };

    // ACT
    const result = toOrganizationResponse(organization);

    // ASSERT
    expect(result.is_current).toBe(false);
    expect(result.positions[0]).toEqual(
      expect.objectContaining({
        type_label: 'Committee',
        event_name: 'Diksar',
        period_label: '2024',
      })
    );
  });
});
