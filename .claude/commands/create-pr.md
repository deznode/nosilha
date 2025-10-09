---
description: Context-aware GitHub Pull Request assistant for Nos Ilha project
---

# Create Pull Request Command

You are a context-aware GitHub Pull Request assistant for the Nos Ilha project with the following structure:

- **Root repository**: Main Nos Ilha codebase (backend, frontend, infrastructure, docs)
- **Plan submodule**: `plan/` directory (planning documents and specifications)

## Usage

- `/create-pr` - Auto-detect repository, create PR to main
- `/create-pr <scope>` - Create PR for specific repository
- `/create-pr --draft` - Create draft PR
- `/create-pr --base <branch>` - Specify base branch (default: main)
- `/create-pr <scope> --draft --base staging` - All options combined

### Valid Scopes

**Root**: Main Nos Ilha repository containing:
- `backend/` - Spring Boot + Kotlin API
- `frontend/` - Next.js 15 + React 19 application
- `infrastructure/` - Terraform and Docker configurations
- `docs/` - Project documentation

**Plan**: Planning submodule (`plan/`) containing feature specifications and research documents

## Examples

```bash
/create-pr
# Auto-detect current repository, PR to main, ready for review

/create-pr root
# Create PR for root repository

/create-pr plan
# Create PR for plan submodule

/create-pr --draft
# Auto-detect repo, create draft PR

/create-pr --base staging
# Auto-detect repo, PR to staging branch

/create-pr root --draft
# Draft PR for root repository

/create-pr plan --base main --draft
# Draft PR for plan submodule, targeting main
```

## Workflow

The PR creation command will execute the following steps:

1. **Parse arguments** - Extract scope, base branch, and draft flag from `$ARGUMENTS`

2. **Detect repository** (if not specified):
   - Check current working directory
   - Determine which repository context we're in
   - If in `/plan` → scope = plan
   - Otherwise → scope = root

3. **Validate branch state**:
   - Cannot create PR from protected branch (main)
   - Check for uncommitted changes (warn if present)
   - Verify commits ahead of base branch
   - If 0 commits ahead → error and exit

4. **Ensure branch is pushed**:
   - Check if current branch exists on remote
   - If not: `git push -u origin <branch>`
   - If push fails → error and exit

5. **Check for existing PR**:
   - Use `gh pr list --head <branch>` to check
   - If PR exists → show URL and exit
   - If no PR → proceed

6. **Generate PR title**:
   - Analyze commit messages between base and current branch
   - Determine primary commit type (feat, fix, refactor, etc.)
   - Extract scope from repository and commits
   - Format: `<emoji> <type>(<scope>): <description>`
   - Ask for approval: [y/n/edit]

7. **Generate PR body**:
   - Extract issue references from commits (#123, fixes #456)
   - List all commit messages
   - Include change statistics
   - Add testing checklist

8. **Create pull request**:
   - Use GitHub CLI: `gh pr create`
   - Include title, body, base branch
   - Add `--draft` flag if requested
   - Display PR URL and status

## Implementation

Execute the PR creation workflow script:

```bash
!.claude/scripts/create-pr.sh $ARGUMENTS
```

The script handles all workflow logic including:

- Repository context auto-detection
- Comprehensive branch validation
- Automatic branch pushing
- Duplicate PR prevention
- Intelligent PR title/body generation from commits
- GitHub CLI integration

## Repository Reference

### Root Repository

Main Nos Ilha project containing:
- **Backend**: Spring Boot 3.4.7 + Kotlin, PostgreSQL, JWT auth
- **Frontend**: Next.js 15 + React 19, TypeScript, Tailwind CSS
- **Infrastructure**: Terraform (GCP), Docker Compose (local dev)
- **Docs**: Architecture, API reference, design system

### Plan Submodule

Feature specifications, research documents, and implementation plans stored as a Git submodule.

## PR Title Generation

For the **root** repository, the scope is determined from commit messages:
- Contains "backend" → scope = backend
- Contains "frontend" → scope = frontend
- Contains "infra" → scope = infra
- Contains "docs" → scope = docs
- Otherwise → scope = core

For the **plan** submodule, scope is always "planning".

## Important Notes

1. **Auto-detection** - Automatically detects repository from current directory
2. **Branch Protection** - Cannot create PRs from main branch
3. **Auto-push** - Automatically pushes branch if not on remote
4. **Duplicate Prevention** - Checks for existing PR before creating new one
5. **Default is Ready** - PRs are ready for review by default (use --draft for drafts)
6. **No Claude Footer** - PR descriptions never include Claude Code footer
7. **GitHub CLI Required** - Requires `gh` CLI tool to be installed and authenticated

## Guidelines

- **Always validate branch state** before creating PR
- **Auto-push branches** if not on remote
- **Prevent duplicate PRs** by checking existing PRs first
- **Generate descriptive titles** using conventional commit format
- **Be helpful** - guide users through validation failures
- **Respect flags** - honor draft and base branch preferences
- **Context awareness** - remember this is a single repo + one submodule
- **Graceful errors** - provide clear error messages with actionable suggestions
