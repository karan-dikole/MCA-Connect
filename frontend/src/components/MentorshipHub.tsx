import React, { useState, useEffect } from 'react'
import { Users, Calendar, Award, CheckCircle2, Clock, Video, Trash2, AlertTriangle, ArrowRight, Search, Filter } from 'lucide-react'
import { BookSessionModal } from './modals/BookSessionModal'
import { BecomeMentorModal } from './modals/BecomeMentorModal'

interface MentorshipHubProps {
  user: any
  onOpenAuth: (mode: 'login' | 'register') => void
  onUserUpdate?: (updatedUser: any) => void
}

const EXPERTISE_TAGS = ['ALL', 'FULL STACK', 'DSA', 'SYSTEM DESIGN', 'AI / ML', 'CLOUD', 'FRONTEND', 'PYTHON']

export const MentorshipHub: React.FC<MentorshipHubProps> = ({ user, onOpenAuth, onUserUpdate }) => {
  const [mentors, setMentors] = useState<any[]>([])
  const [mySessions, setMySessions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'directory' | 'portal'>('directory')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('ALL')
  
  // Modals
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [becomeMentorOpen, setBecomeMentorOpen] = useState(false)
  
  const [meetLinkInput, setMeetLinkInput] = useState<{ [key: number]: string }>({})
  const [profileActionLoading, setProfileActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

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

  const handleBecomeMentorClick = () => {
    if (!user) {
      onOpenAuth('login')
      return
    }
    setBecomeMentorOpen(true)
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

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Are you sure you want to cancel and remove this mentorship session?')) return
    try {
      const res = await fetch(`/api/mentorship/sessions/${sessionId}/`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setMySessions(mySessions.filter(s => s.id !== sessionId))
        setActionMessage('Session was successfully cancelled.')
        setTimeout(() => setActionMessage(''), 4000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleRemoveMentorProfile = async () => {
    if (!confirm('Are you sure you want to delete your Mentor Profile and revert your account to regular MCA Student? This will remove you from the Mentor Directory.')) {
      return
    }
    setProfileActionLoading(true)
    try {
      const res = await fetch('/api/mentorship/profile/remove/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        if (onUserUpdate && data.user) {
          onUserUpdate(data.user)
        }
        setActionMessage('Mentor profile removed. You are now in Student mode.')
        fetchMentors()
        fetchMySessions()
        setActiveTab('directory')
        setTimeout(() => setActionMessage(''), 5000)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setProfileActionLoading(false)
    }
  }

  const isMentorRole = user && (user.role === 'ALUMNI' || user.role === 'FACULTY' || user.is_mentor_available)

  const filteredMentors = mentors.filter(m => {
    const expList = Array.isArray(m.expertise_areas) 
      ? m.expertise_areas 
      : (m.expertise_areas ? m.expertise_areas.split(',').map((e: string) => e.trim()) : [])
    
    const expStr = expList.join(' ')
    const matchesTag = selectedTag === 'ALL' || 
      expStr.toUpperCase().includes(selectedTag) ||
      (m.headline && m.headline.toUpperCase().includes(selectedTag))

    const matchesSearch = !searchQuery ||
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.about?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expStr.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTag && matchesSearch
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="max-w-xl mx-auto p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center animate-in slide-in-from-top duration-200">
          ✅ {actionMessage}
        </div>
      )}

      {/* Top Notice if a user is in Mentor role and wants to undo/remove it */}
      {isMentorRole && (
        <div className="max-w-5xl mx-auto p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Mentor Account Active:</strong> You are currently listed as an Alumni Mentor ({user.role_display}). Mistakenly created a mentor profile or want to revert back to a regular Student?
            </span>
          </div>
          <button
            onClick={handleRemoveMentorProfile}
            disabled={profileActionLoading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold shrink-0 transition-all cursor-pointer shadow-xs"
          >
            {profileActionLoading ? 'Removing...' : '↩️ Delete Mentor Profile & Reset to Student'}
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-cyan-600" />
            <span>1-on-1 Guidance & Mock Interviews</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Alumni Mentorship <span className="gradient-text">& Guidance Portal</span>
          </h1>
          <p className="text-xs text-slate-500">
            Connect directly with verified alumni at Microsoft, Google, TCS, and top startups for career planning and mock interview prep.
          </p>
        </div>

        <button
          onClick={handleBecomeMentorClick}
          className="gradient-btn px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shrink-0"
        >
          <Award className="w-4 h-4" />
          <span>{isMentorRole ? 'Update Mentor Profile' : 'Become a Peer Mentor'}</span>
        </button>
      </div>

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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

        {activeTab === 'directory' && (
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mentors by company, skills..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs outline-none bg-white transition-all"
            />
          </div>
        )}
      </div>

      {/* Expertise Filter Chips (When Directory Active) */}
      {activeTab === 'directory' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {EXPERTISE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Mentorship Portal...</div>
      ) : activeTab === 'directory' ? (
        filteredMentors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">No mentors matched your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your expertise filter or search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((m) => {
              const expList = Array.isArray(m.expertise_areas) 
                ? m.expertise_areas 
                : (m.expertise_areas ? m.expertise_areas.split(',').map((e: string) => e.trim()) : [])

              return (
                <div key={m.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-cyan-300 hover:shadow-lg hover:-translate-y-1 transition-all">
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
                      {expList.map((e: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-100">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleBookClick(m)}
                      className="w-full gradient-btn py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book 1-on-1 Session</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* My Mentorship Portal */
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {isMentorRole ? 'Student Mentorship Requests' : 'Your Booked Sessions'}
              </h3>
              <p className="text-xs text-slate-500">
                {isMentorRole 
                  ? 'Confirm student slots with Google Meet / Zoom links or decline' 
                  : 'Track approval status, join meeting links, or cancel requests'}
              </p>
            </div>
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
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
                          </span>
                        ) : session.status === 'PENDING' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
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

                    <div className="flex items-center gap-3">
                      <div className="text-left sm:text-right text-xs">
                        <div className="font-bold text-slate-800">📅 {session.requested_date}</div>
                        <div className="text-slate-400 text-[11px]">⏰ {session.requested_time}</div>
                      </div>
                      {/* Cancel / Delete Session Button */}
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Cancel Mentorship Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <span className="font-bold text-slate-800">Student Notes: </span>
                    {session.student_notes || 'No extra notes provided.'}
                  </p>

                  {/* Actions for Mentor vs Student */}
                  {isMentorRole && session.status === 'PENDING' ? (
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="url"
                        placeholder="Google Meet Link (e.g. https://meet.google.com/...)"
                        value={meetLinkInput[session.id] || ''}
                        onChange={(e) => setMeetLinkInput({ ...meetLinkInput, [session.id]: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleUpdateSessionStatus(session.id, 'CONFIRMED')}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Slot
                        </button>
                        <button
                          onClick={() => handleUpdateSessionStatus(session.id, 'CANCELLED')}
                          className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-all cursor-pointer"
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
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1"
                      >
                        <span>Join Video Call</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Become Mentor Modal */}
      <BecomeMentorModal
        isOpen={becomeMentorOpen}
        onClose={() => setBecomeMentorOpen(false)}
        onSuccess={() => {
          fetchMentors()
          fetchMySessions()
          setActionMessage('Mentor profile activated successfully!')
          setTimeout(() => setActionMessage(''), 5000)
        }}
      />

    </div>
  )
}
