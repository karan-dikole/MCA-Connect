import React, { useEffect, useState } from 'react'
import { BookOpen, Eye, Clock } from 'lucide-react'

export const KnowledgeHub: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([])
  const [roadmaps, setRoadmaps] = useState<any[]>([])
  const [activeView, setActiveView] = useState<'articles' | 'roadmaps'>('articles')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artRes, roadRes] = await Promise.all([
          fetch('/api/knowledge/articles/'),
          fetch('/api/knowledge/roadmaps/')
        ])
        const artData = await artRes.json()
        const roadData = await roadRes.json()
        setArticles(artData)
        setRoadmaps(roadData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>Curated Tech Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          MCA Curriculum & <span className="gradient-text">Career Roadmaps</span>
        </h1>
        <p className="text-sm text-slate-500">
          High-yield semester notes, system design roadmaps, and software engineering deep-dives written by top MCA alumni.
        </p>

        {/* View Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 mt-2">
          <button
            onClick={() => setActiveView('articles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'articles' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            📚 Study Guides & Notes ({articles.length})
          </button>
          <button
            onClick={() => setActiveView('roadmaps')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'roadmaps' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            🗺️ Step-by-Step Roadmaps ({roadmaps.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Knowledge Hub...</div>
      ) : activeView === 'articles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div key={art.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                    {art.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {art.read_time}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3">
                  {art.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-medium">By {art.author_name}</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Eye className="w-3 h-3" /> {art.views_count} views
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmaps.map((r) => (
            <div key={r.id} className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-indigo-600">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700">
                  {r.difficulty}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  🎯 {r.target_role}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">{r.icon} {r.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{r.summary}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
