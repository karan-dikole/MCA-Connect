import React, { useEffect, useState } from 'react'
import { Users, Star, Calendar } from 'lucide-react'

export const MentorshipHub: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mentorship/mentors/')
      .then(res => res.json())
      .then(data => setMentors(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-bold">
          <Users className="w-3.5 h-3.5 text-cyan-600" />
          <span>1-on-1 Guidance & Mock Interviews</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          Connect with <span className="gradient-text">Alumni Mentors</span>
        </h1>
        <p className="text-sm text-slate-500">
          Book 1-on-1 sessions for career guidance, resume reviews, and technical mock interviews with alumni at top tech firms.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Mentors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((m) => (
            <div key={m.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{m.name}</h3>
                      <p className="text-[11px] text-indigo-600 font-bold">{m.current_role} @ {m.company}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1 font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{m.rating}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">{m.sessions_completed} sessions</span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{m.bio}</p>

                {/* Expertise */}
                <div className="flex flex-wrap gap-1">
                  {m.expertise_areas.map((e: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => alert(`Booking request sent to mentor ${m.name}! They will confirm your session time.`)}
                  className="w-full gradient-btn py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Mentorship Slot</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
