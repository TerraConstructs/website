#!/usr/bin/env bash
# Build script with critical CSS generation using available Chrome installation
set -euo pipefail

# Try to find Chrome in order of preference
find_chrome() {
  # 1. Check Puppeteer cache (global installation)
  local puppeteer_chrome
  puppeteer_chrome=$(find ~/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome 2>/dev/null | head -n1 || true)
  if [[ -n "$puppeteer_chrome" && -x "$puppeteer_chrome" ]]; then
    echo "$puppeteer_chrome"
    return 0
  fi

  # 2. Check common system Chrome paths
  local system_paths=(
    "/usr/bin/google-chrome"
    "/usr/bin/chromium-browser"
    "/usr/bin/chromium"
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  )

  for chrome_path in "${system_paths[@]}"; do
    if [[ -x "$chrome_path" ]]; then
      echo "$chrome_path"
      return 0
    fi
  done

  return 1
}

# Find Chrome
CHROME_PATH=$(find_chrome)

if [[ -z "$CHROME_PATH" ]]; then
  echo "❌ Error: Chrome/Chromium not found!"
  echo ""
  echo "Please install Chrome using one of these methods:"
  echo "  1. Global Puppeteer: npm install -g puppeteer"
  echo "  2. System Chrome:    sudo apt install chromium-browser"
  echo "  3. System Chrome:    brew install chromium"
  echo ""
  exit 1
fi

echo "✓ Using Chrome at: $CHROME_PATH"
echo ""

# Run build with Chrome path
export PUPPETEER_EXECUTABLE_PATH="$CHROME_PATH"
pnpm run build
