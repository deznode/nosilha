---
paths: apps/web/**
---

# Playwright MCP Server Tools

## Overview

Claude Code has access to Model Context Protocol (MCP) servers that provide browser automation capabilities. These are **not sub-agents** but rather tool servers that extend Claude Code's capabilities.

## Documentation

See `apps/web/README-MCP.md` for comprehensive setup and usage guide.

## Configuration Files

| File | Purpose |
|------|---------|
| `apps/web/.mcp/server-config.json` | Playwright MCP server configuration (headless by default) |
| `.mcp.json` | MCP client configuration for Claude Code integration |

## Available Tools

| Tool | Purpose |
|------|---------|
| `mcp__playwright__browser_navigate` | Navigate to URLs in automated browser |
| `mcp__playwright__browser_click` | Click elements on the page |
| `mcp__playwright__browser_take_screenshot` | Capture screenshots for visual testing |
| `mcp__playwright__browser_snapshot` | Get DOM snapshot for analysis |
| `mcp__playwright__browser_evaluate` | Execute JavaScript in browser context |

See `apps/web/README-MCP.md` for complete tool list.

## Common Use Cases

- Automated browser testing and interaction
- Visual testing and screenshot generation for design review
- Accessibility testing and WCAG compliance validation
- PDF generation from web pages
- Interactive development assistance with live preview
- Performance testing and Core Web Vitals monitoring

## Commands

```bash
# Start MCP server in headless mode (recommended for most tasks)
pnpm run mcp:server:headless

# Start MCP server with GUI browser (for visual debugging)
pnpm run mcp:server

# Start MCP server with HTTP transport on port 8931
pnpm run mcp:server:port
```

Configuration uses **headless mode by default** for optimal performance and resource usage.

## Example Usage

```typescript
// Navigate to a page
mcp__playwright__browser_navigate({ url: 'http://localhost:3000' })

// Take a screenshot
mcp__playwright__browser_take_screenshot({ filename: 'homepage.png' })

// Get DOM snapshot for analysis
mcp__playwright__browser_snapshot()

// Click an element
mcp__playwright__browser_click({ element: 'Submit button', ref: 'button[type="submit"]' })
```

## Reference

- See `apps/web/README-MCP.md` for complete MCP setup and usage guide
