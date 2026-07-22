FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-templates/default.conf.template /etc/nginx/templates/default.conf.template
# nginx's entrypoint runs envsubst over templates/*.template into conf.d/*.conf at
# container start — same image works locally (BACKEND_HOST=backend) and on Railway
# (BACKEND_HOST=<service>.railway.internal) with no rebuild, just different env vars.
ENV BACKEND_HOST=backend
ENV BACKEND_PORT=4000
ENV PORT=80
EXPOSE 80
