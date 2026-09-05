import React, { useEffect, useState } from 'react'
import { Briefcase, Building2, CheckCircle, Plus, ThumbsUp } from 'lucide-react'
import { ShareInterviewModal } from './modals/ShareInterviewModal'

interface InterviewHubProps {
  user: any
  onOpenAuth: (mode: 'login' | 'register') => void
}

export const InterviewHub: React.FC<InterviewHubProps> = ({ user, onOpenAuth }) => {
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [shareModalOpen, setShareModalOpen] = useState(false)

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

  const handleUpvote = async (expId: number) => {
    if (!user) {
      onOpenAuth('login')
      return
    }
    try {
      const res = await fetch(`/api/interviews/${expId}/upvote/`, { method: 'POST' })
      const data = await res.json()
      setExperiences(experiences.map(e => e.id === expId ? { ...e, upvotes_count: data.upvotes_count } : e))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header & CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto border-b border-slate-100 pb-6">
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

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Interviews...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-2xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{exp.company_name}</h3>
                      <p className="text-[11px] text-slate-400 font-medium">{exp.role_applied} ({exp.batch_year})</p>
                    </div>
                  </div>
                  {exp.offer_status.includes('Offer') || exp.offer_status.includes('Accepted') ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Offer
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {exp.offer_status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                    {exp.rounds_count} Rounds
                  </span>
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

                {/* Specific questions asked */}
                {exp.questions_asked && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Questions Asked:</span>
                    <p className="text-[11px] text-slate-700 line-clamp-2">{exp.questions_asked}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>By <span className="font-bold text-slate-700">{exp.author_name}</span> ({exp.author_role})</span>
                <button
                  onClick={() => handleUpvote(exp.id)}
                  className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-bold transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{exp.upvotes_count || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      <ShareInterviewModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onSuccess={fetchExperiences}
      />

    </div>
  )
}
