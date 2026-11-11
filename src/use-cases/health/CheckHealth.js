class CheckHealth {
  constructor({ pingDatabase }) {
    this._pingDatabase = pingDatabase;
  }

  async execute() {
    try {
      await this._pingDatabase();
      return { status: 'ok', database: 'ok' };
    } catch {
      // Detail error sengaja tidak dikembalikan: endpoint ini publik.
      return { status: 'error', database: 'unreachable' };
    }
  }
}

module.exports = CheckHealth;
