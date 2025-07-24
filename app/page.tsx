import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { EXTERNAL_LINKS } from '../utils/externalLinks'
import dynamic from 'next/dynamic'
import { Roadmap } from '../components/Roadmap'

const CodeSamples = dynamic(() => import('../components/CodeSamples').then((mod) => mod.CodeSamples), { ssr: false })

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-600 to-teal-400 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">TerraConstructs</h1>
            <p className="text-xl mb-8">Empowering Infrastructure as Code with Reusable Constructs</p>
            <Link
              href={EXTERNAL_LINKS.awsWorkshop}
              className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-100 transition-colors inline-flex items-center"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Alpha Status Note */}
        <section className="bg-yellow-100 py-4">
          <div className="container mx-auto px-4 text-center">
            <p className="text-yellow-800">
              <strong>Note:</strong> TerraConstructs is currently in alpha. We&apos;ve just announced and are actively developing new features and improving stability.
            </p>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">About TerraConstructs</h2>
            <div className="flex flex-col gap-12 items-center">
              <div className="max-w-3xl">
                <p className="text-lg mb-4 text-justify">
                  TerraConstructs is a powerful library that combines the flexibility of Terraform with the intuitive design of AWS CDK. Built on CDKTF, it enables developers to define cloud infrastructure using object-oriented programming, while leveraging Terraform/OpenTofu&apos;s extensive provider ecosystem.
                </p>
                <p className="text-lg text-justify">
                  As a free and open-source project under the Apache 2 license, TerraConstructs offers an exceptional developer experience for creating modular, maintainable infrastructure as code across multiple cloud platforms.
                </p>
              </div>
              <div className="w-full">
                <CodeSamples initialLanguage="typescript" />
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section id="roadmap" className="bg-gray-100 py-20">
          <div className="container mx-auto px-4">
            <Roadmap />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Dive In?</h2>
            <p className="text-xl mb-8">Explore our playground for interactive samples and start contributing to build developer friendly infrastructure as code!</p>
            <div className="flex justify-center space-x-4">
              <Link
                href={EXTERNAL_LINKS.docs}
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                Explore Docs
              </Link>
              <Link
                href={EXTERNAL_LINKS.learn}
                className="bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-900 transition-colors"
              >
                Try Playground (Beta)
              </Link>
              <Link
                href={EXTERNAL_LINKS.github}
                className="bg-gray-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-900 transition-colors"
              >
                View on GitHub
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

