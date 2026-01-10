# syntax=docker/dockerfile:1
# This Dockerfile creates a production-ready container for the Next.js app with pnpm.
# It uses a multi-stage build for a small, secure, and optimized final image.
# NOTE: Build context must be the repository root (not apps/web).

# --- Stage 1: Base - Install pnpm ---
FROM node:20-alpine AS base
WORKDIR /app

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack to use pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# --- Stage 2: Dependencies - Production dependencies ---
# This stage is dedicated to installing production dependencies with BuildKit cache mount.
FROM base AS deps

# Copy workspace configuration files from repo root
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for the web app
COPY apps/web/package.json apps/web/.npmrc* ./apps/web/

# Install production dependencies with BuildKit cache mount
# Using --filter to only install deps for the web app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --filter=frontend

# --- Stage 3: Build - Install all deps and build application ---
FROM base AS builder

# Define build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID

# Set environment variables from build arguments
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=$NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_CLARITY_PROJECT_ID=$NEXT_PUBLIC_CLARITY_PROJECT_ID

# Copy workspace configuration files from repo root
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for the web app
COPY apps/web/package.json apps/web/.npmrc* ./apps/web/

# Install all dependencies (including devDependencies) with cache mount
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter=frontend

# Copy source files for the web app
COPY apps/web ./apps/web

# Build the Next.js application for production.
# This generates the `.next` directory with standalone output.
WORKDIR /app/apps/web
RUN pnpm build

# --- Stage 4: Production Runner ---
# This stage creates the final, minimal image by copying only the necessary
# production artifacts from the builder stage.
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production
# Optionally, disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security purposes
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy the entire standalone output preserving monorepo structure
# This is required because pnpm uses symlinks in node_modules that reference
# relative paths (../../../node_modules/.pnpm/...) which must be preserved
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Copy the public assets folder to the app directory
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy the optimized static assets to the app directory
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Set working directory to the app location within monorepo structure
WORKDIR /app/apps/web

# Switch to the non-root user
USER nextjs

# Expose the port the app will run on. Cloud Run will provide the PORT env var.
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# The command to start the standalone Next.js server.
# It will automatically listen on the port specified by the PORT env var.
CMD ["node", "server.js"]
