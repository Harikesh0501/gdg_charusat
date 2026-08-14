'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Loader2, Search, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [checking, setChecking] = useState(true)
  const router = useRouter()
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

        // Session confirmed! Render layout immediately for instant feedback
        setChecking(false)

        // Check onboarding in the background
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
          }
        }
      } catch (err) {
        console.warn('Dashboard layout check note:', err)
        setChecking(false)
      }
    }

    checkOnboarding()
  }, [router])

  if (checking) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Loading Command Center...</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 text-slate-900">
      {/* Left Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area (Fixed Header + Scrollable Middle Content) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Fixed Top Sub-Header */}
        <header className="h-16 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-md px-8 flex items-center justify-between z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SkillForge Engine Online</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search skills, roles, roadmaps..."
                className="w-64 pl-9 pr-4 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Main Middle Content */}
        <main className="flex-1 overflow-y-auto p-0 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  )
}
