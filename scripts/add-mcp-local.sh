#!/bin/sh
set -e
CLAUDE_CMD=""
if command -v claude >/dev/null 2>&1; then
    CLAUDE_CMD="claude"
elif [ -x "$HOME/.claude/local/claude" ]; then
    CLAUDE_CMD="$HOME/.claude/local/claude"
elif [ -x "$HOME/.local/bin/claude" ]; then
    CLAUDE_CMD="$HOME/.local/bin/claude" 
elif [ -x "/usr/local/bin/claude" ]; then
    CLAUDE_CMD="/usr/local/bin/claude"
fi
[ -z "$CLAUDE_CMD" ] && { echo "Error: claude command not found"; exit 1; }
echo "Installing MCP servers to local scope..."
$CLAUDE_CMD mcp add --scope local sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
$CLAUDE_CMD mcp add --scope local --transport http context7 https://mcp.context7.com/mcp
$CLAUDE_CMD mcp add --scope local --transport sse atlassian https://mcp.atlassian.com/v1/sse
$CLAUDE_CMD mcp add --scope local supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token <personal-access-token>
echo "Done! All 4 MCP servers installed to local scope."