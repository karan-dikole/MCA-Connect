import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { ResumeMatcher } from './components/ResumeMatcher'
import { AILab } from './components/AILab'
import { KnowledgeHub } from './components/KnowledgeHub'
import { InterviewHub } from './components/InterviewHub'
import { ProjectsHub } from './components/ProjectsHub'
import { MentorshipHub } from './components/MentorshipHub'
import { QAHub } from './components/QAHub'
import { HeroStats } from './components/HeroStats'
import { AuthModal } from './components/AuthModal'
import { ArrowUpRight, Code } from 'lucide-react'

export function App() {
  const [activeTab, setActiveTab] = useState('ai-resume')
  const [user, setUser] = useState<any>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    fetch('/api/auth/me/')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user)
        }
      })
      .catch(console.error)
  }, [])

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout/', { method: 'POST' })
      setUser(null)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white pb-12">
      <div>
        {/* Navigation Bar with Auth Integration */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
        />

        {/* Global Statistics Strip */}
        <HeroStats />

        {/* Active Content Body */}
        <main className="max-w-7xl mx-auto px-4 py-4">
          {activeTab === 'ai-resume' && <ResumeMatcher />}
          {activeTab === 'ai-tools' && <AILab />}
          {activeTab === 'knowledge' && <KnowledgeHub user={user} onOpenAuth={handleOpenAuth} />}
          {activeTab === 'interviews' && <InterviewHub user={user} onOpenAuth={handleOpenAuth} />}
          {activeTab === 'projects' && <ProjectsHub user={user} onOpenAuth={handleOpenAuth} />}
          {activeTab === 'mentorship' && (
            <MentorshipHub 
              user={user} 
              onOpenAuth={handleOpenAuth} 
              onUserUpdate={(updatedUser) => setUser(updatedUser)} 
            />
          )}
          {activeTab === 'qa' && <QAHub user={user} onOpenAuth={handleOpenAuth} />}
        </main>
      </div>

      {/* Modern Login & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={(loggedInUser) => setUser(loggedInUser)}
      />

      {/* Modern Footer */}
      <footer className="mt-16 border-t border-slate-200/80 pt-8 max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-700">MCA Connect v2.0</span>
            <span>•</span>
            <span>Knowledge, Experience & Collaboration Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="http://127.0.0.1:8000/admin/" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-semibold"
            >
              <span>Django Admin</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a 
              href="https://github.com/karan-dikole/MCA-Connect" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-semibold"
            >
              <Code className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
