#!/usr/bin/env bash
#
# test-integration.sh - Integration workflow testing with service sequencing
#
# Exit codes: 0=success, 1=failure, 2=config error, 3=resource, 4=prereq, 5=service, 6=timeout

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ACT_CONFIG_DIR="$PROJECT_ROOT/infrastructure/act-testing"

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

# Config
WORKFLOW_FILE=".github/workflows/integration-ci.yml"
INTEGRATION_JOBS=("api-integration-tests")
EXCLUDED_JOBS=("deploy-production")
PERFORMANCE_TARGET=360  # 6 minutes

# Service sequencing phases
PHASE_1_SERVICES=("postgres" "redis")
PHASE_2_SERVICES=("firestore" "gcs")

# Parse args (simplified - use test-backend.sh as template for full version)
VERBOSE=false; DRY_RUN=false; SKIP_VALIDATE=false
for arg in "$@"; do
    case $arg in
        -v|--verbose) VERBOSE=true ;;
        -n|--dry-run) DRY_RUN=true ;;
        --skip-validate) SKIP_VALIDATE=true ;;
    esac
done

# Logging
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }

# Cleanup trap
cleanup() {
    log_info "Stopping test services..."
    docker-compose -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" down 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Start services with phased sequencing
start_services_phased() {
    echo -e "\n${BOLD}Starting Test Services (Phased Sequencing)${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Phase 1: Core services (PostgreSQL, Redis)
    log_info "Phase 1: Starting core services..."
    for svc in "${PHASE_1_SERVICES[@]}"; do
        docker-compose -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" up -d "$svc"
    done

    # Wait for Phase 1 health
    local timeout=60; local elapsed=0
    while [[ $elapsed -lt $timeout ]]; do
        local all_healthy=true
        for svc in "${PHASE_1_SERVICES[@]}"; do
            if ! docker-compose -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" ps "$svc" | grep -q "healthy"; then
                all_healthy=false
                break
            fi
        done
        if [[ "$all_healthy" == "true" ]]; then
            log_success "Phase 1 services healthy"
            break
        fi
        sleep 2; ((elapsed+=2))
    done

    # Phase 2: Emulator services (Firestore, GCS)
    log_info "Phase 2: Starting emulator services..."
    for svc in "${PHASE_2_SERVICES[@]}"; do
        docker-compose -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" up -d "$svc"
    done

    # Wait for Phase 2 (longer timeout for emulators)
    sleep 10
    log_success "All services started (Phase 1 & 2)"
}

# Execute workflow
execute_workflow() {
    echo -e "\n${BOLD}Executing Integration Workflow${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    cd "$PROJECT_ROOT"
    local cmd="act push -W $WORKFLOW_FILE"
    for job in "${INTEGRATION_JOBS[@]}"; do
        cmd="$cmd -j $job"
    done
    [[ "$VERBOSE" == "true" ]] && cmd="$cmd -v"
    [[ "$DRY_RUN" == "true" ]] && cmd="$cmd --dryrun"

    log_info "Running: $cmd"
    if eval "$cmd"; then
        log_success "Integration workflow completed"
        return 0
    else
        log_error "Integration workflow failed"
        return 1
    fi
}

# Main
main() {
    echo -e "${BOLD}${BLUE}Integration Workflow Testing${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Validation
    if [[ "$SKIP_VALIDATE" != "true" ]]; then
        "$SCRIPT_DIR/validate-resources.sh" || exit $?
    fi

    # Start services
    if [[ "$DRY_RUN" != "true" ]]; then
        start_services_phased
    fi

    # Execute
    execute_workflow || exit 1

    log_success "Integration testing completed"
    exit 0
}

main "$@"