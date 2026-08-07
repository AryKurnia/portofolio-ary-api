const MinioFileStorage = require('./MinioFileStorage');

describe('MinioFileStorage', () => {
  const bucketName = 'portfolio';
  const publicBaseUrl = 'https://minio.arykurnia.my.id';

  describe('upload', () => {
    it('upload file dan mengembalikan public URL yang benar', async () => {
      // ARRANGE
      const mockMinioClient = {
        putObject: jest.fn().mockResolvedValue({ etag: 'fake-etag' }),
      };
      const storage = new MinioFileStorage(mockMinioClient, bucketName, publicBaseUrl);
      const buffer = Buffer.from('fake-image-content');

      // ACT
      const result = await storage.upload({
        buffer,
        filename: 'logo.png',
        mimeType: 'image/png',
        folder: 'skills',
      });

      // ASSERT
      expect(mockMinioClient.putObject).toHaveBeenCalledTimes(1);
      const [calledBucket, calledObjectName, calledBuffer, calledSize, calledMeta] =
        mockMinioClient.putObject.mock.calls[0];

      expect(calledBucket).toBe(bucketName);
      expect(calledObjectName).toMatch(/^skills\/[0-9a-f-]{36}\.png$/);
      expect(calledBuffer).toBe(buffer);
      expect(calledSize).toBe(buffer.length);
      expect(calledMeta).toEqual({ 'Content-Type': 'image/png' });

      expect(result).toBe(`${publicBaseUrl}/${bucketName}/${calledObjectName}`);
    });

    it('nama file hasil generate unik dan pakai ekstensi asli', async () => {
      // ARRANGE
      const mockMinioClient = { putObject: jest.fn().mockResolvedValue({}) };
      const storage = new MinioFileStorage(mockMinioClient, bucketName, publicBaseUrl);

      // ACT — upload 2 kali dengan filename asli yang sama
      await storage.upload({ buffer: Buffer.from('a'), filename: 'logo.png', mimeType: 'image/png', folder: 'skills' });
      await storage.upload({ buffer: Buffer.from('b'), filename: 'logo.png', mimeType: 'image/png', folder: 'skills' });

      // ASSERT
      const firstObjectName = mockMinioClient.putObject.mock.calls[0][1];
      const secondObjectName = mockMinioClient.putObject.mock.calls[1][1];

      expect(firstObjectName).not.toBe(secondObjectName); // beda walau filename asli sama
      expect(firstObjectName).not.toContain('logo'); // nama asli user tidak dipakai
      expect(firstObjectName.endsWith('.png')).toBe(true); // ekstensi tetap dipertahankan
    });

    it('meneruskan error kalau putObject gagal', async () => {
      // ARRANGE
      const mockMinioClient = {
        putObject: jest.fn().mockRejectedValue(new Error('MinIO connection error')),
      };
      const storage = new MinioFileStorage(mockMinioClient, bucketName, publicBaseUrl);

      // ACT
      const result = storage.upload({
        buffer: Buffer.from('x'),
        filename: 'logo.png',
        mimeType: 'image/png',
        folder: 'skills',
      });

      // ASSERT
      await expect(result).rejects.toThrow('MinIO connection error');
    });
  });

  describe('delete', () => {
    it('menghapus object dengan nama yang benar, di-parse dari URL', async () => {
      // ARRANGE
      const mockMinioClient = {
        removeObject: jest.fn().mockResolvedValue(undefined),
      };
      const storage = new MinioFileStorage(mockMinioClient, bucketName, publicBaseUrl);
      const fileUrl = `${publicBaseUrl}/${bucketName}/skills/abc-123-uuid.jpg`;

      // ACT
      await storage.delete(fileUrl);

      // ASSERT
      expect(mockMinioClient.removeObject).toHaveBeenCalledWith(
        bucketName,
        'skills/abc-123-uuid.jpg'
      );
    });

    it('meneruskan error kalau removeObject gagal', async () => {
      // ARRANGE
      const mockMinioClient = {
        removeObject: jest.fn().mockRejectedValue(new Error('MinIO connection error')),
      };
      const storage = new MinioFileStorage(mockMinioClient, bucketName, publicBaseUrl);
      const fileUrl = `${publicBaseUrl}/${bucketName}/skills/abc-123-uuid.jpg`;

      // ACT
      const result = storage.delete(fileUrl);

      // ASSERT
      await expect(result).rejects.toThrow('MinIO connection error');
    });
  });
});