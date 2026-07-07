'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import AuthCard from '@/components/AuthCard'
import { input, label, primaryButton, errorText } from '@/lib/form-styles'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <AuthCard title="Check your email" subtitle="We sent a password reset link.">
        <p className="text-sm text-muted">
          Click the link we sent to <span className="text-[#ededed]">{email}</span> to choose a
          new password.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Reset your password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className={label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
        </div>

        {error && <p className={errorText}>{error}</p>}

        <button type="submit" disabled={loading} className={primaryButton}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthCard>
  )
}
