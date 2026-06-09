// Normalise contact fields for deduplication matching.

export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  // Strip everything except digits and leading +
  let s = raw.replace(/[^\d+]/g, '')
  // UAE numbers: normalize +971 / 00971 / 0 prefix
  if (s.startsWith('00971')) s = '+971' + s.slice(5)
  else if (s.startsWith('971') && !s.startsWith('+')) s = '+971' + s.slice(3)
  else if (s.startsWith('0') && s.length <= 10) s = '+971' + s.slice(1)
  return s.length >= 7 ? s : null
}

export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null
  return raw.trim().toLowerCase()
}

export function normalizeName(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}
