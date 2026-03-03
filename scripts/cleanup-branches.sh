#!/bin/bash
# Interactive branch cleanup script
# Usage: ./scripts/cleanup-branches.sh

set -e

echo "=========================================="
echo "       BRANCH CLEANUP UTILITY"
echo "=========================================="
echo ""

# Fetch latest
echo "Fetching latest remote state..."
git fetch --prune
echo ""

# Count branches
total_local=$(git branch | wc -l | tr -d ' ')
total_remote=$(git branch -r | grep -v HEAD | wc -l | tr -d ' ')
merged_local=$(git branch --merged main | grep -v "main" | grep -v "^\*" | wc -l | tr -d ' ')
merged_remote=$(git branch -r --merged origin/main | grep -v "origin/main" | grep -v "origin/HEAD" | wc -l | tr -d ' ')

echo "Current branch status:"
echo "  Local branches:  $total_local ($merged_local merged into main)"
echo "  Remote branches: $total_remote ($merged_remote merged into main)"
echo ""

# Step 1: Local merged branches
echo "=== STEP 1: Local Merged Branches ==="
if [ "$merged_local" -gt 0 ]; then
  echo "The following local branches are merged into main:"
  git branch --merged main | grep -v "^\*" | grep -v "main"
  echo ""
  read -p "Delete these $merged_local local branches? (y/N): " confirm
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    git branch --merged main | grep -v "^\*" | grep -v "main" | xargs -r git branch -d
    echo "Local merged branches deleted."
  else
    echo "Skipped."
  fi
else
  echo "No local merged branches to delete."
fi
echo ""

# Step 2: Remote merged branches
echo "=== STEP 2: Remote Merged Branches ==="
if [ "$merged_remote" -gt 0 ]; then
  echo "The following remote branches are merged into origin/main:"
  git branch -r --merged origin/main | grep -v "origin/main" | grep -v "origin/HEAD"
  echo ""
  read -p "Delete these $merged_remote remote branches? (y/N): " confirm
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    git branch -r --merged origin/main | grep -v "origin/main" | grep -v "origin/HEAD" | sed 's/origin\///' | xargs -I {} git push origin --delete {}
    echo "Remote merged branches deleted."
  else
    echo "Skipped."
  fi
else
  echo "No remote merged branches to delete."
fi
echo ""

# Step 3: Stale unmerged branches
echo "=== STEP 3: Stale Unmerged Branches (3+ months old) ==="
echo "The following unmerged branches have no recent activity:"

# macOS compatible date calculation
if [[ "$OSTYPE" == "darwin"* ]]; then
  threshold=$(date -v-3m +%s)
else
  threshold=$(date -d "3 months ago" +%s)
fi

stale_branches=""
while IFS= read -r line; do
  branch=$(echo "$line" | awk '{print $1}')
  timestamp=$(echo "$line" | awk '{print $2}')
  relative=$(echo "$line" | cut -d' ' -f3-)

  if [ "$branch" != "main" ] && [ -n "$timestamp" ] && [ "$timestamp" -lt "$threshold" ] 2>/dev/null; then
    merged=$(git branch --merged main | grep -w "$branch" | wc -l | tr -d ' ')
    if [ "$merged" -eq 0 ]; then
      echo "  $branch ($relative)"
      stale_branches="$stale_branches $branch"
    fi
  fi
done < <(git for-each-ref --sort=committerdate --format='%(refname:short) %(committerdate:unix) %(committerdate:relative)' refs/heads/)

echo ""
if [ -n "$stale_branches" ]; then
  echo "Review these branches manually and delete with:"
  echo "  git branch -D <branch-name>           # local"
  echo "  git push origin --delete <branch-name> # remote"
else
  echo "No stale unmerged branches found."
fi
echo ""

echo "=========================================="
echo "       CLEANUP COMPLETE"
echo "=========================================="
