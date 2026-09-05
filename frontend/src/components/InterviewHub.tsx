import React, { useState, useEffect } from 'react'
import { Briefcase, Building2, CheckCircle, Plus, ThumbsUp, Trash2, Search } from 'lucide-react'
import { ShareInterviewModal } from './modals/ShareInterviewModal'
import { InterviewDetailModal } from './modals/InterviewDetailModal'

interface InterviewHubProps {
  user: any
  onOpenAuth: (mode: 'login' | 'register') => void
}

const DIFFICULTIES = ['ALL', 'EASY', 'MEDIUM', 'HARD']

export const InterviewHub: React.FC<InterviewHubProps> = ({ user, onOpenAuth }) => {
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL')
  const [selectedOutcome, setSelectedOutcome] = useState('ALL')
  
  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedExp, setSelectedExp] = useState<any>(null)

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/interviews/')
      const data = await res.json()
      setExperiences(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiences()
  }, [])

  const handleShareClick = () => {
    if (!user) {
      onOpenAuth('login')
      return
    }
    setShareModalOpen(true)
  }

  const handleUpvote = async (e: React.MouseEvent, expId: number) => {
    e.stopPropagation()
    if (!user) {
      onOpenAuth('login')
      return
    }
    try {
      const res = await fetch(`/api/interviews/${expId}/upvote/`, { method: 'POST' })
      const data = await res.json()
      setExperiences(experiences.map(exp => exp.id === expId ? { ...exp, upvotes_count: data.upvotes_count } : exp))
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (e: React.MouseEvent, expId: number) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this interview experience log?')) return
    try {
      const res = await fetch(`/api/interviews/${expId}/`, { method: 'DELETE' })
      if (res.ok) {
        setExperiences(experiences.filter(exp => exp.id !== expId))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = !searchQuery ||
      exp.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.role_applied?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.questions_asked?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDiff = selectedDifficulty === 'ALL' || 
      (exp.difficulty && exp.difficulty.toUpperCase().includes(selectedDifficulty))

    const matchesOutcome = selectedOutcome === 'ALL' ||
      (selectedOutcome === 'OFFERED' && (exp.offer_status?.toUpperCase().includes('OFFER') || exp.offer_status?.toUpperCase().includes('ACCEPT'))) ||
      (selectedOutcome === 'REJECTED' && (exp.offer_status?.toUpperCase().includes('REJECT') || exp.offer_status?.toUpperCase().includes('NOT'))) ||
      (selectedOutcome === 'IN_PROCESS' && (!exp.offer_status?.toUpperCase().includes('OFFER') && !exp.offer_status?.toUpperCase().includes('REJECT')))

    return matchesSearch && matchesDiff && matchesOutcome
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Top Header & CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            <span>Alumni Placement Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Real Company <span className="gradient-text">Interview Experiences</span>
          </h1>
          <p className="text-xs text-slate-500">
            Learn real questions, round-by-round interview structures, and placement strategies shared by seniors.
          </p>
        </div>

        <button
          onClick={handleShareClick}
          className="gradient-btn px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Share Placement Experience</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, role (e.g. Google, Frontend)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs outline-none bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
          {/* Difficulty Chips */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px]">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                  selectedDifficulty === d
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {d.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Outcome Filter */}
          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Outcomes</option>
            <option value="OFFERED">Offers Only 🎯</option>
            <option value="IN_PROCESS">In Process ⏳</option>
            <option value="REJECTED">Lessons Learned 📚</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Interviews...</div>
      ) : filteredExperiences.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No interview logs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try clearing search keywords or submit the first debrief for your batch!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((exp) => {
            const isMyExp = user && (user.id === exp.author_id || user.role === 'ADMIN')
            return (
              <div
                key={exp.id}
                onClick={() => setSelectedExp(exp)}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-amber-300 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {exp.company_name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {exp.role_applied} {exp.batch_year ? `(${exp.batch_year})` : ''}
                        </p>
                      </div>
                    </div>
                    {exp.offer_status?.toUpperCase().includes('OFFER') || exp.offer_status?.toUpperCase().includes('ACCEPT') ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Offer
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {exp.offer_status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    {exp.rounds_count && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                        {exp.rounds_count} Rounds
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">
                      {exp.difficulty}
                    </span>
                    {exp.compensation_details && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        💰 {exp.compensation_details}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {exp.summary}
                  </p>

                  {/* Specific questions asked snippet */}
                  {exp.questions_asked && (
                    <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Questions Sample:
                      </span>
                      <p className="text-[11px] text-slate-700 line-clamp-2 font-mono">
                        {exp.questions_asked}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>By <span className="font-bold text-slate-700">{exp.author_name}</span> {exp.author_role ? `(${exp.author_role})` : ''}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleUpvote(e, exp.id)}
                      className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-bold transition-colors cursor-pointer"
                      title="Helpful experience log"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{exp.upvotes_count || 0}</span>
                    </button>
                    {isMyExp && (
                      <button
                        onClick={(e) => handleDelete(e, exp.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete Placement Experience"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Share Modal */}
      <ShareInterviewModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onSuccess={fetchExperiences}
      />

      {/* Detail Modal */}
      <InterviewDetailModal
        isOpen={!!selectedExp}
        onClose={() => setSelectedExp(null)}
        experience={selectedExp}
      />

    </div>
  )
}
