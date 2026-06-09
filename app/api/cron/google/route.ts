export const dynamic = 'force-dynamic'
// Vercel cron: runs every Monday at 3 AM UTC.
// Guarded by CRON_SECRET header to prevent unauthorized triggering.
import { NextRequest, NextResponse } from 'next/server'
import { GooglePlacesConnector } from '@/lib/connectors/google'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const connector = new GooglePlacesConnector()
  const result = await connector.run()
  return NextResponse.json(result)
}
