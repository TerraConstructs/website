/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the site is served from S3 behind CloudFront, so there is no
  // Next server at runtime. Every route is SSG already, so nothing is lost.
  output: 'export',
  // Emits `about/index.html` rather than `about.html`, which is what the
  // existing CloudFront viewer-request function rewrites extensionless URLs to.
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // NOTE: `redirects()` is inert under `output: 'export'`. The workshop and blog
  // redirects live in a CloudFront viewer-request function instead;
  // scripts/workshop-redirects.json is retained as its test fixture.
}

export default nextConfig
