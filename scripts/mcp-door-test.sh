#!/bin/zsh
# End-to-end test of the MCP door against a running dev server (npm run dev).
# Requires the real SUPABASE_SERVICE_ROLE_KEY in .env.local.
# Usage: ./scripts/mcp-door-test.sh
set -e
cd "$(dirname "$0")/.."
TOKEN=$(node scripts/get-test-token.mjs | grep '^TOKEN=' | cut -d= -f2)
BASE=${MCP_BASE:-http://localhost:3000/api/mcp/mcp}

call() {
  curl -s -X POST "$BASE" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d "$1"
  echo
}

echo "--- initialize"
call '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"door-test","version":"0.0.1"}}}'
echo "--- tools/list"
call '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
echo "--- get_setup_status"
call '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_setup_status","arguments":{}}}'
echo "--- save_foundation (voice)"
call '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"save_foundation","arguments":{"kind":"voice","content":"You write like a friendly neighborhood expert. (door test)","interview_answers":{"q1":"test answer"}}}}'
echo "--- get_foundations (should show the voice profile we just saved)"
call '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"get_foundations","arguments":{}}}'
