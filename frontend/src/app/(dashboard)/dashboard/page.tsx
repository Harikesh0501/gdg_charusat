'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, CheckCircle2, User, Sparkles, FileText, Map, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SyncData {
  user_id: string
  profile_id: string
  supabase_user_id: string
  email: string | null
  onboarding_completed: boolean
}

export default function DashboardPage() {
  const [syncData, setSyncData] = useState<SyncData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const { data: sessionResult } = await (supabase.auth as any).getSession()
        const session = sessionResult?.session

        if (!session) {
          router.push('/sign-in')
          return
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        const res = await fetch(`${backendUrl}/api/auth/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error(`Sync API returned status ${res.status}`)
        }

        const syncedData: SyncData = await res.json()
        setSyncData(syncedData)
      } catch (err: any) {
        console.warn('Dashboard sync note:', err)
        setError(err.message || 'Could not connect to backend API')
      } finally {
        setLoading(false)
      }
    }

    initDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium">Verifying Session & Syncing Profile...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4" />
            Student Command Center
          </div>
          <h1 className="text-2xl font-bold text-white">
            Welcome, {syncData?.email || 'SkillForge Scholar'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your personalized learning roadmap and career readiness dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Backend Sync Active
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Backend Connection Note</p>
            <p className="text-xs text-amber-300/80 mt-0.5">{error}. Ensure backend FastAPI server is running at {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}.</p>
          </div>
        </div>
      )}

      {/* Grid Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Onboarding & Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-4">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Onboarding & Profile</h3>
            <p className="text-xs text-slate-400 mt-2">
              Status: {syncData?.onboarding_completed ? (
                <span className="text-emerald-400 font-semibold">Completed</span>
              ) : (
                <span className="text-amber-400 font-semibold">Pending</span>
              )}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>Profile ID: {syncData?.profile_id?.slice(0, 8) || 'Scaffolded'}...</span>
            {!syncData?.onboarding_completed && (
              <Link href="/onboarding" className="text-primary hover:underline font-medium">Complete Now →</Link>
            )}
          </div>
        </div>

        {/* AI Resume & Skills Intelligence Card (Active Phase 2) */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col justify-between">
          <div>
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 w-fit mb-4 flex items-center justify-between w-full">
              <FileText className="w-6 h-6" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Active Feature
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Resume AI & Skills Profile</h3>
            <p className="text-xs text-slate-400 mt-2">
              Upload PDF/DOCX resume for Groq Llama 4 Scout AI skill extraction & normalization.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-500">Phase 2 Feature</span>
            <Link
              href="/skills"
              className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-primary/20"
            >
              Upload PDF →
            </Link>
          </div>
        </div>

        {/* Learning Roadmap Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between opacity-75">
          <div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Learning Roadmap</h3>
            <p className="text-xs text-slate-400 mt-2">
              Groq Llama 4 Scout personalized roadmap (Phase 5).
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-xs text-slate-500">
            Upcoming Phase 5 Feature
          </div>
        </div>
      </div>
    </div>
  )
}
