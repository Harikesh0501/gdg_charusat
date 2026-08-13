'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Target, Map, Award, TrendingUp, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/skills', label: 'Skills Profile', icon: Target },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/recommendations', label: 'Recommendations', icon: Award },
  { href: '/progress', label: 'Progress & Analytics', icon: TrendingUp },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const { data: sessionResult } = await (supabase.auth as any).getSession()
        const session = sessionResult?.session

        if (!session) {
          router.push('/sign-in')
          return
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        const res = await fetch(`${backendUrl}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        if (res.ok) {
          const profile = await res.json()
          if (profile && profile.onboarding_completed === false) {
            router.push('/onboarding')
            return
          }
        }
      } catch (err) {
        console.warn('Dashboard layout check note:', err)
      } finally {
        setChecking(false)
      }
    }

    checkOnboarding()
  }, [router])

  if (checking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium">Checking Onboarding Status...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Sub-Navigation Bar */}
      <div className="border-b border-white/5 bg-slate-900/40 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  )
}
