# portofolio-ary-api
Merupakan rancangan main API untuk Portofolio Ary

Dibutuhkan
- Node.js 26 LTS (versi dikunci di `.nvmrc`)
- maria db
- MiniO

Node.js (dengan nvm)
```cli
nvm install   # membaca .nvmrc
nvm use
npm ci
```

Cara install
Database
```cli
npx sequelize-cli db:migrate

// untuk membuat user admin default
npx sequelize-cli db:seed:all
```

File storage
