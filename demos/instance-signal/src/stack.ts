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
  Port
} from "terraconstructs/lib/aws/compute";
import {
  Queue,
} from "terraconstructs/lib/aws/notify";

export class CdkWorkshopStack extends AwsStack {
  constructor(scope: Construct, id: string, props: AwsStackProps) {
    super(scope, id, props);
    const vpc = new Vpc(this, "VPC");
    const queue = new Queue(this, "Queue");
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
    instance.connections.allowFromAnyIpv4(Port.icmpPing());
    const signalId = "deployment-abc124";
    instance.addUserData(
      "# bootstrap commands here",
      // Signal bootstrap status using https://github.com/TerraConstructs/signal-aws
      `/usr/local/bin/tcsignal-aws --queue-url "${queue.queueUrl}" --id "${signalId}" --status SUCCESS`,
    );
    queue.grantSendMessages(instance);
    // wait for instance to signal success before continuing
    // see https://github.com/TerraConstructs/terraform-provider-tconsaws
    const instanceReady = new signal.Signal(this, "Signal", {
      signalId,
      expectedCount: 1,
      queueUrl: queue.queueUrl,
      timeouts: {
        create: "10m",
      },
    });
    instanceReady.node.addDependency(instance);
  }
}
