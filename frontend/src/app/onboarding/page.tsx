'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  User,
  GraduationCap,
  Building2,
  Calendar,
  Tags,
  AlignLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react'
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
  const [isCompleted, setIsCompleted] = useState(false)

  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        const { data: sessionResult } = await (supabase.auth as any).getSession()
        const session = sessionResult?.session

        if (!session) {
          router.push('/sign-in')
          return
        }

        const res = await fetch(`${backendUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })

        if (res.ok) {
          const profile = await res.json()
          if (profile) {
            if (profile.full_name) setFullName(profile.full_name)
            if (profile.education_level) setEducationLevel(profile.education_level)
            if (profile.institution) setInstitution(profile.institution)
            if (profile.graduation_year) setGraduationYear(profile.graduation_year)
            if (profile.interests && Array.isArray(profile.interests)) setInterests(profile.interests)
            if (profile.bio) setBio(profile.bio)
            if (profile.onboarding_completed) setIsCompleted(true)
          }
        }
      } catch (err) {
        console.warn('Error fetching profile:', err)
      } finally {
        setFetching(false)
      }
    }

    fetchExistingProfile()
  }, [router])

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const { data: sessionResult } = await (supabase.auth as any).getSession()
      const session = sessionResult?.session

      if (!session) {
        router.push('/sign-in')
        return
      }

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

      setIsCompleted(true)
      setSuccessMsg('Onboarding profile updated & saved successfully!')

      setTimeout(() => {
        router.push('/dashboard')
      }, 1200)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Loading Saved Profile Data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-12 glow-gradient relative">
      <div className="w-full max-w-2xl bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl relative">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          {isCompleted && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Saved & Active Profile
            </span>
          )}
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-3 shadow-2xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Onboarding Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isCompleted
              ? 'Your academic background & interests are saved below. You can update your profile anytime.'
              : 'Set up your academic background and interests to personalize your learning roadmap'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs font-medium"
              />
            </div>
          </div>

          {/* Education Level & Institution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Education Level *
              </label>
              <div className="relative">
                <GraduationCap className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs font-medium appearance-none cursor-pointer"
                >
                  <option value="high_school">High School</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="other">Other / Self-Taught</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Institution / University
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Expected Graduation Year
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="number"
                min={1970}
                max={2035}
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs font-medium"
              />
            </div>
          </div>

          {/* Career Interests Tag Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white border border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Short Bio / Career Objectives
            </label>
            <div className="relative">
              <AlignLeft className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your career goals and what tech skills you want to master..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 mt-8 text-xs cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isCompleted ? 'Save & Update Profile' : 'Complete Onboarding & Enter Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
