// TrainingJournal - Enhanced journal with progress tracking, technique library, and goals
import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, icons } from '../lib/icons'

type JournalTab = 'entries' | 'techniques' | 'progress' | 'goals' | 'sparring' | 'partners'

interface Technique {
  id: string
  name: string
  category: string
  discipline: string
  proficiency: 'learning' | 'practicing' | 'comfortable' | 'mastered'
  dateAdded: string
  notes: string
}

interface Goal {
  id: string
  title: string
  type: 'technique' | 'belt' | 'competition' | 'fitness' | 'custom'
  target: string
  deadline?: string
  completed: boolean
  progress: number
  createdAt: string
}

// NEW: Sparring & Partners
interface SparringRound {
  id: string
  date: string
  partner: string
  duration: number // minutes
  outcome: 'won' | 'lost' | 'draw' | 'training'
  submissionsGiven: string[]
  submissionsReceived: string[]
  tapsGiven: number
  tapsReceived: number
  intensity: number // 1-10
  notes: string
}

interface TrainingPartner {
  id: string
  name: string
  beltRank?: string
  weightClass?: string
  style?: string
  notes: string
  totalRounds: number
  record: { wins: number; losses: number; draws: number }
  lastTrainedDate?: string
}

export default function TrainingJournal() {
  const { session, users, getJournals } = useStore()
  const user = users.find(u => u.id === session.userId)
  const [activeTab, setActiveTab] = useState<JournalTab>('entries')
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('')
  const [injuredOnly, setInjuredOnly] = useState(false)
  const [minIntensity, setMinIntensity] = useState(0)
  const [showNewTechnique, setShowNewTechnique] = useState(false)
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showNewSparring, setShowNewSparring] = useState(false)
  const [showNewPartner, setShowNewPartner] = useState(false)

  // Load techniques and goals from localStorage
  const [techniques, setTechniques] = useState<Technique[]>(() => {
    const stored = localStorage.getItem(`techniques_${session.userId}`)
    return stored ? JSON.parse(stored) : []
  })

  const [goals, setGoals] = useState<Goal[]>(() => {
    const stored = localStorage.getItem(`goals_${session.userId}`)
    return stored ? JSON.parse(stored) : []
  })

  // NEW: Sparring rounds & partners from localStorage
  const [sparringRounds, setSparringRounds] = useState<SparringRound[]>(() => {
    const stored = localStorage.getItem(`sparringRounds_${session.userId}`)
    return stored ? JSON.parse(stored) : []
  })

  const [partners, setPartners] = useState<TrainingPartner[]>(() => {
    const stored = localStorage.getItem(`trainingPartners_${session.userId}`)
    return stored ? JSON.parse(stored) : []
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">
          <Link to="/login" className="text-[var(--color-primary)] hover:underline">
            Login
          </Link>{' '}
          to access your journal
        </div>
      </div>
    )
  }

  const journals = getJournals(session.userId, selectedDiscipline ? { art: selectedDiscipline } : {})

  // Calculate stats
  const stats = useMemo(() => {
    const totalHours = journals.reduce((sum, j) => sum + (j.journalMeta?.durationMin || 0), 0) / 60
    const disciplines = [...new Set(journals.map(j => j.journalMeta?.art).filter(Boolean))]
    const techniqueCount = techniques.length
    const completedGoals = goals.filter(g => g.completed).length

    const energyVals = journals.map(j => j.journalMeta?.energy).filter(v => typeof v === 'number') as number[]
    const intensityVals = journals.map(j => j.journalMeta?.intensity).filter(v => typeof v === 'number') as number[]
    const recoveryVals = journals.map(j => j.journalMeta?.recovery).filter(v => typeof v === 'number') as number[]
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)

    return { 
      totalHours, disciplines, techniqueCount, completedGoals, totalGoals: goals.length,
      avgEnergy: avg(energyVals), avgIntensity: avg(intensityVals), avgRecovery: avg(recoveryVals)
    }
  }, [journals, techniques, goals])

  const saveTechniques = (newTechniques: Technique[]) => {
    setTechniques(newTechniques)
    localStorage.setItem(`techniques_${session.userId}`, JSON.stringify(newTechniques))
  }

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals)
    localStorage.setItem(`goals_${session.userId}`, JSON.stringify(newGoals))
  }

  const saveSparringRounds = (newRounds: SparringRound[]) => {
    setSparringRounds(newRounds)
    localStorage.setItem(`sparringRounds_${session.userId}`, JSON.stringify(newRounds))
  }

  const savePartners = (newPartners: TrainingPartner[]) => {
    setPartners(newPartners)
    localStorage.setItem(`trainingPartners_${session.userId}`, JSON.stringify(newPartners))
  }

  const addTechnique = (technique: Omit<Technique, 'id' | 'dateAdded'>) => {
    const newTechnique: Technique = {
      ...technique,
      id: `tech_${Date.now()}`,
      dateAdded: new Date().toISOString(),
    }
    saveTechniques([...techniques, newTechnique])
    setShowNewTechnique(false)
  }

  const updateTechniqueProficiency = (id: string, proficiency: Technique['proficiency']) => {
    saveTechniques(techniques.map(t => (t.id === id ? { ...t, proficiency } : t)))
  }

  const deleteTechnique = (id: string) => {
    if (confirm('Delete this technique?')) {
      saveTechniques(techniques.filter(t => t.id !== id))
    }
  }

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'progress'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      completed: false,
      progress: 0,
    }
    saveGoals([...goals, newGoal])
    setShowNewGoal(false)
  }

  const updateGoalProgress = (id: string, progress: number) => {
    saveGoals(
      goals.map(g =>
        g.id === id ? { ...g, progress, completed: progress >= 100 } : g
      )
    )
  }

  const deleteGoal = (id: string) => {
    if (confirm('Delete this goal?')) {
      saveGoals(goals.filter(g => g.id !== id))
    }
  }

  // NEW: Create or update partner helper
  const upsertPartnerOnRound = (round: SparringRound) => {
    const existing = partners.find(p => p.name.toLowerCase() === round.partner.toLowerCase())
    if (!existing) {
      const newPartner: TrainingPartner = {
        id: `partner_${Date.now()}`,
        name: round.partner,
        beltRank: '',
        weightClass: '',
        style: '',
        notes: '',
        totalRounds: 1,
        record: {
          wins: round.outcome === 'won' ? 1 : 0,
          losses: round.outcome === 'lost' ? 1 : 0,
          draws: round.outcome === 'draw' ? 1 : 0,
        },
        lastTrainedDate: round.date,
      }
      savePartners([...partners, newPartner])
    } else {
      const updated = partners.map(p => {
        if (p.id !== existing.id) return p
        const record = { ...p.record }
        if (round.outcome === 'won') record.wins += 1
        else if (round.outcome === 'lost') record.losses += 1
        else if (round.outcome === 'draw') record.draws += 1
        return {
          ...p,
          totalRounds: p.totalRounds + 1,
          record,
          lastTrainedDate: round.date,
        }
      })
      savePartners(updated)
    }
  }

  const addSparringRound = (roundInput: Omit<SparringRound, 'id'>) => {
    const newRound: SparringRound = { id: `round_${Date.now()}`, ...roundInput }
    const newRounds = [newRound, ...sparringRounds]
    saveSparringRounds(newRounds)
    upsertPartnerOnRound(newRound)
    setShowNewSparring(false)
  }

  const addPartner = (partnerInput: Omit<TrainingPartner, 'id' | 'totalRounds' | 'record' | 'lastTrainedDate'>) => {
    const newPartner: TrainingPartner = {
      id: `partner_${Date.now()}`,
      totalRounds: 0,
      record: { wins: 0, losses: 0, draws: 0 },
      lastTrainedDate: undefined,
      ...partnerInput,
    }
    savePartners([...partners, newPartner])
    setShowNewPartner(false)
  }

  const tabs = [
    { id: 'entries' as JournalTab, label: 'Journal Entries', icon: icons.book, count: journals.length },
    { id: 'sparring' as JournalTab, label: 'Sparring', icon: icons.users, count: sparringRounds.length },
    { id: 'techniques' as JournalTab, label: 'Technique Library', icon: icons.target, count: techniques.length },
    { id: 'partners' as JournalTab, label: 'Partners', icon: icons.userGroup, count: partners.length },
    { id: 'progress' as JournalTab, label: 'Progress', icon: icons.chart, count: null },
    { id: 'goals' as JournalTab, label: 'Goals', icon: icons.trophy, count: `${stats.completedGoals}/${stats.totalGoals}` },
  ]

  const proficiencyColors = {
    learning: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Learning' },
    practicing: { bg: 'bg-[var(--accent-amber)]/10', text: '[color:var(--accent-amber)]', label: 'Practicing' },
    comfortable: { bg: 'bg-[var(--accent-teal)]/10', text: '[color:var(--accent-teal)]', label: 'Comfortable' },
    mastered: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Mastered' },
  }

  const goalTypeIcons = {
    technique: icons.target,
    belt: icons.medal,
    competition: icons.trophy,
    fitness: icons.dumbbell,
    custom: icons.checkCircle,
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-3">
                <Icon icon={icons.book} size={32} />
                Training Journal
              </h1>
              <p className="text-[var(--color-text-muted)] mt-1">
                Track your martial arts journey and progress
              </p>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
            >
              <Icon icon={icons.plus} size={18} />
              New Entry
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={icons.clock} size={16} className="[color:var(--accent-teal)]" />
                <span className="text-sm text-[var(--color-text-muted)]">Training Hours</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.totalHours.toFixed(1)}</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={icons.book} size={16} className="text-purple-500" />
                <span className="text-sm text-[var(--color-text-muted)]">Entries</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{journals.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={icons.target} size={16} className="text-green-500" />
                <span className="text-sm text-[var(--color-text-muted)]">Techniques</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.techniqueCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={icons.trophy} size={16} className="[color:var(--accent-amber)]" />
                <span className="text-sm text-[var(--color-text-muted)]">Goals</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {stats.completedGoals}/{stats.totalGoals}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
              }`}
            >
              <Icon icon={tab.icon} size={18} />
              {tab.label}
              {tab.count !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-[var(--color-surface)]/20 text-[var(--color-surface)]'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {/* Sparring Tab - NEW */}
          {activeTab === 'sparring' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Sparring Log</h2>
                <button
                  onClick={() => setShowNewSparring(true)}
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                >
                  <Icon icon={icons.plus} size={18} />
                  Log Sparring
                </button>
              </div>

              {/* New Sparring Round Form */}
              {showNewSparring && (
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-primary)]">
                  <h3 className="font-bold text-[var(--color-text)] mb-4">Log Sparring Round</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      const submissionsGiven = (fd.get('subsGiven') as string || '')
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean)
                      const submissionsReceived = (fd.get('subsReceived') as string || '')
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean)
                      addSparringRound({
                        date: (fd.get('date') as string) || new Date().toISOString(),
                        partner: fd.get('partner') as string,
                        duration: parseInt(fd.get('duration') as string) || 5,
                        outcome: (fd.get('outcome') as 'won' | 'lost' | 'draw' | 'training') || 'training',
                        submissionsGiven,
                        submissionsReceived,
                        tapsGiven: parseInt(fd.get('tapsGiven') as string) || submissionsGiven.length,
                        tapsReceived: parseInt(fd.get('tapsReceived') as string) || submissionsReceived.length,
                        intensity: parseInt(fd.get('intensity') as string) || 5,
                        notes: (fd.get('notes') as string) || '',
                      })
                      e.currentTarget.reset()
                    }}
                    className="space-y-3"
                  >
                    <div className="grid md:grid-cols-3 gap-3">
                      <input
                        type="date"
                        name="date"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                      />
                      <input
                        type="text"
                        name="partner"
                        placeholder="Partner name"
                        required
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                      />
                      <input
                        type="number"
                        name="duration"
                        placeholder="Duration (min)"
                        min={1}
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <select
                        name="outcome"
                        defaultValue="training"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                      >
                        <option value="training">Training</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                        <option value="draw">Draw</option>
                      </select>
                      <input
                        type="number"
                        name="intensity"
                        min={1}
                        max={10}
                        placeholder="Intensity (1-10)"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          name="tapsGiven"
                          min={0}
                          placeholder="Taps Given"
                          className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                        />
                        <input
                          type="number"
                          name="tapsReceived"
                          min={0}
                          placeholder="Taps Received"
                          className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="subsGiven"
                        placeholder="Submissions given (comma-separated)"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                      />
                      <input
                        type="text"
                        name="subsReceived"
                        placeholder="Submissions received (comma-separated)"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                      />
                    </div>
                    <textarea
                      name="notes"
                      placeholder="Notes (optional)"
                      rows={2}
                      className="w-full px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] resize-none"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white">
                        Save Round
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewSparring(false)}
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Summary */}
              <div className="grid md:grid-cols-3 gap-4 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Total Rounds</p>
                  <p className="text-3xl font-bold text-[var(--color-text)]">{sparringRounds.length}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Subs Given</p>
                  <p className="text-3xl font-bold text-green-500">
                    {sparringRounds.reduce((sum, r) => sum + (r.tapsGiven || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Subs Received</p>
                  <p className="text-3xl font-bold text-red-500">
                    {sparringRounds.reduce((sum, r) => sum + (r.tapsReceived || 0), 0)}
                  </p>
                </div>
              </div>

              {/* List */}
              <div className="space-y-4">
                {sparringRounds.length === 0 ? (
                  <div className="text-center py-12 text-[var(--color-text-muted)]">
                    <Icon icon={icons.users} size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No sparring rounds logged yet</p>
                    <p className="text-sm mt-2">Start tracking your rolls and matches!</p>
                  </div>
                ) : (
                  sparringRounds
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(round => (
                      <div
                        key={round.id}
                        className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-[var(--color-text)]">vs {round.partner}</h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  round.outcome === 'won'
                                    ? 'bg-green-500/10 text-green-500'
                                    : round.outcome === 'lost'
                                    ? 'bg-red-500/10 text-red-500'
                                    : 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]'
                                }`}
                              >
                                {round.outcome.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {new Date(round.date).toLocaleDateString()} • {round.duration} minutes
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-[var(--color-text-muted)] mb-1">Intensity</p>
                            <div className="flex gap-1">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-6 rounded ${
                                    i < round.intensity ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          {round.submissionsGiven?.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-green-500 mb-2">
                                ✓ Submissions Given ({round.tapsGiven})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {round.submissionsGiven.map((sub, idx) => (
                                  <span key={idx} className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs">
                                    {sub}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {round.submissionsReceived?.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-red-500 mb-2">
                                ✗ Submissions Received ({round.tapsReceived})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {round.submissionsReceived.map((sub, idx) => (
                                  <span key={idx} className="px-2 py-1 rounded bg-red-500/10 text-red-500 text-xs">
                                    {sub}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {round.notes && (
                          <div className="pt-4 border-t border-[var(--color-border)]">
                            <p className="text-sm text-[var(--color-text)]">{round.notes}</p>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
          {/* Journal Entries Tab */}
          {activeTab === 'entries' && (
            <div className="space-y-4">
              {/* Discipline Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedDiscipline('')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                    !selectedDiscipline
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  All Disciplines
                </button>
                {stats.disciplines.map(discipline => (
                  <button
                    key={discipline}
                    onClick={() => setSelectedDiscipline(discipline)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                      selectedDiscipline === discipline
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {discipline}
                  </button>
                ))}
              </div>

              {/* Advanced Filters */}
              <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                  <input type="checkbox" checked={injuredOnly} onChange={(e)=>setInjuredOnly(e.target.checked)} />
                  Injured only
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-text-muted)]">Min intensity</span>
                  <input type="range" min={0} max={10} value={minIntensity} onChange={(e)=>setMinIntensity(parseInt(e.target.value))} />
                  <span className="text-sm text-[var(--color-text)] w-5 text-right">{minIntensity}</span>
                </div>
              </div>

              {(() => {
                const filtered = journals.filter(j => {
                  if (injuredOnly && !j.journalMeta?.injured) return false
                  if (minIntensity > 0 && (j.journalMeta?.intensity ?? 0) < minIntensity) return false
                  return true
                })
                return filtered
              })().length === 0 ? (
                <div className="text-center py-16">
                  <Icon icon={icons.book} size={64} className="mx-auto text-[var(--color-text-muted)] opacity-20 mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No journal entries yet</h3>
                  <p className="text-[var(--color-text-muted)] mb-4">
                    Start documenting your training journey
                  </p>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
                  >
                    <Icon icon={icons.plus} size={18} />
                    Create First Entry
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {journals
                    .filter(j => {
                      if (injuredOnly && !j.journalMeta?.injured) return false
                      if (minIntensity > 0 && (j.journalMeta?.intensity ?? 0) < minIntensity) return false
                      return true
                    })
                    .map(journal => (
                    <div
                      key={journal.id}
                      className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">
                            {journal.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                            <span>{new Date(journal.createdAt).toLocaleDateString()}</span>
                            {journal.journalMeta?.art && (
                              <>
                                <span>•</span>
                                <span>{journal.journalMeta.art}</span>
                              </>
                            )}
                            {journal.journalMeta?.sessionType && (
                              <>
                                <span>•</span>
                                <span>{journal.journalMeta.sessionType}</span>
                              </>
                            )}
                            {journal.journalMeta?.durationMin && (
                              <>
                                <span>•</span>
                                <span>{journal.journalMeta.durationMin} min</span>
                              </>
                            )}
                          </div>
                          {/* New: Vital chips */}
                          {(journal.journalMeta?.energy || journal.journalMeta?.intensity || journal.journalMeta?.recovery || journal.journalMeta?.injured) && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              {journal.journalMeta?.energy && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)]">
                                  <Icon icon={icons.bolt} size={10} className="[color:var(--accent-teal)]" />
                                  Energy {journal.journalMeta.energy}
                                </span>
                              )}
                              {journal.journalMeta?.intensity && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)]">
                                  <Icon icon={icons.fire} size={10} className="text-red-500" />
                                  Intensity {journal.journalMeta.intensity}
                                </span>
                              )}
                              {journal.journalMeta?.recovery && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)]">
                                  <Icon icon={icons.heart} size={10} className="text-pink-500" />
                                  Recovery {journal.journalMeta.recovery}
                                </span>
                              )}
                              {journal.journalMeta?.injured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                                  <Icon icon={icons.close} size={10} />
                                  Injured
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {journal.journalMeta?.mood && (
                          <span className="px-3 py-1 rounded-full bg-[var(--color-bg)] text-xs font-medium capitalize">
                            {journal.journalMeta.mood}
                          </span>
                        )}
                      </div>

                      <p className="text-[var(--color-text)] mb-3 line-clamp-2">{journal.body}</p>

                      {journal.journalMeta?.techniques && journal.journalMeta.techniques.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {journal.journalMeta.techniques.map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Technique Library Tab */}
          {activeTab === 'techniques' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--color-text-muted)]">
                  {techniques.length} {techniques.length === 1 ? 'technique' : 'techniques'} tracked
                </p>
                <button
                  onClick={() => setShowNewTechnique(true)}
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                >
                  <Icon icon={icons.plus} size={18} />
                  Add Technique
                </button>
              </div>

              {/* New Technique Form */}
              {showNewTechnique && (
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-primary)]">
                  <h3 className="font-bold text-[var(--color-text)] mb-4">Add New Technique</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      addTechnique({
                        name: formData.get('name') as string,
                        category: formData.get('category') as string,
                        discipline: formData.get('discipline') as string,
                        proficiency: formData.get('proficiency') as Technique['proficiency'],
                        notes: formData.get('notes') as string,
                      })
                      e.currentTarget.reset()
                    }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Technique name"
                      required
                      className="w-full px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="category"
                        placeholder="Category (e.g., Guard, Submissions)"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                      <input
                        type="text"
                        name="discipline"
                        placeholder="Discipline (e.g., BJJ)"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <select
                      name="proficiency"
                      defaultValue="learning"
                      className="w-full px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="learning">Learning</option>
                      <option value="practicing">Practicing</option>
                      <option value="comfortable">Comfortable</option>
                      <option value="mastered">Mastered</option>
                    </select>
                    <textarea
                      name="notes"
                      placeholder="Notes (optional)"
                      rows={2}
                      className="w-full px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity font-medium"
                      >
                        Add Technique
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewTechnique(false)}
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {techniques.length === 0 ? (
                <div className="text-center py-16">
                  <Icon icon={icons.target} size={64} className="mx-auto text-[var(--color-text-muted)] opacity-20 mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No techniques yet</h3>
                  <p className="text-[var(--color-text-muted)]">
                    Start building your technique library
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {techniques.map(tech => (
                    <div
                      key={tech.id}
                      className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-[var(--color-text)] mb-1">{tech.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                            {tech.discipline && <span>{tech.discipline}</span>}
                            {tech.discipline && tech.category && <span>•</span>}
                            {tech.category && <span>{tech.category}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTechnique(tech.id)}
                          className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Icon icon={icons.trash} size={16} className="text-[var(--color-text-muted)] hover:text-red-500" />
                        </button>
                      </div>

                      {tech.notes && (
                        <p className="text-sm text-[var(--color-text-muted)] mb-3">{tech.notes}</p>
                      )}

                      <div className="flex gap-2">
                        {(['learning', 'practicing', 'comfortable', 'mastered'] as const).map(level => {
                          const config = proficiencyColors[level]
                          return (
                            <button
                              key={level}
                              onClick={() => updateTechniqueProficiency(tech.id, level)}
                              className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                                tech.proficiency === level
                                  ? `${config.bg} ${config.text}`
                                  : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                              }`}
                            >
                              {config.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Partners Tab - NEW */}
          {activeTab === 'partners' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Training Partners</h2>
                <button
                  onClick={() => setShowNewPartner(true)}
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                >
                  <Icon icon={icons.plus} size={18} />
                  Add Partner
                </button>
              </div>

              {/* New Partner Form */}
              {showNewPartner && (
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-primary)]">
                  <h3 className="font-bold text-[var(--color-text)] mb-4">Add Training Partner</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      addPartner({
                        name: fd.get('name') as string,
                        beltRank: (fd.get('beltRank') as string) || undefined,
                        weightClass: (fd.get('weightClass') as string) || undefined,
                        style: (fd.get('style') as string) || undefined,
                        notes: (fd.get('notes') as string) || '',
                      })
                      e.currentTarget.reset()
                    }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      required
                      className="w-full px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                    />
                    <div className="grid md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        name="beltRank"
                        placeholder="Belt/Rank (optional)"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                      />
                      <input
                        type="text"
                        name="weightClass"
                        placeholder="Weight Class"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                      />
                      <input
                        type="text"
                        name="style"
                        placeholder="Style (e.g., BJJ, Wrestling)"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]"
                      />
                    </div>
                    <textarea
                      name="notes"
                      placeholder="Notes (optional)"
                      rows={2}
                      className="w-full px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] resize-none"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white">
                        Save Partner
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewPartner(false)}
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-[var(--color-text-muted)]">
                    <Icon icon={icons.userGroup} size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No training partners added yet</p>
                    <p className="text-sm mt-2">Keep track of who you train with!</p>
                  </div>
                ) : (
                  partners.map(partner => (
                    <div
                      key={partner.id}
                      className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">{partner.name}</h3>
                          {(partner.beltRank || partner.weightClass) && (
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {partner.beltRank}
                              {partner.weightClass && ` • ${partner.weightClass}`}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[var(--color-text)]">{partner.totalRounds}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">rounds</p>
                        </div>
                      </div>

                      <div className="flex gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-[var(--color-text-muted)]">Record</p>
                          <p className="font-semibold text-[var(--color-text)]">
                            {partner.record.wins}W-{partner.record.losses}L-{partner.record.draws}D
                          </p>
                        </div>
                        {partner.lastTrainedDate && (
                          <div>
                            <p className="text-[var(--color-text-muted)]">Last Trained</p>
                            <p className="font-semibold text-[var(--color-text)]">
                              {new Date(partner.lastTrainedDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {partner.notes && (
                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">{partner.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-text)] mb-4">Training Overview</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)] mb-1">Total Training Time</p>
                    <p className="text-3xl font-bold text-[var(--color-text)]">{stats.totalHours.toFixed(1)}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)] mb-1">Journal Entries</p>
                    <p className="text-3xl font-bold text-[var(--color-text)]">{journals.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)] mb-1">Disciplines Trained</p>
                    <p className="text-3xl font-bold text-[var(--color-text)]">{stats.disciplines.length}</p>
                  </div>
                </div>
              </div>

              {/* Vitals Summary */}
              <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-text)] mb-4">Session Vitals</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: 'Average Energy', value: stats.avgEnergy, color: '[color:var(--accent-teal)]', icon: icons.bolt },
                    { label: 'Average Intensity', value: stats.avgIntensity, color: 'text-red-500', icon: icons.fire },
                    { label: 'Average Recovery', value: stats.avgRecovery, color: 'text-pink-500', icon: icons.heart },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon={item.icon} size={14} className={item.color} />
                        <span className="text-sm text-[var(--color-text-muted)]">{item.label}</span>
                        <span className="ml-auto text-sm text-[var(--color-text)]">{item.value ? item.value.toFixed(1) : '-'}/10</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--color-bg)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-primary)]"
                          style={{ width: `${Math.min(100, (item.value || 0) * 10)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-Session-Type Breakdown */}
              {(() => {
                const sessionTypes = [...new Set(journals.map(j => j.journalMeta?.sessionType).filter(Boolean))] as string[]
                if (sessionTypes.length === 0) return null

                const bySessionType = sessionTypes.map(type => {
                  const sessions = journals.filter(j => j.journalMeta?.sessionType === type)
                  const energyVals = sessions.map(j => j.journalMeta?.energy).filter(v => typeof v === 'number') as number[]
                  const intensityVals = sessions.map(j => j.journalMeta?.intensity).filter(v => typeof v === 'number') as number[]
                  const recoveryVals = sessions.map(j => j.journalMeta?.recovery).filter(v => typeof v === 'number') as number[]
                  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)

                  return {
                    type,
                    count: sessions.length,
                    avgEnergy: avg(energyVals),
                    avgIntensity: avg(intensityVals),
                    avgRecovery: avg(recoveryVals),
                  }
                }).sort((a, b) => b.count - a.count)

                return (
                  <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <h3 className="font-bold text-[var(--color-text)] mb-4">By Session Type</h3>
                    <div className="space-y-4">
                      {bySessionType.map((session, idx) => (
                        <div key={idx} className="pb-4 border-b border-[var(--color-border)] last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-[var(--color-text)]">{session.type}</h4>
                            <span className="text-xs text-[var(--color-text-muted)]">{session.count} sessions</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <Icon icon={icons.bolt} size={10} className="[color:var(--accent-teal)]" />
                                <span className="text-[var(--color-text-muted)]">Energy</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg)] overflow-hidden">
                                  <div
                                    className="h-full bg-[var(--accent-teal)]"
                                    style={{ width: `${Math.min(100, (session.avgEnergy || 0) * 10)}%` }}
                                  />
                                </div>
                                <span className="text-[var(--color-text)] w-8 text-right">{session.avgEnergy ? session.avgEnergy.toFixed(1) : '-'}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <Icon icon={icons.fire} size={10} className="text-red-500" />
                                <span className="text-[var(--color-text-muted)]">Intensity</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg)] overflow-hidden">
                                  <div
                                    className="h-full bg-red-500"
                                    style={{ width: `${Math.min(100, (session.avgIntensity || 0) * 10)}%` }}
                                  />
                                </div>
                                <span className="text-[var(--color-text)] w-8 text-right">{session.avgIntensity ? session.avgIntensity.toFixed(1) : '-'}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <Icon icon={icons.heart} size={10} className="text-pink-500" />
                                <span className="text-[var(--color-text-muted)]">Recovery</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg)] overflow-hidden">
                                  <div
                                    className="h-full bg-pink-500"
                                    style={{ width: `${Math.min(100, (session.avgRecovery || 0) * 10)}%` }}
                                  />
                                </div>
                                <span className="text-[var(--color-text)] w-8 text-right">{session.avgRecovery ? session.avgRecovery.toFixed(1) : '-'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-text)] mb-4">Technique Proficiency</h3>
                {techniques.length === 0 ? (
                  <p className="text-[var(--color-text-muted)] text-center py-8">
                    No techniques tracked yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(proficiencyColors).map(([level, config]) => {
                      const count = techniques.filter(t => t.proficiency === level).length
                      const percentage = (count / techniques.length) * 100
                      return (
                        <div key={level}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[var(--color-text)] capitalize">{config.label}</span>
                            <span className="text-sm text-[var(--color-text-muted)]">
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[var(--color-bg)] overflow-hidden">
                            <div
                              className={`h-full ${config.bg.replace('/10', '')}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--color-text-muted)]">
                  {stats.completedGoals} of {stats.totalGoals} goals completed
                </p>
                <button
                  onClick={() => setShowNewGoal(true)}
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                >
                  <Icon icon={icons.plus} size={18} />
                  Add Goal
                </button>
              </div>

              {/* New Goal Form */}
              {showNewGoal && (
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-primary)]">
                  <h3 className="font-bold text-[var(--color-text)] mb-4">Add New Goal</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      addGoal({
                        title: formData.get('title') as string,
                        type: formData.get('type') as Goal['type'],
                        target: formData.get('target') as string,
                        deadline: formData.get('deadline') as string || undefined,
                      })
                      e.currentTarget.reset()
                    }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      name="title"
                      placeholder="Goal title"
                      required
                      className="w-full px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        name="type"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      >
                        <option value="technique">Technique Goal</option>
                        <option value="belt">Belt Promotion</option>
                        <option value="competition">Competition</option>
                        <option value="fitness">Fitness</option>
                        <option value="custom">Custom</option>
                      </select>
                      <input
                        type="date"
                        name="deadline"
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <textarea
                      name="target"
                      placeholder="What do you want to achieve?"
                      required
                      rows={2}
                      className="w-full px-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity font-medium"
                      >
                        Add Goal
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewGoal(false)}
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {goals.length === 0 ? (
                <div className="text-center py-16">
                  <Icon icon={icons.trophy} size={64} className="mx-auto text-[var(--color-text-muted)] opacity-20 mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No goals yet</h3>
                  <p className="text-[var(--color-text-muted)]">
                    Set goals to track your progress
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map(goal => (
                    <div
                      key={goal.id}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        goal.completed
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon
                            icon={goalTypeIcons[goal.type]}
                            size={24}
                            className={goal.completed ? 'text-green-500' : 'text-[var(--color-primary)]'}
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-[var(--color-text)] mb-1">{goal.title}</h4>
                            <p className="text-sm text-[var(--color-text-muted)] mb-2">{goal.target}</p>
                            {goal.deadline && (
                              <p className="text-xs text-[var(--color-text-muted)]">
                                Deadline: {new Date(goal.deadline).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Icon icon={icons.trash} size={16} className="text-[var(--color-text-muted)] hover:text-red-500" />
                        </button>
                      </div>

                      {!goal.completed && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[var(--color-text)]">Progress</span>
                            <span className="text-sm text-[var(--color-text-muted)]">{goal.progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-[var(--color-bg)] overflow-hidden mb-3">
                            <div
                              className="h-full bg-[var(--color-primary)]"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={goal.progress}
                            onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      )}

                      {goal.completed && (
                        <div className="flex items-center gap-2 text-green-500 font-medium">
                          <Icon icon={icons.checkCircle} size={20} />
                          <span>Goal Completed!</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
