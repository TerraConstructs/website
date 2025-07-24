import './globals.css'
import { Inter } from 'next/font/google'
import { StructuredData } from '../components/StructuredData'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TerraConstructs - Infrastructure as Code Library',
  description: 'Empowering Infrastructure as Code with Reusable Constructs. Build cloud infrastructure using object-oriented programming with Terraform/OpenTofu providers.',
  keywords: 'infrastructure as code, terraform, cdktf, aws cdk, cloud infrastructure, devops, terraform constructs, infrastructure automation, cloud development',
  authors: [{ name: 'TerraConstructs Team' }],
  creator: 'TerraConstructs',
  publisher: 'TerraConstructs',
  robots: 'index, follow',
  metadataBase: new URL('https://terraconstructs.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://terraconstructs.dev',
    title: 'TerraConstructs - Infrastructure as Code Library',
    description: 'Empowering Infrastructure as Code with Reusable Constructs. Build cloud infrastructure using object-oriented programming with Terraform/OpenTofu providers.',
    siteName: 'TerraConstructs',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <StructuredData />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

