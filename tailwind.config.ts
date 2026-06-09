import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#13131a',
        'surface-2': '#1a1a24',
        border: '#1e1e2e',
        'border-2': '#2a2a3e',
        accent: '#6c63ff',
        'accent-light': '#8b85ff',
        muted: '#6b6b80',
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
}

export default config
