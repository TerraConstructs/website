#!/bin/bash
#
# Publish audio files from .audio-cache/ to S3
#
# This script uploads generated audio files to the same S3 bucket
# managed by Terraform for the website. Audio files are uploaded
# as siblings to index.html at: blog/{slug}/audio.mp3
#
# Prerequisites:
#   - AWS CLI installed and configured
#   - S3_BUCKET environment variable set, or pass as argument
#
# Usage:
#   export S3_BUCKET="your-bucket-name"
#   ./scripts/publish-audio.sh
#
#   # Or with argument:
#   ./scripts/publish-audio.sh your-bucket-name
#
# Note: Run BEFORE build so prerender can detect audio on CDN.
#

set -e

# Get bucket name from argument or environment variable
BUCKET="${1:-$S3_BUCKET}"

if [ -z "$BUCKET" ]; then
  echo "Error: S3 bucket not specified."
  echo ""
  echo "Usage:"
  echo "  export S3_BUCKET=\"your-bucket-name\""
  echo "  $0"
  echo ""
  echo "Or:"
  echo "  $0 your-bucket-name"
  echo ""
  echo "To find your bucket name, check Terraform state:"
  echo "  cd infra && terraform show | grep bucket"
  exit 1
fi

CACHE_DIR=".audio-cache"

if [ ! -d "$CACHE_DIR" ]; then
  echo "No audio cache directory found at $CACHE_DIR"
  echo "Run 'node scripts/generate-blog-audio.mjs' first to generate audio."
  exit 0
fi

# Count audio files
FILE_COUNT=$(find "$CACHE_DIR" -name "*.mp3" -type f 2>/dev/null | wc -l | tr -d ' ')

if [ "$FILE_COUNT" -eq 0 ]; then
  echo "No audio files found in $CACHE_DIR"
  exit 0
fi

echo "Publishing $FILE_COUNT audio file(s) to s3://$BUCKET/blog/..."
echo ""

UPLOADED=0
FAILED=0

for audio_file in "$CACHE_DIR"/*.mp3; do
  if [ -f "$audio_file" ]; then
    # Extract slug from filename (e.g., "2025-12-25-year-in-review.mp3" -> "2025-12-25-year-in-review")
    slug=$(basename "$audio_file" .mp3)
    s3_path="s3://$BUCKET/blog/$slug/audio.mp3"

    echo "  Uploading: $slug"

    if aws s3 cp "$audio_file" "$s3_path" \
      --cache-control "public, max-age=31536000, immutable" \
      --content-type "audio/mpeg" \
      --metadata-directive REPLACE \
      --quiet; then
      ((UPLOADED++))
    else
      echo "    Failed to upload $slug"
      ((FAILED++))
    fi
  fi
done

echo ""
echo "Done! Uploaded: $UPLOADED, Failed: $FAILED"

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi
