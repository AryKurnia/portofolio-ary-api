const Position = require('./Position');

describe('Position.validate', () => {
  const now = new Date('2026-11-11T00:00:00Z');
  const base = { organizationId: 1, title: 'Anggota', type: 'member', startDate: '2022-01' };
  const errorsOf = (attrs, group = 'work_organization') =>
    new Position({ ...base, ...attrs }).validate({ group, now });
  const fields = (errors) => errors.map((error) => error.field);

  it('posisi valid tidak menghasilkan error', () => {
    expect(errorsOf({ endDate: '2025-06' })).toEqual([]);
  });

  it('posisi current tidak boleh punya end_date', () => {
    expect(fields(errorsOf({ isCurrent: true, endDate: '2025-01' }))).toEqual(['end_date']);
  });

  it('end_date tidak boleh sebelum start_date', () => {
    expect(fields(errorsOf({ startDate: '2024-05', endDate: '2024-04' }))).toEqual(['end_date']);
  });

  it('end_date di bulan yang sama dengan start_date diperbolehkan', () => {
    expect(errorsOf({ startDate: '2024-05', endDate: '2024-05' })).toEqual([]);
  });

  it('committee wajib punya event_name', () => {
    expect(fields(errorsOf({ type: 'committee' }))).toEqual(['event_name']);
  });

  it('committee dengan event_name dan tanpa end_date valid (acara satu tahun)', () => {
    expect(errorsOf({ type: 'committee', eventName: 'Diksar' })).toEqual([]);
  });

  it('event_name hanya boleh untuk committee', () => {
    expect(fields(errorsOf({ eventName: 'Diksar' }))).toEqual(['event_name']);
  });

  it('start_date paling jauh satu tahun ke depan', () => {
    expect(errorsOf({ startDate: '2027-11' })).toEqual([]);
    expect(fields(errorsOf({ startDate: '2027-12' }))).toEqual(['start_date']);
  });

  it('organisasi education hanya menerima tipe education', () => {
    expect(fields(errorsOf({ type: 'member' }, 'education'))).toEqual(['type']);
    expect(errorsOf({ type: 'education' }, 'education')).toEqual([]);
  });

  it('organisasi work_organization tidak menerima tipe education', () => {
    expect(fields(errorsOf({ type: 'education' }, 'work_organization'))).toEqual(['type']);
  });

  it('melaporkan semua pelanggaran sekaligus', () => {
    const errors = errorsOf(
      { type: 'committee', isCurrent: true, endDate: '2020-01' },
      'education'
    );
    expect(fields(errors)).toEqual(expect.arrayContaining(['end_date', 'event_name', 'type']));
  });
});
