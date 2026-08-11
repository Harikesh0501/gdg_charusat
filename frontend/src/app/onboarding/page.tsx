'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, User, GraduationCap, Building2, Calendar, Tags, AlignLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const INTEREST_OPTIONS = [
  'Web Development',
  'Frontend Engineering',
  'Backend Engineering',
  'Full-Stack Development',
  'Data Science & Analytics',
  'Machine Learning & AI',
  'Cloud & DevOps',
  'Mobile App Development',
  'Cybersecurity',
  'System Architecture',
]

export default function OnboardingPage() {
  const [fullName, setFullName] = useState('')
  const [educationLevel, setEducationLevel] = useState('undergraduate')
  const [institution, setInstitution] = useState('')
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear() + 2)
  const [interests, setInterests] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) {
        router.push('/sign-in')
        return
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const res = await fetch(`${backendUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          education_level: educationLevel,
          institution: institution || null,
          graduation_year: Number(graduationYear) || null,
          interests: interests,
          bio: bio || null,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Failed to save onboarding profile')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl glass-panel p-8 sm:p-10 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-white">Student Onboarding</h1>
          <p className="text-sm text-slate-400 mt-1">
            Set up your academic background and interests to personalize your learning roadmap
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          {/* Education Level & Institution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Education Level *
              </label>
              <div className="relative">
                <GraduationCap className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="high_school" className="bg-slate-900">High School</option>
                  <option value="undergraduate" className="bg-slate-900">Undergraduate</option>
                  <option value="postgraduate" className="bg-slate-900">Postgraduate</option>
                  <option value="other" className="bg-slate-900">Other / Self-Taught</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Institution / University
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Expected Graduation Year
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="number"
                min={1970}
                max={2035}
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          {/* Career Interests Tag Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Career Interests & Domains (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {INTEREST_OPTIONS.map((tag) => {
                const selected = interests.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selected
                        ? 'bg-primary text-white border border-primary shadow-md shadow-primary/20'
                        : 'bg-slate-900/40 text-slate-400 border border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Short Bio / Career Objectives
            </label>
            <div className="relative">
              <AlignLeft className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your career goals and what tech skills you want to master..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-primary/25 transition-all disabled:opacity-50 mt-8"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Complete Onboarding & Enter Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
