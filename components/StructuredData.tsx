export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TerraConstructs",
    "url": "https://terraconstructs.dev",
    "description": "Empowering Infrastructure as Code with Reusable Constructs. Build cloud infrastructure using object-oriented programming with Terraform/OpenTofu providers.",
    "foundingDate": "2024",
    "sameAs": [
      "https://github.com/terraconstructs/base",
      "https://discord.gg/gEu3D8hJGz"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Community Support",
      "url": "https://discord.gg/gEu3D8hJGz"
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TerraConstructs",
    "url": "https://terraconstructs.dev",
    "description": "Infrastructure as Code Library for building cloud infrastructure with reusable constructs",
    "publisher": {
      "@type": "Organization",
      "name": "TerraConstructs"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://github.com/terraconstructs/base/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TerraConstructs",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform",
    "description": "Infrastructure as Code library that combines Terraform flexibility with AWS CDK design patterns",
    "url": "https://terraconstructs.dev",
    "downloadUrl": "https://www.npmjs.com/package/terraconstructs",
    "programmingLanguage": ["TypeScript", "JavaScript", "Python"],
    "license": "https://www.apache.org/licenses/LICENSE-2.0",
    "version": "0.1.2",
    "author": {
      "@type": "Organization",
      "name": "TerraConstructs"
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://terraconstructs.dev"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About",
        "item": "https://terraconstructs.dev/#about"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Roadmap",
        "item": "https://terraconstructs.dev/#roadmap"
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  )
}