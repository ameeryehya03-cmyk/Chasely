import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Wordmark from '@/components/Wordmark'
import SignOutButton from '@/components/SignOutButton'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Wordmark className="text-lg" />
        <div className="flex items-center gap-4">
          {profile && (
            <span className="label-mono text-muted">
              {profile.full_name} · {profile.role}
            </span>
          )}
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  )
}
