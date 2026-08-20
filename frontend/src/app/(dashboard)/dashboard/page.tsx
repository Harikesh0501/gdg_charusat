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
  Target,
  Award,
  Sparkles,
  TrendingUp,
  BookOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid'
import { ProgressRing } from '@/components/ui/ProgressRing'

// In-Memory Client Cache for 0ms Instant Page Switches
const _DASH_CACHE: {
  studentName?: string
  targetRole?: string
  readinessScore?: number
  masteredCount?: number
  gapsCount?: number
  priorityGaps?: any[]
  completedChapters?: number
  totalChapters?: number
} = {}

export default function DashboardPage() {
  const [studentName, setStudentName] = useState<string>(_DASH_CACHE.studentName || '')
  const [targetRole, setTargetRole] = useState<string>(_DASH_CACHE.targetRole || 'Full-Stack Engineer')
  const [readinessScore, setReadinessScore] = useState<number>(_DASH_CACHE.readinessScore || 0)
  const [masteredCount, setMasteredCount] = useState<number>(_DASH_CACHE.masteredCount || 0)
  const [gapsCount, setGapsCount] = useState<number>(_DASH_CACHE.gapsCount || 0)
  const [priorityGaps, setPriorityGaps] = useState<any[]>(_DASH_CACHE.priorityGaps || [])
  const [completedChapters, setCompletedChapters] = useState<number>(_DASH_CACHE.completedChapters || 0)
  const [totalChapters, setTotalChapters] = useState<number>(_DASH_CACHE.totalChapters || 0)
  const [loading, setLoading] = useState(!_DASH_CACHE.studentName)
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
        const headers = { 'Authorization': `Bearer ${session.access_token}` }

        // Check user_metadata full_name
        const userMetaName = session.user?.user_metadata?.full_name
        if (userMetaName) {
          _DASH_CACHE.studentName = userMetaName
          setStudentName(userMetaName)
        }

        // Real-time parallel fetch from all backend intelligence services
        const [profileRes, gapRes, progressRes] = await Promise.all([
          fetch(`${backendUrl}/api/profile`, { headers }),
          fetch(`${backendUrl}/api/skill-gap`, { headers }),
          fetch(`${backendUrl}/api/progress`, { headers })
        ])

        if (profileRes.ok) {
          const profile = await profileRes.json()
          if (profile?.full_name) {
            _DASH_CACHE.studentName = profile.full_name
            setStudentName(profile.full_name)
          }
          if (profile?.target_role_title) {
            _DASH_CACHE.targetRole = profile.target_role_title
            setTargetRole(profile.target_role_title)
          }
        }

        if (gapRes.ok) {
          const gapData = await gapRes.json()
          const rScore = Math.round(gapData.readiness_percentage || 0)
          _DASH_CACHE.readinessScore = rScore
          setReadinessScore(rScore)

          if (gapData.target_role_title) {
            _DASH_CACHE.targetRole = gapData.target_role_title
            setTargetRole(gapData.target_role_title)
          }
          
          const gaps = gapData.gaps || []
          const mastered = gapData.mastered || []
          _DASH_CACHE.gapsCount = gaps.length
          _DASH_CACHE.masteredCount = mastered.length
          _DASH_CACHE.priorityGaps = gaps.slice(0, 4)

          setGapsCount(gaps.length)
          setMasteredCount(mastered.length)
          setPriorityGaps(gaps.slice(0, 4))
        }

        if (progressRes.ok) {
          const progData = await progressRes.json()
          _DASH_CACHE.completedChapters = progData.completed_chapters_count || 0
          _DASH_CACHE.totalChapters = progData.total_chapters_count || 0
          setCompletedChapters(progData.completed_chapters_count || 0)
          setTotalChapters(progData.total_chapters_count || 0)
        }
      } catch (err: any) {
        console.warn('Dashboard telemetry fetch note:', err)
        setError(err.message || 'Could not connect to backend API')
      } finally {
        setLoading(false)
      }
    }

    initDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-500 bg-dot-grid">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700">Connecting to SkillForge Telemetry Engine...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 space-y-8 bg-dot-grid bg-slate-50/40 min-h-full">
      {/* Top Welcome & Target Role Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-sky-400 to-emerald-500" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple" size="sm" dot>
                Command Center Live
              </Badge>
              <Badge variant="info" size="sm">
                Target Role: {targetRole}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-outfit">
              Welcome back, {studentName || 'Student'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Your real-time career telemetry is synchronized with the latest market requirements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/skills">
              <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                Upload Resume
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Resume Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-sm shadow-2xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-bold">Telemetry Connection Note</p>
            <p className="text-xs text-amber-700 mt-0.5">{error}. API running at {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}.</p>
          </div>
        </div>
      )}

      {/* Tremor-Style KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Role Readiness"
          value={`${readinessScore}%`}
          subtitle={`Grounded in ${targetRole}`}
          delta={{ value: `${readinessScore > 50 ? '+14%' : 'Base'} score`, isPositive: readinessScore >= 50, isNeutral: readinessScore < 50 }}
          icon={<Target className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-600"
          progress={readinessScore}
        />

        <KpiCard
          title="Mastered Competencies"
          value={masteredCount}
          subtitle="Verified on 0-4 scale"
          delta={{ value: 'Proficient', isPositive: true }}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
          progress={masteredCount > 0 ? (masteredCount / (masteredCount + gapsCount || 1)) * 100 : 0}
        />

        <KpiCard
          title="Identified Skill Gaps"
          value={gapsCount}
          subtitle="Topological curriculum"
          delta={{ value: 'Active Sprints', isNeutral: true }}
          icon={<Sparkles className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-600"
        />

        <KpiCard
          title="Roadmap Chapters"
          value={`${completedChapters} / ${totalChapters}`}
          subtitle="Module milestones complete"
          delta={{ value: totalChapters > 0 ? `${Math.round((completedChapters / totalChapters) * 100)}% done` : 'Ready', isPositive: completedChapters > 0 }}
          icon={<BookOpen className="w-5 h-5" />}
          iconBg="bg-sky-50 text-sky-600"
          progress={totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0}
        />
      </div>

      {/* Main Content Split: Readiness Ring & Priority Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Readiness Gauge Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
          <Badge variant="purple" size="sm" className="mb-4">
            Readiness Index
          </Badge>
          <ProgressRing progress={readinessScore} size={150} strokeWidth={11} label="MATCH" />
          <h3 className="text-lg font-bold text-slate-900 mt-4 font-outfit">
            {readinessScore >= 80 ? 'High Market Alignment' : readinessScore >= 50 ? 'Intermediate Candidate' : 'Foundation Building Phase'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Calculated deterministically from your resume skills compared to required {targetRole} industry benchmarks.
          </p>
        </div>

        {/* Right 2/3: Priority Gap Radar (Live Data) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-outfit">Priority Skill Gap Radar</h3>
                <p className="text-xs text-slate-500">Skills requiring immediate focus for {targetRole}</p>
              </div>
              <Link href="/roadmap">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                  Full Roadmap
                </Button>
              </Link>
            </div>

            {priorityGaps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                {priorityGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-start justify-between gap-3 hover:border-indigo-200 hover:bg-white transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block font-outfit">
                        {gap.skill_name || gap.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Current: <strong className="text-amber-600">{gap.current_level ?? 0}/4</strong> → Target: <strong className="text-emerald-600">{gap.required_level ?? 3}/4</strong>
                      </span>
                    </div>
                    <Badge variant="warning" size="sm" dot>
                      Gap: {(gap.required_level ?? 3) - (gap.current_level ?? 0)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60 mt-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">All Core Competencies Met!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Upload an updated resume or target a higher seniority tier.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Auto-updated via FastAPI Skill-Gap Service</span>
            <Link href="/skills">
              <span className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Edit Skill Levels <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bento Quick-Launch Cards */}
      <BentoGrid>
        <BentoGridItem
          title="Resume Skill Extraction"
          description="Upload your latest PDF/DOCX to parse new technical proficiencies into your persistent student profile."
          icon={<FileText className="w-5 h-5" />}
          badge={<Badge variant="info" size="sm">PDF / DOCX</Badge>}
          action={
            <Link href="/skills" className="w-full block">
              <Button variant="soft" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Go to Resume Hub
              </Button>
            </Link>
          }
        />

        <BentoGridItem
          title="Topological Roadmap"
          description="Study chapter-by-chapter curriculum with direct practice lab links to authentic GitHub specs."
          icon={<Map className="w-5 h-5" />}
          badge={<Badge variant="purple" size="sm">Phase Modules</Badge>}
          action={
            <Link href="/roadmap" className="w-full block">
              <Button variant="soft" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Open Course Plan
              </Button>
            </Link>
          }
        />

        <BentoGridItem
          title="AI Mock Interview Studio"
          description="Test your project claims against Groq Llama 3.3 70B lead interviewer evaluations and scoring rubrics."
          icon={<BrainCircuit className="w-5 h-5" />}
          badge={<Badge variant="warning" size="sm">Live AI Evaluation</Badge>}
          action={
            <Link href="/interview" className="w-full block">
              <Button variant="soft" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Start Mock Session
              </Button>
            </Link>
          }
        />
      </BentoGrid>
    </div>
  )
}
