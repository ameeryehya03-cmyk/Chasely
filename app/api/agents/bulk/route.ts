export const dynamic = 'force-dynamic'
// Bulk actions: set status, add to suppression, tag, export CSV.
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const sb = createServerClient()
  const body = await req.json()
  const { action, agent_ids }: { action: string; agent_ids: string[] } = body

  if (!Array.isArray(agent_ids) || agent_ids.length === 0) {
    return NextResponse.json({ error: 'agent_ids required' }, { status: 400 })
  }

  if (action === 'set_status') {
    const { status } = body
    await sb.from('consent_and_outreach').upsert(
      agent_ids.map((id) => ({ agent_id: id, outreach_status: status })),
      { onConflict: 'agent_id' }
    )
    return NextResponse.json({ ok: true, updated: agent_ids.length })
  }

  if (action === 'add_to_suppression') {
    const { reason } = body
    // Fetch emails/phones for these agents
    const { data: agents } = await sb
      .from('agents')
      .select('id, email, phone')
      .in('id', agent_ids)

    await sb.from('suppression_list').insert(
      (agents ?? []).map((a) => ({
        agent_id: a.id,
        email: a.email,
        phone: a.phone,
        reason: reason ?? 'bulk_action',
      }))
    )
    return NextResponse.json({ ok: true, suppressed: agent_ids.length })
  }

  if (action === 'export_csv') {
    // Fetch agents, auto-excluding suppressed & opted-out.
    const { data: agents } = await sb
      .from('agents_enriched')
      .select('*')
      .in('id', agent_ids)
      .eq('on_suppression_list', false)
      .eq('opt_out', false)

    if (!agents?.length) {
      return NextResponse.json({ error: 'No exportable agents (all suppressed/opted-out)' }, { status: 400 })
    }

    const headers = [
      'id', 'full_name', 'agency_name', 'phone', 'email', 'whatsapp',
      'website', 'rera_brn', 'google_rating', 'address', 'outreach_status',
    ]
    const rows = agents.map((a) =>
      headers.map((h) => JSON.stringify((a as Record<string, unknown>)[h] ?? '')).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="agents_export_${Date.now()}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}
