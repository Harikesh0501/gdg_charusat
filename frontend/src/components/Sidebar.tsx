'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Map,
  Sparkles,
  BrainCircuit,
  TrendingUp,
  UserCheck,
  LogOut,
  Zap,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [displayName, setDisplayName] = useState<string>('')

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data?.user
      setUser(u || null)

      if (u) {
        const metaName = u.user_metadata?.full_name
        if (metaName) setDisplayName(metaName)

        // Fetch profile full_name from backend
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
          const { data: sessionResult } = await (supabase.auth as any).getSession()
          if (sessionResult?.session) {
            const res = await fetch(`${backendUrl}/api/profile`, {
              headers: { Authorization: `Bearer ${sessionResult.session.access_token}` },
            })
            if (res.ok) {
              const profile = await res.json()
              if (profile && profile.full_name) {
                setDisplayName(profile.full_name)
              }
            }
          }
        } catch (e) {
          console.warn('Sidebar profile fetch note:', e)
        }
      }
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user?.user_metadata?.full_name) {
        setDisplayName(session.user.user_metadata.full_name)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await (supabase.auth as any).signOut()
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
    } catch (e) {
      console.warn('Sign out note:', e)
    }
    window.location.href = '/sign-in'
  }

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Skills & Resume AI',
      href: '/skills',
      icon: FileText,
    },
    {
      label: 'Learning Roadmap',
      href: '/roadmap',
      icon: Map,
    },
    {
      label: 'Recommendations',
      href: '/recommendations',
      icon: Sparkles,
    },
    {
      label: 'Mock Interview Prep',
      href: '/interview',
      icon: BrainCircuit,
    },
    {
      label: 'Progress Analytics',
      href: '/progress',
      icon: TrendingUp,
    },
    {
      label: 'Onboarding Profile',
      href: '/onboarding',
      icon: UserCheck,
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 shadow-xs z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                SkillForge <span className="text-indigo-600">AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block -mt-1">
                Career Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Student User Account & Sign Out Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {/* Account Profile Card with Email & Sign Out */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate" title={displayName || user?.email || 'Student Account'}>
                {displayName || user?.email?.split('@')[0] || 'SkillForge Scholar'}
              </p>
              <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Active Account
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
