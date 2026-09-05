import React, { useState } from 'react'
import { Code, BookOpen, Sparkles, Zap, CheckCircle2, RotateCw } from 'lucide-react'

export const AILab: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'explainer' | 'flashcards'>('explainer')
  
  // Code Explainer State
  const [code, setCode] = useState(`def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`)
  const [language, setLanguage] = useState('python')
  const [explaining, setExplaining] = useState(false)
  const [explanation, setExplanation] = useState<any>(null)

  // Flashcards State
  const [topic, setTopic] = useState('DBMS')
  const [loadingCards, setLoadingCards] = useState(false)
  const [cards, setCards] = useState<any[]>([])
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)

  const handleExplain = async () => {
    setExplaining(true)
    try {
      const res = await fetch('/api/ai/code-explainer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      })
      const data = await res.json()
      setExplanation(data)
    } catch (e) {
      console.error(e)
    } finally {
      setExplaining(false)
    }
  }

  const handleLoadFlashcards = async (selectedTopic?: string) => {
    const t = selectedTopic || topic
    setLoadingCards(true)
    setFlippedIndex(null)
    try {
      const res = await fetch('/api/ai/flashcards/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t })
      })
      const data = await res.json()
      setCards(data.cards || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCards(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          <span>Interactive AI Study Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          AI Code Explainer & <span className="gradient-text">Revision Deck</span>
        </h1>
        <p className="text-sm text-slate-500">
          Analyze complex algorithms, estimate Big-O complexity, and review core CS topics with flashcards.
        </p>

        {/* Subnav switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 mt-2">
          <button
            onClick={() => setActiveTool('explainer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTool === 'explainer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>AI Code Analyzer</span>
          </button>
          <button
            onClick={() => {
              setActiveTool('flashcards')
              if (cards.length === 0) handleLoadFlashcards('DBMS')
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTool === 'flashcards' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Smart Revision Cards</span>
          </button>
        </div>
      </div>

      {activeTool === 'explainer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Code Input */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Source Code Snippet</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript / TypeScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <textarea
              rows={12}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full text-xs font-mono bg-slate-900 text-cyan-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none leading-relaxed"
            />

            <button
              onClick={handleExplain}
              disabled={explaining}
              className="w-full gradient-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              {explaining ? <RotateCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
              <span>Explain Logic & Calculate Complexity</span>
            </button>
          </div>

          {/* Explanation Output */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Algorithmic Insights</span>
            </h3>

            {explanation ? (
              <div className="space-y-4 text-xs text-slate-600">
                {/* Complexity Pills */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="text-[10px] font-bold text-indigo-500 uppercase">Time Complexity</div>
                    <div className="text-xs font-black text-indigo-900 font-mono mt-0.5">{explanation.time_complexity}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                    <div className="text-[10px] font-bold text-cyan-500 uppercase">Space Complexity</div>
                    <div className="text-xs font-black text-cyan-900 font-mono mt-0.5">{explanation.space_complexity}</div>
                  </div>
                </div>

                {/* Key Points */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-700">Structural Findings:</span>
                  <ul className="space-y-1.5">
                    {explanation.points.map((p: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gotchas */}
                {explanation.gotchas.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-amber-900">⚠️ Boundary & Edge Case Checks:</span>
                    <ul className="space-y-1 text-[11px] text-amber-800">
                      {explanation.gotchas.map((g: string, i: number) => (
                        <li key={i}>• {g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Code className="w-8 h-8 text-slate-300" />
                <p className="text-xs">Click "Explain Logic" to generate instant time/space complexity calculations.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Flashcards Revision Deck */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['DBMS & SQL', 'Operating Systems', 'DSA & Trees', 'System Design', 'Networks'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTopic(t)
                  handleLoadFlashcards(t)
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  topic === t
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loadingCards ? (
            <div className="text-center py-12 text-slate-400 text-xs">Generating flashcards...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card, idx) => {
                const isFlipped = flippedIndex === idx
                return (
                  <div
                    key={idx}
                    onClick={() => setFlippedIndex(isFlipped ? null : idx)}
                    className={`cursor-pointer rounded-2xl p-5 border min-h-[160px] flex flex-col justify-between transition-all duration-300 ${
                      isFlipped
                        ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-700 shadow-xl'
                        : 'glass-card text-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-60">
                        <span>Card #{idx + 1}</span>
                        <span>{isFlipped ? 'Answer' : 'Question'}</span>
                      </div>
                      <div className="text-sm font-bold leading-snug">
                        {isFlipped ? card.back : card.front}
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold opacity-60 text-right">
                      {isFlipped ? 'Click to show question ↩' : 'Click to reveal answer 💡'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
