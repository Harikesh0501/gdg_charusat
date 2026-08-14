'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  Loader2,
  Activity,
  FileText,
  BrainCircuit,
  Zap,
  Sparkles,
  BookOpen,
  Layers,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ChapterBreakdownItem {
  chapter_title: string
  phase_title: string
  completed_items: number
  total_items: number
  progress_percentage: number
  is_completed: boolean
}

interface ActivityItem {
  id: string
  event_type: string
  title: string
  description: string | null
  created_at: string
}

interface ProgressData {
  career_role_name: string
  readiness_score: number
  mastered_skills_count: number
  gaps_remaining_count: number
  roadmap_completion_percentage: number
  completed_roadmap_items: number
  total_roadmap_items: number
  total_chapters_count?: number
  completed_chapters_count?: number
  chapter_breakdown?: ChapterBreakdownItem[]
  activity_timeline: ActivityItem[]
}

export default function ProgressAnalyticsPage() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()

      const headers: HeadersInit = {}
      if (sessionData?.session?.access_token) {
        headers['Authorization'] = `Bearer ${sessionData.session.access_token}`
      }

      const res = await fetch('http://localhost:8000/api/progress', { headers })
      if (!res.ok) throw new Error('Failed to load progress data')

      const progressData: ProgressData = await res.json()
      setData(progressData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'item_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      case 'resume_uploaded':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'skill_added':
        return <Zap className="w-4 h-4 text-purple-600" />
      case 'interview_completed':
        return <BrainCircuit className="w-4 h-4 text-amber-600" />
      default:
        return <Activity className="w-4 h-4 text-slate-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Computing Career Readiness Analytics...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Progress & Skill Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Career Readiness Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time skill gap feedback loop, roadmap milestones, and competency progression tracking.
          </p>
        </div>

        {data?.career_role_name && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 self-start md:self-auto shadow-2xs">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Goal: {data.career_role_name}</span>
          </div>
        )}
      </div>

      {/* Main Readiness Gauge & Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Readiness Score Card (Span 2) */}
        <div className="md:col-span-2 glass-panel p-8 rounded-2xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Target Career Readiness Score
            </span>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                (data?.readiness_score || 0) >= 75
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : (data?.readiness_score || 0) >= 50
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800'
              }`}
            >
              {(data?.readiness_score || 0) >= 75
                ? 'Production Ready'
                : (data?.readiness_score || 0) >= 50
                ? 'Accelerating'
                : 'Building Foundations'}
            </span>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-black text-slate-900 tracking-tight">
              {data?.readiness_score || 0}%
            </span>
            <span className="text-xs text-slate-500 font-medium leading-relaxed">
              Computed via 100% deterministic formula matching verified skill proficiencies.
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden p-0.5 border border-slate-300/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700 shadow-2xs"
                style={{ width: `${Math.min(100, Math.max(5, data?.readiness_score || 0))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0% Initial</span>
              <span>50% Mid Milestone</span>
              <span>100% Fully Qualified</span>
            </div>
          </div>
        </div>

        {/* Mastered Skills Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mastered Skills</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-black text-slate-900">{data?.mastered_skills_count || 0}</span>
            <p className="text-xs text-slate-500 mt-1 font-medium">Verified competencies matching required target level</p>
          </div>
          <Link href="/skills" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 pt-2 border-t border-slate-100">
            View Skills Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Gaps Remaining Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skill Gaps Remaining</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-black text-slate-900">{data?.gaps_remaining_count || 0}</span>
            <p className="text-xs text-slate-500 mt-1 font-medium">Skills currently below required role proficiency</p>
          </div>
          <Link href="/roadmap" className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1 pt-2 border-t border-slate-100">
            View Skill Gap Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Roadmap Completion Progress Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs bg-white">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Roadmap Milestone Progress</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Completing roadmap skill items & chapters automatically bumps your proficiency level and increases your readiness score.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900">
              {data?.completed_chapters_count || 0} / {data?.total_chapters_count || 0} Chapters
            </span>
            <span className="text-xs text-slate-500 block font-bold">
              {data?.completed_roadmap_items || 0}/{data?.total_roadmap_items || 0} Topics ({data?.roadmap_completion_percentage || 0}%)
            </span>
          </div>

          <Link
            href="/roadmap"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap"
          >
            Open Roadmap
          </Link>
        </div>
      </div>

      {/* Chapter-by-Chapter Progression Analytics */}
      {data?.chapter_breakdown && data.chapter_breakdown.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Chapter-by-Chapter Progression ({data.completed_chapters_count}/{data.total_chapters_count} Mastered)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.chapter_breakdown.map((chap) => (
              <div
                key={chap.chapter_title}
                className={`glass-panel p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  chap.is_completed
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-white border-slate-200/90 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      {chap.phase_title}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-0.5">{chap.chapter_title}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 ${
                      chap.is_completed
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {chap.is_completed ? 'Mastered ✓' : `${chap.progress_percentage}%`}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>{chap.completed_items}/{chap.total_items} Topics Completed</span>
                    <span>{chap.progress_percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-500 ${chap.is_completed ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${chap.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Learning Activity Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Learning Activity Stream
          </h2>
          <span className="text-xs text-slate-500 font-mono font-semibold">
            {data?.activity_timeline.length || 0} Recent Events
          </span>
        </div>

        {!data?.activity_timeline || data.activity_timeline.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto space-y-3 shadow-xs">
            <Activity className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Learning Activity Logged Yet</h3>
            <p className="text-xs text-slate-500">
              Complete roadmap items, upload your resume, or attempt mock interview questions to build your activity timeline.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.activity_timeline.map((evt) => (
              <div
                key={evt.id}
                className="glass-panel p-4 rounded-xl border border-slate-200/90 hover:border-indigo-200 transition-all flex items-start justify-between gap-4 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                    {getEventIcon(evt.event_type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                    {evt.description && (
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{evt.description}</p>
                    )}
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {new Date(evt.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
