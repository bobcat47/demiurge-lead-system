FROM node:20-alpine AS base

# Install Playwright dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Set environment variables for Playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/worker/package*.json ./apps/worker/
COPY packages/core/package*.json ./packages/core/
COPY packages/database/package*.json ./packages/database/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/worker ./apps/worker
COPY packages ./packages
COPY tsconfig.json ./

# Build packages
RUN npm run build --workspace=@demiurge/database
RUN npm run build --workspace=@demiurge/core
RUN npm run build --workspace=@demiurge/worker

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

WORKDIR /app

COPY --from=base /app .

CMD ["node", "apps/worker/dist/index.js"]
