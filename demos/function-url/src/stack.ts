import { Construct } from "constructs";
import { AwsStack, AwsStackProps } from "terraconstructs/lib/aws";
import { Duration } from "terraconstructs/lib/duration";
import {
  Code,
  LambdaFunction,
  Runtime,
  FunctionUrlAuthType,
  HttpMethod,
} from "terraconstructs/lib/aws/compute";
import { TerraformOutput } from "cdktf";

export class CdkWorkshopStack extends AwsStack {
  constructor(scope: Construct, id: string, props: AwsStackProps) {
    super(scope, id, props);

    // add a public echo endpoint for network connectivity tests
    const echoLambda = new LambdaFunction(this, "Echo", {
      runtime: Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: Code.fromInline(`exports.handler = async (event) => {
            return {
            statusCode: 200,
            body: JSON.stringify({
                host: process.env.NAME || "unnamed",
                ip: event.requestContext.http.sourceIp,
            }),
            };
        };`),
      environment: {
        NAME: this.environmentName,
      },
    });
    const functionUrl = echoLambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowCredentials: true,
        allowedOrigins: ["*"],
        allowedMethods: [HttpMethod.ALL],
        allowedHeaders: ["date", "keep-alive"],
        exposedHeaders: ["keep-alive", "date"],
        maxAge: Duration.days(1),
      },
    });

    new TerraformOutput(this, "EchoFunctionUrl", {
      value: functionUrl.url,
    });
  }
}
