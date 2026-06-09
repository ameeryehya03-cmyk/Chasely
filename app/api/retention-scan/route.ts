export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  const sb = createServerClient()

  const { data, error } = await sb.from('stale_agents').select('*').limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ stale: data ?? [], count: data?.length ?? 0 })
}
