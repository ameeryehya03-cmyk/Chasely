export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { GooglePlacesConnector } from '@/lib/connectors/google'
import { DldConnector } from '@/lib/connectors/dld'
import { EnrichmentConnector } from '@/lib/connectors/enrichment'
import { LinkedInConnector } from '@/lib/connectors/linkedin'
import { InstagramConnector } from '@/lib/connectors/instagram'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { connector, params } = body

  try {
    switch (connector) {
      case 'google': {
        const c = new GooglePlacesConnector()
        const result = await c.run(params)
        return NextResponse.json(result)
      }
      case 'dld': {
        const c = new DldConnector()
        const result = await c.run(params)
        return NextResponse.json(result)
      }
      case 'enrichment': {
        const c = new EnrichmentConnector()
        const result = await c.run()
        return NextResponse.json(result)
      }
      case 'linkedin': {
        const c = new LinkedInConnector()
        const result = await c.run()
        return NextResponse.json(result)
      }
      case 'instagram': {
        const c = new InstagramConnector()
        const result = await c.run()
        return NextResponse.json(result)
      }
      default:
        return NextResponse.json({ error: `Unknown connector: ${connector}` }, { status: 400 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
