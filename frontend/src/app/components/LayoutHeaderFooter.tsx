'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap } from 'lucide-react'
import HeaderNav from './HeaderNav'

export default function LayoutHeaderFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Standalone routes (dashboard, onboarding, auth)
  const isStandaloneRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/skills') ||
    pathname.startsWith('/roadmap') ||
    pathname.startsWith('/recommendations') ||
    pathname.startsWith('/interview') ||
    pathname.startsWith('/progress') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up')

  if (isStandaloneRoute) {
    return <div className="h-screen w-screen overflow-hidden flex flex-col">{children}</div>
  }

  // Public routes (home /, /about, /blog) - Header is 100% STATIC at top, only main scrolls
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 text-slate-900 glow-gradient">
      {/* Static Fixed Top Header */}
      <header className="shrink-0 z-50 bg-white/95 border-b border-slate-200 backdrop-blur-md px-6 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-slate-900 group">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span>
              SkillForge <span className="text-indigo-600 font-extrabold">AI</span>
            </span>
          </Link>

          <HeaderNav />
        </div>
      </header>

      {/* Main Content Area (Scrolls smoothly underneath the static header) */}
      <main className="flex-1 overflow-y-auto min-h-0 scroll-smooth">{children}</main>
    </div>
  )
}
