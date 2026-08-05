import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { SiteNav } from '@/components/site/site-nav'
import { SiteFooter } from '@/components/site/site-footer'
import { Analytics } from '@/components/site/analytics'
import { ogImage } from '@/lib/site'
import './globals.css'

const _geistSans = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://terraconstructs.dev'),
  title: {
    default: 'TerraConstructs — Infrastructure as actual code',
    template: '%s · TerraConstructs',
  },
  description:
    'An Apache-2.0 L2 construct library for Terraform and OpenTofu. The AWS CDK asset pipeline, IAM grant SDK and Step Functions ASL, built on CDK Terrain.',
  generator: 'v0.app',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'TerraConstructs',
    title: 'TerraConstructs — Infrastructure as actual code',
    description:
      'Typed constructs with behaviour, not documents to be merged and templated. Apache-2.0, built on CDK Terrain for Terraform and OpenTofu.',
    images: [{ url: ogImage('/'), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    // The triangle mark's palette (purple fill, dark stroke) reads fine on
    // both light and dark backgrounds, so there's no need for separate
    // light/dark favicon variants the way the old hand-made icons had.
    icon: [
      {
        url: '/logos/terraconstructs_logo_32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/logos/terraconstructs_triangle_logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logos/terraconstructs_logo_512x512.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#191722' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className="bg-background"
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          value={{ dark: 'dark', light: 'light' }}
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-brand focus:px-3 focus:py-2 focus:text-sm focus:text-brand-foreground"
          >
            Skip to content
          </a>
          <SiteNav />
          <main id="main">{children}</main>
          <SiteFooter />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' ? <Analytics /> : null}
      </body>
    </html>
  )
}
