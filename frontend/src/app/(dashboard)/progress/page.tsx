'use client'

import Link from 'next/link'
import { TrendingUp, ArrowRight, Target, ShieldCheck } from 'lucide-react'

export default function ProgressAnalyticsPage() {
  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>Progress & Career Analytics</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Career Readiness Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Track your skill mastery trajectory and career readiness progression over time.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Live Skill-Gap Computation Active</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Your readiness score is continuously calculated against your target career role requirements. View your complete competency analysis in the Roadmap tab.
        </p>
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-emerald-600 text-white text-sm font-semibold transition-all shadow-lg shadow-accent/25"
        >
          <Target className="w-4 h-4" />
          View Readiness Breakdown
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
