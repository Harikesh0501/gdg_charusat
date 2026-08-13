'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Target,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  ShieldCheck,
  Search,
  BookOpen,
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface StudentSkill {
  id: string
  skill_id: number
  skill_name: string
  category: string
  proficiency: number
  source: 'resume' | 'self_reported' | 'inferred' | 'assessment'
  confidence: number
  evidence: string | null
}

interface TaxonomySkill {
  id: number
  name: string
  slug: string
  category: string
  aliases: string[]
  difficulty: number
  description: string | null
}

interface ResumeState {
  id: string | null
  file_name: string | null
  status: 'uploaded' | 'processing' | 'processed' | 'failed' | null
  extraction: any | null
}

const PROFICIENCY_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Unaware', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
  1: { label: 'Beginner', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  2: { label: 'Intermediate', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  3: { label: 'Advanced', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  4: { label: 'Expert', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<StudentSkill[]>([])
  const [taxonomy, setTaxonomy] = useState<TaxonomySkill[]>([])
  const [resumeState, setResumeState] = useState<ResumeState>({
    id: null,
    file_name: null,
    status: null,
    extraction: null,
  })

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Manual Skill Add modal/form state
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('')
  const [selectedProficiency, setSelectedProficiency] = useState<number>(2)
  const [addingSkill, setAddingSkill] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

  const fetchData = async () => {
    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) {
        router.push('/sign-in')
        return
      }

      const headers = { Authorization: `Bearer ${session.access_token}` }

      // Fetch student skills
      const skillsRes = await fetch(`${backendUrl}/api/skills`, { headers })
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json()
        setSkills(skillsData.skills || [])
      }

      // Fetch taxonomy skills
      const taxonomyRes = await fetch(`${backendUrl}/api/skills/taxonomy`, { headers })
      if (taxonomyRes.ok) {
        const taxonomyData = await taxonomyRes.json()
        setTaxonomy(taxonomyData || [])
      }

      // Fetch latest resume status
      const resumeRes = await fetch(`${backendUrl}/api/resume/latest`, { headers })
      if (resumeRes.ok) {
        const resumeData = await resumeRes.json()
        if (resumeData.resume) {
          setResumeState({
            id: resumeData.resume.id,
            file_name: resumeData.resume.file_name,
            status: resumeData.resume.status,
            extraction: resumeData.extraction,
          })
        }
      }
    } catch (err) {
      console.warn('Error fetching skills page data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [router])

  // Poll for resume status while processing
  useEffect(() => {
    if (resumeState.status !== 'processing' || !resumeState.id) return

    const interval = setInterval(async () => {
      try {
        const { data: sessionResult } = await (supabase.auth as any).getSession()
        const session = sessionResult?.session
        if (!session) return

        const res = await fetch(`${backendUrl}/api/resume/${resumeState.id}/status`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })

        if (res.ok) {
          const updatedResume = await res.json()
          if (updatedResume.status !== 'processing') {
            setResumeState((prev) => ({ ...prev, status: updatedResume.status }))
            fetchData() // Re-fetch extracted skills once done!
          }
        }
      } catch (err) {
        console.warn('Error polling resume status:', err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [resumeState.status, resumeState.id])

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)

    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) {
        router.push('/sign-in')
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${backendUrl}/api/resume/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error?.message || 'Failed to upload resume')
      }

      const uploadData = await res.json()
      setResumeState({
        id: uploadData.resume_id,
        file_name: file.name,
        status: uploadData.status,
        extraction: null,
      })
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  const handleAddManualSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSkillId) return

    setAddingSkill(true)
    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) return

      const res = await fetch(`${backendUrl}/api/skills`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill_id: Number(selectedSkillId),
          proficiency: selectedProficiency,
        }),
      })

      if (res.ok) {
        setShowAddModal(false)
        setSelectedSkillId('')
        setSelectedProficiency(2)
        fetchData()
      }
    } catch (err) {
      console.warn('Error adding manual skill:', err)
    } finally {
      setAddingSkill(false)
    }
  }

  const handleRemoveSkill = async (skillId: number) => {
    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) return

      const res = await fetch(`${backendUrl}/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.skill_id !== skillId))
      }
    } catch (err) {
      console.warn('Error removing skill:', err)
    }
  }

  // Filter skills
  const categories = Array.from(new Set(skills.map((s) => s.category)))
  const filteredSkills = skills.filter((s) => {
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter
    const matchesSearch = s.skill_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Filter available taxonomy skills for manual addition (excluding already added)
  const existingSkillIds = new Set(skills.map((s) => s.skill_id))
  const availableTaxonomySkills = taxonomy.filter((t) => !existingSkillIds.has(t.id))

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium">Loading Skills Intelligence...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            Skill Intelligence Engine
          </div>
          <h1 className="text-2xl font-bold text-white">Skills Profile & Resume AI</h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload your resume for AI skill normalization or manage your verified technical competencies.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Skill Manually
        </button>
      </div>

      {/* Resume Upload & AI Extraction Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Resume Extraction</h2>
              <p className="text-xs text-slate-400">PDF or DOCX (max 5MB) • Instant Groq Llama 4 Scout parsing</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Direct In-Memory Parsing (No Cloud File Storage)
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Status Banners */}
        {resumeState.status === 'processing' && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-indigo-300 text-xs animate-pulse">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="font-semibold">Parsing {resumeState.file_name}...</p>
                <p className="text-slate-400 mt-0.5">Extracting text & matching skills via Groq Llama 4 Scout</p>
              </div>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">Status: Processing</span>
          </div>
        )}

        {resumeState.status === 'processed' && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-300 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-semibold">Active Resume: {resumeState.file_name}</p>
                <p className="text-emerald-400/80 mt-0.5">AI extraction complete • Skills normalized into profile</p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium transition-all"
            >
              Re-upload Resume
            </button>
          </div>
        )}

        {resumeState.status === 'failed' && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-amber-300 text-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-semibold">Extraction Incomplete for {resumeState.file_name}</p>
                <p className="text-amber-300/80 mt-0.5">File contains non-parseable text or scanned layout. You can add skills manually below.</p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* File Dropzone */}
        {resumeState.status !== 'processing' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-primary/50 bg-slate-900/40 hover:bg-slate-900/60 p-8 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />
            {uploading ? (
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
            ) : (
              <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-primary transition-colors mb-2" />
            )}
            <p className="text-sm font-semibold text-white">
              {uploading ? 'Uploading resume...' : 'Click to select or drag & drop your resume'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports PDF or DOCX up to 5MB</p>
          </div>
        )}
      </div>

      {/* Skills Profile Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Your Competencies ({skills.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary text-xs"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2 px-3 rounded-xl bg-slate-900/60 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-primary"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {filteredSkills.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center text-slate-400">
            <Target className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <h3 className="text-base font-semibold text-white mb-1">No Skills Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Upload your resume above or add skills manually to populate your personalized skill profile and unlock recommendations.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Your First Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((item) => {
              const profInfo = PROFICIENCY_LABELS[item.proficiency] || PROFICIENCY_LABELS[2]
              return (
                <div
                  key={item.id}
                  className="glass-panel p-5 rounded-xl border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-white">{item.skill_name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${profInfo.color}`}>
                        {profInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-white/5">
                        {item.category.replace('_', ' ')}
                      </span>

                      {item.source === 'resume' ? (
                        <span className="text-[10px] font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Resume Extracted
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                          Self-Reported
                        </span>
                      )}
                    </div>

                    {item.evidence && (
                      <p className="text-xs text-slate-400 italic line-clamp-2 bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
                        &quot;{item.evidence}&quot;
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px]">Confidence: {Math.round(item.confidence * 100)}%</span>
                    <button
                      onClick={() => handleRemoveSkill(item.skill_id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove Skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Manual Skill</h3>
            <p className="text-xs text-slate-400 mb-6">Select a skill from the curated taxonomy and assign your proficiency level.</p>

            <form onSubmit={handleAddManualSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Skill *
                </label>
                <select
                  required
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">-- Choose from taxonomy --</option>
                  {availableTaxonomySkills.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Proficiency Level
                </label>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value={1}>1 — Beginner (Basic familiarity)</option>
                  <option value={2}>2 — Intermediate (Working knowledge)</option>
                  <option value={3}>3 — Advanced (Proficient / Project experience)</option>
                  <option value={4}>4 — Expert (Mastery / Professional experience)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSkillId || addingSkill}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {addingSkill ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
