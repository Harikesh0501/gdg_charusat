'use client'

import { Target, Map, Award, BrainCircuit, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="flex-1 bg-slate-50 py-12 px-6 max-w-6xl mx-auto w-full space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 shadow-2xs">
          <Zap className="w-4 h-4 text-indigo-600" />
          <span>About SkillForge AI</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Empowering Tech Careers with <span className="text-indigo-600">Deterministic Precision</span>
        </h1>
        <p className="text-base text-slate-600 font-medium leading-relaxed">
          SkillForge AI is an intelligent career mentoring platform engineered to bridge the gap between student competencies and real-world tech industry expectations.
        </p>
      </div>

      {/* Core Platform Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 bg-white">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 w-fit border border-indigo-100">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Deterministic Skill Gap Matching</h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Our 0–4 proficiency scale algorithm compares your verified skills directly against required role competencies with zero hallucinations or guesses.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 bg-white">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 w-fit border border-blue-100">
            <Map className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Topological Learning Roadmaps</h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Using Directed Acyclic Graph (DAG) topological sorting, SkillForge sequences your skill milestones so prerequisite fundamentals are always mastered before advanced concepts.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 bg-white">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 w-fit border border-emerald-100">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Vector-Matched Recommendations</h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Courses, projects, and certifications are ranked using vector similarity embeddings, matching your exact gap priorities to top learning resources.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 bg-white">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 w-fit border border-purple-100">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Project-Driven Mock Interviews</h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Our AI interviewer parses your uploaded resume projects to ask targeted technical questions and provides instant score breakdowns with actionable feedback.
          </p>
        </div>
      </div>
    </div>
  )
}
