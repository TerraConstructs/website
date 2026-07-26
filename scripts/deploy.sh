#!/usr/bin/env bash
#
# Publishes the static export to S3 and invalidates CloudFront.
#
#   ./scripts/deploy.sh [--dryrun]
#
# Bucket and distribution are read from the infra stack's terraform state so
# there is nothing to keep in sync by hand. Credentials come from the ambient
# AWS session — locally that means:
#
#   aws-vault exec tcons-vincent --no-session -- ./scripts/deploy.sh
#
set -euo pipefail

STATE="${INFRA_STATE:-../website/cdktf.out/stacks/landing/landing.tfstate}"
OUT="${OUT_DIR:-out}"
DRYRUN=""
[[ "${1:-}" == "--dryrun" ]] && DRYRUN="--dryrun"

if [[ ! -d "$OUT" ]]; then
  echo "No build output in $OUT/ — run \`pnpm build\` first." >&2
  exit 1
fi
if [[ ! -f "$STATE" ]]; then
  echo "Terraform state not found at $STATE" >&2
  exit 1
fi

BUCKET=$(python3 -c "
import json,sys
s=json.load(open('$STATE'))
for r in s['resources']:
    if r['type']=='aws_s3_bucket':
        print(r['instances'][0]['attributes']['bucket']); break
")
DIST=$(python3 -c "
import json
s=json.load(open('$STATE'))
print(s['outputs']['cdn']['value']['id'])
")

echo "bucket:       $BUCKET"
echo "distribution: $DIST"
[[ -n "$DRYRUN" ]] && echo "(dry run)"
echo

# Cache-Control is set per class of file. CloudFront's managed CachingOptimized
# policy honours these, so getting them right here is what makes invalidation
# cheap rather than mandatory.
#
# `--delete` is scoped by the same filters as each pass, so a pass only ever
# prunes files of the kind it uploads.
#
# Two carve-outs, both for things that exist only in the bucket:
#   blog/*/audio.mp3  published out-of-band by the previous site's
#                     publish-audio.sh and held nowhere else.
#   logos/*           the previous site's og:image target. Social platforms
#                     still serve cached cards pointing at these URLs, so
#                     deleting them would break every historical share.
COMMON=(--no-progress $DRYRUN --exclude "blog/*/audio.mp3" --exclude "logos/*")

echo "==> hashed assets (immutable)"
aws s3 sync "$OUT/" "s3://$BUCKET" "${COMMON[@]}" --delete \
  --exclude "*" --include "_next/static/*" \
  --cache-control "public,max-age=31536000,immutable"

echo "==> images and media (1 day)"
aws s3 sync "$OUT/" "s3://$BUCKET" "${COMMON[@]}" --delete \
  --exclude "*" --include "*.png" --include "*.jpg" --include "*.svg" \
  --include "*.ico" --include "*.webp" --include "*.woff2" \
  --cache-control "public,max-age=86400"

echo "==> html and metadata (always revalidate)"
aws s3 sync "$OUT/" "s3://$BUCKET" "${COMMON[@]}" --delete \
  --exclude "_next/static/*" \
  --exclude "*.png" --exclude "*.jpg" --exclude "*.svg" \
  --exclude "*.ico" --exclude "*.webp" --exclude "*.woff2" \
  --cache-control "public,max-age=0,must-revalidate"

if [[ -n "$DRYRUN" ]]; then
  echo
  echo "Dry run complete — nothing uploaded, nothing invalidated."
  exit 0
fi

echo "==> invalidating CloudFront"
ID=$(aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/*" \
  --query 'Invalidation.Id' --output text)
echo "invalidation $ID created"
