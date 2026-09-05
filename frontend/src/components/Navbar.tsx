import React, { useState } from 'react'
import { Sparkles, BookOpen, Briefcase, Rocket, MessageSquare, Users, Search, GraduationCap, LogIn, LogOut } from 'lucide-react'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user: any
  onOpenAuth: (mode: 'login' | 'register') => void
  onLogout: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user, onOpenAuth, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems = [
    { id: 'ai-resume', label: 'AI Resume Matcher', icon: Sparkles, badge: 'AI' },
    { id: 'ai-tools', label: 'AI Lab', icon: Sparkles },
    { id: 'knowledge', label: 'Knowledge Hub', icon: BookOpen },
    { id: 'interviews', label: 'Interview Logs', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Rocket },
    { id: 'mentorship', label: 'Mentors', icon: Users },
    { id: 'qa', label: 'Community Q&A', icon: MessageSquare },
  ]

  return (
    <header className="sticky top-4 z-50 px-4 max-w-7xl mx-auto mb-6">
      <div className="glass-panel rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-lg shadow-indigo-500/5">
        
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('ai-resume')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
              <span className="text-slate-900">MCA</span>
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Connect</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wide">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none">Knowledge & Career Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/60">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-cyan-100 text-cyan-700">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Quick Search & Auth Options */}
        <div className="flex items-center gap-2.5">
          <div className="relative hidden xl:block">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes, questions, mentors..."
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-48 transition-all"
            />
          </div>

          {user ? (
            /* Logged In User Profile Pill */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 p-1.5 pr-3 rounded-2xl transition-all shadow-2xs"
              >
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-7 h-7 rounded-xl object-cover bg-indigo-100"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-indigo-600 font-bold">{user.role_display || user.role}</div>
                </div>
                <span className="text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 ml-1">
                  ⭐ {user.reputation_points}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 mb-1">
                    <div className="text-xs font-black text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      onLogout()
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out: Login & Signup Buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="gradient-btn px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1"
              >
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Nav Scroller */}
      <div className="lg:hidden flex overflow-x-auto gap-2 py-2 mt-2 px-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </header>
  )
}
