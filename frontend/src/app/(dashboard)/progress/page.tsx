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
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { ProgressRing } from '@/components/ui/ProgressRing'

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

// In-Memory Client Cache for 0ms Instant Page Switches
let _PROGRESS_CACHE: ProgressData | null = null

export default function ProgressAnalyticsPage() {
  const [data, setData] = useState<ProgressData | null>(_PROGRESS_CACHE)
  const [loading, setLoading] = useState(!_PROGRESS_CACHE)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      if (!_PROGRESS_CACHE) {
        setLoading(true)
      }
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()

      const headers: HeadersInit = {}
      if (sessionData?.session?.access_token) {
        headers['Authorization'] = `Bearer ${sessionData.session.access_token}`
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const res = await fetch(`${backendUrl}/api/progress`, { headers })
      if (!res.ok) throw new Error('Failed to load progress data')

      const progressData: ProgressData = await res.json()
      _PROGRESS_CACHE = progressData
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
        return <FileText className="w-4 h-4 text-sky-600" />
      case 'skill_added':
        return <Zap className="w-4 h-4 text-indigo-600" />
      case 'interview_completed':
        return <BrainCircuit className="w-4 h-4 text-amber-600" />
      default:
        return <Activity className="w-4 h-4 text-slate-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-500 bg-dot-grid">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700">Computing Career Readiness Telemetry...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 py-8 w-full space-y-8 bg-dot-grid bg-slate-50/40 min-h-full">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple" size="sm" dot>
              Telemetry & Velocity Tracking
            </Badge>
            {data?.career_role_name && (
              <Badge variant="info" size="sm">
                Target Role: {data.career_role_name}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-outfit">
            Career Readiness Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Real-time skill gap feedback loop, roadmap velocity, and competency progression tracking.
          </p>
        </div>
      </div>

      {/* Tremor-Style KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Readiness Index"
          value={`${data?.readiness_score || 0}%`}
          subtitle={`Targeting ${data?.career_role_name || 'Engineering Role'}`}
          delta={{ value: `${data?.readiness_score || 0}%`, isPositive: (data?.readiness_score || 0) >= 50 }}
          icon={<Target className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-600"
          progress={data?.readiness_score || 0}
        />

        <KpiCard
          title="Mastered Skills"
          value={data?.mastered_skills_count || 0}
          subtitle="Target proficiencies verified"
          delta={{ value: 'Verified', isPositive: true }}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          title="Skill Gaps Remaining"
          value={data?.gaps_remaining_count || 0}
          subtitle="Active curriculum focus"
          delta={{ value: 'Active Gaps', isNeutral: true }}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-600"
        />

        <KpiCard
          title="Chapters Mastered"
          value={`${data?.completed_chapters_count || 0} / ${data?.total_chapters_count || 0}`}
          subtitle={`${data?.completed_roadmap_items || 0} Topics completed`}
          delta={{ value: `${data?.roadmap_completion_percentage || 0}% Done`, isPositive: (data?.completed_chapters_count || 0) > 0 }}
          icon={<BookOpen className="w-5 h-5" />}
          iconBg="bg-sky-50 text-sky-600"
          progress={data?.roadmap_completion_percentage || 0}
        />
      </div>

      {/* Main Readiness Gauge & Roadmap Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Circular Gauge Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
          <Badge variant="purple" size="sm" className="mb-4">
            Candidate Standing
          </Badge>
          <ProgressRing progress={data?.readiness_score || 0} size={150} strokeWidth={11} label="READY" />
          <h3 className="text-lg font-bold text-slate-900 mt-4 font-outfit">
            {(data?.readiness_score || 0) >= 75 ? 'Production Qualified' : (data?.readiness_score || 0) >= 50 ? 'Intermediate Candidate' : 'Foundation Building'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-normal">
            Computed via 100% deterministic formula matching verified skill proficiencies against {data?.career_role_name || 'industry requirements'}.
          </p>
        </div>

        {/* Right 2/3: Roadmap Progress Banner */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-outfit">Roadmap Milestone Progression</h3>
                <p className="text-xs text-slate-500 font-normal">Completing roadmap lessons automatically increases your readiness score.</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 font-outfit">
                <span>Overall Curriculum Completion</span>
                <span className="text-indigo-600">{data?.roadmap_completion_percentage || 0}% Completed</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 transition-all duration-700 shadow-2xs"
                  style={{ width: `${Math.min(100, Math.max(2, data?.roadmap_completion_percentage || 0))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              {data?.completed_chapters_count || 0} of {data?.total_chapters_count || 0} Chapters Completed
            </span>
            <Link href="/roadmap">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Open Learning Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Chapter-by-Chapter Progression Analytics */}
      {data?.chapter_breakdown && data.chapter_breakdown.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-outfit">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Chapter-by-Chapter Progression ({data.completed_chapters_count}/{data.total_chapters_count} Mastered)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.chapter_breakdown.map((chap) => (
              <div
                key={chap.chapter_title}
                className={`p-5 rounded-3xl bg-white/90 backdrop-blur-xl border flex flex-col justify-between space-y-3.5 transition-all ${
                  chap.is_completed
                    ? 'border-emerald-200 shadow-emerald-500/5'
                    : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-[0_10px_25px_-5px_rgba(99,102,241,0.08)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-outfit">
                      {chap.phase_title}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-0.5 font-outfit">{chap.chapter_title}</h3>
                  </div>

                  <Badge variant={chap.is_completed ? 'success' : 'default'} size="sm">
                    {chap.is_completed ? 'Mastered ✓' : `${chap.progress_percentage}%`}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold font-outfit">
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
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-outfit">
            <Activity className="w-5 h-5 text-indigo-600" />
            Learning Activity Stream
          </h2>
          <span className="text-xs text-slate-500 font-semibold font-outfit">
            {data?.activity_timeline.length || 0} Recent Events
          </span>
        </div>

        {!data?.activity_timeline || data.activity_timeline.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 text-center max-w-xl mx-auto space-y-3 shadow-2xs">
            <Activity className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 font-outfit">No Learning Activity Logged Yet</h3>
            <p className="text-xs text-slate-500 font-normal">
              Complete roadmap items, upload your resume, or attempt mock interview questions to build your activity timeline.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.activity_timeline.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/90 hover:border-indigo-200 transition-all flex items-start justify-between gap-4 shadow-2xs"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 mt-0.5 shadow-2xs">
                    {getEventIcon(evt.event_type)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-outfit">{evt.title}</h4>
                    {evt.description && (
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">{evt.description}</p>
                    )}
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0 font-medium">
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
