'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Award,
  BookOpen,
  FolderGit2,
  BadgeCheck,
  ExternalLink,
  Sparkles,
  Clock,
  BarChart3,
  Loader2,
  Target,
  ArrowRight,
  UploadCloud,
  FileText,
  CheckSquare,
  Square,
  X,
  ShieldCheck,
  GitBranch,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

interface Milestone {
  id: string
  step: string
  task: string
  resource_title?: string
  resource_url?: string
  resource_provider?: string
}

interface RecommendationItem {
  id: number
  category: string
  title: string
  url?: string
  provider?: string
  source_reference?: string
  type?: string
  description?: string
  difficulty: number
  estimated_hours: number
  level?: string
  career_relevance?: string
  matched_gap_skills: string[]
  milestones?: Milestone[]
  score: number
  explanation: string
}

interface RecommendationsData {
  career_role_id?: number
  career_role_name?: string
  category: string
  items: RecommendationItem[]
}

// In-Memory Client Cache for 0ms Instant Tab Switches
const _REC_CACHE: Record<string, RecommendationsData> = {}

export default function RecommendationsPage() {
  const [activeCategory, setActiveCategory] = useState<'resource' | 'project' | 'certification'>('resource')
  const [data, setData] = useState<RecommendationsData | null>(_REC_CACHE['resource'] || null)
  const [hasSkillsOrResume, setHasSkillsOrResume] = useState<boolean>(true)
  const [loading, setLoading] = useState(!_REC_CACHE['resource'])
  const [error, setError] = useState<string | null>(null)

  // Project Blueprint Modal & Milestone Progress State
  const [selectedProject, setSelectedProject] = useState<RecommendationItem | null>(null)
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // 0ms Instant Tab Switch from cache
    if (_REC_CACHE[activeCategory]) {
      setData(_REC_CACHE[activeCategory])
      setLoading(false)
    }
    fetchRecommendations(activeCategory)
  }, [activeCategory])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skillforge_project_milestones')
      if (saved) {
        try {
          setCompletedMilestones(JSON.parse(saved))
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [])

  // 0ms Instant Milestone Toggle
  const toggleMilestone = (projectId: number, milestoneId: string) => {
    const key = `${projectId}_${milestoneId}`
    const updated = { ...completedMilestones, [key]: !completedMilestones[key] }
    setCompletedMilestones(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('skillforge_project_milestones', JSON.stringify(updated))
    }
  }

  const fetchRecommendations = async (category: string) => {
    try {
      if (!_REC_CACHE[category]) {
        setLoading(true)
      }
      setError(null)
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()

      const headers: HeadersInit = {}
      if (sessionData?.session?.access_token) {
        headers['Authorization'] = `Bearer ${sessionData.session.access_token}`
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

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

      const res = await fetch(`${backendUrl}/api/recommendations?category=${category}`, { headers })

      if (!res.ok) {
        if (res.status === 404) {
          const empty = { category, items: [] }
          _REC_CACHE[category] = empty
          setData(empty)
          return
        }
        throw new Error('Failed to load recommendations')
      }

      const result: RecommendationsData = await res.json()
      _REC_CACHE[category] = result
      setData(result)
    } catch (err: any) {
      console.error(err)
      if (!_REC_CACHE[category]) {
        setError(err.message || 'Unable to fetch recommendations')
      }
    } finally {
      setLoading(false)
    }
  }

  // Mandatory Resume Banner Guard
  if (!hasSkillsOrResume && !loading) {
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
              SkillForge surfaces candidate recommendations strictly matching your extracted resume skill gaps. Upload your resume first to unlock curated projects and resources.
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
      {/* Page Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple" size="sm" dot>
              Recommendation Engine
            </Badge>
            {data?.career_role_name && (
              <Badge variant="info" size="sm">
                Target Role: {data.career_role_name}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-outfit">
            Projects, Courses & Certifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Curated resources, hands-on portfolio blueprints, and certifications matched strictly to your active skill gaps.
          </p>
        </div>
      </div>

      {/* Category Segmented Tabs - 0ms Instant Tab Switch */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-2xs max-w-xl">
        <button
          onClick={() => setActiveCategory('resource')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
            activeCategory === 'resource'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses & Docs</span>
        </button>

        <button
          onClick={() => setActiveCategory('project')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
            activeCategory === 'project'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Hands-On Projects</span>
        </button>

        <button
          onClick={() => setActiveCategory('certification')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
            activeCategory === 'certification'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          <span>Certifications</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 text-center space-y-3 text-slate-500 bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-800">Scoring & retrieving personalized recommendations...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center text-rose-700 text-sm font-medium">
          {error}
        </div>
      ) : !data?.career_role_name ? (
        <div className="p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 text-center max-w-xl mx-auto space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-outfit">No Target Career Role Selected</h3>
          <p className="text-xs text-slate-500 font-normal">
            Select a target career role in the Learning Roadmap page to calculate skill gaps and surface curated recommendations.
          </p>
          <Link href="/roadmap" className="inline-block">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Go to Roadmap
            </Button>
          </Link>
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 text-center max-w-xl mx-auto space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-outfit">All Gaps Covered for {data.career_role_name}!</h3>
          <p className="text-xs text-slate-500 font-normal">
            You have satisfied the required proficiencies for this category. Check other tabs or update your target role.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.items.map((item) => {
            const isProject = activeCategory === 'project'
            const milestones = item.milestones || []
            const doneCount = milestones.filter(m => completedMilestones[`${item.id}_${m.id}`]).length
            const pct = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0

            return (
              <div
                key={item.id}
                className="p-6 sm:p-7 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:border-indigo-300 hover:shadow-[0_12px_28px_-6px_rgba(99,102,241,0.09)] transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3.5">
                  {/* Provider & Verified Source Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="default" size="sm">
                      {item.provider || 'SkillForge Curation'}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm">
                        Score: {item.score.toFixed(1)}
                      </Badge>
                      <Badge variant="success" size="sm">
                        {item.type || item.level || activeCategory}
                      </Badge>
                    </div>
                  </div>

                  {/* Verified Source Citation Badge for Projects */}
                  {isProject && item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Source: Verified GitHub Blueprint</span>
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                    </a>
                  )}

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors font-outfit">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
                      {item.description}
                    </p>
                  )}

                  {/* Matched Skill Badges */}
                  {item.matched_gap_skills && item.matched_gap_skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-slate-400 font-semibold">Closes Gaps:</span>
                      {item.matched_gap_skills.map((skill, idx) => (
                        <Badge key={idx} variant="success" size="sm" dot>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Milestone Progress Bar Preview for Projects */}
                  {isProject && milestones.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Implementation Progress</span>
                        </span>
                        <span className="text-indigo-600 font-outfit">{doneCount}/{milestones.length} Steps ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* AI Personalized Explanation Box */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Personalization Rationale</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic font-normal">
                      &quot;{item.explanation}&quot;
                    </p>
                  </div>
                </div>

                {/* Card Footer: Metadata & Action Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.estimated_hours}h est.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Level {item.difficulty}/5</span>
                    </div>
                  </div>

                  {isProject ? (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<GitBranch className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedProject(item)}
                    >
                      View Blueprint
                    </Button>
                  ) : item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View Resource
                      </Button>
                    </a>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PROJECT BLUEPRINT & MILESTONES MODAL - 0ms Instant Dialog */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          size="xl"
          title={selectedProject.title}
          description="4-Phase Step-by-Step Implementation Blueprint & Architecture Specifications"
        >
          <div className="space-y-6">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {selectedProject.description}
            </p>

            {/* Overall Progress Gauge Bar */}
            {(() => {
              const milestones = selectedProject.milestones || []
              const doneCount = milestones.filter(m => completedMilestones[`${selectedProject.id}_${m.id}`]).length
              const pct = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0

              return (
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-indigo-600" />
                      <span>Milestones Mastered</span>
                    </span>
                    <span className="text-indigo-700 font-outfit">{doneCount} of {milestones.length} Completed ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })()}

            {/* 4 Step-by-Step Milestone Implementation Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Step-by-Step Implementation Roadmap
              </h3>

              {(selectedProject.milestones || []).map((m) => {
                const key = `${selectedProject.id}_${m.id}`
                const isDone = !!completedMilestones[key]

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-white border-slate-200/90 hover:border-indigo-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleMilestone(selectedProject.id, m.id)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                    >
                      {isDone ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold font-outfit ${isDone ? 'text-emerald-900 line-through' : 'text-indigo-700'}`}>
                          {m.step}
                        </span>
                        <Badge variant={isDone ? 'success' : 'outline'} size="sm">
                          {isDone ? 'Completed ✓' : 'Pending'}
                        </Badge>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDone ? 'text-emerald-800/80' : 'text-slate-600 font-normal'}`}>
                        {m.task}
                      </p>

                      {/* Dedicated Milestone Learning Resource Link */}
                      {m.resource_url && (
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 mt-2">
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{m.resource_provider || 'Docs'}: {m.resource_title || 'Milestone Guide'}</span>
                          </span>
                          <a
                            href={m.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold inline-flex items-center gap-1 transition-colors border border-indigo-200"
                          >
                            <span>Study Milestone Resource</span>
                            <ExternalLink className="w-3 h-3 text-indigo-600" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              {selectedProject.url && (
                <a
                  href={selectedProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Open GitHub Reference Repo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <Button
                variant="primary"
                size="sm"
                className="ml-auto"
                onClick={() => setSelectedProject(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
