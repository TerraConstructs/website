import workshopRedirects from './scripts/workshop-redirects.json' with { type: 'json' }

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // The Hugo workshop lived on its own subdomain with uglyurls (.html). These
  // keep those links alive once aws-workshop.terraconstructs.dev is retired.
  async redirects() {
    return workshopRedirects
  },
}

export default nextConfig
