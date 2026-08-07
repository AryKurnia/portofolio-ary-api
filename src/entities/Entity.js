class Entity {
  constructor(attrs) {
    if (attrs) {
      Object.assign(this, attrs); // Semua atribut otomatis terpasang ke dalam objek
    }
  }
}

module.exports = Entity;