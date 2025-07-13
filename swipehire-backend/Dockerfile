# Multi-stage build for security and efficiency
FROM node:18-slim AS builder
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm install --only=production

# Copy app source
COPY . .

# Final lightweight production image
FROM node:18-slim
WORKDIR /usr/src/app

# Copy built node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/ .

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_PUBLIC_BASE_URL=https://swipehire.top
ENV NEXT_PUBLIC_DOMAIN=swipehire.top
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBO=1
ENV DB_SSL=true

# Sensitive variables should be injected at runtime
# via Cloud Run/App Engine environment variables or Secret Manager
# (These are just examples - use your actual production values)
ARG DATABASE_URL
ARG GOOGLE_API_KEY
ARG GEMINI_API_KEY 
ARG MISTRAL_API_KEY
ARG SESSION_SECRET
ARG CSRF_SECRET
ARG SMTP_PASSWORD

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["node", "index.js"]
