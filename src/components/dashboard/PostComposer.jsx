import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Icon, icons } from '../../lib/icons';
import { FriendPickerModal } from './FriendPickerModal';

export default function PostComposer() {
  const [kind, setKind] = useState('FEED'); // 'FEED' | 'JOURNAL'
  const [visibility, setVisibility] = useState('PUBLIC'); // 'PUBLIC' | 'FRIENDS' | 'PRIVATE'
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  
  // Journal-specific fields
  const [journal, setJournal] = useState({
    art: '',
    sessionType: '',
    durationMin: '',
    techniques: [],
    mood: '',
    energy: '', // 1-10
    intensity: '', // 1-10
    recovery: '', // 1-10
    injured: false,
    injuryNotes: ''
  });

  const createPost = useStore(s => s.createPost);
  const saveDraft = useStore(s => s.saveDraft);
  const session = useStore(s => s.session);
  const users = useStore(s => s.users);
  
  // Get current user's friends
  const me = users.find(u => u.id === session.userId);
  const myFriends = users
    .filter(u => u.id !== session.userId)
    .map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      rank: u.rank,
      gym: u.gym,
    }));

  const disabled = !body.trim() && media.length === 0;

  // Auto-save draft every 10 seconds
  useEffect(() => {
    if (!body.trim() && media.length === 0) return;
    
    const timer = setTimeout(() => {
      saveDraft({
        kind,
        payload: { title, body, media, visibility, tags, journal: kind === 'JOURNAL' ? journal : undefined }
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [kind, title, body, media, visibility, tags, journal]);

  const handlePublish = () => {
    if (disabled) return;

    createPost({
      kind,
      title: title.trim() || null,
      body: body.trim(),
      media,
      visibility,
      tags,
      journal: kind === 'JOURNAL' ? {
        art: journal.art || null,
        sessionType: journal.sessionType || null,
        durationMin: journal.durationMin ? parseInt(journal.durationMin) : null,
        techniques: journal.techniques.filter(Boolean),
        mood: journal.mood || null,
        energy: journal.energy ? parseInt(journal.energy) : null,
        intensity: journal.intensity ? parseInt(journal.intensity) : null,
        recovery: journal.recovery ? parseInt(journal.recovery) : null,
        injured: !!journal.injured,
        injuryNotes: journal.injuryNotes?.trim() || null
      } : null
    });

    // Reset form
    setTitle('');
    setBody('');
    setMedia([]);
    setTags([]);
    setJournal({ art: '', sessionType: '', durationMin: '', techniques: [], mood: '', energy:'', intensity:'', recovery:'', injured:false, injuryNotes:'' });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    // In production, upload to S3/R2 and get URLs
    // For now, create object URLs for preview
    const newMedia = files.map(file => ({
      type: file.type.startsWith('video') ? 'video' : 'image',
      url: URL.createObjectURL(file),
      thumbUrl: URL.createObjectURL(file),
      file // Keep reference for actual upload
    }));
    setMedia([...media, ...newMedia]);
  };

  const removeMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const visibilityIcon = {
     PUBLIC: <Icon icon={icons.globe} className="w-4 h-4" />,
     FRIENDS: <Icon icon={icons.userGroup} className="w-4 h-4" />,
     PRIVATE: <Icon icon={icons.lock} className="w-4 h-4" />
  };

  return (
    <div className="card rounded-2xl p-4 shadow-sm">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setKind('FEED')}
          data-kind="FEED"
          className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
            kind === 'FEED'
              ? 'bg-[var(--accent-primary)] text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Post
        </button>
        <button
          onClick={() => setKind('JOURNAL')}
          data-kind="JOURNAL"
          className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
            kind === 'JOURNAL'
              ? 'bg-[var(--accent-primary)] text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Journal
        </button>

        {/* Visibility Dropdown */}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="text-sm bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="PUBLIC">Public</option>
            <option value="FRIENDS">Friends</option>
            <option value="PRIVATE">Private</option>
          </select>
          
          {/* Friend Selector Button (only shown for FRIENDS visibility) */}
          {visibility === 'FRIENDS' && (
            <button
              onClick={() => setShowFriendPicker(true)}
              className="text-sm px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition flex items-center gap-2"
            >
              <Icon icon={icons.users} className="h-4 w-4" />
              <span>{selectedFriends.length > 0 ? `${selectedFriends.length} selected` : 'Select friends'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Title (optional for journals) */}
      {kind === 'JOURNAL' && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title (optional)"
          className="w-full mb-3 px-4 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
        />
      )}

      {/* Body Text */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          kind === 'FEED'
            ? "Share something from training..."
            : "Journal today's session (notes, insights, reflections)..."
        }
        className="w-full min-h-[120px] px-4 py-3 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
      />

      {/* Journal-Specific Fields */}
      {kind === 'JOURNAL' && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <select
            value={journal.art}
            onChange={(e) => setJournal({ ...journal, art: e.target.value })}
            className="rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] px-3 py-2 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="">Discipline</option>
            <option value="BJJ">BJJ</option>
            <option value="Muay Thai">Muay Thai</option>
            <option value="Judo">Judo</option>
            <option value="Wrestling">Wrestling</option>
            <option value="Boxing">Boxing</option>
            <option value="MMA">MMA</option>
          </select>

          <select
            value={journal.sessionType}
            onChange={(e) => setJournal({ ...journal, sessionType: e.target.value })}
            className="rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] px-3 py-2 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="">Session type</option>
            <option value="Class">Class</option>
            <option value="Open Mat">Open Mat</option>
            <option value="Sparring">Sparring</option>
            <option value="Drilling">Drilling</option>
            <option value="Private">Private Lesson</option>
            <option value="Competition">Competition</option>
          </select>

          <input
            type="number"
            min="0"
            value={journal.durationMin}
            onChange={(e) => setJournal({ ...journal, durationMin: e.target.value })}
            placeholder="Duration (min)"
            className="rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] px-3 py-2 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          />

          <input
            type="text"
            value={journal.techniques.join(', ')}
            onChange={(e) => setJournal({ ...journal, techniques: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="Techniques (comma separated)"
            className="rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] px-3 py-2 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          />

          <select
            value={journal.mood}
            onChange={(e) => setJournal({ ...journal, mood: e.target.value })}
            className="col-span-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] px-3 py-2 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="">How did you feel?</option>
            <option value="Energized">⚡ Energized</option>
            <option value="Focused">🎯 Focused</option>
            <option value="Tired">😮‍💨 Tired</option>
            <option value="Frustrated">😤 Frustrated</option>
            <option value="Accomplished">✨ Accomplished</option>
            <option value="Sore">🤕 Sore</option>
          </select>
          {/* Energy / Intensity / Recovery */}
          <div className="col-span-2 grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-muted)]">Energy (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={journal.energy || ''}
                onChange={(e) => setJournal({ ...journal, energy: e.target.value })}
                className="w-full"
              />
              <div className="text-xs text-[var(--color-text)]">{journal.energy || '-'}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-muted)]">Intensity (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={journal.intensity || ''}
                onChange={(e) => setJournal({ ...journal, intensity: e.target.value })}
                className="w-full"
              />
              <div className="text-xs text-[var(--color-text)]">{journal.intensity || '-'}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-muted)]">Recovery (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={journal.recovery || ''}
                onChange={(e) => setJournal({ ...journal, recovery: e.target.value })}
                className="w-full"
              />
              <div className="text-xs text-[var(--color-text)]">{journal.recovery || '-'}</div>
            </div>
          </div>

          {/* Injury toggle and notes */}
          <div className="col-span-2 grid grid-cols-3 gap-3 items-start">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={!!journal.injured}
                onChange={(e) => setJournal({ ...journal, injured: e.target.checked })}
              />
              Injured
            </label>
            <input
              type="text"
              value={journal.injuryNotes}
              onChange={(e) => setJournal({ ...journal, injuryNotes: e.target.value })}
              placeholder="Injury notes (optional)"
              className="col-span-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] px-3 py-2 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>
        </div>
      )}

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {media.map((m, i) => (
            <div key={i} className="relative group">
              {m.type === 'image' ? (
                <img src={m.url} className="rounded-lg w-full h-24 object-cover" alt="" />
              ) : (
                <video src={m.url} className="rounded-lg w-full h-24 object-cover" />
              )}
              <button
                onClick={() => removeMedia(i)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
             <Icon icon={icons.close} className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3">
        {/* Media Upload */}
        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors border border-[var(--color-border)]">
         <Icon icon={icons.image} className="w-4 h-4" />
          <span className="text-sm">Media</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        {media.length > 0 && (
          <span className="text-xs text-[var(--color-text-muted)]">
            {media.length} file{media.length > 1 ? 's' : ''}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => saveDraft({ kind, payload: { title, body, media, visibility, tags, journal: kind === 'JOURNAL' ? journal : undefined } })}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors border border-[var(--color-border)]"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={disabled}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              disabled
                ? 'bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50'
                : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] shadow-md hover:shadow-lg'
            }`}
          >
            Publish
          </button>
        </div>
      </div>

      {/* Friend Picker Modal */}
      {showFriendPicker && (
        <FriendPickerModal
          friends={myFriends}
          selectedFriends={selectedFriends}
          onSelect={setSelectedFriends}
          onClose={() => setShowFriendPicker(false)}
        />
      )}
    </div>
  );
}
