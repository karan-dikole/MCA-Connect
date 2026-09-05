import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { ResumeMatcher } from './components/ResumeMatcher'
import { AILab } from './components/AILab'
import { KnowledgeHub } from './components/KnowledgeHub'
import { InterviewHub } from './components/InterviewHub'
import { ProjectsHub } from './components/ProjectsHub'
import { MentorshipHub } from './components/MentorshipHub'
import { QAHub } from './components/QAHub'
import { HeroStats } from './components/HeroStats'
import { ArrowUpRight, Code } from 'lucide-react'

export function App() {
  const [activeTab, setActiveTab] = useState('ai-resume')

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white pb-12">
      <div>
        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Global Statistics Strip */}
        <HeroStats />

        {/* Active Content Body */}
        <main className="max-w-7xl mx-auto px-4 py-4">
          {activeTab === 'ai-resume' && <ResumeMatcher />}
          {activeTab === 'ai-tools' && <AILab />}
          {activeTab === 'knowledge' && <KnowledgeHub />}
          {activeTab === 'interviews' && <InterviewHub />}
          {activeTab === 'projects' && <ProjectsHub />}
          {activeTab === 'mentorship' && <MentorshipHub />}
          {activeTab === 'qa' && <QAHub />}
        </main>
      </div>

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
