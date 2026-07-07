'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { secondaryButton } from '@/lib/form-styles'

export default function GoogleAuthButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    // Browser navigates away to Google; no need to reset loading state.
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={secondaryButton}>
      {loading ? 'Redirecting…' : 'Continue with Google'}
    </button>
  )
}
