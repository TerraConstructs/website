// https://github.com/TerraConstructs/base/blob/integ-feat-signal-poc/integ/aws/compute/apps/instance.ts
import { signal } from "@tcons/provider-tconsaws";
import { Construct } from "constructs";
import { AwsStack, AwsStackProps } from "terraconstructs/lib/aws";
import {
  Vpc,
  Instance,
  InstanceType,
  InstanceClass,
  InstanceSize,
  AmazonLinuxImage,
  AmazonLinuxGeneration,
  InstanceInitiatedShutdownBehavior,
  Port,
  Code,
  LambdaFunction,
  Runtime,
  SecurityGroup,
  Schedule
} from "terraconstructs/lib/aws/compute";
import {
  Queue,
} from "terraconstructs/lib/aws/notify";
import { SqsSubscription } from 'terraconstructs/lib/aws/notify/subscriptions';
import { Rule, IRuleTarget, Topic } from 'terraconstructs/lib/aws/notify';
import { Bucket, BucketEncryption } from 'terraconstructs/lib/aws/storage';

export class CdkWorkshopStack extends AwsStack {
  constructor(scope: Construct, id: string, props: AwsStackProps) {
    super(scope, id, props);
    const vpc = new Vpc(this, "VPC");

    const lambda = new LambdaFunction(this, "LambdaFunction", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    const lambdaTarget: IRuleTarget = {
      bind: () => ({
        arn: lambda.functionArn,
        targetResource: lambda,
      }),
    };

    // Event bridge schedule and rule for SGX AR report processor lambda execution
    new Rule(this, 'Rule', {
      ruleName: `schedule-rule`,
      schedule: Schedule.cron({ minute: '10/30', hour: '*', day: '*', month: '*', year: '*' }),
      targets: [lambdaTarget],
    });

    const topic = new Topic(this, "Topic");
    const queue = new Queue(this, "Queue");
    topic.addSubscription(new SqsSubscription(queue));

    const instance = new Instance(this, "Instance", {
      vpc,
      instanceType: InstanceType.of(
        InstanceClass.T3,
        InstanceSize.NANO,
      ),
      machineImage: new AmazonLinuxImage({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      detailedMonitoring: true,
      instanceInitiatedShutdownBehavior:
        InstanceInitiatedShutdownBehavior.TERMINATE,
    });
    queue.grantConsumeMessages(instance)

    const rdsDbSecurityGroupId = SecurityGroup.fromSecurityGroupId(this, 'RdsSecurityGroupId', "sg-0123456789abcdef0")

    rdsDbSecurityGroupId.connections.allowFrom(instance, Port.tcp(1433), 'Allow MySQL access from EC2 instance');

    const bucket = new Bucket(this, "Bucket", {
      encryption: BucketEncryption.S3_MANAGED,
    });
    bucket.grantReadWrite(instance);
  }
}
