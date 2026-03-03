#!/usr/bin/env bash
#
# test-pr-validation.sh - PR validation workflow testing
#
# Tests pull request validation workflow with proper event payload handling.
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
WORKFLOW_FILE=".github/workflows/pr-validation.yml"
EVENT_TYPE="pull_request"
PR_VALIDATION_JOBS=("changes" "test-backend" "test-frontend")
EXCLUDED_JOBS=("build" "deploy-production")

# Logging
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }

# Usage
usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Test PR validation workflow locally.

OPTIONS:
    -h, --help       Show this help
    -v, --verbose    Verbose output
    -n, --dry-run    Validate only

EXAMPLES:
    $(basename "$0")
    $(basename "$0") --verbose

For more info: infrastructure/act-testing/README.md
EOF
}

# Parse args
VERBOSE=false; DRY_RUN=false; SKIP_VALIDATE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help) usage; exit 0 ;;
        -v|--verbose) VERBOSE=true; shift ;;
        -n|--dry-run) DRY_RUN=true; shift ;;
        --skip-validate) SKIP_VALIDATE=true; shift ;;
        *) log_error "Unknown option: $1"; usage; exit 2 ;;
    esac
done

# Cleanup trap
cleanup() {
    log_info "Cleanup completed"
}
trap cleanup EXIT INT TERM

# Execute workflow
execute_workflow() {
    echo -e "\n${BOLD}Executing PR Validation Workflow${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    cd "$PROJECT_ROOT"

    # Use pull_request event with payload
    local event_payload="$ACT_CONFIG_DIR/payloads/pull_request.json"
    local cmd="act $EVENT_TYPE -W $WORKFLOW_FILE"

    # Add event payload if exists
    if [[ -f "$event_payload" ]]; then
        cmd="$cmd -e $event_payload"
    fi

    # Add job filters (exclude deployment jobs)
    for job in "${PR_VALIDATION_JOBS[@]}"; do
        cmd="$cmd -j $job"
    done

    [[ "$VERBOSE" == "true" ]] && cmd="$cmd -v"
    [[ "$DRY_RUN" == "true" ]] && cmd="$cmd --dryrun"

    log_info "Running: $cmd"
    if eval "$cmd"; then
        log_success "PR validation workflow completed"
        return 0
    else
        log_error "PR validation workflow failed"
        return 1
    fi
}

# Main
main() {
    echo -e "${BOLD}${BLUE}PR Validation Workflow Testing${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Validation
    if [[ "$SKIP_VALIDATE" != "true" ]]; then
        "$SCRIPT_DIR/validate-resources.sh" || exit $?
    fi

    # Execute
    execute_workflow || exit 1

    log_success "PR validation testing completed"
    exit 0
}

main "$@"
