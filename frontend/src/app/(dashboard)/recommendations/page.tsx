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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface RecommendationItem {
  id: number
  category: string
  title: string
  url?: string
  provider?: string
  type?: string
  description?: string
  difficulty: number
  estimated_hours: number
  level?: string
  career_relevance?: string
  matched_gap_skills: string[]
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

  useEffect(() => {
    fetchRecommendations(activeCategory)
  }, [activeCategory])

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
      ) : !data?.items || data.items.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-6 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-5 hover:border-indigo-200 hover:shadow-md transition-all group bg-white"
            >
              <div className="space-y-3">
                {/* Provider & Category Badges */}
                <div className="flex items-center justify-between gap-2">
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

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-2xs"
                  >
                    <span>View Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
