import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} TerraConstructs. All rights reserved.</p>
            <p className="mt-2">
              TerraConstructs is free and open-source software licensed under the{' '}
              <a
                href="https://www.gnu.org/licenses/gpl-3.0.en.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-100 transition-colors"
              >
                GNU General Public License v3.0
              </a>
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/privacy" className="hover:text-blue-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

