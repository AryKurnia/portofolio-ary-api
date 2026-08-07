class Repository {
  _notImplemented(method) {
    throw new Error(`${this.constructor.name}.${method} belum diimplementasikan`);
  }
}

module.exports = Repository;
