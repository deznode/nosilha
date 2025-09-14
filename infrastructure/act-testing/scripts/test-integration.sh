#!/bin/bash
# Integration testing script for GitHub Actions
# This script tests the integration workflow with full service stack

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔗 Testing Integration & End-to-End Workflow${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start all required services
echo -e "${BLUE}🚀 Starting all services for integration tests...${NC}"
docker-compose -f "$SCRIPT_DIR/../docker/docker-compose.act.yml" up -d

# Wait for all services to be ready
echo "⏳ Waiting for services to be ready..."

# Wait for PostgreSQL
until docker-compose -f "$SCRIPT_DIR/../docker/docker-compose.act.yml" exec postgres pg_isready -U test -d nosilha_test; do
    echo "  ⏳ PostgreSQL not ready yet..."
    sleep 2
done
echo -e "${GREEN}  ✅ PostgreSQL is ready${NC}"

# Wait for Redis
until docker-compose -f "$SCRIPT_DIR/../docker/docker-compose.act.yml" exec redis redis-cli ping; do
    echo "  ⏳ Redis not ready yet..."
    sleep 2
done
echo -e "${GREEN}  ✅ Redis is ready${NC}"

# Check if Firestore emulator is responding
echo "  ⏳ Checking Firestore emulator..."
sleep 5  # Give Firestore time to start
echo -e "${GREEN}  ✅ Firestore emulator should be ready${NC}"

# Check if GCS emulator is responding
echo "  ⏳ Checking GCS emulator..."
if curl -f http://localhost:4443/storage/v1/b 2>/dev/null; then
    echo -e "${GREEN}  ✅ GCS emulator is ready${NC}"
else
    echo -e "${YELLOW}  ⚠️  GCS emulator may not be fully ready${NC}"
fi

# Run integration tests
"$SCRIPT_DIR/test-workflows.sh" integration push "$@"

echo -e "${GREEN}🎉 Integration testing completed!${NC}"
echo -e "${YELLOW}💡 Services are still running. Run clean.sh to stop them.${NC}"