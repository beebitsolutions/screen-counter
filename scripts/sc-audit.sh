#!/usr/bin/env bash
#
# sc-audit.sh — Run a full screen-counter audit on any project.
#
# Usage:
#   bash scripts/sc-audit.sh <project-path> [output-dir]
#   pnpm sc:audit <project-path> [output-dir]
#
# Produces:
#   - Summary (count of routes / modals / disabled) printed to stdout
#   - List of routes with their canonical URL
#   - List of detected modals with the signals each one fired
#   - List of files with modal-like names NOT detected (false-negative candidates)
#   - Verbose output saved to <output-dir>/verbose.txt
#   - Structured JSON saved to <output-dir>/result.json

set -euo pipefail

PROJECT_PATH="${1:-}"
OUT_DIR="${2:-/tmp/sc-audit}"

if [ -z "$PROJECT_PATH" ]; then
  echo "Usage: $0 <project-path> [output-dir]" >&2
  exit 2
fi

if [ ! -d "$PROJECT_PATH" ]; then
  echo "Error: project path does not exist: $PROJECT_PATH" >&2
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required. Install with: sudo apt install jq" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI="node $REPO_ROOT/packages/screen-counter/dist/cli.js"

if [ ! -f "$REPO_ROOT/packages/screen-counter/dist/cli.js" ]; then
  echo "Error: CLI bundle not found. Run 'pnpm build' from the workspace root first." >&2
  exit 2
fi

mkdir -p "$OUT_DIR"

# Resolve absolute project path for stable diffing later
PROJECT_PATH_ABS="$(cd "$PROJECT_PATH" && pwd)"

echo "=== screen-counter audit ==="
echo "Project: $PROJECT_PATH_ABS"
echo "Output:  $OUT_DIR"
echo

# 1. Headline
$CLI "$PROJECT_PATH_ABS"
echo

# 2. Save full reports
$CLI "$PROJECT_PATH_ABS" --verbose > "$OUT_DIR/verbose.txt"
$CLI "$PROJECT_PATH_ABS" --json --out "$OUT_DIR/result.json" > /dev/null

ROUTES_COUNT=$(jq '.routes | length' "$OUT_DIR/result.json")
MODALS_COUNT=$(jq '.modals | length' "$OUT_DIR/result.json")
DISABLED_COUNT=$(jq '.disabled | length' "$OUT_DIR/result.json")

# 3. Routes
echo "=== Routes ($ROUTES_COUNT) ==="
if [ "$ROUTES_COUNT" -gt 0 ]; then
  jq -r '.routes[] | "\(.path)  →  \(.route)"' "$OUT_DIR/result.json" | sort
else
  echo "(none)"
fi
echo

# 4. Detected modals
echo "=== Detected modals ($MODALS_COUNT) ==="
if [ "$MODALS_COUNT" -gt 0 ]; then
  jq -r '.modals[] | "\(.path)  [\(.signals | map(.rule) | join(", "))]"' "$OUT_DIR/result.json" | sort
else
  echo "(none)"
fi
echo

# 5. Disabled
if [ "$DISABLED_COUNT" -gt 0 ]; then
  echo "=== Disabled / manually excluded ($DISABLED_COUNT) ==="
  jq -r '.disabled[].path' "$OUT_DIR/result.json" | sort
  echo
fi

# 6. False negative candidates
echo "=== Modal-name candidates NOT detected (potential false negatives) ==="

TMP_CANDIDATES=$(mktemp)
TMP_DETECTED=$(mktemp)

find "$PROJECT_PATH_ABS" -type f \( -name "*.tsx" -o -name "*.jsx" \) \
  \( -iname "*dialog*" -o -iname "*modal*" -o -iname "*drawer*" \
     -o -iname "*sheet*" -o -iname "*popup*" -o -iname "*lightbox*" \
     -o -iname "*overlay*" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/coverage/*" 2>/dev/null \
  | sed "s|^$PROJECT_PATH_ABS/||" \
  | sort > "$TMP_CANDIDATES"

jq -r '.modals[].path' "$OUT_DIR/result.json" | sort > "$TMP_DETECTED"

# Diff: candidates that are NOT in detected
MISSED=$(comm -23 "$TMP_CANDIDATES" "$TMP_DETECTED" || true)

if [ -z "$MISSED" ]; then
  echo "(none — every file with a modal-like name was detected)"
else
  echo "$MISSED"
  MISSED_COUNT=$(echo "$MISSED" | grep -c '' || true)
  echo
  echo "Total missed: $MISSED_COUNT (file names suggest they are modals but no heuristic fired)"
fi

rm -f "$TMP_CANDIDATES" "$TMP_DETECTED"

# 7. Footer
echo
echo "=== Reports saved ==="
echo "  $OUT_DIR/verbose.txt   — full --verbose output"
echo "  $OUT_DIR/result.json   — structured JSON (jq-friendly)"
echo
echo "Next:"
echo "  cat $OUT_DIR/verbose.txt | less"
echo "  jq '.modals[] | select(.signals | length > 1)' $OUT_DIR/result.json"
