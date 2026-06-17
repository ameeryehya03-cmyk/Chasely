'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/sourcing', label: 'Sourcing' },
  { href: '/duplicates', label: 'Duplicates' },
  { href: '/compliance', label: 'Compliance' },
  { href: '/manual-entry', label: 'Manual Entry' },
  { href: '/kinley', label: 'Kinley' },
]

export default function NavBar() {
  const path = usePathname()
  return (
    <header className="border-b border-border bg-surface sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-6 h-12">
        <span className="font-extrabold text-lg tracking-tight">
          Agent<span className="text-accent">Source</span>
        </span>
        <nav className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                path === l.href
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-[#e8e8f0] hover:bg-surface-2'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
