#!/bin/bash
# Backend-specific GitHub Actions testing script
# This script focuses on testing the backend CI/CD workflow

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏗️  Testing Backend CI/CD Workflow${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start PostgreSQL for backend tests
echo -e "${BLUE}🐘 Starting PostgreSQL for backend tests...${NC}"
docker-compose -f "$SCRIPT_DIR/../docker/docker-compose.act.yml" up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose -f "$SCRIPT_DIR/../docker/docker-compose.act.yml" exec postgres pg_isready -U test -d nosilha_test; do
    sleep 2
done
echo -e "${GREEN}✅ PostgreSQL is ready${NC}"

# Run backend tests
"$SCRIPT_DIR/test-workflows.sh" backend push --services "$@"

echo -e "${GREEN}🎉 Backend testing completed!${NC}"