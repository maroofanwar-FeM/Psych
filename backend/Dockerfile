FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN mkdir -p data

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
