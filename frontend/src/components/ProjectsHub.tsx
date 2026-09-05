import React, { useEffect, useState } from 'react'
import { Rocket, ExternalLink, Heart, Code } from 'lucide-react'

export const ProjectsHub: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects/')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
          <Rocket className="w-3.5 h-3.5 text-indigo-600" />
          <span>Innovation & Peer Collaboration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          MCA Scholar <span className="gradient-text">Project Gallery</span>
        </h1>
        <p className="text-sm text-slate-500">
          Discover open-source software, full-stack web applications, and AI models built by MCA students.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase">
                    {proj.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-rose-500 font-bold">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{proj.likes_count}</span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{proj.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{proj.tagline || proj.description}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.tech_stack.map((t: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">By {proj.author_name}</span>
                <div className="flex items-center gap-2">
                  {proj.github_url && (
                    <a href={proj.github_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
                      <Code className="w-4 h-4" />
                    </a>
                  )}
                  {proj.live_demo_url && (
                    <a href={proj.live_demo_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
