#!/bin/bash
# GitHub Actions cleanup script
# Deletes old workflow runs, caches, and deployments
# Usage: ./scripts/cleanup-github.sh [--dry-run] [--days N]

set -e

# ── Defaults ──────────────────────────────────────────────
DRY_RUN=false
RETENTION_DAYS=30
REPO=""

# ── Parse arguments ───────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --days) RETENTION_DAYS="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--dry-run] [--days N] [--repo OWNER/REPO]"
      echo ""
      echo "Options:"
      echo "  --dry-run     Show what would be deleted without deleting"
      echo "  --days N      Retention period in days (default: 30)"
      echo "  --repo R      Target repository (default: auto-detect from gh)"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ── Prerequisites ─────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  echo "Error: gh CLI is not installed. Install with: brew install gh"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo "Error: gh CLI is not authenticated. Run: gh auth login"
  exit 1
fi

if [ -z "$REPO" ]; then
  REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)
  if [ -z "$REPO" ]; then
    echo "Error: Could not detect repository. Run from a git repo or use --repo OWNER/REPO"
    exit 1
  fi
fi

# ── Date threshold ────────────────────────────────────────
if [[ "$OSTYPE" == darwin* ]]; then
  CUTOFF_DATE=$(date -v-"${RETENTION_DAYS}"d -u +"%Y-%m-%dT%H:%M:%SZ")
else
  CUTOFF_DATE=$(date -u -d "${RETENTION_DAYS} days ago" +"%Y-%m-%dT%H:%M:%SZ")
fi

# ── Counters ──────────────────────────────────────────────
deleted_runs=0
deleted_caches=0
deleted_deployments=0

echo "=========================================="
echo "     GITHUB ACTIONS CLEANUP"
echo "=========================================="
echo ""
echo "  Repository:  $REPO"
echo "  Retention:   $RETENTION_DAYS days (before $CUTOFF_DATE)"
if $DRY_RUN; then
  echo "  Mode:        DRY RUN (no changes)"
fi
echo ""

# ══════════════════════════════════════════════════════════
# STEP 1: Workflow Runs
# ══════════════════════════════════════════════════════════
echo "=== STEP 1: Workflow Runs ==="

# Count old runs across all pages
old_run_ids=()
page=1
while true; do
  batch=$(gh api "repos/$REPO/actions/runs?per_page=100&page=$page&created=<$CUTOFF_DATE" \
    --jq '.workflow_runs[].id' 2>/dev/null || true)
  if [ -z "$batch" ]; then
    break
  fi
  while IFS= read -r id; do
    old_run_ids+=("$id")
  done <<< "$batch"
  page=$((page + 1))
  # Safety: cap at 20 pages (2000 runs) per invocation
  if [ "$page" -gt 20 ]; then
    echo "  (capped at 2000 runs per invocation — re-run for more)"
    break
  fi
done

total_runs=$(gh api "repos/$REPO/actions/runs?per_page=1" --jq '.total_count' 2>/dev/null || echo "?")
old_count=${#old_run_ids[@]}

echo "  Total runs:  $total_runs"
echo "  Older than ${RETENTION_DAYS}d: $old_count"

if [ "$old_count" -eq 0 ]; then
  echo "  Nothing to delete."
elif $DRY_RUN; then
  echo "  Would delete $old_count workflow runs."
else
  echo ""
  read -p "  Delete $old_count old workflow runs? (y/N): " confirm
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    for id in "${old_run_ids[@]}"; do
      gh api -X DELETE "repos/$REPO/actions/runs/$id" --silent 2>/dev/null && \
        deleted_runs=$((deleted_runs + 1)) || true
      # Progress every 50
      if [ $((deleted_runs % 50)) -eq 0 ] && [ "$deleted_runs" -gt 0 ]; then
        echo "    ...deleted $deleted_runs/$old_count"
      fi
    done
    echo "  Deleted $deleted_runs workflow runs."
  else
    echo "  Skipped."
  fi
fi
echo ""

# ══════════════════════════════════════════════════════════
# STEP 2: Caches
# ══════════════════════════════════════════════════════════
echo "=== STEP 2: Actions Caches ==="

cache_count=$(gh cache list -R "$REPO" --json id --jq 'length' 2>/dev/null || echo "0")
cache_size=$(gh cache list -R "$REPO" --json sizeInBytes --jq '[.[].sizeInBytes] | add // 0 | . / 1048576 | floor' 2>/dev/null || echo "0")

echo "  Total caches: $cache_count (~${cache_size} MB)"

if [ "$cache_count" -eq 0 ]; then
  echo "  Nothing to delete."
elif $DRY_RUN; then
  echo "  Would delete $cache_count caches (~${cache_size} MB)."
else
  echo ""
  read -p "  Delete all $cache_count caches? They auto-recreate on next run. (y/N): " confirm
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    gh cache delete --all -R "$REPO" 2>/dev/null && \
      deleted_caches=$cache_count || true
    echo "  Deleted $deleted_caches caches."
  else
    echo "  Skipped."
  fi
fi
echo ""

# ══════════════════════════════════════════════════════════
# STEP 3: Deployments
# ══════════════════════════════════════════════════════════
echo "=== STEP 3: Deployments ==="

# Get the most recent deployment per environment (to keep)
keep_ids=()
environments=$(gh api "repos/$REPO/deployments?per_page=100" \
  --jq '[.[].environment] | unique | .[]' 2>/dev/null || true)

for env in $environments; do
  latest=$(gh api "repos/$REPO/deployments?environment=$env&per_page=1" \
    --jq '.[0].id' 2>/dev/null || true)
  if [ -n "$latest" ]; then
    keep_ids+=("$latest")
  fi
done

# Collect old deployments across pages
old_deploy_ids=()
page=1
while true; do
  # Check if page has any results (break on empty page, not empty filter)
  page_count=$(gh api "repos/$REPO/deployments?per_page=100&page=$page" \
    --jq 'length' 2>/dev/null || echo "0")
  if [ "$page_count" -eq 0 ]; then
    break
  fi

  # Filter to old deployments client-side (API has no date filter)
  batch=$(gh api "repos/$REPO/deployments?per_page=100&page=$page" \
    --jq ".[] | select(.created_at < \"$CUTOFF_DATE\") | .id" 2>/dev/null || true)

  if [ -n "$batch" ]; then
    while IFS= read -r id; do
      # Skip if this is the latest deployment for its environment
      skip=false
      for keep in "${keep_ids[@]}"; do
        if [ "$id" = "$keep" ]; then
          skip=true
          break
        fi
      done
      if ! $skip; then
        old_deploy_ids+=("$id")
      fi
    done <<< "$batch"
  fi

  page=$((page + 1))
  if [ "$page" -gt 10 ]; then
    break
  fi
done

deploy_count=${#old_deploy_ids[@]}
echo "  Environments: ${environments:-none}"
echo "  Keeping:      ${#keep_ids[@]} (latest per environment)"
echo "  Old to clean: $deploy_count"

if [ "$deploy_count" -eq 0 ]; then
  echo "  Nothing to delete."
elif $DRY_RUN; then
  echo "  Would delete $deploy_count deployments."
else
  echo ""
  read -p "  Delete $deploy_count old deployments? (y/N): " confirm
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    for id in "${old_deploy_ids[@]}"; do
      # Must mark inactive before deletion
      gh api -X POST "repos/$REPO/deployments/$id/statuses" \
        -f state=inactive --silent 2>/dev/null || true
      gh api -X DELETE "repos/$REPO/deployments/$id" --silent 2>/dev/null && \
        deleted_deployments=$((deleted_deployments + 1)) || true
    done
    echo "  Deleted $deleted_deployments deployments."
  else
    echo "  Skipped."
  fi
fi
echo ""

# ══════════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════════
echo "=========================================="
echo "     CLEANUP SUMMARY"
echo "=========================================="
if $DRY_RUN; then
  echo "  (DRY RUN — nothing was deleted)"
  echo ""
  echo "  Would delete:"
  echo "    Workflow runs:  $old_count"
  echo "    Caches:         $cache_count (~${cache_size} MB)"
  echo "    Deployments:    $deploy_count"
  echo ""
  echo "  Run without --dry-run to apply."
else
  echo "  Workflow runs deleted:  $deleted_runs"
  echo "  Caches deleted:         $deleted_caches"
  echo "  Deployments deleted:    $deleted_deployments"
fi
echo "=========================================="
