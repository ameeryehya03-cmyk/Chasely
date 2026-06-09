export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const sb = createServerClient()

  const [totalRes, phoneRes, emailRes, instaRes, suppRes, statusRes, sourceRes] =
    await Promise.all([
      sb.from('agents').select('id', { count: 'exact', head: true }),
      sb.from('agents').select('id', { count: 'exact', head: true }).not('phone', 'is', null),
      sb.from('agents').select('id', { count: 'exact', head: true }).not('email', 'is', null),
      sb.from('agents').select('id', { count: 'exact', head: true }).not('instagram_handle', 'is', null),
      sb.from('suppression_list').select('id', { count: 'exact', head: true }),
      sb.from('consent_and_outreach').select('outreach_status'),
      sb.from('agent_sources').select('source_name'),
    ])

  const statusCounts: Record<string, number> = {}
  for (const row of statusRes.data ?? []) {
    statusCounts[row.outreach_status] = (statusCounts[row.outreach_status] ?? 0) + 1
  }

  const sourceCounts: Record<string, number> = {}
  for (const row of sourceRes.data ?? []) {
    sourceCounts[row.source_name] = (sourceCounts[row.source_name] ?? 0) + 1
  }

  return NextResponse.json({
    total: totalRes.count ?? 0,
    with_phone: phoneRes.count ?? 0,
    with_email: emailRes.count ?? 0,
    with_instagram: instaRes.count ?? 0,
    suppressed: suppRes.count ?? 0,
    by_status: statusCounts,
    by_source: sourceCounts,
  })
}
