// ProfileSong: MySpace-style music player with consent modal
import React, { useState, useRef, useEffect } from 'react'
import { Icon, icons } from '../../lib/icons'

interface Props {
  songUrl?: string
  songTitle?: string
  songArtist?: string
  username: string
}

export function ProfileSong({ songUrl, songTitle, songArtist, username }: Props) {
  const [hasConsent, setHasConsent] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Check for existing consent preference
    const storageKey = `music:allow:${username}`
    const consent = localStorage.getItem(storageKey)
    
    if (consent === 'true') {
      setHasConsent(true)
    } else if (consent === null && songUrl) {
      // First visit - show consent modal
      setShowModal(true)
    }
  }, [username, songUrl])

  useEffect(() => {
    // Auto-play if consent is given
    if (hasConsent && audioRef.current && !isPlaying) {
      audioRef.current.volume = volume
      audioRef.current.play().catch(() => {
        // Auto-play blocked by browser
        console.log('Auto-play blocked - user must interact first')
      })
      setIsPlaying(true)
    }
  }, [hasConsent])

  const handleConsent = (allow: boolean) => {
    const storageKey = `music:allow:${username}`
    localStorage.setItem(storageKey, allow ? 'true' : 'false')
    setHasConsent(allow)
    setShowModal(false)
    
    if (allow && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return
    
    const bounds = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - bounds.left
    const percentage = x / bounds.width
    const newTime = percentage * duration
    
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!songUrl || !songTitle) return null

  return (
    <>
      {/* Consent Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm mx-4 shadow-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Icon icon={icons.music} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Play profile music?
                </h3>
                <p className="text-xs text-zinc-500">
                  {songTitle} · {songArtist}
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              This profile has a custom song. Would you like to play it?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleConsent(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Not now
              </button>
              <button
                onClick={() => handleConsent(true)}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition"
              >
                Play
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Music Player */}
      {hasConsent && (
        <div className="mt-4 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/60 p-4 border border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={togglePlay}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white grid place-items-center hover:shadow-lg transition flex-shrink-0"
            >
              {isPlaying ? (
                <Icon icon={icons.pause} className="h-4 w-4" />
              ) : (
                <Icon icon={icons.play} className="h-4 w-4 ml-0.5" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">
                {songTitle}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {songArtist}
              </div>
            </div>
            
            {/* Volume Control */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-2 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition"
              >
                {volume === 0 ? (
                  <Icon icon={icons.volumeMute} className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                ) : volume < 0.5 ? (
                  <Icon icon={icons.volumeLow} className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                ) : (
                  <Icon icon={icons.volumeHigh} className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                )}
              </button>
              
              {showVolumeSlider && (
                <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-3 border border-zinc-200 dark:border-zinc-700">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-24 h-1 accent-blue-500"
                    style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                  />
                </div>
              )}
            </div>
            
            <Icon 
              icon={icons.music} 
              className={`h-4 w-4 text-zinc-400 ${isPlaying ? 'animate-pulse' : ''}`} 
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div 
              onClick={handleSeek}
              className="h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer overflow-hidden"
            >
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={songUrl}
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          />
        </div>
      )}
    </>
  )
}
