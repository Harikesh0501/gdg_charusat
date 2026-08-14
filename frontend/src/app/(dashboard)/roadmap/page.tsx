'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Clock,
  BookOpen,
  FolderGit2,
  Trophy,
  RefreshCw,
  ChevronDown,
  CheckSquare,
  Square,
  ArrowRight,
  UploadCloud,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CareerRole {
  id: number
  name: string
  slug: string
  description: string
  role_skills_count: number
}

interface RoadmapItem {
  id: string
  phase_id: string
  type: 'skill' | 'resource' | 'project' | 'milestone'
  ref_skill_id?: string
  ref_resource_id?: string
  ref_project_id?: string
  ref_url?: string
  ref_provider?: string
  chapter_title?: string
  title: string
  order_index: number
  status: 'not_started' | 'in_progress' | 'completed'
  estimated_hours: number
}

interface RoadmapPhase {
  id: string
  roadmap_id: string
  order_index: number
  title: string
  summary?: string
  items: RoadmapItem[]
}

interface RoadmapData {
  id: string
  profile_id: string
  career_role_id: string
  status: string
  overall_strategy?: string
  generated_at: string
  model_used?: string
  total_hours: number
  total_items_count: number
  completed_items_count: number
  progress_percentage: number
  phases: RoadmapPhase[]
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

export default function LearningRoadmapPage() {
  const [roles, setRoles] = useState<CareerRole[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [gapData, setGapData] = useState<SkillGapData | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [hasSkillsOrResume, setHasSkillsOrResume] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({})
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
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

      const headers = { Authorization: `Bearer ${session.access_token}` }

      // Check if student has uploaded resume or has skills
      const skillsRes = await fetch(`${backendUrl}/api/skills`, { headers })
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json()
        if (!skillsData.skills || skillsData.skills.length === 0) {
          setHasSkillsOrResume(false)
          setLoading(false)
          return
        } else {
          setHasSkillsOrResume(true)
        }
      }

      // Fetch all career roles catalog
      const rolesRes = await fetch(`${backendUrl}/api/career-roles`)
      let loadedRoles: CareerRole[] = []
      if (rolesRes.ok) {
        const rawRoles: CareerRole[] = await rolesRes.json()
        const seenNames = new Set<string>()
        loadedRoles = rawRoles.reduce<CareerRole[]>((acc, r) => {
          const cleanName = r.name.replace(/\s+[0-9a-fA-F]{6,12}$/g, '').trim()
          if (!seenNames.has(cleanName.toLowerCase())) {
            seenNames.add(cleanName.toLowerCase())
            acc.push({ ...r, name: cleanName })
          }
          return acc
        }, [])
        setRoles(loadedRoles)
      }

      // Fetch active career goal
      const goalRes = await fetch(`${backendUrl}/api/career-goal`, { headers })

      let activeRoleId = loadedRoles.length > 0 ? loadedRoles[0].id : null
      if (goalRes.ok) {
        const goalData = await goalRes.json()
        if (goalData && goalData.career_role_id) {
          activeRoleId = goalData.career_role_id
        }
      }

      setSelectedRoleId(activeRoleId)

      if (activeRoleId) {
        await Promise.all([
          fetchSkillGap(activeRoleId, session.access_token),
          fetchRoadmap(session.access_token)
        ])
      }
    } catch (err) {
      console.error('Failed to load roadmap data:', err)
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
      console.error('Error fetching skill gap:', err)
    }
  }

  const fetchRoadmap = async (token?: string) => {
    try {
      let authToken = token
      if (!authToken) {
        const { data: sessionResult } = await (supabase.auth as any).getSession()
        authToken = sessionResult?.session?.access_token
      }
      if (!authToken) return

      const roadmapRes = await fetch(`${backendUrl}/api/roadmap`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      if (roadmapRes.ok) {
        const rData: RoadmapData = await roadmapRes.json()
        setRoadmap(rData)
        if (rData.phases && rData.phases.length > 0) {
          const initialExpanded: Record<string, boolean> = {}
          rData.phases.forEach((p, idx) => {
            initialExpanded[p.id] = idx === 0
          })
          setExpandedPhases(initialExpanded)
        }
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err)
    }
  }

  const handleSelectRole = async (roleId: number) => {
    if (roleId === selectedRoleId) return
    setSelectedRoleId(roleId)
    setGenerating(true)

    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (session) {
        await fetch(`${backendUrl}/api/career-goal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ career_role_id: roleId, target_timeline_months: 6 }),
        })

        const genRes = await fetch(`${backendUrl}/api/roadmap/generate?career_role_id=${roleId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        })

        if (genRes.ok) {
          const rData: RoadmapData = await genRes.json()
          setRoadmap(rData)
        }
        await fetchSkillGap(roleId, session.access_token)
      }
    } catch (err) {
      console.error('Error switching target role:', err)
    } finally {
      setGenerating(false)
    }
  }

  const toggleItemStatus = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed'
    setUpdatingItemId(itemId)

    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) return

      const res = await fetch(`${backendUrl}/api/roadmap/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setRoadmap((prev) => {
          if (!prev) return null
          let totalItems = 0
          let completedItems = 0

          const updatedPhases = prev.phases.map((phase) => {
            const updatedItems = phase.items.map((item) => {
              if (item.id === itemId) {
                const itemUpdated = { ...item, status: newStatus as any }
                if (newStatus === 'completed') completedItems++
                totalItems++
                return itemUpdated
              }
              if (item.status === 'completed') completedItems++
              totalItems++
              return item
            })
            return { ...phase, items: updatedItems }
          })

          const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

          return {
            ...prev,
            completed_items_count: completedItems,
            progress_percentage: progressPct,
            phases: updatedPhases,
          }
        })

        if (selectedRoleId) {
          fetchSkillGap(selectedRoleId, session.access_token)
        }
      }
    } catch (err) {
      console.error('Error updating item status:', err)
    } finally {
      setUpdatingItemId(null)
    }
  }

  const togglePhaseExpand = (phaseId: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }))
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Building Personalized Roadmap from Resume...</p>
      </div>
    )
  }

  // Mandatory Resume Banner Guard
  if (!hasSkillsOrResume) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-8 py-12 w-full space-y-8">
        <div className="border-b border-slate-200 pb-6 glass-panel p-6 rounded-2xl shadow-xs bg-white">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Learning Roadmap Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personalized Career Roadmap</h1>
          <p className="text-sm text-slate-500 mt-1">
            Resume-driven topological learning milestones and phase execution plan.
          </p>
        </div>

        <div className="glass-panel p-12 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto space-y-5 shadow-sm bg-white">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Upload Your Resume First</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
              SkillForge generates personalized learning roadmaps strictly from your uploaded resume skills & projects. Please upload your resume first to unlock your roadmap.
            </p>
          </div>
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Resume Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-8 py-8 w-full space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl shadow-xs bg-white">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Learning Roadmap Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personalized Career Roadmap</h1>
          <p className="text-sm text-slate-500 mt-1">
            Topological prerequisite milestone phases generated strictly from your uploaded resume skills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {roadmap && (
            <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold shadow-2xs">
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Readiness Score</span>
                <span className="text-indigo-600 text-sm font-black">{gapData?.readiness_score || 0}%</span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Roadmap Completion</span>
                <span className="text-emerald-600 text-sm font-black">{roadmap.progress_percentage}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Target Career Roles Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Select Target Career Role
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roles.map((role) => {
            const isSelected = selectedRoleId === role.id
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                disabled={generating}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black truncate">{role.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
                </div>
                <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {role.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* AI Mentor Overall Strategy Banner */}
      {roadmap?.overall_strategy && (
        <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Learning Strategy & Gap Blueprint</span>
            </div>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {roadmap.overall_strategy}
          </p>
        </div>
      )}

      {/* Roadmap Phase Timeline Accordions */}
      {generating ? (
        <div className="py-16 text-center space-y-3 text-slate-500">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-medium">Re-calculating DAG topological sort & milestone phases...</p>
        </div>
      ) : !roadmap || !roadmap.phases || roadmap.phases.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl border border-slate-200 text-center text-slate-500">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No Roadmap Phases Generated</p>
          <p className="text-xs text-slate-500 mt-1">Select a target role above to initialize your learning path.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Learning Phases ({roadmap.phases.length} Modules)
            </h2>

            {selectedRoleId && (
              <button
                onClick={() => handleSelectRole(selectedRoleId)}
                disabled={generating}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                <span>Refresh Course Roadmap</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {roadmap.phases.map((phase, pIdx) => {
              const isExpanded = expandedPhases[phase.id] ?? (pIdx === 0)
              const completedInPhase = phase.items.filter((i) => i.status === 'completed').length
              const phasePct = phase.items.length > 0 ? Math.round((completedInPhase / phase.items.length) * 100) : 0

              return (
                <div
                  key={phase.id}
                  className="glass-panel rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all bg-white"
                >
                  {/* Phase Header Accordion */}
                  <div
                    onClick={() => togglePhaseExpand(phase.id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                        P{phase.order_index}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{phase.title}</h3>
                        {phase.summary && (
                          <p className="text-xs text-slate-500 mt-0.5">{phase.summary}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-semibold">
                        <span>{completedInPhase}/{phase.items.length} Completed</span>
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${phasePct}%` }}
                          />
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Expanded Items List grouped by Chapters */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-3 border-t border-slate-100 space-y-6 bg-slate-50/50">
                      {(() => {
                        // Group items by chapter_title
                        const chapterMap = new Map<string, RoadmapItem[]>()
                        phase.items.forEach((item) => {
                          const cTitle = item.chapter_title || `Chapter ${phase.order_index}.1: Core Learning Objectives`
                          if (!chapterMap.has(cTitle)) {
                            chapterMap.set(cTitle, [])
                          }
                          chapterMap.get(cTitle)!.push(item)
                        })

                        return Array.from(chapterMap.entries()).map(([chapterTitle, chapterItems]) => {
                          const chapCompleted = chapterItems.filter((i) => i.status === 'completed').length
                          const chapPct = chapterItems.length > 0 ? Math.round((chapCompleted / chapterItems.length) * 100) : 0

                          return (
                            <div
                              key={chapterTitle}
                              className="rounded-xl border border-slate-200/90 bg-white p-4 space-y-3 shadow-2xs"
                            >
                              {/* Chapter Sub-header */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-indigo-600" />
                                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                    {chapterTitle}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                  <span>{chapCompleted}/{chapterItems.length} Lessons</span>
                                  <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                    <div
                                      className="h-full bg-emerald-500 transition-all duration-300"
                                      style={{ width: `${chapPct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Lessons & Resource Cards inside Chapter */}
                              <div className="space-y-2.5">
                                {chapterItems.map((item) => {
                                  const isDone = item.status === 'completed'
                                  const isUpdating = updatingItemId === item.id

                                  return (
                                    <div
                                      key={item.id}
                                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                                        isDone
                                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                                          : item.type === 'resource'
                                          ? 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-300'
                                          : item.type === 'milestone'
                                          ? 'bg-amber-50/30 border-amber-200'
                                          : 'bg-slate-50/60 border-slate-200/80 hover:border-indigo-200 text-slate-800'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3 flex-1">
                                        <button
                                          onClick={() => toggleItemStatus(item.id, item.status)}
                                          disabled={isUpdating}
                                          className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                                        >
                                          {isUpdating ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                          ) : isDone ? (
                                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                                          ) : (
                                            <Square className="w-4 h-4 text-slate-400" />
                                          )}
                                        </button>

                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <p className={`text-xs font-bold ${isDone ? 'line-through text-emerald-800' : 'text-slate-900'}`}>
                                              {item.title}
                                            </p>
                                          </div>

                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                              {item.type}
                                            </span>

                                            {item.ref_provider && (
                                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                {item.ref_provider}
                                              </span>
                                            )}

                                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                              <Clock className="w-3 h-3 text-slate-400" /> {item.estimated_hours}h estimated
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {item.ref_url && (
                                          <a
                                            href={item.ref_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 hover:bg-indigo-50"
                                            title="Open Resource"
                                          >
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Open Resource</span>
                                            <ExternalLink className="w-3 h-3 text-indigo-500" />
                                          </a>
                                        )}

                                        <button
                                          onClick={() => toggleItemStatus(item.id, item.status)}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                            isDone
                                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200'
                                              : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                                          }`}
                                        >
                                          {isDone ? 'Done ✓' : 'Mark Done'}
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
