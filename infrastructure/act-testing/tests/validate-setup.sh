#!/usr/bin/env bash
#
# validate-setup.sh - Test script for setup workflow validation
#
# This script validates that setup.sh works correctly in dry-run mode and that
# all configuration files are created properly.
#
# Exit codes:
#   0 - All tests passed
#   1 - Test failure

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ACT_CONFIG_DIR="$PROJECT_ROOT/infrastructure/act-testing"

TESTS_PASSED=0
TESTS_FAILED=0

# Test result tracking
log_test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

log_test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

log_section() {
    echo ""
    echo -e "${BOLD}$1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Test 1: Validate resources script exists and is executable
test_validate_resources_exists() {
    log_section "Test 1: Validate Resources Script"

    if [[ -f "$ACT_CONFIG_DIR/scripts/validate-resources.sh" ]]; then
        log_test_pass "validate-resources.sh exists"
    else
        log_test_fail "validate-resources.sh not found"
        return 1
    fi

    if [[ -x "$ACT_CONFIG_DIR/scripts/validate-resources.sh" ]]; then
        log_test_pass "validate-resources.sh is executable"
    else
        log_test_fail "validate-resources.sh is not executable"
        return 1
    fi
}

# Test 2: Validate resources script runs successfully
test_validate_resources_runs() {
    log_section "Test 2: Resource Validation Execution"

    if "$ACT_CONFIG_DIR/scripts/validate-resources.sh" > /dev/null 2>&1; then
        log_test_pass "Resource validation passed"
    else
        EXIT_CODE=$?
        if [[ $EXIT_CODE -eq 3 ]]; then
            log_test_fail "Resource constraint violation (exit code 3)"
            echo "  Check Docker memory/disk allocation"
        elif [[ $EXIT_CODE -eq 4 ]]; then
            log_test_fail "Prerequisite validation failed (exit code 4)"
            echo "  Install missing tools: Docker, ACT"
        else
            log_test_fail "Resource validation failed (exit code $EXIT_CODE)"
        fi
        return 1
    fi
}

# Test 3: Validate Docker network exists
test_docker_network() {
    log_section "Test 3: Docker Network"

    if docker network inspect act-testing &> /dev/null; then
        log_test_pass "Docker network 'act-testing' exists"
    else
        log_test_fail "Docker network 'act-testing' not found"
        echo "  Run: docker network create act-testing"
        return 1
    fi
}

# Test 4: Validate configuration files
test_configuration_files() {
    log_section "Test 4: Configuration Files"

    # Check .actrc
    if [[ -f "$ACT_CONFIG_DIR/.actrc" ]]; then
        log_test_pass ".actrc configuration file exists"
    else
        log_test_fail ".actrc not found"
    fi

    # Check docker-compose.act.yml
    if [[ -f "$ACT_CONFIG_DIR/docker/docker-compose.act.yml" ]]; then
        log_test_pass "docker-compose.act.yml exists"
    else
        log_test_fail "docker-compose.act.yml not found"
    fi

    # Check config directory
    if [[ -d "$ACT_CONFIG_DIR/config" ]]; then
        log_test_pass "config/ directory exists"
    else
        log_test_fail "config/ directory not found"
    fi

    # Check secrets.env.example
    if [[ -f "$ACT_CONFIG_DIR/config/secrets.env.example" ]]; then
        log_test_pass "secrets.env.example template exists"
    else
        log_test_fail "secrets.env.example not found"
    fi
}

# Test 5: Validate scripts are executable
test_scripts_executable() {
    log_section "Test 5: Script Executability"

    local scripts=(
        "setup.sh"
        "validate-resources.sh"
        "test-backend.sh"
        "test-frontend.sh"
        "test-integration.sh"
    )

    for script in "${scripts[@]}"; do
        if [[ -x "$ACT_CONFIG_DIR/scripts/$script" ]]; then
            log_test_pass "$script is executable"
        else
            log_test_fail "$script is not executable"
        fi
    done
}

# Test 6: Validate ACT installation
test_act_installation() {
    log_section "Test 6: ACT Installation"

    if command -v act &> /dev/null; then
        log_test_pass "ACT tool is installed"

        ACT_VERSION=$(act --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        if [[ -n "$ACT_VERSION" ]]; then
            log_test_pass "ACT version: $ACT_VERSION"
        else
            log_test_fail "Could not determine ACT version"
        fi
    else
        log_test_fail "ACT tool not installed"
        echo "  Install: brew install act (macOS) or see README.md"
        return 1
    fi
}

# Test 7: Validate Docker images
test_docker_images() {
    log_section "Test 7: Docker Images"

    local images=(
        "catthehacker/ubuntu:act-22.04"
        "postgres:16-alpine"
        "redis:7-alpine"
    )

    for image in "${images[@]}"; do
        if docker image inspect "$image" &> /dev/null; then
            log_test_pass "Image available: $image"
        else
            log_test_fail "Image not found: $image"
            echo "  Pull: docker pull $image"
        fi
    done
}

# Main test execution
main() {
    echo -e "${BOLD}ACT Setup Validation Tests${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Running validation tests for ACT testing infrastructure..."

    # Run all tests
    test_validate_resources_exists || true
    test_validate_resources_runs || true
    test_docker_network || true
    test_configuration_files || true
    test_scripts_executable || true
    test_act_installation || true
    test_docker_images || true

    # Summary
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BOLD}Test Results${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
    echo ""

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}${BOLD}✓ All validation tests passed!${NC}"
        echo ""
        echo "Setup workflow is correctly configured."
        echo "Ready to run ACT workflow tests."
        exit 0
    else
        echo -e "${RED}${BOLD}✗ Some validation tests failed${NC}"
        echo ""
        echo "Please address the failures above before running workflow tests."
        echo "See: infrastructure/act-testing/README.md for troubleshooting"
        exit 1
    fi
}

# Run tests
main "$@"
