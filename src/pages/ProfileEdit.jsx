import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Upload, Lock, Globe } from 'lucide-react'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const { users, session } = useStore()
  const currentUser = users.find(u => u.id === session.userId)
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    rank: '',
    affiliation: '',
    location: '',
    yearsTraining: '',
    interests: [],
    visibility: 'public'
  })
  
  const [avatarPreview, setAvatarPreview] = useState(null)
  
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        bio: currentUser.bio || '',
        rank: currentUser.rank || '',
        affiliation: currentUser.affiliation?.school || '',
        location: currentUser.location || '',
        yearsTraining: currentUser.yearsTraining || '',
        interests: currentUser.interests || [],
        visibility: currentUser.visibility || 'public'
      })
      setAvatarPreview(currentUser.avatar)
    }
  }, [currentUser])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement PATCH request to /api/users/{id}
    console.log('Saving profile:', formData)
    navigate(`/user/${session.userId}`)
  }
  
  const handleCancel = () => {
    navigate(`/user/${session.userId}`)
  }
  
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12 px-4">
      <form 
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-[var(--color-surface)] p-8 rounded-2xl space-y-6 ring-1 ring-[var(--color-border)] shadow-soft-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-50">Edit Profile</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-border)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-brand rounded-lg text-white hover:bg-rose-600 transition-colors shadow-soft"
            >
              Save Changes
            </button>
          </div>
        </div>
        
        {/* Avatar Upload */}
        <div className="flex items-center gap-6 p-6 bg-[var(--color-bg)]/50 rounded-xl">
          <img 
            src={avatarPreview || '/avatars/default.jpg'} 
            alt="Avatar preview"
            className="w-24 h-24 rounded-full ring-4 ring-zinc-700" 
          />
          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-border)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden" 
              />
            </label>
            <p className="text-xs text-zinc-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
        
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-[var(--color-text-muted)] mb-2 block">Name *</span>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </label>
          
          <label className="block">
            <span className="text-sm text-[var(--color-text-muted)] mb-2 block">Username *</span>
            <input 
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </label>
        </div>
        
        {/* Bio */}
        <label className="block">
          <span className="text-sm text-[var(--color-text-muted)] mb-2 block">Bio</span>
          <textarea 
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
            placeholder="Tell us about your martial arts journey..."
          />
        </label>
        
        {/* Martial Arts Details */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-[var(--color-text-muted)] mb-2 block">Current Rank</span>
            <select 
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            >
              <option value="">Select rank</option>
              <option value="White Belt">White Belt</option>
              <option value="Blue Belt">Blue Belt</option>
              <option value="Purple Belt">Purple Belt</option>
              <option value="Brown Belt">Brown Belt</option>
              <option value="Black Belt">Black Belt</option>
            </select>
          </label>
          
          <label className="block">
            <span className="text-sm text-[var(--color-text-muted)] mb-2 block">Years Training</span>
            <input 
              type="number"
              name="yearsTraining"
              value={formData.yearsTraining}
              onChange={handleChange}
              min="0"
              className="w-full p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </label>
        </div>
        
        <label className="block">
          <span className="text-sm text-[var(--color-text-muted)] mb-2 block">Martial Arts Affiliation</span>
          <input 
            type="text"
            name="affiliation"
            value={formData.affiliation}
            onChange={handleChange}
            placeholder="e.g., Gracie Barra, Alliance, etc."
            className="w-full p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
        </label>
        
        <label className="block">
          <span className="text-sm text-[var(--color-text-muted)] mb-2 block">Location</span>
          <input 
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State/Country"
            className="w-full p-3 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
        </label>
        
        {/* Privacy Settings */}
        <div className="p-6 bg-[var(--color-bg)]/50 rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Privacy Settings</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={handleChange}
                className="w-4 h-4 text-brand focus:ring-brand"
              />
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="text-[var(--color-text)]">Public Profile</span>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={formData.visibility === 'private'}
                onChange={handleChange}
                className="w-4 h-4 text-brand focus:ring-brand"
              />
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="text-[var(--color-text)]">Private Profile</span>
              </div>
            </label>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            Private profiles are only visible to your connections
          </p>
        </div>
      </form>
    </div>
  )
}
