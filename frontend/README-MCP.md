# Playwright MCP Server Integration

This document explains how to use the official Microsoft Playwright MCP server with the Nos Ilha tourism platform for automated browser testing and interaction.

## Overview

The `@playwright/mcp` integration provides browser automation capabilities through the Model Context Protocol (MCP), allowing AI assistants and other MCP clients to:

- Navigate and interact with the Nos Ilha website
- Test tourism platform functionality (directory, map, towns)
- Automate browser tasks for development and QA
- Generate PDFs and screenshots
- Perform accessibility testing

## Prerequisites

- Node.js 18+ installed
- `@playwright/mcp` installed globally (you mentioned you have this)
- A compatible MCP client (VS Code, Claude Desktop, Claude Code, Cursor, etc.)

## Configuration Files

### Project Structure

```
nos-ilha/                               # Multi-language project root
├── .mcp.json                          # MCP client configuration (project root)
├── frontend/                          # Next.js frontend
│   ├── .mcp/server-config.json       # Playwright MCP server config
│   ├── package.json                  # Frontend dependencies & scripts
│   └── ...                           # Frontend files
├── backend/                           # Spring Boot backend
│   ├── build.gradle.kts              # Backend dependencies & scripts
│   └── ...                           # Backend files
└── infrastructure/                    # Terraform & Docker configs
```

### Server Configuration (`frontend/.mcp/server-config.json`)

The server configuration defines how Playwright MCP runs:

```json
{
  "browser": {
    "browserName": "chromium",
    "headless": false,
    "launchOptions": {
      "channel": "chrome"
    },
    "contextOptions": {
      "viewport": { "width": 1280, "height": 720 },
      "ignoreHTTPSErrors": true
    }
  },
  "capabilities": ["tabs", "vision", "pdf"],
  "outputDir": "./playwright-mcp-output"
}
```

### Client Configuration (`.mcp.json` - Project Root)

Configuration for Claude Code and other MCP clients:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--config",
        "frontend/.mcp/server-config.json"
      ]
    }
  }
}
```

## Usage

### Starting the MCP Server

**From the frontend directory** (`/Users/jcosta/Projects/nosilha/frontend`):

```bash
# Start with visual browser (for development)
npm run mcp:server

# Start headless (for CI/CD)
npm run mcp:server:headless

# Start with HTTP endpoint on port 8931
npm run mcp:server:port
```

**Direct command from anywhere**:

```bash
# From project root
npx @playwright/mcp@latest --config frontend/.mcp/server-config.json

# From frontend directory
npx @playwright/mcp@latest --config .mcp/server-config.json
```

### Available Scripts

| Script                | Description                            |
| --------------------- | -------------------------------------- |
| `mcp:server`          | Start Playwright MCP with GUI browser  |
| `mcp:server:headless` | Start Playwright MCP in headless mode  |
| `mcp:server:port`     | Start with HTTP transport on port 8931 |

## MCP Client Setup

### VS Code Integration

1. Install the MCP extension for VS Code
2. Add to VS Code settings or use the MCP install button:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--config", ".mcp/server-config.json"]
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add playwright npx @playwright/mcp@latest --config .mcp/server-config.json
```

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--config", ".mcp/server-config.json"]
    }
  }
}
```

### Cursor IDE

Use the MCP install button or add to Cursor settings:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--config", ".mcp/server-config.json"]
    }
  }
}
```

## Common Use Cases for Nos Ilha

### 1. Testing Tourism Directory

Ask your MCP client to:

- "Navigate to localhost:3000/directory/restaurants and test the filtering"
- "Check if the interactive map loads correctly on /map"
- "Test the mobile navigation menu"

### 2. Content Verification

- "Take a screenshot of the homepage hero section"
- "Verify all town pages load without errors"
- "Check accessibility of the photo gallery"

### 3. Development Assistance

- "Fill out the add entry form with test data"
- "Test the login flow and take screenshots"
- "Generate a PDF of the about page"

### 4. Performance Testing

- "Measure page load times for the directory"
- "Check Core Web Vitals for mobile devices"
- "Test map performance with different viewport sizes"

## Advanced Configuration

### Custom Browser Settings

Modify `.mcp/server-config.json` for specific needs:

```json
{
  "browser": {
    "browserName": "firefox",
    "launchOptions": {
      "slowMo": 100,
      "devtools": true
    },
    "contextOptions": {
      "locale": "pt-CV",
      "colorScheme": "dark"
    }
  }
}
```

### Network Controls

Restrict or allow specific domains:

```json
{
  "network": {
    "allowedOrigins": ["http://localhost:3000", "https://*.nosilha.com"],
    "blockedOrigins": ["https://*.ads.com"]
  }
}
```

### Output Management

Control where files are saved:

```json
{
  "outputDir": "./mcp-results",
  "imageResponses": "omit"
}
```

## Environment Variables

Add to `.env.local`:

```bash
# Playwright MCP Configuration
PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers
MCP_SERVER_PORT=8931
MCP_HEADLESS=false
```

## Troubleshooting

### Common Issues

1. **Browser not found**

   ```bash
   npx playwright install chromium
   ```

2. **Port already in use**

   ```bash
   # Change port in server config or kill existing process
   lsof -ti:8931 | xargs kill -9
   ```

3. **Permission denied**
   ```bash
   # Ensure proper permissions for output directory
   chmod 755 playwright-mcp-output
   ```

### Debug Mode

Start with debug logging:

```bash
DEBUG=pw:api npm run mcp:server
```

### Health Check

Test the MCP server:

```bash
curl http://localhost:8931/health
```

## Integration with Existing Tests

The MCP server complements your existing Playwright test suite:

- **Existing tests** (`tests/shared/`, `tests/api/`): Automated test execution
- **MCP integration**: Interactive testing and development assistance
- **Both**: Comprehensive coverage for the Nos Ilha platform

## Security Considerations

- The MCP server runs with browser privileges
- Only allow trusted origins in `allowedOrigins`
- Use headless mode in production environments
- Monitor the `playwright-mcp-output` directory for sensitive data

## Performance Tips

- Use `headless: true` for faster automation
- Set appropriate viewport sizes for mobile testing
- Use `isolated: true` to prevent profile persistence
- Configure output directory cleanup for long-running sessions

## Support

- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Playwright Documentation](https://playwright.dev/)

The Playwright MCP server is now configured and ready to enhance your development workflow with the Nos Ilha tourism platform!
