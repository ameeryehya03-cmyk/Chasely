'use client'
import { useState } from 'react'

// IMPORTANT: Automated access to dxbinteract.com is DISABLED BY DESIGN.
// This form is for MANUAL data entry only. When using dxbinteract.com as a
// reference, look up the agent yourself and paste the details here.
// Automated scraping/crawling of dxbinteract.com is not implemented and will
// not be added without a written data-license agreement with fäm Properties.

export default function ManualEntryPage() {
  const [form, setForm] = useState({
    full_name: '',
    agency_name: '',
    phone: '',
    email: '',
    whatsapp: '',
    instagram_handle: '',
    website: '',
    rera_brn: '',
    address: '',
    reference_notes: '',
    specialization_areas: '',
    languages: '',
  })
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setResult(null)

    const payload = {
      ...form,
      specialization_areas: form.specialization_areas
        .split(',').map((s) => s.trim()).filter(Boolean),
      languages: form.languages
        .split(',').map((s) => s.trim()).filter(Boolean),
    }

    const res = await fetch('/api/manual-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (res.ok) {
      setResult({ success: `Agent saved (ID: ${data.agent_id})${data.created ? ' — new record' : ' — updated existing'}` })
      setForm({
        full_name: '', agency_name: '', phone: '', email: '', whatsapp: '',
        instagram_handle: '', website: '', rera_brn: '', address: '',
        reference_notes: '', specialization_areas: '', languages: '',
      })
    } else {
      setResult({ error: data.error ?? 'Unknown error' })
    }
    setSaving(false)
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Manual Entry</h1>
        <p className="text-sm text-muted">Add an agent record manually (e.g. from dxbinteract.com as a reference)</p>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 mb-6 text-sm text-yellow-300">
        <strong>Note:</strong> This form is for manual data entry only. Automated access to dxbinteract.com
        is disabled by design pending a written data-license agreement with fäm Properties. Source is
        flagged as <code className="font-mono">manual / dxbinteract reference</code>.
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Section title="Identity">
          <Field label="Full Name *" value={form.full_name} onChange={(v) => set('full_name', v)} required />
          <Field label="Agency Name" value={form.agency_name} onChange={(v) => set('agency_name', v)} />
          <Field label="RERA BRN" value={form.rera_brn} onChange={(v) => set('rera_brn', v)} placeholder="e.g. BRN-12345" />
        </Section>

        <Section title="Contact">
          <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} placeholder="+971 50 123 4567" />
          <Field label="Email" value={form.email} onChange={(v) => set('email', v)} type="email" />
          <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => set('whatsapp', v)} placeholder="+971 50 123 4567" />
          <Field label="Website" value={form.website} onChange={(v) => set('website', v)} />
          <Field label="Instagram Handle" value={form.instagram_handle} onChange={(v) => set('instagram_handle', v)} placeholder="without @" />
        </Section>

        <Section title="Location & Profile">
          <Field label="Address / Area" value={form.address} onChange={(v) => set('address', v)} />
          <Field label="Specializations (comma-sep)" value={form.specialization_areas} onChange={(v) => set('specialization_areas', v)} placeholder="Business Bay, Marina, JVC" />
          <Field label="Languages (comma-sep)" value={form.languages} onChange={(v) => set('languages', v)} placeholder="English, Arabic, Hindi" />
        </Section>

        <Section title="Reference Notes">
          <Field
            label="Notes (internal — not exported)"
            value={form.reference_notes}
            onChange={(v) => set('reference_notes', v)}
            placeholder="e.g. verified via dxbinteract.com on 2025-01-15"
          />
        </Section>

        {result?.success && (
          <div className="text-sm text-green-400 border border-green-800 rounded-lg p-3">{result.success}</div>
        )}
        {result?.error && (
          <div className="text-sm text-danger border border-danger/30 rounded-lg p-3">{result.error}</div>
        )}

        <button
          type="submit"
          disabled={saving || !form.full_name}
          className="w-full py-2.5 bg-accent text-white font-semibold rounded-md disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Agent'}
        </button>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, required, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void
  required?: boolean; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs text-muted block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-bg border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
      />
    </div>
  )
}
