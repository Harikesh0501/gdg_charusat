'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function HeaderNav() {
  return (
    <nav className="flex items-center gap-6">
      <Link href="/about" className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors">
        About Us
      </Link>
      <Link href="/blog" className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors">
        Blog
      </Link>
      <Link
        href="/sign-in"
        className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Sign In
      </Link>
    </nav>
  )
}
