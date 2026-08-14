import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import LayoutHeaderFooter from './components/LayoutHeaderFooter'

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
    <html lang="en" className="light">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900`}>
        <LayoutHeaderFooter>{children}</LayoutHeaderFooter>
      </body>
    </html>
  )
}
