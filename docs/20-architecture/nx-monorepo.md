# Nx in This Monorepo

Nx has one job here: telling CI which apps a pull request touches. It does not build, test or run anything. Use [Taskfile](../../Taskfile.yml) for that (`task dev`, `task test`, `task lint`; run `task --list` for the rest).

## What Nx does

`pr-validation.yml` runs:

```bash
pnpm nx show projects --affected --base=origin/main --head=HEAD --json=false
```

and sets the `backend` / `frontend` outputs from whether `api` or `web` is in the list. Those outputs decide whether the global security scan runs and what the PR status report says.

The frontend and backend workflows do **not** depend on Nx. They use their own `dorny/paths-filter` checks.

## Configuration

| File | Purpose |
|------|---------|
| `nx.json` | `defaultBase: main` (the base branch for affected detection) |
| `apps/web/project.json` | Declares the `web` project; no targets |
| `apps/api/project.json` | Declares the `api` project; no targets |

There are no Nx plugins. The `@nx/next` plugin was removed because it loaded `apps/web/next.config.ts` only to infer targets nothing used, and failing to load that file made every Nx command exit 1.

## Commands

```bash
pnpm run graph                                            # Project graph in the browser
pnpm nx show projects --json=false                        # List projects (api, web)
pnpm nx show projects --affected --files=<path> --json=false  # Which project owns a file
pnpm nx reset                                             # Clear the Nx cache and daemon
```

Always pass `--json=false` when a script reads the output. Piped output is JSON by default (`["api","web"]`), which line-based tools such as `grep -x` will not match.

## Reference

- [ADR-0001: Nx for Polyglot Monorepo](./adr/0001-nx-monorepo.md): the original decision, from when Nx was also the task runner
- [Nx Documentation](https://nx.dev)
