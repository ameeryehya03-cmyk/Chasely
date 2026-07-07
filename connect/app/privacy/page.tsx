import Link from 'next/link'
import Wordmark from '@/components/Wordmark'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="mb-8 inline-block">
        <Wordmark className="text-lg" />
      </Link>
      <span className="label-mono">PDPL notice</span>
      <h1 className="mt-2 font-display text-2xl font-medium">Privacy notice</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        This is a placeholder privacy notice. The full PDPL-compliant policy — covering what
        KinLeague Connect collects, why, how long it&apos;s retained, and how to request deletion
        — is written as part of the final polish pass before launch.
      </p>
    </div>
  )
}
