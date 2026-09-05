import React, { useEffect, useState } from 'react'
import { MessageSquare, ThumbsUp, CheckCircle, Plus, Send, Trash2, Sparkles, Code } from 'lucide-react'
import { CreateQuestionModal } from './modals/CreateQuestionModal'

interface QAHubProps {
  user: any
  onOpenAuth: (mode: 'login' | 'register') => void
}

export const QAHub: React.FC<QAHubProps> = ({ user, onOpenAuth }) => {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [answerInputs, setAnswerInputs] = useState<{ [key: number]: string }>({})
  const [answeringId, setAnsweringId] = useState<number | null>(null)

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/qa/questions/')
      const data = await res.json()
      setQuestions(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleAskClick = () => {
    if (!user) {
      onOpenAuth('login')
      return
    }
    setCreateModalOpen(true)
  }

  const handleUpvote = async (qId: number) => {
    if (!user) {
      onOpenAuth('login')
      return
    }
    try {
      const res = await fetch(`/api/qa/questions/${qId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote' })
      })
      const data = await res.json()
      setQuestions(questions.map(q => q.id === qId ? { ...q, upvotes_count: data.upvotes_count } : q))
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      const res = await fetch(`/api/qa/questions/${questionId}/`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== questionId))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteAnswer = async (answerId: number) => {
    if (!confirm('Are you sure you want to delete your answer?')) return
    try {
      const res = await fetch(`/api/qa/answers/${answerId}/`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchQuestions()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handlePostAnswer = async (qId: number) => {
    if (!user) {
      onOpenAuth('login')
      return
    }
    const text = answerInputs[qId]
    if (!text || !text.trim()) return

    setAnsweringId(qId)
    try {
      const res = await fetch(`/api/qa/questions/${qId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'answer', content: text })
      })
      if (res.ok) {
        setAnswerInputs({ ...answerInputs, [qId]: '' })
        fetchQuestions()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAnsweringId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header with Call to Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto border-b border-slate-100 pb-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Peer-to-Peer Academic Forum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Curated MCA <span className="gradient-text">Q&A Discussions</span>
          </h1>
          <p className="text-xs text-slate-500">
            Ask code debugging questions, discuss algorithms, and receive verified answers from seniors.
          </p>
        </div>

        <button
          onClick={handleAskClick}
          className="gradient-btn px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Question</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Discussions...</div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {questions.map((q) => {
            const isExpanded = expandedId === q.id
            const isMyQuestion = user && user.id === q.author_id

            return (
              <div key={q.id} className="glass-card rounded-2xl p-6 space-y-4 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {q.is_solved && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Solved
                        </span>
                      )}
                      <h3 
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        className="text-base font-extrabold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {q.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{q.content}</p>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {q.language}
                      </span>
                      {q.tags.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          #{t}
                        </span>
                      ))}
                      <span className="text-[11px] text-slate-400 font-medium">
                        Asked by {q.author_name} ({q.author_role}) • {q.created_at}
                      </span>
                    </div>
                  </div>

                  {/* Right side voting and actions */}
                  <div className="flex items-center gap-3 shrink-0 sm:border-l sm:border-slate-100 sm:pl-6">
                    <button
                      onClick={() => handleUpvote(q.id)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 min-w-[55px] text-center transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-black text-slate-900 group-hover:text-indigo-600 flex items-center justify-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-indigo-600" />
                        <span>{q.upvotes_count}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">Vote</div>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 min-w-[55px] text-center transition-all cursor-pointer"
                    >
                      <div className="text-xs font-black text-indigo-700">{q.answers_count}</div>
                      <div className="text-[9px] text-indigo-500 font-bold uppercase">Answers</div>
                    </button>

                    {isMyQuestion && (
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Answers Section */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-3 duration-200">
                    
                    {/* Code snippet if present */}
                    {q.code_snippet && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Code className="w-3 h-3" /> Question Code
                        </span>
                        <pre className="text-xs font-mono bg-slate-900 text-cyan-300 p-3 rounded-xl overflow-x-auto">
                          {q.code_snippet}
                        </pre>
                      </div>
                    )}

                    {/* Answers List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-700">Community Answers ({q.answers.length})</h4>
                      {q.answers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No answers yet. Be the first to share a solution!</p>
                      ) : (
                        q.answers.map((ans: any) => {
                          const isMyAns = user && (user.id === ans.author_id || user.role === 'ADMIN')
                          return (
                            <div key={ans.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-800">{ans.author_name}</span>
                                  {ans.is_mentor ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5" /> Verified Mentor Solution
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-medium">{ans.author_role}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">{ans.created_at}</span>
                                  {isMyAns && (
                                    <button
                                      onClick={() => handleDeleteAnswer(ans.id)}
                                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                      title="Delete Answer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">{ans.content}</p>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* In-Place Answer Submission Form */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <textarea
                        rows={2}
                        placeholder={user ? "Write your step-by-step solution..." : "Sign in to post an answer"}
                        disabled={!user}
                        value={answerInputs[q.id] || ''}
                        onChange={(e) => setAnswerInputs({ ...answerInputs, [q.id]: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                      />
                      <button
                        onClick={() => handlePostAnswer(q.id)}
                        disabled={!user || answeringId === q.id}
                        className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Solution</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Ask Question Modal */}
      <CreateQuestionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchQuestions}
      />

    </div>
  )
}
