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
  Compass,
  AlignLeft,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Check,
  Zap,
  Code2,
  Cpu,
  Layers,
  Flame,
  Globe,
  Database,
  Cloud,
  Lock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressRing } from '@/components/ui/ProgressRing'

interface DomainOption {
  id: string
  label: string
  icon: React.ReactNode
}

const DOMAIN_OPTIONS: DomainOption[] = [
  { id: 'fullstack', label: 'Full-Stack Web (Next.js & React)', icon: <Globe className="w-3.5 h-3.5" /> },
  { id: 'backend', label: 'Backend & High-Scale APIs (FastAPI / Python)', icon: <Database className="w-3.5 h-3.5" /> },
  { id: 'ai_ml', label: 'Generative AI & LLM Engineering', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'cloud_devops', label: 'Cloud Infrastructure & DevOps (Docker / K8s)', icon: <Cloud className="w-3.5 h-3.5" /> },
  { id: 'distributed_sys', label: 'Distributed Systems & Architecture', icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: 'data_eng', label: 'Data Science & Big Data Engineering', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'cybersecurity', label: 'Cybersecurity & Application Defense', icon: <Lock className="w-3.5 h-3.5" /> },
  { id: 'algorithms', label: 'Competitive Programming & DSA', icon: <Code2 className="w-3.5 h-3.5" /> },
]

const EDUCATION_LEVELS = [
  { value: 'undergraduate', label: 'Undergraduate (B.Tech / B.E. / B.S.)' },
  { value: 'postgraduate', label: 'Postgraduate (M.Tech / M.S. / MCA)' },
  { value: 'high_school', label: 'High School / Diploma' },
  { value: 'other', label: 'Self-Taught / Industry Pro' },
]

const QUICK_AMBITIONS = [
  'Targeting Tier-1 Product Engineering Roles',
  'Mastering Scalable Microservices & FastAPI',
  'Building Production-Grade GenAI & LLM Systems',
  'Preparing for High-Impact Technical Interviews',
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
    const fetchProfile = async () => {
      try {
        const { data: sessionResult } = await (supabase.auth as any).getSession()
        const session = sessionResult?.session

        if (!session) {
          router.push('/sign-in')
          return
        }

        const headers = { Authorization: `Bearer ${session.access_token}` }

        // Prefill name from auth metadata if available
        if (session.user?.user_metadata?.full_name) {
          setFullName(session.user.user_metadata.full_name)
        }

        const res = await fetch(`${backendUrl}/api/profile`, { headers })
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

    fetchProfile()
  }, [router])

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  // Calculate profile strength dynamically
  const calculateStrength = () => {
    let score = 20
    if (fullName.trim().length >= 2) score += 20
    if (institution.trim().length > 0) score += 20
    if (interests.length >= 1) score += 20
    if (bio.trim().length >= 10) score += 20
    return Math.min(100, score)
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
          Authorization: `Bearer ${session.access_token}`,
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
        throw new Error(errorData.error?.message || 'Failed to save student profile')
      }

      setIsCompleted(true)
      setSuccessMsg('Profile synchronized & saved successfully! Redirecting to command center...')

      setTimeout(() => {
        router.push('/dashboard')
      }, 900)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const profileStrength = calculateStrength()
  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'SF'

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 bg-dot-grid">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700 font-outfit">Loading Student Profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-dot-grid bg-slate-50/60 flex flex-col items-center justify-start px-4 sm:px-6 py-12 overflow-y-auto">
      <div className="w-full max-w-3xl space-y-6 my-auto">
        
        {/* Top Floating Glass Header Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-500" />

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/20 font-outfit shrink-0">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="purple" size="sm" dot>
                  Student Identity Hub
                </Badge>
                {isCompleted && (
                  <Badge variant="success" size="sm">
                    Verified Profile
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-outfit">
                {fullName || 'Student Profile Setup'}
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                {institution ? `${institution} • Class of ${graduationYear}` : 'Configure your academic identity & domain specialties'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <ProgressRing progress={profileStrength} size={65} strokeWidth={6} label="POWER" />
            <div>
              <span className="text-xs font-bold text-slate-900 block font-outfit">
                {profileStrength}% Profile Power
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {profileStrength >= 80 ? 'Production Ready' : 'Configuring'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs font-medium shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Powerful Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Academic & Personal Details */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-outfit">Academic & Background Identity</h2>
                <p className="text-xs text-slate-500">Your core credentials for personalized prerequisite difficulty</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-xs font-medium transition-all"
                  />
                </div>
              </div>

              {/* Institution / College */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institution / University
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Stanford University / CHARUSAT"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-xs font-medium transition-all"
                  />
                </div>
              </div>

              {/* Expected Graduation Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expected Graduation Year
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="number"
                    min={1970}
                    max={2035}
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-xs font-medium transition-all"
                  />
                </div>
              </div>

              {/* Education Level Selector Pills */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Education Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EDUCATION_LEVELS.map((lvl) => {
                    const isSelected = educationLevel === lvl.value
                    return (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setEducationLevel(lvl.value)}
                        className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{lvl.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Domain Passions & Specialties */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-outfit">Domain Specialties & Tech Passions</h2>
                  <p className="text-xs text-slate-500">Select the domains you want to master in your curriculum</p>
                </div>
              </div>

              <Badge variant="purple" size="sm">
                {interests.length} Selected
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DOMAIN_OPTIONS.map((item) => {
                const selected = interests.includes(item.label)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInterest(item.label)}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between active:scale-[0.98] ${
                      selected
                        ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-white shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${selected ? 'bg-white/20 text-white' : 'bg-white text-indigo-600 border border-slate-200'}`}>
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {selected && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Card 3: Career Statement & Ambitions */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-2xs">
                <AlignLeft className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-outfit">Career Ambitions & Objectives</h2>
                <p className="text-xs text-slate-500">A short statement of your technical goals or dream target companies</p>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick-Insert Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_AMBITIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBio(q)}
                    className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                  >
                    + {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write your career objectives, desired companies, or engineering goals..."
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-xs font-medium resize-none transition-all"
              />
            </div>
          </div>

          {/* Bottom High-Impact Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="ghost" size="md" className="w-full sm:w-auto" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Skip to Dashboard
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-lg shadow-indigo-600/25"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Save Profile & Launch Command Center
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
