import React, { useState, useEffect } from 'react'
import { Rocket, ExternalLink, Heart, Code, Plus, Trash2, Users, Search, Filter } from 'lucide-react'
import { CreateProjectModal } from './modals/CreateProjectModal'
import { ProjectDetailModal } from './modals/ProjectDetailModal'

interface ProjectsHubProps {
  user: any
  onOpenAuth: (mode: 'login' | 'register') => void
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Projects' },
  { id: 'WEB', label: 'Web Applications' },
  { id: 'MOBILE', label: 'Mobile Apps' },
  { id: 'AI', label: 'AI & Machine Learning' },
  { id: 'CLOUD', label: 'Cloud & DevOps' },
  { id: 'OPEN_SOURCE', label: 'Open Source Tools' },
]

export const ProjectsHub: React.FC<ProjectsHubProps> = ({ user, onOpenAuth }) => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [teammatesOnly, setTeammatesOnly] = useState(false)
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)

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

  const handleLike = async (projId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!user) {
      onOpenAuth('login')
      return
    }
    try {
      const res = await fetch(`/api/projects/${projId}/`, {
        method: 'POST',
      })
      const data = await res.json()
      setProjects(projects.map(p => {
        if (p.id === projId) {
          const updated = { ...p, likes_count: data.likes_count, is_liked_by_me: !p.is_liked_by_me }
          if (selectedProject && selectedProject.id === projId) {
            setSelectedProject(updated)
          }
          return updated
        }
        return p
      }))
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (e: React.MouseEvent, projId: number) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await fetch(`/api/projects/${projId}/`, { method: 'DELETE' })
      setProjects(projects.filter(p => p.id !== projId))
      if (selectedProject && selectedProject.id === projId) {
        setSelectedProject(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredProjects = projects.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || 
      (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    
    const matchesTeammates = !teammatesOnly || p.is_looking_for_teammates

    const techStr = Array.isArray(p.tech_stack) ? p.tech_stack.join(' ') : (p.tech_stack || '')
    const matchesSearch = !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      techStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author_name?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesTeammates && matchesSearch
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Top Header & CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
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

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by tech (e.g. Next.js, Django)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs outline-none bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {/* Teammates Toggle */}
          <button
            onClick={() => setTeammatesOnly(!teammatesOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              teammatesOnly
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Looking for Teammates</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <Rocket className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No matching projects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try tweaking your filters or be the first to showcase a new build!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const isMyProject = user && (user.id === proj.author_id || user.role === 'ADMIN')
            const techList = Array.isArray(proj.tech_stack) 
              ? proj.tech_stack 
              : (proj.tech_stack ? proj.tech_stack.split(',').map((t: string) => t.trim()).filter(Boolean) : [])

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase">
                      {proj.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleLike(proj.id, e)}
                        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                          proj.is_liked_by_me 
                            ? 'bg-rose-50 border-rose-200 text-rose-600' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-rose-500'
                        }`}
                        title="Applaud project"
                      >
                        <Heart className={`w-3.5 h-3.5 ${proj.is_liked_by_me ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{proj.likes_count}</span>
                      </button>

                      {isMyProject && (
                        <button
                          onClick={(e) => handleDelete(e, proj.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {proj.tagline || proj.description}
                  </p>

                  {/* Looking for teammates banner */}
                  {proj.is_looking_for_teammates && (
                    <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center gap-2 text-[11px] text-cyan-900 font-bold">
                      <Users className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span className="line-clamp-1">Teammates: {proj.roles_needed || 'Open Roles'}</span>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {techList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {techList.slice(0, 4).map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          {t}
                        </span>
                      ))}
                      {techList.length > 4 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400">
                          +{techList.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    By <span className="font-bold text-slate-700">{proj.author_name}</span> {proj.author_role ? `(${proj.author_role})` : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    {proj.github_url && (
                      <a 
                        href={proj.github_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
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
                        onClick={(e) => e.stopPropagation()}
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

      {/* Project Detail Modal */}
      <ProjectDetailModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject ? {
          ...selectedProject,
          creator_name: selectedProject.author_name,
          tech_stack: Array.isArray(selectedProject.tech_stack) ? selectedProject.tech_stack.join(', ') : selectedProject.tech_stack
        } : null}
        onLike={(id) => handleLike(id)}
        hasLiked={selectedProject?.is_liked_by_me}
      />

    </div>
  )
}
