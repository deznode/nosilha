# Shared Libraries

This directory contains shared libraries and packages for the Nos Ilha monorepo. These packages are consumed by applications in the `apps/` directory.

## Structure

```
libs/
├── shared/          # Shared utilities, types, and components
│   └── .gitkeep
└── README.md        # This file
```

## Purpose

- **Code Reuse**: Share common functionality across frontend and backend applications
- **Type Safety**: Centralized type definitions for API contracts
- **Consistency**: Enforce consistent patterns across the monorepo

## Directory Organization

### `libs/shared/`
Shared packages and utilities:
- Common types and interfaces
- Utility functions
- Shared UI components (if applicable)
- API client libraries

## pnpm Workspace Integration

This directory is managed as part of the monorepo workspace defined in `pnpm-workspace.yaml`. Packages in this directory can be referenced from `apps/` and other `libs/` packages using workspace protocols.

## Future Packages

Additional library packages can be created as needed:
- `libs/api-types/` - Shared API types and contracts
- `libs/ui-components/` - Shared component libraries
- `libs/utils/` - Common utility functions
- `libs/validation/` - Shared validation schemas
