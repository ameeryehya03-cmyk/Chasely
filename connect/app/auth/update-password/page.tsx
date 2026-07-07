'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import AuthCard from '@/components/AuthCard'
import { input, label, primaryButton, errorText } from '@/lib/form-styles'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className={label}>
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="confirm" className={label}>
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={input}
          />
        </div>

        {error && <p className={errorText}>{error}</p>}

        <button type="submit" disabled={loading} className={primaryButton}>
          {loading ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </AuthCard>
  )
}
