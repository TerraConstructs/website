const { execSync } = require('child_process');

const bucketName = 'terraconstructs-landing-dev';
const region = 'us-east-1';

function runCommand(command, errorMessage) {
  try {
    execSync(command, { stdio: 'inherit', env: process.env });
  } catch (error) {
    console.error(errorMessage, error);
    process.exit(1);
  }
}

console.log('Building the static site...');
runCommand('pnpm build', 'Error building the static site:');

// console.log(`Creating S3 bucket: ${bucketName}`);
// runCommand(`aws s3api create-bucket --bucket ${bucketName} --region ${region}`, 'Error creating S3 bucket:');

// console.log(`Configuring S3 bucket for static website hosting: ${bucketName}`);
// runCommand(`aws s3 website s3://${bucketName}/ --index-document index.html --error-document 404.html`, 'Error configuring S3 bucket:');

console.log(`Uploading files to S3 bucket: ${bucketName}`);
runCommand(`aws s3 sync out s3://${bucketName}/ --delete`, 'Error uploading files:');

// console.log(`Disabling BlockPublicPolicy for: ${bucketName}`);
// runCommand(`aws s3api put-public-access-block --bucket ${bucketName} --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false`, 'Error disabling BlockPublicPolicy:');

// const policy = `{
//   "Version":"2012-10-17",
//   "Statement":[{
//     "Sid":"PublicReadGetObject",
//     "Effect":"Allow",
//     "Principal": "*",
//     "Action":["s3:GetObject"],
//     "Resource":["arn:aws:s3:::${bucketName}/*"]
//   }]
// }`;

// console.log(`Setting bucket policy for: ${bucketName}`);
// runCommand(`aws s3api put-bucket-policy --bucket ${bucketName} --policy '${policy}'`, 'Error setting bucket policy:');

console.log(`Deployment complete! Your website is available at: http://${bucketName}.s3-website-${region}.amazonaws.com`);

