#!/bin/bash
# Main GitHub Actions Testing Script using Act
# Usage: ./test-workflows.sh [workflow-name] [event] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ACT_CONFIG_DIR="$PROJECT_ROOT/infrastructure/act-testing"

echo -e "${BLUE}🚀 Nos Ilha GitHub Actions Local Testing${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Function to display help
show_help() {
    echo -e "${YELLOW}Usage:${NC} $0 [workflow-name] [event] [options]"
    echo
    echo -e "${YELLOW}Available workflows:${NC}"
    echo "  backend         - Test backend CI/CD workflow"
    echo "  frontend        - Test frontend CI/CD workflow"
    echo "  integration     - Test integration workflow"
    echo "  infrastructure  - Test infrastructure workflow"
    echo "  pr-validation   - Test PR validation workflow"
    echo "  all             - Test all workflows"
    echo
    echo -e "${YELLOW}Available events:${NC}"
    echo "  push            - Push event (default)"
    echo "  pull_request    - Pull request event"
    echo "  workflow_dispatch - Manual workflow trigger"
    echo "  schedule        - Scheduled event"
    echo
    echo -e "${YELLOW}Options:${NC}"
    echo "  -h, --help      - Show this help message"
    echo "  -v, --verbose   - Enable verbose output"
    echo "  -n, --dry-run   - Dry run without execution"
    echo "  -l, --list      - List available jobs"
    echo "  -j, --job JOB   - Run specific job only"
    echo "  --clean         - Clean up containers before testing"
    echo "  --services      - Start services before testing"
    echo
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 backend push"
    echo "  $0 frontend pull_request --verbose"
    echo "  $0 integration --job api-integration-tests"
    echo "  $0 all --clean --services"
}

# Parse command line arguments
WORKFLOW=""
EVENT="push"
VERBOSE=""
DRY_RUN=""
LIST_JOBS=""
SPECIFIC_JOB=""
CLEAN_CONTAINERS=""
START_SERVICES=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE="--verbose"
            shift
            ;;
        -n|--dry-run)
            DRY_RUN="--dry-run"
            shift
            ;;
        -l|--list)
            LIST_JOBS="--list"
            shift
            ;;
        -j|--job)
            SPECIFIC_JOB="--job $2"
            shift 2
            ;;
        --clean)
            CLEAN_CONTAINERS="true"
            shift
            ;;
        --services)
            START_SERVICES="true"
            shift
            ;;
        backend|frontend|integration|infrastructure|pr-validation|all)
            WORKFLOW="$1"
            shift
            ;;
        push|pull_request|workflow_dispatch|schedule)
            EVENT="$1"
            shift
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo -e "${RED}❌ Act is not installed. Please install it first:${NC}"
    echo "   brew install act"
    echo "   or visit: https://github.com/nektos/act"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Change to project root
cd "$PROJECT_ROOT"

# Clean up containers if requested
if [[ "$CLEAN_CONTAINERS" == "true" ]]; then
    echo -e "${YELLOW}🧹 Cleaning up existing containers...${NC}"
    ./infrastructure/act-testing/scripts/clean.sh
fi

# Start services if requested
if [[ "$START_SERVICES" == "true" ]]; then
    echo -e "${YELLOW}🔧 Starting test services...${NC}"
    docker-compose -f infrastructure/act-testing/docker/docker-compose.yaml up -d
    echo -e "${GREEN}✅ Services started${NC}"
    sleep 5  # Wait for services to be ready
fi

# Check if secrets.env exists
if [[ ! -f "$ACT_CONFIG_DIR/config/secrets.env" ]]; then
    echo -e "${YELLOW}⚠️  secrets.env not found. Creating from template...${NC}"
    cp "$ACT_CONFIG_DIR/config/secrets.env.example" "$ACT_CONFIG_DIR/config/secrets.env"
    echo -e "${RED}❌ Please edit $ACT_CONFIG_DIR/config/secrets.env with your actual values${NC}"
    exit 1
fi

# Set act configuration
export ACT_CONFIG_FILE="$ACT_CONFIG_DIR/.actrc"

# Build act command
ACT_CMD="act $EVENT $VERBOSE $DRY_RUN $LIST_JOBS $SPECIFIC_JOB"

# Determine workflow file
case $WORKFLOW in
    "backend")
        ACT_CMD="$ACT_CMD --workflows .github/workflows/backend-ci.yml"
        ;;
    "frontend")
        ACT_CMD="$ACT_CMD --workflows .github/workflows/frontend-ci.yml"
        ;;
    "integration")
        ACT_CMD="$ACT_CMD --workflows .github/workflows/integration-ci.yml"
        ;;
    "infrastructure")
        ACT_CMD="$ACT_CMD --workflows .github/workflows/infrastructure-ci.yml"
        ;;
    "pr-validation")
        ACT_CMD="$ACT_CMD --workflows .github/workflows/pr-validation.yml"
        ;;
    "all")
        # Run all workflows - don't specify --workflows
        ;;
    "")
        if [[ "$LIST_JOBS" != "" ]]; then
            # Just list all jobs
            :
        else
            echo -e "${RED}❌ Please specify a workflow to test${NC}"
            show_help
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}❌ Unknown workflow: $WORKFLOW${NC}"
        show_help
        exit 1
        ;;
esac

# Add event payload if custom event
if [[ -f "$ACT_CONFIG_DIR/config/event-payloads/$EVENT.json" ]]; then
    ACT_CMD="$ACT_CMD --eventpath $ACT_CONFIG_DIR/config/event-payloads/$EVENT.json"
fi

# Show what we're about to run
echo -e "${BLUE}🎬 Running:${NC} $ACT_CMD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Execute act command
if eval $ACT_CMD; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ Workflow testing completed successfully!${NC}"

    if [[ "$START_SERVICES" == "true" ]]; then
        echo -e "${YELLOW}💡 Services are still running. Use --clean or run clean.sh to stop them.${NC}"
    fi
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${RED}❌ Workflow testing failed!${NC}"
    exit 1
fi