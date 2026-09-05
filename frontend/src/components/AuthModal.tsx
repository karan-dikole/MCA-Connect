import React, { useState } from 'react'
import { X, Lock, User as UserIcon, Sparkles, ArrowRight, ShieldCheck, GraduationCap, Eye, EyeOff } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
  onAuthSuccess: (user: any) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Form fields
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('STUDENT')

  if (!isOpen) return null

  const handleLogin = async (loginUser?: string, loginPass?: string) => {
    setError('')
    setLoading(true)
    const u = loginUser || username
    const p = loginPass || password

    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onAuthSuccess(data.user)
        onClose()
      } else {
        setError(data.error || 'Invalid credentials.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onAuthSuccess(data.user)
        onClose()
      } else {
        setError(data.error || 'Registration failed.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-3xl p-6 sm:p-8 max-w-lg w-full bg-white shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {mode === 'login' ? 'Welcome Back!' : 'Create MCA Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login' 
              ? 'Sign in or select a demo role below to experience role-based features'
              : 'Join as an MCA Scholar or Verified Alumni Mentor'}
          </p>
        </div>

        {/* 1-Click Demo Accounts Cards */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-slate-50 to-cyan-50/70 border border-indigo-100/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-indigo-800 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              1-Click Demo Accounts (Fast Access)
            </span>
            <span className="text-[10px] text-indigo-500 font-bold">Select Role</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Student Demo Card */}
            <button
              type="button"
              onClick={() => handleLogin('ananya_roy', 'pass1234')}
              className="p-3 rounded-xl bg-white hover:bg-indigo-50/70 border border-indigo-200/90 hover:border-indigo-400 shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-indigo-950 flex items-center gap-1">
                  🎓 Ananya Roy
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                  STUDENT
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                AI Career Suite, Q&A, Projects, Book 1-on-1 Mentorship & Track Bookings
              </p>
            </button>

            {/* Mentor Demo Card */}
            <button
              type="button"
              onClick={() => handleLogin('rahul_verma', 'pass1234')}
              className="p-3 rounded-xl bg-white hover:bg-cyan-50/70 border border-cyan-200/90 hover:border-cyan-400 shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                  🌟 Rahul Verma
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-100 text-cyan-800">
                  MENTOR @ MSFT
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Approval Panel (Google Meet links), Publish Study Guides, Verified Answers
              </p>
            </button>
          </div>

          {/* Admin Demo Card Pill */}
          <div className="flex items-center justify-between pt-1 border-t border-indigo-100/60">
            <span className="text-[10px] text-slate-500">Need full platform moderation?</span>
            <button
              type="button"
              onClick={() => handleLogin('admin', 'admin123')}
              className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sign In as Admin (Prof. Sharma)</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError('') }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In with Password
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError('') }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in shake duration-200">
            {error}
          </div>
        )}

        {/* Forms */}
        {mode === 'login' ? (
          <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Username or Email</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ananya_roy or student@mca.edu"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Karan"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dikole"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="karand"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="karan@example.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Role Scope Selector */}
            <div className="space-y-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="text-[11px] font-extrabold text-slate-800 flex items-center justify-between">
                <span>Account Role & Permissions</span>
                <span className="text-[10px] text-indigo-600 font-semibold">Choose Carefully</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                  role === 'STUDENT' ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="account_role"
                    value="STUDENT"
                    checked={role === 'STUDENT'}
                    onChange={() => setRole('STUDENT')}
                    className="mt-0.5 text-indigo-600"
                  />
                  <div className="text-[10px] leading-tight">
                    <p className="font-bold">🎓 MCA Student</p>
                    <p className="text-slate-500 font-normal">Book mentors, AI tools, project showcase</p>
                  </div>
                </label>

                <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                  role === 'ALUMNI' ? 'bg-cyan-50 border-cyan-400 text-cyan-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="account_role"
                    value="ALUMNI"
                    checked={role === 'ALUMNI'}
                    onChange={() => setRole('ALUMNI')}
                    className="mt-0.5 text-cyan-600"
                  />
                  <div className="text-[10px] leading-tight">
                    <p className="font-bold">🌟 Alumni Mentor</p>
                    <p className="text-slate-500 font-normal">Approve sessions, author study guides</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md mt-1"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  )
}

