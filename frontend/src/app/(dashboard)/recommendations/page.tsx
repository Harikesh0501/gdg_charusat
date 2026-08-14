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

interface Milestone {
  id: string
  step: string
  task: string
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

export default function RecommendationsPage() {
  const [activeCategory, setActiveCategory] = useState<'resource' | 'project' | 'certification'>('resource')
  const [data, setData] = useState<RecommendationsData | null>(null)
  const [hasSkillsOrResume, setHasSkillsOrResume] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Project Blueprint Modal & Milestone Progress State
  const [selectedProject, setSelectedProject] = useState<RecommendationItem | null>(null)
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({})

  useEffect(() => {
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
      setLoading(true)
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
          setData({ category, items: [] })
          return
        }
        throw new Error('Failed to load recommendations')
      }

      const result: RecommendationsData = await res.json()
      setData(result)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Unable to fetch recommendations')
    } finally {
      setLoading(false)
    }
  }

  // Mandatory Resume Banner Guard
  if (!hasSkillsOrResume && !loading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-8 py-12 w-full space-y-8">
        <div className="border-b border-slate-200 pb-6 glass-panel p-6 rounded-2xl shadow-xs bg-white">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>AI Recommendation Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personalized Learning & Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Curated resources, hands-on portfolio projects, and certifications matched strictly to your active skill gaps.
          </p>
        </div>

        <div className="glass-panel p-12 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto space-y-5 shadow-sm bg-white">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Upload Your Resume First</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
              SkillForge surfaces candidate recommendations strictly matching your extracted resume skill gaps. Please upload your resume first to unlock recommendations.
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
            <Award className="w-4 h-4 text-indigo-600" />
            <span>AI Recommendation Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personalized Learning & Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Curated resources, hands-on portfolio projects, and certifications matched strictly to your active skill gaps.
          </p>
        </div>

        {data?.career_role_name && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold self-start md:self-auto shadow-2xs">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Target Role: {data.career_role_name}</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs max-w-xl">
        <button
          onClick={() => setActiveCategory('resource')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'resource'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses & Docs</span>
        </button>

        <button
          onClick={() => setActiveCategory('project')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'project'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Hands-On Projects</span>
        </button>

        <button
          onClick={() => setActiveCategory('certification')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'certification'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          <span>Certifications</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3 text-slate-500">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-medium">Computing candidate scores & recommendations...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-6 rounded-2xl border border-rose-200 text-center text-rose-700 text-sm font-medium">
          {error}
        </div>
      ) : !data?.career_role_name ? (
        <div className="glass-panel p-10 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto space-y-4 shadow-xs bg-white">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Target Career Role Selected</h3>
          <p className="text-sm text-slate-500">
            Select a target career role in the Learning Roadmap page to calculate skill gaps and surface curated recommendations.
          </p>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Go to Roadmap Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto space-y-4 shadow-xs bg-white">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">All Gaps Covered for {data.career_role_name}!</h3>
          <p className="text-sm text-slate-500">
            You have satisfied the required proficiencies for this category, or no additional items are currently needed. Check other tabs or update your target role.
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
                className="glass-panel p-6 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-5 hover:border-indigo-200 hover:shadow-md transition-all group bg-white"
              >
                <div className="space-y-3">
                  {/* Provider & Verified Source Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200">
                      {item.provider || 'SkillForge Curation'}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                        Score: {item.score.toFixed(1)}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 uppercase">
                        {item.type || item.level || activeCategory}
                      </span>
                    </div>
                  </div>

                  {/* Verified Source Citation Badge for Projects */}
                  {isProject && item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Source: GitHub Open Source Specification</span>
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                    </a>
                  )}

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Matched Skill Badges */}
                  {item.matched_gap_skills && item.matched_gap_skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-slate-500 font-bold">Closes Gaps:</span>
                      {item.matched_gap_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Milestone Progress Bar Preview for Projects */}
                  {isProject && milestones.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Implementation Progress</span>
                        </span>
                        <span className="text-indigo-600">{doneCount}/{milestones.length} Steps ({pct}%)</span>
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
                  <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Personalization Rationale</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      &quot;{item.explanation}&quot;
                    </p>
                  </div>
                </div>

                {/* Card Footer: Metadata & Action Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
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
                    <button
                      onClick={() => setSelectedProject(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>View Blueprint & Milestones</span>
                    </button>
                  ) : item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-2xs"
                    >
                      <span>View Resource</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PROJECT BLUEPRINT & MILESTONES MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col space-y-6 p-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider border border-indigo-200">
                    Project Implementation Blueprint
                  </span>
                  {selectedProject.url && (
                    <a
                      href={selectedProject.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified GitHub Spec ↗</span>
                    </a>
                  )}
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedProject.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & Metadata */}
            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedProject.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Estimated Time: {selectedProject.estimated_hours} Hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Complexity Level: {selectedProject.difficulty}/5</span>
                </div>
              </div>
            </div>

            {/* Overall Progress Gauge Bar */}
            {(() => {
              const milestones = selectedProject.milestones || []
              const doneCount = milestones.filter(m => completedMilestones[`${selectedProject.id}_${m.id}`]).length
              const pct = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0

              return (
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-indigo-600" />
                      <span>Milestones Mastered</span>
                    </span>
                    <span className="text-indigo-700">{doneCount} of {milestones.length} Completed ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
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
                    className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
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

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${isDone ? 'text-emerald-900 line-through' : 'text-indigo-700'}`}>
                          {m.step}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isDone ? 'Completed ✓' : 'Pending'}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDone ? 'text-emerald-800/80' : 'text-slate-600'}`}>
                        {m.task}
                      </p>
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

              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 ml-auto cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
