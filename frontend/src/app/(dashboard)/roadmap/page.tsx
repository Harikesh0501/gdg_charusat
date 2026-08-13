'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CareerRole {
  id: number
  name: string
  slug: string
  description: string
  role_skills_count: number
}

interface GapItem {
  skill_id: number
  name: string
  category: string
  current_proficiency: number
  required_proficiency: number
  importance: string
  confidence: number
  gap: number
  priority_score: number
  priority_bucket: string
}

interface SkillGapData {
  career_role: {
    id: number
    name: string
    slug: string
    description: string
  }
  readiness_score: number
  mastered_skills: GapItem[]
  gaps: GapItem[]
}

const PROFICIENCY_LABELS: Record<number, string> = {
  0: 'Unlearned',
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
}

const PRIORITY_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  high: { label: 'HIGH PRIORITY', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  medium: { label: 'MEDIUM PRIORITY', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  low: { label: 'LOW PRIORITY', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  na: { label: 'MASTERED', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
}

export default function CareerRoadmapPage() {
  const [roles, setRoles] = useState<CareerRole[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [gapData, setGapData] = useState<SkillGapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingRole, setUpdatingRole] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchInitialData()
  }, [router])

  const fetchInitialData = async () => {
    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) {
        router.push('/sign-in')
        return
      }

      // Fetch all career roles catalog
      const rolesRes = await fetch(`${backendUrl}/api/career-roles`)
      let loadedRoles: CareerRole[] = []
      if (rolesRes.ok) {
        loadedRoles = await rolesRes.json()
        setRoles(loadedRoles)
      }

      // Fetch active career goal
      const goalRes = await fetch(`${backendUrl}/api/career-goal`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      
      let activeRoleId = loadedRoles.length > 0 ? loadedRoles[0].id : null
      if (goalRes.ok) {
        const goalData = await goalRes.json()
        if (goalData && goalData.career_role_id) {
          activeRoleId = goalData.career_role_id
        }
      }

      setSelectedRoleId(activeRoleId)

      if (activeRoleId) {
        await fetchSkillGap(activeRoleId, session.access_token)
      }
    } catch (err) {
      console.error('Failed to load career roadmap data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSkillGap = async (roleId: number, token?: string) => {
    try {
      let authToken = token
      if (!authToken) {
        const { data: sessionResult } = await (supabase.auth as any).getSession()
        authToken = sessionResult?.session?.access_token
      }
      if (!authToken) return

      const gapRes = await fetch(`${backendUrl}/api/skill-gap?career_role_id=${roleId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      if (gapRes.ok) {
        const data: SkillGapData = await gapRes.json()
        setGapData(data)
      }
    } catch (err) {
      console.error('Failed to fetch skill gap:', err)
    }
  }

  const handleSelectRole = async (roleId: number) => {
    if (roleId === selectedRoleId) return
    setUpdatingRole(true)
    setSelectedRoleId(roleId)

    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session
      if (session) {
        // Save target goal to backend
        await fetch(`${backendUrl}/api/career-goal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ career_role_id: roleId, target_timeline_months: 6 }),
        })

        await fetchSkillGap(roleId, session.access_token)
      }
    } catch (err) {
      console.error('Error updating target role:', err)
    } finally {
      setUpdatingRole(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-slate-400">Loading Career Goal & Deterministic Skill-Gap Engine...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Deterministic Readiness & Skill-Gap Analysis</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Career Goal & Skill-Gap Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Select your target career path to run instant, evidence-backed skill-gap analysis without AI hallucinations.
          </p>
        </div>

        {gapData && (
          <div className="flex items-center gap-4 bg-slate-900/80 border border-white/10 p-4 rounded-xl shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30">
              <span className="text-xl font-black text-white">{gapData.readiness_score}%</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Career Readiness</p>
              <p className="text-sm font-bold text-white">{gapData.career_role.name}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="text-emerald-400 font-medium">{gapData.mastered_skills.length} Mastered</span>
                <span>•</span>
                <span className="text-amber-400 font-medium">{gapData.gaps.length} Skill Gaps</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Career Role Catalog Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-secondary" />
          Select Target Career Role
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const isSelected = role.id === selectedRoleId
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                disabled={updatingRole}
                className={`text-left p-5 rounded-xl transition-all border flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/15'
                    : 'bg-slate-900/50 border-white/10 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    TARGET ROLE
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors pr-20">
                    {role.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{role.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    {role.role_skills_count} Required Competencies
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-primary transform translate-x-1' : 'text-slate-600'}`} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Skill Gap & Competency Analysis */}
      {gapData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Priority-Ranked Gaps (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                Priority-Ranked Skill Gaps ({gapData.gaps.length})
              </h2>
              <span className="text-xs text-slate-400">Sorted by Priority Score</span>
            </div>

            {gapData.gaps.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">All Role Competencies Mastered!</h3>
                <p className="text-sm text-slate-300 mt-1">
                  You have demonstrated proficiency across all required skills for {gapData.career_role.name}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {gapData.gaps.map((item) => {
                  const badge = PRIORITY_BADGES[item.priority_bucket] || PRIORITY_BADGES.low
                  const currentLabel = PROFICIENCY_LABELS[item.current_proficiency] || 'Unlearned'
                  const requiredLabel = PROFICIENCY_LABELS[item.required_proficiency] || 'Advanced'

                  return (
                    <div
                      key={item.skill_id}
                      className="glass-panel p-5 rounded-xl border border-white/10 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-base font-bold text-white">{item.name}</h3>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {item.importance} SKILL
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 capitalize">Category: {item.category.replace(/_/g, ' ')}</p>

                        {/* Progress Bar */}
                        <div className="w-full max-w-md bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${(item.current_proficiency / item.required_proficiency) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-6 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Current / Target</p>
                          <p className="text-xs font-bold text-white">
                            <span className="text-amber-400">{currentLabel}</span> /{' '}
                            <span className="text-emerald-400">{requiredLabel}</span>
                          </p>
                        </div>
                        <div className="bg-slate-900 border border-white/10 px-3 py-2 rounded-lg text-center min-w-[70px]">
                          <p className="text-[10px] text-slate-400 font-medium uppercase">Gap</p>
                          <p className="text-sm font-black text-amber-400">-{item.gap} Level</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Mastered Skills (1 column) */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Mastered Competencies ({gapData.mastered_skills.length})
            </h2>

            {gapData.mastered_skills.length === 0 ? (
              <div className="glass-panel p-6 text-center rounded-xl border border-white/10">
                <p className="text-xs text-slate-400">No competencies mastered yet for this role.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Upload your resume in Skills Profile to automatically extract and verify your skills.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {gapData.mastered_skills.map((item) => (
                  <div
                    key={item.skill_id}
                    className="glass-panel p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 capitalize mt-0.5">{item.category.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {PROFICIENCY_LABELS[item.current_proficiency] || 'Mastered'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
