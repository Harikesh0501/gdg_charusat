'use client'

import { useEffect, useState, useRef } from 'react'
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
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'

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

// In-Memory Client Cache for 0ms Instant Page Switches
const _ROADMAP_CACHE: {
  roles?: CareerRole[]
  roadmapByRole: Record<number, RoadmapData>
  gapByRole: Record<number, SkillGapData>
} = {
  roadmapByRole: {},
  gapByRole: {},
}

export default function LearningRoadmapPage() {
  const [roles, setRoles] = useState<CareerRole[]>(_ROADMAP_CACHE.roles || [])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [gapData, setGapData] = useState<SkillGapData | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [hasSkillsOrResume, setHasSkillsOrResume] = useState<boolean>(true)
  const [loading, setLoading] = useState(!_ROADMAP_CACHE.roles)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({})
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
      let loadedRoles = _ROADMAP_CACHE.roles || []
      if (loadedRoles.length === 0) {
        const rolesRes = await fetch(`${backendUrl}/api/career-roles`)
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
          _ROADMAP_CACHE.roles = loadedRoles
          setRoles(loadedRoles)
        }
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
        // Instant render from cache if available
        if (_ROADMAP_CACHE.roadmapByRole[activeRoleId]) {
          setRoadmap(_ROADMAP_CACHE.roadmapByRole[activeRoleId])
          setLoading(false)
        }
        if (_ROADMAP_CACHE.gapByRole[activeRoleId]) {
          setGapData(_ROADMAP_CACHE.gapByRole[activeRoleId])
        }

        // Silent background fetch to keep fresh
        Promise.all([
          fetchSkillGap(activeRoleId, session.access_token),
          fetchRoadmap(session.access_token, activeRoleId)
        ]).finally(() => setLoading(false))
      }
    } catch (err) {
      console.error('Failed to load roadmap data:', err)
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
        _ROADMAP_CACHE.gapByRole[roleId] = data
        setGapData(data)
      }
    } catch (err) {
      console.error('Error fetching skill gap:', err)
    }
  }

  const fetchRoadmap = async (token?: string, roleId?: number) => {
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
        if (roleId) {
          _ROADMAP_CACHE.roadmapByRole[roleId] = rData
        }
        setRoadmap(rData)
        if (rData.phases && rData.phases.length > 0) {
          setExpandedPhases((prev) => {
            if (Object.keys(prev).length === 0) {
              const initial: Record<string, boolean> = {}
              rData.phases.forEach((p, idx) => {
                initial[p.id] = idx === 0
              })
              return initial
            }
            return prev
          })
        }
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err)
    }
  }

  // 0ms INSTANT ROLE SWITCH WITH OPTIMISTIC UI
  const handleSelectRole = async (roleId: number) => {
    if (roleId === selectedRoleId) return
    setSelectedRoleId(roleId)

    // Instant switch to cached role data if already loaded
    if (_ROADMAP_CACHE.roadmapByRole[roleId]) {
      setRoadmap(_ROADMAP_CACHE.roadmapByRole[roleId])
    }
    if (_ROADMAP_CACHE.gapByRole[roleId]) {
      setGapData(_ROADMAP_CACHE.gapByRole[roleId])
    }

    setIsRefreshing(true)

    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (session) {
        // Background sync
        fetch(`${backendUrl}/api/career-goal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ career_role_id: roleId, target_timeline_months: 6 }),
        }).catch(console.warn)

        const genRes = await fetch(`${backendUrl}/api/roadmap/generate?career_role_id=${roleId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        })

        if (genRes.ok) {
          const rData: RoadmapData = await genRes.json()
          _ROADMAP_CACHE.roadmapByRole[roleId] = rData
          setRoadmap(rData)
        }
        fetchSkillGap(roleId, session.access_token)
      }
    } catch (err) {
      console.error('Error switching target role:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  // 0ms INSTANT OPTIMISTIC ITEM STATUS TOGGLE (NO LOADING SPINNER)
  const toggleItemStatus = (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed'

    // 1. Instant Optimistic State Update (0ms)
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
      const updated = {
        ...prev,
        completed_items_count: completedItems,
        progress_percentage: progressPct,
        phases: updatedPhases,
      }

      if (selectedRoleId) {
        _ROADMAP_CACHE.roadmapByRole[selectedRoleId] = updated
      }

      return updated
    })

    // 2. Dispatch Background API call (Silent)
    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session
      if (!session) return

      fetch(`${backendUrl}/api/roadmap/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      }).then(() => {
        if (selectedRoleId) {
          fetchSkillGap(selectedRoleId, session.access_token)
        }
      }).catch(err => console.warn('Background status sync note:', err))
    })
  }

  const togglePhaseExpand = (phaseId: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }))
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-500 bg-dot-grid">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading Learning Roadmap...</p>
      </div>
    )
  }

  // Mandatory Resume Banner Guard
  if (!hasSkillsOrResume) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 py-12 w-full space-y-8 bg-dot-grid bg-slate-50/40 min-h-full">
        <div className="p-12 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 text-center max-w-xl mx-auto space-y-5 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <Badge variant="purple" size="sm" className="mb-2">Resume Required</Badge>
            <h3 className="text-xl font-black text-slate-900 tracking-tight font-outfit">Upload Your Resume First</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto font-normal">
              SkillForge generates personalized learning roadmaps strictly from your uploaded resume skills. Upload your resume now to unlock your personalized curriculum.
            </p>
          </div>
          <Link href="/skills" className="inline-block">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Upload Resume Now
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 py-8 w-full space-y-8 bg-dot-grid bg-slate-50/40 min-h-full">
      {/* Page Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple" size="sm" dot>
              Roadmap Engine Live
            </Badge>
            {roadmap && (
              <Badge variant="info" size="sm">
                {roadmap.phases.length} Active Modules
              </Badge>
            )}
            {isRefreshing && (
              <Badge variant="warning" size="sm">
                <Loader2 className="w-3 h-3 animate-spin mr-1 inline" />
                Syncing Telemetry
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-outfit">
            Personalized Learning Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Topological prerequisite phases sorted by priority gaps, complete with direct practice labs.
          </p>
        </div>

        {roadmap && (
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <ProgressRing progress={roadmap.progress_percentage} size={65} strokeWidth={6} label="DONE" />
            <div>
              <span className="text-xs font-bold text-slate-900 block font-outfit">
                {roadmap.completed_items_count} of {roadmap.total_items_count} Lessons Done
              </span>
              <span className="text-[11px] text-indigo-600 font-semibold">
                {gapData?.readiness_score || 0}% Current Role Match
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Target Career Roles Selector - Instant Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Select Target Career Role (Instant Switch)
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {roles.map((role) => {
            const isSelected = selectedRoleId === role.id
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white/90 backdrop-blur-xl text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold truncate font-outfit">{role.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
                </div>
                <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? 'text-indigo-100' : 'text-slate-500 font-normal'}`}>
                  {role.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* AI Mentor Overall Strategy Banner */}
      {roadmap?.overall_strategy && (
        <div className="p-6 rounded-3xl bg-indigo-50/80 border border-indigo-100 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Curriculum Strategy & Topological Blueprint</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {roadmap.overall_strategy}
          </p>
        </div>
      )}

      {/* Roadmap Phase Timeline Accordions */}
      {!roadmap || !roadmap.phases || roadmap.phases.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 text-center text-slate-500 shadow-2xs">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800 font-outfit">No Roadmap Phases Generated</p>
          <p className="text-xs text-slate-500 mt-1">Select a target role above to initialize your learning path.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-outfit">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Learning Phases ({roadmap.phases.length} Modules)
            </h2>

            {selectedRoleId && (
              <Button
                variant="soft"
                size="sm"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
                onClick={() => handleSelectRole(selectedRoleId)}
              >
                Refresh Course Roadmap
              </Button>
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
                  className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                >
                  {/* Phase Header Accordion */}
                  <div
                    onClick={() => togglePhaseExpand(phase.id)}
                    className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs font-outfit">
                        P{phase.order_index}
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 font-outfit">{phase.title}</h3>
                        {phase.summary && (
                          <p className="text-xs text-slate-500 mt-0.5 font-normal">{phase.summary}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-semibold">
                        <span>{completedInPhase}/{phase.items.length} Done</span>
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
                    <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-slate-100 space-y-5 bg-slate-50/40">
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
                              className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3.5 shadow-2xs"
                            >
                              {/* Chapter Sub-header */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-indigo-600" />
                                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-outfit">
                                    {chapterTitle}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                  <span>{chapCompleted}/{chapterItems.length} Lessons</span>
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
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

                                  return (
                                    <div
                                      key={item.id}
                                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                                        isDone
                                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                                          : item.type === 'resource'
                                          ? 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-300'
                                          : item.type === 'milestone'
                                          ? 'bg-purple-50/30 border-purple-200 hover:border-purple-300'
                                          : 'bg-slate-50/60 border-slate-200/80 hover:border-indigo-200 text-slate-800'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3 flex-1">
                                        <button
                                          onClick={() => toggleItemStatus(item.id, item.status)}
                                          className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                                        >
                                          {isDone ? (
                                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                                          ) : (
                                            <Square className="w-4 h-4 text-slate-400" />
                                          )}
                                        </button>

                                        <div className="space-y-1">
                                          <p className={`text-xs font-bold font-outfit ${isDone ? 'line-through text-emerald-800' : 'text-slate-900'}`}>
                                            {item.title}
                                          </p>

                                          <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant={item.type === 'milestone' ? 'purple' : item.type === 'resource' ? 'info' : 'default'} size="sm">
                                              {item.type}
                                            </Badge>

                                            {item.ref_provider && (
                                              <Badge variant="purple" size="sm">
                                                {item.ref_provider}
                                              </Badge>
                                            )}

                                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                              <Clock className="w-3 h-3 text-slate-400" /> {item.estimated_hours}h estimated
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        {item.ref_url && (
                                          <a
                                            href={item.ref_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 hover:bg-indigo-50"
                                            title="Open Resource / Practice"
                                          >
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span>
                                              {item.type === 'skill' ? 'Start Practice' : item.type === 'milestone' ? 'View Spec' : 'Open Resource'}
                                            </span>
                                            <ExternalLink className="w-3 h-3 text-indigo-500" />
                                          </a>
                                        )}

                                        <Button
                                          variant={isDone ? 'soft' : 'primary'}
                                          size="sm"
                                          onClick={() => toggleItemStatus(item.id, item.status)}
                                        >
                                          {isDone ? 'Done ✓' : 'Mark Done'}
                                        </Button>
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
