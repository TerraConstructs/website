'use client'
import { useState } from 'react'
import Link from 'next/link'
import { EXTERNAL_LINKS } from '../utils/externalLinks'
import { Book, Github, MessageCircle, Menu, X } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-teal-400 text-white">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">TerraConstructs</Link>

          {/* Hamburger menu for mobile */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="focus:outline-none" aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-4">
            <Link href="#about" className="hover:text-blue-200 transition-colors">About</Link>
            <Link href="#roadmap" className="hover:text-blue-200 transition-colors">Roadmap</Link>
            <Link href={EXTERNAL_LINKS.docs} className="flex items-center hover:text-blue-200 transition-colors">
              <Book className="w-4 h-4 mr-1" />
              Docs
            </Link>
            <Link href={EXTERNAL_LINKS.github} className="flex items-center hover:text-blue-200 transition-colors">
              <Github className="w-4 h-4 mr-1" />
              GitHub
            </Link>
            <Link href={EXTERNAL_LINKS.discord} className="flex items-center hover:text-blue-200 transition-colors">
              <MessageCircle className="w-4 h-4 mr-1" />
              Discord
            </Link>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <div className="flex flex-col space-y-2">
              <Link href="#about" className="hover:text-blue-200 transition-colors py-2" onClick={toggleMenu}>About</Link>
              <Link href="#roadmap" className="hover:text-blue-200 transition-colors py-2" onClick={toggleMenu}>Roadmap</Link>
              <Link href={EXTERNAL_LINKS.docs} className="flex items-center hover:text-blue-200 transition-colors py-2" onClick={toggleMenu}>
                <Book className="w-4 h-4 mr-1" />
                Docs
              </Link>
              <Link href={EXTERNAL_LINKS.github} className="flex items-center hover:text-blue-200 transition-colors py-2" onClick={toggleMenu}>
                <Github className="w-4 h-4 mr-1" />
                GitHub
              </Link>
              <Link href={EXTERNAL_LINKS.discord} className="flex items-center hover:text-blue-200 transition-colors py-2" onClick={toggleMenu}>
                <MessageCircle className="w-4 h-4 mr-1" />
                Discord
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

