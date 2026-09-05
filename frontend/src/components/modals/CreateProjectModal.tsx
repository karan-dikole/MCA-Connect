import React, { useState } from 'react'
import { X, Rocket, Send, GitBranch, ExternalLink, Users } from 'lucide-react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('WEB')
  const [techStack, setTechStack] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [liveDemoUrl, setLiveDemoUrl] = useState('')
  const [isLookingForTeammates, setIsLookingForTeammates] = useState(false)
  const [rolesNeeded, setRolesNeeded] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          tagline,
          description: description || tagline,
          category,
          tech_stack: techStack,
          github_url: githubUrl,
          live_demo_url: liveDemoUrl,
          is_looking_for_teammates: isLookingForTeammates,
          roles_needed: rolesNeeded,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onSuccess()
        onClose()
      } else {
        setError(data.error || 'Failed to showcase project.')
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
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Showcase Your Project</h2>
            <p className="text-xs text-slate-500">Exhibit your build to peer scholars, mentors, and recruiters</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI-Powered Resume Parser & ATS Scorecard"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
              >
                <option value="WEB">Web Dev / Full-Stack</option>
                <option value="AI_ML">AI & Machine Learning</option>
                <option value="MOBILE">Mobile App</option>
                <option value="CLOUD">Cloud & DevOps</option>
                <option value="CYBERSEC">Cybersecurity</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tech Stack (comma-separated)</label>
              <input
                type="text"
                required
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="Django, React, Docker, Postgres"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">One-Line Elevator Tagline</label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A real-time resume parser providing actionable skill gap recommendations."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Detailed Description & Architecture (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight architecture, features, database models, and deployment details..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5" /> GitHub Repo URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> Live Demo URL
              </label>
              <input
                type="url"
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Teammates checkbox */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-indigo-900 cursor-pointer">
              <input
                type="checkbox"
                checked={isLookingForTeammates}
                onChange={(e) => setIsLookingForTeammates(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Looking for Teammates / Contributors
              </span>
            </label>
            {isLookingForTeammates && (
              <input
                type="text"
                value={rolesNeeded}
                onChange={(e) => setRolesNeeded(e.target.value)}
                placeholder="Roles needed: e.g. Frontend Dev (Tailwind), UI/UX Designer"
                className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Publishing Showcase...' : 'Showcase Project (+25 XP)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
