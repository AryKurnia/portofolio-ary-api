# Image production API portofolio.
# Build:  docker build -t portofolio-ary-api .
# Detail deploy: docs/DEPLOY.md

# Versi Node sama dengan .nvmrc. Debian slim (glibc) agar prebuilt sharp & bcrypt langsung jalan.
ARG NODE_VERSION=26.13.0

# --- Tahap 1: dependensi production saja -------------------------------------------------------
FROM node:${NODE_VERSION}-trixie-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# --- Tahap 2: runtime ----------------------------------------------------------------------------
FROM node:${NODE_VERSION}-trixie-slim AS runtime
ENV NODE_ENV=production \
    SERVER_HOST=0.0.0.0 \
    SERVER_PORT=3000
WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node config ./config
COPY --chown=node:node migrations ./migrations
COPY --chown=node:node seeders ./seeders
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node src ./src

# Jangan jalankan sebagai root.
USER node
EXPOSE 3000

# Image slim tidak punya curl, jadi healthcheck memakai fetch bawaan Node.
# /health membalas 503 bila DB/storage tidak terjangkau → container ditandai unhealthy.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.SERVER_PORT||3000)+'/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

# Node langsung (bukan `npm start`) agar SIGTERM sampai ke proses dan shutdown rapi (src/index.js).
CMD ["node", "src/index.js"]
