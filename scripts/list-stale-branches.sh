#!/bin/bash
# Lists branches that are candidates for deletion
# Usage: ./scripts/list-stale-branches.sh

echo "=== BRANCHES MERGED INTO MAIN (Safe to delete) ==="
git branch --merged main | grep -v "^\*" | grep -v "main" | while read branch; do
  echo "  $branch"
done

echo ""
echo "=== BRANCHES WITH NO ACTIVITY IN 3+ MONTHS ==="

# macOS compatible date calculation
if [[ "$OSTYPE" == "darwin"* ]]; then
  threshold=$(date -v-3m +%s)
else
  threshold=$(date -d "3 months ago" +%s)
fi

git for-each-ref --sort=committerdate --format='%(refname:short) %(committerdate:unix) %(committerdate:relative)' refs/heads/ | while IFS= read -r line; do
  branch=$(echo "$line" | awk '{print $1}')
  timestamp=$(echo "$line" | awk '{print $2}')
  relative=$(echo "$line" | cut -d' ' -f3-)

  if [ "$branch" != "main" ] && [ -n "$timestamp" ] && [ "$timestamp" -lt "$threshold" ] 2>/dev/null; then
    merged=$(git branch --merged main | grep -w "$branch" | wc -l | tr -d ' ')
    if [ "$merged" -eq 0 ]; then
      echo "  $branch ($relative) [UNMERGED - review before delete]"
    fi
  fi
done

echo ""
echo "=== SUMMARY ==="
echo "Total local branches: $(git branch | wc -l | tr -d ' ')"
echo "Merged into main: $(git branch --merged main | grep -v main | wc -l | tr -d ' ')"
