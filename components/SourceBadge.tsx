import clsx from 'clsx'

const SOURCE_COLORS: Record<string, string> = {
  google: 'bg-blue-900/40 text-blue-300 border-blue-800',
  dld: 'bg-green-900/40 text-green-300 border-green-800',
  manual: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  enrichment: 'bg-purple-900/40 text-purple-300 border-purple-800',
  linkedin: 'bg-sky-900/40 text-sky-300 border-sky-800',
  instagram: 'bg-pink-900/40 text-pink-300 border-pink-800',
}

const SOURCE_LABELS: Record<string, string> = {
  google: 'Google',
  dld: 'DLD/RERA',
  manual: 'Manual',
  enrichment: 'Enrichment',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
}

export default function SourceBadge({ source }: { source: string }) {
  const cls = SOURCE_COLORS[source] ?? 'bg-gray-800 text-gray-400 border-gray-700'
  return (
    <span className={clsx('text-xs px-1.5 py-0.5 rounded border font-medium', cls)}>
      {SOURCE_LABELS[source] ?? source}
    </span>
  )
}
