const Entity = require('./Entity');

class User extends Entity {
  constructor({ email, password, ...attrs }) {
    super(attrs); // Melempar data ke constructor kelas induk (Entity)

    if (!email) throw new Error('User: email wajib diisi');
    if (!password) throw new Error('User: password wajib diisi');

    this.email = email;
    this.password = password;
  }
}

module.exports = User;