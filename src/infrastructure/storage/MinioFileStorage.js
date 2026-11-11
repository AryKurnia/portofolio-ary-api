const FileStorage = require('../../storages/FileStorage');

class MinioFileStorage extends FileStorage {
  constructor(minioClient, bucketName, publicBaseUrl) {
    super();
    this._client = minioClient;
    this._bucket = bucketName;
    this._publicBaseUrl = publicBaseUrl;
  }

  async putObject({ key, buffer, contentType, cacheControl }) {
    await this._client.putObject(this._bucket, key, buffer, buffer.length, {
      'Content-Type': contentType,
      ...(cacheControl ? { 'Cache-Control': cacheControl } : {}),
    });
  }

  async deleteObject(key) {
    await this._client.removeObject(this._bucket, key);
  }

  getPublicUrl(key) {
    return `${this._publicBaseUrl}/${this._bucket}/${key}`;
  }
}

module.exports = MinioFileStorage;
