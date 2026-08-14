'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BrainCircuit,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  Send,
  Loader2,
  RefreshCw,
  ChevronRight,
  History,
  FileText,
  Zap,
  UploadCloud,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Question {
  id: string
  career_role_id?: number
  skill_id?: number
  category: string
  difficulty: number
  question_text: string
  source: string
}

interface PracticeQuestionsData {
  career_role_id?: number
  career_role_name?: string
  questions: Question[]
}

interface EvaluationResult {
  attempt_id: string
  question_id: string
  question_text: string
  score: number
  strengths: string[]
  weaknesses: string[]
  feedback: string
  created_at: string
}

interface HistoryItem {
  attempt_id: string
  question_id: string
  question_text: string
  category: string
  score: number
  strengths: string[]
  weaknesses: string[]
  feedback: string
  created_at: string
}

interface InterviewHistoryData {
  total_attempts: number
  average_score: number
  history: HistoryItem[]
}

export default function MockInterviewPage() {
  const [questionsData, setQuestionsData] = useState<PracticeQuestionsData | null>(null)
  const [historyData, setHistoryData] = useState<InterviewHistoryData | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [hasSkillsOrResume, setHasSkillsOrResume] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>('practice')

  useEffect(() => {
    fetchQuestions()
    fetchHistory()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()

      const headers: HeadersInit = {}
      if (sessionData?.session?.access_token) {
        headers['Authorization'] = `Bearer ${sessionData.session.access_token}`
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

      // Check if student has uploaded resume or has skills
      const skillsRes = await fetch(`${backendUrl}/api/skills`, { headers })
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json()
        if (!skillsData.skills || skillsData.skills.length === 0) {
          setHasSkillsOrResume(false)
          setLoading(false)
          return
        } else {
          setHasSkillsOrResume(true)
        }
      }

      const res = await fetch(`${backendUrl}/api/interview/questions`, { headers })
      if (!res.ok) throw new Error('Failed to load questions')

      const data: PracticeQuestionsData = await res.json()
      setQuestionsData(data)
      setCurrentIdx(0)
      setAnswerText('')
      setEvaluation(null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()

      const headers: HeadersInit = {}
      if (sessionData?.session?.access_token) {
        headers['Authorization'] = `Bearer ${sessionData.session.access_token}`
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

      const res = await fetch(`${backendUrl}/api/interview/history`, { headers })
      if (res.ok) {
        const data: InterviewHistoryData = await res.json()
        setHistoryData(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!questionsData || !questionsData.questions[currentIdx] || !answerText.trim()) return

    try {
      setEvaluating(true)
      const currentQ = questionsData.questions[currentIdx]
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()

      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (sessionData?.session?.access_token) {
        headers['Authorization'] = `Bearer ${sessionData.session.access_token}`
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

      const res = await fetch(`${backendUrl}/api/interview/attempts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question_id: currentQ.id,
          answer_text: answerText,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit answer')

      const evalRes: EvaluationResult = await res.json()
      setEvaluation(evalRes)
      fetchHistory()
    } catch (err) {
      console.error(err)
    } finally {
      setEvaluating(false)
    }
  }

  const handleNextQuestion = () => {
    if (questionsData && currentIdx < questionsData.questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setAnswerText('')
      setEvaluation(null)
    }
  }

  const activeQuestion = questionsData?.questions[currentIdx]

  // Mandatory Resume Banner Guard
  if (!hasSkillsOrResume && !loading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-8 py-12 w-full space-y-8">
        <div className="border-b border-slate-200 pb-6 glass-panel p-6 rounded-2xl shadow-xs bg-white">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
            <span>AI Mock Interview Assistant</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Adaptive Interview Practice</h1>
          <p className="text-sm text-slate-500 mt-1">
            Practice technical and project-driven interview questions generated strictly from your uploaded resume.
          </p>
        </div>

        <div className="glass-panel p-12 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto space-y-5 shadow-sm bg-white">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Upload Your Resume First</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
              SkillForge generates adaptive interview questions strictly derived from your uploaded resume projects & skills. Please upload your resume first to generate questions.
            </p>
          </div>
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Resume Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl shadow-xs bg-white">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
            <span>AI Mock Interview Assistant</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Adaptive Interview Practice</h1>
          <p className="text-sm text-slate-500 mt-1">
            Practice technical and project-driven interview questions generated strictly from your uploaded resume.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {historyData && (
            <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold shadow-2xs">
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Total Attempts</span>
                <span className="text-slate-900 text-sm font-black">{historyData.total_attempts}</span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Avg Score</span>
                <span className="text-emerald-600 text-sm font-black">{historyData.average_score}%</span>
              </div>
            </div>
          )}

          {questionsData?.career_role_name && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>{questionsData.career_role_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Practice Session</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Attempt History ({historyData?.total_attempts || 0})</span>
          </button>
        </div>

        {activeTab === 'practice' && (
          <button
            onClick={fetchQuestions}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all border border-slate-200 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>New Session Kit</span>
          </button>
        )}
      </div>

      {/* Tab 1: Practice Workspace */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3 text-slate-500">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-medium">Assembling adaptive mock interview questions...</p>
            </div>
          ) : !activeQuestion ? (
            <div className="glass-panel p-10 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto space-y-4 shadow-xs bg-white">
              <Target className="w-10 h-10 text-indigo-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No Questions Available</h3>
              <p className="text-sm text-slate-500">
                Select a target career role in the Roadmap page to generate personalized interview questions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Question Workspace (Left 2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Question Card */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase">
                        {activeQuestion.category.replace('_', ' ')}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                        Difficulty: {activeQuestion.difficulty}/5
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-500">
                      Question {currentIdx + 1} of {questionsData?.questions.length || 1}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 leading-relaxed">
                    {activeQuestion.question_text}
                  </h2>
                </div>

                {/* Answer Editor */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 bg-white">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Your Response</span>
                    </label>
                    <span className="text-xs text-slate-400 font-medium">
                      {answerText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>

                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your structured answer here. Include architectural considerations, trade-offs, and concrete technical details..."
                    disabled={evaluating || !!evaluation}
                    className="w-full h-48 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white resize-none transition-all"
                  />

                  <div className="flex items-center justify-between pt-2">
                    {!evaluation ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={evaluating || answerText.trim().length < 5}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                      >
                        {evaluating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Evaluating Response...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit for AI Assessment</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEvaluation(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                        >
                          Edit & Retake
                        </button>

                        {currentIdx < (questionsData?.questions.length || 0) - 1 && (
                          <button
                            onClick={handleNextQuestion}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                          >
                            <span>Next Question</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Evaluation Card (Right col) */}
              <div className="lg:col-span-1">
                {evaluation ? (
                  <div className="glass-panel p-6 rounded-2xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>AI Assessment Result</span>
                      </div>

                      <div
                        className={`px-3 py-1 rounded-xl text-xs font-black border ${
                          evaluation.score >= 75
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : evaluation.score >= 50
                            ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                        }`}
                      >
                        Score: {evaluation.score}/100
                      </div>
                    </div>

                    {/* Strengths */}
                    {evaluation.strengths && evaluation.strengths.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Key Strengths
                        </span>
                        <div className="space-y-1.5">
                          {evaluation.strengths.map((str, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                              {str}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Areas for Growth
                        </span>
                        <div className="space-y-1.5">
                          {evaluation.weaknesses.map((w, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                              {w}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detailed Feedback */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actionable Feedback</span>
                      <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-200">
                        &quot;{evaluation.feedback}&quot;
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs bg-white">
                    <Zap className="w-8 h-8 text-indigo-500 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-900">Real-Time Evaluation Ready</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Submit your response to receive instant AI scoring, key technical strengths, missed concepts, and study recommendations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {!historyData?.history || historyData.history.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto space-y-3 shadow-xs bg-white">
              <History className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Previous Attempts Found</h3>
              <p className="text-xs text-slate-500">Complete practice questions to build your interview performance history.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyData.history.map((item) => (
                <div key={item.attempt_id} className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase border border-slate-200">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black border ${
                        item.score >= 75
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : item.score >= 50
                          ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}
                    >
                      Score: {item.score}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.question_text}</h3>
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    &quot;{item.feedback}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
