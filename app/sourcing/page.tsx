'use client'
import { useState, useRef } from 'react'
import type { ConnectorRun } from '@/lib/database.types'

const CONNECTORS = [
  {
    id: 'google',
    name: 'Google Places API',
    status: 'LIVE',
    statusColor: 'text-green-400',
    legal: 'Google Places API ToS — business data only',
    desc: 'Searches 18 Dubai area queries for real estate agents/brokers. Pulls name, phone, website, address, rating.',
  },
  {
    id: 'dld',
    name: 'DLD / RERA Registry',
    status: 'LIVE (import)',
    statusColor: 'text-green-400',
    legal: 'UAE public government register (Dubai Land Department)',
    desc: 'Import your 22,661-record CSV/XLSX. BRN is the authoritative key. Deduplicates against Google data.',
  },
  {
    id: 'enrichment',
    name: 'Contact Enrichment',
    status: 'STUBBED',
    statusColor: 'text-yellow-400',
    legal: 'Licensed B2B data provider (DPA required)',
    desc: 'Placeholder for a licensed provider (Apollo, Hunter, etc.) that warrants UAE PDPL-compliant data. Not active until configured.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    status: 'STUBBED',
    statusColor: 'text-yellow-400',
    legal: 'Official LinkedIn Partner API only — no scraping',
    desc: 'No HTML scraping. Activates only via official LinkedIn API or licensed data partner.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    status: 'STUBBED',
    statusColor: 'text-yellow-400',
    legal: 'Instagram Graph API (Meta Business account required)',
    desc: 'No consumer-site scraping. Public contact buttons via Graph API only.',
  },
  {
    id: 'dxbinteract',
    name: 'DXBInteract (fäm)',
    status: 'MANUAL ONLY',
    statusColor: 'text-orange-400',
    legal: 'No automated access — pending written data-license with fäm Properties',
    desc: 'Use the Manual Entry page to look up and paste individual agent details. Automated access is disabled by design.',
    noRun: true,
  },
]

export default function SourcingPage() {
  const [running, setRunning] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, { added: number; updated: number; errors: string[] }>>({})
  const [runs, setRuns] = useState<ConnectorRun[]>([])
  const [runsLoaded, setRunsLoaded] = useState(false)

  // DLD file upload
  const [dldFile, setDldFile] = useState<File | null>(null)
  const [dldLoading, setDldLoading] = useState(false)
  const [dldResult, setDldResult] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const runConnector = async (id: string) => {
    setRunning(id)
    const res = await fetch('/api/connectors/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connector: id }),
    })
    const data = await res.json()
    setResults((r) => ({ ...r, [id]: data }))
    setRunning(null)
  }

  const loadRuns = async () => {
    const res = await fetch('/api/connectors/runs')
    const data = await res.json()
    setRuns(data.runs ?? [])
    setRunsLoaded(true)
  }

  const uploadDld = async () => {
    if (!dldFile) return
    setDldLoading(true)
    setDldResult(null)
    const fd = new FormData()
    fd.append('file', dldFile)
    const res = await fetch('/api/dld-import', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setDldResult(`✓ ${data.added} added, ${data.updated} updated, ${data.skipped} skipped from ${data.total_records} records`)
    } else {
      setDldResult(`✗ ${data.error}`)
    }
    setDldLoading(false)
    setDldFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Data Sourcing</h1>
        <p className="text-sm text-muted">Run connectors to populate the agent database</p>
      </div>

      <div className="space-y-3 mb-8">
        {CONNECTORS.map((c) => {
          const r = results[c.id]
          const isRunning = running === c.id
          return (
            <div key={c.id} className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{c.name}</span>
                    <span className={`text-xs font-mono font-bold ${c.statusColor}`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-muted mt-0.5">{c.desc}</p>
                  <p className="text-xs text-muted/70 mt-1">Legal: {c.legal}</p>
                  {r && (
                    <div className="mt-2 text-xs">
                      {r.added !== undefined && (
                        <span className="text-green-400">+{r.added} added, ~{r.updated} updated</span>
                      )}
                      {r.errors?.length > 0 && (
                        <span className="text-danger ml-2">{r.errors[0]}</span>
                      )}
                    </div>
                  )}
                </div>

                {!c.noRun && c.id !== 'dld' && (
                  <button
                    onClick={() => runConnector(c.id)}
                    disabled={!!running || c.status === 'STUBBED'}
                    className="shrink-0 px-4 py-1.5 bg-accent text-white text-sm rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isRunning ? 'Running…' : 'Run'}
                  </button>
                )}
              </div>

              {/* DLD upload */}
              {c.id === 'dld' && (
                <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setDldFile(e.target.files?.[0] ?? null)}
                    className="text-sm text-muted"
                  />
                  <button
                    onClick={uploadDld}
                    disabled={!dldFile || dldLoading}
                    className="px-3 py-1 bg-accent text-white text-sm rounded-md disabled:opacity-40"
                  >
                    {dldLoading ? 'Importing…' : 'Import File'}
                  </button>
                  {dldResult && <span className="text-sm text-muted">{dldResult}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Run history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Run History</h2>
          <button onClick={loadRuns} className="text-sm text-accent hover:underline">
            {runsLoaded ? 'Refresh' : 'Load'}
          </button>
        </div>
        {runsLoaded && (
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-muted text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Connector</th>
                  <th className="px-3 py-2 text-left">Started</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Added</th>
                  <th className="px-3 py-2 text-right">Updated</th>
                  <th className="px-3 py-2 text-right">Failed</th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted">No runs yet</td></tr>
                )}
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="px-3 py-2 capitalize">{r.connector}</td>
                    <td className="px-3 py-2 text-muted text-xs">{new Date(r.started_at).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={r.status === 'completed' ? 'text-green-400' : r.status === 'failed' ? 'text-danger' : 'text-yellow-400'}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{r.records_added}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.records_updated}</td>
                    <td className="px-3 py-2 text-right font-mono text-danger">{r.records_failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
