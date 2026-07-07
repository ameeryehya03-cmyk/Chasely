import { clsx } from 'clsx'

export default function Wordmark({ className }: { className?: string }) {
  return (
    <span className={clsx('font-display font-medium lowercase tracking-tight', className)}>
      kinleague<span className="text-accent">.</span>
    </span>
  )
}
