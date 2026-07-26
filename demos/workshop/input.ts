import { Construct } from "constructs";
import { AwsStack, AwsStackProps } from "terraconstructs/lib/aws";
import {
  Code,
  LambdaFunction,
  Runtime,
  LambdaRestApi,
} from "terraconstructs/lib/aws/compute";

export class CdkWorkshopStack extends AwsStack {
  constructor(scope: Construct, id: string, props: AwsStackProps) {
    super(scope, id, props);

    const hello = new LambdaFunction(this, "HelloHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    new LambdaRestApi(this, "Endpoint", {
      handler: hello,
      registerOutputs: true,
      cloudWatchRole: false,
    });
  }
}
