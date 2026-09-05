import React, { useEffect, useState } from 'react'
import { BookOpen, Briefcase, Users, Rocket } from 'lucide-react'

export const HeroStats: React.FC = () => {
  const [stats, setStats] = useState({
    articles_count: 0,
    interviews_count: 0,
    mentors_count: 0,
    projects_count: 0,
    questions_count: 0,
    students_count: 0,
  })

  useEffect(() => {
    fetch('/api/stats/')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error)
  }, [])

  const statItems = [
    { label: 'Study Guides & Notes', val: stats.articles_count, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Placement Logs', val: stats.interviews_count, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Mentors', val: stats.mentors_count, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Innovation Projects', val: stats.projects_count, icon: Rocket, color: 'text-rose-600', bg: 'bg-rose-50' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto my-6">
      {statItems.map((st, i) => {
        const Icon = st.icon
        return (
          <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-3.5 border border-slate-100">
            <div className={`p-3 rounded-xl ${st.bg} ${st.color} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 font-heading leading-tight">{st.val}+</div>
              <div className="text-[11px] text-slate-400 font-medium">{st.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
