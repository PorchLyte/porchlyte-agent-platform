#!/usr/bin/env bash
#
# Publish the plugin to the public marketplace repo.
#
# claude-plugin/porchlyte-ai-agent-hub/ in THIS repo is the single source of
# truth for both install paths — the downloadable zip and the marketplace.
# This script pushes it to the public marketplace repo so the two can't drift.
#
# Run after any skill/command change, alongside `npm run build:plugin-zip`:
#   npm run publish:marketplace
#
set -euo pipefail

REPO="PorchLyte/porchlyte-ai-agent-hub"
SRC="claude-plugin/porchlyte-ai-agent-hub"
DEST_SUBDIR="plugins/porchlyte-ai-agent-hub"

if [ ! -d "$SRC" ]; then
  echo "Run this from the repo root ($SRC not found)." >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Cloning $REPO..."
git clone --quiet --depth 1 "https://github.com/$REPO.git" "$TMP/repo"

rsync -a --delete --exclude '.DS_Store' "$SRC/" "$TMP/repo/$DEST_SUBDIR/"
cp LICENSE "$TMP/repo/LICENSE"

cd "$TMP/repo"
if [ -z "$(git status --porcelain)" ]; then
  echo "Marketplace already matches this repo. Nothing to publish."
  exit 0
fi

echo "Changes to publish:"
git status --short

git add -A
git commit --quiet -m "Sync plugin from porchlyte-agent-platform

Published by scripts/publish-marketplace.sh. Source of truth is
claude-plugin/porchlyte-ai-agent-hub/ in porchlyte-agent-platform.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push --quiet origin main

echo "Published to https://github.com/$REPO"
echo "Members get it via Customize > Plugins > marketplace ... > Update."
