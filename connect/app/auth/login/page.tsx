'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import AuthCard from '@/components/AuthCard'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import { input, label, primaryButton, errorText } from '@/lib/form-styles'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <AuthCard title="Log in">
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
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className={label}>
              Password
            </label>
            <Link href="/auth/reset" className="label-mono text-accent hover:text-accent-bright">
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
          />
        </div>

        {error && <p className={errorText}>{error}</p>}

        <button type="submit" disabled={loading} className={primaryButton}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="label-mono">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton />

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-accent hover:text-accent-bright">
          Sign up
        </Link>
      </p>
    </AuthCard>
  )
}
