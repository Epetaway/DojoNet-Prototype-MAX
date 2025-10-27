/**
 * Partner Matchmaking Type Definitions
 * Comprehensive types for swipe-based partner matching with safety features
 */

// ============= User Profile & Matching =============

export type MartialArtDiscipline = 
  | 'BJJ' 
  | 'Muay Thai' 
  | 'Boxing' 
  | 'Karate' 
  | 'Judo' 
  | 'Wrestling' 
  | 'Taekwondo' 
  | 'MMA' 
  | 'Kickboxing'
  | 'Sambo'
  | 'Jiu-Jitsu'
  | 'Other';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type TrainingGoal = 
  | 'Casual Sparring' 
  | 'Competition Prep' 
  | 'Technique Drilling' 
  | 'Fitness' 
  | 'Cross-Training'
  | 'Self-Defense'
  | 'Social/Community';

export type BeltRank = 
  | 'White' 
  | 'Blue' 
  | 'Purple' 
  | 'Brown' 
  | 'Black'
  | 'Orange'
  | 'Green'
  | 'Yellow'
  | 'Red'
  | 'Unranked';

export type WeightClass = 
  | 'Flyweight' 
  | 'Bantamweight' 
  | 'Featherweight' 
  | 'Lightweight' 
  | 'Welterweight'
  | 'Middleweight'
  | 'Light Heavyweight'
  | 'Heavyweight'
  | 'Not Specified';

export type AccountType = 'adult' | 'minor' | 'parent';

export interface DisciplineExperience {
  discipline: MartialArtDiscipline;
  yearsExperience: number;
  beltRank: BeltRank;
  skillLevel: SkillLevel;
  certifications?: string[];
}

export interface PartnerProfile {
  id: string;
  userId: string;
  
  // Basic Info
  displayName: string;
  age: number;
  accountType: AccountType;
  isMinor: boolean;
  
  // Location (privacy-protected)
  city: string;
  state: string;
  latitude?: number; // Only used for matching, not displayed
  longitude?: number;
  distanceRadius: number; // Max miles willing to travel
  
  // Martial Arts Background
  disciplines: DisciplineExperience[];
  primaryDiscipline: MartialArtDiscipline;
  trainingGoals: TrainingGoal[];
  yearsTraining: number;
  
  // Physical Stats (for safe sparring matching)
  weightClass: WeightClass;
  height?: number; // inches
  
  // Profile Content
  bio: string;
  photos: string[]; // URLs to profile photos (vetted by moderation)
  tagline: string; // One-liner like "BJJ blue belt looking to roll weekends"
  availability: string[]; // e.g. ["Weekday Mornings", "Saturday Afternoons"]
  
  // Verification & Safety
  isVerified: boolean; // OAuth verified
  isIDVerified: boolean; // Government ID verified
  verificationBadges: string[]; // e.g. ["Google Verified", "ID Verified"]
  safetyScore: number; // 0-100, computed by system
  
  // Preferences
  preferredAgeRange?: { min: number; max: number };
  preferredSkillLevels: SkillLevel[];
  preferredDisciplines: MartialArtDiscipline[];
  
  // Timestamps
  createdAt: Date;
  lastActive: Date;
  
  // Parental Control (for minors)
  parentUserId?: string;
  parentSupervised: boolean;
  parentApprovalRequired: boolean;
}

// ============= Matching & Swipe Logic =============

export type SwipeDirection = 'left' | 'right' | 'super'; // left=pass, right=like, super=super-like

export interface SwipeAction {
  id: string;
  swiperId: string; // User who swiped
  targetId: string; // Profile being swiped on
  direction: SwipeDirection;
  timestamp: Date;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Profile: PartnerProfile;
  user2Profile: PartnerProfile;
  matchedAt: Date;
  chatSessionId?: string;
  status: 'active' | 'blocked' | 'archived';
  
  // Meeting coordination
  proposedMeetups?: MeetupProposal[];
}

export interface MeetupProposal {
  id: string;
  proposerId: string;
  location: string;
  gymName?: string;
  dateTime: Date;
  status: 'pending' | 'accepted' | 'declined';
  parentApproved?: boolean; // For minor accounts
}

// ============= Chat & Messaging =============

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  
  // Safety & Moderation
  isFiltered: boolean; // Profanity filtered
  isFlagged: boolean; // Flagged for review
  moderationStatus: 'pending' | 'approved' | 'blocked';
  flagReason?: string;
  
  // Read status
  isRead: boolean;
  readAt?: Date;
}

export interface ChatSession {
  id: string;
  matchId: string;
  participants: string[]; // [userId1, userId2]
  messages: ChatMessage[];
  createdAt: Date;
  lastMessageAt: Date;
  
  // Monitoring (for minors)
  isMonitored: boolean;
  parentCanView: boolean;
}

// ============= Safety & Moderation =============

export type ReportReason = 
  | 'Harassment' 
  | 'Inappropriate Content' 
  | 'Suspected Grooming'
  | 'Fake Profile'
  | 'Spam'
  | 'Underage User'
  | 'Other';

export interface SafetyReport {
  id: string;
  reporterId: string;
  targetId: string; // User being reported
  reason: ReportReason;
  description: string;
  evidence?: string[]; // Screenshots, message IDs, etc.
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  moderatorNotes?: string;
  actionTaken?: 'warning' | 'suspension' | 'ban' | 'none';
}

export interface UserBlockAction {
  id: string;
  blockerId: string;
  blockedUserId: string;
  timestamp: Date;
  reason?: string;
}

export interface UserStrikeRecord {
  userId: string;
  strikes: number;
  strikeHistory: {
    timestamp: Date;
    reason: string;
    reportId: string;
  }[];
  isSuspended: boolean;
  isBanned: boolean;
  suspensionUntil?: Date;
}

// ============= Parental Control =============

export interface ParentalControlSettings {
  parentUserId: string;
  minorUserId: string;
  
  // Permissions
  requireMatchApproval: boolean;
  requireMeetupApproval: boolean;
  canViewAllMessages: boolean;
  
  // Restrictions
  maxDistance: number; // Max miles minor can match within
  allowedTimeWindows: { start: string; end: string }[]; // e.g. ["09:00", "21:00"]
  restrictedDisciplines?: MartialArtDiscipline[];
  
  // Notifications
  notifyOnNewMatch: boolean;
  notifyOnMeetupProposal: boolean;
  notifyOnReport: boolean;
  
  // Emergency
  emergencyContacts: { name: string; phone: string; relation: string }[];
}

export interface ParentalApprovalRequest {
  id: string;
  parentUserId: string;
  minorUserId: string;
  type: 'match' | 'meetup' | 'chat';
  relatedId: string; // matchId, meetupId, etc.
  requestedAt: Date;
  status: 'pending' | 'approved' | 'denied';
  decidedAt?: Date;
  details: any; // Context-specific details
}

// ============= Matching Algorithm =============

export interface MatchingCriteria {
  userId: string;
  
  // Geographic
  maxDistance: number; // miles
  currentLocation: { lat: number; lng: number };
  
  // Demographics
  ageRange?: { min: number; max: number };
  
  // Martial Arts
  disciplines: MartialArtDiscipline[];
  skillLevels: SkillLevel[];
  trainingGoals: TrainingGoal[];
  
  // Physical compatibility
  weightClasses?: WeightClass[];
  heightRange?: { min: number; max: number };
  
  // Safety
  verifiedOnly: boolean;
  excludeBlockedUsers: boolean;
}

export interface CompatibilityScore {
  targetUserId: string;
  totalScore: number; // 0-100
  breakdown: {
    disciplineMatch: number;
    skillLevelMatch: number;
    goalAlignment: number;
    proximityScore: number;
    availabilityMatch: number;
    physicalCompatibility: number;
  };
}

// ============= Notifications =============

export interface MatchNotification {
  id: string;
  userId: string;
  type: 'new_match' | 'new_message' | 'meetup_proposal' | 'parent_alert' | 'safety_alert';
  title: string;
  message: string;
  relatedId?: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// ============= Filter State =============

export interface SwipeFilters {
  distance: number;
  ageRange: { min: number; max: number };
  disciplines: MartialArtDiscipline[];
  skillLevels: SkillLevel[];
  goals: TrainingGoal[];
  verifiedOnly: boolean;
  availabilityMatch: boolean;
}
