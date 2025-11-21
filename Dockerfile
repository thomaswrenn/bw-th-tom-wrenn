# Base image for building and running the app
FROM oven/bun:1 AS base

WORKDIR /usr/src/app

# Install deps (shared between build and dev/prod)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Development stage (hot-reload & tests)
FROM base AS development

# Copy the entire project (configs, source, tests, etc.)
COPY . .

CMD ["bun", "src/server.ts"]