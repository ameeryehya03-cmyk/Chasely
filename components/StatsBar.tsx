'use client'
import { useEffect, useState } from 'react'

interface Stats {
  total: number
  with_phone: number
  with_email: number
  with_instagram: number
  suppressed: number
  by_status: Record<string, number>
  by_source: Record<string, number>
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
  }, [])

  if (!stats) return <div className="h-16 bg-surface rounded-lg animate-pulse" />

  const pctPhone = stats.total ? Math.round((stats.with_phone / stats.total) * 100) : 0
  const pctEmail = stats.total ? Math.round((stats.with_email / stats.total) * 100) : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <Stat label="Total Agents" value={stats.total.toLocaleString()} />
      <Stat label="Have Phone" value={stats.with_phone.toLocaleString()} sub={`${pctPhone}%`} />
      <Stat label="Have Email" value={stats.with_email.toLocaleString()} sub={`${pctEmail}%`} />
      <Stat label="Have Instagram" value={stats.with_instagram.toLocaleString()} />
      <Stat label="Suppressed" value={stats.suppressed.toLocaleString()} danger />
      <div className="bg-surface border border-border rounded-lg p-3">
        <div className="text-xs text-muted mb-1.5">By Source</div>
        <div className="flex flex-col gap-0.5">
          {Object.entries(stats.by_source).map(([src, n]) => (
            <div key={src} className="flex justify-between text-xs">
              <span className="text-muted capitalize">{src}</span>
              <span className="font-mono">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, sub, danger }: { label: string; value: string; sub?: string; danger?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3">
      <div className="text-xs text-muted mb-0.5">{label}</div>
      <div className={`text-xl font-bold font-mono ${danger ? 'text-danger' : ''}`}>{value}</div>
      {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
    </div>
  )
}
