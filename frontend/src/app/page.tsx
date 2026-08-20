'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BrainCircuit,
  Target,
  Map,
  Award,
  Sparkles,
  Search,
  Code2,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid'
import { Marquee } from '@/components/ui/Marquee'
import { ProgressRing } from '@/components/ui/ProgressRing'

export default function HomePage() {
  const marqueeTech = [
    'FastAPI & Asyncio',
    'Next.js 15 & React 19',
    'PostgreSQL & Vector DBs',
    'Groq Llama-3.3-70B AI',
    'Docker & Kubernetes',
    'System Design Primer',
    'Machine Learning & PyTorch',
    'Pandas Data Science',
    'RAG Architectures',
    'Topological Roadmaps',
  ]

  return (
    <div className="min-h-full flex flex-col bg-dot-grid bg-slate-50/60">
      {/* Hero Section */}
      <section className="relative px-6 pt-12 pb-16 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glowing Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-indigo-200/80 text-xs font-bold text-indigo-700 shadow-sm shadow-indigo-500/10 mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Next-Gen Career Acceleration Platform</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-slate-500 font-medium">Next.js 15 + FastAPI Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-5xl leading-[1.1] font-outfit">
          Master Your Career Gaps with{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
            Deterministic Precision
          </span>{' '}
          & AI Intelligence
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-sm sm:text-lg text-slate-600 max-w-3xl leading-relaxed font-normal">
          Upload your resume to ingest verifiable skills, calculate mathematical readiness against real industry roles, and unlock personalized 3-tier roadmaps with live web project blueprints.
        </p>

        {/* Dual CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
          <Link href="/sign-in" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Dashboard
            </Button>
          </Link>
          <Link href="/sign-up" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Create Free Account
            </Button>
          </Link>
        </div>

        {/* Live Interactive Preview Card (Mockup) */}
        <div className="mt-14 w-full max-w-4xl rounded-3xl bg-white/90 backdrop-blur-2xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 text-left relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-500" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Candidate Readiness Telemetry</span>
              <h3 className="text-xl font-black text-slate-900 mt-1 font-outfit">Target Role: Full-Stack Engineer</h3>
              <p className="text-xs text-slate-500 mt-0.5">Automated skill ingestion from resume + topological roadmap</p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/60">
              <ProgressRing progress={84} size={76} strokeWidth={6} label="MATCH" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">84% Role Readiness</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  +14% from last sprint
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Mastered Skills</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="success" size="sm" dot>React.js (4/4)</Badge>
                <Badge variant="success" size="sm" dot>Python (4/4)</Badge>
                <Badge variant="success" size="sm" dot>SQL (3/4)</Badge>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Priority Gaps (Sprint 1)</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="warning" size="sm" dot>FastAPI Async (1/4)</Badge>
                <Badge variant="warning" size="sm" dot>Docker (1/4)</Badge>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/60">
              <span className="text-[11px] font-bold text-indigo-700 uppercase">Active Practice Lab</span>
              <p className="mt-1 text-xs font-bold text-slate-900">System Design Primer</p>
              <span className="text-[11px] text-indigo-600 font-medium">8h hands-on roadmap item</span>
            </div>
          </div>
        </div>
      </section>

      {/* Magic UI Skills Marquee Ribbon */}
      <section className="py-6 border-y border-slate-200/70 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <Marquee speed="normal">
            {marqueeTech.map((tech, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-bold text-slate-700 shrink-0 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-default"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{tech}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* Aceternity Bento Grid Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="purple" size="md" className="mb-3">
            Platform Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-outfit">
            Everything You Need to Bridge the Gap to High-Paying Tech Roles
          </h2>
          <p className="mt-3 text-sm text-slate-600 font-normal">
            A complete unified intelligence engine integrating automated resume parsing, topological course planning, real-time web discovery, and AI mock evaluations.
          </p>
        </div>

        <BentoGrid>
          <BentoGridItem
            title="Deterministic Skill-Gap Engine"
            description="Mathematically measures your 0–4 proficiency scale against verified industry requirements without AI hallucinations."
            icon={<Target className="w-5 h-5" />}
            badge={<Badge variant="success" size="sm">Deterministic 0-4 Scale</Badge>}
            shimmer
          />

          <BentoGridItem
            title="3-Tier Topological Roadmaps"
            description="Sorts foundational prerequisites into structured Module ➔ Chapter ➔ Topic learning paths enriched with Groq Llama 3.3 70B narratives."
            icon={<Map className="w-5 h-5" />}
            badge={<Badge variant="purple" size="sm">Topological DAG</Badge>}
          />

          <BentoGridItem
            title="Full-Internet Project Search"
            description="Dynamic search agent queries live GitHub repositories and verified specs to attach authentic project blueprints and practice labs."
            icon={<Search className="w-5 h-5" />}
            badge={<Badge variant="info" size="sm">Real GitHub Blueprints</Badge>}
          />

          <BentoGridItem
            title="Resume-Grounded AI Mock Interviews"
            description="Prepares you for technical and behavioral rounds by interviewing you on your actual project achievements with structured rubrics."
            icon={<BrainCircuit className="w-5 h-5" />}
            badge={<Badge variant="warning" size="sm">Groq AI Evaluator</Badge>}
          />

          <BentoGridItem
            title="4-Phase Capstone Milestones"
            description="Domain-tailored 4-phase blueprints covering Setup, Core Modeling, API Integration, and Production Verification."
            icon={<Layers className="w-5 h-5" />}
            badge={<Badge variant="purple" size="sm">Architecture Specs</Badge>}
          />

          <BentoGridItem
            title="Telemetry & Progress Analytics"
            description="Live chapter completion counters, readiness progress rings, and real-time velocity tracking to keep you in the top 5%."
            icon={<TrendingUp className="w-5 h-5" />}
            badge={<Badge variant="success" size="sm">Live Analytics</Badge>}
            shimmer
          />
        </BentoGrid>
      </section>
    </div>
  )
}
