'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, Loader2, X, Eye, EyeOff, CheckCircle2, ArrowRight, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'confirming' | 'redirecting'>('idle')
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data.session) {
        setStatus('redirecting')

        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        fetch(`${backendUrl}/api/auth/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json',
          },
        }).catch(err => console.warn('Sync call note:', err))

        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      } else {
        setStatus('confirming')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center p-4 sm:p-8 bg-dot-grid bg-slate-50 relative">
      <div className="w-full max-w-6xl h-full max-h-[680px] bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-2xl p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative overflow-hidden">
        
        {/* Left Column: Auth Form Area (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 sm:p-6 h-full overflow-y-auto">
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-black text-xl tracking-tight text-slate-900 group"
            >
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="font-outfit">SkillForge <span className="text-indigo-600">AI</span></span>
            </Link>
          </div>

          {/* Form Content */}
          <div className="max-w-md w-full mx-auto my-auto py-2 space-y-4">
            <div className="text-left space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit">Create Student Account</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Sign up and build your personalized career roadmap
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {status === 'redirecting' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>Account created! Redirecting to dashboard...</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  disabled={status !== 'idle'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-xs font-medium disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  disabled={status !== 'idle'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-xs font-medium disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (min 6 characters)"
                    disabled={status !== 'idle'}
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-xs font-medium disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {status === 'idle' && (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-3"
                  isLoading={loading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Free Account
                </Button>
              )}
            </form>
          </div>

          {/* Bottom Footer Links */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 font-medium">
            <span>
              Already have an account?{' '}
              <Link href="/sign-in" className="text-indigo-600 font-bold hover:underline">
                Sign In
              </Link>
            </span>
          </div>
        </div>

        {/* Right Column: Visual Lifestyle Photo (5 Cols) */}
        <div className="lg:col-span-5 hidden lg:block relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg h-full">
          <Image
            src="/auth_lifestyle.png"
            alt="SkillForge Team Collaboration"
            fill
            className="object-cover"
          />

          {/* Top Right Close Button */}
          <Link
            href="/"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-md transition-transform hover:scale-105 z-20"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
