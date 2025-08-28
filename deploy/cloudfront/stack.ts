import * as path from "path";
import { Construct } from "constructs";
import { App, LocalBackend } from "cdktf";
import { AwsStack, AwsStackProps } from "terraconstructs/lib/aws";
import {
  PublicCertificate,
  DnsZone,
  ValidationMethod,
  Distribution,
  S3Origin,
  PriceClass,
  ViewerProtocolPolicy,
  ARecord,
  RecordTarget,
  DistributionTarget,
  Function,
  FunctionCode,
  FunctionEventType,
} from "terraconstructs/lib/aws/edge";
import { Bucket } from "terraconstructs/lib/aws/storage";

const outdir = "cdktf.out";
const stackName = "terraconstructs-landing";

interface TerraConstructsLandingStackProps extends AwsStackProps {
  readonly domainName: string;
  readonly zoneId: string;
}

class TerraConstructsLandingStack extends AwsStack {
  constructor(scope: Construct, id: string, props: TerraConstructsLandingStackProps) {
    super(scope, id, props);
    const { domainName, zoneId } = props;

    // DNS zone and certificate
    const zone = DnsZone.fromZoneId(this, "Zone", zoneId);
    const certificate = new PublicCertificate(this, "Certificate", {
      domainName,
      subjectAlternativeNames: [`*.${domainName}`],
      validation: {
        method: ValidationMethod.DNS,
        hostedZone: zone,
      },
      lifecycle: {
        createBeforeDestroy: true,
      },
    });

    // S3 bucket for website content with CloudFront access
    const sourceBucket = new Bucket(this, "Source", {
      sources: path.join(__dirname, "..", "..", "dist"), // Pre-processed HTML with nonces
      cloudfrontAccess: {
        enabled: true,
      },
    });

    // CloudFront Function for CSP header injection
    const cspFunction = new Function(this, "CspInjection", {
      nameSuffix: "csp-injection",
      code: FunctionCode.fromFile({
        filePath: path.join(__dirname, "handlers", "csp-injection", "index.js"),
      }),
      registerOutputs: true,
      outputName: "csp_function",
    });

    // CloudFront distribution
    const distribution = new Distribution(this, "Cdn", {
      aliases: [domainName],
      certificate,
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: new S3Origin(sourceBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        // Apply CSP function to viewer response
        functionAssociations: [
          {
            eventType: FunctionEventType.VIEWER_RESPONSE,
            function: cspFunction,
          },
        ],
      },
      // Additional behaviors for static assets with caching
      additionalBehaviors: [
        {
          pathPattern: "logos/*",
          origin: new S3Origin(sourceBucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          // No CSP function for static assets - use default caching
          cachePolicy: "CachingOptimized",
          compress: true,
        },
        {
          pathPattern: "*.png",
          origin: new S3Origin(sourceBucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: "CachingOptimized",
          compress: true,
        },
        {
          pathPattern: "*.svg",
          origin: new S3Origin(sourceBucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: "CachingOptimized",
          compress: true,
        },
      ],
      defaultRootObject: "index.html",
      // SPA routing - serve index.html for 404s
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
      registerOutputs: true,
      outputName: "cdn",
    });

    // DNS record pointing to CloudFront
    new ARecord(this, "CdnAlias", {
      zone,
      target: RecordTarget.fromAlias(new DistributionTarget(distribution)),
    });

    // Output the CloudFront URL
    this.addOutput("CloudFrontUrl", {
      value: `https://${distribution.domainName}`,
      description: "CloudFront distribution URL",
    });

    this.addOutput("WebsiteUrl", {
      value: `https://${domainName}`,
      description: "Website URL",
    });
  }
}

const app = new App({
  outdir,
});

const stack = new TerraConstructsLandingStack(app, stackName, {
  gridUUID: "landing-page",
  environmentName: "prod",
  providerConfig: {
    region: "us-east-1", // Required for CloudFront
  },
  domainName: "terraconstructs.dev",
  zoneId: "Z09339061DF0IQA1CJMKQ", // Replace with your actual zone ID
});

new LocalBackend(stack, {
  path: `${stackName}.tfstate`,
});

app.synth();