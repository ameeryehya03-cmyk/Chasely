import Link from 'next/link'
import Wordmark from '@/components/Wordmark'

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8">
        <Wordmark className="text-xl" />
      </Link>
      <div className="card w-full max-w-sm p-6">
        <h1 className="font-display text-xl font-medium">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
