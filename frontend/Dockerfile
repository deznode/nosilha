# This Dockerfile creates a production-ready container for the Next.js app.
# It uses a multi-stage build for a small, secure, and optimized final image.

# --- Stage 1: Dependency Installation ---
# This stage is dedicated to installing npm dependencies. Caching this layer
# speeds up builds when only source code changes.
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package manager files and install dependencies
COPY package*.json ./
RUN npm ci

# --- Stage 2: Builder ---
# This stage builds the Next.js application using the installed dependencies.
FROM node:20-alpine AS builder
WORKDIR /app

# Define build arguments for environment variables
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set environment variables from build arguments
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=$NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Copy dependencies from the previous stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files
COPY . .

# Build the Next.js application for production.
# This generates the `.next` directory with standalone output.
RUN npm run build

# --- Stage 3: Production Runner ---
# This stage creates the final, minimal image by copying only the necessary
# production artifacts from the builder stage.
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production
# Optionally, disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security purposes
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy the standalone Next.js server output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy the public assets folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy the optimized static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Expose the port the app will run on. Cloud Run will provide the PORT env var.
EXPOSE 3000

# The command to start the standalone Next.js server.
# It will automatically listen on the port specified by the PORT env var.
CMD ["node", "server.js"]
