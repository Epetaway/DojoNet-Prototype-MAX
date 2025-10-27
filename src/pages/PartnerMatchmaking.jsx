import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import SwipeCard from '../components/matchmaking/SwipeCard';
import { Icon, icons } from '../lib/icons';

/**
 * PartnerMatchmaking Page
 * Main swipe interface for finding training partners with safety-first matching
 * 
 * Features:
 * - Age-gated matching (minors only see minors, adults only see adults)
 * - Geographic filtering with privacy protection
 * - Discipline and skill level matching
 * - Compatibility scoring algorithm
 * - Parent supervision indicators for minor accounts
 */

const PartnerMatchmaking = () => {
  const currentUser = useStore((state) => state.user);
  
  // State
  const [candidateQueue, setCandidateQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [swipes, setSwipes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMatch, setShowMatch] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    distance: 25, // miles
    ageRange: { 
      min: currentUser?.isMinor ? Math.max(13, (currentUser?.age || 16) - 2) : 18, 
      max: currentUser?.isMinor ? Math.min(17, (currentUser?.age || 16) + 2) : 65 
    },
    disciplines: [],
    skillLevels: [],
    goals: [],
    verifiedOnly: false,
    availabilityMatch: false,
  });

  // Load data from localStorage
  useEffect(() => {
    loadMatchingData();
  }, [currentUser]);

  const loadMatchingData = () => {
    if (!currentUser) return;

    const savedMatches = localStorage.getItem(`matches_${currentUser.id}`);
    const savedSwipes = localStorage.getItem(`swipes_${currentUser.id}`);
    const savedProfiles = localStorage.getItem('partner_profiles');

    if (savedMatches) setMatches(JSON.parse(savedMatches));
    if (savedSwipes) setSwipes(JSON.parse(savedSwipes));

    // Generate or load candidate profiles
    const profiles = savedProfiles ? JSON.parse(savedProfiles) : generateMockProfiles();
    localStorage.setItem('partner_profiles', JSON.stringify(profiles));

    // Filter and rank candidates
    const filtered = filterCandidates(profiles, currentUser, filters, swipes);
    setCandidateQueue(filtered);
  };

  // Save data
  useEffect(() => {
    if (currentUser && matches.length > 0) {
      localStorage.setItem(`matches_${currentUser.id}`, JSON.stringify(matches));
    }
  }, [matches, currentUser]);

  useEffect(() => {
    if (currentUser && swipes.length > 0) {
      localStorage.setItem(`swipes_${currentUser.id}`, JSON.stringify(swipes));
    }
  }, [swipes, currentUser]);

  // Handle swipe action
  const handleSwipe = (profileId, direction) => {
    const swipeAction = {
      id: `swipe_${Date.now()}`,
      swiperId: currentUser.id,
      targetId: profileId,
      direction,
      timestamp: new Date().toISOString(),
    };

    setSwipes(prev => [...prev, swipeAction]);

    // Check for mutual like (match)
    if (direction === 'right' || direction === 'super') {
      checkForMatch(profileId, direction === 'super');
    }

    // Move to next card
    setCurrentIndex(prev => prev + 1);
  };

  const checkForMatch = (profileId, isSuperLike) => {
    // Simulate checking if the other user already liked us
    // In production, this would query the backend
    const matchProbability = isSuperLike ? 0.7 : 0.3; // Super likes get higher match rate
    const isMatch = Math.random() < matchProbability;

    if (isMatch) {
      const matchedProfile = candidateQueue.find(p => p.id === profileId);
      if (matchedProfile) {
        const newMatch = {
          id: `match_${Date.now()}`,
          user1Id: currentUser.id,
          user2Id: profileId,
          user1Profile: createUserProfile(currentUser),
          user2Profile: matchedProfile,
          matchedAt: new Date().toISOString(),
          status: 'active',
        };
        
        setMatches(prev => [...prev, newMatch]);
        setShowMatch(matchedProfile);
        
        // Auto-hide match notification after 3 seconds
        setTimeout(() => setShowMatch(null), 3000);
      }
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Refilter candidates
    const savedProfiles = localStorage.getItem('partner_profiles');
    if (savedProfiles) {
      const profiles = JSON.parse(savedProfiles);
      const filtered = filterCandidates(profiles, currentUser, { ...filters, ...newFilters }, swipes);
      setCandidateQueue(filtered);
      setCurrentIndex(0);
    }
  };

  // Current cards to display (show 2 for preview effect)
  const visibleCards = candidateQueue.slice(currentIndex, currentIndex + 2);
  const hasMoreCards = currentIndex < candidateQueue.length;

  return (
    <div className="min-h-screen pt-16 pb-24" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Find Training Partners
            </h1>
            {currentUser?.isMinor && (
              <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Icon icon={icons.shield} className="w-4 h-4 text-purple-500" />
                Safe, parent-supervised matching
              </p>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(true)}
            className="p-3 rounded-xl hover:scale-105 transition-transform"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <Icon icon={icons.filter} className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          </button>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.distance !== 25 && (
            <div className="px-3 py-1 rounded-full text-sm" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
              Within {filters.distance} mi
            </div>
          )}
          {filters.disciplines.length > 0 && (
            <div className="px-3 py-1 rounded-full text-sm" style={{ background: 'var(--accent-teal)', color: 'white' }}>
              {filters.disciplines.join(', ')}
            </div>
          )}
          {filters.verifiedOnly && (
            <div className="px-3 py-1 rounded-full text-sm bg-blue-500 text-white">
              Verified Only
            </div>
          )}
        </div>
      </div>

      {/* Swipe Cards */}
      <div className="max-w-md mx-auto px-4">
        <div className="relative" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          {!hasMoreCards ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <Icon icon={icons.search} className="w-20 h-20 mb-4" style={{ color: 'var(--color-text-muted)' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                No More Partners
              </h2>
              <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Try expanding your distance or adjusting your filters
              </p>
              <button
                onClick={() => updateFilters({ distance: filters.distance + 10 })}
                className="px-6 py-3 rounded-xl font-semibold text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                Expand Search Radius
              </button>
            </div>
          ) : (
            visibleCards.map((profile, idx) => (
              <SwipeCard
                key={profile.id}
                profile={profile}
                onSwipe={handleSwipe}
                isTopCard={idx === 0}
              />
            ))
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="max-w-md mx-auto px-4 mt-8 flex justify-center gap-8">
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {matches.length}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Matches</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {candidateQueue.length - currentIndex}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Remaining</p>
        </div>
      </div>

      {/* Match Notification */}
      {showMatch && (
        <MatchNotification profile={showMatch} onClose={() => setShowMatch(null)} />
      )}

      {/* Filters Modal */}
      {showFilters && (
        <FiltersModal 
          filters={filters} 
          onUpdate={updateFilters}
          onClose={() => setShowFilters(false)}
          isMinor={currentUser?.isMinor}
        />
      )}
    </div>
  );
};

// ============= Helper Functions =============

function filterCandidates(allProfiles, currentUser, filters, existingSwipes) {
  if (!currentUser) return [];

  const swipedIds = new Set(existingSwipes.map(s => s.targetId));

  return allProfiles
    .filter(profile => {
      // Don't show self
      if (profile.userId === currentUser.id) return false;

      // Don't show already swiped profiles
      if (swipedIds.has(profile.id)) return false;

      // AGE GATING: Minors only see minors, adults only see adults
      if (currentUser.isMinor && !profile.isMinor) return false;
      if (!currentUser.isMinor && profile.isMinor) return false;

      // Age range filter
      if (profile.age < filters.ageRange.min || profile.age > filters.ageRange.max) return false;

      // Distance filter (simplified - would use real geolocation)
      if (profile.distanceRadius > filters.distance) return false;

      // Discipline filter
      if (filters.disciplines.length > 0) {
        const hasMatchingDiscipline = profile.disciplines.some(d => 
          filters.disciplines.includes(d.discipline)
        );
        if (!hasMatchingDiscipline) return false;
      }

      // Skill level filter
      if (filters.skillLevels.length > 0) {
        const hasMatchingSkill = profile.disciplines.some(d =>
          filters.skillLevels.includes(d.skillLevel)
        );
        if (!hasMatchingSkill) return false;
      }

      // Verification filter
      if (filters.verifiedOnly && !profile.isVerified) return false;

      return true;
    })
    .map(profile => ({
      ...profile,
      compatibilityScore: calculateCompatibility(profile, currentUser, filters),
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

function calculateCompatibility(profile, currentUser, filters) {
  let score = 0;

  // Discipline match (0-30 points)
  const userDisciplines = new Set(currentUser.disciplines?.map(d => d.discipline) || []);
  const matchingDisciplines = profile.disciplines.filter(d => 
    userDisciplines.has(d.discipline)
  ).length;
  score += Math.min(matchingDisciplines * 15, 30);

  // Skill level compatibility (0-20 points)
  // Prefer similar skill levels
  const userAvgSkill = getAverageSkillLevel(currentUser.disciplines || []);
  const profileAvgSkill = getAverageSkillLevel(profile.disciplines);
  const skillDiff = Math.abs(userAvgSkill - profileAvgSkill);
  score += Math.max(20 - (skillDiff * 10), 0);

  // Goal alignment (0-20 points)
  const userGoals = new Set(currentUser.trainingGoals || []);
  const matchingGoals = profile.trainingGoals.filter(g => userGoals.has(g)).length;
  score += Math.min(matchingGoals * 10, 20);

  // Proximity bonus (0-15 points)
  const distanceScore = Math.max(15 - profile.distanceRadius, 0);
  score += distanceScore;

  // Verification bonus (0-10 points)
  if (profile.isVerified) score += 5;
  if (profile.isIDVerified) score += 5;

  // Age proximity (0-5 points)
  const ageDiff = Math.abs(profile.age - (currentUser.age || 25));
  score += Math.max(5 - ageDiff, 0);

  return Math.round(score);
}

function getAverageSkillLevel(disciplines) {
  const skillMap = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
  const total = disciplines.reduce((sum, d) => sum + (skillMap[d.skillLevel] || 0), 0);
  return disciplines.length > 0 ? total / disciplines.length : 0;
}

function createUserProfile(user) {
  return {
    id: `profile_${user.id}`,
    userId: user.id,
    displayName: user.displayName || user.username,
    age: user.age || 25,
    accountType: user.isMinor ? 'minor' : 'adult',
    isMinor: user.isMinor || false,
    city: user.city || 'Unknown',
    state: user.state || 'CA',
    disciplines: user.disciplines || [],
    primaryDiscipline: user.disciplines?.[0]?.discipline || 'BJJ',
    trainingGoals: user.trainingGoals || ['Casual Sparring'],
    yearsTraining: user.yearsTraining || 1,
    weightClass: user.weightClass || 'Not Specified',
    bio: user.bio || '',
    photos: user.avatar ? [user.avatar] : [],
    tagline: user.tagline || '',
    availability: user.availability || [],
    isVerified: true,
    isIDVerified: false,
    verificationBadges: ['Google Verified'],
    safetyScore: 95,
    parentSupervised: user.isMinor || false,
    parentApprovalRequired: user.isMinor || false,
    createdAt: new Date(),
    lastActive: new Date(),
    distanceRadius: 10,
    preferredSkillLevels: ['Intermediate', 'Advanced'],
    preferredDisciplines: [],
  };
}

// ============= Sub-Components =============

const MatchNotification = ({ profile, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="max-w-md w-full p-8 rounded-2xl text-center animate-bounce"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
          <Icon icon={icons.heart} className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          It's a Match!
        </h2>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
          You and {profile.displayName} are a training match!
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-semibold text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          Send a Message
        </button>
      </div>
    </div>
  );
};

const FiltersModal = ({ filters, onUpdate, onClose, isMinor }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const disciplines = ['BJJ', 'Muay Thai', 'Boxing', 'Karate', 'Judo', 'Wrestling', 'Taekwondo', 'MMA'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const handleApply = () => {
    onUpdate(localFilters);
    onClose();
  };

  const toggleDiscipline = (disc) => {
    setLocalFilters(prev => ({
      ...prev,
      disciplines: prev.disciplines.includes(disc)
        ? prev.disciplines.filter(d => d !== disc)
        : [...prev.disciplines, disc]
    }));
  };

  const toggleSkillLevel = (level) => {
    setLocalFilters(prev => ({
      ...prev,
      skillLevels: prev.skillLevels.includes(level)
        ? prev.skillLevels.filter(l => l !== level)
        : [...prev.skillLevels, level]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Filters</h2>
          <button onClick={onClose}>
            <Icon icon={icons.close} className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Distance */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              Maximum Distance: {localFilters.distance} miles
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={localFilters.distance}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, distance: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Age Range (locked for minors) */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              Age Range: {localFilters.ageRange.min} - {localFilters.ageRange.max}
              {isMinor && <span className="ml-2 text-xs text-purple-500">(Age-protected)</span>}
            </label>
            {!isMinor && (
              <div className="flex gap-4">
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={localFilters.ageRange.min}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    ageRange: { ...prev.ageRange, min: parseInt(e.target.value) }
                  }))}
                  className="flex-1 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                />
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={localFilters.ageRange.max}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    ageRange: { ...prev.ageRange, max: parseInt(e.target.value) }
                  }))}
                  className="flex-1 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                />
              </div>
            )}
          </div>

          {/* Disciplines */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              Martial Arts Disciplines
            </label>
            <div className="flex flex-wrap gap-2">
              {disciplines.map(disc => (
                <button
                  key={disc}
                  onClick={() => toggleDiscipline(disc)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    localFilters.disciplines.includes(disc)
                      ? 'bg-teal-500 text-white'
                      : 'text-teal-500 border border-teal-500'
                  }`}
                  style={!localFilters.disciplines.includes(disc) ? { background: 'var(--color-bg)' } : {}}
                >
                  {disc}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Levels */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              Skill Levels
            </label>
            <div className="flex flex-wrap gap-2">
              {skillLevels.map(level => (
                <button
                  key={level}
                  onClick={() => toggleSkillLevel(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    localFilters.skillLevels.includes(level)
                      ? 'text-white'
                      : 'border'
                  }`}
                  style={
                    localFilters.skillLevels.includes(level)
                      ? { background: 'var(--color-primary)' }
                      : { background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }
                  }
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Only */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Verified Accounts Only
            </label>
            <button
              onClick={() => setLocalFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                localFilters.verifiedOnly ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <div 
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  localFilters.verifiedOnly ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => {
              setLocalFilters(filters);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl font-semibold"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= Mock Data Generator =============

function generateMockProfiles() {
  const names = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Avery', 'Quinn', 'Sage'];
  const cities = ['San Francisco', 'Los Angeles', 'San Diego', 'Oakland', 'San Jose'];
  const disciplines = ['BJJ', 'Muay Thai', 'Boxing', 'Judo', 'Wrestling'];
  const belts = ['White', 'Blue', 'Purple', 'Brown'];
  const skills = ['Beginner', 'Intermediate', 'Advanced'];
  const goals = ['Casual Sparring', 'Competition Prep', 'Technique Drilling', 'Fitness'];

  return Array.from({ length: 20 }, (_, i) => {
    const age = 18 + Math.floor(Math.random() * 30);
    const isMinor = age < 18;
    const disc = disciplines[Math.floor(Math.random() * disciplines.length)];
    
    return {
      id: `profile_${i + 1}`,
      userId: `user_${i + 1}`,
      displayName: names[i % names.length],
      age,
      accountType: isMinor ? 'minor' : 'adult',
      isMinor,
      city: cities[Math.floor(Math.random() * cities.length)],
      state: 'CA',
      disciplines: [{
        discipline: disc,
        yearsExperience: 1 + Math.floor(Math.random() * 5),
        beltRank: belts[Math.floor(Math.random() * belts.length)],
        skillLevel: skills[Math.floor(Math.random() * skills.length)],
      }],
      primaryDiscipline: disc,
      trainingGoals: [goals[Math.floor(Math.random() * goals.length)]],
      yearsTraining: 1 + Math.floor(Math.random() * 10),
      weightClass: 'Welterweight',
      bio: `Passionate about ${disc}. Looking to improve and find training partners!`,
      photos: [],
      tagline: `${disc} enthusiast - Let's train!`,
      availability: ['Weekday Evenings', 'Weekends'],
      isVerified: Math.random() > 0.3,
      isIDVerified: Math.random() > 0.7,
      verificationBadges: ['Google Verified'],
      safetyScore: 80 + Math.floor(Math.random() * 20),
      parentSupervised: isMinor,
      parentApprovalRequired: isMinor,
      createdAt: new Date(),
      lastActive: new Date(),
      distanceRadius: 5 + Math.floor(Math.random() * 20),
      preferredSkillLevels: ['Intermediate'],
      preferredDisciplines: [],
    };
  });
}

export default PartnerMatchmaking;
