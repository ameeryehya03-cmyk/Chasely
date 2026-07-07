import Link from 'next/link'
import Wordmark from '@/components/Wordmark'
import VerifiedBadge from '@/components/VerifiedBadge'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-6 py-5">
        <Wordmark className="text-xl" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="label-mono mb-6">UAE Real Estate &middot; Verified Terms</span>
        <h1 className="max-w-2xl font-display text-4xl font-medium leading-tight sm:text-5xl">
          Brokerage terms, laid out in the open.
        </h1>
        <p className="mt-5 max-w-xl text-muted">
          Commission splits, lead flow, visa support, marketing budget — verified before you
          ever have to ask.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/auth/signup?role=agent"
            className="rounded-md bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wider text-black transition hover:bg-accent-bright"
          >
            I&apos;m an agent
          </Link>
          <Link
            href="/auth/signup?role=brokerage"
            className="rounded-md border border-border-2 px-6 py-3 font-mono text-sm uppercase tracking-wider transition hover:border-accent hover:text-accent"
          >
            We&apos;re hiring
          </Link>
        </div>

        <div className="mt-16">
          <VerifiedBadge />
        </div>
      </main>

      <footer className="border-t border-border px-6 py-5 text-center">
        <span className="label-mono">A KinLeague product</span>
      </footer>
    </div>
  )
}
