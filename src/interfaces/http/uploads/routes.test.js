jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');
const UnsupportedMediaTypeError = require('../../../exceptions/UnsupportedMediaTypeError');
const ConflictError = require('../../../exceptions/ConflictError');

describe('HTTP routes /api/v1/admin/uploads', () => {
  let server;
  const boundary = 'batas-upload';
  const multipart = ({ field = 'file', type = 'image/png', content = 'isi-file' } = {}) =>
    Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${field}"; filename="x.png"\r\nContent-Type: ${type}\r\n\r\n`
      ),
      Buffer.isBuffer(content) ? content : Buffer.from(content),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
  const upload = (query, payload, headers = authHeader()) =>
    server.inject({
      method: 'POST',
      url: `/api/v1/admin/uploads${query}`,
      headers: { ...headers, 'content-type': `multipart/form-data; boundary=${boundary}` },
      payload,
    });
  const media = {
    id: 3,
    kind: 'skill_logo',
    objectKey: 'skill_logo/u-256.webp',
    mime: 'image/webp',
    width: 512,
    height: 512,
    variants: { 128: 'skill_logo/u-128.webp', 256: 'skill_logo/u-256.webp' },
  };

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('meneruskan isi file mentah + kind ke use-case dan mengembalikan 201 berisi URL', async () => {
    container.uploadMedia.execute.mockResolvedValue(media);
    const response = await upload('?kind=skill_logo', multipart({ content: 'byte-gambar' }));
    expect(response.statusCode).toBe(201);
    expect(container.uploadMedia.execute).toHaveBeenCalledWith({
      kind: 'skill_logo',
      buffer: Buffer.from('byte-gambar'),
    });
    expect(response.result.data).toEqual(
      expect.objectContaining({
        id: 3,
        kind: 'skill_logo',
        url: 'https://cdn.test/skill_logo/u-256.webp',
      })
    );
  });

  it('header Content-Type dari klien tidak menentukan apa pun (diperiksa dari isi oleh processor)', async () => {
    container.uploadMedia.execute.mockRejectedValue(
      new UnsupportedMediaTypeError('Use PNG, JPG or WebP.')
    );
    const response = await upload(
      '?kind=project_image',
      multipart({ type: 'image/png', content: '<html>' })
    );
    expect(response.statusCode).toBe(415);
    expect(response.result.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it.each([
    ['tanpa kind', ''],
    ['kind tidak dikenal', '?kind=avatar'],
  ])('menolak %s', async (_label, query) => {
    const response = await upload(query, multipart());
    expect(response.statusCode).toBe(400);
    expect(container.uploadMedia.execute).not.toHaveBeenCalled();
  });

  it('menolak multipart tanpa field file', async () => {
    const response = await upload('?kind=skill_logo', multipart({ field: 'logo' }));
    expect(response.statusCode).toBe(400);
    expect(response.result.error.details).toEqual([{ field: 'file', message: 'file is required' }]);
  });

  it('menolak file di atas 2 MB sebelum sampai use-case', async () => {
    const response = await upload(
      '?kind=skill_logo',
      multipart({ content: Buffer.alloc(2 * 1024 * 1024 + 1) })
    );
    expect(response.statusCode).toBe(413);
    expect(container.uploadMedia.execute).not.toHaveBeenCalled();
  });

  it('butuh token admin', async () => {
    const response = await upload('?kind=skill_logo', multipart(), {});
    expect(response.statusCode).toBe(401);
  });

  it('DELETE → 204; 409 bila media masih dipakai', async () => {
    container.deleteMedia.execute.mockResolvedValueOnce(undefined);
    let response = await server.inject({
      method: 'DELETE',
      url: '/api/v1/admin/uploads/3',
      headers: authHeader(),
    });
    expect(response.statusCode).toBe(204);

    container.deleteMedia.execute.mockRejectedValueOnce(
      new ConflictError('This image is still used.')
    );
    response = await server.inject({
      method: 'DELETE',
      url: '/api/v1/admin/uploads/3',
      headers: authHeader(),
    });
    expect(response.statusCode).toBe(409);
  });
});
