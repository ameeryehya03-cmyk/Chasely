'use client'
import { useEffect, useState } from 'react'
import type { AgentEnriched, ContactProvenance, AgentSource, OutreachStatus } from '@/lib/database.types'
import SourceBadge from './SourceBadge'
import StatusBadge from './StatusBadge'

interface Detail {
  agent: AgentEnriched
  sources: AgentSource[]
  provenance: ContactProvenance[]
  outreach: { outreach_status: OutreachStatus; notes: string | null; opt_out: boolean } | null
}

const STATUSES: OutreachStatus[] = ['new', 'contacted', 'replied', 'meeting', 'won', 'dead']

export default function AgentDetailPanel({
  agentId, onClose, onUpdated,
}: {
  agentId: string
  onClose: () => void
  onUpdated: () => void
}) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<OutreachStatus>('new')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/agents/${agentId}`)
      .then((r) => r.json())
      .then((d) => {
        setDetail(d)
        setStatus(d.outreach?.outreach_status ?? 'new')
        setNotes(d.outreach?.notes ?? '')
        setLoading(false)
      })
  }, [agentId])

  const saveStatus = async () => {
    setSaving(true)
    await fetch(`/api/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outreach_status: status, outreach_notes: notes }),
    })
    setSaving(false)
    onUpdated()
  }

  const suppress = async () => {
    if (!confirm('Add this agent to the suppression list?')) return
    await fetch('/api/suppression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: agentId,
        email: detail?.agent.email,
        phone: detail?.agent.phone,
        reason: 'manual',
      }),
    })
    onUpdated()
    onClose()
  }

  const erase = async () => {
    if (!confirm('Permanently delete ALL data for this agent? This cannot be undone.')) return
    await fetch(`/api/agents/${agentId}`, { method: 'DELETE' })
    onUpdated()
    onClose()
  }

  const exportData = () => {
    window.open(`/api/agents/${agentId}/export`, '_blank')
  }

  const provenanceByField = (field: string) =>
    detail?.provenance.find((p) => p.field_name === field)

  if (loading) return (
    <div className="w-80 shrink-0 bg-surface border border-border rounded-lg p-4 animate-pulse" />
  )
  if (!detail) return null

  const a = detail.agent

  return (
    <div className="w-80 shrink-0 bg-surface border border-border rounded-lg overflow-hidden flex flex-col max-h-[calc(100vh-8rem)] sticky top-20">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="min-w-0">
          <div className="font-semibold truncate">{a.full_name ?? 'Unknown'}</div>
          <div className="text-sm text-muted truncate">{a.agency_name ?? ''}</div>
          <div className="flex gap-1 flex-wrap mt-1">
            {detail.sources.map((s) => <SourceBadge key={s.id} source={s.source_name} />)}
          </div>
        </div>
        <button onClick={onClose} className="text-muted hover:text-[#e8e8f0] ml-2 shrink-0">✕</button>
      </div>

      <div className="overflow-y-auto flex-1 p-4 space-y-4">
        {/* Contact fields */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Contact</h3>
          <div className="space-y-2">
            <Field label="Phone" value={a.phone} provenance={provenanceByField('phone')} />
            <Field label="Email" value={a.email} provenance={provenanceByField('email')} />
            <Field label="WhatsApp" value={a.whatsapp} provenance={provenanceByField('whatsapp')} />
            <Field label="Website" value={a.website} href={a.website ?? undefined} provenance={provenanceByField('website')} />
            <Field label="Instagram" value={a.instagram_handle ? `@${a.instagram_handle}` : null} provenance={provenanceByField('instagram_handle')} />
            <Field label="LinkedIn" value={a.linkedin_url} href={a.linkedin_url ?? undefined} provenance={provenanceByField('linkedin_url')} />
          </div>
        </section>

        {/* RERA */}
        {a.rera_brn && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">RERA</h3>
            <Field label="BRN" value={a.rera_brn} provenance={provenanceByField('rera_brn')} />
          </section>
        )}

        {/* Google */}
        {a.google_rating && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Google</h3>
            <div className="text-sm">
              <span className="text-yellow-400">★ {a.google_rating}</span>
              <span className="text-muted ml-1">({a.google_review_count ?? 0} reviews)</span>
            </div>
            <div className="text-xs text-muted mt-1 truncate">{a.address}</div>
          </section>
        )}

        {/* Outreach */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Outreach</h3>
          {a.on_suppression_list && (
            <div className="text-xs text-danger border border-danger/30 rounded p-1.5 mb-2">
              On suppression list — excluded from exports
            </div>
          )}
          {detail.outreach?.opt_out && (
            <div className="text-xs text-warning border border-warning/30 rounded p-1.5 mb-2">
              Opted out
            </div>
          )}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OutreachStatus)}
            className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-accent mb-2"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes…"
            rows={2}
            className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-sm resize-none focus:outline-none focus:border-accent"
          />
          <button
            onClick={saveStatus}
            disabled={saving}
            className="mt-2 w-full py-1.5 bg-accent text-white text-sm rounded-md disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </section>
      </div>

      {/* Actions footer */}
      <div className="border-t border-border p-3 flex gap-2 flex-wrap">
        <button
          onClick={exportData}
          className="flex-1 py-1.5 text-xs border border-border rounded-md text-muted hover:text-[#e8e8f0] hover:border-accent"
          title="UAE PDPL Art. 19 — Data subject access"
        >
          Export Data
        </button>
        <button
          onClick={suppress}
          className="flex-1 py-1.5 text-xs border border-danger/40 rounded-md text-danger hover:bg-danger/10"
        >
          Suppress
        </button>
        <button
          onClick={erase}
          className="flex-1 py-1.5 text-xs border border-danger/40 rounded-md text-danger hover:bg-danger/10"
          title="UAE PDPL — Right to erasure"
        >
          Erase
        </button>
      </div>
    </div>
  )
}

function Field({
  label, value, href, provenance,
}: {
  label: string
  value: string | null | undefined
  href?: string
  provenance?: ContactProvenance
}) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="text-muted shrink-0 w-20">{label}</span>
      <div className="text-right min-w-0">
        {href ? (
          <a
            href={href.startsWith('http') ? href : `https://${href}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-light hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <span className="font-mono break-all">{value}</span>
        )}
        {provenance && (
          <div className="text-[10px] text-muted mt-0.5">
            via {provenance.source_name} · {provenance.legal_basis}
          </div>
        )}
      </div>
    </div>
  )
}
