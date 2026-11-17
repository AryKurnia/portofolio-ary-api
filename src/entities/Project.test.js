const Project = require('./Project');

describe('Project', () => {
  const base = { title: 'FitAI', description: 'x', imageMediaId: 1 };

  it('default show_button mengikuti ada/tidaknya link', () => {
    expect(new Project({ ...base, linkUrl: 'https://x.dev' }).showButton).toBe(true);
    expect(new Project({ ...base }).showButton).toBe(false);
  });

  it('default is_published true dan sort_order 0', () => {
    const project = new Project(base);
    expect(project.isPublished).toBe(true);
    expect(project.sortOrder).toBe(0);
  });

  it('valid bila terbit dengan gambar dan tombol punya link', () => {
    expect(new Project({ ...base, linkUrl: 'https://x.dev' }).validate()).toEqual([]);
  });

  it('show_button=true tanpa link tidak valid', () => {
    const errors = new Project({ ...base, showButton: true }).validate();
    expect(errors.map((e) => e.field)).toEqual(['show_button']);
  });

  it('project terbit tanpa gambar tidak valid, draf tanpa gambar valid', () => {
    expect(new Project({ title: 'a', description: 'b' }).validate().map((e) => e.field)).toEqual([
      'image_id',
    ]);
    expect(new Project({ title: 'a', description: 'b', isPublished: false }).validate()).toEqual(
      []
    );
  });
});
