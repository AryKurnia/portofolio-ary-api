const { randomUUID } = require('node:crypto');
const Media = require('../../entities/Media');
const removeObjectsQuietly = require('./removeObjectsQuietly');

// Nama objek unik + konten tidak pernah berubah → aman di-cache selamanya oleh browser/CDN.
const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

class UploadMedia {
  constructor({
    mediaRepository,
    fileStorage,
    imageProcessor,
    logger,
    keyPrefix = '',
    generateId = randomUUID,
  }) {
    this._mediaRepository = mediaRepository;
    this._fileStorage = fileStorage;
    this._imageProcessor = imageProcessor;
    this._logger = logger;
    this._keyPrefix = keyPrefix;
    this._generateId = generateId;
  }

  async execute({ kind, buffer }) {
    const processed = await this._imageProcessor.process({ buffer, kind });
    const id = this._generateId();

    const uploaded = [];
    try {
      for (const variant of processed.variants) {
        const suffix = variant.name === 'original' ? '' : `-${variant.name}`;
        const key = `${this._keyPrefix}${kind}/${id}${suffix}.${variant.extension}`;
        await this._fileStorage.putObject({
          key,
          buffer: variant.buffer,
          contentType: variant.contentType,
          cacheControl: IMMUTABLE_CACHE_CONTROL,
        });
        uploaded.push({ name: variant.name, key, size: variant.buffer.length });
      }

      // Varian terakhir (terbesar) menjadi versi utama.
      const primary = uploaded[uploaded.length - 1];
      return await this._mediaRepository.create(
        new Media({
          kind,
          objectKey: primary.key,
          mime: processed.mime,
          sizeBytes: primary.size,
          width: processed.width,
          height: processed.height,
          variants: Object.fromEntries(uploaded.map((item) => [item.name, item.key])),
        })
      );
    } catch (error) {
      // Upload/penyimpanan gagal di tengah jalan: bersihkan objek yang sudah terunggah.
      await removeObjectsQuietly(
        this._fileStorage,
        this._logger,
        uploaded.map((item) => item.key),
        { kind }
      );
      throw error;
    }
  }
}

UploadMedia.IMMUTABLE_CACHE_CONTROL = IMMUTABLE_CACHE_CONTROL;

module.exports = UploadMedia;
