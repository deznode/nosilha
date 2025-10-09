---
description: Context-aware Git commit assistant for Nos Ilha project
---

# Commit Command

You are a context-aware Git commit assistant for the Nos Ilha project with the following structure:
- **Root repository**: Main Nos Ilha codebase (backend, frontend, infrastructure, docs)
- **Plan submodule**: `plan/` directory (planning documents and specifications)

## Usage

- `/commit` - Interactive mode (auto-detect changes across repositories)
- `/commit <scope>` - Direct commit to specific repository
- `/commit --no-verify` - Skip pre-commit checks
- `/commit --full-verify` - Run full build before committing
- `/commit <scope> --no-verify` - Combine scope + flag

### Valid Scopes

**Root**: Main Nos Ilha repository containing:
- `backend/` - Spring Boot + Kotlin API
- `frontend/` - Next.js 15 + React 19 application
- `infrastructure/` - Terraform and Docker configurations
- `docs/` - Project documentation

**Plan**: Planning submodule (`plan/`) containing feature specifications and research documents

## Examples

```bash
/commit
# Interactive selection from all repositories with changes

/commit root
# Direct commit to root repository

/commit plan
# Direct commit to plan submodule

/commit --no-verify
# Interactive selection, skip all checks

/commit root --full-verify
# Commit to root with full build verification (backend + frontend)
```

## Workflow

The commit command will execute the following steps:

1. **Parse arguments** - Determine scope and flags from `$ARGUMENTS`

2. **Detect/select repository**:
   - If scope provided: Use that repository
   - If no scope: Detect all repositories with changes
   - If only one has changes: Auto-select it
   - If both have changes: Present interactive selection

3. **Validate branch** - Check branch protection (hard block on `main`)

4. **Run pre-commit checks** - Execute appropriate checks based on scope and flags:
   - **Root**: Smart detection based on changed files
     - Kotlin files (`.kt`) → `./gradlew detekt` (backend linting)
     - TypeScript files (`.ts`/`.tsx`) → `npx tsc --noEmit` (frontend type-check)
     - Both → run both checks
   - **Plan**: Skip all checks (documentation only)
   - **--no-verify**: Skip all checks
   - **--full-verify**: Run full builds (backend: `./gradlew build test`, frontend: `npm run build`)

5. **Stage files** - Stage all changes (or use already staged files)

6. **Suggest commit message** - Generate conventional commit message:
   - Format: `<emoji> <type>(<scope>): <description>`
   - Types: feat, fix, refactor, perf, docs, style, test, build, ci, chore
   - Scope auto-detection for root (backend/frontend/infra/docs/core)
   - Ask for approval: [y/n/edit]

7. **Create commit** - Execute git commit with approved message

8. **Show summary** - Display commit info and next steps

## Implementation

Execute the commit workflow script:

```bash
!.claude/scripts/commit.sh $ARGUMENTS
```

The script handles all workflow logic including:
- Path resolution (works from any directory in the project)
- Repository change detection
- Interactive selection with file counts
- Branch protection enforcement
- Smart pre-commit checks based on file types
- Intelligent commit message generation
- Post-commit summary with submodule reminders

## Smart Pre-commit Checks

For the **root** repository, checks are run based on detected file types:

- **Kotlin files detected** (`.kt`):
  ```bash
  cd backend && ./gradlew detekt
  ```
  Runs Kotlin static analysis and linting (~10-30 seconds)

- **TypeScript files detected** (`.ts`/`.tsx`):
  ```bash
  cd frontend && npx tsc --noEmit
  ```
  Runs TypeScript type checking (~5-15 seconds)

- **Both detected**: Runs both checks sequentially

- **Full verification** (`--full-verify`):
  ```bash
  cd backend && ./gradlew build test
  cd frontend && npm run build
  ```
  Full builds with tests (~2-4 minutes)

For the **plan** submodule, all checks are skipped (documentation only).

## Repository Structure

### Root Repository
Main Nos Ilha project containing:
- **Backend**: Spring Boot 3.4.7 + Kotlin, PostgreSQL, JWT auth
- **Frontend**: Next.js 15 + React 19, TypeScript, Tailwind CSS
- **Infrastructure**: Terraform (GCP), Docker Compose (local dev)
- **Docs**: Architecture, API reference, design system

### Plan Submodule
Feature specifications, research documents, and implementation plans stored as a Git submodule.

## Important Notes

1. **Path Resolution** - The command works from any directory in the project
2. **Submodule Independence** - Commits to plan submodule only affect that submodule
3. **Root Repo Tracking** - After committing to plan, the root repo shows plan/ as modified
4. **Protected Branches** - main branch is hard-blocked (no exceptions)
5. **No Claude Footer** - Commit messages never include Claude Code footer
6. **Absolute Paths** - All git operations use absolute paths
7. **Error Handling** - Clear error messages with actionable suggestions
8. **Smart Detection** - Only runs checks relevant to changed files

## Guidelines

- **ALWAYS resolve paths first** - Never assume current working directory
- **Check branch protection** - Hard block on main
- **Encourage atomic commits** - One logical change per commit
- **Follow conventional commits** - Use emoji + type(scope): description format
- **Be helpful** - Guide users through the process
- **Respect flags** - Honor --no-verify and --full-verify choices
- **Context awareness** - Remember this is a single repo + one submodule
- **Graceful errors** - Provide clear error messages and suggestions
