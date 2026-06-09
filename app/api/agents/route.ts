export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sb = createServerClient()
  const { searchParams } = req.nextUrl

  const search = searchParams.get('search') ?? ''
  const source = searchParams.get('source') ?? ''
  const status = searchParams.get('status') ?? ''
  const hasPhone = searchParams.get('has_phone')
  const hasEmail = searchParams.get('has_email')
  const hasInstagram = searchParams.get('has_instagram')
  const notSuppressed = searchParams.get('not_suppressed')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const perPage = parseInt(searchParams.get('per_page') ?? '50', 10)
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = sb.from('agents_enriched').select('*', { count: 'exact' })

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,agency_name.ilike.%${search}%,rera_brn.ilike.%${search}%`
    )
  }

  if (status) query = query.eq('outreach_status', status)
  if (hasPhone === 'true') query = query.not('phone', 'is', null)
  if (hasEmail === 'true') query = query.not('email', 'is', null)
  if (hasInstagram === 'true') query = query.not('instagram_handle', 'is', null)
  if (notSuppressed === 'true') query = query.eq('on_suppression_list', false)

  if (source) {
    // Sub-select agents that have this source
    const { data: sourceAgents } = await sb
      .from('agent_sources')
      .select('agent_id')
      .eq('source_name', source)
    const ids = (sourceAgents ?? []).map((r) => r.agent_id)
    if (ids.length === 0) {
      return NextResponse.json({ agents: [], total: 0 })
    }
    query = query.in('id', ids)
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ agents: data ?? [], total: count ?? 0 })
}
