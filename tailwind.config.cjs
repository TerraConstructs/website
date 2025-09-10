/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        paper: '#ffffff', 
        accent: '#6E59FF',
        neutral: '#EDEDED',
        'neutral-dark': '#1a1a1a'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        neo: '8px 8px 0 0 #000',
        'neo-sm': '4px 4px 0 0 #000'
      },
      borderWidth: {
        3: '3px'
      },
      animation: {
        'badge-pulse': 'badge 2s ease-out infinite',
        'card-pop': 'cardpop 250ms ease-out',
        'typewriter': 'type 6s steps(40, end) 1',
        'caret': 'blink 1s step-end infinite'
      },
      keyframes: {
        badge: { 
          '0%,100%': { transform: 'translateY(0)' }, 
          '50%': { transform: 'translateY(-2px)' } 
        },
        cardpop: { 
          from: { transform: 'translateY(4px)' }, 
          to: { transform: 'translateY(0)' } 
        },
        type: { 
          from: { width: '0' }, 
          to: { width: '100%' } 
        },
        blink: { 
          '0%,100%': { 'border-color': 'transparent' }, 
          '50%': { 'border-color': '#111111' } 
        }
      }
    }
  },
  plugins: []
}

