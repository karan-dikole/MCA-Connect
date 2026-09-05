import { X, Target } from 'lucide-react'

interface RoadmapDetailModalProps {
  isOpen: boolean
  roadmap: any
  onClose: () => void
}

export const RoadmapDetailModal: React.FC<RoadmapDetailModalProps> = ({ isOpen, roadmap, onClose }) => {
  if (!isOpen || !roadmap) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-3xl p-6 sm:p-8 max-w-2xl w-full bg-white shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto flex flex-col space-y-5"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 border-b border-slate-100 pb-4 pr-8">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700">
              {roadmap.difficulty}
            </span>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-600" /> Target Role: {roadmap.target_role}
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>{roadmap.icon}</span>
            <span>{roadmap.title}</span>
          </h2>
          <p className="text-xs text-slate-500">{roadmap.summary}</p>
        </div>

        {/* Milestone Steps */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Milestone Breakdown</h3>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
            {roadmap.content}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full gradient-btn py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md"
          >
            Close Roadmap
          </button>
        </div>
      </div>
    </div>
  )
}
