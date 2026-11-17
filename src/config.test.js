// config dibaca sekali saat modul dimuat, jadi tiap kasus memuat ulang modul dengan env berbeda.
describe('config CORS_ORIGINS', () => {
  const load = (env) => {
    const original = { ...process.env };
    Object.assign(process.env, env);
    try {
      let config;
      jest.isolateModules(() => {
        config = require('./config');
      });
      return config;
    } finally {
      process.env = original;
    }
  };

  it("'*' diizinkan di luar production (pengembangan lokal)", () => {
    expect(load({ NODE_ENV: 'development', CORS_ORIGINS: '*' }).server.corsOrigins).toEqual(['*']);
  });

  it("'*' ditolak saat production", () => {
    expect(() => load({ NODE_ENV: 'production', CORS_ORIGINS: '*' })).toThrow(
      /tidak boleh berisi "\*"/
    );
  });

  it('daftar origin dipisah koma dan di-trim', () => {
    const config = load({
      NODE_ENV: 'production',
      CORS_ORIGINS: 'https://a.example, https://b.example',
    });
    expect(config.server.corsOrigins).toEqual(['https://a.example', 'https://b.example']);
  });
});
