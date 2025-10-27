# Partner Matchmaking Feature - Implementation Guide

## Overview

This document provides a complete guide for implementing the swipe-style martial arts partner matchmaking feature with robust safety measures, OAuth integration, and parental controls.

## Created Files

### 1. Type Definitions
**File:** `src/types/matchmaking.ts`
- Comprehensive TypeScript interfaces for all matchmaking entities
- Safety and moderation types
- Parental control structures
- Matching algorithm types

### 2. Core Components

#### SwipeCard Component
**File:** `src/components/matchmaking/SwipeCard.jsx`
- Tinder-style swipeable profile cards
- Touch gesture support (left/right/up swipes)
- Verification badges display
- Detailed profile modal
- Martial arts-specific UI (belt colors, disciplines, stats)

#### PartnerMatchmaking Page
**File:** `src/pages/PartnerMatchmaking.jsx`
- Main swipe interface
- Age-gated matching algorithm
- Geographic and discipline filtering
- Compatibility scoring system
- Match notifications
- Filter modal with comprehensive options

#### Safety Components
**File:** `src/components/safety/SafetyComponents.jsx`
- Report modal with categorized reasons
- Block confirmation modal
- Content filter utilities (profanity, grooming detection)
- Safety banners and tips
- Strike system indicators
- Moderation status badges

## Key Features Implemented

### 1. Age-Gated Matching
```javascript
// Minors only see minors, adults only see adults
if (currentUser.isMinor && !profile.isMinor) return false;
if (!currentUser.isMinor && profile.isMinor) return false;
```

### 2. Compatibility Scoring
The algorithm scores profiles 0-100 based on:
- Discipline match (30 points)
- Skill level compatibility (20 points)
- Goal alignment (20 points)
- Proximity (15 points)
- Verification status (10 points)
- Age proximity (5 points)

### 3. Content Filtering
- Profanity filtering
- Grooming phrase detection
- Minor-safe content validation
- Automatic message blocking for suspicious content

### 4. Verification System
- OAuth verified badge (Google/Facebook)
- ID verified badge (government ID)
- Parent supervised indicator for minors

## Integration Steps

### Step 1: Add Navigation

Update `src/components/layout/FloatingNav.tsx`:

```jsx
const navItems = [
  { to: '/', icon: icons.home, label: 'Home', color: 'text-blue-500' },
  { to: '/forums', icon: icons.messageSquare, label: 'Forums', color: 'text-green-500' },
  { to: '/training-journal', icon: icons.book, label: 'Journal', color: 'text-orange-500' },
  { to: '/partners', icon: icons.users, label: 'Partners', color: 'text-pink-500' }, // ADD THIS
  { to: '/search', icon: icons.search, label: 'Search', color: 'text-purple-500' },
  { to: '/explore', icon: icons.compass, label: 'Explore', color: 'text-teal-500' },
];
```

### Step 2: Add Routes

Update `src/App.jsx`:

```jsx
import PartnerMatchmaking from './pages/PartnerMatchmaking';
import Matches from './pages/Matches'; // Create this
import ParentalControls from './pages/ParentalControls'; // Create this

// Inside <Routes>:
<Route path="/partners" element={<PartnerMatchmaking />} />
<Route path="/partners/matches" element={<Matches />} />
<Route path="/parents/controls" element={<ParentalControls />} />
```

### Step 3: Update User Store

Add matchmaking fields to `src/store.js`:

```javascript
// In user state:
user: {
  id: '',
  username: '',
  age: null,
  isMinor: false,
  
  // Matchmaking fields
  disciplines: [], // Array of DisciplineExperience objects
  primaryDiscipline: '',
  trainingGoals: [],
  yearsTraining: 0,
  weightClass: '',
  city: '',
  state: '',
  bio: '',
  tagline: '',
  availability: [],
  
  // Parent/minor relationship
  parentUserId: null,
  parentSupervised: false,
  parentApprovalRequired: false,
},
```

### Step 4: Implement OAuth (Placeholder)

Create `src/lib/auth-providers.js`:

```javascript
export const OAuthProviders = {
  google: {
    name: 'Google',
    icon: 'google',
    login: async () => {
      // Implement Google OAuth flow
      // Return user profile with age, email verified status
      console.log('Google OAuth login');
    },
  },
  
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    login: async () => {
      // Implement Facebook OAuth flow
      console.log('Facebook OAuth login');
    },
  },
};
```

## Still Needed (TODO)

### 1. Matches Page
Create `src/pages/Matches.jsx` to display:
- List of matched partners
- Chat interface with content filtering
- Report/block buttons
- Meeting proposal system

### 2. Parental Controls Page
Create `src/pages/ParentalControls.jsx` with:
- View minor's matches and chats
- Approval queue for match requests
- Setting distance/time restrictions
- Safety notifications dashboard

### 3. Chat System
Implement real-time messaging with:
- WebSocket connection
- Message encryption
- Content filtering before delivery
- Parent monitoring for minors
- File/image scanning

### 4. Backend API Integration

#### Required Endpoints:

```
POST   /api/matchmaking/swipe
GET    /api/matchmaking/candidates
POST   /api/matchmaking/match
GET    /api/matchmaking/matches

POST   /api/safety/report
POST   /api/safety/block
GET    /api/safety/strikes/:userId

POST   /api/auth/oauth/google
POST   /api/auth/oauth/facebook
POST   /api/auth/verify-age

POST   /api/parental/link-account
GET    /api/parental/minor-activity
POST   /api/parental/approve-match
PUT    /api/parental/settings
```

### 5. Database Schema

#### Users Table:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INTEGER NOT NULL,
  is_minor BOOLEAN DEFAULT false,
  account_type VARCHAR(20),
  parent_user_id UUID REFERENCES users(id),
  verification_status JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Profiles Table:
```sql
CREATE TABLE partner_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  disciplines JSONB,
  training_goals JSONB,
  location GEOGRAPHY(POINT),
  city VARCHAR(100),
  state VARCHAR(2),
  bio TEXT,
  photos JSONB,
  safety_score INTEGER DEFAULT 100,
  is_verified BOOLEAN DEFAULT false,
  is_id_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_location ON partner_profiles USING GIST(location);
```

#### Matches Table:
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user1_id UUID REFERENCES users(id),
  user2_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  matched_at TIMESTAMP DEFAULT NOW(),
  chat_session_id UUID,
  UNIQUE(user1_id, user2_id)
);
```

#### Swipes Table:
```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY,
  swiper_id UUID REFERENCES users(id),
  target_id UUID REFERENCES users(id),
  direction VARCHAR(10), -- 'left', 'right', 'super'
  timestamp TIMESTAMP DEFAULT NOW(),
  UNIQUE(swiper_id, target_id)
);

CREATE INDEX idx_swipes_target ON swipes(target_id, swiper_id);
```

#### Reports Table:
```sql
CREATE TABLE safety_reports (
  id UUID PRIMARY KEY,
  reporter_id UUID REFERENCES users(id),
  target_id UUID REFERENCES users(id),
  reason VARCHAR(50),
  description TEXT,
  evidence JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  moderator_notes TEXT,
  action_taken VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);
```

#### Blocks Table:
```sql
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY,
  blocker_id UUID REFERENCES users(id),
  blocked_user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_user_id)
);
```

## Safety Implementation Checklist

### Content Monitoring
- [ ] Integrate AI content moderation API (Google Perspective, OpenAI)
- [ ] Implement real-time message scanning
- [ ] Set up grooming detection (Project Artemis patterns)
- [ ] Configure image/video scanning for inappropriate content
- [ ] Build moderation queue dashboard

### Age Verification
- [ ] Integrate ID verification service (Onfido, Jumio, iDenfy)
- [ ] Implement face age estimation fallback
- [ ] Set up parent consent flow (email verification + SMS)
- [ ] Build parent account linking workflow
- [ ] Add COPPA compliance checks

### Reporting & Moderation
- [ ] Create moderator dashboard
- [ ] Set up automated ban triggers (3-strike system)
- [ ] Implement emergency escalation for grooming reports
- [ ] Build audit logging for all safety events
- [ ] Add law enforcement cooperation workflow

### Behavioral Analytics
- [ ] Track suspicious messaging patterns
- [ ] Monitor adult-minor interaction attempts
- [ ] Flag rapid account creation from same IP
- [ ] Detect profile scraping behavior
- [ ] Build risk scoring algorithm

## OAuth Integration Guide

### Google Sign-In
```javascript
// 1. Set up Google Cloud Console project
// 2. Enable Google+ API
// 3. Create OAuth 2.0 credentials
// 4. Install google-auth-library

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  
  return {
    email: payload.email,
    emailVerified: payload.email_verified,
    name: payload.name,
    picture: payload.picture,
    sub: payload.sub, // Unique Google user ID
  };
}
```

### Facebook Login
```javascript
// 1. Create Facebook App
// 2. Add Facebook Login product
// 3. Configure OAuth redirect URIs
// 4. Request permissions: email, public_profile

import { FB } from 'fb-sdk';

FB.init({
  appId: FACEBOOK_APP_ID,
  version: 'v12.0'
});

FB.login((response) => {
  if (response.authResponse) {
    FB.api('/me', { fields: 'name,email,age_range' }, (user) => {
      console.log(user);
    });
  }
}, { scope: 'public_profile,email' });
```

## Testing Scenarios

### Safety Tests
1. **Minor Protection:**
   - Verify minors can't see adult profiles
   - Ensure adult-minor messages are blocked
   - Test parent notification triggers

2. **Content Filtering:**
   - Send messages with profanity → should be censored
   - Send grooming-pattern messages → should be flagged
   - Upload inappropriate image → should be blocked

3. **Reporting:**
   - Submit various report types
   - Verify moderator receives reports
   - Test auto-ban after 3 strikes

### Matching Tests
1. **Algorithm:**
   - Verify compatibility scoring works
   - Test geographic filtering
   - Ensure mutual likes create matches

2. **Age Gating:**
   - Teen accounts only see teens
   - Adult accounts only see adults
   - Age range filters work correctly

## Deployment Considerations

### Environment Variables
```bash
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx
MODERATION_API_KEY=xxx
ID_VERIFICATION_API_KEY=xxx
WEBSOCKET_URL=wss://your-server.com
DATABASE_URL=postgresql://...
```

### Production Checklist
- [ ] Enable HTTPS everywhere
- [ ] Set up rate limiting (prevent swipe spam)
- [ ] Configure CDN for profile images
- [ ] Enable database encryption at rest
- [ ] Set up automated backups
- [ ] Configure monitoring & alerting (Sentry, DataDog)
- [ ] Add GDPR compliance (data export/deletion)
- [ ] Implement session management with JWT
- [ ] Set up DDoS protection
- [ ] Create incident response plan

## Legal & Compliance

### Required Policies
- Privacy Policy (COPPA, GDPR compliant)
- Terms of Service
- Community Guidelines
- Parental Consent Forms
- Age Verification Policy

### Data Protection
- Encrypt sensitive data (birthdates, locations)
- Pseudonymize logs
- Implement data retention limits
- Allow users to delete accounts
- Provide data export functionality

## Monitoring & Analytics

### Key Metrics
- Match success rate
- Swipe-to-match conversion
- Report rate per 1000 users
- Average response time to reports
- Minor account percentage
- Verification completion rate

### Safety Metrics
- False positive rate (blocked legitimate messages)
- False negative rate (missed harmful content)
- Average moderation response time
- Strike rate trends
- Ban rate by reason

## Support & Resources

### Documentation Links
- [COPPA Compliance Guide](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business)
- [Thorn Safety Tech](https://www.thorn.org/)
- [NCMEC Safety Resources](https://www.missingkids.org/netsmartz)

### Community
- Create safety@yourapp.com email
- Set up trust & safety team structure
- Build moderator training program
- Establish escalation procedures

---

## Quick Start Commands

```bash
# Install dependencies (if any new ones needed)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests (when implemented)
npm test
```

## Next Steps

1. Create Matches and ParentalControls pages
2. Implement real backend API
3. Add OAuth providers
4. Set up database with migrations
5. Integrate content moderation service
6. Build moderator dashboard
7. Add comprehensive testing
8. Deploy with proper security measures

---

**Remember:** Safety is paramount. Every feature should be built with a "safety-first" mindset, especially when minors are involved. When in doubt, err on the side of caution and restrict access rather than expose users to potential harm.
