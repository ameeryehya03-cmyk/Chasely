'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import AuthCard from '@/components/AuthCard'
import { input, label, primaryButton, errorText } from '@/lib/form-styles'
import type { Database } from '@/lib/database.types'

type Role = Extract<Database['public']['Enums']['user_role'], 'agent' | 'brokerage'>

export default function CompleteProfilePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('agent')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/auth/login')
        return
      }
      setEmail(user.email ?? '')
      setFullName((user.user_metadata?.full_name as string) ?? '')
      if (user.user_metadata?.role === 'agent' || user.user_metadata?.role === 'brokerage') {
        setRole(user.user_metadata.role)
      }
      setChecking(false)
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!consent) {
      setError('Please accept the privacy notice to continue.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      router.replace('/auth/login')
      return
    }

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      role,
      full_name: fullName,
      email: user.email ?? email,
      pdpl_consent_at: new Date().toISOString(),
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push(`/onboarding/${role}`)
    router.refresh()
  }

  if (checking) {
    return (
      <AuthCard title="Finishing signup…">
        <p className="text-sm text-muted">One moment.</p>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="A few more details" subtitle={email}>
      <div className="mb-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole('agent')}
          className={`rounded-md border px-3 py-2 font-mono text-xs uppercase tracking-wider transition ${
            role === 'agent'
              ? 'border-accent text-accent'
              : 'border-border-2 text-muted hover:border-accent-dim'
          }`}
        >
          I&apos;m an agent
        </button>
        <button
          type="button"
          onClick={() => setRole('brokerage')}
          className={`rounded-md border px-3 py-2 font-mono text-xs uppercase tracking-wider transition ${
            role === 'brokerage'
              ? 'border-accent text-accent'
              : 'border-border-2 text-muted hover:border-accent-dim'
          }`}
        >
          We&apos;re hiring
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className={label}>
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={input}
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            I agree to KinLeague Connect processing my data as described in the{' '}
            <a href="/privacy" className="text-accent hover:text-accent-bright">
              privacy notice
            </a>
            .
          </span>
        </label>

        {error && <p className={errorText}>{error}</p>}

        <button type="submit" disabled={loading} className={primaryButton}>
          {loading ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </AuthCard>
  )
}
