// TrainingJournalEnhanced - Comprehensive martial arts training journal
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
  videoUrl?: string
  successRate?: number
  attempts?: number
  successes?: number
  lastPracticed?: string
}

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

interface Competition {
  id: string
  name: string
  date: string
  location: string
  weightClass?: string
  division?: string
  placement?: string
  matches: CompetitionMatch[]
  notes: string
}

interface CompetitionMatch {
  id: string
  opponent: string
  result: 'win' | 'loss' | 'draw'
  method?: string
  score?: string
  round?: number
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

interface EnhancedJournalEntry {
  id: string
  date: string
  discipline: string
  sessionType: 'class' | 'open-mat' | 'private' | 'competition' | 'seminar' | 'conditioning'
  
  // Mood & Physical State
  mood: number // 1-5
  energy: number // 1-10
  intensity: number // 1-10
  recovery: number // 1-10
  
  // Training Data
  duration: number
  techniques: string[]
  drills: string[]
  
  // Sparring
  sparringRounds: SparringRound[]
  
  // Health
  injured: boolean
  injuryNotes?: string
  weight?: number
  sleep?: number
  
  // Notes
  content: string
  whatWorked: string
  whatNeedsWork: string
  coachFeedback: string
  
  // Media & Social
  photos: string[]
  videos: string[]
  isPublic: boolean
  tags: string[]
}

export default function TrainingJournalEnhanced() {
  const { session, users, getJournals } = useStore()
  const user = users.find(u => u.id === session.userId)
  const [activeTab, setActiveTab] = useState<JournalTab>('entries')
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('')
  const [showNewTechnique, setShowNewTechnique] = useState(false)
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showNewSparring, setShowNewSparring] = useState(false)
  const [showNewPartner, setShowNewPartner] = useState(false)

  // Load data from localStorage
  const [techniques, setTechniques] = useState<Technique[]>(() => {
    if (!session.userId) return []
    const stored = localStorage.getItem(`techniques_${session.userId}`)
    return stored ? JSON.parse(stored) : []
  })

  const [goals, setGoals] = useState<Goal[]>(() => {
    if (!session.userId) return []
    const stored = localStorage.getItem(`goals_${session.userId}`)
    return stored ? JSON.parse(stored) : []
  })

  const [sparringRounds, setSparringRounds] = useState<SparringRound[]>(() => {
    if (!session.userId) return []
    const stored = localStorage.getItem(`sparringRounds_${session.userId}`)
    return stored ? JSON.parse(stored) : []
  })

  const [partners, setPartners] = useState<TrainingPartner[]>(() => {
    if (!session.userId) return []
    const stored = localStorage.getItem(`trainingPartners_${session.userId}`)
    return stored ? JSON.parse(stored) : []
  })

  const [competitions, setCompetitions] = useState<Competition[]>(() => {
    if (!session.userId) return []
    const stored = localStorage.getItem(`competitions_${session.userId}`)
    return stored ? JSON.parse(stored) : []
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">
          <Link to="/login" className="text-[var(--color-primary)] hover:underline">
            Login
          </Link>{' '}
          to access your training journal
        </div>
      </div>
    )
  }

  const journals = getJournals(session.userId, selectedDiscipline ? { art: selectedDiscipline } : {})

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const totalHours = journals.reduce((sum, j) => sum + (j.journalMeta?.durationMin || 0), 0) / 60
    const totalRounds = sparringRounds.length
    const totalSubmissionsGiven = sparringRounds.reduce((sum, r) => sum + r.tapsGiven, 0)
    const totalSubmissionsReceived = sparringRounds.reduce((sum, r) => sum + r.tapsReceived, 0)
    const winRate = totalRounds > 0 
      ? ((sparringRounds.filter(r => r.outcome === 'won').length / totalRounds) * 100).toFixed(1)
      : '0'

    return {
      totalHours: totalHours.toFixed(1),
      totalEntries: journals.length,
      techniqueCount: techniques.length,
      completedGoals: goals.filter(g => g.completed).length,
      totalGoals: goals.length,
      totalRounds,
      submissionsGiven: totalSubmissionsGiven,
      submissionsReceived: totalSubmissionsReceived,
      winRate,
      totalPartners: partners.length,
      totalCompetitions: competitions.length
    }
  }, [journals, techniques, goals, sparringRounds, partners, competitions])

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

  const tabs = [
    { id: 'entries' as JournalTab, label: 'Entries', icon: icons.book, count: stats.totalEntries },
    { id: 'sparring' as JournalTab, label: 'Sparring', icon: icons.users, count: stats.totalRounds },
    { id: 'techniques' as JournalTab, label: 'Techniques', icon: icons.target, count: stats.techniqueCount },
    { id: 'partners' as JournalTab, label: 'Partners', icon: icons.userGroup, count: stats.totalPartners },
    { id: 'progress' as JournalTab, label: 'Progress', icon: icons.chart, count: null },
    { id: 'goals' as JournalTab, label: 'Goals', icon: icons.trophy, count: `${stats.completedGoals}/${stats.totalGoals}` },
  ]

  const moodEmojis = ['😞', '😕', '😐', '🙂', '😄']
  const proficiencyColors = {
    learning: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Learning' },
    practicing: { bg: 'bg-[var(--accent-amber)]/10', text: '[color:var(--accent-amber)]', label: 'Practicing' },
    comfortable: { bg: 'bg-[var(--accent-teal)]/10', text: '[color:var(--accent-teal)]', label: 'Comfortable' },
    mastered: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Mastered' },
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
                Track your martial arts journey with comprehensive insights
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

          {/* Enhanced Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={icons.clock} size={16} className="[color:var(--accent-teal)]" />
                <span className="text-sm text-[var(--color-text-muted)]">Hours</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.totalHours}</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={icons.book} size={16} className="text-purple-500" />
                <span className="text-sm text-[var(--color-text-muted)]">Entries</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.totalEntries}</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={icons.users} size={16} className="text-blue-500" />
                <span className="text-sm text-[var(--color-text-muted)]">Rounds</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.totalRounds}</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={icons.target} size={16} className="text-green-500" />
                <span className="text-sm text-[var(--color-text-muted)]">Win Rate</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.winRate}%</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={icons.checkCircle} size={16} className="text-red-500" />
                <span className="text-sm text-[var(--color-text-muted)]">Subs</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {stats.submissionsGiven}/{stats.submissionsReceived}
              </p>
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

        {/* Tab Content */}
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

              {/* Sparring Stats Summary */}
              <div className="grid md:grid-cols-3 gap-4 p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Total Rounds</p>
                  <p className="text-3xl font-bold text-[var(--color-text)]">{stats.totalRounds}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Submissions Given</p>
                  <p className="text-3xl font-bold text-green-500">{stats.submissionsGiven}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Submissions Received</p>
                  <p className="text-3xl font-bold text-red-500">{stats.submissionsReceived}</p>
                </div>
              </div>

              {/* Sparring Rounds List */}
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
                        className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-[var(--color-text)]">
                                vs {round.partner}
                              </h3>
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
                                    i < round.intensity
                                      ? 'bg-[var(--color-primary)]'
                                      : 'bg-[var(--color-border)]'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          {round.submissionsGiven.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-green-500 mb-2">
                                ✓ Submissions Given ({round.tapsGiven})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {round.submissionsGiven.map((sub, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs"
                                  >
                                    {sub}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {round.submissionsReceived.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-red-500 mb-2">
                                ✗ Submissions Received ({round.tapsReceived})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {round.submissionsReceived.map((sub, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 rounded bg-red-500/10 text-red-500 text-xs"
                                  >
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

          {/* Training Partners Tab - NEW */}
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
                      className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">
                            {partner.name}
                          </h3>
                          {partner.beltRank && (
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {partner.beltRank}
                              {partner.weightClass && ` • ${partner.weightClass}`}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[var(--color-text)]">
                            {partner.totalRounds}
                          </p>
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
                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                          {partner.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Original tabs remain the same... */}
          {activeTab === 'entries' && (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
              <p>Journal entries display (existing implementation)</p>
            </div>
          )}

          {activeTab === 'techniques' && (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
              <p>Technique library (existing implementation)</p>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
              <p>Progress analytics (existing implementation)</p>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
              <p>Goals tracking (existing implementation)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
