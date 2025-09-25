// Tour configurations for guided demo walkthroughs
// Each tour defines highlight positions and explanatory content

export const tourConfigs = {
  workshop: {
    name: "Workshop - Lambda + API Gateway",
    description:
      "Learn about L2 Constructs, IAM patterns, and deterministic synthesis",
    inputSteps: [
      {
        id: "imports",
        type: "line-range",
        startLine: 4,
        endLine: 7,
        title: "L2 Construct Imports",
        content:
          "TerraConstructs provides high-level L2 constructs similar to AWS CDK.",
        highlight: "border",
      },
      {
        id: "stack-class",
        type: "line-range",
        startLine: 10,
        endLine: 12,
        title: "Stack Extension",
        content:
          "Extending AwsStack provides advanced Asset Pipeline, IAM model and regional specific functionality.",
        highlight: "border",
      },
      {
        id: "lambda-creation",
        type: "line-range",
        startLine: 14,
        endLine: 18,
        title: "Lambda Function L2",
        content:
          "LambdaFunction provides strong typing and sensible defaults. Code.fromAsset() uses the asset pipeline for bundling and deployment.",
        highlight: "border",
      },
      // // TODO: Support nested line ranges
      // {
      //   id: "code-from-asset",
      //   type: "line-range",
      //   startLine: 16,
      //   endLine: 16,
      //   title: "Code fromAsset factory",
      //   content:
      //     "Code.fromAsset() uses the asset pipeline for bundling and deployment.",
      //   highlight: "border",
      // },
      {
        id: "api-gateway-creation",
        type: "line-range",
        startLine: 20,
        endLine: 21,
        title: "API Gateway L2",
        content:
          "LambdaRestApi provides a simple way to create REST APIs backed by Lambda functions.",
        highlight: "border",
      },
    ],
    outputSteps: [
      {
        id: "iam-role-assume-policy",
        type: "line-range",
        startLine: 22,
        endLine: 32,
        title: "IAM Role Assume Policy",
        content:
          'The "hello" Handler IAM policies ensures Lambda service principal access.',
        highlight: "background",
      },
      {
        id: "asset-pipeline",
        type: "line-range",
        startLine: 109,
        endLine: 117,
        title: "Asset Pipeline",
        content:
          "The AwsStack asset pipeline handles checksums, packaging and uploads.",
        highlight: "border",
      },
      {
        id: "api-gateway-dependencies",
        type: "line-range",
        startLine: 134,
        endLine: 149,
        title: "API Gateway Dependencies",
        content:
          "API Gateway resources are properly configured with deployment stage triggers and dependencies avoiding common race condition pitfalls.",
        highlight: "background",
      },
      {
        id: "lambda-permissions",
        type: "line-range",
        startLine: 192,
        endLine: 197,
        title: "Lambda Permissions",
        content:
          "Deep IAM, Lambda and ApiGateway integrations ensure necessary permissions are created automatically.",
        highlight: "background",
      },
    ],
  },

  // "function-url": {
  //   name: "Function URL - Lambda with Direct HTTP",
  //   description:
  //     "Explore inline code, environment variables, and Function URL patterns",
  //   inputSteps: [
  //     {
  //       id: "inline-code",
  //       type: "line-range",
  //       startLine: 21,
  //       endLine: 29,
  //       title: "Code.fromInline()",
  //       content:
  //         "Code.fromInline() handles embedded code directly. Great for utilities and small handlers.",
  //       highlight: "border",
  //     },
  //   ],
  //   outputSteps: [
  //     {
  //       id: "lambda-inline-packaging",
  //       type: "line-range",
  //       startLine: 71,
  //       endLine: 79,
  //       title: "Inline Code Packaging",
  //       content:
  //         "Inline code is automatically packaged into deployment ZIP files with deterministic naming for reproducible builds.",
  //       highlight: "background",
  //     },
  //     {
  //       id: "lambda-inline-filename",
  //       type: "line-range",
  //       startLine: 98,
  //       endLine: 98,
  //       title: "Inline Code Filename",
  //       content:
  //         "Archive resource is referenced for built-in dependency tracking.",
  //       highlight: "background",
  //     },
  //   ],
  // },

  "instance-signal": {
    name: "Instance Signal - EC2 Instance with CFN Signal",
    description: "Explore EC2 Instances with signaling mechanics",
    inputSteps: [
      {
        id: "l2-constructs",
        type: "line-range",
        startLine: 23,
        endLine: 25,
        title: "L2 Constructs",
        content: "Reasonable defaults and strong typing for VPC, SQS and EC2.",
        highlight: "border",
      },
      {
        id: "instance-connections",
        type: "line-range",
        startLine: 38,
        endLine: 38,
        title: "Instance Connections",
        content:
          "IConnectable interface handles VPC Security Groups under the hood.",
        highlight: "border",
      },
      {
        id: "instance-user-data",
        type: "line-range",
        startLine: 40,
        endLine: 44,
        title: "Instance User Data",
        content: "addUserData() simplifies instance bootstrap.",
        highlight: "border",
      },
      {
        id: "iam-grants",
        type: "line-range",
        startLine: 45,
        endLine: 45,
        title: "IAM Grants",
        content: "IPrincipal interface handles instance roles and permissions.",
        highlight: "border",
      },
      {
        id: "signal-resource",
        type: "line-range",
        startLine: 48,
        endLine: 55,
        title: "Signal Resource",
        content:
          "Signal resource pauses Terraform execution for instance to signal bootstrap status, allowing advanced multi-instance orchestration",
        highlight: "border",
      },
    ],
    outputSteps: [
      {
        id: "amazon-linux-ami",
        type: "line-range",
        startLine: 453,
        endLine: 455,
        title: "Simple Amazon Linux AMI Lookup",
        content:
          "Regional Amazon Linux AMI is looked up using AWS built-in mechanisms.",
        highlight: "border",
      },
      {
        id: "instance-ingress",
        type: "line-range",
        startLine: 338,
        endLine: 350,
        title: "Instance Ingress Rule",
        content: "Instance Ingress for ICMP traffic is allowed.",
        highlight: "border",
      },
      {
        id: "instance-sqs-grant",
        type: "line-range",
        startLine: 391,
        endLine: 399,
        title: "Instance SQS Grant",
        content:
          "Instance is granted fine-grained permissions to send messages to the SQS queue.",
        highlight: "border",
      },
      {
        id: "instance-resource-dependencies",
        type: "line-range",
        startLine: 444,
        endLine: 451,
        title: "Instance Resource Dependencies",
        content: "Instance resource depends on IAM Policies being ready.",
        highlight: "border",
      },
      {
        id: "signal-resource-dependencies",
        type: "line-range",
        startLine: 457,
        endLine: 459,
        title: "Signal Resource Dependencies",
        content: "Signal resource polls queue for instance readiness.",
        highlight: "border",
      },
    ],
  },
  "community-day": {
    name: "Community Day Example using L2 Constructs",
    description:
      "Learn about L2 Constructs, IAM patterns, and deterministic synthesis",
    inputSteps: [
      {
        id: "imports",
        type: "line-range",
        startLine: 37,
        endLine: 37,
        title: "L2 Construct Imports",
        content:
          "Creating VPC at ease including multiple AZs subnets and route tables.",
        highlight: "border",
      },
      {
        id: "lambda",
        type: "line-range",
        startLine: 39,
        endLine: 43,
        title: "Lambda Function",
        content:
          "LambdaFunction provides strong typing and sensible defaults. Code.fromAsset() uses the asset pipeline for bundling and deployment. We can skip the archive provider .. etc here.",
        highlight: "border",
      },
      {
        id: "event-bridge",
        type: "line-range",
        startLine: 45,
        endLine: 63,
        title: "Event Bridge Rule",
        content:
          "L2 Construct for EventBridge provides a simple way to create rules and targets.",
        highlight: "border",
      },
      {
        id: "sqs",
        type: "line-range",
        startLine: 65,
        endLine: 67,
        title: "Sqs Subscription",
        content:
          "Creates an SNS Topic, an SQS Queue, and subscribes the queue to the topic (SQS subscription).",
        highlight: "border",
      },
      {
        id: "instance-create",
        type: "line-range",
        startLine: 69,
        endLine: 81,
        title: "EC2 Instance creation",
        content:
          "Instantiates an Instance L2 with explicit instanceType and machineImage (Amazon Linux).",
        highlight: "border",
      },
      {
        id: "sqs-grant",
        type: "line-range",
        startLine: 82,
        endLine: 82,
        title: "SQS consume grant",
        content:
          "Grants the EC2 instance permission to consume messages from the SQS queue.",
        highlight: "border",
      },
      {
        id: "rds-sg-from-id",
        type: "line-range",
        startLine: 84,
        endLine: 88,
        title: "Import existing Security Group by ID",
        content:
          "Loads an existing Security Group (`sg-0123456789abcdef0`) via `fromSecurityGroupId` for cross-resource connectivity checks.",
        highlight: "border",
      },
      {
        id: "sg-allow-from",
        type: "line-range",
        startLine: 89,
        endLine: 93,
        title: "Allow DB access from Instance",
        content:
          "Adds a `connections.allowFrom` rule to permit the instance to reach the RDS security group on TCP 1433 (MSSQL port used here).",
        highlight: "border",
      },
      {
        id: "bucket",
        type: "line-range",
        startLine: 95,
        endLine: 98,
        title: "Create bucket and allow read write from instance.",
        content:
          "Creates an S3 bucket and allows read/write access from the EC2 instance.",
        highlight: "border",
      },
    ],
    outputSteps: [
      // {
      //   id: "iam-role-assume-policy",
      //   type: "line-range",
      //   startLine: 22,
      //   endLine: 32,
      //   title: "IAM Role Assume Policy",
      //   content:
      //     'The "hello" Handler IAM policies ensures Lambda service principal access.',
      //   highlight: "background",
      // },
      // {
      //   id: "asset-pipeline",
      //   type: "line-range",
      //   startLine: 109,
      //   endLine: 117,
      //   title: "Asset Pipeline",
      //   content:
      //     "The AwsStack asset pipeline handles checksums, packaging and uploads.",
      //   highlight: "border",
      // },
      // {
      //   id: "api-gateway-dependencies",
      //   type: "line-range",
      //   startLine: 134,
      //   endLine: 149,
      //   title: "API Gateway Dependencies",
      //   content:
      //     "API Gateway resources are properly configured with deployment stage triggers and dependencies avoiding common race condition pitfalls.",
      //   highlight: "background",
      // },
      // {
      //   id: "lambda-permissions",
      //   type: "line-range",
      //   startLine: 192,
      //   endLine: 197,
      //   title: "Lambda Permissions",
      //   content:
      //     "Deep IAM, Lambda and ApiGateway integrations ensure necessary permissions are created automatically.",
      //   highlight: "background",
      // },
    ],
  },
};

export function getTourConfig(demoKey) {
  return tourConfigs[demoKey] || tourConfigs.workshop;
}
