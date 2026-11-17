const ListCertificates = require('./ListCertificates');
const CreateCertificate = require('./CreateCertificate');
const UpdateCertificate = require('./UpdateCertificate');
const DeleteCertificate = require('./DeleteCertificate');
const ReorderCertificates = require('./ReorderCertificates');
const ListPublishedCertificates = require('../public/ListPublishedCertificates');
const Certificate = require('../../entities/Certificate');
const NotFoundError = require('../../exceptions/NotFoundError');
const ValidationError = require('../../exceptions/ValidationError');

const existing = new Certificate({
  id: 1,
  name: 'AWS Cloud Practitioner',
  issuer: 'Amazon',
  issuedAt: '2025-03',
  credentialUrl: 'https://verify.example/1',
  isPublished: true,
  sortOrder: 2,
});

const createDeps = ({
  certificate = existing,
  all = [existing],
  media = { id: 4, kind: 'certificate_file' },
} = {}) => ({
  certificateRepository: {
    findAll: jest.fn().mockResolvedValue(all),
    findById: jest.fn().mockResolvedValue(certificate),
    create: jest.fn().mockImplementation(async (c) => ({ ...c, id: 9 })),
    update: jest.fn().mockImplementation(async (id, c) => ({ ...c, id })),
    delete: jest.fn().mockResolvedValue(undefined),
    reorder: jest.fn().mockResolvedValue(undefined),
  },
  mediaRepository: { findById: jest.fn().mockResolvedValue(media) },
});
const fieldsOf = (promise) => promise.catch((error) => error.details);

describe('ListCertificates / ListPublishedCertificates use-case', () => {
  it('admin melihat semua, publik hanya yang terbit', async () => {
    const deps = createDeps();
    await new ListCertificates(deps).execute();
    expect(deps.certificateRepository.findAll).toHaveBeenLastCalledWith();
    await new ListPublishedCertificates(deps).execute();
    expect(deps.certificateRepository.findAll).toHaveBeenLastCalledWith({ publishedOnly: true });
  });
});

describe('CreateCertificate use-case', () => {
  const input = { name: 'CKA', issuer: 'CNCF', issuedAt: '2025-01' };

  it('membuat draf di urutan paling akhir', async () => {
    const deps = createDeps();
    await new CreateCertificate(deps).execute(input);
    expect(deps.certificateRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'CKA', isPublished: false, sortOrder: 3 })
    );
    expect(deps.mediaRepository.findById).not.toHaveBeenCalled();
  });

  it('sertifikat pertama mendapat sort_order 1', async () => {
    const deps = createDeps({ all: [] });
    await new CreateCertificate(deps).execute(input);
    expect(deps.certificateRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ sortOrder: 1 })
    );
  });

  it('terbit dengan file certificate_file diterima', async () => {
    const deps = createDeps();
    await new CreateCertificate(deps).execute({ ...input, fileMediaId: 4, isPublished: true });
    expect(deps.mediaRepository.findById).toHaveBeenCalledWith(4);
    expect(deps.certificateRepository.create).toHaveBeenCalled();
  });

  it.each([
    ['tidak ada', null],
    ['berjenis lain', { id: 4, kind: 'project_image' }],
  ])('menolak file_id yang %s', async (_label, media) => {
    const deps = createDeps({ media });
    await expect(
      fieldsOf(new CreateCertificate(deps).execute({ ...input, fileMediaId: 4 }))
    ).resolves.toEqual([{ field: 'file_id', message: 'Invalid file.' }]);
    expect(deps.certificateRepository.create).not.toHaveBeenCalled();
  });

  it('mengumpulkan semua pelanggaran sekaligus', async () => {
    const deps = createDeps();
    const details = await fieldsOf(
      new CreateCertificate(deps).execute({ ...input, expiresAt: '2024-12', isPublished: true })
    );
    expect(details.map((d) => d.field)).toEqual(['expires_at', 'file_id']);
  });

  it('meneruskan error kalau create gagal', async () => {
    const deps = createDeps();
    deps.certificateRepository.create.mockRejectedValue(new Error('DB error'));
    await expect(new CreateCertificate(deps).execute(input)).rejects.toThrow('DB error');
  });
});

describe('UpdateCertificate use-case', () => {
  it('hanya mengubah field yang dikirim; sort_order tetap', async () => {
    const deps = createDeps();
    await new UpdateCertificate(deps).execute(1, { name: 'AWS CCP', sortOrder: 99 });
    expect(deps.certificateRepository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        name: 'AWS CCP',
        issuer: 'Amazon',
        credentialUrl: 'https://verify.example/1',
        sortOrder: 2,
      })
    );
  });

  it('menghapus credential URL pada sertifikat terbit tanpa file ditolak', async () => {
    const deps = createDeps();
    await expect(
      fieldsOf(new UpdateCertificate(deps).execute(1, { credentialUrl: null }))
    ).resolves.toEqual([
      { field: 'file_id', message: 'Add a file or a credential URL to publish.' },
    ]);
    expect(deps.certificateRepository.update).not.toHaveBeenCalled();
  });

  it('expires_at null berarti tidak kedaluwarsa', async () => {
    const deps = createDeps({
      certificate: new Certificate({ ...existing, expiresAt: '2028-03' }),
    });
    await new UpdateCertificate(deps).execute(1, { expiresAt: null });
    expect(deps.certificateRepository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ expiresAt: null })
    );
  });

  it('melempar NotFoundError kalau sertifikat tidak ada', async () => {
    const deps = createDeps({ certificate: null });
    await expect(new UpdateCertificate(deps).execute(9, { name: 'x' })).rejects.toThrow(
      NotFoundError
    );
  });
});

describe('DeleteCertificate use-case', () => {
  it('menghapus sertifikat yang ada', async () => {
    const deps = createDeps();
    await new DeleteCertificate(deps).execute(1);
    expect(deps.certificateRepository.delete).toHaveBeenCalledWith(1);
  });

  it('melempar NotFoundError dan tidak menghapus kalau tidak ada', async () => {
    const deps = createDeps({ certificate: null });
    await expect(new DeleteCertificate(deps).execute(9)).rejects.toThrow(NotFoundError);
    expect(deps.certificateRepository.delete).not.toHaveBeenCalled();
  });
});

describe('ReorderCertificates use-case', () => {
  const all = [1, 2, 3].map((id) => new Certificate({ ...existing, id }));

  it('menyimpan urutan bila ids memuat semua sertifikat', async () => {
    const deps = createDeps({ all });
    await new ReorderCertificates(deps).execute([3, 1, 2]);
    expect(deps.certificateRepository.reorder).toHaveBeenCalledWith([3, 1, 2]);
  });

  it('menolak ids yang tidak lengkap', async () => {
    const deps = createDeps({ all });
    await expect(new ReorderCertificates(deps).execute([3, 1])).rejects.toThrow(ValidationError);
    expect(deps.certificateRepository.reorder).not.toHaveBeenCalled();
  });
});
