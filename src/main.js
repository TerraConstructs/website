// Main entry point for TerraConstructs landing page
import './style.css'
import { initHighlighting } from './highlight-setup.js'

// Dark mode: localStorage + system preference
const root = document.documentElement
const THEME_KEY = 'tc-theme'

const applyTheme = (t) => {
  const isDark = t === 'dark' || (t == null && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
  const btn = document.getElementById('themeToggle')
  if (btn) btn.setAttribute('aria-pressed', String(isDark))
}

// Initialize theme
applyTheme(localStorage.getItem(THEME_KEY))

// Theme toggle buttons (desktop and mobile)
const toggleTheme = () => {
  const next = root.classList.contains('dark') ? 'light' : 'dark'
  localStorage.setItem(THEME_KEY, next)
  applyTheme(next)
}

document.getElementById('themeToggle')?.addEventListener('click', toggleTheme)
document.getElementById('themeToggleMobile')?.addEventListener('click', toggleTheme)

// Logo click to scroll to top
document.getElementById('logoButton')?.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
})

// Current year for footer
const yearEl = document.getElementById('year')
if (yearEl) {
  yearEl.textContent = new Date().getFullYear().toString()
}

// Demo functionality is now handled in highlight-setup.js

// Typewriter animation - JavaScript character typing
function initTypewriter() {
  const typewriterText = document.getElementById('typewriterText')
  const typewriterContent = document.getElementById('typewriterContent')
  const typewriterCursor = document.getElementById('typewriterCursor')
  
  if (!typewriterText || !typewriterContent || !typewriterCursor) return
  
  const text = typewriterText.dataset.text || ''
  let index = 0
  
  // Clear initial content
  typewriterContent.textContent = ''
  
  // Typing function
  function typeNextCharacter() {
    if (index < text.length) {
      typewriterContent.textContent += text.charAt(index)
      index++
      // Vary typing speed slightly for more natural effect
      const delay = Math.random() * 50 + 75 // 75-125ms between characters
      setTimeout(typeNextCharacter, delay)
    } else {
      // When done typing, keep cursor blinking
      typewriterCursor.classList.remove('animate-pulse')
      typewriterCursor.style.animation = 'blink 1s infinite'
    }
  }
  
  // Start typing after a short delay
  setTimeout(typeNextCharacter, 1000)
}

// Initialize typewriter when page loads
initTypewriter()

// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobileMenuButton')
const mobileMenu = document.getElementById('mobileMenu')

if (mobileMenuButton && mobileMenu) {
  const toggleMobileMenu = () => {
    const isOpen = mobileMenuButton.getAttribute('aria-expanded') === 'true'
    mobileMenuButton.setAttribute('aria-expanded', !isOpen)
    
    if (!isOpen) {
      // Open menu
      mobileMenu.classList.remove('opacity-0', 'invisible')
      mobileMenu.classList.add('opacity-100', 'visible')
    } else {
      // Close menu
      mobileMenu.classList.remove('opacity-100', 'visible')
      mobileMenu.classList.add('opacity-0', 'invisible')
    }
  }
  
  // Toggle menu on button click
  mobileMenuButton.addEventListener('click', toggleMobileMenu)
  
  // Close menu when clicking on menu links
  const mobileMenuLinks = mobileMenu.querySelectorAll('a')
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuButton.setAttribute('aria-expanded', 'false')
      mobileMenu.classList.remove('opacity-100', 'visible')
      mobileMenu.classList.add('opacity-0', 'invisible')
    })
  })
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
      if (mobileMenuButton.getAttribute('aria-expanded') === 'true') {
        mobileMenuButton.setAttribute('aria-expanded', 'false')
        mobileMenu.classList.remove('opacity-100', 'visible')
        mobileMenu.classList.add('opacity-0', 'invisible')
      }
    }
  })
}

// Initialize syntax highlighting
initHighlighting()