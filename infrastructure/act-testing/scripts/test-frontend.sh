#!/usr/bin/env bash
#
# test-frontend.sh - Frontend workflow testing script
#
# Tests the frontend CI/CD workflow (.github/workflows/frontend-ci.yml) with job filtering
# to exclude deployment jobs and leverage npm caching strategies.
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
WORKFLOW_FILE=".github/workflows/frontend-ci.yml"
EVENT_TYPE="push"
VERBOSE=false
DRY_RUN=false
CLEAN=false
NO_CACHE=false
SKIP_VALIDATE=false
EXPORT_LOGS=""
TIMEOUT=60

# Frontend jobs (excluding deployment and reusable workflows)
# Note: security-scan uses reusable workflow (workflow_call) which ACT doesn't support
# Note: bundle-analysis only runs on pull_request events, skipped for push
FRONTEND_JOBS=("test-and-lint" "unit-tests" "e2e-tests")
EXCLUDED_JOBS=("build" "deploy-production" "security-scan" "bundle-analysis")
SELECTED_JOBS=()

# Performance tracking
START_TIME=0
PERFORMANCE_TARGET=240  # 4 minutes in seconds

# Cleanup flag
CLEANUP_REGISTERED=false

# Usage information
usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS] [JOB_NAMES...]

Test the frontend CI/CD workflow locally using ACT.

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

    # Run only lint and unit tests
    $(basename "$0") --job test-and-lint --job unit-tests

    # Verbose mode with log export
    $(basename "$0") -v --export-logs ./logs

FRONTEND JOBS (non-deployment):
    - test-and-lint: TypeScript checks, ESLint, build
    - unit-tests: Vitest unit tests with coverage
    - e2e-tests: Playwright E2E tests

EXCLUDED JOBS (cannot run locally with ACT):
    - security-scan: Reusable workflow (workflow_call) - ACT limitation
    - bundle-analysis: Only runs on pull_request events
    - build: Docker image build (requires cloud authentication)
    - deploy-production: Production deployment (safety exclusion)

NOTE: security-scan job uses workflow_call which ACT doesn't support.
      bundle-analysis only runs on pull_request events (skipped for push).

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

        # Export logs if requested
        if [[ -n "$EXPORT_LOGS" && -d "$EXPORT_LOGS" ]]; then
            "$SCRIPT_DIR/export-logs.sh" "$EXPORT_LOGS" 2>/dev/null || true
        fi

        # Clean up artifacts
        if [[ -d "/tmp/act-artifacts" ]]; then
            log_info "Cleaning up artifacts..."
            rm -rf /tmp/act-artifacts/* 2>/dev/null || true
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
        # Use default frontend jobs
        SELECTED_JOBS=("${FRONTEND_JOBS[@]}")
        return
    fi

    # Check for excluded jobs
    for job in "${SELECTED_JOBS[@]}"; do
        for excluded in "${EXCLUDED_JOBS[@]}"; do
            if [[ "$job" == "$excluded" ]]; then
                log_error "Job '$job' is excluded from local testing (deployment job)"
                echo "Excluded jobs: ${EXCLUDED_JOBS[*]}"
                echo "Allowed jobs: ${FRONTEND_JOBS[*]}"
                exit 2
            fi
        done
    done
}

# Execute ACT workflow
execute_workflow() {
    log_section "Executing Frontend Workflow"

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
    # Timeout is managed at the script level

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
        echo "  • Check npm cache configuration"
        echo "  • Review bundle size and dependencies"
    else
        log_success "Performance target met (<$((PERFORMANCE_TARGET / 60)) minutes)"
    fi
}

# Main execution
main() {
    echo -e "${BOLD}${BLUE}Frontend Workflow Testing${NC}"
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

    # Step 2: Execute workflow
    if ! execute_workflow; then
        log_error "Frontend workflow testing failed"
        exit 1
    fi

    # Step 3: Report performance
    if [[ "$DRY_RUN" != "true" ]]; then
        report_performance
    fi

    echo ""
    log_success "Frontend workflow testing completed successfully"
    echo ""

    exit 0
}

# Run main
main "$@"