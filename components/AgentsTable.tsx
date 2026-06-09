'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { AgentEnriched, OutreachStatus } from '@/lib/database.types'
import SourceBadge from './SourceBadge'
import StatusBadge from './StatusBadge'
import AgentDetailPanel from './AgentDetailPanel'
import clsx from 'clsx'

const STATUSES: OutreachStatus[] = ['new', 'contacted', 'replied', 'meeting', 'won', 'dead']
const SOURCES = ['google', 'dld', 'manual', 'enrichment', 'linkedin', 'instagram']

interface Filters {
  search: string
  source: string
  status: string
  has_phone: boolean
  has_email: boolean
  has_instagram: boolean
  not_suppressed: boolean
}

interface AgentWithSources extends AgentEnriched {
  _sources?: string[]
}

export default function AgentsTable() {
  const [agents, setAgents] = useState<AgentWithSources[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    search: '', source: '', status: '',
    has_phone: false, has_email: false, has_instagram: false, not_suppressed: false,
  })
  const [bulkAction, setBulkAction] = useState('')
  const searchRef = useRef<ReturnType<typeof setTimeout>>()

  const perPage = 50

  const fetchAgents = useCallback(async (f: Filters, p: number) => {
    setLoading(true)
    const q = new URLSearchParams()
    if (f.search) q.set('search', f.search)
    if (f.source) q.set('source', f.source)
    if (f.status) q.set('status', f.status)
    if (f.has_phone) q.set('has_phone', 'true')
    if (f.has_email) q.set('has_email', 'true')
    if (f.has_instagram) q.set('has_instagram', 'true')
    if (f.not_suppressed) q.set('not_suppressed', 'true')
    q.set('page', String(p))
    q.set('per_page', String(perPage))

    const res = await fetch(`/api/agents?${q}`)
    const data = await res.json()
    setAgents(data.agents ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => fetchAgents(filters, page), 300)
    return () => clearTimeout(searchRef.current)
  }, [filters, page, fetchAgents])

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }
  const toggleAll = () => {
    if (selected.size === agents.length) setSelected(new Set())
    else setSelected(new Set(agents.map((a) => a.id)))
  }

  const runBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return
    const ids = [...selected]

    if (bulkAction === 'export_csv') {
      const res = await fetch('/api/agents/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export_csv', agent_ids: ids }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `agents_export.csv`; a.click()
        URL.revokeObjectURL(url)
      } else {
        const { error } = await res.json()
        alert(error)
      }
      return
    }

    if (bulkAction === 'suppress') {
      await fetch('/api/agents/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_to_suppression', agent_ids: ids, reason: 'manual_bulk' }),
      })
      fetchAgents(filters, page)
      setSelected(new Set())
      return
    }

    if (STATUSES.includes(bulkAction as OutreachStatus)) {
      await fetch('/api/agents/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_status', agent_ids: ids, status: bulkAction }),
      })
      fetchAgents(filters, page)
      setSelected(new Set())
    }
  }

  const updateFilter = (k: keyof Filters, v: string | boolean) => {
    setFilters((f) => ({ ...f, [k]: v }))
    setPage(1)
    setSelected(new Set())
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="flex gap-4">
      {/* Main panel */}
      <div className="flex-1 min-w-0">
        {/* Filters */}
        <div className="bg-surface border border-border rounded-lg p-3 mb-3 flex flex-wrap gap-2 items-center">
          <input
            className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:border-accent"
            placeholder="Search name, agency, BRN…"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          <select
            className="bg-bg border border-border rounded-md px-2 py-1.5 text-sm text-muted focus:outline-none focus:border-accent"
            value={filters.source}
            onChange={(e) => updateFilter('source', e.target.value)}
          >
            <option value="">All Sources</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select
            className="bg-bg border border-border rounded-md px-2 py-1.5 text-sm text-muted focus:outline-none focus:border-accent"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-muted cursor-pointer">
            <input type="checkbox" checked={filters.has_phone} onChange={(e) => updateFilter('has_phone', e.target.checked)} className="accent-accent" />
            Phone
          </label>
          <label className="flex items-center gap-1.5 text-sm text-muted cursor-pointer">
            <input type="checkbox" checked={filters.has_email} onChange={(e) => updateFilter('has_email', e.target.checked)} className="accent-accent" />
            Email
          </label>
          <label className="flex items-center gap-1.5 text-sm text-muted cursor-pointer">
            <input type="checkbox" checked={filters.has_instagram} onChange={(e) => updateFilter('has_instagram', e.target.checked)} className="accent-accent" />
            Instagram
          </label>
          <label className="flex items-center gap-1.5 text-sm text-muted cursor-pointer">
            <input type="checkbox" checked={filters.not_suppressed} onChange={(e) => updateFilter('not_suppressed', e.target.checked)} className="accent-accent" />
            Not Suppressed
          </label>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="bg-surface-2 border border-accent/30 rounded-lg p-2 mb-3 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-accent font-medium">{selected.size} selected</span>
            <select
              className="bg-bg border border-border rounded-md px-2 py-1 text-sm text-muted focus:outline-none"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Bulk action…</option>
              <option value="export_csv">Export CSV</option>
              <option value="suppress">Add to Suppression</option>
              <optgroup label="Set Status">
                {STATUSES.map((s) => <option key={s} value={s}>→ {s}</option>)}
              </optgroup>
            </select>
            <button
              onClick={runBulkAction}
              disabled={!bulkAction}
              className="px-3 py-1 bg-accent text-white text-sm rounded-md disabled:opacity-40"
            >
              Apply
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-sm text-muted hover:text-[#e8e8f0]">Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-muted text-xs uppercase tracking-wide">
                <tr>
                  <th className="pl-3 py-2.5 w-8">
                    <input type="checkbox" checked={selected.size === agents.length && agents.length > 0} onChange={toggleAll} className="accent-accent" />
                  </th>
                  <th className="px-3 py-2.5 text-left">Name / Agency</th>
                  <th className="px-3 py-2.5 text-left">Phone</th>
                  <th className="px-3 py-2.5 text-left">Email</th>
                  <th className="px-3 py-2.5 text-left">Source</th>
                  <th className="px-3 py-2.5 text-left">Rating</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-left">BRN</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className="text-center py-12 text-muted">Loading…</td></tr>
                )}
                {!loading && agents.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-muted">No agents found</td></tr>
                )}
                {!loading && agents.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setActiveAgent(a.id === activeAgent ? null : a.id)}
                    className={clsx(
                      'border-b border-border/60 cursor-pointer transition-colors',
                      a.id === activeAgent ? 'bg-accent/10' : 'hover:bg-surface-2',
                      a.on_suppression_list && 'opacity-50'
                    )}
                  >
                    <td className="pl-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} className="accent-accent" />
                    </td>
                    <td className="px-3 py-2.5 max-w-[200px]">
                      <div className="font-medium truncate">{a.full_name ?? '—'}</div>
                      <div className="text-muted text-xs truncate">{a.agency_name ?? ''}</div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted">{a.phone ?? '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-muted max-w-[160px] truncate">{a.email ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      {a._sources?.map((s) => <SourceBadge key={s} source={s} />) ?? (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {a.google_rating ? (
                        <span className="text-yellow-400">★ {a.google_rating}</span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={a.outreach_status ?? 'new'} />
                      {a.on_suppression_list && (
                        <span className="ml-1 text-xs text-danger border border-danger/30 px-1 rounded">suppressed</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-mono text-muted">{a.rera_brn ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border text-sm text-muted">
            <span>{total.toLocaleString()} total</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-0.5 rounded border border-border disabled:opacity-30 hover:border-accent"
              >
                ‹
              </button>
              <span>{page} / {totalPages || 1}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-0.5 rounded border border-border disabled:opacity-30 hover:border-accent"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {activeAgent && (
        <AgentDetailPanel
          agentId={activeAgent}
          onClose={() => setActiveAgent(null)}
          onUpdated={() => fetchAgents(filters, page)}
        />
      )}
    </div>
  )
}
