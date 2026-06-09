'use client'
import { useEffect, useState } from 'react'

interface Duplicate {
  id: string
  agent_id_a: string
  agent_id_b: string
  similarity_score: number | null
  match_reason: string | null
  created_at: string
  agent_a: { id: string; full_name: string | null; agency_name: string | null; phone: string | null; email: string | null; rera_brn: string | null } | null
  agent_b: { id: string; full_name: string | null; agency_name: string | null; phone: string | null; email: string | null; rera_brn: string | null } | null
}

export default function DuplicatesPage() {
  const [dups, setDups] = useState<Duplicate[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch('/api/duplicates')
      .then((r) => r.json())
      .then((d) => { setDups(d.duplicates ?? []); setLoading(false) })
  }

  useEffect(load, [])

  const resolve = async (id: string, action: 'merged' | 'dismissed') => {
    await fetch('/api/duplicates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    load()
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Duplicate Review</h1>
        <p className="text-sm text-muted">
          Low-confidence cross-source matches — never auto-merged. Review each pair manually.
        </p>
      </div>

      {loading && <div className="text-muted">Loading…</div>}
      {!loading && dups.length === 0 && (
        <div className="bg-surface border border-border rounded-lg p-8 text-center text-muted">
          No pending duplicate pairs.
        </div>
      )}

      <div className="space-y-3">
        {dups.map((d) => (
          <div key={d.id} className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-muted">Match: <span className="font-mono text-accent">{d.match_reason}</span></span>
              {d.similarity_score && (
                <span className="text-xs text-muted">Score: {(d.similarity_score * 100).toFixed(0)}%</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[d.agent_a, d.agent_b].map((a, i) => a && (
                <div key={i} className="bg-bg rounded-md p-3 text-sm">
                  <div className="font-semibold">{a.full_name ?? '—'}</div>
                  <div className="text-muted text-xs">{a.agency_name ?? ''}</div>
                  <div className="text-muted text-xs mt-1 font-mono">{a.phone ?? ''}</div>
                  <div className="text-muted text-xs font-mono">{a.email ?? ''}</div>
                  {a.rera_brn && <div className="text-xs text-muted mt-1">BRN: {a.rera_brn}</div>}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => resolve(d.id, 'merged')}
                className="px-3 py-1.5 text-sm bg-accent text-white rounded-md"
              >
                Merge (keep A)
              </button>
              <button
                onClick={() => resolve(d.id, 'dismissed')}
                className="px-3 py-1.5 text-sm border border-border rounded-md text-muted hover:text-[#e8e8f0]"
              >
                Not a duplicate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
