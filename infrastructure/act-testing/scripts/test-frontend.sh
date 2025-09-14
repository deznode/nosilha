#!/bin/bash
# Frontend-specific GitHub Actions testing script
# This script focuses on testing the frontend CI/CD workflow

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}⚛️  Testing Frontend CI/CD Workflow${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend tests don't require services by default
# but we can start them if needed for integration scenarios
if [[ "$1" == "--with-services" ]]; then
    echo -e "${BLUE}🔧 Starting services for frontend integration tests...${NC}"
    docker-compose -f "$SCRIPT_DIR/../docker/docker-compose.act.yml" up -d
    shift  # Remove --with-services from arguments
fi

# Run frontend tests
"$SCRIPT_DIR/test-workflows.sh" frontend push "$@"

echo -e "${GREEN}🎉 Frontend testing completed!${NC}"