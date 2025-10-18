#!/usr/bin/env bash
#
# cleanup.sh - Comprehensive ACT testing cleanup utility
#
# Purpose: Clean up Docker containers, volumes, and artifacts from ACT testing
# Usage: ./cleanup.sh [--force] [--remove-network]
# Exit Code: 0 on success
#
# Implements: FR-007 (comprehensive cleanup)
#

set -euo pipefail

# Colors for output
BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
RESET="\033[0m"

# Script configuration
FORCE=false
REMOVE_NETWORK=false
ACT_ARTIFACTS_DIR="/tmp/act-artifacts"

# Usage information
usage() {
    cat <<EOF
${BOLD}cleanup.sh${RESET} - ACT testing cleanup utility

${BOLD}USAGE:${RESET}
    ./cleanup.sh [OPTIONS]

${BOLD}DESCRIPTION:${RESET}
    Performs comprehensive cleanup of ACT testing infrastructure including
    containers, volumes, and artifacts. Network is preserved by default for reuse.

${BOLD}OPTIONS:${RESET}
    --force             Skip confirmation prompts (use for automated cleanup)
    --remove-network    Remove act-testing Docker network (requires confirmation)
    -h, --help          Show this help message

${BOLD}CLEANUP ACTIONS:${RESET}
    1. Stop all containers on act-testing network
    2. Remove all stopped containers from act-testing network
    3. Remove volumes labeled with project=act-testing
    4. Clean ${ACT_ARTIFACTS_DIR} directory
    5. (Optional) Remove act-testing Docker network

${BOLD}EXAMPLES:${RESET}
    # Interactive cleanup (preserves network)
    ./cleanup.sh

    # Automated cleanup without prompts
    ./cleanup.sh --force

    # Complete cleanup including network
    ./cleanup.sh --force --remove-network

${BOLD}EXIT CODE:${RESET}
    0    Success - cleanup completed

${BOLD}NOTE:${RESET}
    This script is registered as a cleanup handler in all test scripts per FR-007.
    The act-testing network is preserved by default for faster subsequent test runs.

EOF
}

# Print formatted messages
log_info() {
    echo -e "${BLUE}9${RESET} $1"
}

log_success() {
    echo -e "${GREEN}${RESET} $1"
}

log_warning() {
    echo -e "${YELLOW} ${RESET} $1"
}

log_error() {
    echo -e "${RED}${RESET} $1" >&2
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --remove-network)
            REMOVE_NETWORK=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo ""
            usage
            exit 1
            ;;
    esac
done

# Header
echo -e "${BOLD}ACT Testing Cleanup${RESET}"
echo "================================================"
echo ""

# Confirm cleanup if not forced
if [ "$FORCE" = false ]; then
    echo -e "${YELLOW}This will clean up ACT testing resources:${RESET}"
    echo "  " Stop and remove containers"
    echo "  " Remove test volumes"
    echo "  " Clean artifact directory"
    if [ "$REMOVE_NETWORK" = true ]; then
        echo "  " Remove act-testing network"
    fi
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Cleanup cancelled"
        exit 0
    fi
    echo ""
fi

# Track cleanup statistics
CONTAINERS_STOPPED=0
CONTAINERS_REMOVED=0
VOLUMES_REMOVED=0
ARTIFACTS_CLEANED=false
NETWORK_REMOVED=false

# 1. Stop all containers on act-testing network
log_info "Step 1: Stopping containers on act-testing network..."

RUNNING_CONTAINERS=$(docker ps --filter "network=act-testing" -q || true)

if [ -n "$RUNNING_CONTAINERS" ]; then
    CONTAINER_COUNT=$(echo "$RUNNING_CONTAINERS" | wc -l | tr -d ' ')
    log_info "Found $CONTAINER_COUNT running container(s), stopping..."

    for container_id in $RUNNING_CONTAINERS; do
        CONTAINER_NAME=$(docker inspect --format='{{.Name}}' "$container_id" | sed 's/^//')
        echo -n "  Stopping ${CONTAINER_NAME}... "
        if docker stop "$container_id" &> /dev/null; then
            echo -e "${GREEN}${RESET}"
            CONTAINERS_STOPPED=$((CONTAINERS_STOPPED + 1))
        else
            echo -e "${YELLOW}  already stopped${RESET}"
        fi
    done

    log_success "Stopped $CONTAINERS_STOPPED container(s)"
else
    log_info "No running containers found on act-testing network"
fi

# 2. Remove all containers on act-testing network
log_info "Step 2: Removing stopped containers..."

ALL_CONTAINERS=$(docker ps -a --filter "network=act-testing" -q || true)

if [ -n "$ALL_CONTAINERS" ]; then
    CONTAINER_COUNT=$(echo "$ALL_CONTAINERS" | wc -l | tr -d ' ')
    log_info "Found $CONTAINER_COUNT stopped container(s), removing..."

    for container_id in $ALL_CONTAINERS; do
        CONTAINER_NAME=$(docker inspect --format='{{.Name}}' "$container_id" 2>/dev/null | sed 's/^//' || echo "unknown")
        echo -n "  Removing ${CONTAINER_NAME}... "
        if docker rm -f "$container_id" &> /dev/null; then
            echo -e "${GREEN}${RESET}"
            CONTAINERS_REMOVED=$((CONTAINERS_REMOVED + 1))
        else
            echo -e "${RED}${RESET} failed"
        fi
    done

    log_success "Removed $CONTAINERS_REMOVED container(s)"
else
    log_info "No stopped containers found on act-testing network"
fi

# 3. Remove volumes with act-testing label
log_info "Step 3: Removing volumes with project=act-testing label..."

VOLUMES_BEFORE=$(docker volume ls --filter "label=project=act-testing" -q | wc -l | tr -d ' ')

if [ "$VOLUMES_BEFORE" -gt 0 ]; then
    log_info "Found $VOLUMES_BEFORE volume(s) with act-testing label, pruning..."

    PRUNE_OUTPUT=$(docker volume prune --filter "label=project=act-testing" -f 2>&1 || true)

    VOLUMES_AFTER=$(docker volume ls --filter "label=project=act-testing" -q | wc -l | tr -d ' ')
    VOLUMES_REMOVED=$((VOLUMES_BEFORE - VOLUMES_AFTER))

    if [ "$VOLUMES_REMOVED" -gt 0 ]; then
        log_success "Removed $VOLUMES_REMOVED volume(s)"
    else
        log_info "No volumes removed (may still be in use)"
    fi
else
    log_info "No volumes found with act-testing label"
fi

# 4. Clean ACT artifacts directory
log_info "Step 4: Cleaning ${ACT_ARTIFACTS_DIR} directory..."

if [ -d "$ACT_ARTIFACTS_DIR" ]; then
    ARTIFACTS_SIZE=$(du -sh "$ACT_ARTIFACTS_DIR" 2>/dev/null | cut -f1 || echo "0")
    log_info "Found artifacts directory (${ARTIFACTS_SIZE}), cleaning..."

    if rm -rf "${ACT_ARTIFACTS_DIR}"/* 2>/dev/null; then
        log_success "Cleaned artifacts directory"
        ARTIFACTS_CLEANED=true
    else
        log_warning "Failed to clean artifacts directory (may need sudo)"
    fi
else
    log_info "Artifacts directory does not exist"
fi

# 5. (Optional) Remove act-testing network
if [ "$REMOVE_NETWORK" = true ]; then
    log_info "Step 5: Removing act-testing Docker network..."

    if docker network inspect act-testing &> /dev/null; then
        if [ "$FORCE" = false ]; then
            echo -e "${YELLOW}  Warning: Removing the network will require recreation on next test run${RESET}"
            read -p "Are you sure? (y/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_warning "Network removal cancelled"
            else
                if docker network rm act-testing &> /dev/null; then
                    log_success "Removed act-testing network"
                    NETWORK_REMOVED=true
                else
                    log_error "Failed to remove network (containers may still be connected)"
                fi
            fi
        else
            if docker network rm act-testing &> /dev/null; then
                log_success "Removed act-testing network"
                NETWORK_REMOVED=true
            else
                log_warning "Failed to remove network (containers may still be connected)"
            fi
        fi
    else
        log_info "Network does not exist (already removed or never created)"
    fi
else
    log_info "Step 5: Preserving act-testing network for reuse"
fi

# Summary
echo ""
echo -e "${BOLD}Cleanup Summary${RESET}"
echo "================================================"
echo "Containers stopped: $CONTAINERS_STOPPED"
echo "Containers removed: $CONTAINERS_REMOVED"
echo "Volumes removed: $VOLUMES_REMOVED"
echo "Artifacts cleaned: $([ "$ARTIFACTS_CLEANED" = true ] && echo "Yes" || echo "No")"
echo "Network removed: $([ "$NETWORK_REMOVED" = true ] && echo "Yes" || echo "Preserved for reuse")"
echo ""

# Final status
TOTAL_ACTIONS=$((CONTAINERS_STOPPED + CONTAINERS_REMOVED + VOLUMES_REMOVED))

if [ "$TOTAL_ACTIONS" -gt 0 ] || [ "$ARTIFACTS_CLEANED" = true ]; then
    log_success "Cleanup completed successfully"
else
    log_info "No cleanup actions performed (environment was already clean)"
fi

exit 0
