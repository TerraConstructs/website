import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <p>&copy; {new Date().getFullYear()} TerraConstructs. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="hover:text-blue-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

