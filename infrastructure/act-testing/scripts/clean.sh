#!/bin/bash
# Cleanup script for Act GitHub Actions testing
# This script stops and removes containers, networks, and volumes created for testing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🧹 Cleaning up Act testing environment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Function to confirm action
confirm() {
    read -p "$1 [y/N]: " -n 1 -r
    echo
    [[ $RRRRRRREPLY =~ ^[Yy]$ ]]
}

# Parse arguments
FORCE=false
ALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--force)
            FORCE=true
            shift
            ;;
        -a|--all)
            ALL=true
            shift
            ;;
        -h|--help)
            echo -e "${YELLOW}Usage:${NC} $0 [options]"
            echo
            echo -e "${YELLOW}Options:${NC}"
            echo "  -f, --force    Don't ask for confirmation"
            echo "  -a, --all      Remove everything including images"
            echo "  -h, --help     Show this help message"
            echo
            echo -e "${YELLOW}What this script cleans:${NC}"
            echo "  - Act testing service containers"
            echo "  - Act runner containers"
            echo "  - Test volumes"
            echo "  - Act testing network"
            echo "  - Act cache and artifacts (with --all)"
            echo "  - Docker images (with --all)"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Stop and remove service containers
echo -e "${YELLOW}🛑 Stopping act testing services...${NC}"
if docker-compose -f "$SCRIPT_DIR/../docker/docker-compose.act.yml" ps -q 2>/dev/null | grep -q .; then
    docker-compose -f "$SCRIPT_DIR/../docker/docker-compose.act.yml" down -v
    echo -e "${GREEN}✅ Services stopped${NC}"
else
    echo -e "${GREEN}✅ No services running${NC}"
fi

# Remove act runner containers
echo -e "${YELLOW}🗑️  Removing act runner containers...${NC}"
ACT_CONTAINERS=$(docker ps -aq --filter "label=act" 2>/dev/null || true)
if [[ -n "$ACT_CONTAINERS" ]]; then
    if [[ "$FORCE" == true ]] || confirm "Remove $(echo $ACT_CONTAINERS | wc -w) act containers?"; then
        docker rm -f $ACT_CONTAINERS
        echo -e "${GREEN}✅ Act containers removed${NC}"
    fi
else
    echo -e "${GREEN}✅ No act containers found${NC}"
fi

# Remove test volumes
echo -e "${YELLOW}💾 Removing test volumes...${NC}"
TEST_VOLUMES=$(docker volume ls -q --filter "name=act_" 2>/dev/null || true)
if [[ -n "$TEST_VOLUMES" ]]; then
    if [[ "$FORCE" == true ]] || confirm "Remove $(echo $TEST_VOLUMES | wc -w) test volumes?"; then
        docker volume rm $TEST_VOLUMES
        echo -e "${GREEN}✅ Test volumes removed${NC}"
    fi
else
    echo -e "${GREEN}✅ No test volumes found${NC}"
fi

# Remove act testing network
echo -e "${YELLOW}🌐 Removing act testing network...${NC}"
if docker network ls | grep -q act-testing; then
    if [[ "$FORCE" == true ]] || confirm "Remove act-testing network?"; then
        docker network rm act-testing
        echo -e "${GREEN}✅ Network removed${NC}"
    fi
else
    echo -e "${GREEN}✅ Network not found${NC}"
fi

# Clean up act cache and artifacts
if [[ "$ALL" == true ]]; then
    echo -e "${YELLOW}🗂️  Cleaning act cache and artifacts...${NC}"

    # Remove act cache directory
    if [[ -d ~/.cache/act ]]; then
        if [[ "$FORCE" == true ]] || confirm "Remove act cache directory?"; then
            rm -rf ~/.cache/act
            echo -e "${GREEN}✅ Act cache removed${NC}"
        fi
    fi

    # Remove temporary artifacts
    if [[ -d /tmp/act-artifacts ]]; then
        if [[ "$FORCE" == true ]] || confirm "Remove act artifacts?"; then
            rm -rf /tmp/act-artifacts
            echo -e "${GREEN}✅ Act artifacts removed${NC}"
        fi
    fi

    # Remove Docker images
    echo -e "${YELLOW}🖼️  Removing act-related Docker images...${NC}"
    ACT_IMAGES=$(docker images --filter "reference=catthehacker/ubuntu" --filter "reference=gcr.io/google.com/cloudsdktool/google-cloud-cli" --filter "reference=fsouza/fake-gcs-server" -q 2>/dev/null || true)
    if [[ -n "$ACT_IMAGES" ]]; then
        if [[ "$FORCE" == true ]] || confirm "Remove $(echo $ACT_IMAGES | wc -w) act-related images?"; then
            docker rmi $ACT_IMAGES
            echo -e "${GREEN}✅ Act images removed${NC}"
        fi
    else
        echo -e "${GREEN}✅ No act images found${NC}"
    fi
fi

# Docker system prune
if [[ "$ALL" == true ]]; then
    echo -e "${YELLOW}🧽 Running Docker system prune...${NC}"
    if [[ "$FORCE" == true ]] || confirm "Run docker system prune to free up space?"; then
        docker system prune -f
        echo -e "${GREEN}✅ Docker system pruned${NC}"
    fi
fi

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Cleanup completed!${NC}"
echo
echo -e "${BLUE}Environment status:${NC}"
echo "  - Act testing services: stopped"
echo "  - Test containers: removed"
echo "  - Test volumes: removed"
echo "  - Network: removed"

if [[ "$ALL" == true ]]; then
    echo "  - Cache and artifacts: cleaned"
    echo "  - Docker images: removed"
fi

echo
echo -e "${YELLOW}💡 To restart testing, run setup.sh again${NC}"