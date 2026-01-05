#!/bin/bash
# Terraform State Lock Cleanup Script
# Handles stale locks that may remain from interrupted CI runs
#
# Usage: .github/scripts/terraform-lock-cleanup.sh
# Must be run from the terraform working directory

set -e

echo "🔒 Checking for existing Terraform locks..."

# Force unlock the specific known problematic lock if it exists
terraform force-unlock -force 1752177952260121 2>/dev/null || true

# General lock cleanup - extract any lock ID and unlock
LOCK_OUTPUT=$(terraform plan 2>&1 || true)

if echo "$LOCK_OUTPUT" | grep -q "Error acquiring the state lock"; then
  echo "⚠️ Lock detected, attempting cleanup..."
  LOCK_ID=$(echo "$LOCK_OUTPUT" | grep -A 10 "Lock Info:" | grep "ID:" | awk '{print $2}' | head -n1)
  if [ -n "$LOCK_ID" ]; then
    echo "🔓 Unlocking state with ID: $LOCK_ID"
    terraform force-unlock -force "$LOCK_ID" || true
    sleep 5
  fi
else
  echo "✅ No lock detected, proceeding..."
fi
