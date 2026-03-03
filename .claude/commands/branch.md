---
description: Create a new feature branch with optimized short naming
---

# Branch Creation Command

Creates a new feature branch with optimized short naming following the pattern: `{type}/{number}-{word1}-{word2}`

## Usage

- `/branch <feature_description>` - Create a new feature branch

## Examples

```bash
/branch add newsletter signup
# Creates: feat/003-newsletter-signup

/branch fix authentication bug
# Creates: fix/004-authentication-bug

/branch refactor content planner agent
# Creates: refactor/005-content-planner

/branch update design system colors
# Creates: feat/006-design-system

/branch remove deprecated api endpoints
# Creates: chore/007-deprecated-api
```

## Commit Type Auto-Detection

The command automatically detects the commit type from your description:

- **feat**: add, create, implement, new, update, improve, enhance, optimize
- **fix**: fix, bug, resolve, correct, repair
- **refactor**: refactor, rename, reorganize, restructure, rewrite
- **chore**: remove, delete, clean, cleanup
- **docs**: docs, document, documentation

If no keyword is detected, defaults to `feat`.

## Branch Name Format

- **Pattern**: `{type}/{number}-{word1}-{word2}`
- **Number**: Auto-incremented based on existing features in `plan/specs/`
- **Words**: First 2 meaningful words after removing commit type keywords

## What It Does

1. Auto-detects commit type from feature description
2. Removes commit type keywords from name
3. Extracts 2 descriptive words
4. Finds next feature number
5. Creates branch with format: `{type}/{number}-{word1}-{word2}`
6. Creates feature directory in `plan/specs/`

## Important Notes

- Branch names are **shorter and more readable** than specify kit defaults
- Compatible with existing `/commit` and `/create-pr` workflows
- Feature numbering is shared with specify kit (`plan/specs/` directory)
- Follows conventional commits standard

## Implementation

Execute the branch creation script:

```bash
!.claude/scripts/create-branch.sh $ARGUMENTS
```
