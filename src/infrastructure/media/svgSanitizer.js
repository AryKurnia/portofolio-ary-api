const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const purify = createDOMPurify(new JSDOM('').window);

const isLocalReference = (value) => value.trim().startsWith('#');
const EXTERNAL_CSS = /@import|url\(\s*['"]?\s*(?!#)/i;

// Link (href/xlink:href) hanya boleh ke elemen di dalam file yang sama (#id).
purify.addHook('uponSanitizeAttribute', (node, data) => {
  const name = data.attrName.toLowerCase();
  if ((name === 'href' || name === 'xlink:href') && !isLocalReference(data.attrValue)) {
    data.keepAttr = false;
  }
  if (name === 'style' && EXTERNAL_CSS.test(data.attrValue)) {
    data.keepAttr = false;
  }
});

// <style> yang memuat sumber eksternal dibuang seluruhnya.
purify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'style' && EXTERNAL_CSS.test(node.textContent ?? '')) {
    node.parentNode?.removeChild(node);
  }
});

const SVG_START =
  /^(\uFEFF)?\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i;

const looksLikeSvg = (buffer) => SVG_START.test(buffer.subarray(0, 2048).toString('utf8'));

/**
 * Membersihkan SVG dari script, event handler (on*), foreignObject, dan referensi eksternal.
 * Mengembalikan string SVG bersih, atau null bila hasilnya bukan SVG lagi.
 */
const sanitizeSvg = (svgText) => {
  const clean = purify.sanitize(svgText, {
    USE_PROFILES: { svg: true, svgFilters: true },
    // <use> dibuang DOMPurify secara default karena bisa memuat file eksternal; di sini aman
    // diizinkan karena hook di atas hanya menyisakan href lokal (#id).
    ADD_TAGS: ['use'],
    FORBID_TAGS: ['foreignObject', 'script'],
  });
  return /^<svg[\s>]/i.test(clean.trim()) ? clean.trim() : null;
};

module.exports = { looksLikeSvg, sanitizeSvg };
