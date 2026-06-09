export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('suppression_list')
    .select('*, agents(full_name, agency_name, email, phone)')
    .order('added_at', { ascending: false })
    .limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ suppressed: data ?? [] })
}

export async function POST(req: NextRequest) {
  const sb = createServerClient()
  const body = await req.json()
  const { agent_id, email, phone, reason } = body

  const { data, error } = await sb
    .from('suppression_list')
    .insert({ agent_id, email, phone, reason })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}

export async function DELETE(req: NextRequest) {
  const sb = createServerClient()
  const { id } = await req.json()
  const { error } = await sb.from('suppression_list').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
