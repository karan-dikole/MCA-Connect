import React, { useState, useEffect, useRef } from 'react'
import { Search, X, BookOpen, MessageSquare, Rocket, Briefcase, Users, ArrowRight, Sparkles, Loader2 } from 'lucide-react'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectResult: (tabId: string) => void
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>({
    articles: [],
    questions: [],
    projects: [],
    interviews: [],
    mentors: [],
    total_results: 0,
  })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults({ articles: [], questions: [], projects: [], interviews: [], mentors: [], total_results: 0 })
    }
  }, [isOpen])

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults({ articles: [], questions: [], projects: [], interviews: [], mentors: [], total_results: 0 })
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  const handleItemClick = (tabId: string) => {
    onSelectResult(tabId)
    onClose()
  }

  const hasAnyResults = results.total_results > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 pt-20 sm:pt-24">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-3xl p-4 sm:p-6 max-w-2xl w-full bg-white shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-100 pb-3.5">
          <Search className="w-5 h-5 absolute left-3.5 text-indigo-600" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, questions, projects, placement logs, mentors..."
            className="w-full pl-11 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-slate-800 font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Searching MCA Connect database...</span>
            </div>
          ) : !query.trim() ? (
            /* Suggested Quick Queries */
            <div className="py-6 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Quick Global Search</p>
                <p className="text-[11px] text-slate-400">Try searching for keywords or popular MCA topics:</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {['Django', 'System Design', 'Microsoft', 'Binary Tree', 'Rahul Verma', 'React ATS', 'DBMS'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasAnyResults ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <p className="text-xs font-bold text-slate-600">No matching resources found for "{query}"</p>
              <p className="text-[11px]">Try checking for typos or searching a broader topic like "Python", "Cloud", or "Mock Interview".</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Study Guides Results */}
              {results.articles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider px-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Knowledge Hub Guides ({results.articles.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.articles.map((a: any) => (
                      <div
                        key={a.id}
                        onClick={() => handleItemClick('knowledge')}
                        className="p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{a.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{a.summary}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Q&A Results */}
              {results.questions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-800 uppercase tracking-wider px-1">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Community Q&A ({results.questions.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.questions.map((q: any) => (
                      <div
                        key={q.id}
                        onClick={() => handleItemClick('qa')}
                        className="p-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-800">{q.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{q.content}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Results */}
              {results.projects.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider px-1">
                    <Rocket className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Project Showcases ({results.projects.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.projects.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => handleItemClick('projects')}
                        className="p-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-800">{p.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{p.tagline} • Stack: {p.tech_stack}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Placement Logs Results */}
              {results.interviews.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 uppercase tracking-wider px-1">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                    <span>Interview Experiences ({results.interviews.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.interviews.map((exp: any) => (
                      <div
                        key={exp.id}
                        onClick={() => handleItemClick('interviews')}
                        className="p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">{exp.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{exp.summary}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentors Results */}
              {results.mentors.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-cyan-800 uppercase tracking-wider px-1">
                    <Users className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Alumni Mentors ({results.mentors.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.mentors.map((m: any) => (
                      <div
                        key={m.id}
                        onClick={() => handleItemClick('mentorship')}
                        className="p-2.5 rounded-xl hover:bg-cyan-50/70 border border-transparent hover:border-cyan-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-900">{m.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{m.headline}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>Navigate with 1-click to view resource</span>
          <span className="font-bold">ESC to close</span>
        </div>

      </div>
    </div>
  )
}
