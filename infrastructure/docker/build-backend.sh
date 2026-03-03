#!/usr/bin/env bash
# Build the backend Docker image for local development
# Usage: ./build-backend.sh
#
# After building, start with: docker-compose --profile backend up

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Building backend Docker image..."
cd "$PROJECT_ROOT/apps/api"

./gradlew bootBuildImage --imageName=nosilha-backend:local

echo ""
echo "✓ Backend image built successfully: nosilha-backend:local"
echo ""
echo "To start the backend service:"
echo "  cd $SCRIPT_DIR && docker-compose --profile backend up"
