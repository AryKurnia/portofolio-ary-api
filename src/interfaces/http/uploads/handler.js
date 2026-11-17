const streamConsumers = require('node:stream/consumers');
const container = require('../../../infrastructure/container');
const { toImageResponse } = require('../shared/media');

module.exports = {
  // Tipe file ditentukan dari ISI file oleh ImageProcessor, bukan dari header Content-Type klien.
  async upload(request, h) {
    const buffer = await streamConsumers.buffer(request.payload.file);
    const media = await container.uploadMedia.execute({ kind: request.query.kind, buffer });
    return h.response({ data: { kind: media.kind, ...toImageResponse(media) } }).code(201);
  },

  async remove(request, h) {
    await container.deleteMedia.execute(request.params.id);
    return h.response().code(204);
  },
};
