# ── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY frontend/package*.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY frontend/ .
RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────────────────────────────
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user for nginx worker processes
RUN addgroup -S nginx-app && adduser -S nginx-app -G nginx-app && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown nginx-app:nginx-app /var/run/nginx.pid

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
