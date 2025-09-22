import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "url";
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
  ResponseHeadersPolicy,
  HeadersFrameOption,
  HeadersReferrerPolicy,
} from "terraconstructs/lib/aws/edge";
import { Bucket } from "terraconstructs/lib/aws/storage";
import { Duration } from "terraconstructs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outdir = "cdktf.out";
const stackName = "landing";
interface LandingPageStackProps extends AwsStackProps {
  readonly domainName: string;
  readonly zoneId: string;
}

class LandingPageStack extends AwsStack {
  constructor(scope: Construct, id: string, props: LandingPageStackProps) {
    super(scope, id, props);
    const { domainName, zoneId } = props;

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

    // add s3 bucket with origin access identity enabled
    const sourceBucket = new Bucket(this, "Source", {
      sources: path.join(__dirname, "..", "dist"),
      cloudfrontAccess: {
        enabled: true,
      },
    });

    const cspPath = path.join(__dirname, "csp.json");
    const { csp } = JSON.parse(fs.readFileSync(cspPath, "utf8")) as {
      csp: string;
    };

    const respHeaders = new ResponseHeadersPolicy(this, "SiteHeaders", {
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: csp,
          override: true,
        },
        frameOptions: {
          frameOption: HeadersFrameOption.DENY,
          override: true,
        },
        contentTypeOptions: { override: true },
        xssProtection: {
          protection: true,
          modeBlock: true,
          override: true,
        },
        referrerPolicy: {
          referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.seconds(31536000),
          includeSubdomains: true,
          override: true,
        },
      },
    });

    // TODO: fix permanent diff on viewer certificate (min protocol TSLv1 and ssl_support_method SNI-only)
    const distribution = new Distribution(this, "Cdn", {
      ...(certificate ? { aliases: [domainName], certificate } : {}),
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: new S3Origin(sourceBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy: respHeaders,
      },
      defaultRootObject: "index.html",
      errorResponses: [404, 403].map(httpStatus => ({
        httpStatus,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
      })),
      registerOutputs: true,
      outputName: "cdn",
    });
    // create apex record for CDN
    new ARecord(this, "CdnAlias", {
      zone,
      target: RecordTarget.fromAlias(new DistributionTarget(distribution)),
    });
  }
}

const app = new App({
  outdir,
});

const stack = new LandingPageStack(app, stackName, {
  gridUUID: "website",
  environmentName: "prod",
  providerConfig: {
    region: "us-east-1",
  },
  domainName: "terraconstructs.dev",
  zoneId: "Z09339061DF0IQA1CJMKQ",
});

new LocalBackend(stack, {
  path: `${stackName}.tfstate`,
});

app.synth();
