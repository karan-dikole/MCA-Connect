import React, { useEffect, useState } from 'react'
import { MessageSquare, ThumbsUp, CheckCircle } from 'lucide-react'

export const QAHub: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/qa/questions/')
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span>Peer-to-Peer Academic Forum</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          Curated MCA <span className="gradient-text">Q&A Discussions</span>
        </h1>
        <p className="text-sm text-slate-500">
          Ask code debugging questions, discuss tricky algorithm problems, and get verified answers from senior MCA scholars.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Discussions...</div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {questions.map((q) => (
            <div key={q.id} className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {q.is_solved && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Solved
                    </span>
                  )}
                  <h3 className="text-base font-extrabold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors">
                    {q.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{q.content}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    {q.language}
                  </span>
                  {q.tags.map((t: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-100 sm:pl-6 text-center">
                <div className="p-2 rounded-xl bg-slate-50 min-w-[55px]">
                  <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-indigo-600" />
                    <span>{q.upvotes_count}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Votes</div>
                </div>

                <div className="p-2 rounded-xl bg-indigo-50 min-w-[55px]">
                  <div className="text-xs font-black text-indigo-700">{q.answers_count}</div>
                  <div className="text-[9px] text-indigo-500 font-bold uppercase">Answers</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
