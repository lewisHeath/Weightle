#!/usr/bin/env bash
# Installs a standalone Node.js binary (no Homebrew/compiler needed).
set -euo pipefail

NODE_VERSION="22.16.0"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS_DIR="$ROOT/.tools"
ARCH="$(uname -m)"

case "$ARCH" in
  arm64) NODE_ARCH="arm64" ;;
  x86_64) NODE_ARCH="x64" ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

TARBALL="node-v${NODE_VERSION}-darwin-${NODE_ARCH}.tar.gz"
EXTRACTED_NAME="node-v${NODE_VERSION}-darwin-${NODE_ARCH}"
URL="https://nodejs.org/dist/v${NODE_VERSION}/${TARBALL}"
INSTALL_DIR="$TOOLS_DIR/node-v${NODE_VERSION}"

if [[ -x "$INSTALL_DIR/bin/node" ]]; then
  echo "Node already installed at $INSTALL_DIR"
  "$INSTALL_DIR/bin/node" --version
  exit 0
fi

mkdir -p "$TOOLS_DIR"
TMP="$TOOLS_DIR/$TARBALL"

echo "Downloading Node ${NODE_VERSION} (${NODE_ARCH})..."
curl -fsSL "$URL" -o "$TMP"
tar -xzf "$TMP" -C "$TOOLS_DIR"
rm "$TMP"
rm -rf "$INSTALL_DIR"
mv "$TOOLS_DIR/$EXTRACTED_NAME" "$INSTALL_DIR"

echo ""
echo "Installed: $($INSTALL_DIR/bin/node --version)"
echo ""
echo "Add to your shell (~/.zshrc):"
echo "  export PATH=\"$INSTALL_DIR/bin:\$PATH\""
echo ""
echo "Or run dev once with:"
echo "  export PATH=\"$INSTALL_DIR/bin:\$PATH\" && npm run dev"
