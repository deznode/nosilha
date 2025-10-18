#!/usr/bin/env bash
#
# setup.sh - First-time setup for ACT workflow testing infrastructure
#
# This script performs interactive setup with resource validation, prerequisite
# installation, and configuration file creation.
#
# Exit codes:
#   0 - Success
#   1 - General error
#   3 - Resource constraint
#   4 - Prerequisite failed

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ACT_CONFIG_DIR="$PROJECT_ROOT/infrastructure/act-testing"

echo -e "${BOLD}${BLUE}🚀 Nos Ilha ACT Testing Infrastructure Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will set up your local environment for testing"
echo "GitHub Actions workflows using ACT (nektos/act)."
echo ""

# Step 1: Run comprehensive resource validation
echo -e "${BOLD}Step 1: Validating Prerequisites and Resources${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! "$SCRIPT_DIR/validate-resources.sh"; then
    echo ""
    echo -e "${RED}${BOLD}Setup aborted due to validation failures.${NC}"
    echo "Please address the issues above and run setup again."
    exit $?
fi

echo ""
echo -e "${GREEN}${BOLD}✓ All prerequisites and resources validated${NC}"
echo ""

# Step 2: Confirm minimum version requirements
echo -e "${BOLD}Step 2: Version Requirements${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Minimum versions required:"
echo "  • Docker:         20.10+"
echo "  • Docker Compose: 2.x"
echo "  • ACT:            v0.2.82+"
echo "  • Bash:           5.x (for scripts)"
echo ""

DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
ACT_VERSION=$(act --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "unknown")

echo "Installed versions:"
echo "  • Docker:         $DOCKER_VERSION"
echo "  • ACT:            $ACT_VERSION"
echo ""

# Step 3: Install missing prerequisites with user confirmation
echo -e "${BOLD}Step 3: Installing Missing Prerequisites${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Act needs installation
if ! command -v act &> /dev/null; then
    echo -e "${YELLOW}ACT tool not found.${NC}"

    if command -v brew &> /dev/null; then
        read -p "Install ACT via Homebrew? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Installing ACT via Homebrew..."
            brew install act
            echo -e "${GREEN}✓ ACT installed successfully${NC}"
        else
            echo -e "${RED}ACT installation skipped. Please install manually:${NC}"
            echo "  macOS:   brew install act"
            echo "  Linux:   curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
            echo "  Windows: scoop install act"
            exit 4
        fi
    else
        echo -e "${RED}Homebrew not found. Please install ACT manually:${NC}"
        echo "  Linux:   curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
        echo "  Windows: scoop install act"
        echo "  Or visit: https://github.com/nektos/act#installation"
        exit 4
    fi
else
    echo -e "${GREEN}✓ All prerequisites already installed${NC}"
fi

echo ""

# Step 4: Create configuration files from templates
echo -e "${BOLD}Step 4: Creating Configuration Files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create secrets file from template
if [[ ! -f "$ACT_CONFIG_DIR/config/secrets.env" ]]; then
    if [[ -f "$ACT_CONFIG_DIR/config/secrets.env.example" ]]; then
        cp "$ACT_CONFIG_DIR/config/secrets.env.example" "$ACT_CONFIG_DIR/config/secrets.env"
        echo -e "${GREEN}✓ Created secrets.env from template${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit secrets.env with your actual values${NC}"
        echo "   Location: $ACT_CONFIG_DIR/config/secrets.env"
        echo ""
        echo -e "${YELLOW}Required secrets for workflow testing:${NC}"
        echo "   • GITHUB_TOKEN: GitHub personal access token (repo scope)"
        echo "   • NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: Mapbox token (for map features)"
        echo "   • NEXT_PUBLIC_SUPABASE_URL: Supabase project URL"
        echo "   • NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anonymous key"
        echo ""
        echo -e "${BLUE}Note: Deployment secrets not needed for local testing${NC}"
        echo ""
    else
        echo -e "${RED}ERROR: secrets.env.example template not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ secrets.env already exists${NC}"
fi

# Create variables file from template
if [[ ! -f "$ACT_CONFIG_DIR/config/variables.env" ]]; then
    if [[ -f "$ACT_CONFIG_DIR/config/variables.env.example" ]]; then
        cp "$ACT_CONFIG_DIR/config/variables.env.example" "$ACT_CONFIG_DIR/config/variables.env"
        echo -e "${GREEN}✓ Created variables.env from template${NC}"
    else
        # Create default variables file
        cat > "$ACT_CONFIG_DIR/config/variables.env" <<EOF
# Environment variables for ACT workflow testing
GCP_PROJECT_ID=nosilha
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nosilha_db
SPRING_PROFILES_ACTIVE=local
NODE_ENV=test
EOF
        echo -e "${GREEN}✓ Created default variables.env${NC}"
    fi
else
    echo -e "${GREEN}✓ variables.env already exists${NC}"
fi

echo ""

# Step 5: Initialize Docker network
echo -e "${BOLD}Step 5: Initializing Docker Network${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! docker network inspect act-testing &> /dev/null; then
    docker network create act-testing
    echo -e "${GREEN}✓ Docker network 'act-testing' created${NC}"
else
    echo -e "${GREEN}✓ Docker network 'act-testing' already exists${NC}"
fi

echo ""

# Step 6: Pull required Docker images
echo -e "${BOLD}Step 6: Pulling Docker Images${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "This may take several minutes on first run..."
echo ""

echo "Pulling ACT runner image (catthehacker/ubuntu:act-22.04)..."
docker pull catthehacker/ubuntu:act-22.04

echo "Pulling service images..."
docker pull postgres:15
docker pull redis:7-alpine

echo ""
echo -e "${GREEN}✓ All required Docker images pulled${NC}"
echo ""

# Step 7: Make scripts executable
echo -e "${BOLD}Step 7: Configuring Scripts${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

chmod +x "$ACT_CONFIG_DIR/scripts"/*.sh
echo -e "${GREEN}✓ All scripts made executable${NC}"

echo ""

# Step 8: Validate ACT configuration
echo -e "${BOLD}Step 8: Validating ACT Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_ROOT"

if act --list > /dev/null 2>&1; then
    echo -e "${GREEN}✓ ACT configuration valid${NC}"
    echo ""
    echo "Available workflows:"
    act --list | head -10
else
    echo -e "${YELLOW}⚠️  ACT validation warning (may be due to missing secrets)${NC}"
    echo "You can proceed - secrets will be validated when running tests"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}${BOLD}🎉 Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo ""
echo -e "1. ${YELLOW}Edit configuration files:${NC}"
echo "   $ACT_CONFIG_DIR/config/secrets.env"
echo ""
echo -e "2. ${BLUE}Run workflow tests:${NC}"
echo "   cd $PROJECT_ROOT"
echo "   ./infrastructure/act-testing/scripts/test-backend.sh --verbose"
echo "   ./infrastructure/act-testing/scripts/test-frontend.sh --verbose"
echo "   ./infrastructure/act-testing/scripts/test-integration.sh --verbose"
echo ""
echo -e "3. ${BLUE}For help and documentation:${NC}"
echo "   cat infrastructure/act-testing/README.md"
echo ""
echo -e "${GREEN}✓ ACT testing infrastructure ready!${NC}"
echo ""