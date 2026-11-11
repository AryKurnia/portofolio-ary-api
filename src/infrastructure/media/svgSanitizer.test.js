const { looksLikeSvg, sanitizeSvg } = require('./svgSanitizer');

const svg = (inner, attrs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 10 10"${attrs}>${inner}</svg>`;

describe('svgSanitizer', () => {
  describe('looksLikeSvg', () => {
    it.each([
      ['svg polos', svg('')],
      ['dengan deklarasi XML', `<?xml version="1.0"?>\n${svg('')}`],
      [
        'dengan komentar dan DOCTYPE',
        `<!-- logo -->\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "x">\n${svg('')}`,
      ],
      ['dengan BOM', `\uFEFF${svg('')}`],
    ])('mengenali %s', (_label, text) => {
      expect(looksLikeSvg(Buffer.from(text))).toBe(true);
    });

    it.each([
      ['HTML', '<html><svg></svg></html>'],
      ['teks biasa', 'hello'],
      ['PNG', '\x89PNG\r\n'],
    ])('tidak menganggap %s sebagai SVG', (_label, text) => {
      expect(looksLikeSvg(Buffer.from(text))).toBe(false);
    });
  });

  describe('sanitizeSvg', () => {
    it.each([
      ['<script>', svg('<script>alert(1)</script><rect width="1" height="1"/>'), /<script/i],
      ['atribut on*', svg('<rect onload="alert(1)" onclick="x()" width="1"/>'), /on(load|click)/i],
      ['onload di root', svg('<rect/>', ' onload="alert(1)"'), /onload/i],
      [
        'foreignObject + iframe',
        svg('<foreignObject><iframe src="https://evil"></iframe></foreignObject>'),
        /foreignObject|iframe/i,
      ],
      ['link javascript:', svg('<a href="javascript:alert(1)"><rect/></a>'), /javascript:/i],
      [
        'use ke file eksternal',
        svg('<use xlink:href="https://evil.example/x.svg#a"/>'),
        /evil\.example/,
      ],
      [
        'use dengan data: URL',
        svg(
          '<use href="data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+#a"/>'
        ),
        /data:/,
      ],
      ['image eksternal', svg('<image href="http://evil.example/track.png"/>'), /evil\.example/],
      [
        'style @import',
        svg('<style>@import url(https://evil.example/x.css);</style><rect/>'),
        /evil\.example|@import/,
      ],
      [
        'style attr url() eksternal',
        svg('<rect style="fill:url(https://evil.example/x)"/>'),
        /evil\.example/,
      ],
    ])('membuang %s', (_label, input, forbidden) => {
      const clean = sanitizeSvg(input);
      expect(clean).toMatch(/^<svg/);
      expect(clean).not.toMatch(forbidden);
    });

    it('mempertahankan bentuk, gradien, dan referensi lokal (#id)', () => {
      const input = svg(
        '<defs><linearGradient id="g"><stop offset="0" stop-color="#f00"/></linearGradient></defs>' +
          '<path id="p" d="M0 0L10 10" fill="url(#g)"/><use href="#p"/><style>.a{fill:#000}</style>'
      );
      const clean = sanitizeSvg(input);
      expect(clean).toContain('linearGradient');
      expect(clean).toContain('fill="url(#g)"');
      expect(clean).toContain('href="#p"');
      expect(clean).toContain('.a{fill:#000}');
    });

    it('mengembalikan null bila isinya bukan SVG', () => {
      expect(sanitizeSvg('<div>bukan svg</div>')).toBeNull();
    });
  });
});
