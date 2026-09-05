import React from 'react'
import { X, ExternalLink, Users, Code2, Heart, GitBranch } from 'lucide-react'

interface Project {
  id: number
  title: string
  tagline: string
  description?: string
  creator_name: string
  category: string
  tech_stack: string
  likes_count: number
  github_url: string
  live_demo_url: string
  is_looking_for_teammates: boolean
  roles_needed: string
  created_at?: string
}

interface ProjectDetailModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onLike?: (id: number) => void
  hasLiked?: boolean
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  onLike,
  hasLiked = false,
}) => {
  if (!isOpen || !project) return null

  const techStackList = project.tech_stack
    ? project.tech_stack.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const rolesList = project.roles_needed
    ? project.roles_needed.split(',').map((r) => r.trim()).filter(Boolean)
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-indigo-100 flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md p-6 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              {project.category}
            </span>
            {project.is_looking_for_teammates && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                <Users className="w-3.5 h-3.5" /> Recruiting Teammates
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {project.title}
            </h2>
            <p className="text-slate-600 text-base mt-2 font-medium">
              {project.tagline}
            </p>
            <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Built by {project.creator_name}</span>
              {project.created_at && <span>• {new Date(project.created_at).toLocaleDateString()}</span>}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {project.live_demo_url && (
              <a
                href={project.live_demo_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Live Demo
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm shadow-md hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <GitBranch className="w-4 h-4" /> Code Repository
              </a>
            )}
            {onLike && (
              <button
                onClick={() => onLike(project.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  hasLiked
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{project.likes_count} Likes</span>
              </button>
            )}
          </div>

          {/* Detailed Description */}
          {project.description && project.description !== project.tagline && (
            <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                About the Architecture & Features
              </h4>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>
          )}

          {/* Tech Stack */}
          {techStackList.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-500" /> Technologies Used
              </h4>
              <div className="flex flex-wrap gap-2">
                {techStackList.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50/80 text-indigo-700 border border-indigo-100/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Teammates Needed */}
          {project.is_looking_for_teammates && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-200/80 space-y-3">
              <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> Collaboration Opportunity
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                The creator is actively recruiting peer contributors for this project.
              </p>
              {rolesList.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-950 block">Open Roles:</span>
                  <div className="flex flex-wrap gap-2">
                    {rolesList.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300/60"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200/70 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
