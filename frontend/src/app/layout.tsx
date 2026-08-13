import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Compass, Sparkles } from 'lucide-react'
import './globals.css'

import HeaderNav from './components/HeaderNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkillForge AI — Personalized Learning & Career Mentor',
  description: 'AI-driven skill-gap analysis, topological learning roadmaps, and personalized career mentoring for students.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#090d16] text-slate-100 glow-gradient`}>
        <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white group">
              <div className="p-2 rounded-lg bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Compass className="w-5 h-5" />
              </div>
              <span>SkillForge <span className="text-primary font-normal">AI</span></span>
            </Link>

            <HeaderNav />
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          {children}
        </main>

        <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© 2026 SkillForge AI. All rights reserved.</p>
            <p className="text-xs text-slate-600">Powered by Groq Llama 4 Scout & Supabase</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
