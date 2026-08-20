'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowRight, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { clsx } from 'clsx'

export default function HeaderNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe?.()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/sign-in')
  }

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'Platform & Architecture' },
    { href: '/blog', label: 'Tech Articles' },
  ]

  return (
    <nav className="flex items-center gap-2 sm:gap-4">
      <div className="hidden sm:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all',
                isActive
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {user ? (
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="primary" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}>
              Dashboard
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-500" />}
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Get Started Free
            </Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
