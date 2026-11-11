// Menghapus objek storage secara best-effort: kegagalan hanya dicatat (file yatim tidak terlihat
// pengguna dan tidak boleh menggagalkan operasi utama).
const removeObjectsQuietly = async (fileStorage, logger, keys, context) => {
  for (const key of keys) {
    try {
      await fileStorage.deleteObject(key);
    } catch (error) {
      logger.warn({ err: error, key, ...context }, 'Gagal menghapus objek media dari storage');
    }
  }
};

module.exports = removeObjectsQuietly;
