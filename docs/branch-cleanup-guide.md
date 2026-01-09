# Branch Cleanup Guide

A reference guide and automation scripts for purging unused and obsolete git branches.

## Current Branch Status (Snapshot)

| Metric | Count |
|--------|-------|
| Total branches (local + remote) | 89 |
| Merged into main | 56 |
| Oldest branches | 6 months (cicd_v1, copilot/*, codereview) |

## Cleanup Criteria

This guide uses a **moderate cleanup strategy**:

1. **Safe to delete**: All branches already merged into `main`
2. **Review candidates**: Unmerged branches with no commits in 3+ months
3. **Preserve**: Active development branches with recent commits

---

## Quick Reference Commands

### View Branch Status

```bash
# List all branches (local + remote)
git branch -a

# Count total branches
git branch -a | wc -l

# List branches merged into main (safe to delete)
git branch --merged main

# List branches NOT merged into main (review before deleting)
git branch --no-merged main

# List branches by last commit date (oldest first)
git for-each-ref --sort=committerdate --format='%(refname:short) %(committerdate:relative)' refs/heads/

# List remote branches by last commit date
git for-each-ref --sort=committerdate --format='%(refname:short) %(committerdate:relative)' refs/remotes/origin/
```

### Delete Branches

```bash
# Delete a local branch (safe - prevents deleting unmerged)
git branch -d <branch-name>

# Force delete a local branch (use with caution)
git branch -D <branch-name>

# Delete a remote branch
git push origin --delete <branch-name>

# Prune stale remote-tracking references
git fetch --prune
```

---

## Automated Cleanup Scripts

### Script 1: List Candidates for Deletion

Save as `scripts/list-stale-branches.sh`:

```bash
#!/bin/bash
# Lists branches that are candidates for deletion
# Usage: ./scripts/list-stale-branches.sh

echo "=== BRANCHES MERGED INTO MAIN (Safe to delete) ==="
git branch --merged main | grep -v "^\*" | grep -v "main" | while read branch; do
  echo "  $branch"
done

echo ""
echo "=== BRANCHES WITH NO ACTIVITY IN 3+ MONTHS ==="
threshold=$(date -v-3m +%s 2>/dev/null || date -d "3 months ago" +%s)

git for-each-ref --sort=committerdate --format='%(refname:short) %(committerdate:unix) %(committerdate:relative)' refs/heads/ | while read branch timestamp relative; do
  if [ "$branch" != "main" ] && [ "$timestamp" -lt "$threshold" ]; then
    merged=$(git branch --merged main | grep -w "$branch" | wc -l)
    if [ "$merged" -eq 0 ]; then
      echo "  $branch ($relative) [UNMERGED - review before delete]"
    fi
  fi
done
```

### Script 2: Delete Merged Local Branches

Save as `scripts/cleanup-merged-local.sh`:

```bash
#!/bin/bash
# Deletes all local branches that have been merged into main
# Usage: ./scripts/cleanup-merged-local.sh [--dry-run]

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
  echo "DRY RUN MODE - No branches will be deleted"
  echo ""
fi

echo "Deleting local branches merged into main..."

git branch --merged main | grep -v "^\*" | grep -v "main" | while read branch; do
  if [ "$DRY_RUN" = true ]; then
    echo "  Would delete: $branch"
  else
    echo "  Deleting: $branch"
    git branch -d "$branch"
  fi
done

echo ""
echo "Done!"
```

### Script 3: Delete Merged Remote Branches

Save as `scripts/cleanup-merged-remote.sh`:

```bash
#!/bin/bash
# Deletes all remote branches that have been merged into main
# Usage: ./scripts/cleanup-merged-remote.sh [--dry-run]

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
  echo "DRY RUN MODE - No branches will be deleted"
  echo ""
fi

echo "Fetching latest remote state..."
git fetch --prune

echo ""
echo "Finding remote branches merged into origin/main..."

git branch -r --merged origin/main | grep -v "origin/main" | grep -v "origin/HEAD" | while read branch; do
  local_name=${branch#origin/}
  if [ "$DRY_RUN" = true ]; then
    echo "  Would delete: $local_name (remote)"
  else
    echo "  Deleting: $local_name (remote)"
    git push origin --delete "$local_name"
  fi
done

echo ""
echo "Done!"
```

### Script 4: Full Cleanup (Interactive)

Save as `scripts/cleanup-branches.sh`:

```bash
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
merged_local=$(git branch --merged main | grep -v main | wc -l | tr -d ' ')
merged_remote=$(git branch -r --merged origin/main | grep -v main | grep -v HEAD | wc -l | tr -d ' ')

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
threshold=$(date -v-3m +%s 2>/dev/null || date -d "3 months ago" +%s)
stale_count=0

git for-each-ref --sort=committerdate --format='%(refname:short) %(committerdate:unix) %(committerdate:relative)' refs/heads/ | while read branch timestamp relative; do
  if [ "$branch" != "main" ] && [ "$timestamp" -lt "$threshold" ]; then
    merged=$(git branch --merged main | grep -w "$branch" | wc -l)
    if [ "$merged" -eq 0 ]; then
      echo "  $branch ($relative)"
      stale_count=$((stale_count + 1))
    fi
  fi
done

echo ""
echo "Review these branches manually and delete with:"
echo "  git branch -D <branch-name>           # local"
echo "  git push origin --delete <branch-name> # remote"
echo ""

echo "=========================================="
echo "       CLEANUP COMPLETE"
echo "=========================================="
```

---

## Execution Plan

### Phase 1: Audit (No Changes)

```bash
# Run the listing script to see what will be affected
./scripts/list-stale-branches.sh > branch-audit.txt

# Or manually:
git branch --merged main | grep -v main
git for-each-ref --sort=committerdate --format='%(refname:short) %(committerdate:relative)' refs/heads/ | head -30
```

### Phase 2: Delete Merged Branches

```bash
# Dry run first
./scripts/cleanup-merged-local.sh --dry-run
./scripts/cleanup-merged-remote.sh --dry-run

# Execute
./scripts/cleanup-merged-local.sh
./scripts/cleanup-merged-remote.sh
```

### Phase 3: Review Stale Unmerged Branches

For each stale unmerged branch, decide:
- **Delete**: `git branch -D <name> && git push origin --delete <name>`
- **Keep**: Document why in this section
- **Archive**: Create a tag before deleting: `git tag archive/<name> <name>`

---

## Branches to Review

Based on current analysis, these branches need manual review:

### Merged (Safe to Delete)

| Branch | Status | Action |
|--------|--------|--------|
| `001-let-s-refactor` | Merged | Delete |
| `001-modular-architecture` | Merged | Delete |
| `002-refactor-act-workflows` | Merged | Delete |
| `006-newsletter-subscription` | Merged | Delete |
| `cicd_v1`, `cicd_v2` | Merged, 6 months old | Delete |
| `copilot/*` | Merged, 6 months old | Delete |
| `darkmode-v*` | Merged, 5 months old | Delete |

### Stale Unmerged (Manual Review)

| Branch | Last Activity | Notes |
|--------|---------------|-------|
| `backup/testing-infrastructure-*` | Review | May contain important snapshots |
| `feature/*` | 5+ weeks | Check if work is abandoned |

---

## Maintenance Schedule

To prevent branch buildup, consider:

1. **After each PR merge**: Delete the feature branch (GitHub can do this automatically)
2. **Monthly**: Run `./scripts/list-stale-branches.sh` to identify cleanup candidates
3. **Quarterly**: Full cleanup using the interactive script

### Enable Auto-Delete in GitHub

Go to **Repository Settings > General > Pull Requests** and enable:
- [x] Automatically delete head branches

---

## Recovery

If a branch is accidentally deleted:

```bash
# Find the commit SHA from reflog
git reflog

# Recreate the branch
git checkout -b <branch-name> <commit-sha>

# Push to remote if needed
git push -u origin <branch-name>
```

For recently deleted remote branches, GitHub retains them briefly. Check the repository's "Branches" page for restore options.
