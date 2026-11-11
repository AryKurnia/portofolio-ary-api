const UploadMedia = require('./UploadMedia');
const DeleteMedia = require('./DeleteMedia');
const CleanupOrphanMedia = require('./CleanupOrphanMedia');
const Media = require('../../entities/Media');
const NotFoundError = require('../../exceptions/NotFoundError');
const ConflictError = require('../../exceptions/ConflictError');
const UnsupportedMediaTypeError = require('../../exceptions/UnsupportedMediaTypeError');

const processed = {
  mime: 'image/webp',
  width: 1600,
  height: 900,
  variants: [
    { name: '400', buffer: Buffer.from('a'), contentType: 'image/webp', extension: 'webp' },
    { name: '800', buffer: Buffer.from('bb'), contentType: 'image/webp', extension: 'webp' },
  ],
};

const createDeps = () => ({
  mediaRepository: {
    create: jest.fn().mockImplementation(async (m) => ({ ...m, id: 1 })),
    findById: jest.fn(),
    isReferenced: jest.fn().mockResolvedValue(false),
    delete: jest.fn().mockResolvedValue(undefined),
    findOrphans: jest.fn().mockResolvedValue([]),
  },
  fileStorage: {
    putObject: jest.fn().mockResolvedValue(undefined),
    deleteObject: jest.fn().mockResolvedValue(undefined),
  },
  imageProcessor: { process: jest.fn().mockResolvedValue(processed) },
  logger: { warn: jest.fn() },
  generateId: () => 'uuid-1',
});

describe('UploadMedia use-case', () => {
  it('mengunggah setiap varian dengan key unik + Cache-Control immutable, lalu menyimpan media', async () => {
    // ARRANGE
    const deps = createDeps();

    // ACT
    const result = await new UploadMedia(deps).execute({
      kind: 'project_image',
      buffer: Buffer.from('img'),
    });

    // ASSERT
    expect(deps.imageProcessor.process).toHaveBeenCalledWith({
      kind: 'project_image',
      buffer: Buffer.from('img'),
    });
    expect(deps.fileStorage.putObject.mock.calls.map(([arg]) => arg.key)).toEqual([
      'project_image/uuid-1-400.webp',
      'project_image/uuid-1-800.webp',
    ]);
    expect(deps.fileStorage.putObject).toHaveBeenCalledWith(
      expect.objectContaining({
        cacheControl: 'public, max-age=31536000, immutable',
        contentType: 'image/webp',
      })
    );
    expect(deps.mediaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'project_image',
        objectKey: 'project_image/uuid-1-800.webp',
        sizeBytes: 2,
        width: 1600,
        variants: { 400: 'project_image/uuid-1-400.webp', 800: 'project_image/uuid-1-800.webp' },
      })
    );
    expect(result.id).toBe(1);
  });

  it('SVG (varian original) disimpan tanpa akhiran ukuran', async () => {
    const deps = createDeps();
    deps.imageProcessor.process.mockResolvedValue({
      mime: 'image/svg+xml',
      width: 64,
      height: 32,
      variants: [
        {
          name: 'original',
          buffer: Buffer.from('<svg/>'),
          contentType: 'image/svg+xml',
          extension: 'svg',
        },
      ],
    });
    await new UploadMedia({ ...deps, keyPrefix: 'it-test/' }).execute({
      kind: 'skill_logo',
      buffer: Buffer.from('x'),
    });
    expect(deps.fileStorage.putObject).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'it-test/skill_logo/uuid-1.svg' })
    );
  });

  it('tidak mengunggah apa pun bila file ditolak processor', async () => {
    const deps = createDeps();
    deps.imageProcessor.process.mockRejectedValue(new UnsupportedMediaTypeError('Use PNG.'));
    await expect(
      new UploadMedia(deps).execute({ kind: 'project_image', buffer: Buffer.from('x') })
    ).rejects.toThrow(UnsupportedMediaTypeError);
    expect(deps.fileStorage.putObject).not.toHaveBeenCalled();
    expect(deps.mediaRepository.create).not.toHaveBeenCalled();
  });

  it('menghapus varian yang sudah terunggah bila upload varian berikutnya gagal', async () => {
    const deps = createDeps();
    deps.fileStorage.putObject
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('MinIO error'));
    await expect(
      new UploadMedia(deps).execute({ kind: 'project_image', buffer: Buffer.from('x') })
    ).rejects.toThrow('MinIO error');
    expect(deps.fileStorage.deleteObject).toHaveBeenCalledWith('project_image/uuid-1-400.webp');
    expect(deps.mediaRepository.create).not.toHaveBeenCalled();
  });

  it('menghapus semua objek bila penyimpanan ke database gagal', async () => {
    const deps = createDeps();
    deps.mediaRepository.create.mockRejectedValue(new Error('DB error'));
    await expect(
      new UploadMedia(deps).execute({ kind: 'project_image', buffer: Buffer.from('x') })
    ).rejects.toThrow('DB error');
    expect(deps.fileStorage.deleteObject).toHaveBeenCalledTimes(2);
  });

  it('tetap melempar error asli walau pembersihan objek juga gagal (dicatat di log)', async () => {
    const deps = createDeps();
    deps.mediaRepository.create.mockRejectedValue(new Error('DB error'));
    deps.fileStorage.deleteObject.mockRejectedValue(new Error('MinIO down'));
    await expect(
      new UploadMedia(deps).execute({ kind: 'project_image', buffer: Buffer.from('x') })
    ).rejects.toThrow('DB error');
    expect(deps.logger.warn).toHaveBeenCalledTimes(2);
  });
});

describe('DeleteMedia use-case', () => {
  const media = new Media({
    id: 1,
    kind: 'project_image',
    objectKey: 'k-800',
    variants: { 400: 'k-400', 800: 'k-800' },
  });

  it('menghapus data lalu semua objek (tanpa duplikat key)', async () => {
    const deps = createDeps();
    deps.mediaRepository.findById.mockResolvedValue(media);
    await new DeleteMedia(deps).execute(1);
    expect(deps.mediaRepository.delete).toHaveBeenCalledWith(1);
    expect(deps.fileStorage.deleteObject.mock.calls.map(([key]) => key).sort()).toEqual([
      'k-400',
      'k-800',
    ]);
  });

  it('melempar ConflictError dan tidak menghapus apa pun bila media masih dipakai', async () => {
    const deps = createDeps();
    deps.mediaRepository.findById.mockResolvedValue(media);
    deps.mediaRepository.isReferenced.mockResolvedValue(true);
    await expect(new DeleteMedia(deps).execute(1)).rejects.toThrow(ConflictError);
    expect(deps.mediaRepository.delete).not.toHaveBeenCalled();
    expect(deps.fileStorage.deleteObject).not.toHaveBeenCalled();
  });

  it('melempar NotFoundError bila media tidak ada', async () => {
    const deps = createDeps();
    deps.mediaRepository.findById.mockResolvedValue(null);
    await expect(new DeleteMedia(deps).execute(9)).rejects.toThrow(NotFoundError);
    expect(deps.mediaRepository.isReferenced).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau mediaRepository.delete gagal, tanpa menghapus file', async () => {
    const deps = createDeps();
    deps.mediaRepository.findById.mockResolvedValue(media);
    deps.mediaRepository.delete.mockRejectedValue(new Error('DB error'));
    await expect(new DeleteMedia(deps).execute(1)).rejects.toThrow('DB error');
    expect(deps.fileStorage.deleteObject).not.toHaveBeenCalled();
  });
});

describe('CleanupOrphanMedia use-case', () => {
  const now = () => new Date('2026-11-11T12:00:00Z');

  it('mencari media yatim lebih tua dari 24 jam secara default dan menghapusnya', async () => {
    const deps = createDeps();
    deps.mediaRepository.findOrphans.mockResolvedValue([
      new Media({ id: 1, objectKey: 'a', variants: {} }),
      new Media({ id: 2, objectKey: 'b', variants: {} }),
    ]);

    const result = await new CleanupOrphanMedia({ ...deps, now }).execute();

    expect(deps.mediaRepository.findOrphans).toHaveBeenCalledWith(new Date('2026-11-10T12:00:00Z'));
    expect(deps.mediaRepository.delete.mock.calls).toEqual([[1], [2]]);
    expect(deps.fileStorage.deleteObject.mock.calls).toEqual([['a'], ['b']]);
    expect(result).toEqual({ deleted: 2 });
  });

  it('memakai batas umur custom', async () => {
    const deps = createDeps();
    await new CleanupOrphanMedia({ ...deps, now }).execute({ minAgeHours: 1 });
    expect(deps.mediaRepository.findOrphans).toHaveBeenCalledWith(new Date('2026-11-11T11:00:00Z'));
  });

  it('meneruskan error kalau findOrphans gagal', async () => {
    const deps = createDeps();
    deps.mediaRepository.findOrphans.mockRejectedValue(new Error('DB error'));
    await expect(new CleanupOrphanMedia({ ...deps, now }).execute()).rejects.toThrow('DB error');
  });
});
