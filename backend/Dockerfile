FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN mkdir -p data

EXPOSE 4000

# Neon's DB suspends when idle and takes a moment to wake on the first
# connection — migrate deploy hits DIRECT_URL (unpooled), which has no
# retry buffer, so a cold start can fail outright and (via &&) kill the
# whole container before node ever starts. Retry a few times before
# giving up so a cold start doesn't take the deploy down with it.
CMD ["sh", "-c", "n=0; until npx prisma migrate deploy; do n=$((n+1)); if [ $n -ge 5 ]; then echo 'prisma migrate deploy failed after 5 attempts'; exit 1; fi; echo \"migrate deploy failed (attempt $n/5), retrying in 5s...\"; sleep 5; done; node src/index.js"]
