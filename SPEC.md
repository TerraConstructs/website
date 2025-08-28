You are a senior front-end architect. Build a production-ready, neobrutalist FOSS IaC Library landing page in Tailwind CSS (v3.4). The page must look serious, high-contrast, and trustworthy - suitable for Dev-Tools guidelines.

1. Sections (minimum 4, each scroll-height more than 100vh):
  1. Hero (Value prop + Primary CTA + trust badges)
  2. Product Features (animated cards, micro-interactions, live code snippet toggle)
  3. Interactive demo (dark-mode code editor with syntax highlighting, run button, live output)
  4. Pre-footer CTA (gradient, border, typewriter headline, final CTA Button)
2. Visual Style
  - Neobrutalist: thick black borders, sharp shadows, monochrome palette + 1 accent color (see svgs)
  - Typography: Inter for body, JetBrains Mono for code
  - Spacing: 8-pt grid, 1.5rem base line-height.
  - Motion: Subtle 200-300 ms ease-out, no bouncy easing.
  - Dark mode toggle (persisted via localStorage).
3. Component requirements
  - Responsive (mobile-first, 310 -> 1920)
  - Accessible (WCAG 2.1 AA): Semantic HTLM, focus rings, reduced-motion MQ.
  - SEO: meta tags, JSON-LD Schema for SaaS, OpenGraph Images.
  - Performance: inline critical CSS, lazy-load below-fold images.
  - Security: CSP-ready nonce placeholders; no inline JS events.
4. Deliverables
  - Single `index.html` with embedded Tailwind via CDN for copy-paset deploy.
  - Optional `tailwind.config.js` and `postcss.config.js` if JIT purging is required.
  - Inline `<script type="module">` for dark-mode toggle, accordion, carousel - no external libs.
  - Comments above each section: `<!-- SECTION: Hero -->`.
5. Non-negotiables
  - Zero generic filler text: every word is product-specific.
  - Each section must contain at least one animated element (CSS or minimal JS).
  - No Lorem Ipsum; use realistic SaaS copy and real data shapes
  - Production-ready: no console errors, Lighthouse more than 95 on desktop & mobile.

output only the final HTML file.

TerraConstructs is library of Level 2 (L2) CDKTF Constructs. Terraform L2 Constructs ported from the AWSCDK L2 constructs, synthesizing to working Terraform configurations (completely replacing CloudFormation dependency), ready to use directly in Platform teams that use OpenTofu or Terraform only. All the AWSCDK unit tests have been ported as well to ensure reliability of the framework. This is a fully deterministic code base with extensive end to end tests to guarantee Terraform configurations work. The primary target is Product engineers that are tired of complex HCL code bases, hard to reason about conditionals and list comprehensions, impractical TF modules that are rigid and untyped. It offers instead carefully tailored Developer Experience for the AWS Service resources following common usage patterns. Unlike Terraform modules, Constructs built on top of TerraConstructs can adapt and modify the generated Terraform configuration based on the deployment scenario by cleverly using the Late binding capabilities in CDK frameworks such as CDKTF (such as Lazy Tokens, Aspects attached to construct trees to handle Stack wide compliance requirements, Factory classes and single instance tricks that simply are not possible with TF Modules written in HCL). The base "AwsStack" which is an extension of CDKTF's "TerraformStack" includes a full Asset Pipeline similar to AWSCDK, leveraging CDKTF Assets together with S3 and ECR specific functionality. Full `aws-iam` has been ported with IGrantable, IGrant and IPrincipal implementations throughout all L2 AWS constructs.

The full library is JSII Compliant, thus cross publishing to Golang or Python is supported (but not currently enabled unless requested)

Technical details: currently the focus is on AWSCDK L2 constructs, other cloud support such as GCP and Azure should be targetted, but will require community contributions and setting up a collaborative effort. 
The AWSCDK L2 constructs leverage the terraform-provider-aws, which means that the generated Terraform configurations can out of the box be scanned with all existing ecosystem tooling such as: tflint and its aws provider linter rules, cost estimation plugins, TF visualizers, OPA rulesets and SAST Security scanning tooling and all their integrations into existing Terraform collaboration and execution platforms.. allowing a well established TF footprint by platform teams to be simply leveraged with minimal effort.

Code Samples to feature and lift the veil on some of the capabilities:
```typescript
import { Construct } from "constructs";
import { AwsStack, AwsStackProps } from 'terraconstructs/lib/aws';
import {
  Code,
  LambdaFunction,
  Runtime,
  LambdaRestApi,
} from 'terraconstructs/lib/aws/compute';

export class CdkWorkshopStack extends AwsStack {
  constructor(scope: Construct, id: string, props: AwsStackProps) {
    super(scope, id, props);

    const hello = new LambdaFunction(this, "HelloHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    new LambdaRestApi(this, "Endpoint", {
      cloudWatchRole: false,
      handler: hello,
      registerOutputs: true,
    });
  }
}
```

Golang (JSII Ready):
```golang
package main
// work in progress
import (
	"github.com/terraconstructs/base-go/aws"
	"github.com/terraconstructs/base-go/aws/compute"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type CdkWorkshopStackProps struct {
	aws.AwsStackProps
}

func NewCdkWorkshopStack(scope constructs.Construct, id string, props CdkWorkshopStackProps) aws.AwsStack {
	stack := aws.NewAwsStack(scope, &id, props.AwsStackProps)
	helloHandler := compute.NewLambdaFunction(stack, jsii.String("HelloHandler"), &compute.LambdaFunctionProps{
		Code:    compute.Code_FromAsset(jsii.String("lambda"), nil),
		Runtime: compute.Runtime_NODEJS_22_X(),
		Handler: jsii.String("hello.handler"),
	})
	compute.NewLambdaRestApi(stack, jsii.String("Endpoint"), &compute.LambdaRestApiProps{
		Handler: helloHandler,
	})
	return stack
}
```

Python (JSII Ready)
```
# work in progress
from constructs import Construct
from terraconstructs import (
    aws,
)

class CdkWorkshopStack(aws.AwsStack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        my_lambda = aws.compute.LambdaFunction(
            self, 'HelloHandler',
            runtime=aws.compute.Runtime.PYTHON_3_13,
            code=aws.compute.Code.from_asset('lambda'),
            handler='hello.handler',
        )

        aws.compute.LambdaRestApi(
            self, 'Endpoint',
            handler=my_lambda,
        )
```

The full API Reference is on the Construct Hub
https://constructs.dev/packages/terraconstructs/v/0.1.2?lang=typescript

the CDK Workshop was fully ported, is working and is available at
https://aws-workshop.terraconstructs.dev/

CTAs:
- try out the workshop
- join the Discord https://discord.gg/gEu3D8hJGz
- Contribute on GitHub https://github.com/terraconstructs/base

an Alpha Playground (in-browser NodeJS using webcontainers.io and tutorialkit) is available at https://learn.terraconstructs.dev/

The library is Apache License 2.0 and built to bring the joy of CDK to everyone stuck in Terraform land
