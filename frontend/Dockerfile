FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Railway (and docker-compose, via --build-arg) passes this in as a build arg —
# it's baked into the static JS bundle since frontend and backend are separate hosts.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-templates/default.conf.template /etc/nginx/templates/default.conf.template
# nginx's entrypoint runs envsubst over templates/*.template into conf.d/*.conf at
# container start, substituting $PORT so the same image adapts to whatever port
# the host (e.g. Railway) assigns, with no rebuild needed.
ENV PORT=80
EXPOSE 80
