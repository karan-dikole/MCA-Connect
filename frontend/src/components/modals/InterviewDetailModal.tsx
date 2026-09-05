import { X, Building2, CheckCircle2, XCircle, Clock, Lightbulb, HelpCircle, User, Layers } from 'lucide-react'

interface InterviewDetailModalProps {
  isOpen: boolean
  onClose: () => void
  experience: any | null
}

export const InterviewDetailModal: React.FC<InterviewDetailModalProps> = ({
  isOpen,
  onClose,
  experience,
}) => {
  if (!isOpen || !experience) return null

  const company = experience.company_name || 'Company'
  const role = experience.role_applied || experience.role_title || 'Software Engineer'
  const outcome = experience.offer_status || experience.outcome || 'Offered'
  const difficulty = experience.difficulty || 'Medium'
  const batch = experience.batch_year || experience.batch || ''
  const ctc = experience.compensation_details || experience.ctc_lpa || ''
  const rounds = experience.rounds_breakdown || experience.rounds_summary || experience.summary || ''
  const questions = experience.questions_asked || ''
  const tips = experience.tips_for_juniors || ''
  const author = experience.author_name || 'Alumni'

  const getDifficultyBadge = (diff: string) => {
    const d = (diff || '').toUpperCase()
    if (d.includes('EASY')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Easy Difficulty</span>
    } else if (d.includes('HARD')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Hard Difficulty</span>
    } else {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Medium Difficulty</span>
    }
  }

  const getOutcomeBadge = (out: string) => {
    const o = (out || '').toUpperCase()
    if (o.includes('OFFER') || o.includes('SELECT') || o.includes('ACCEPT')) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Offer Received
        </span>
      )
    } else if (o.includes('REJECT') || o.includes('NOT')) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Not Selected
        </span>
      )
    } else {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3.5 h-3.5 text-blue-600" /> In Progress
        </span>
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-indigo-100 flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md p-6 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg block">{company}</span>
              <span className="text-xs text-slate-500 font-medium">{role}</span>
            </div>
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
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black text-slate-900">
                {role} Placement Debrief
              </h2>
              {ctc && (
                <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-800 font-extrabold text-sm border border-emerald-200/60">
                  {ctc.toString().includes('LPA') || ctc.toString().includes('₹') ? ctc : `₹ ${ctc} LPA`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {getOutcomeBadge(outcome)}
              {getDifficultyBadge(difficulty)}
              {batch && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Batch {batch}
                </span>
              )}
              {experience.rounds_count && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {experience.rounds_count} Rounds
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-4">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Shared by <strong className="text-slate-700">{author}</strong></span>
              {experience.created_at && <span>• {experience.created_at}</span>}
            </div>
          </div>

          {/* Overview Summary */}
          {experience.summary && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Overall Experience & Preparation
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                {experience.summary}
              </p>
            </div>
          )}

          {/* Rounds Breakdown */}
          {rounds && rounds !== experience.summary && (
            <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2.5">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" /> Interview Process & Round Structure
              </h4>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {rounds}
              </p>
            </div>
          )}

          {/* Questions Asked */}
          {questions && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" /> Specific Technical & Behavioral Questions
              </h4>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-mono text-xs bg-white p-3 rounded-xl border border-slate-200/70">
                {questions}
              </p>
            </div>
          )}

          {/* Tips for Juniors */}
          {tips && (
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" /> Strategic Advice & Tips for Juniors
              </h4>
              <p className="text-sm text-amber-950 whitespace-pre-line leading-relaxed">
                {tips}
              </p>
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
