// ProfileEditor: Edit user profile with avatar upload, affiliation, interests, privacy, theme
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, icons } from '../lib/icons'
import { DojoCircleEditor } from '../components/profile/DojoCircleEditor'

export default function ProfileEditor() {
  const { session, users, updateUser } = useStore()
  const me = users.find((u) => u.id === session.userId)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    rank: '',
    gym: '',
    avatar: '',
    banner: '',
    theme: 'default' as 'default' | 'tatami' | 'iron' | 'neon',
    playlist: '',
    interests: [] as string[],
    publicProfile: true,
    dojoCircle: [] as Array<{ id: string; name: string; avatar: string; rank?: string; primaryArt?: string }>,
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [editingDojoCircle, setEditingDojoCircle] = useState(false)

  useEffect(() => {
    if (me) {
      // Get user's friends for Dojo Circle
      const myFriends = users
        .filter(u => u.id !== me.id)
        .slice(0, 20) // Limit to first 20 for demo
        .map(u => ({
          id: u.id,
          name: u.name,
          avatar: u.avatar,
          rank: u.rank,
          primaryArt: u.primaryArt,
        }))

      setFormData({
        name: me.name || '',
        username: me.name.toLowerCase().replace(/\s+/g, '_'),
        bio: me.bio || '',
        location: me.location || '',
        rank: me.rank || '',
        gym: me.gym || '',
        avatar: me.avatar || '',
        banner: me.banner || '',
        theme: (me.theme as any) || 'default',
        playlist: me.playlist || '',
        interests: [],
        publicProfile: true,
        dojoCircle: (me as any).dojoCircle || myFriends.slice(0, 8),
      })
      setAvatarPreview(me.avatar)
    }
  }, [me, users])

  if (!me) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">Please log in to edit your profile.</div>
      </div>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
        setFormData((prev) => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  function handleSave() {
    updateUser(me.id, {
      name: formData.name,
      bio: formData.bio,
      location: formData.location,
      rank: formData.rank,
      gym: formData.gym,
      avatar: formData.avatar,
      banner: formData.banner,
      theme: formData.theme,
      playlist: formData.playlist,
      dojoCircle: formData.dojoCircle,
    })
    navigate(`/u/${me.id}`)
  }

  function handleCancel() {
    navigate(`/u/${me.id}`)
  }

  const themePresets = [
    { id: 'default', name: 'Default', primary: '#0ea5e9', secondary: '#0c4a6e', pattern: 'dots' },
    { id: 'tatami', name: 'Tatami', primary: '#f59e0b', secondary: '#78350f', pattern: 'grid' },
    { id: 'iron', name: 'Iron', primary: '#6366f1', secondary: '#312e81', pattern: 'dots' },
    { id: 'neon', name: 'Neon', primary: '#ec4899', secondary: '#831843', pattern: 'grid' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10 px-4">
      <form className="max-w-3xl mx-auto bg-[var(--color-surface)] p-8 rounded-2xl space-y-6 ring-1 ring-[var(--color-border)] shadow-soft-lg">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Edit Profile</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            >
              <Icon icon={icons.close} className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-brand rounded-lg text-white hover:bg-rose-600 font-semibold transition"
            >
              <Icon icon={icons.save} className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </header>

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Profile Picture</label>
          <div className="flex items-center gap-4">
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-20 h-20 rounded-full ring-2 ring-[var(--color-border)]"
              />
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-border)] cursor-pointer transition">
              <Icon icon={icons.upload} className="h-4 w-4" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Name</span>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition"
              placeholder="Your full name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Username</span>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition"
              placeholder="@username"
            />
          </label>
        </div>

        {/* Bio */}
        <label className="block">
          <span className="text-sm font-medium text-zinc-400">Bio</span>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full mt-1 p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition resize-none"
            placeholder="Tell us about your martial arts journey..."
          />
        </label>

        {/* Martial Arts Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Rank / Belt</span>
            <input
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition"
              placeholder="e.g., Blue Belt"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Affiliation / Gym</span>
            <input
              name="gym"
              value={formData.gym}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition"
              placeholder="e.g., Gracie Barra"
            />
          </label>
        </div>

        {/* Location */}
        <label className="block">
          <span className="text-sm font-medium text-zinc-400">Location</span>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full mt-1 p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition"
            placeholder="City, State or Country"
          />
        </label>

        {/* Profile Theme Customization */}
        <div className="border-t border-zinc-800 pt-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <Icon icon={icons.sparkles} className="h-5 w-5 text-purple-500" />
            Profile Theme (MySpace Style)
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {themePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, theme: preset.id as any }))}
                className={`relative p-4 rounded-xl border-2 transition ${
                  formData.theme === preset.id
                    ? 'border-white ring-2 ring-offset-2 ring-offset-zinc-900 ring-white/50'
                    : 'border-zinc-700 hover:border-zinc-600'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${preset.primary}20, ${preset.secondary}20)`,
                }}
              >
                <div
                  className="h-12 rounded-lg mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                  }}
                />
                <p className="text-sm font-medium text-zinc-200">{preset.name}</p>
                {formData.theme === preset.id && (
                  <div className="absolute top-2 right-2">
                    <Icon icon={icons.check} className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-sm font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-2">
              <Icon icon={icons.music} className="h-4 w-4" />
              Profile Song URL (optional)
            </span>
            <input
              name="playlist"
              value={formData.playlist}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition"
              placeholder="https://example.com/your-song.mp3"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Add a royalty-free music file to play on your profile (MySpace nostalgia!)
            </p>
          </label>
        </div>

        {/* Privacy Settings */}
        <div className="border-t border-zinc-800 pt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Privacy Settings</h3>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.publicProfile}
              onChange={(e) => setFormData((prev) => ({ ...prev, publicProfile: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-brand rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--color-surface)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-surface)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand relative"></div>
            <div className="flex-1">
              <p className="text-[var(--color-text)] font-medium">Public Profile</p>
              <p className="text-xs text-[var(--color-text-muted)]">Allow anyone to view your profile and posts</p>
            </div>
            {formData.publicProfile && <Icon icon={icons.check} className="h-5 w-5 text-brand" />}
          </label>
        </div>

        {/* Interests (placeholder) */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Interests (Top 3 Martial Arts)
          </label>
          <div className="flex flex-wrap gap-2">
            {['BJJ', 'Muay Thai', 'Wrestling', 'Judo', 'Karate', 'Boxing'].map((art) => (
              <button
                key={art}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] transition text-sm"
              >
                {art}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-2">Click to select up to 3 interests</p>
        </div>

        {/* Dojo Circle Editor */}
        <div className="border-t border-zinc-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Icon icon={icons.users} className="h-5 w-5 text-purple-500" />
                Dojo Circle (Top 8)
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Choose your top 8 training partners or friends (MySpace nostalgia!)
              </p>
            </div>
            {!editingDojoCircle && (
              <button
                type="button"
                onClick={() => setEditingDojoCircle(true)}
                className="px-4 py-2 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition text-sm font-medium"
              >
                Edit Circle
              </button>
            )}
          </div>

          {editingDojoCircle ? (
            <DojoCircleEditor
              friends={formData.dojoCircle}
              allFriends={users
                .filter(u => u.id !== me.id)
                .map(u => ({
                  id: u.id,
                  name: u.name,
                  avatar: u.avatar,
                  rank: u.rank,
                  primaryArt: u.primaryArt,
                }))}
              onSave={(newCircle) => {
                setFormData(prev => ({ ...prev, dojoCircle: newCircle }))
                setEditingDojoCircle(false)
              }}
              onCancel={() => setEditingDojoCircle(false)}
            />
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {formData.dojoCircle.slice(0, 8).map((friend, index) => (
                <div key={friend.id} className="group relative">
                  <div className="absolute -top-1.5 -left-1.5 z-10 h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                    {index + 1}
                  </div>
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-full aspect-square object-cover rounded-xl shadow-sm ring-2 ring-zinc-800"
                  />
                  <div className="mt-1.5">
                    <div className="text-xs font-medium truncate text-zinc-200">
                      {friend.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {friend.rank || friend.primaryArt || '\u00A0'}
                    </div>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 8 - formData.dojoCircle.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="w-full aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)]/50 flex items-center justify-center">
                  <span className="text-2xl text-zinc-600">+</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
