FROM node:20-alpine AS base

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace package files
COPY apps/web/package*.json ./apps/web/
COPY packages/core/package*.json ./packages/core/
COPY packages/database/package*.json ./packages/database/

# Install dependencies (including workspaces)
RUN npm install

# Copy packages source first (needed for build)
COPY packages/core ./packages/core
COPY packages/database ./packages/database

# Build packages first
WORKDIR /app/packages/database
RUN npm run build

WORKDIR /app/packages/core
RUN npm run build

# Remove src folders to force using dist
RUN rm -rf /app/packages/database/src /app/packages/core/src

# Copy web app source
WORKDIR /app
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
COPY apps/web/next.config.js ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/tailwind.config.js ./apps/web/
COPY apps/web/postcss.config.js ./apps/web/

# Build the web app
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Copy built files
COPY --from=base /app/apps/web/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/web/package*.json ./
COPY --from=base /app/apps/web/public ./public

EXPOSE 3000

CMD ["npm", "start"]
