'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  FileText,
  Map,
  AlertCircle,
  Loader2,
  BrainCircuit,
  ArrowRight,
  Zap,
} from 'lucide-react'
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
  const [studentName, setStudentName] = useState<string>('')
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

        // Check user_metadata full_name first
        const userMetaName = session.user?.user_metadata?.full_name
        if (userMetaName) setStudentName(userMetaName)

        // Sync Auth & fetch student profile for full_name
        const [syncRes, profileRes] = await Promise.all([
          fetch(`${backendUrl}/api/auth/sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${backendUrl}/api/profile`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` },
          })
        ])

        if (syncRes.ok) {
          const syncedData: SyncData = await syncRes.json()
          setSyncData(syncedData)
        }

        if (profileRes.ok) {
          const profile = await profileRes.json()
          if (profile && profile.full_name) {
            setStudentName(profile.full_name)
          }
        }
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
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Verifying Session & Syncing Command Center...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs bg-white">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-indigo-600 fill-current" />
            SkillForge Command Center
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {studentName || syncData?.email?.split('@')[0] || 'Scholar'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your career readiness, roadmap milestones, and mock interview progress in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Engine Online
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-bold">Backend Connection Note</p>
            <p className="text-xs text-amber-700 mt-0.5">{error}. Ensure backend server is running at {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}.</p>
          </div>
        </div>
      )}

      {/* Feature Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resume AI & Skills Profile */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-indigo-200 hover:shadow-md transition-all bg-white">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900">Resume Skill Extraction</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload PDF or DOCX resume for automatic skill extraction, project parsing, and target career gap computation.
            </p>
          </div>
          <Link
            href="/skills"
            className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1.5 pt-3 border-t border-slate-100"
          >
            Manage Skills Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Personalized Roadmap Engine */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-purple-200 hover:shadow-md transition-all bg-white">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Map className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900">Personalized Roadmap</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Deterministic DAG topological sort with personalized strategy layer and phase milestones.
            </p>
          </div>
          <Link
            href="/roadmap"
            className="text-xs text-purple-600 font-bold hover:text-purple-700 flex items-center gap-1.5 pt-3 border-t border-slate-100"
          >
            View Learning Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* AI Mock Interview Prep */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-amber-200 hover:shadow-md transition-all bg-white">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <BrainCircuit className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900">Mock Interview Prep</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Resume project-driven questions and real-time answer evaluation with strength scoring.
            </p>
          </div>
          <Link
            href="/interview"
            className="text-xs text-amber-600 font-bold hover:text-amber-700 flex items-center gap-1.5 pt-3 border-t border-slate-100"
          >
            Practice Mock Interviews <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
