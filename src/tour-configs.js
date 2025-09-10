// Tour configurations for guided demo walkthroughs
// Each tour defines highlight positions and explanatory content

export const tourConfigs = {
  workshop: {
    name: 'Workshop - Lambda + API Gateway',
    description: 'Learn about L2 Constructs, IAM patterns, and deterministic synthesis',
    inputSteps: [
      {
        id: 'imports',
        type: 'line-range',
        startLine: 1,
        endLine: 8,
        title: 'L2 Construct Imports',
        content: 'TerraConstructs provides high-level L2 constructs similar to AWS CDK. Notice how we import from organized modules rather than individual resources.',
        highlight: 'border'
      },
      {
        id: 'stack-class',
        type: 'line-range', 
        startLine: 10,
        endLine: 12,
        title: 'Stack Extension',
        content: 'Our stack extends AwsStack, which provides the asset pipeline, IAM model, and deterministic synthesis capabilities.',
        highlight: 'border'
      },
      {
        id: 'lambda-creation',
        type: 'line-range',
        startLine: 14,
        endLine: 18,
        title: 'Lambda Function L2',
        content: 'LambdaFunction is an L2 construct with sensible defaults. Code.fromAsset() uses the asset pipeline for bundling and deployment.',
        highlight: 'border'
      },
      {
        id: 'api-integration',
        type: 'line-range',
        startLine: 20,
        endLine: 24,
        title: 'REST API Integration',
        content: 'LambdaRestApi automatically creates API Gateway resources and IAM permissions. The L2 handles the complexity of wiring everything together.',
        highlight: 'border'
      }
    ],
    outputSteps: [
      {
        id: 'terraform-structure',
        type: 'line-range',
        startLine: 1,
        endLine: 10,
        title: 'Clean Terraform Output',
        content: 'Notice the clean, readable Terraform configuration generated from our TypeScript. No manual resource wiring needed.',
        highlight: 'border'
      },
      {
        id: 'iam-resources',
        type: 'search-pattern',
        pattern: 'aws_iam_role',
        title: 'Generated IAM Resources',
        content: 'TerraConstructs automatically generates proper IAM roles and policies. The grant system ensures least-privilege access.',
        highlight: 'background'
      },
      {
        id: 'lambda-resource',
        type: 'search-pattern',
        pattern: 'aws_lambda_function',
        title: 'Lambda Configuration',
        content: 'The Lambda function resource includes optimized defaults for runtime, memory, and timeout settings.',
        highlight: 'background'
      },
      {
        id: 'api-gateway',
        type: 'search-pattern',
        pattern: 'aws_api_gateway',
        title: 'API Gateway Resources',
        content: 'Multiple API Gateway resources are created and properly configured with deployment stages and permissions.',
        highlight: 'background'
      }
    ]
  },
  
  'function-url': {
    name: 'Function URL - Lambda with Direct HTTP',
    description: 'Explore inline code, environment variables, and Function URL patterns',
    inputSteps: [
      {
        id: 'imports-advanced',
        type: 'line-range',
        startLine: 1,
        endLine: 11,
        title: 'Advanced Imports',
        content: 'This example shows additional imports including Duration utilities and Function URL types for modern Lambda patterns.',
        highlight: 'border'
      },
      {
        id: 'inline-code',
        type: 'line-range',
        startLine: 18,
        endLine: 29,
        title: 'Code.fromInline()',
        content: 'For simple functions, use Code.fromInline() to embed code directly. Great for utilities and small handlers.',
        highlight: 'border'
      },
      {
        id: 'environment-vars',
        type: 'line-range',
        startLine: 30,
        endLine: 32,
        title: 'Environment Variables',
        content: 'Environment variables are configured with strong typing. TerraConstructs validates and optimizes these at synthesis time.',
        highlight: 'border'
      },
      {
        id: 'function-url',
        type: 'line-range',
        startLine: 35,
        endLine: 42,
        title: 'Function URL Configuration',
        content: 'Function URLs provide direct HTTP access to Lambda without API Gateway. Notice the type-safe configuration options.',
        highlight: 'border'
      }
    ],
    outputSteps: [
      {
        id: 'lambda-inline',
        type: 'search-pattern',
        pattern: 'filename.*zip',
        title: 'Inline Code Packaging',
        content: 'Inline code is automatically packaged into deployment ZIP files with deterministic naming for reproducible builds.',
        highlight: 'background'
      },
      {
        id: 'environment-config',
        type: 'search-pattern',
        pattern: 'environment',
        title: 'Environment Block',
        content: 'Environment variables are properly configured in the Lambda resource with secure handling of sensitive values.',
        highlight: 'background'
      },
      {
        id: 'function-url-resource',
        type: 'search-pattern', 
        pattern: 'aws_lambda_function_url',
        title: 'Function URL Resource',
        content: 'The Function URL resource is created with proper CORS settings and authentication configuration.',
        highlight: 'background'
      },
      {
        id: 'output-values',
        type: 'search-pattern',
        pattern: 'output',
        title: 'Terraform Outputs',
        content: 'Useful values like the Function URL are automatically exposed as Terraform outputs for easy reference.',
        highlight: 'background'
      }
    ]
  }
}

export function getTourConfig(demoKey) {
  return tourConfigs[demoKey] || tourConfigs.workshop
}