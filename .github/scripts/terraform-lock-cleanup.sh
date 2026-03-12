#!/bin/bash
# Terraform State Lock Cleanup Script
# Handles stale locks that may remain from interrupted CI runs
#
# Usage: .github/scripts/terraform-lock-cleanup.sh
# Must be run from the terraform working directory

set -e

# Strip ANSI escape codes from input
strip_ansi() {
  sed 's/\x1b\[[0-9;]*m//g'
}

echo "🔒 Checking for existing Terraform locks..."

# Lightweight lock check — uses `state list` which only touches the state backend.
# Zero provider API calls (avoids Cloudflare rate limits during lock detection).
LOCK_OUTPUT=$(terraform state list -no-color 2>&1 || true)

if echo "$LOCK_OUTPUT" | grep -q "Error acquiring the state lock"; then
  echo "⚠️ Lock detected, attempting cleanup..."
  LOCK_ID=$(echo "$LOCK_OUTPUT" | strip_ansi | grep -A 10 "Lock Info:" | grep "ID:" | awk '{print $2}' | head -n1)
  if [ -n "$LOCK_ID" ] && [[ "$LOCK_ID" =~ ^[0-9]+$ ]]; then
    echo "🔓 Unlocking state with ID: $LOCK_ID"
    terraform force-unlock -force "$LOCK_ID" || true
    sleep 5
  else
    echo "⚠️ Could not extract a valid numeric lock ID from output"
  fi
else
  echo "✅ No lock detected, proceeding..."
fi
