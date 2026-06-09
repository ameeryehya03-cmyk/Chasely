import clsx from 'clsx'
import type { OutreachStatus } from '@/lib/database.types'

const STATUS: Record<OutreachStatus, { label: string; cls: string }> = {
  new:       { label: 'New',       cls: 'bg-gray-800 text-gray-300 border-gray-700' },
  contacted: { label: 'Contacted', cls: 'bg-blue-900/40 text-blue-300 border-blue-800' },
  replied:   { label: 'Replied',   cls: 'bg-purple-900/40 text-purple-300 border-purple-800' },
  meeting:   { label: 'Meeting',   cls: 'bg-yellow-900/40 text-yellow-300 border-yellow-800' },
  won:       { label: 'Won',       cls: 'bg-green-900/40 text-green-300 border-green-800' },
  dead:      { label: 'Dead',      cls: 'bg-red-900/40 text-red-400 border-red-900' },
}

export default function StatusBadge({ status }: { status: OutreachStatus | string }) {
  const s = STATUS[status as OutreachStatus] ?? { label: status, cls: 'bg-gray-800 text-gray-300 border-gray-700' }
  return (
    <span className={clsx('text-xs px-1.5 py-0.5 rounded border font-medium', s.cls)}>
      {s.label}
    </span>
  )
}
