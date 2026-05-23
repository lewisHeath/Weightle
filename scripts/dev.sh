#!/usr/bin/env bash
# Run Next.js dev server using project-local Node if available.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Prefer .tools/node (see setup-local-node.sh)
for dir in "$ROOT"/.tools/node-v*/bin; do
  if [[ -x "$dir/node" ]]; then
    export PATH="$dir:$PATH"
    break
  fi
done

if ! command -v node >/dev/null 2>&1; then
  echo "No working Node found."
  echo "Run:  bash scripts/setup-local-node.sh"
  echo "Then add the printed PATH line to ~/.zshrc"
  exit 1
fi

echo "Using $(command -v node) ($(node --version))"
exec npm run dev
