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
  ResponseSecurityHeadersBehavior,
  Function,
  FunctionCode,
  FunctionEventType,
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
    //
    // Content is NOT managed here: uploading the site as one aws_s3_object per
    // file made every deploy a terraform apply. The bucket is provisioned empty
    // and filled by `aws s3 sync` (see scripts/deploy.sh).
    const sourceBucket = new Bucket(this, "Source", {
      cloudfrontAccess: {
        enabled: true,
      },
    });

    const cspPath = path.join(__dirname, "csp.json");
    const { csp } = JSON.parse(fs.readFileSync(cspPath, "utf8")) as {
      csp: string;
    };

    // Common security headers (shared between policies)
    const commonSecurityHeaders: Partial<ResponseSecurityHeadersBehavior> = {
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
    };

    // The site is a Next.js static export, which emits inline hydration scripts
    // (`self.__next_f.push(...)`) whose hashes change with content on every
    // build, so the hash-based CSP in csp.json cannot be kept in sync. Nonces
    // would need a server, and there isn't one. This is the same relaxation the
    // previous site already applied to /blog/*, now applied site-wide.
    const appCsp = csp
      .replace(
        /style-src[^;]+;/,
        "style-src 'self' https://fonts.googleapis.com 'unsafe-inline';"
      )
      .replace(
        /script-src[^;]+;/,
        "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com 'unsafe-inline';"
      )
      .replace(
        /script-src-attr[^;]+;/,
        "script-src-attr 'unsafe-inline';"
      );

    const appHeaders = new ResponseHeadersPolicy(this, "LandingHeaders", {
      securityHeadersBehavior: {
        ...commonSecurityHeaders,
        contentSecurityPolicy: {
          contentSecurityPolicy: appCsp,
          override: true,
        },
      },
    });

    const origin = new S3Origin(sourceBucket);

    const indexRewrite = new Function(this, 'IndexRewrite', {
      nameSuffix: "indexRewrite",
      code: FunctionCode.fromInline(handler.toString()),
    });

    // TODO: fix permanent diff on viewer certificate (min protocol TSLv1 and ssl_support_method SNI-only)
    //
    // There is no /blog/* behavior any more: it only existed to attach a
    // different CSP, and the whole site now shares one. Collapsing it also means
    // the viewer-request function runs for /blog/* too, which the old blog
    // redirects depend on.
    const distribution = new Distribution(this, "Cdn", {
      // TODO: add `aws-workshop.${domainName}` here once the retired workshop
      // distribution releases it. CloudFront rejects a CNAME that is still
      // attached to another distribution (CNAMEAlreadyExists), so moving the
      // subdomain is a separate cutover: detach there, attach here, then
      // destroy that stack. The viewer-request function already redirects that
      // host, so it starts working the moment the alias lands.
      ...(certificate ? { aliases: [domainName], certificate } : {}),
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy: appHeaders,
        functionAssociations: [{
          function: indexRewrite,
          eventType: FunctionEventType.VIEWER_REQUEST,
        }],
      },
      defaultRootObject: "index.html",
      // S3 with an OAI answers 403 (not 404) for a missing key, so both map to
      // the real 404 page. Previously both returned 200 /index.html, which made
      // every mistyped URL a soft 404.
      errorResponses: [404, 403].map(httpStatus => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: "/404.html",
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

/**
 * CloudFront viewer-request function.
 *
 * Only this function's own source is uploaded (`handler.toString()`), so every
 * helper and constant has to live inside it — nothing from module scope is
 * available at runtime. Kept to ES5 syntax for the cloudfront-js runtime.
 */
// @ts-ignore
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var hostHeader = request.headers.host;
  var host = hostHeader ? hostHeader.value : '';
  var SITE = 'https://terraconstructs.dev';
  // Set to a path to 301 there. Deliberately NOT a nested helper function:
  // esbuild appends a `__name(fn, "fn")` call to named inner functions, and
  // `__name` does not exist in the CloudFront runtime, so the whole function
  // throws on every request.
  var target = null;

  // Retired Hugo workshop on aws-workshop.terraconstructs.dev. The mapping is a
  // rule rather than a table: drop .html, drop each segment's ordering prefix,
  // and re-root under /workshops/aws/. A literal ~90-entry map would have eaten
  // most of the 10 KB function budget.
  //   /15-prerequisites/100-awscli.html -> /workshops/aws/prerequisites/awscli/
  if (host === 'aws-workshop.terraconstructs.dev') {
    var trimmed = uri.replace(/\.html$/, '').replace(/\/index$/, '');
    var parts = trimmed.split('/');
    var segments = [];
    for (var i = 0; i < parts.length; i++) {
      var segment = parts[i].replace(/^[0-9]+-/, '');
      if (segment) {
        segments.push(segment);
      }
    }
    target = '/workshops/aws/';
    if (segments.length) {
      target += segments.join('/') + '/';
    }
  } else {
    // Posts from the previous site. The new blog uses entirely different slugs
    // and none of these have an equivalent yet, so they land on the blog index.
    // TODO: point year-in-review at its own URL once that post is ported.
    var blogTargets = {
      '/blog/2025-10-01-terraconstructs-overview': '/blog/',
      '/blog/2025-11-01-1-1-the-problem': '/blog/',
      '/blog/2025-11-10-1-2-ai-impact-iac': '/blog/',
      '/blog/2025-11-25-1-3-grid-introduction': '/blog/',
      '/blog/2025-12-12-cdktf-future': '/blog/',
      '/blog/2025-12-25-year-in-review': '/blog/',
    };
    var blogKey = uri.replace(/\.html$/, '').replace(/\/$/, '');
    if (Object.prototype.hasOwnProperty.call(blogTargets, blogKey)) {
      target = blogTargets[blogKey];
    }
  }

  if (target) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: SITE + target } },
    };
  }

  // Static export shape: directory URLs resolve to their index.html.
  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  } else if (!uri.includes('.') && !uri.includes('?')) {
    request.uri += '/index.html';
  }
  return request;
}
