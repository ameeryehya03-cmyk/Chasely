import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'AgentSource — Dubai Real Estate Lead Database',
  description: 'Internal agent sourcing platform for Dubai real estate outreach',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg text-[#e8e8f0]">
        <NavBar />
        <main className="max-w-[1600px] mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
