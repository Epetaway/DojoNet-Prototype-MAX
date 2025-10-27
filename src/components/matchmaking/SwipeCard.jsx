import React, { useState, useRef } from 'react';
import { Icon, icons } from '../../lib/icons';

/**
 * SwipeCard Component
 * Tinder-style swipeable card for partner profiles with martial arts context
 * Includes gesture controls, verification badges, and safety indicators
 */

const SwipeCard = ({ profile, onSwipe, isTopCard }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef(null);

  // Swipe gesture handling
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd({ x: currentX, y: currentY });
    
    const offsetX = currentX - touchStart.x;
    const offsetY = currentY - touchStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    const distance = touchStart.x - touchEnd.x;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      animateSwipeOff('left');
      setTimeout(() => onSwipe(profile.id, 'left'), 300);
    } else if (isRightSwipe) {
      animateSwipeOff('right');
      setTimeout(() => onSwipe(profile.id, 'right'), 300);
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
    
    setIsDragging(false);
  };

  const animateSwipeOff = (direction) => {
    const distance = direction === 'left' ? -1000 : 1000;
    setDragOffset({ x: distance, y: 0 });
  };

  const handleButtonSwipe = (direction) => {
    animateSwipeOff(direction);
    setTimeout(() => onSwipe(profile.id, direction), 300);
  };

  const handleSuperLike = () => {
    // Animate upward for super like
    setDragOffset({ x: 0, y: -1000 });
    setTimeout(() => onSwipe(profile.id, 'super'), 300);
  };

  // Calculate rotation based on drag
  const rotation = dragOffset.x / 20;
  const opacity = isDragging ? 0.8 : 1;

  // Get primary discipline display
  const primaryDisc = profile.disciplines?.find(d => d.discipline === profile.primaryDiscipline) 
    || profile.disciplines?.[0];

  // Distance calculation (mock for now - would use real geolocation)
  const distance = profile.distanceRadius ? `${Math.round(profile.distanceRadius)} mi away` : 'Nearby';

  // Belt color mapping
  const beltColors = {
    'White': 'bg-white text-gray-800 border border-gray-300',
    'Blue': 'bg-blue-500 text-white',
    'Purple': 'bg-purple-500 text-white',
    'Brown': 'bg-amber-800 text-white',
    'Black': 'bg-black text-white',
    'Orange': 'bg-orange-500 text-white',
    'Green': 'bg-green-500 text-white',
    'Yellow': 'bg-yellow-400 text-gray-800',
    'Red': 'bg-red-500 text-white',
  };

  return (
    <>
      {/* Main Swipe Card */}
      <div
        ref={cardRef}
        className={`absolute inset-0 transition-all duration-300 ${isTopCard ? 'z-20' : 'z-10 scale-95 opacity-50'}`}
        style={{
          transform: isTopCard 
            ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)` 
            : 'translateY(10px)',
          opacity: isTopCard ? opacity : 0.5,
          transition: isDragging ? 'none' : 'all 0.3s ease-out',
        }}
        onTouchStart={isTopCard ? handleTouchStart : undefined}
        onTouchMove={isTopCard ? handleTouchMove : undefined}
        onTouchEnd={isTopCard ? handleTouchEnd : undefined}
      >
        <div 
          className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Profile Photo */}
          <div className="relative h-2/3 overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
            {profile.photos?.[0] ? (
              <img 
                src={profile.photos[0]} 
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon icon={icons.user} className="w-32 h-32 text-zinc-600" />
              </div>
            )}

            {/* Swipe Indicators */}
            {dragOffset.x > 50 && (
              <div className="absolute top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-2xl transform rotate-12 shadow-lg">
                LIKE
              </div>
            )}
            {dragOffset.x < -50 && (
              <div className="absolute top-8 left-8 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-2xl transform -rotate-12 shadow-lg">
                PASS
              </div>
            )}
            {dragOffset.y < -50 && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-lg">
                SUPER LIKE
              </div>
            )}

            {/* Verification Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {profile.isVerified && (
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Icon icon={icons.check} className="w-3 h-3" />
                  Verified
                </div>
              )}
              {profile.isIDVerified && (
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Icon icon={icons.shield} className="w-3 h-3" />
                  ID
                </div>
              )}
              {profile.parentSupervised && (
                <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Icon icon={icons.users} className="w-3 h-3" />
                  Parent Supervised
                </div>
              )}
            </div>

            {/* Info Button */}
            <button
              onClick={() => setShowDetails(true)}
              className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-800/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Icon icon={icons.info} className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </button>
          </div>

          {/* Profile Info */}
          <div className="h-1/3 p-6 overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  {profile.displayName}, {profile.age}
                </h2>
                <p className="text-sm flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                  <Icon icon={icons.mapPin} className="w-4 h-4" />
                  {profile.city}, {profile.state} • {distance}
                </p>
              </div>
            </div>

            {/* Tagline */}
            {profile.tagline && (
              <p className="text-sm mb-3 italic" style={{ color: 'var(--color-text)' }}>
                "{profile.tagline}"
              </p>
            )}

            {/* Disciplines */}
            <div className="flex flex-wrap gap-2 mb-3">
              {primaryDisc && (
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${beltColors[primaryDisc.beltRank] || 'bg-zinc-500 text-white'}`}>
                  {primaryDisc.discipline} - {primaryDisc.beltRank} Belt
                </div>
              )}
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500 text-white">
                {profile.yearsTraining} {profile.yearsTraining === 1 ? 'year' : 'years'} exp
              </div>
            </div>

            {/* Training Goals */}
            <div className="flex flex-wrap gap-2">
              {profile.trainingGoals?.slice(0, 2).map((goal, idx) => (
                <div key={idx} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                  {goal}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (only for top card) */}
      {isTopCard && (
        <div className="absolute bottom-[-80px] left-1/2 transform -translate-x-1/2 flex gap-6 z-30">
          <button
            onClick={() => handleButtonSwipe('left')}
            className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center hover:scale-110 transition-transform border-2 border-red-500"
            aria-label="Pass"
          >
            <Icon icon={icons.close} className="w-8 h-8 text-red-500" />
          </button>
          
          <button
            onClick={handleSuperLike}
            className="w-14 h-14 rounded-full bg-blue-500 shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Super Like"
          >
            <Icon icon={icons.star} className="w-7 h-7 text-white" />
          </button>
          
          <button
            onClick={() => handleButtonSwipe('right')}
            className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center hover:scale-110 transition-transform border-2 border-green-500"
            aria-label="Like"
          >
            <Icon icon={icons.heart} className="w-8 h-8 text-green-500" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetails && (
        <ProfileDetailModal 
          profile={profile} 
          onClose={() => setShowDetails(false)}
          onSwipe={(direction) => {
            setShowDetails(false);
            handleButtonSwipe(direction);
          }}
        />
      )}
    </>
  );
};

// Profile Detail Modal Component
const ProfileDetailModal = ({ profile, onClose, onSwipe }) => {
  const primaryDisc = profile.disciplines?.find(d => d.discipline === profile.primaryDiscipline) 
    || profile.disciplines?.[0];

  const beltColors = {
    'White': 'bg-white text-gray-800 border border-gray-300',
    'Blue': 'bg-blue-500 text-white',
    'Purple': 'bg-purple-500 text-white',
    'Brown': 'bg-amber-800 text-white',
    'Black': 'bg-black text-white',
    'Orange': 'bg-orange-500 text-white',
    'Green': 'bg-green-500 text-white',
    'Yellow': 'bg-yellow-400 text-gray-800',
    'Red': 'bg-red-500 text-white',
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with photos */}
        <div className="relative h-96 overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
          {profile.photos?.[0] ? (
            <img 
              src={profile.photos[0]} 
              alt={profile.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon icon={icons.user} className="w-32 h-32 text-zinc-600" />
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-800/90 p-2 rounded-full shadow-lg"
          >
            <Icon icon={icons.close} className="w-6 h-6" style={{ color: 'var(--color-text)' }} />
          </button>

          {/* Verification Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {profile.isVerified && (
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Icon icon={icons.check} className="w-3 h-3" />
                Verified
              </div>
            )}
            {profile.isIDVerified && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Icon icon={icons.shield} className="w-3 h-3" />
                ID Verified
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-384px-80px)] p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {profile.displayName}, {profile.age}
            </h2>
            <p className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
              <Icon icon={icons.mapPin} className="w-4 h-4" />
              {profile.city}, {profile.state}
            </p>
            {profile.parentSupervised && (
              <div className="mt-2 inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                <Icon icon={icons.users} className="w-4 h-4" />
                Parent Supervised Account
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>About</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>{profile.bio}</p>
            </div>
          )}

          {/* Disciplines */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Martial Arts</h3>
            <div className="space-y-3">
              {profile.disciplines?.map((disc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-bg)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{disc.discipline}</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {disc.yearsExperience} {disc.yearsExperience === 1 ? 'year' : 'years'} • {disc.skillLevel}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${beltColors[disc.beltRank] || 'bg-zinc-500 text-white'}`}>
                    {disc.beltRank}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training Goals */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Training Goals</h3>
            <div className="flex flex-wrap gap-2">
              {profile.trainingGoals?.map((goal, idx) => (
                <div key={idx} className="px-4 py-2 rounded-lg font-medium" style={{ background: 'var(--accent-teal)', color: 'white' }}>
                  {goal}
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          {profile.availability?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Availability</h3>
              <div className="flex flex-wrap gap-2">
                {profile.availability.map((slot, idx) => (
                  <div key={idx} className="px-3 py-1 rounded-full text-sm" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                    {slot}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physical Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Physical Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Weight Class</p>
                <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{profile.weightClass}</p>
              </div>
              {profile.height && (
                <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Height</p>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{Math.floor(profile.height / 12)}'{profile.height % 12}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t flex gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => onSwipe('left')}
            className="flex-1 py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Pass
          </button>
          <button
            onClick={() => onSwipe('right')}
            className="flex-1 py-3 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            Like
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
