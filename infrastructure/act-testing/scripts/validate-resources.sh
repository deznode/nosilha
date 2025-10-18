#!/usr/bin/env bash
#
# validate-resources.sh - Resource validation for ACT workflow testing
#
# This script checks prerequisites and resource constraints before workflow execution.
# Implements fail-fast strategy per FR-021.
#
# Exit codes:
#   0 - Success (all validation passed)
#   3 - Resource constraint violation
#   4 - Prerequisite failed

set -euo pipefail

# Colors and formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
RESET="\033[0m"

# Resource requirements
REQUIRED_MEMORY_GB=8
REQUIRED_DISK_GB=20
REQUIRED_DOCKER_VERSION="20.10"
REQUIRED_ACT_VERSION="0.2.82"
REQUIRED_PORTS=(5432 6379 8081 8082)

# Track validation failures
VALIDATION_FAILED=0
EXIT_CODE=0

# Utility functions
log_success() {
    echo -e "${GREEN}✓${RESET} $1"
}

log_error() {
    echo -e "${RED}✗${RESET} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}!${RESET} $1"
}

# Check Docker daemon is running
check_docker_daemon() {
    echo -e "\n${BOLD}Checking Docker Daemon${RESET}"

    if ! command -v docker &> /dev/null; then
        log_error "Docker not found"
        echo "Install Docker Desktop: https://www.docker.com/products/docker-desktop"
        EXIT_CODE=4
        VALIDATION_FAILED=1
        return 1
    fi

    log_success "Docker installed"

    if ! docker info &> /dev/null 2>&1; then
        log_error "Docker daemon not running"
        echo "Fix: Start Docker Desktop and try again"
        EXIT_CODE=4
        VALIDATION_FAILED=1
        return 1
    fi

    log_success "Docker daemon running"

    # Check Docker version
    DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
    if [ "$(echo "$DOCKER_VERSION >= $REQUIRED_DOCKER_VERSION" | bc)" -eq 0 ]; then
        log_warning "Docker version $DOCKER_VERSION is below recommended $REQUIRED_DOCKER_VERSION"
        echo "Recommend: Upgrade Docker to version $REQUIRED_DOCKER_VERSION or later"
    else
        log_success "Docker version $DOCKER_VERSION (meets minimum $REQUIRED_DOCKER_VERSION)"
    fi
}

# Check ACT tool installation and version
check_act_tool() {
    echo -e "\n${BOLD}Checking ACT Tool${RESET}"

    if ! command -v act &> /dev/null; then
        log_error "ACT tool not found"
        echo "Install ACT:"
        echo "  macOS:   brew install act"
        echo "  Linux:   curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
        echo "  Windows: scoop install act"
        EXIT_CODE=4
        VALIDATION_FAILED=1
        return 1
    fi

    log_success "ACT tool installed"

    # Check ACT version
    ACT_VERSION=$(act --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    if [ -n "$ACT_VERSION" ]; then
        log_success "ACT version $ACT_VERSION"

        # Version comparison (basic)
        if [ "$(printf '%s\n' "$REQUIRED_ACT_VERSION" "$ACT_VERSION" | sort -V | head -n1)" != "$REQUIRED_ACT_VERSION" ]; then
            log_warning "ACT version $ACT_VERSION is below recommended $REQUIRED_ACT_VERSION"
            echo "Recommend: Upgrade ACT to version $REQUIRED_ACT_VERSION or later"
        fi
    else
        log_warning "Could not determine ACT version"
    fi
}

# Check available memory
check_memory() {
    echo -e "\n${BOLD}Checking Memory${RESET}"

    # Get Docker memory allocation
    if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
        # Try to get memory from docker info
        DOCKER_MEMORY_BYTES=$(docker info --format '{{.MemTotal}}' 2>/dev/null || echo "0")
        DOCKER_MEMORY_GB=$((DOCKER_MEMORY_BYTES / 1024 / 1024 / 1024))

        if [ "$DOCKER_MEMORY_GB" -eq 0 ]; then
            log_warning "Could not determine Docker memory allocation"
            return 0
        fi

        if [ "$DOCKER_MEMORY_GB" -lt "$REQUIRED_MEMORY_GB" ]; then
            log_error "Insufficient memory: ${DOCKER_MEMORY_GB}GB (minimum: ${REQUIRED_MEMORY_GB}GB)"
            echo "Fix: Increase Docker memory allocation"
            echo "  macOS/Windows: Docker Desktop → Settings → Resources → Memory → ${REQUIRED_MEMORY_GB}GB+"
            echo "  Linux:         Edit /etc/docker/daemon.json"
            echo ""
            echo "Documentation: infrastructure/act-testing/README.md#resource-requirements"
            EXIT_CODE=3
            VALIDATION_FAILED=1
            return 1
        fi

        log_success "Memory available: ${DOCKER_MEMORY_GB}GB (minimum: ${REQUIRED_MEMORY_GB}GB)"
    else
        log_warning "Could not check memory allocation (Docker not available)"
    fi
}

# Check available disk space
check_disk_space() {
    echo -e "\n${BOLD}Checking Disk Space${RESET}"

    if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
        DOCKER_ROOT=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo "/var/lib/docker")

        # Get available disk space (cross-platform)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            AVAILABLE_DISK_GB=$(df -g "$DOCKER_ROOT" 2>/dev/null | tail -1 | awk '{print int($4)}' || echo "0")
        else
            # Linux
            AVAILABLE_DISK_GB=$(df -BG "$DOCKER_ROOT" 2>/dev/null | tail -1 | awk '{print int($4)}' || echo "0")
        fi

        if [ "$AVAILABLE_DISK_GB" -eq 0 ]; then
            log_warning "Could not determine disk space"
            return 0
        fi

        if [ "$AVAILABLE_DISK_GB" -lt "$REQUIRED_DISK_GB" ]; then
            log_error "Insufficient disk space: ${AVAILABLE_DISK_GB}GB (minimum: ${REQUIRED_DISK_GB}GB)"
            echo "Fix: Free up disk space or increase Docker disk allocation"
            echo "  macOS/Windows: Docker Desktop → Settings → Resources → Disk image size → ${REQUIRED_DISK_GB}GB+"
            echo "  Linux:         Free up space in $DOCKER_ROOT"
            echo ""
            echo "Documentation: infrastructure/act-testing/README.md#resource-requirements"
            EXIT_CODE=3
            VALIDATION_FAILED=1
            return 1
        fi

        log_success "Disk space available: ${AVAILABLE_DISK_GB}GB (minimum: ${REQUIRED_DISK_GB}GB)"
    else
        log_warning "Could not check disk space (Docker not available)"
    fi
}

# Check required ports are available
check_ports() {
    echo -e "\n${BOLD}Checking Port Availability${RESET}"

    for port in "${REQUIRED_PORTS[@]}"; do
        if lsof -Pi ":$port" -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            log_warning "Port $port is already in use"
            echo "Service using port $port may conflict with test services"
            PROCESS=$(lsof -Pi ":$port" -sTCP:LISTEN 2>/dev/null | tail -1 | awk '{print $1}')
            echo "Process: $PROCESS"
        else
            log_success "Port $port available"
        fi
    done
}

# Check or create Docker network
check_docker_network() {
    echo -e "\n${BOLD}Checking Docker Network${RESET}"

    if ! command -v docker &> /dev/null || ! docker info &> /dev/null 2>&1; then
        log_warning "Skipping network check (Docker not available)"
        return 0
    fi

    if docker network inspect act-testing &> /dev/null; then
        log_success "Docker network 'act-testing' exists"
    else
        log_warning "Docker network 'act-testing' does not exist"
        echo "Creating network 'act-testing'..."
        if docker network create act-testing &> /dev/null; then
            log_success "Docker network 'act-testing' created"
        else
            log_error "Failed to create Docker network 'act-testing'"
            EXIT_CODE=4
            VALIDATION_FAILED=1
            return 1
        fi
    fi
}

# Main validation flow
main() {
    echo -e "${BOLD}ACT Testing Infrastructure - Resource Validation${RESET}"
    echo "================================================"

    check_docker_daemon
    check_act_tool
    check_memory
    check_disk_space
    check_ports
    check_docker_network

    echo ""
    echo "================================================"
    if [ $VALIDATION_FAILED -eq 1 ]; then
        echo -e "${RED}${BOLD}Validation Failed${RESET}"
        echo ""
        echo "Please address the issues above before running workflow tests."
        echo "See: infrastructure/act-testing/README.md for detailed troubleshooting"
        exit $EXIT_CODE
    else
        echo -e "${GREEN}${BOLD}Validation Passed${RESET}"
        echo ""
        echo "All prerequisites and resources validated successfully."
        echo "Ready to run ACT workflow tests."
        exit 0
    fi
}

# Run validation
main "$@"
