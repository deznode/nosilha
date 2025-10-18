#!/usr/bin/env bash
#
# test-backend.sh - Backend workflow testing script
#
# Tests the backend CI/CD workflow (.github/workflows/backend-ci.yml) with job filtering
# to exclude deployment jobs and ensure safe local testing.
#
# Exit codes:
#   0 - Success (all jobs passed)
#   1 - Workflow execution failed
#   2 - Configuration error
#   3 - Resource constraint violation
#   4 - Prerequisite validation failed
#   5 - Service startup failure
#   6 - Timeout exceeded

set -euo pipefail

# Script directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ACT_CONFIG_DIR="$PROJECT_ROOT/infrastructure/act-testing"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Default configuration
WORKFLOW_FILE=".github/workflows/backend-ci.yml"
EVENT_TYPE="push"
VERBOSE=false
DRY_RUN=false
CLEAN=false
NO_CACHE=false
SKIP_VALIDATE=false
EXPORT_LOGS=""
TIMEOUT=60

# Backend jobs (excluding deployment and reusable workflows)
# Note: security-scan uses reusable workflow (workflow_call) which ACT doesn't support
# Run security-scan explicitly with --job security-scan if needed (will fail with ACT limitation warning)
BACKEND_JOBS=("test-and-lint")
EXCLUDED_JOBS=("build" "deploy-production" "security-scan")
SELECTED_JOBS=()

# Performance tracking
START_TIME=0
PERFORMANCE_TARGET=420  # 7 minutes in seconds

# Cleanup flag
CLEANUP_REGISTERED=false

# Usage information
usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS] [JOB_NAMES...]

Test the backend CI/CD workflow locally using ACT.

OPTIONS:
    -h, --help              Display this help message
    -v, --verbose           Enable verbose output
    -j, --job <name>        Run specific job only (repeatable)
    -e, --event <type>      Event type (push|pull_request|workflow_dispatch)
                            Default: push
    -n, --dry-run           Validate configuration without execution
    -c, --clean             Clean up containers and volumes before starting
    --no-cache              Disable Docker layer caching
    --skip-validate         Skip resource validation step
    --export-logs <dir>     Export container logs to directory after execution
    --timeout <minutes>     Script timeout (for future use, not yet implemented)

EXAMPLES:
    # Run all non-deployment jobs
    $(basename "$0")

    # Run only security scan with verbose output
    $(basename "$0") --verbose --job security-scan

    # Run specific jobs and export logs on failure
    $(basename "$0") -j security-scan -j test-and-lint --export-logs ./logs

    # Dry run to validate configuration
    $(basename "$0") --dry-run

BACKEND JOBS (non-deployment):
    - test-and-lint: JUnit tests, detekt analysis, Jacoco coverage

EXCLUDED JOBS (cannot run locally with ACT):
    - security-scan: Reusable workflow (workflow_call) - ACT limitation
    - build: Docker image build (requires cloud authentication)
    - deploy-production: Production deployment (safety exclusion)

NOTE: security-scan job uses workflow_call which ACT doesn't support.
      Run manually with --job security-scan to see ACT limitation error.

For more information, see: infrastructure/act-testing/README.md
EOF
}

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BOLD}$1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Cleanup function
cleanup() {
    if [[ "$CLEANUP_REGISTERED" == "true" ]]; then
        log_section "Cleanup"

        # Stop services
        if docker-compose -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" ps | grep -q "Up"; then
            log_info "Stopping test services..."
            docker-compose -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" down
            log_success "Services stopped"
        fi

        # Export logs if requested
        if [[ -n "$EXPORT_LOGS" && -d "$EXPORT_LOGS" ]]; then
            "$SCRIPT_DIR/export-logs.sh" "$EXPORT_LOGS" 2>/dev/null || true
        fi
    fi
}

# Register cleanup handler
trap cleanup EXIT INT TERM

# Parse command-line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -j|--job)
                if [[ -z "${2:-}" ]]; then
                    log_error "Option --job requires an argument"
                    exit 2
                fi
                SELECTED_JOBS+=("$2")
                shift 2
                ;;
            -e|--event)
                if [[ -z "${2:-}" ]]; then
                    log_error "Option --event requires an argument"
                    exit 2
                fi
                EVENT_TYPE="$2"
                shift 2
                ;;
            -n|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -c|--clean)
                CLEAN=true
                shift
                ;;
            --no-cache)
                NO_CACHE=true
                shift
                ;;
            --skip-validate)
                SKIP_VALIDATE=true
                shift
                ;;
            --export-logs)
                if [[ -z "${2:-}" ]]; then
                    log_error "Option --export-logs requires a directory argument"
                    exit 2
                fi
                EXPORT_LOGS="$2"
                mkdir -p "$EXPORT_LOGS"
                shift 2
                ;;
            --timeout)
                if [[ -z "${2:-}" ]]; then
                    log_error "Option --timeout requires a number (minutes)"
                    exit 2
                fi
                TIMEOUT="$2"
                shift 2
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                exit 2
                ;;
            *)
                SELECTED_JOBS+=("$1")
                shift
                ;;
        esac
    done
}

# Validate selected jobs
validate_jobs() {
    if [[ ${#SELECTED_JOBS[@]} -eq 0 ]]; then
        # Use default backend jobs
        SELECTED_JOBS=("${BACKEND_JOBS[@]}")
        return
    fi

    # Check for excluded jobs
    for job in "${SELECTED_JOBS[@]}"; do
        for excluded in "${EXCLUDED_JOBS[@]}"; do
            if [[ "$job" == "$excluded" ]]; then
                log_error "Job '$job' is excluded from local testing (deployment job)"
                echo "Excluded jobs: ${EXCLUDED_JOBS[*]}"
                echo "Allowed jobs: ${BACKEND_JOBS[*]}"
                exit 2
            fi
        done
    done
}

# Start test services
start_services() {
    log_section "Starting Test Services"

    # Check if cleanup requested
    if [[ "$CLEAN" == "true" ]]; then
        log_info "Cleaning up existing containers and volumes..."
        docker-compose -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" down -v 2>/dev/null || true
    fi

    # Start PostgreSQL (primary requirement for backend)
    log_info "Starting PostgreSQL..."
    docker-compose -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" up -d postgres

    # Wait for health check
    log_info "Waiting for PostgreSQL to be healthy (max 60s)..."
    local timeout=60
    local elapsed=0
    while [[ $elapsed -lt $timeout ]]; do
        if docker-compose -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" ps postgres | grep -q "healthy"; then
            log_success "PostgreSQL is healthy"
            return 0
        fi
        sleep 2
        ((elapsed+=2))
    done

    log_error "PostgreSQL failed to become healthy within ${timeout}s"
    docker-compose -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" logs postgres
    exit 5
}

# Execute ACT workflow
execute_workflow() {
    log_section "Executing Backend Workflow"

    cd "$PROJECT_ROOT"

    # Build ACT command
    local act_cmd="act $EVENT_TYPE"
    act_cmd="$act_cmd -W $WORKFLOW_FILE"

    # Add job filters
    for job in "${SELECTED_JOBS[@]}"; do
        act_cmd="$act_cmd -j $job"
    done

    # Add verbose flag
    if [[ "$VERBOSE" == "true" ]]; then
        act_cmd="$act_cmd -v"
    fi

    # Add no-cache flag
    if [[ "$NO_CACHE" == "true" ]]; then
        act_cmd="$act_cmd --no-cache"
    fi

    # Note: ACT v0.2.82 doesn't support --container-timeout flag
    # Timeout is managed at the script level via service health checks
    # and workflow execution monitoring

    # Dry run mode
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Dry run mode - validating configuration only"
        act_cmd="$act_cmd --dryrun"
    fi

    # Display command
    log_info "Running: $act_cmd"
    echo ""

    # Execute
    START_TIME=$(date +%s)

    if eval "$act_cmd"; then
        log_success "Workflow execution completed successfully"
        return 0
    else
        local exit_code=$?
        log_error "Workflow execution failed (exit code: $exit_code)"
        return 1
    fi
}

# Report performance metrics
report_performance() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))

    echo ""
    log_section "Performance Metrics"
    echo "Duration: ${minutes}m ${seconds}s"

    if [[ $duration -gt $PERFORMANCE_TARGET ]]; then
        log_warning "Execution exceeded target of $((PERFORMANCE_TARGET / 60)) minutes"
        echo ""
        echo "Optimization suggestions:"
        echo "  • Enable container reuse (already in .actrc)"
        echo "  • Check Gradle cache configuration"
        echo "  • Review test parallelization settings"
    else
        log_success "Performance target met (<$((PERFORMANCE_TARGET / 60)) minutes)"
    fi
}

# Main execution
main() {
    echo -e "${BOLD}${BLUE}Backend Workflow Testing${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Parse arguments
    parse_args "$@"

    # Validate jobs
    validate_jobs

    # Register cleanup
    CLEANUP_REGISTERED=true

    # Step 1: Resource validation (unless skipped)
    if [[ "$SKIP_VALIDATE" != "true" ]]; then
        log_section "Pre-flight Validation"
        if ! "$SCRIPT_DIR/validate-resources.sh"; then
            log_error "Resource validation failed"
            exit $?
        fi
        echo ""
    fi

    # Step 2: Start services (unless dry run)
    if [[ "$DRY_RUN" != "true" ]]; then
        start_services
        echo ""
    fi

    # Step 3: Execute workflow
    if ! execute_workflow; then
        log_error "Backend workflow testing failed"
        exit 1
    fi

    # Step 4: Report performance
    if [[ "$DRY_RUN" != "true" ]]; then
        report_performance
    fi

    echo ""
    log_success "Backend workflow testing completed successfully"
    echo ""

    exit 0
}

# Run main
main "$@"
