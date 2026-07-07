'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import AuthCard from '@/components/AuthCard'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import { input, label, primaryButton, errorText } from '@/lib/form-styles'
import type { Database } from '@/lib/database.types'

type Role = Database['public']['Enums']['user_role']

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'brokerage' ? 'brokerage' : 'agent'
  const [role, setRole] = useState<Extract<Role, 'agent' | 'brokerage'>>(initialRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (!data.session) {
      // Email confirmation is required before a session exists.
      setCheckEmail(true)
      return
    }

    router.push('/auth/complete-profile')
    router.refresh()
  }

  if (checkEmail) {
    return (
      <AuthCard title="Check your email" subtitle="Confirm your address to finish signing up.">
        <p className="text-sm text-muted">
          We sent a confirmation link to <span className="text-[#ededed]">{email}</span>.
          Click it to continue.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Create your account">
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
          <label htmlFor="password" className={label}>
            Password
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

        {error && <p className={errorText}>{error}</p>}

        <button type="submit" disabled={loading} className={primaryButton}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="label-mono">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-accent hover:text-accent-bright">
          Log in
        </Link>
      </p>
    </AuthCard>
  )
}
