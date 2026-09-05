import { X, Clock, Tag, Eye } from 'lucide-react'

interface ArticleDetailModalProps {
  isOpen: boolean
  article: any
  onClose: () => void
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ isOpen, article, onClose }) => {
  if (!isOpen || !article) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-3xl p-6 sm:p-8 max-w-3xl w-full bg-white shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto flex flex-col space-y-5"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Metadata */}
        <div className="space-y-2 border-b border-slate-100 pb-4 pr-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
              {article.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
              {article.difficulty}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.read_time}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
              <Eye className="w-3.5 h-3.5" /> {article.views_count} reads
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {article.title}
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
              {article.author_name ? article.author_name.charAt(0) : 'M'}
            </div>
            <span>Authored by <strong className="text-slate-800">{article.author_name}</strong></span>
            {article.author_role && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800">
                {article.author_role}
              </span>
            )}
            <span>• {article.created_at}</span>
          </div>
        </div>

        {/* Summary Callout */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 leading-relaxed font-medium">
          <strong>Key Takeaway: </strong> {article.summary}
        </div>

        {/* Article Body Content */}
        <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4 text-slate-700 whitespace-pre-line font-normal">
          {article.content}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            {article.tags.map((tag: string, i: number) => (
              <span key={i} className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
