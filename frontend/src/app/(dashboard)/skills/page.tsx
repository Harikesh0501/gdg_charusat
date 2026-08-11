'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface StudentSkill {
  id: string
  profile_id: string
  skill_id: number
  skill_name: string
  skill_slug: string
  skill_category: string
  proficiency: number
  source: string
  confidence: number
  evidence: string | null
  updated_at: string
}

interface ResumeStatus {
  resume_id: string
  status: 'uploaded' | 'processing' | 'processed' | 'failed'
  file_name: string
  created_at: string
}

const PROFICIENCY_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'None', color: 'bg-slate-800 text-slate-400 border-slate-700' },
  1: { label: 'Aware', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  2: { label: 'Beginner', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  3: { label: 'Intermediate', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  4: { label: 'Advanced', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

const CATEGORY_NAMES: Record<string, string> = {
  programming_language: 'Programming Languages',
  framework_library: 'Frameworks & Libraries',
  database: 'Databases',
  cloud_devops: 'Cloud & DevOps',
  data_ml: 'Data Science & AI/ML',
  tool: 'Tools & Utilities',
  soft_skill: 'Soft Skills',
  concept: 'Concepts & Architecture',
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<StudentSkill[]>([])
  const [resumeStatus, setResumeStatus] = useState<ResumeStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchSkillsAndStatus = useCallback(async () => {
    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) return

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

      // Fetch active resume status
      const statusRes = await fetch(`${backendUrl}/api/resumes/status`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        setResumeStatus(statusData)
      }

      // Fetch normalized skills
      const skillsRes = await fetch(`${backendUrl}/api/profile/skills`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json()
        setSkills(skillsData)
      }
    } catch (err: any) {
      console.warn('Failed to fetch skills/resume status:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSkillsAndStatus()
  }, [fetchSkillsAndStatus])

  // Polling while resume status is processing
  useEffect(() => {
    if (resumeStatus?.status === 'processing') {
      const interval = setInterval(() => {
        fetchSkillsAndStatus()
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [resumeStatus?.status, fetchSkillsAndStatus])

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document (.pdf)')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) {
        setError('Authentication required')
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const res = await fetch(`${backendUrl}/api/resumes/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error?.message || 'Failed to upload resume')
      }

      const uploadData = await res.json()
      setResumeStatus({
        resume_id: uploadData.resume_id,
        status: uploadData.status,
        file_name: uploadData.file_name,
        created_at: new Date().toISOString(),
      })

      fetchSkillsAndStatus()
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const cat = skill.skill_category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {} as Record<string, StudentSkill[]>)

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium">Loading Skill Profile...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            Skill Intelligence Engine
          </div>
          <h1 className="text-2xl font-bold text-white">Verified Skills & Proficiency Matrix</h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload your PDF resume for AI skill normalization or self-report your proficiencies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            {skills.length} Skills Tracked
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Resume Upload Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`glass-panel p-8 rounded-2xl border-2 border-dashed transition-all text-center mb-10 ${
          dragActive
            ? 'border-primary bg-primary/10'
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-semibold text-white">
            {resumeStatus?.status === 'processing'
              ? 'AI Extraction in Progress...'
              : 'Upload PDF Resume for AI Skill Extraction'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 mb-6">
            Supported format: PDF (max 5MB). Groq Llama 4 Scout extracts skills, projects, and evidence with zero hallucination.
          </p>

          {resumeStatus && (
            <div className="mb-6 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center gap-3 text-xs text-slate-300">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-medium">{resumeStatus.file_name}</span>
              <span className="text-slate-500">•</span>
              <span className="capitalize">
                {resumeStatus.status === 'processing' && (
                  <span className="text-amber-400 inline-flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Processing
                  </span>
                )}
                {resumeStatus.status === 'processed' && (
                  <span className="text-emerald-400 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Processed
                  </span>
                )}
                {resumeStatus.status === 'failed' && (
                  <span className="text-red-400 inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Failed
                  </span>
                )}
              </span>
            </div>
          )}

          <label className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold cursor-pointer shadow-lg shadow-primary/25 transition-all flex items-center gap-2">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {uploading ? 'Uploading PDF...' : 'Select PDF File'}
            <input
              type="file"
              accept=".pdf"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Skills Matrix */}
      {Object.keys(groupedSkills).length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No Skills Extracted Yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Upload your resume above or run the database seed script to populate canonical skills.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSkills).map(([catKey, catSkills]) => (
            <div key={catKey} className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {CATEGORY_NAMES[catKey] || catKey}
                <span className="text-xs font-normal text-slate-500">({catSkills.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catSkills.map((sk) => {
                  const profInfo = PROFICIENCY_LABELS[sk.proficiency] || PROFICIENCY_LABELS[1]
                  return (
                    <div
                      key={sk.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-semibold text-sm text-white">{sk.skill_name}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${profInfo.color}`}>
                          {profInfo.label}
                        </span>
                      </div>

                      {sk.evidence && (
                        <p className="text-xs text-slate-400 line-clamp-2 italic mb-3">
                          &quot;{sk.evidence}&quot;
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-500">
                        <span className="capitalize">Source: {sk.source.replace('_', ' ')}</span>
                        <span>Confidence: {Math.round(sk.confidence * 100)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
