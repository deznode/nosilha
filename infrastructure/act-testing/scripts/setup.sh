#!/bin/bash
# Setup script for Act GitHub Actions local testing
# This script prepares the environment for local workflow testing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ACT_CONFIG_DIR="$PROJECT_ROOT/infrastructure/act-testing"

echo -e "${BLUE}🚀 Nos Ilha Act Testing Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available. Please install Docker Compose.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is available and running${NC}"

# Check if Act is installed
if ! command -v act &> /dev/null; then
    echo -e "${YELLOW}⚠️  Act is not installed. Installing now...${NC}"

    # Try to install act based on OS
    if command -v brew &> /dev/null; then
        echo "Installing act via Homebrew..."
        brew install act
    else
        echo -e "${RED}❌ Please install act manually:${NC}"
        echo "   macOS: brew install act"
        echo "   Linux: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
        echo "   Windows: scoop install act"
        echo "   Or visit: https://github.com/nektos/act"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Act is installed${NC}"
act --version

# Create secrets file from template if it doesn't exist
if [[ ! -f "$ACT_CONFIG_DIR/config/secrets.env" ]]; then
    echo -e "${YELLOW}📝 Creating secrets.env from template...${NC}"
    cp "$ACT_CONFIG_DIR/config/secrets.env.example" "$ACT_CONFIG_DIR/config/secrets.env"
    echo -e "${YELLOW}⚠️  Please edit the secrets.env file with your actual values:${NC}"
    echo "   $ACT_CONFIG_DIR/config/secrets.env"
    echo
    echo -e "${YELLOW}Required secrets:${NC}"
    echo "   - GITHUB_TOKEN: Your GitHub personal access token"
    echo "   - GCP_SA_KEY: Your Google Cloud service account key (JSON)"
    echo "   - GCP_PROJECT_ID: Your Google Cloud project ID"
    echo "   - NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: Your Mapbox token"
    echo "   - NEXT_PUBLIC_SUPABASE_URL: Your Supabase URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key"
    echo
    read -p "Press Enter to continue after editing secrets.env..."
else
    echo -e "${GREEN}✅ secrets.env already exists${NC}"
fi

# Pull required Docker images
echo -e "${BLUE}📥 Pulling required Docker images...${NC}"
docker pull catthehacker/ubuntu:act-22.04
docker pull postgres:15
docker pull redis:7-alpine
docker pull gcr.io/google.com/cloudsdktool/google-cloud-cli:latest
docker pull fsouza/fake-gcs-server:1.44.0

echo -e "${GREEN}✅ Docker images pulled${NC}"

# Create Docker network for act testing
echo -e "${BLUE}🌐 Creating Docker network for act testing...${NC}"
if ! docker network ls | grep -q act-testing; then
    docker network create act-testing
    echo -e "${GREEN}✅ Network 'act-testing' created${NC}"
else
    echo -e "${GREEN}✅ Network 'act-testing' already exists${NC}"
fi

# Set up act configuration
echo -e "${BLUE}⚙️  Configuring act...${NC}"
export ACT_CONFIG_FILE="$ACT_CONFIG_DIR/.actrc"

# Test act installation
echo -e "${BLUE}🧪 Testing act installation...${NC}"
cd "$PROJECT_ROOT"

if act --list > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Act is working correctly${NC}"
    echo
    echo -e "${BLUE}Available workflows:${NC}"
    act --list
else
    echo -e "${YELLOW}⚠️  Act test failed, but this might be due to missing secrets${NC}"
fi

# Make all scripts executable
chmod +x "$ACT_CONFIG_DIR/scripts"/*.sh

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo
echo -e "${BLUE}Next steps:${NC}"
echo "1. Edit $ACT_CONFIG_DIR/config/secrets.env with your actual values"
echo "2. Test a workflow: ./infrastructure/act-testing/scripts/test-workflows.sh backend"
echo "3. Or use specific scripts:"
echo "   - ./infrastructure/act-testing/scripts/test-backend.sh"
echo "   - ./infrastructure/act-testing/scripts/test-frontend.sh"
echo "   - ./infrastructure/act-testing/scripts/test-integration.sh"
echo
echo -e "${BLUE}For help:${NC}"
echo "   ./infrastructure/act-testing/scripts/test-workflows.sh --help"
echo
echo -e "${YELLOW}💡 Remember to review the README for detailed usage instructions${NC}"