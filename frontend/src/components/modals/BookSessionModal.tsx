import React, { useState } from 'react'
import { X, Calendar } from 'lucide-react'

interface BookSessionModalProps {
  isOpen: boolean
  mentor: any
  onClose: () => void
  onSuccess: () => void
}

export const BookSessionModal: React.FC<BookSessionModalProps> = ({ isOpen, mentor, onClose, onSuccess }) => {
  const [sessionType, setSessionType] = useState('MOCK_INTERVIEW')
  const [requestedDate, setRequestedDate] = useState('2026-09-10')
  const [requestedTime, setRequestedTime] = useState('6:00 PM - 7:00 PM IST')
  const [studentNotes, setStudentNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !mentor) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/mentorship/book/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_user_id: mentor.user_id,
          session_type: sessionType,
          requested_date: requestedDate,
          requested_time: requestedTime,
          student_notes: studentNotes,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onSuccess()
        onClose()
      } else {
        setError(data.error || 'Failed to book session.')
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
        className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full bg-white shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5 mb-5">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-lg font-black shadow-md">
            {mentor.name.charAt(0)}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Book 1-on-1 Mentorship</h2>
          <p className="text-xs text-indigo-600 font-bold">{mentor.name} ({mentor.company})</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Session Objective</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
            >
              <option value="MOCK_INTERVIEW">🎯 Mock Technical / HR Interview</option>
              <option value="RESUME">📄 Resume Review & ATS Optimization</option>
              <option value="CAREER">🚀 Career Roadmap & Transition Advice</option>
              <option value="PROJECT">💻 Project Architecture & Code Review</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Preferred Date</label>
              <input
                type="date"
                required
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Time Slot</label>
              <select
                value={requestedTime}
                onChange={(e) => setRequestedTime(e.target.value)}
                className="w-full px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="6:00 PM - 7:00 PM IST">6:00 PM - 7:00 PM IST</option>
                <option value="7:30 PM - 8:30 PM IST">7:30 PM - 8:30 PM IST</option>
                <option value="9:00 PM - 10:00 PM IST">9:00 PM - 10:00 PM IST</option>
                <option value="Weekend Morning (11 AM)">Weekend Morning (11 AM)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Notes & Questions for Mentor</label>
            <textarea
              rows={3}
              required
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="Provide context, your target company/role, or resume link..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none text-slate-700"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending Request...' : 'Confirm Mentorship Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
