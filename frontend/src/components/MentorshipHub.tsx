import React, { useEffect, useState } from 'react'
import { Users, Calendar, Award, CheckCircle2, Clock, Video } from 'lucide-react'
import { BookSessionModal } from './modals/BookSessionModal'

interface MentorshipHubProps {
  user: any
  onOpenAuth: (mode: 'login' | 'register') => void
}

export const MentorshipHub: React.FC<MentorshipHubProps> = ({ user, onOpenAuth }) => {
  const [mentors, setMentors] = useState<any[]>([])
  const [mySessions, setMySessions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'directory' | 'portal'>('directory')
  const [loading, setLoading] = useState(true)
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [meetLinkInput, setMeetLinkInput] = useState<{ [key: number]: string }>({})

  const fetchMentors = async () => {
    try {
      const res = await fetch('/api/mentorship/mentors/')
      const data = await res.json()
      setMentors(data)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchMySessions = async () => {
    try {
      const res = await fetch('/api/mentorship/my-sessions/')
      const data = await res.json()
      setMySessions(data.sessions || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchMentors(), fetchMySessions()]).finally(() => setLoading(false))
  }, [user])

  const handleBookClick = (m: any) => {
    if (!user) {
      onOpenAuth('login')
      return
    }
    setSelectedMentor(m)
    setBookingModalOpen(true)
  }

  const handleUpdateSessionStatus = async (sessionId: number, status: string) => {
    try {
      const link = meetLinkInput[sessionId] || 'https://meet.google.com/mca-mentorship'
      await fetch(`/api/mentorship/sessions/${sessionId}/update-status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, meeting_link: link })
      })
      fetchMySessions()
    } catch (e) {
      console.error(e)
    }
  }

  const isMentorRole = user && (user.role === 'ALUMNI' || user.role === 'FACULTY' || user.is_mentor_available)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-bold">
          <Users className="w-3.5 h-3.5 text-cyan-600" />
          <span>1-on-1 Guidance & Mock Interviews</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          Alumni Mentorship <span className="gradient-text">& Guidance Portal</span>
        </h1>
        <p className="text-sm text-slate-500">
          Connect directly with verified alumni at Microsoft, Google, TCS, and top startups for career planning and technical interview prep.
        </p>

        {/* View Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 mt-2">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'directory' ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👥 Mentors Directory ({mentors.length})
          </button>
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth('login')
                return
              }
              setActiveTab('portal')
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'portal' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isMentorRole ? 'Mentor Approval Panel' : 'My Booked Sessions'}</span>
            {mySessions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-bold">
                {mySessions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Mentorship Portal...</div>
      ) : activeTab === 'directory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((m) => (
            <div key={m.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900">{m.name}</h3>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                        Verified Pro
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-600 font-bold">{m.headline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1 font-bold text-indigo-700 text-xs">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{m.years_of_experience}+ Years Experience</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{m.about}</p>

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
                  onClick={() => handleBookClick(m)}
                  className="w-full gradient-btn py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book 1-on-1 Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* My Mentorship Portal */
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">
              {isMentorRole ? 'Student Mentorship Requests' : 'Your Scheduled Sessions'}
            </h3>
            <span className="text-xs text-slate-500">
              {isMentorRole ? 'Review & Confirm student slots' : 'Track approval and Google Meet links'}
            </span>
          </div>

          {mySessions.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-2xl space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No active sessions scheduled yet.</h4>
              <p className="text-xs text-slate-400">
                {isMentorRole 
                  ? 'Incoming student requests will appear here for your approval.'
                  : 'Browse our mentors directory and book your first 1-on-1 mock interview!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mySessions.map((session) => (
                <div key={session.id} className="glass-card rounded-2xl p-5 space-y-4 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{session.session_type}</span>
                        {session.status === 'CONFIRMED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        ) : session.status === 'PENDING' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending Approval
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {session.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isMentorRole ? `Student: ${session.student_name}` : `Mentor: ${session.mentor_name}`}
                      </p>
                    </div>

                    <div className="text-left sm:text-right text-xs">
                      <div className="font-bold text-slate-800">📅 {session.requested_date}</div>
                      <div className="text-slate-400 text-[11px]">⏰ {session.requested_time}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <span className="font-bold text-slate-800">Notes: </span>
                    {session.student_notes}
                  </p>

                  {/* Actions for Mentor vs Student */}
                  {isMentorRole && session.status === 'PENDING' ? (
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="url"
                        placeholder="Google Meet Link (e.g. https://meet.google.com/...)"
                        value={meetLinkInput[session.id] || ''}
                        onChange={(e) => setMeetLinkInput({ ...meetLinkInput, [session.id]: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleUpdateSessionStatus(session.id, 'CONFIRMED')}
                          className="w-full sm:w-auto px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Slot
                        </button>
                        <button
                          onClick={() => handleUpdateSessionStatus(session.id, 'CANCELLED')}
                          className="w-full sm:w-auto px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ) : session.meeting_link ? (
                    <div className="pt-2 flex items-center justify-between bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <Video className="w-4 h-4 text-emerald-600" />
                        <span>Google Meet Scheduled</span>
                      </div>
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
                      >
                        Join Video Call →
                      </a>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      <BookSessionModal
        isOpen={bookingModalOpen}
        mentor={selectedMentor}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={() => {
          fetchMySessions()
          setActiveTab('portal')
        }}
      />

    </div>
  )
}
