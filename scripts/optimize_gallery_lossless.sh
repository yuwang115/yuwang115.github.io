#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/optimize_gallery_lossless.sh [--dry-run] [--workers N] [--target PATH]

Options:
  --dry-run, -n      Show potential savings only (do not modify files).
  --workers, -w N    Number of parallel workers for jpegoptim (default: 8).
  --target, -t PATH  Gallery directory to process (default: content/gallery).
  --help, -h         Show this help.
EOF
}

if ! command -v jpegoptim >/dev/null 2>&1; then
  echo "jpegoptim is required. Install it first: brew install jpegoptim" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$ROOT_DIR/content/gallery"
WORKERS=8
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run|-n)
      DRY_RUN=1
      ;;
    --workers|-w)
      shift
      WORKERS="${1:-}"
      if [[ -z "$WORKERS" ]]; then
        echo "Missing value for --workers" >&2
        exit 1
      fi
      ;;
    --target|-t)
      shift
      TARGET="${1:-}"
      if [[ -z "$TARGET" ]]; then
        echo "Missing value for --target" >&2
        exit 1
      fi
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

if [[ ! -d "$TARGET" ]]; then
  echo "Target directory does not exist: $TARGET" >&2
  exit 1
fi

file_count="$(find "$TARGET" -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) | wc -l | tr -d '[:space:]')"

if [[ "$file_count" -eq 0 ]]; then
  echo "No JPG/JPEG files found in: $TARGET"
  exit 0
fi

flags=(--strip-all --all-progressive --workers="$WORKERS" --totals)
if [[ "$DRY_RUN" -eq 1 ]]; then
  flags+=(--noaction)
fi

before_kb="$(du -sk "$TARGET" | awk '{print $1}')"

find "$TARGET" -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) -print0 | xargs -0 jpegoptim "${flags[@]}"

after_kb="$(du -sk "$TARGET" | awk '{print $1}')"

before_mb="$(awk -v kb="$before_kb" 'BEGIN { printf "%.2f", kb/1024 }')"
after_mb="$(awk -v kb="$after_kb" 'BEGIN { printf "%.2f", kb/1024 }')"
saved_mb="$(awk -v b="$before_kb" -v a="$after_kb" 'BEGIN { printf "%.2f", (b-a)/1024 }')"

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "Dry run complete. Current size remains ${after_mb} MB."
else
  echo "Done. ${file_count} files processed."
  echo "Size: ${before_mb} MB -> ${after_mb} MB (saved ${saved_mb} MB)."
fi
