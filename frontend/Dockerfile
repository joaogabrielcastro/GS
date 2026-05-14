# Build context: pasta frontend (Coolify: Dockerfile = frontend/Dockerfile, context = frontend)
# Build args: VITE_API_URL, VITE_SOCKET_URL (URLs públicas da API)
# Runtime: defina PORT igual à porta interna no Coolify (ex. 80 ou 3000), ou deixe vazio → 80
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
RUN npm run build

FROM nginx:1.27-alpine AS runner
ENV PORT=80
COPY docker-entrypoint.d/19-default-port.sh /docker-entrypoint.d/19-default-port.sh
RUN chmod +x /docker-entrypoint.d/19-default-port.sh
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
