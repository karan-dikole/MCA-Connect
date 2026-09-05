import React, { useState } from 'react'
import { Sparkles, FileText, Briefcase, CheckCircle2, XCircle, ArrowRight, Zap, RefreshCw, Copy, Check, BookOpen, Layers, Cpu, Wrench } from 'lucide-react'

interface MatchResult {
  match_score: number
  total_required: number
  matched_skills: string[]
  missing_skills: string[]
  matched_categorized: {
    languages: string[]
    frameworks: string[]
    cloud_db: string[]
    tools: string[]
  }
  missing_categorized: {
    languages: string[]
    frameworks: string[]
    cloud_db: string[]
    tools: string[]
  }
  recommended_articles: Array<{
    id: number
    title: string
    category: string
    summary: string
    read_time_minutes: number
  }>
  roadmap_tasks: Array<{
    day: string
    skill: string
    action: string
  }>
}

const PRESET_JOBS = [
  {
    title: '🚀 SDE-1 (Full-Stack Python & React)',
    jd: 'Looking for a Software Engineer with proficiency in Python, Django, REST API, React, TypeScript, PostgreSQL, Docker, Git, and Data Structures.',
    resume: 'Master of Computer Applications (MCA) student. Skilled in Python, Django, HTML, CSS, JavaScript, React, SQL, Git, and Algorithms. Built e-commerce and Q&A platform projects.'
  },
  {
    title: '☁️ Cloud & DevOps Engineer',
    jd: 'Seeking Junior DevOps / Cloud Engineer with experience in Linux, Docker, Kubernetes, AWS, CI/CD, Python, Terraform, and microservices architecture.',
    resume: 'MCA Graduate with strong foundations in Linux administration, Python scripting, Docker containerization, Git, and basic AWS cloud deployments.'
  },
  {
    title: '🤖 AI / ML Data Scientist',
    jd: 'Hiring Data Scientist with expertise in Python, Machine Learning, Deep Learning, Pandas, NumPy, Scikit-Learn, PyTorch, SQL, and System Design.',
    resume: 'MCA student passionate about AI. Completed projects using Python, Pandas, NumPy, Scikit-Learn, SQL, and introductory Deep Learning.'
  }
]

export const ResumeMatcher: React.FC = () => {
  const [resumeText, setResumeText] = useState(PRESET_JOBS[0].resume)
  const [jobDesc, setJobDesc] = useState(PRESET_JOBS[0].jd)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [result, setResult] = useState<MatchResult | null>(null)

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!resumeText.trim() || !jobDesc.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/resume-matcher/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, job_desc: jobDesc })
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error('Failed to analyze match:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopySummary = () => {
    if (!result) return
    const summary = `MCA Connect AI Resume Match: ${result.match_score}%\nMatched Strengths: ${result.matched_skills.join(', ')}\nIdentified Gaps: ${result.missing_skills.join(', ')}`
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return { stroke: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    if (score >= 45) return { stroke: '#f59e0b', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
    return { stroke: '#f43f5e', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' }
  }

  const scoreTheme = result ? getScoreColor(result.match_score) : null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span>Next-Gen Career Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          AI Resume vs. Job <span className="gradient-text">Gap Analyzer</span>
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Compare your technical skills and project keywords with real Software Engineering, Cloud, and AI job openings to discover your compatibility and 14-day study roadmap.
        </p>
      </div>

      {/* 1-Click Quick Presets */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Demos:</span>
        {PRESET_JOBS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setJobDesc(preset.jd)
              setResumeText(preset.resume)
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Dual Input Grid */}
      <form onSubmit={handleAnalyze} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Resume Textbox */}
          <div className="glass-card rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Your Resume & Technical Skills</h3>
                  <p className="text-[11px] text-slate-400">Paste your technical skills, projects, and bio</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {resumeText.length} chars
              </span>
            </div>

            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your skills, e.g., Python, Django, React, Docker, SQL, Git..."
              className="w-full text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none text-slate-700"
            />
          </div>

          {/* Job Description Textbox */}
          <div className="glass-card rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Target Job Description (JD)</h3>
                  <p className="text-[11px] text-slate-400">Paste requirements from LinkedIn / Naukri</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {jobDesc.length} chars
              </span>
            </div>

            <textarea
              rows={8}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste requirements, e.g., Looking for SDE with Python, React, AWS, Docker..."
              className="w-full text-xs font-mono bg-slate-50/70 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all resize-none text-slate-700"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="gradient-btn px-8 py-3.5 rounded-2xl font-bold text-sm inline-flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Running Semantic AST & Vector Matching...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 group-hover:scale-125 transition-transform" />
                <span>Analyze Match & Extract Skill Gaps</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Dashboard */}
      {result && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl border border-indigo-100 animate-in slide-in-from-bottom-6 duration-500">
          
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1 text-center sm:text-left">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                Analysis Verdict
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Role Compatibility Assessment
              </h2>
              <p className="text-xs text-slate-500">
                Matched {result.matched_skills.length} out of {result.total_required} primary technical competencies.
              </p>
            </div>

            {/* Circular Gauge Meter */}
            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="gauge-circle"
                    strokeDasharray={`${result.match_score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke={scoreTheme?.stroke}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-lg font-black font-heading ${scoreTheme?.text}`}>
                  {result.match_score}%
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Fit Score</div>
                <div className={`text-sm font-extrabold ${scoreTheme?.text}`}>
                  {result.match_score >= 75 ? '🚀 Strong Match' : result.match_score >= 45 ? '⚠️ Moderate Potential' : '🎯 Skill Refinement Needed'}
                </div>
              </div>
            </div>
          </div>

          {/* Categorized Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Matched Strengths */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Matched Strengths ({result.matched_skills.length})</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Ready
                </span>
              </div>

              <div className="space-y-3">
                {/* Languages */}
                {result.matched_categorized.languages.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mb-1.5">
                      <Cpu className="w-3 h-3" /> Core Languages
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matched_categorized.languages.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Frameworks & Cloud */}
                {(result.matched_categorized.frameworks.length > 0 || result.matched_categorized.cloud_db.length > 0) && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mb-1.5">
                      <Layers className="w-3 h-3" /> Frameworks & Infra
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[...result.matched_categorized.frameworks, ...result.matched_categorized.cloud_db].map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools */}
                {result.matched_categorized.tools.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mb-1.5">
                      <Wrench className="w-3 h-3" /> Tools & Engineering
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matched_categorized.tools.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Missing Skills (Gaps) */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Target Skill Gaps ({result.missing_skills.length})</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  Priority
                </span>
              </div>

              <div className="space-y-3">
                {result.missing_skills.length === 0 ? (
                  <div className="text-xs text-emerald-700 font-medium p-3 bg-emerald-50 rounded-xl">
                    🎉 Excellent! You have matched all primary technical requirements for this role!
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missing_skills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-rose-800 border border-rose-200 shadow-2xs uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-rose-600/90 leading-relaxed">
                      Recruiters filter for these keywords during initial ATS screening. Adding coursework or projects in these areas will immediately lift your score.
                    </p>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* 14-Day AI Actionable Roadmap */}
          {result.roadmap_tasks.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  14-Day Gap Remediation Roadmap
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.roadmap_tasks.map((task, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                        {task.day}
                      </span>
                      <span className="text-xs font-black text-slate-800">{task.skill}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{task.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Knowledge Hub Articles */}
          {result.recommended_articles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Recommended Guides to Bridge Your Gaps:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.recommended_articles.map((art) => (
                  <div key={art.id} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:border-indigo-300 transition-all">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-800">{art.title}</div>
                      <div className="text-[10px] text-slate-400">{art.category} • {art.read_time_minutes} min read</div>
                    </div>
                    <span className="text-indigo-600 text-xs font-bold hover:underline">Read →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={handleCopySummary}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Analysis Summary'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Powered by MCA Connect NLP Matching Engine v2.0
            </span>
          </div>

        </div>
      )}

    </div>
  )
}
