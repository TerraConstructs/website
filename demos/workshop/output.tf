terraform {
  required_providers {
    aws = {
      version = "5.100.0"
      source  = "aws"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_caller_identity" "CallerIdentity" {
  provider = "aws"
}
data "aws_partition" "Partitition" {
  provider = "aws"
}
data "aws_iam_policy_document" "HelloHandler_ServiceRole_AssumeRolePolicy_7561E865" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]
    effect = "Allow"
    principals = [
      {
        identifiers = [
          "${data.aws_service_principal.aws_svcp_default_region_lambda.name}",
        ]
        type = "Service"
      },
    ]
  }
}
resource "aws_iam_role" "HelloHandler_ServiceRole_11EF7C63" {
  assume_role_policy = data.aws_iam_policy_document.HelloHandler_ServiceRole_AssumeRolePolicy_7561E865.json
  managed_policy_arns = [
    "arn:${data.aws_partition.Partitition.partition}:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  ]
  name_prefix = "demo-uuid-HelloHandlerServiceRole"
  tags = {
    "grid:EnvironmentName" = "demo"
    "grid:UUID"            = "demo-uuid"
    Name                   = "demo-HelloHandler"
  }
}
data "aws_iam_policy_document" "HelloHandler_ServiceRole_DefaultPolicy_8633F352" {
  statement {
    actions = [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords",
    ]
    effect = "Allow"
    resources = [
      "*",
    ]
  }
}
resource "aws_iam_role_policy" "HelloHandler_ServiceRole_DefaultPolicy_ResourceRoles0_5982DDFD" {
  name   = "HelloHandlerServiceRoleDefaultPolicyB2AAA7FD"
  policy = data.aws_iam_policy_document.HelloHandler_ServiceRole_DefaultPolicy_8633F352.json
  role   = aws_iam_role.HelloHandler_ServiceRole_11EF7C63.name
}
resource "aws_cloudwatch_log_group" "HelloHandler_LogGroup_49850324" {
  name              = "/aws/lambda/demo-uuid-HelloHandler"
  retention_in_days = 7
  tags = {
    "grid:EnvironmentName" = "demo"
    "grid:UUID"            = "demo-uuid"
    Name                   = "demo-HelloHandler"
  }
}
resource "aws_lambda_function" "HelloHandler_2E4FBA4D" {
  architectures = [
    "x86_64"
  ]
  function_name = "demo-uuid-HelloHandler"
  handler       = "hello.handler"
  memory_size   = 128
  role          = aws_iam_role.HelloHandler_ServiceRole_11EF7C63.arn
  runtime       = "nodejs22.x"
  s3_bucket     = aws_s3_bucket.AssetBucket.bucket
  s3_key        = aws_s3_object.FileAsset_S3.key
  tags = {
    "grid:EnvironmentName" = "demo"
    "grid:UUID"            = "demo-uuid"
    Name                   = "demo-HelloHandler"
  }
  timeout = 3
  environment {
    variables = {

    }
  }
  tracing_config {
    mode = "Active"
  }
  depends_on = [
    "aws_cloudwatch_log_group.HelloHandler_LogGroup_49850324",
    "data.aws_iam_policy_document.HelloHandler_ServiceRole_AssumeRolePolicy_7561E865",
    "aws_iam_role.HelloHandler_ServiceRole_11EF7C63",
    "data.aws_iam_policy_document.HelloHandler_ServiceRole_DefaultPolicy_8633F352",
    "data.aws_iam_policy_document.HelloHandler_ServiceRole_AssumeRolePolicy_7561E865",
    "aws_iam_role.HelloHandler_ServiceRole_11EF7C63",
    "data.aws_iam_policy_document.HelloHandler_ServiceRole_DefaultPolicy_8633F352",
  ]
}
resource "aws_s3_bucket" "AssetBucket" {
  bucket = "demo-uuid-${data.aws_caller_identity.CallerIdentity.account_id}-us-east-1"
}
resource "aws_s3_object" "FileAsset_S3" {
  bucket      = aws_s3_bucket.AssetBucket.bucket
  key         = "ac628f13c88c233682e5ac4270a6063b0f3ef8dc2a12061e9d762bad947a292e.zip"
  source      = "assets/FileAsset/ac628f13c88c233682e5ac4270a6063b0f3ef8dc2a12061e9d762bad947a292e/archive.zip"
  source_hash = "ac628f13c88c233682e5ac4270a6063b0f3ef8dc2a12061e9d762bad947a292e"
}
resource "aws_api_gateway_rest_api" "Endpoint_EEF1FD8F" {
  name = "Endpoint"
  policy = {
    isBlock          = false
    type             = "simple"
    storageClassType = "string"
  }
  tags = {
    "grid:EnvironmentName" = "demo"
    "grid:UUID"            = "demo-uuid"
    Name                   = "demo-Endpoint"
  }
}
resource "aws_api_gateway_deployment" "Endpoint_Deployment_318525DA" {
  description = "Automatically created by the RestApi construct"
  rest_api_id = aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id
  depends_on = [
    "aws_api_gateway_resource.Endpoint_proxy_39E2174E",
    "aws_api_gateway_method.Endpoint_ANY_485C938B",
    "aws_api_gateway_method.Endpoint_proxy_ANY_C09721C5",
    "aws_api_gateway_resource.Endpoint_proxy_39E2174E",
    "aws_api_gateway_method.Endpoint_ANY_485C938B",
    "aws_api_gateway_method.Endpoint_proxy_ANY_C09721C5",
    "aws_api_gateway_integration.Endpoint_proxy_ANY_Integration_3EA10C81",
    "aws_api_gateway_integration.Endpoint_ANY_Integration_21F74837",
  ]
  lifecycle {
    create_before_destroy = true
  }
  triggers = {
    redeployment = "21b9f7b3fb6c94640a9065f699fde4c6"
  }
}
resource "aws_api_gateway_stage" "Endpoint_DeploymentStageprod_B78BEEA0" {
  deployment_id = aws_api_gateway_deployment.Endpoint_Deployment_318525DA.id
  rest_api_id   = aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id
  stage_name    = "prod"
  tags = {
    "grid:EnvironmentName" = "demo"
    "grid:UUID"            = "demo-uuid"
    Name                   = "demo-Endpoint"
  }
}
resource "aws_api_gateway_resource" "Endpoint_proxy_39E2174E" {
  parent_id   = aws_api_gateway_rest_api.Endpoint_EEF1FD8F.root_resource_id
  path_part   = "{proxy+}"
  rest_api_id = aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id
}
resource "aws_lambda_permission" "Endpoint_proxy_ANY_ApiPermissionEndpointANYproxy_5077F498" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.HelloHandler_2E4FBA4D.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:${data.aws_partition.Partitition.partition}:execute-api:us-east-1:${data.aws_caller_identity.CallerIdentity.account_id}:${aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id}/${aws_api_gateway_stage.Endpoint_DeploymentStageprod_B78BEEA0.stage_name}/*/*"
}
resource "aws_lambda_permission" "Endpoint_proxy_ANY_ApiPermissionTestEndpointANYproxy_53B9BBE7" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.HelloHandler_2E4FBA4D.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:${data.aws_partition.Partitition.partition}:execute-api:us-east-1:${data.aws_caller_identity.CallerIdentity.account_id}:${aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id}/test-invoke-stage/*/*"
}
resource "aws_api_gateway_method" "Endpoint_proxy_ANY_C09721C5" {
  authorization = "NONE"
  http_method   = "ANY"
  resource_id   = aws_api_gateway_resource.Endpoint_proxy_39E2174E.id
  rest_api_id   = aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id
}
resource "aws_api_gateway_integration" "Endpoint_proxy_ANY_Integration_3EA10C81" {
  http_method             = aws_api_gateway_method.Endpoint_proxy_ANY_C09721C5.http_method
  integration_http_method = "POST"
  resource_id             = aws_api_gateway_resource.Endpoint_proxy_39E2174E.id
  rest_api_id             = aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id
  type                    = "AWS_PROXY"
  uri                     = "arn:${data.aws_partition.Partitition.partition}:apigateway:us-east-1:lambda:path/2015-03-31/functions/${aws_lambda_function.HelloHandler_2E4FBA4D.arn}/invocations"
}
resource "aws_lambda_permission" "Endpoint_ANY_ApiPermissionEndpointANY_0F391E45" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.HelloHandler_2E4FBA4D.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:${data.aws_partition.Partitition.partition}:execute-api:us-east-1:${data.aws_caller_identity.CallerIdentity.account_id}:${aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id}/${aws_api_gateway_stage.Endpoint_DeploymentStageprod_B78BEEA0.stage_name}/*/"
}
resource "aws_lambda_permission" "Endpoint_ANY_ApiPermissionTestEndpointANY_A9F55FBA" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.HelloHandler_2E4FBA4D.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:${data.aws_partition.Partitition.partition}:execute-api:us-east-1:${data.aws_caller_identity.CallerIdentity.account_id}:${aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id}/test-invoke-stage/*/"
}
resource "aws_api_gateway_method" "Endpoint_ANY_485C938B" {
  authorization = "NONE"
  http_method   = "ANY"
  resource_id   = aws_api_gateway_rest_api.Endpoint_EEF1FD8F.root_resource_id
  rest_api_id   = aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id
}
resource "aws_api_gateway_integration" "Endpoint_ANY_Integration_21F74837" {
  http_method             = aws_api_gateway_method.Endpoint_ANY_485C938B.http_method
  integration_http_method = "POST"
  resource_id             = aws_api_gateway_rest_api.Endpoint_EEF1FD8F.root_resource_id
  rest_api_id             = aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id
  type                    = "AWS_PROXY"
  uri                     = "arn:${data.aws_partition.Partitition.partition}:apigateway:us-east-1:lambda:path/2015-03-31/functions/${aws_lambda_function.HelloHandler_2E4FBA4D.arn}/invocations"
}

output "EndpointOutputs" {
  value = {
    restApiId             = "${aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id}"
    restApiName           = "Endpoint"
    restApiRootResourceId = "${aws_api_gateway_rest_api.Endpoint_EEF1FD8F.root_resource_id}"
    url                   = "https://${aws_api_gateway_rest_api.Endpoint_EEF1FD8F.id}.execute-api.us-east-1.${data.aws_partition.Partitition.dns_suffix}/${aws_api_gateway_stage.Endpoint_DeploymentStageprod_B78BEEA0.stage_name}/"
  }
  description = "Outputs for demo-Endpoint"
}
data "aws_service_principal" "aws_svcp_default_region_lambda" {
  service_name = "lambda"
}