import * as fs from "node:fs";
import * as path from "node:path";
import { App, } from "cdktf/lib/app";
import { CloudinitProvider } from "@cdktf/provider-cloudinit/lib/provider";
import { provider } from "@tcons/provider-tconsaws";
import { Testing } from "cdktf/lib/testing";
import { CdkWorkshopStack } from "./stack";
import { execSync } from "node:child_process";

const outdir = "cdktf.out";
const app = Testing.app({
  outdir,
});
const stack = new CdkWorkshopStack(app, "Default", {
  environmentName: "demo",
  providerConfig: {
    region: "us-east-1",
  },
  gridUUID: "demo-uuid",
});
new CloudinitProvider(stack, "CloudInit");

const resultString = Testing.synth(stack);
fs.writeFileSync("cdk.tf.json", resultString);


const resultHclString = Testing.synthHcl(stack);
fs.writeFileSync("cdk.tf", resultHclString);
execSync("terraform fmt cdk.tf")

// // Copy the generated Terraform code to the current directory to keep relative directory references
// app.synth();
// const stackSynthDir = path.join(outdir, app.manifest.forStack(stack).workingDirectory);

// fs.cpSync(stackSynthDir, ".", { recursive: true });
// fs.rmSync(outdir, { recursive: true });
// if (process.env.CI) {
//   fs.renameSync("cdk.tf.json", "ci-cdk.tf.json");
// }
