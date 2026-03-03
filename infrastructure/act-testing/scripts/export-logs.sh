#!/usr/bin/env bash
#
# export-logs.sh - Export Docker container logs for ACT testing debugging
#
# Purpose: Export logs from all act-testing network containers for debugging failed workflows
# Usage: ./export-logs.sh <target-directory>
# Exit Codes:
#   0 - Success
#   1 - Invalid arguments
#   2 - Docker not available
#   3 - No containers found
#   4 - Export failed
#
# Implements: FR-020 (manual log export capability per clarification Q7)
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
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
COMPRESS_THRESHOLD_MB=100

# Usage information
usage() {
    cat <<EOF
${BOLD}export-logs.sh${RESET} - Export ACT testing container logs

${BOLD}USAGE:${RESET}
    ./export-logs.sh <target-directory>

${BOLD}DESCRIPTION:${RESET}
    Exports Docker container logs for all containers on the act-testing network
    to the specified directory. Each service gets a separate log file with timestamp.
    Automatically compresses logs if total size exceeds ${COMPRESS_THRESHOLD_MB}MB.

${BOLD}ARGUMENTS:${RESET}
    target-directory    Directory where log files will be saved

${BOLD}EXAMPLES:${RESET}
    # Export logs to debug directory
    ./export-logs.sh ./debug-logs

    # Export logs with custom path
    ./export-logs.sh /tmp/act-test-logs-\$(date +%Y%m%d)

${BOLD}EXIT CODES:${RESET}
    0    Success - logs exported successfully
    1    Invalid arguments or usage error
    2    Docker not available or not running
    3    No containers found on act-testing network
    4    Export failed during log extraction

EOF
}

# Print formatted messages
log_info() {
    echo -e "${BLUE}ℹ${RESET} $1"
}

log_success() {
    echo -e "${GREEN}✓${RESET} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${RESET} $1"
}

log_error() {
    echo -e "${RED}✗${RESET} $1" >&2
}

# Validate arguments
if [ "$#" -ne 1 ]; then
    log_error "Invalid number of arguments"
    echo ""
    usage
    exit 1
fi

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

TARGET_DIR="$1"

# Header
echo -e "${BOLD}ACT Testing Log Export${RESET}"
echo "================================================"
echo ""

# Validate Docker is available
log_info "Validating Docker availability..."
if ! command -v docker &> /dev/null; then
    log_error "Docker command not found"
    exit 2
fi

if ! docker info &> /dev/null; then
    log_error "Docker daemon not running"
    exit 2
fi

log_success "Docker is available"

# Create target directory
log_info "Creating target directory: ${TARGET_DIR}"
mkdir -p "${TARGET_DIR}" || {
    log_error "Failed to create directory: ${TARGET_DIR}"
    exit 4
}

# Find all containers on act-testing network
log_info "Finding containers on act-testing network..."
CONTAINERS=$(docker ps -a --filter "network=act-testing" --format "{{.ID}}:{{.Names}}:{{.Image}}" || true)

if [ -z "$CONTAINERS" ]; then
    log_warning "No containers found on act-testing network"
    exit 3
fi

CONTAINER_COUNT=$(echo "$CONTAINERS" | wc -l | tr -d ' ')
log_success "Found ${CONTAINER_COUNT} container(s)"

# Export logs for each container
log_info "Exporting logs to ${TARGET_DIR}..."
echo ""

EXPORT_COUNT=0
FAILED_COUNT=0
TOTAL_SIZE_BYTES=0

while IFS=: read -r container_id container_name container_image; do
    # Determine log filename based on container image/name
    if [[ "$container_image" == *"postgres"* ]] || [[ "$container_name" == *"postgres"* ]]; then
        LOG_FILE="postgresql.log"
    elif [[ "$container_image" == *"redis"* ]] || [[ "$container_name" == *"redis"* ]]; then
        LOG_FILE="redis.log"
    elif [[ "$container_image" == *"firestore"* ]] || [[ "$container_name" == *"firestore"* ]]; then
        LOG_FILE="firestore.log"
    elif [[ "$container_image" == *"gcs"* ]] || [[ "$container_name" == *"gcs"* ]] || [[ "$container_name" == *"storage"* ]]; then
        LOG_FILE="gcs.log"
    elif [[ "$container_image" == *"act"* ]] || [[ "$container_name" == *"act"* ]]; then
        LOG_FILE="act-output.log"
    else
        # Generic name based on container name
        SAFE_NAME=$(echo "$container_name" | tr '/' '_' | tr ':' '_')
        LOG_FILE="${SAFE_NAME}.log"
    fi

    LOG_PATH="${TARGET_DIR}/${LOG_FILE}"

    echo -n "  Exporting ${container_name} → ${LOG_FILE}... "

    # Export logs with timestamps
    {
        echo "================================================================================"
        echo "Container: ${container_name} (${container_id})"
        echo "Image: ${container_image}"
        echo "Export Time: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "================================================================================"
        echo ""
        docker logs "${container_id}" 2>&1
    } > "${LOG_PATH}" 2>&1

    if [ $? -eq 0 ]; then
        FILE_SIZE=$(stat -f%z "${LOG_PATH}" 2>/dev/null || stat -c%s "${LOG_PATH}" 2>/dev/null || echo "0")
        TOTAL_SIZE_BYTES=$((TOTAL_SIZE_BYTES + FILE_SIZE))
        HUMAN_SIZE=$(numfmt --to=iec-i --suffix=B "${FILE_SIZE}" 2>/dev/null || echo "${FILE_SIZE} bytes")
        echo -e "${GREEN}✓${RESET} (${HUMAN_SIZE})"
        EXPORT_COUNT=$((EXPORT_COUNT + 1))
    else
        echo -e "${RED}✗${RESET} failed"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done <<< "$CONTAINERS"

echo ""

# Export summary metadata
SUMMARY_FILE="${TARGET_DIR}/export-summary.txt"
cat > "${SUMMARY_FILE}" <<EOF
ACT Testing Log Export Summary
================================================================================
Export Time: $(date '+%Y-%m-%d %H:%M:%S')
Export Timestamp: ${TIMESTAMP}
Target Directory: ${TARGET_DIR}
Network: act-testing

Container Statistics:
  Total Containers: ${CONTAINER_COUNT}
  Logs Exported: ${EXPORT_COUNT}
  Export Failures: ${FAILED_COUNT}

Total Size: $(numfmt --to=iec-i --suffix=B ${TOTAL_SIZE_BYTES} 2>/dev/null || echo "${TOTAL_SIZE_BYTES} bytes")

Exported Log Files:
EOF

ls -lh "${TARGET_DIR}"/*.log 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}' >> "${SUMMARY_FILE}" || true

echo "=================================================================================" >> "${SUMMARY_FILE}"

# Check if compression is needed
TOTAL_SIZE_MB=$((TOTAL_SIZE_BYTES / 1024 / 1024))

if [ "${TOTAL_SIZE_MB}" -gt "${COMPRESS_THRESHOLD_MB}" ]; then
    log_info "Total log size (${TOTAL_SIZE_MB}MB) exceeds ${COMPRESS_THRESHOLD_MB}MB, compressing..."

    ARCHIVE_NAME="act-logs-${TIMESTAMP}.tar.gz"
    ARCHIVE_PATH="${TARGET_DIR}/${ARCHIVE_NAME}"

    # Create compressed archive
    tar -czf "${ARCHIVE_PATH}" -C "${TARGET_DIR}" $(ls "${TARGET_DIR}"/*.log 2>/dev/null | xargs -n1 basename) "${SUMMARY_FILE##*/}" 2>/dev/null || {
        log_warning "Compression failed, logs remain uncompressed"
    }

    if [ -f "${ARCHIVE_PATH}" ]; then
        ARCHIVE_SIZE=$(stat -f%z "${ARCHIVE_PATH}" 2>/dev/null || stat -c%s "${ARCHIVE_PATH}" 2>/dev/null || echo "0")
        ARCHIVE_HUMAN_SIZE=$(numfmt --to=iec-i --suffix=B "${ARCHIVE_SIZE}" 2>/dev/null || echo "${ARCHIVE_SIZE} bytes")
        log_success "Compressed to ${ARCHIVE_NAME} (${ARCHIVE_HUMAN_SIZE})"

        # Remove uncompressed logs
        rm -f "${TARGET_DIR}"/*.log

        echo "" >> "${SUMMARY_FILE}"
        echo "Compression: ${ARCHIVE_NAME} (${ARCHIVE_HUMAN_SIZE})" >> "${SUMMARY_FILE}"
    fi
fi

# Print summary
echo -e "${BOLD}Export Summary${RESET}"
echo "================================================"
cat "${SUMMARY_FILE}"
echo ""

# Final status
if [ "${FAILED_COUNT}" -eq 0 ]; then
    log_success "All logs exported successfully"
    log_info "Logs saved to: ${TARGET_DIR}"
    exit 0
else
    log_warning "${EXPORT_COUNT} logs exported, ${FAILED_COUNT} failed"
    exit 4
fi
