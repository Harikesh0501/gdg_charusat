'use client'

import Link from 'next/link'
import { Award, ArrowRight, Sparkles, Target } from 'lucide-react'

export default function RecommendationsPage() {
  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
          <Award className="w-4 h-4" />
          <span>Personalized Recommendations</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Skill & Project Recommendations</h1>
        <p className="text-sm text-slate-400 mt-1">
          Curated courses, open-source projects, and industry certifications matched strictly to your target career gaps.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto text-secondary">
          <Target className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Select Your Target Career Goal</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Recommendations are computed directly from your active skill gaps. Head over to the Career Command Center to select your target career role.
        </p>
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow-lg shadow-primary/25"
        >
          <Sparkles className="w-4 h-4" />
          Open Career Command Center
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
