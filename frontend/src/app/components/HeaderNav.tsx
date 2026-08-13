'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function HeaderNav() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Initial session check
    const getSession = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user || null)
      setLoading(false)
    }

    getSession()

    // Listen to Supabase Auth State changes (SignIn / SignOut)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/sign-in')
  }

  if (loading) {
    return (
      <nav className="flex items-center gap-6">
        <div className="h-8 w-20 bg-slate-800 animate-pulse rounded-lg" />
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-4">
      {user ? (
        <>
          <Link href="/dashboard" className="text-xs font-medium text-slate-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/10 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-primary" />
            <span className="max-w-[150px] truncate">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs font-medium px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link href="/dashboard" className="text-xs font-medium text-slate-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link
            href="/sign-in"
            className="text-xs font-medium px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all flex items-center gap-1.5 shadow-lg shadow-primary/25"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sign In
          </Link>
        </>
      )}
    </nav>
  )
}
