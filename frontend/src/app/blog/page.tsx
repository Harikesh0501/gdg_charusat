'use client'

import { BookOpen } from 'lucide-react'

export default function BlogPage() {
  const articles = [
    {
      id: 'topological-sorting',
      title: 'How Topological Sorting Eliminates Tech Learning Fatigue',
      category: 'Software Engineering',
      summary: 'Learn how DAG topological prerequisite ordering prevents student burnout when mastering full-stack software architecture.',
    },
    {
      id: 'mock-interviews',
      title: 'Why Generic AI Mock Interviews Fail (And How Project Evaluation Fixes It)',
      category: 'Interview Prep',
      summary: 'Why technical interviewers focus on repository code tradeoffs rather than regurgitated definitions, and how to practice effectively.',
    },
    {
      id: 'proficiency-scale',
      title: 'Mastering Skill Gap Analysis on a 0–4 Competency Scale',
      category: 'Career Development',
      summary: 'A deep dive into evaluating Novice to Expert skill levels against real industry job descriptions without fluff.',
    },
    {
      id: 'resume-extraction',
      title: 'Behind the SkillForge AI Resume Extraction Pipeline',
      category: 'System Architecture',
      summary: 'How structured output parsing converts PDF resume projects into verified student skill profiles automatically.',
    },
  ]

  return (
    <div className="flex-1 bg-slate-50 py-12 px-6 max-w-6xl mx-auto w-full space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 shadow-2xs">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>SkillForge Insights & Engineering Blog</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Career Guides & <span className="text-indigo-600">Technical Articles</span>
        </h1>
        <p className="text-base text-slate-600 font-medium leading-relaxed">
          In-depth breakdowns on learning roadmap algorithms, interview preparation strategies, and career transition playbooks.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            className="glass-panel p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 bg-white flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs w-fit inline-block">
                {art.category}
              </span>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {art.title}
              </h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {art.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
