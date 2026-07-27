#!/usr/bin/env bash
#
# Re-attaches the viewer-request function to the distribution's DEFAULT cache
# behavior.
#
#   aws-vault exec tcons-vincent --no-session -- ./scripts/attach-cf-function.sh
#
# Why this exists: the TerraConstructs `Distribution` construct drops
# `functionAssociations` on the default behavior — it emits the block for
# ordered behaviors but not for the default one, so the synthesized
# aws_cloudfront_distribution has no function_association and every apply
# detaches the function again.
#
# Until that is fixed upstream, run this after every `tofu apply`. Without it
# the rewrite never runs: `/workshops/aws/` is looked up as a literal S3 key,
# S3 answers 403, and the error response turns that into a 404.
#
# Idempotent — exits early if the association is already correct.
set -euo pipefail

STATE="${INFRA_STATE:-cdktf.out/stacks/landing/landing.tfstate}"
FUNCTION_NAME="${FUNCTION_NAME:-website-indexRewrite}"

DIST=$(python3 -c "
import json
print(json.load(open('$STATE'))['outputs']['cdn']['value']['id'])
")
FN_ARN=$(aws cloudfront describe-function --name "$FUNCTION_NAME" \
  --query 'FunctionSummary.FunctionMetadata.FunctionARN' --output text)

echo "distribution: $DIST"
echo "function:     $FN_ARN"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

aws cloudfront get-distribution-config --id "$DIST" > "$TMP/full.json"
ETAG=$(python3 -c "import json;print(json.load(open('$TMP/full.json'))['ETag'])")

python3 - "$TMP/full.json" "$TMP/config.json" "$FN_ARN" <<'PY'
import json, sys

full_path, out_path, fn_arn = sys.argv[1], sys.argv[2], sys.argv[3]
config = json.load(open(full_path))["DistributionConfig"]
behavior = config["DefaultCacheBehavior"]
current = behavior.get("FunctionAssociations", {})

already = (
    current.get("Quantity") == 1
    and current["Items"][0]["FunctionARN"] == fn_arn
    and current["Items"][0]["EventType"] == "viewer-request"
)
if already:
    print("SKIP")
    raise SystemExit(0)

behavior["FunctionAssociations"] = {
    "Quantity": 1,
    "Items": [{"FunctionARN": fn_arn, "EventType": "viewer-request"}],
}
json.dump(config, open(out_path, "w"))
print("UPDATE")
PY

if [[ ! -f "$TMP/config.json" ]]; then
  echo "already attached — nothing to do"
  exit 0
fi

aws cloudfront update-distribution \
  --id "$DIST" \
  --if-match "$ETAG" \
  --distribution-config "file://$TMP/config.json" \
  --query 'Distribution.DistributionConfig.DefaultCacheBehavior.FunctionAssociations' \
  --output json

echo "attached — CloudFront will take a few minutes to propagate"
