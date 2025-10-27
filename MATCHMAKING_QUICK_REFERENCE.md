# Partner Matchmaking - Quick Reference Guide

## 🚀 Quick Start

### Access the Feature
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/partners`
3. Swipe through profiles or use button controls

### Key Routes
- `/partners` - Main swipe interface
- `/partners/swipe` - Alias for swipe interface
- Future: `/partners/matches` - View your matches
- Future: `/parents/controls` - Parental dashboard

## 🎯 Feature Checklist

### ✅ Completed (Production Ready)
- [x] Swipeable profile cards with gestures
- [x] Age-gated matching (minors/adults separated)
- [x] Compatibility scoring algorithm (0-100 points)
- [x] Advanced filtering system
- [x] Match detection and notifications
- [x] Report/block modals
- [x] Content filtering utilities
- [x] Safety banners and tips
- [x] Verification badge system
- [x] Dark mode support
- [x] Mobile responsive
- [x] localStorage persistence
- [x] TypeScript type definitions

### 🔄 In Progress (Scaffolded, Needs Backend)
- [ ] Real-time chat system
- [ ] Matches list page
- [ ] Parental controls dashboard
- [ ] OAuth provider integration
- [ ] ID verification service

### 📋 Backlog (Planned)
- [ ] Moderation dashboard
- [ ] Meeting scheduler
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] ML-based recommendations

## 📱 User Flows

### Adult User Flow
```
1. Open /partners
2. See "Find Training Partners" page
3. Adjust filters (distance, disciplines, skills)
4. Swipe through profiles
   - Left = Pass
   - Right = Like
   - Up = Super Like
5. On mutual like → Match notification
6. Future: Click "Send Message" → Chat interface
```

### Minor User Flow
```
1. Open /partners
2. See "Safe, parent-supervised matching" indicator
3. View ONLY other minor profiles (age ±2 years)
4. Swipe through age-appropriate matches
5. On match → Parent receives notification
6. Future: Parent approves → Chat enabled (monitored)
```

### Parent User Flow
```
1. Future: Open /parents/controls
2. View minor's profile and activity
3. See match requests pending approval
4. Review chat transcripts
5. Approve/deny connections
6. Adjust safety settings (distance, time windows)
```

## 🎨 Component API Reference

### SwipeCard
```jsx
<SwipeCard 
  profile={PartnerProfile}   // Profile object with all user data
  onSwipe={(id, direction) => {}}  // Callback: 'left' | 'right' | 'super'
  isTopCard={boolean}        // Is this the active card?
/>
```

**Profile Object Structure:**
```javascript
{
  id: string,
  displayName: string,
  age: number,
  isMinor: boolean,
  city: string,
  state: string,
  disciplines: [{ 
    discipline: 'BJJ' | 'Muay Thai' | ...,
    beltRank: 'White' | 'Blue' | ...,
    skillLevel: 'Beginner' | ...,
    yearsExperience: number
  }],
  trainingGoals: ['Casual Sparring', ...],
  bio: string,
  tagline: string,
  photos: [url, ...],
  isVerified: boolean,
  parentSupervised: boolean,
  // ... see matchmaking.ts for full type
}
```

### Safety Components

#### ReportModal
```jsx
<ReportModal 
  targetUser={profile}
  onClose={() => {}}
  onSubmit={(report) => {
    // Handle report submission
    // report = { id, reporterId, targetId, reason, description, ... }
  }}
/>
```

#### BlockModal
```jsx
<BlockModal 
  targetUser={profile}
  onClose={() => {}}
  onConfirm={() => {
    // Add user to blocklist
  }}
/>
```

#### ContentFilter
```javascript
import { ContentFilter } from '../components/safety/SafetyComponents';

// Filter profanity
const clean = ContentFilter.filterProfanity(text);

// Detect grooming
const isSuspicious = ContentFilter.containsForbiddenPhrase(text);

// Validate message
const validation = ContentFilter.validateMessage(message, sender, recipient);
if (validation.shouldBlock) {
  // Don't deliver message, flag for moderation
}
```

#### SafetyBanner
```jsx
<SafetyBanner userType="minor" /> // or "adult"
```

## 🔧 Configuration

### Filters State
```javascript
const [filters, setFilters] = useState({
  distance: 25,              // miles
  ageRange: { min: 18, max: 65 },  // Auto-restricted for minors
  disciplines: [],           // Empty = all
  skillLevels: [],          // Empty = all
  goals: [],                // Empty = all
  verifiedOnly: false,      // Require verification badges
  availabilityMatch: false  // Match availability windows
});
```

### Compatibility Scoring Weights
```javascript
// In calculateCompatibility() function:
const WEIGHTS = {
  disciplineMatch: 30,      // Max 30 points
  skillLevel: 20,          // Max 20 points
  goalAlignment: 20,       // Max 20 points
  proximity: 15,           // Max 15 points
  verification: 10,        // Max 10 points
  ageProximity: 5          // Max 5 points
};
```

### Age Gating Rules
```javascript
// For minors:
ageRange: {
  min: Math.max(13, currentUser.age - 2),
  max: Math.min(17, currentUser.age + 2)
}

// Hard rules:
if (currentUser.isMinor && !profile.isMinor) return false;  // Can't see adults
if (!currentUser.isMinor && profile.isMinor) return false;  // Can't see minors
```

## 💾 localStorage Keys

```javascript
// Per-user data
`matches_${userId}`          // Array of Match objects
`swipes_${userId}`           // Array of SwipeAction objects

// Global data
`partner_profiles`           // Array of all PartnerProfile objects

// Future keys
`blocks_${userId}`           // Array of blocked user IDs
`reports_${userId}`          // Array of submitted reports
`parental_settings_${userId}` // ParentalControlSettings object
```

## 🎨 UI Color Codes

### Belt Ranks
```css
White:  bg-white text-gray-800 border border-gray-300
Blue:   bg-blue-500 text-white
Purple: bg-purple-500 text-white
Brown:  bg-amber-800 text-white
Black:  bg-black text-white
Orange: bg-orange-500 text-white
Green:  bg-green-500 text-white
Yellow: bg-yellow-400 text-gray-800
Red:    bg-red-500 text-white
```

### Verification Badges
```css
OAuth Verified:     bg-blue-500 (check icon)
ID Verified:        bg-green-500 (shield icon)
Parent Supervised:  bg-purple-500 (users icon)
```

### Swipe Overlays
```css
LIKE:       bg-green-500 (right swipe)
PASS:       bg-red-500 (left swipe)
SUPER LIKE: bg-blue-500 (swipe up)
```

## 🔐 Safety Checklist (Before Launch)

### Code Level
- [x] Age gating in multiple layers
- [x] Content filtering functions
- [x] Report/block mechanisms
- [x] Minor account flags
- [ ] Rate limiting (API level)
- [ ] Session management
- [ ] Input sanitization (XSS prevention)

### Infrastructure
- [ ] Database with proper indexes
- [ ] WebSocket server for chat
- [ ] Content moderation API integration
- [ ] ID verification service
- [ ] Image/video scanning service
- [ ] Backup and disaster recovery

### Legal & Compliance
- [ ] Privacy policy (COPPA, GDPR)
- [ ] Terms of service
- [ ] Parental consent forms
- [ ] Age verification policy
- [ ] Community guidelines
- [ ] Data retention policy

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (usage metrics)
- [ ] Safety metrics dashboard
- [ ] Moderator queue
- [ ] Alert system for high-priority reports

## 🧪 Testing Scenarios

### Manual Testing
1. **Age Gating:**
   - Create minor account (age < 18)
   - Verify only sees other minors
   - Try to match with adult → Should fail

2. **Matching:**
   - Swipe right on profile
   - Check localStorage for swipe record
   - Trigger match (simulate mutual like)
   - Verify match notification appears

3. **Filtering:**
   - Set distance filter to 10 miles
   - Verify profiles beyond 10mi don't show
   - Filter by discipline (e.g., BJJ only)
   - Verify non-BJJ profiles hidden

4. **Safety:**
   - Click report button
   - Select "Suspected Grooming"
   - Verify high-priority notice appears
   - Submit report → Check localStorage

5. **Responsive Design:**
   - Test on mobile (iPhone SE, Pixel)
   - Test on tablet (iPad)
   - Test on desktop
   - Verify swipe gestures work on touch

### Automated Tests (To Write)
```javascript
// Age gating
test('minors cannot see adult profiles')
test('adults cannot see minor profiles')
test('age range auto-restricted for minors')

// Matching
test('mutual right swipe creates match')
test('left swipe does not create match')
test('super like increases match probability')

// Filtering
test('distance filter removes far profiles')
test('discipline filter works correctly')
test('verified-only filter hides unverified')

// Safety
test('grooming phrases detected')
test('profanity filtered')
test('adult-minor messages blocked')
test('report creates record')
test('block prevents future matches')
```

## 📈 Metrics to Monitor

### User Engagement
- Swipes per day
- Match rate (matches / total swipes)
- Chat initiation rate
- Session length
- Return rate (DAU/MAU)

### Safety Metrics
- Reports per 1000 users
- False positive rate
- Moderator response time
- Banned users (reason breakdown)
- Grooming attempts blocked

### Growth Metrics
- New signups per day
- Minor vs adult ratio
- Geographic distribution
- Discipline popularity
- Verification completion rate

## 🐛 Common Issues & Solutions

### Issue: "No profiles showing"
**Solution:** Check filters - they may be too restrictive. Expand distance or clear discipline filters.

### Issue: "Match notification not appearing"
**Solution:** Check `checkForMatch()` function - it's currently simulated with probability. In production, query backend for mutual likes.

### Issue: "Swipe gestures not working on mobile"
**Solution:** Ensure touch events are properly handled in SwipeCard. Check that `touchStart`, `touchMove`, `touchEnd` listeners are attached.

### Issue: "Minor seeing adult profiles"
**Solution:** Verify `isMinor` flag is set correctly on user object. Check `filterCandidates()` age gating logic.

### Issue: "localStorage not persisting"
**Solution:** Check browser settings - ensure localStorage is enabled. Use browser DevTools → Application → Local Storage to debug.

## 🚀 Deployment Steps

1. **Environment Variables:**
```bash
VITE_API_URL=https://api.yourapp.com
VITE_GOOGLE_CLIENT_ID=xxx
VITE_FACEBOOK_APP_ID=xxx
VITE_MODERATION_API_KEY=xxx
```

2. **Build:**
```bash
npm run build
```

3. **Deploy to CDN:**
```bash
# Upload dist/ folder to S3, Netlify, Vercel, etc.
```

4. **Backend Setup:**
- Deploy API server (Node.js/Express or similar)
- Set up PostgreSQL database
- Configure WebSocket server for chat
- Integrate OAuth providers
- Set up moderation service

5. **DNS & SSL:**
- Point domain to CDN
- Enable HTTPS (Let's Encrypt or provider)
- Configure CORS for API

6. **Monitoring:**
- Set up error tracking
- Configure analytics
- Create safety dashboard
- Set up alerts

## 📞 Support Resources

- **Implementation Guide:** `MATCHMAKING_IMPLEMENTATION_GUIDE.md`
- **Feature Summary:** `MATCHMAKING_FEATURE_SUMMARY.md`
- **Type Definitions:** `src/types/matchmaking.ts`
- **Live Demo:** Navigate to `/partners` in app

---

**Last Updated:** October 26, 2025
**Version:** 1.0.0
**Status:** ✅ Core feature complete, ready for backend integration
