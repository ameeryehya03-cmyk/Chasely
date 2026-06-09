'use client'
import { useEffect, useState } from 'react'

interface SuppressionEntry {
  id: string
  agent_id: string | null
  email: string | null
  phone: string | null
  reason: string | null
  added_at: string
  agents?: { full_name: string | null; agency_name: string | null }
}

interface StaleAgent {
  id: string
  full_name: string | null
  agency_name: string | null
  updated_at: string
  age: string
}

export default function CompliancePage() {
  const [suppressed, setSuppressed] = useState<SuppressionEntry[]>([])
  const [stale, setStale] = useState<StaleAgent[]>([])
  const [tab, setTab] = useState<'suppression' | 'retention'>('suppression')

  useEffect(() => {
    if (tab === 'suppression') {
      fetch('/api/suppression')
        .then((r) => r.json())
        .then((d) => setSuppressed(d.suppressed ?? []))
    }
  }, [tab])

  const removeSuppression = async (id: string) => {
    await fetch('/api/suppression', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setSuppressed((s) => s.filter((e) => e.id !== id))
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Compliance</h1>
        <p className="text-sm text-muted">UAE PDPL (Federal Decree-Law No. 45 of 2021) controls</p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <InfoCard title="Suppression List" desc="Anyone here is excluded from all CSV exports and outreach actions. One-click to add from the agent panel." />
        <InfoCard title="Right to Erasure (Art. 20)" desc="Delete all stored data for any agent on demand via the agent detail panel → Erase." />
        <InfoCard title="Data Access (Art. 19)" desc="Export all stored data for any agent as JSON via the agent detail panel → Export Data." />
        <InfoCard title="Retention Review" desc="Records not touched in 12+ months are flagged for review. Run the retention scan below." />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-bg border border-border rounded-lg p-1 w-fit">
        {(['suppression', 'retention'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${tab === t ? 'bg-accent text-white' : 'text-muted hover:text-[#e8e8f0]'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'suppression' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{suppressed.length} suppressed entries</h2>
          </div>
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-muted text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Agent</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-left">Added</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {suppressed.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted">Suppression list is empty</td></tr>
                )}
                {suppressed.map((e) => (
                  <tr key={e.id} className="border-b border-border/60">
                    <td className="px-3 py-2">
                      <div>{e.agents?.full_name ?? '—'}</div>
                      <div className="text-xs text-muted">{e.agents?.agency_name ?? ''}</div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted">{e.phone ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-muted">{e.email ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-muted">{e.reason ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-muted">{new Date(e.added_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeSuppression(e.id)}
                        className="text-xs text-danger hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'retention' && (
        <RetentionTab stale={stale} setStale={setStale} />
      )}
    </div>
  )
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="font-semibold text-sm mb-1">{title}</div>
      <div className="text-xs text-muted">{desc}</div>
    </div>
  )
}

function RetentionTab({ stale, setStale }: { stale: StaleAgent[]; setStale: (s: StaleAgent[]) => void }) {
  const [loading, setLoading] = useState(false)

  const scan = async () => {
    setLoading(true)
    const res = await fetch('/api/retention-scan', { method: 'POST' })
    const data = await res.json()
    setStale(data.stale ?? [])
    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <p className="text-sm text-muted">
          Agents not updated in 12+ months should be reviewed — confirm they are still active or delete their records.
        </p>
        <button
          onClick={scan}
          disabled={loading}
          className="shrink-0 px-4 py-1.5 text-sm bg-accent text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Scanning…' : 'Run Scan'}
        </button>
      </div>
      {stale.length > 0 && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-muted text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Agent</th>
                <th className="px-3 py-2 text-left">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {stale.map((a) => (
                <tr key={a.id} className="border-b border-border/60">
                  <td className="px-3 py-2">
                    <div>{a.full_name ?? '—'}</div>
                    <div className="text-xs text-muted">{a.agency_name ?? ''}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-danger">
                    {new Date(a.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
