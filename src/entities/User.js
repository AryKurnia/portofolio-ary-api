const Entity = require('./Entity');

class User extends Entity {
  constructor({ username, email, password, ...attrs }) {
    super(attrs); // Melempar data ke constructor kelas induk (Entity)

    if (!username) throw new Error('User: username wajib diisi');
    if (!password) throw new Error('User: password wajib diisi');

    this.username = username;
    this.email = email;
    this.password = password; // berisi hash, bukan password asli
  }
}

module.exports = User;
