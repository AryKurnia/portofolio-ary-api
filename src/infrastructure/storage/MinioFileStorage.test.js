const MinioFileStorage = require('./MinioFileStorage');

describe('MinioFileStorage', () => {
  const bucketName = 'portfolio';
  const publicBaseUrl = 'https://minio.arykurnia.my.id';

  describe('API media (object key)', () => {
    it('putObject menyimpan dengan Content-Type dan Cache-Control', async () => {
      const client = { putObject: jest.fn().mockResolvedValue({}) };
      const storage = new MinioFileStorage(client, bucketName, publicBaseUrl);
      const buffer = Buffer.from('x');

      await storage.putObject({
        key: 'a/b.webp',
        buffer,
        contentType: 'image/webp',
        cacheControl: 'immutable',
      });

      expect(client.putObject).toHaveBeenCalledWith(bucketName, 'a/b.webp', buffer, 1, {
        'Content-Type': 'image/webp',
        'Cache-Control': 'immutable',
      });
    });

    it('deleteObject menghapus berdasarkan key', async () => {
      const client = { removeObject: jest.fn().mockResolvedValue(undefined) };
      await new MinioFileStorage(client, bucketName, publicBaseUrl).deleteObject('a/b.webp');
      expect(client.removeObject).toHaveBeenCalledWith(bucketName, 'a/b.webp');
    });

    it('getPublicUrl menyusun URL publik dari key', () => {
      const storage = new MinioFileStorage({}, bucketName, publicBaseUrl);
      expect(storage.getPublicUrl('a/b.webp')).toBe(`${publicBaseUrl}/${bucketName}/a/b.webp`);
    });

    it('meneruskan error kalau putObject gagal', async () => {
      const client = { putObject: jest.fn().mockRejectedValue(new Error('MinIO error')) };
      const result = new MinioFileStorage(client, bucketName, publicBaseUrl).putObject({
        key: 'k',
        buffer: Buffer.from('x'),
        contentType: 'image/webp',
      });
      await expect(result).rejects.toThrow('MinIO error');
    });
  });
});
