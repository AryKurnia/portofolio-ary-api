const { randomUUID } = require('crypto');
const path = require('path');
const FileStorage = require('../../storages/FileStorage');

class MinioFileStorage extends FileStorage {
  constructor(minioClient, bucketName, publicBaseUrl) {
    super();
    this._client = minioClient;
    this._bucket = bucketName;
    this._publicBaseUrl = publicBaseUrl;
  }

  async upload({ buffer, filename, mimeType, folder }) {
    const ext = path.extname(filename);
    const objectName = `${folder}/${randomUUID()}${ext}`;

    await this._client.putObject(this._bucket, objectName, buffer, buffer.length, {
      'Content-Type': mimeType,
    });

    return `${this._publicBaseUrl}/${this._bucket}/${objectName}`;
  }

  async delete(fileUrl) {
    const prefix = `${this._publicBaseUrl}/${this._bucket}/`;
    const objectName = fileUrl.replace(prefix, '');
    await this._client.removeObject(this._bucket, objectName);
  }
}

module.exports = MinioFileStorage;