'use client'

import Link from 'next/link'
import { ArrowRight, BrainCircuit, Target, Map, Award } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-between sm:justify-center px-6 py-6 sm:py-8 max-w-6xl mx-auto text-center space-y-6 overflow-y-auto h-full">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 shadow-2xs shrink-0">
        <BrainCircuit className="w-4 h-4 text-indigo-600" />
        AI-Powered Skill Intelligence & Career Mentor
      </div>

      {/* Main Headline with Vibrant Contrast */}
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 max-w-4xl leading-tight shrink-0">
        Forge Your Tech Career with{' '}
        <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
          Deterministic Precision
        </span>{' '}
        & AI Personalization
      </h1>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium leading-relaxed shrink-0">
        Upload your resume, pinpoint exact skill gaps against real industry roles, and unlock a phased learning roadmap backed by smart resource recommendations.
      </p>

      {/* CTA Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center shrink-0">
        <Link
          href="/sign-in"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
        >
          Start Your Skill Gap Analysis
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/sign-in"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 shadow-2xs transition-all"
        >
          Sign In to Dashboard
        </Link>
      </div>

      {/* Feature Cards Grid */}
      <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left shrink-0">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all group bg-white">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Skill-Gap Engine</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Deterministic matching compares your 0–4 proficiency scale against required role competencies with zero hallucinations.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all group bg-white">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Map className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Phased Roadmaps</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Topological prerequisite-sorted learning steps enriched with personalized AI narratives powered by Groq Llama 3.3 70B.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all group bg-white">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Smart Recommendations</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Ranked courses, projects, and certifications matched to your priority gaps using vector embeddings.
          </p>
        </div>
      </div>
    </div>
  )
}
