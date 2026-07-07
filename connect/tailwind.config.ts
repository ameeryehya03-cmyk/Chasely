import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111111',
        'surface-2': '#161616',
        border: '#232323',
        'border-2': '#2e2e2e',
        accent: {
          DEFAULT: '#22c55e',
          dim: '#16a34a',
          bright: '#4ade80',
        },
        muted: '#8a8a8a',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
