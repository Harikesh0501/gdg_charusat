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
  Check,
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
  0: { label: 'Unaware', color: 'text-slate-500 bg-slate-100 border-slate-200' },
  1: { label: 'Beginner', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  2: { label: 'Intermediate', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  3: { label: 'Advanced', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  4: { label: 'Expert', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
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
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Multi-Skill Selection state for Manual Add
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([])
  const [selectedProficiency, setSelectedProficiency] = useState<number>(2)
  const [modalSearch, setModalSearch] = useState<string>('')
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
      console.log('[SkillForge DEBUG] /api/skills response status:', skillsRes.status)
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json()
        console.log('[SkillForge DEBUG] Skills data received:', skillsData)
        console.log('[SkillForge DEBUG] Skills count:', skillsData.skills?.length || 0)
        setSkills(skillsData.skills || [])
      } else {
        const errText = await skillsRes.text()
        console.error('[SkillForge DEBUG] Skills API error:', errText)
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

  // Fast Status Polling (700ms) for instant UI updates during resume extraction
  useEffect(() => {
    if (!resumeState.id || (resumeState.status !== 'processing' && resumeState.status !== 'uploaded')) return

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
          if (updatedResume.status === 'processed') {
            setResumeState((prev) => ({ ...prev, status: 'processed' }))
            setUploadSuccessMsg('Resume parsed successfully! Multiple skills extracted into profile.')
            fetchData() // Re-fetch extracted skills once done!
            clearInterval(interval)
          } else if (updatedResume.status === 'failed') {
            setResumeState((prev) => ({ ...prev, status: 'failed' }))
            clearInterval(interval)
          } else {
            setResumeState((prev) => ({ ...prev, status: updatedResume.status }))
          }
        }
      } catch (err) {
        console.warn('Error polling resume status:', err)
      }
    }, 700)

    return () => clearInterval(interval)
  }, [resumeState.status, resumeState.id])

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    setUploadSuccessMsg(null)

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
        throw new Error(errData.error?.message || errData.detail || 'Failed to upload resume')
      }

      const uploadData = await res.json()
      setResumeState({
        id: uploadData.resume_id,
        file_name: file.name,
        status: 'processing',
        extraction: null,
      })
      setUploadSuccessMsg('Resume uploaded successfully! Fast skill extraction in progress...')
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  const toggleSkillSelection = (id: number) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleAddBatchSkills = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSkillIds.length === 0) return

    setAddingSkill(true)
    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) return

      await Promise.all(
        selectedSkillIds.map((id) =>
          fetch(`${backendUrl}/api/skills`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              skill_id: id,
              proficiency: selectedProficiency,
            }),
          })
        )
      )

      setShowAddModal(false)
      setSelectedSkillIds([])
      setModalSearch('')
      setSelectedProficiency(2)
      fetchData()
    } catch (err) {
      console.warn('Error adding batch skills:', err)
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

  // Clean hex/uuid suffixes and deduplicate taxonomy skills for manual addition
  const existingSkillIds = new Set(skills.map((s) => s.skill_id))
  const availableTaxonomySkills = taxonomy
    .filter((t) => !existingSkillIds.has(t.id))
    .reduce<TaxonomySkill[]>((acc, current) => {
      const cleanedName = current.name.replace(/\s+[0-9a-fA-F]{6,12}$/g, '').trim()
      const isDuplicate = acc.some(
        (item) => item.name.replace(/\s+[0-9a-fA-F]{6,12}$/g, '').trim().toLowerCase() === cleanedName.toLowerCase()
      )
      if (!isDuplicate) {
        acc.push({
          ...current,
          name: cleanedName,
        })
      }
      return acc
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name))

  const filteredModalSkills = availableTaxonomySkills.filter((t) =>
    t.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
    t.category.toLowerCase().includes(modalSearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Loading Skills Intelligence...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs bg-white">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Target className="w-4 h-4 text-indigo-600" />
            Skill Intelligence Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Skills Profile & Resume AI</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload your resume for bulk skill extraction or select multiple skills manually.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Multiple Skills
        </button>
      </div>

      {/* Resume Upload & AI Extraction Section */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Resume Skill Extraction</h2>
              <p className="text-xs text-slate-500">PDF or DOCX (max 5MB) • Fast parallel skill normalization</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Direct In-Memory Parsing
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccessMsg && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{uploadSuccessMsg}</span>
          </div>
        )}

        {/* Status Banners */}
        {(resumeState.status === 'processing' || resumeState.status === 'uploaded') && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-indigo-900 text-xs animate-pulse">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <div>
                <p className="font-bold">Parsing {resumeState.file_name}...</p>
                <p className="text-slate-500 mt-0.5">Fast extraction & taxonomy matching in progress</p>
              </div>
            </div>
            <span className="text-indigo-700 font-mono text-[11px]">Status: Processing</span>
          </div>
        )}

        {resumeState.status === 'processed' && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold">Active Resume: {resumeState.file_name}</p>
                <p className="text-slate-600 mt-0.5">Extraction complete • All skills added to profile</p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              Re-upload Resume
            </button>
          </div>
        )}

        {/* File Dropzone */}
        {resumeState.status !== 'processing' && resumeState.status !== 'uploaded' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 p-8 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center group shadow-2xs"
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
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-2" />
            ) : (
              <UploadCloud className="w-10 h-10 text-indigo-500 group-hover:scale-110 transition-transform mb-2" />
            )}
            <p className="text-sm font-bold text-slate-900">
              {uploading ? 'Uploading resume...' : 'Click to select or drag & drop your resume for extraction'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Supports PDF or DOCX up to 5MB</p>
          </div>
        )}
      </div>

      {/* Skills Profile Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Your Competencies ({skills.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-xs shadow-2xs"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {filteredSkills.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-200 text-center text-slate-500 bg-white">
            <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Skills Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Upload your resume above or select multiple skills manually to populate your profile.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Multiple Skills
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((item) => {
              const profInfo = PROFICIENCY_LABELS[item.proficiency] || PROFICIENCY_LABELS[2]
              return (
                <div
                  key={item.id}
                  className="glass-panel p-5 rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between bg-white"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-900">{item.skill_name}</h3>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${profInfo.color}`}>
                        {profInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.category.replace('_', ' ')}
                      </span>

                      {item.source === 'resume' ? (
                        <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <Zap className="w-3 h-3 text-sky-600" /> Resume Extracted
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                          Self-Reported
                        </span>
                      )}
                    </div>

                    {item.evidence && (
                      <p className="text-xs text-slate-600 italic line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        &quot;{item.evidence}&quot;
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px]">Confidence: {Math.round(item.confidence * 100)}%</span>
                    <button
                      onClick={() => handleRemoveSkill(item.skill_id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
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

      {/* Multi-Skill Addition Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add Multiple Skills</h3>
              <p className="text-xs text-slate-500">Select one or multiple skills from the taxonomy list below.</p>
            </div>

            <form onSubmit={handleAddBatchSkills} className="flex-1 flex flex-col min-h-0 space-y-4">
              {/* Search taxonomy */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search taxonomy skills..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Scrollable Checkbox Skill Selection List */}
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-56 space-y-1.5">
                {filteredModalSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No matching skills available</p>
                ) : (
                  filteredModalSkills.map((t) => {
                    const isSelected = selectedSkillIds.includes(t.id)
                    return (
                      <div
                        key={t.id}
                        onClick={() => toggleSkillSelection(t.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected ? 'bg-white text-indigo-600 border-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{t.name}</span>
                        </div>
                        <span
                          className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                            isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {t.category.replace('_', ' ')}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Proficiency Level Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Proficiency Level for Selected Skills ({selectedSkillIds.length})
                </label>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value={1}>1 — Beginner (Basic familiarity)</option>
                  <option value={2}>2 — Intermediate (Working knowledge)</option>
                  <option value={3}>3 — Advanced (Proficient / Project experience)</option>
                  <option value={4}>4 — Expert (Mastery / Professional experience)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500">
                  {selectedSkillIds.length} skill{selectedSkillIds.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setSelectedSkillIds([])
                    }}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedSkillIds.length === 0 || addingSkill}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    {addingSkill ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `Save ${selectedSkillIds.length} Skill${selectedSkillIds.length !== 1 ? 's' : ''}`
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
