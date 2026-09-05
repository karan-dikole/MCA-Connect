import React, { useState } from 'react'
import { X, Briefcase, Send } from 'lucide-react'

interface ShareInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ShareInterviewModal: React.FC<ShareInterviewModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [companyName, setCompanyName] = useState('')
  const [roleApplied, setRoleApplied] = useState('Associate Software Engineer')
  const [batchYear, setBatchYear] = useState(2025)
  const [offerStatus, setOfferStatus] = useState('OFFERED')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [compensation, setCompensation] = useState('')
  const [roundsCount, setRoundsCount] = useState(3)
  const [summary, setSummary] = useState('')
  const [questionsAsked, setQuestionsAsked] = useState('')
  const [tipsForJuniors, setTipsForJuniors] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/interviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          role_applied: roleApplied,
          batch_year: batchYear,
          offer_status: offerStatus,
          difficulty,
          compensation_details: compensation,
          rounds_count: roundsCount,
          summary,
          questions_asked: questionsAsked,
          tips_for_juniors: tipsForJuniors,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onSuccess()
        onClose()
      } else {
        setError(data.error || 'Failed to share interview.')
      }
    } catch (err) {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-3xl p-6 sm:p-8 max-w-lg w-full bg-white shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Share Placement Log</h2>
            <p className="text-xs text-slate-500">Help junior batches crack OA and technical rounds</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Amazon, TCS, Infosys"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Role Applied</label>
              <input
                type="text"
                required
                value={roleApplied}
                onChange={(e) => setRoleApplied(e.target.value)}
                placeholder="e.g. SDE-1 / Cloud Trainee"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Graduation Batch</label>
              <input
                type="number"
                value={batchYear}
                onChange={(e) => setBatchYear(parseInt(e.target.value) || 2025)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Total Rounds Count</label>
              <input
                type="number"
                min={1}
                max={10}
                value={roundsCount}
                onChange={(e) => setRoundsCount(parseInt(e.target.value) || 3)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Offer Outcome</label>
              <select
                value={offerStatus}
                onChange={(e) => setOfferStatus(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="OFFERED">Accepted Offer 🎉</option>
                <option value="REJECTED">Not Selected</option>
                <option value="WAITLISTED">Waitlisted</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="EASY">Easy (1/5)</option>
                <option value="MEDIUM">Medium (3/5)</option>
                <option value="HARD">Challenging (4/5)</option>
                <option value="VERY_HARD">Tough (5/5)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">CTC (Optional)</label>
              <input
                type="text"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                placeholder="e.g. 12 LPA"
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Hiring Overview & Round Breakdown</label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Round 1 was an Online Assessment with 2 DSA questions. Round 2 focused on SQL and System Design..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Specific Questions Asked</label>
            <textarea
              rows={2}
              value={questionsAsked}
              onChange={(e) => setQuestionsAsked(e.target.value)}
              placeholder="Binary Tree Level Order Traversal, LRU Cache, Difference between Process and Thread..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Tips & Advice for Juniors</label>
            <textarea
              rows={2}
              value={tipsForJuniors}
              onChange={(e) => setTipsForJuniors(e.target.value)}
              placeholder="Focus strongly on DBMS indexing and prepare 2 solid projects on your resume..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting Experience...' : 'Publish Placement Experience (+40 XP)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
