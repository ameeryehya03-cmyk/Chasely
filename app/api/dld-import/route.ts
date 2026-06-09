export const dynamic = 'force-dynamic'
// DLD/RERA broker registry CSV/XLSX file import endpoint.
import { NextRequest, NextResponse } from 'next/server'
import { DldConnector, DldRecord } from '@/lib/connectors/dld'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase()
  let records: DldRecord[] = []

  if (ext === 'csv') {
    const text = await file.text()
    records = parseCSV(text)
  } else if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer()
    records = parseXLSX(buffer)
  } else {
    return NextResponse.json({ error: 'Only CSV or XLSX files are supported' }, { status: 400 })
  }

  if (records.length === 0) {
    return NextResponse.json({ error: 'No records found in file' }, { status: 400 })
  }

  const connector = new DldConnector()
  const result = await connector.run({ records })

  return NextResponse.json({ ...result, total_records: records.length })
}

function parseCSV(text: string): DldRecord[] {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''))
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const rec: DldRecord = {}
    headers.forEach((h, i) => { rec[h] = values[i] ?? '' })
    return rec
  })
}

function parseXLSX(buffer: ArrayBuffer): DldRecord[] {
  try {
    // Dynamic require to avoid bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const XLSX = require('xlsx')
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
    return rows.map((r) => {
      const rec: DldRecord = {}
      for (const [k, v] of Object.entries(r)) {
        rec[k.toLowerCase().trim()] = String(v)
      }
      return rec
    })
  } catch {
    return []
  }
}
