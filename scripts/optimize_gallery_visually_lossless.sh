#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/optimize_gallery_visually_lossless.sh [options]

Options:
  --target, -t PATH        Directory to process (default: content/gallery)
  --goal, -g PERCENT       Target reduction percent, integer 1-95 (default: 50)
  --dry-run, -n            Estimate and print results only, do not write files
  --keep-exif              Preserve EXIF metadata (default strips metadata)
  --help, -h               Show this help

Notes:
  - "Visually lossless" is achieved by adaptive high-quality JPEG re-encoding.
  - The script tries these presets in order and picks the first one meeting goal:
      Q92@4500, Q90@4200, Q88@3840, Q86@3600, Q84@3200
  - If goal is not met for a file, it falls back to the smallest preset result.
EOF
}

if ! command -v sips >/dev/null 2>&1; then
  echo "sips is required but not found." >&2
  exit 1
fi

if ! command -v jpegoptim >/dev/null 2>&1; then
  echo "jpegoptim is required. Install it first: brew install jpegoptim" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$ROOT_DIR/content/gallery"
GOAL=50
DRY_RUN=0
KEEP_EXIF=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target|-t)
      shift
      TARGET="${1:-}"
      if [[ -z "$TARGET" ]]; then
        echo "Missing value for --target" >&2
        exit 1
      fi
      ;;
    --goal|-g)
      shift
      GOAL="${1:-}"
      if [[ -z "$GOAL" ]]; then
        echo "Missing value for --goal" >&2
        exit 1
      fi
      ;;
    --dry-run|-n)
      DRY_RUN=1
      ;;
    --keep-exif)
      KEEP_EXIF=1
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

if ! [[ "$GOAL" =~ ^[0-9]+$ ]]; then
  echo "--goal must be an integer between 1 and 95" >&2
  exit 1
fi

if [[ "$GOAL" -lt 1 || "$GOAL" -gt 95 ]]; then
  echo "--goal must be an integer between 1 and 95" >&2
  exit 1
fi

file_count="$(find "$TARGET" -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) | wc -l | tr -d '[:space:]')"
if [[ "$file_count" -eq 0 ]]; then
  echo "No JPG/JPEG files found in: $TARGET"
  exit 0
fi

tmp_root="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_root"
}
trap cleanup EXIT

orig_total=0
new_total=0
met_goal_count=0
processed=0

# Preset order: best quality first.
PRESETS="92:4500 90:4200 88:3840 86:3600 84:3200"

while IFS= read -r -d '' file; do
  processed=$((processed + 1))
  orig_size="$(wc -c <"$file" | tr -d '[:space:]')"
  orig_total=$((orig_total + orig_size))

  file_tmp="$tmp_root/file_$processed"
  mkdir -p "$file_tmp"

  best_candidate=""
  best_size="$orig_size"
  best_label="original"
  reached_goal=0

  for preset in $PRESETS; do
    quality="${preset%%:*}"
    max_side="${preset##*:}"
    candidate="$file_tmp/q${quality}_m${max_side}.jpg"

    if ! sips -s format jpeg -s formatOptions "$quality" -Z "$max_side" "$file" --out "$candidate" >/dev/null 2>&1; then
      continue
    fi

    if [[ "$KEEP_EXIF" -eq 1 ]]; then
      jpegoptim --strip-all --keep-exif --keep-icc --all-progressive -q "$candidate" >/dev/null 2>&1 || true
    else
      jpegoptim --strip-all --keep-icc --all-progressive -q "$candidate" >/dev/null 2>&1 || true
    fi

    candidate_size="$(wc -c <"$candidate" | tr -d '[:space:]')"
    if [[ "$candidate_size" -lt "$best_size" ]]; then
      best_size="$candidate_size"
      best_candidate="$candidate"
      best_label="Q${quality}@${max_side}"
    fi

    # Goal satisfied: new_size <= original_size * (100 - GOAL) / 100
    if (( candidate_size * 100 <= orig_size * (100 - GOAL) )); then
      best_size="$candidate_size"
      best_candidate="$candidate"
      best_label="Q${quality}@${max_side}"
      reached_goal=1
      break
    fi
  done

  if [[ -z "$best_candidate" ]]; then
    best_candidate="$file"
    best_size="$orig_size"
    best_label="original"
  fi

  if [[ "$reached_goal" -eq 1 ]]; then
    met_goal_count=$((met_goal_count + 1))
  fi

  new_total=$((new_total + best_size))

  if [[ "$DRY_RUN" -eq 0 && "$best_candidate" != "$file" ]]; then
    cp "$best_candidate" "$file"
  fi

  saved_size=$((orig_size - best_size))
  saved_pct="$(awk -v o="$orig_size" -v s="$saved_size" 'BEGIN { printf "%.2f", (s*100)/o }')"
  printf '[%d/%d] %s -> %s (%s%%)\n' "$processed" "$file_count" "$file" "$best_label" "$saved_pct"
done < <(find "$TARGET" -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) -print0)

total_saved=$((orig_total - new_total))
total_saved_pct="$(awk -v o="$orig_total" -v s="$total_saved" 'BEGIN { printf "%.2f", (s*100)/o }')"
orig_mb="$(awk -v b="$orig_total" 'BEGIN { printf "%.2f", b/1024/1024 }')"
new_mb="$(awk -v b="$new_total" 'BEGIN { printf "%.2f", b/1024/1024 }')"
saved_mb="$(awk -v b="$total_saved" 'BEGIN { printf "%.2f", b/1024/1024 }')"

echo
echo "Processed: $processed files"
echo "Goal: ${GOAL}% reduction"
echo "Files meeting goal: $met_goal_count/$processed"
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "Dry run only."
fi
echo "Total: ${orig_mb} MB -> ${new_mb} MB (saved ${saved_mb} MB, ${total_saved_pct}%)"

if (( total_saved * 100 < orig_total * GOAL )); then
  echo "Warning: total reduction is below requested goal." >&2
  exit 2
fi
