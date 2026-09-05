import React, { useEffect, useState } from 'react'
import { BookOpen, Eye, Clock, Plus, Trash2, Search, Filter, Compass, ArrowRight } from 'lucide-react'
import { PublishArticleModal } from './modals/PublishArticleModal'
import { ArticleDetailModal } from './modals/ArticleDetailModal'
import { RoadmapDetailModal } from './modals/RoadmapDetailModal'

interface KnowledgeHubProps {
  user: any
  onOpenAuth: (mode: 'login' | 'register') => void
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Subjects' },
  { id: 'SEMESTER', label: 'Semester Notes' },
  { id: 'DSA', label: 'DSA & Algorithms' },
  { id: 'SYSTEM_DESIGN', label: 'System Design' },
  { id: 'WEB_DEV', label: 'Web & Fullstack' },
  { id: 'AI_ML', label: 'AI & Data Science' },
  { id: 'CLOUD', label: 'Cloud & DevOps' },
  { id: 'PLACEMENT', label: 'Placement Prep' },
]

export const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ user, onOpenAuth }) => {
  const [articles, setArticles] = useState<any[]>([])
  const [roadmaps, setRoadmaps] = useState<any[]>([])
  const [activeView, setActiveView] = useState<'articles' | 'roadmaps'>('articles')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  
  // Modals state
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null)

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

  useEffect(() => {
    fetchData()
  }, [])

  const isMentorRole = user && (user.role === 'ALUMNI' || user.role === 'FACULTY' || user.role === 'ADMIN')

  const handlePublishClick = () => {
    if (!user) {
      onOpenAuth('login')
      return
    }
    setPublishModalOpen(true)
  }

  const handleDelete = async (e: React.MouseEvent, artId: number) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this study guide?')) return
    try {
      const res = await fetch(`/api/knowledge/articles/${artId}/`, { method: 'DELETE' })
      if (res.ok) {
        setArticles(articles.filter(a => a.id !== artId))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredArticles = articles.filter(art => {
    const matchesCat = selectedCategory === 'ALL' || art.category === selectedCategory
    const matchesSearch = !searchQuery || 
      art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  const filteredRoadmaps = roadmaps.filter(r => {
    return !searchQuery ||
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.target_role?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Top Header with Role Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Curated Tech Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            MCA Curriculum & <span className="gradient-text">Career Roadmaps</span>
          </h1>
          <p className="text-xs text-slate-500">
            High-yield semester notes, system design roadmaps, and deep-dives written by top MCA alumni.
          </p>
        </div>

        {/* Publish Action (Alumni/Mentor privilege) */}
        {isMentorRole && (
          <button
            onClick={handlePublishClick}
            className="gradient-btn px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Study Guide</span>
          </button>
        )}
      </div>

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveView('articles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'articles' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📚 Study Guides & Notes ({articles.length})
          </button>
          <button
            onClick={() => setActiveView('roadmaps')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'roadmaps' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🗺️ Step-by-Step Roadmaps ({roadmaps.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeView}...`}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs outline-none bg-white transition-all"
          />
        </div>
      </div>

      {/* Category Filter Pills (when articles active) */}
      {activeView === 'articles' && (
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
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading Knowledge Hub...</div>
      ) : activeView === 'articles' ? (
        filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">No study guides found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => {
              const isMyArticle = user && (user.id === art.author_id || user.role === 'ADMIN')
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                        {art.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {art.read_time || '5 min read'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px] font-medium">By <span className="font-bold text-slate-700">{art.author_name}</span></span>
                      {art.author_role && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800">
                          {art.author_role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Eye className="w-3 h-3" /> {art.views_count} views
                      </span>
                      {isMyArticle && (
                        <button
                          onClick={(e) => handleDelete(e, art.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete Study Guide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        filteredRoadmaps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">No roadmaps found</h3>
            <p className="text-xs text-slate-500">Try matching another keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRoadmaps.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRoadmap(r)}
                className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-indigo-600 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700">
                    {r.difficulty}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    🎯 {r.target_role}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                  <span>{r.icon}</span>
                  <span>{r.title}</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{r.summary}</p>
                <div className="pt-2 flex items-center text-xs font-bold text-indigo-600 gap-1">
                  <span>View Step-by-Step Milestones</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Publish Modal */}
      <PublishArticleModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* Article Detail Reading Modal */}
      <ArticleDetailModal
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        article={selectedArticle}
      />

      {/* Roadmap Detail Modal */}
      <RoadmapDetailModal
        isOpen={!!selectedRoadmap}
        onClose={() => setSelectedRoadmap(null)}
        roadmap={selectedRoadmap}
      />

    </div>
  )
}
