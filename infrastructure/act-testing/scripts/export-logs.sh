#!/usr/bin/env bash
#
# export-logs.sh - Export Docker container logs for debugging
#
# This utility exports logs from all containers in the act-testing network
# to a specified directory for troubleshooting workflow failures.

set -euo pipefail

# Default target directory
TARGET_DIR="${1:-.act-logs}"

# Create target directory
mkdir -p "$TARGET_DIR"

echo "Exporting logs to: $TARGET_DIR"

# Export logs from all act-testing containers
for container in $(docker ps -a --filter "network=act-testing" --format "{{.Names}}"); do
    echo "Exporting logs from: $container"
    docker logs "$container" > "$TARGET_DIR/${container}.log" 2>&1
done

echo "✓ Logs exported successfully to $TARGET_DIR"
