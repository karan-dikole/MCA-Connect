import React, { useEffect, useState } from 'react'
import { Rocket, ExternalLink, Heart, Code, Plus, Trash2, Users } from 'lucide-react'
import { CreateProjectModal } from './modals/CreateProjectModal'

interface ProjectsHubProps {
  user: any
  onOpenAuth: (mode: 'login' | 'register') => void
}

export const ProjectsHub: React.FC<ProjectsHubProps> = ({ user, onOpenAuth }) => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects/')
      const data = await res.json()
      setProjects(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleShowcaseClick = () => {
    if (!user) {
      onOpenAuth('login')
      return
    }
    setCreateModalOpen(true)
  }

  const handleLike = async (projId: number) => {
    if (!user) {
      onOpenAuth('login')
      return
    }
    try {
      const res = await fetch(`/api/projects/${projId}/`, {
        method: 'POST',
      })
      const data = await res.json()
      setProjects(projects.map(p => p.id === projId ? { ...p, likes_count: data.likes_count, is_liked_by_me: !p.is_liked_by_me } : p))
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (projId: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await fetch(`/api/projects/${projId}/`, { method: 'DELETE' })
      setProjects(projects.filter(p => p.id !== projId))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header & CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto border-b border-slate-100 pb-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Rocket className="w-3.5 h-3.5 text-indigo-600" />
            <span>Innovation & Peer Collaboration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            MCA Scholar <span className="gradient-text">Project Gallery</span>
          </h1>
          <p className="text-xs text-slate-500">
            Discover open-source software, full-stack web applications, and AI models built by MCA students.
          </p>
        </div>

        <button
          onClick={handleShowcaseClick}
          className="gradient-btn px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Showcase Project</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const isMyProject = user && user.id === proj.author_id

            return (
              <div key={proj.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase">
                      {proj.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLike(proj.id)}
                        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                          proj.is_liked_by_me 
                            ? 'bg-rose-50 border-rose-200 text-rose-600' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${proj.is_liked_by_me ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{proj.likes_count}</span>
                      </button>

                      {isMyProject && (
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">{proj.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{proj.tagline || proj.description}</p>

                  {/* Looking for teammates banner */}
                  {proj.is_looking_for_teammates && (
                    <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center gap-2 text-[11px] text-cyan-900 font-bold">
                      <Users className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span className="line-clamp-1">Teammates: {proj.roles_needed || 'Open Roles'}</span>
                    </div>
                  )}

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tech_stack.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    By <span className="font-bold text-slate-700">{proj.author_name}</span> ({proj.author_role})
                  </span>
                  <div className="flex items-center gap-2">
                    {proj.github_url && (
                      <a 
                        href={proj.github_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="GitHub Repository"
                      >
                        <Code className="w-4 h-4" />
                      </a>
                    )}
                    {proj.live_demo_url && (
                      <a 
                        href={proj.live_demo_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                        title="Live Hosted Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Showcase Modal */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchProjects}
      />

    </div>
  )
}
