#!/bin/bash
# Run this script from your machine to push SEO changes to GitHub.
# Usage: ./SEO/push-to-github.sh   (from repo root)  OR   bash SEO/push-to-github.sh

set -e
cd "$(dirname "$0")/.."
REPO_ROOT="$(pwd)"
LOG="$REPO_ROOT/SEO/push-result.log"

{
  echo "=== $(date) ==="
  echo "Repo root: $REPO_ROOT"
  echo ""
  echo "--- git status (before) ---"
  git status -s
  echo ""
  echo "--- git add -A ---"
  git add -A
  echo "--- git status (after add) ---"
  git status -s
  echo ""
  echo "--- git commit ---"
  git commit -m "Add SEO programmatic Astro site: dopaya-astro-seo-pages, update vercel rewrites" || echo "Commit skipped (nothing to commit or already committed)"
  echo ""
  echo "--- git push origin main ---"
  git push origin main
  echo ""
  echo "--- Done. Last commit: ---"
  git log -1 --oneline
} 2>&1 | tee "$LOG"

echo ""
echo "Full output saved to: $LOG"
