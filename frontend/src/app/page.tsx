'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BrainCircuit, Target, Map, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await (supabase.auth as any).getSession()
      setUser(data?.session?.user || null)
    }
    checkUser()
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-6xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-8 shadow-lg shadow-indigo-500/10">
        <BrainCircuit className="w-4 h-4 text-indigo-400" />
        AI-Powered Skill Intelligence & Career Mentor
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight drop-shadow-sm">
        Forge Your Tech Career with <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">Deterministic Precision</span> & AI Personalization
      </h1>

      <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
        Upload your resume, pinpoint exact skill gaps against real industry roles, and unlock a phased learning roadmap backed by smart resource recommendations.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-primary/30 transition-all hover:scale-105"
            >
              Go to Student Command Center
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/skills"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-panel text-slate-300 hover:text-white font-medium hover:border-white/20 transition-all"
            >
              Skills & Resume AI
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-primary/30 transition-all hover:scale-105"
            >
              Start Your Skill Gap Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-panel text-slate-300 hover:text-white font-medium hover:border-white/20 transition-all"
            >
              Sign In to Dashboard
            </Link>
          </>
        )}
      </div>

      {/* Feature Cards Grid */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-primary/40 transition-all group">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-4 group-hover:scale-110 transition-transform">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Skill-Gap Engine</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Deterministic matching compares your 0–4 proficiency scale against required role competencies with zero hallucinations.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-sky-500/40 transition-all group">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 w-fit mb-4 group-hover:scale-110 transition-transform">
            <Map className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Phased Roadmaps</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Topological prerequisite-sorted learning steps enriched with personalized AI narratives powered by Groq Llama 4 Scout.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/40 transition-all group">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Smart Recommendations</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Ranked courses, projects, and certifications matched to your priority gaps using vector embeddings.
          </p>
        </div>
      </div>
    </div>
  )
}
