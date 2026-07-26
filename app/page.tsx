import type { Metadata } from 'next'
import { Hero } from '@/components/landing/hero'
import { DocumentsVsObjects } from '@/components/landing/documents-vs-objects'
import { TourSection } from '@/components/landing/tour-section'
import { Polymorphism } from '@/components/landing/polymorphism'
import { Capabilities } from '@/components/landing/capabilities'
import { Foundation } from '@/components/landing/foundation'
import { Agents } from '@/components/landing/agents'
import { CommunityCta } from '@/components/landing/community-cta'
import { SiteJsonLd } from '@/components/site/json-ld'

export const metadata: Metadata = {
  title: 'TerraConstructs — Infrastructure as actual code',
  description:
    'An Apache-2.0 L2 construct library for Terraform and OpenTofu. The AWS CDK asset pipeline, IAM grant SDK and Step Functions ASL, built on CDK Terrain.',
}

export default function Page() {
  return (
    <>
      <SiteJsonLd />
      <Hero />
      <DocumentsVsObjects />
      <TourSection />
      <Polymorphism />
      <Capabilities />
      <Foundation />
      <Agents />
      <CommunityCta />
    </>
  )
}
