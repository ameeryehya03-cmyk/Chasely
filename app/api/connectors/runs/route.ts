export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sb = createServerClient()
  const connector = req.nextUrl.searchParams.get('connector')

  let query = sb
    .from('connector_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(50)

  if (connector) query = query.eq('connector', connector)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ runs: data ?? [] })
}
