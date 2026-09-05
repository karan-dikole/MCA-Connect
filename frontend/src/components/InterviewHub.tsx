import React, { useEffect, useState } from 'react'
import { Briefcase, Building2, CheckCircle } from 'lucide-react'

export const InterviewHub: React.FC = () => {
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/interviews/')
      .then(res => res.json())
      .then(data => setExperiences(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
          <Briefcase className="w-3.5 h-3.5 text-amber-600" />
          <span>Alumni Placement Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          Real Company <span className="gradient-text">Interview Experiences</span>
        </h1>
        <p className="text-sm text-slate-500">
          Learn real questions, round-by-round interview structures, and placement strategies shared by seniors.
        </p>
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
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{exp.company_name}</h3>
                      <p className="text-[11px] text-slate-400 font-medium">{exp.role}</p>
                    </div>
                  </div>
                  {exp.outcome === 'Offered' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Selected
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {exp.outcome}
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
                  {exp.package_lpa && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      💰 {exp.package_lpa} LPA
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                  {exp.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Shared by {exp.student_name}</span>
                <span>{exp.created_at}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
