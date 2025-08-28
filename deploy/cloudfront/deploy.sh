#!/bin/bash

# TerraConstructs CloudFront Deployment Script
set -e

# Configuration
DOMAIN_NAME=${1:-"terraconstructs.dev"}
CERTIFICATE_ARN=${2}
STACK_NAME="terraconstructs-landing-${DOMAIN_NAME//./-}"
REGION="us-east-1"  # Lambda@Edge must be in us-east-1

echo "🚀 Deploying TerraConstructs landing page to CloudFront"
echo "Domain: $DOMAIN_NAME"
echo "Stack: $STACK_NAME"

# Check for certificate ARN
if [ -z "$CERTIFICATE_ARN" ]; then
    echo "❌ Error: Certificate ARN required"
    echo "Usage: $0 <domain> <certificate-arn>"
    echo ""
    echo "Example:"
    echo "$0 terraconstructs.dev arn:aws:acm:us-east-1:123456789012:certificate/abcd1234-..."
    exit 1
fi

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI not found. Please install AWS CLI."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS credentials not configured"
    exit 1
fi

# Create Lambda deployment package
echo "📦 Creating Lambda@Edge deployment package..."
cd "$(dirname "$0")"

# Create temp directory for Lambda package
TEMP_DIR=$(mktemp -d)
cp lambda-edge.js "$TEMP_DIR/index.js"
cd "$TEMP_DIR"
zip -r lambda-package.zip index.js
cd - > /dev/null

# Deploy CloudFormation stack
echo "☁️  Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file cloudformation.yaml \
    --stack-name "$STACK_NAME" \
    --parameter-overrides \
        DomainName="$DOMAIN_NAME" \
        CertificateArn="$CERTIFICATE_ARN" \
    --capabilities CAPABILITY_IAM \
    --region "$REGION"

# Get outputs
echo "📋 Getting stack outputs..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
    --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

# Upload Lambda function code
echo "🔧 Updating Lambda@Edge function..."
LAMBDA_FUNCTION_NAME="$DOMAIN_NAME-csp-lambda"

aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --zip-file "fileb://$TEMP_DIR/lambda-package.zip" \
    --region "$REGION"

# Upload website files
echo "📁 Uploading website files to S3..."
cd ../../

# Upload HTML with correct content type
aws s3 cp index.html "s3://$BUCKET_NAME/" \
    --content-type "text/html; charset=utf-8" \
    --cache-control "no-cache, no-store, must-revalidate"

# Upload logos with long cache
aws s3 sync logos/ "s3://$BUCKET_NAME/logos/" \
    --cache-control "max-age=2592000" \
    --content-type "image/png"

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Create CloudFront invalidation
echo "🔄 Creating CloudFront invalidation..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Deployment Details:"
echo "   S3 Bucket: $BUCKET_NAME"
echo "   Distribution ID: $DISTRIBUTION_ID"
echo "   Invalidation ID: $INVALIDATION_ID"
echo ""
echo "🌐 Website URL: https://$DOMAIN_NAME"
echo ""
echo "⏳ Note: CloudFront distribution may take 15-20 minutes to fully deploy"
echo "   Lambda@Edge functions can take additional time to propagate globally"
echo ""
echo "🔍 Monitor deployment:"
echo "   aws cloudfront get-distribution --id $DISTRIBUTION_ID"
echo "   aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID"