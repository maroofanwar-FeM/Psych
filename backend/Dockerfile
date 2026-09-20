FROM node:20-slim

# Prisma's migrate/schema engines shell out to `openssl` to detect the
# installed OpenSSL version and pick a matching engine binary. Without it,
# Prisma guesses wrong (defaults to openssl-1.1.x, which isn't on this
# Debian image — 3.0.x is), downloads/uses the wrong binary, and it fails
# to start with an empty "Schema engine error" on every migrate deploy.
RUN apt-get update && apt-get install -y openssl --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN mkdir -p data

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
