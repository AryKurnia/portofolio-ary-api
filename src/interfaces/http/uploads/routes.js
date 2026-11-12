const handler = require('./handler');
const Media = require('../../../entities/Media');
const { idParamSchema } = require('../shared/validation');
const { uploadQuerySchema, uploadPayloadSchema } = require('./validator');

// Batas route = batas TERBESAR (file sertifikat 5 MB) + ruang untuk header multipart.
// Batas per jenis (mis. gambar 2 MB) dicek oleh use-case UploadMedia → 413 juga.
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;
const MAX_UPLOAD_BYTES = Media.MAX_BYTES + MULTIPART_OVERHEAD_BYTES;

module.exports = [
  {
    method: 'POST',
    path: '/admin/uploads',
    options: {
      auth: 'jwt',
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: MAX_UPLOAD_BYTES,
        allow: 'multipart/form-data',
      },
      validate: { query: uploadQuerySchema, payload: uploadPayloadSchema },
    },
    handler: handler.upload,
  },
  {
    method: 'DELETE',
    path: '/admin/uploads/{id}',
    options: { auth: 'jwt', validate: { params: idParamSchema } },
    handler: handler.remove,
  },
];
