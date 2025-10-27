# Demo User & Journal Seed Data - Implementation Summary

## ✅ Changes Completed

I've successfully added the demo user functionality with seed journal data to your DojoNet app.

## 📝 Files Modified

### 1. **src/store.js**

#### Added DEMO_USER constant:
```javascript
const DEMO_USER = {
  id: 'u_demo',
  name: 'Demo User',
  handle: 'u_demo',
  avatar: 'https://i.pravatar.cc/200?img=68',
  rank: 'BJJ Blue Belt',
  gym: 'DojoNet Academy',
  location: 'Los Angeles, CA',
  bio: 'Just a white belt on the path. OSS!',
  status: 'Training tonight 🥋',
};
```

#### Added seedDemoJournals function:
- Seeds 2 sample journal entries for the demo user
- Entry 1: "BJJ Class – Guard Retention" (2 days ago)
- Entry 2: "Open Mat – Sparring Rounds" (1 day ago)
- Includes realistic metadata: techniques, mood, energy, intensity, recovery
- Only seeds once (checks localStorage first)

#### Added loginAsDemo action:
```javascript
loginAsDemo(){
  const session = { userId: DEMO_USER.id };
  localStorage.setItem('session', JSON.stringify(session));
  seedDemoJournals();
  set({ session }); 
  LS.set('session', session);
  return { ok: true, user: DEMO_USER };
}
```

### 2. **src/pages/TrainingJournal.tsx**

#### Updated imports and state:
- Added `loginAsDemo` to destructured store
- Modified the "not logged in" view to include a "Continue as Demo" button

#### New UI when logged out:
```tsx
<div className="text-center space-y-3">
  <div className="text-[var(--color-text-muted)]">
    <Link to="/login">Login</Link> to access your journal
  </div>
  <button onClick={() => loginAsDemo()}>
    Continue as Demo
  </button>
</div>
```

### 3. **src/pages/Login.jsx**

#### Added quick demo login:
- New `onQuickDemo` handler that calls `loginAsDemo()` and navigates to dashboard
- Added "Continue as Demo" button below existing login options
- Provides quick access without email/password

## 🎯 Features

### Demo User Benefits:
1. **Instant Access**: Click "Continue as Demo" on Login or Training Journal pages
2. **Sample Data**: 2 pre-populated journal entries with realistic training data
3. **No Credentials**: No email/password needed
4. **Persistent**: Uses localStorage, persists across page refreshes

### Sample Journal Entries Include:
- **Entry 1**: Guard retention class with hip escapes and knee shields
- **Entry 2**: Open mat sparring with armbars and sweeps
- Both have full metadata: art, session type, duration, techniques, mood, energy, intensity, recovery

## 🧪 Testing

### To Test:
1. **Logout** if currently logged in
2. Go to `/login` or `/journal`
3. Click **"Continue as Demo"**
4. You'll be redirected to the dashboard
5. Navigate to **Training Journal** to see the 2 sample entries

### Expected Behavior:
- Immediate login as "Demo User"
- Dashboard shows demo user profile
- Training Journal shows 2 entries with full details
- Data persists in localStorage under key `journals_u_demo`

## 📦 Data Structure

Journal entries are stored in localStorage with this structure:
```javascript
{
  id: 'j_demo_1',
  userId: 'u_demo',
  title: 'BJJ Class – Guard Retention',
  body: 'Drilled hip escapes...',
  createdAt: '2025-10-25T...',
  journalMeta: {
    art: 'BJJ',
    sessionType: 'Class',
    durationMin: 90,
    techniques: ['Hip Escape', 'Knee Shield', 'Collar Tie'],
    mood: 'good',
    energy: 7,
    intensity: 6,
    recovery: 6,
    injured: false,
  }
}
```

## 🔄 How It Works

1. User clicks "Continue as Demo"
2. `loginAsDemo()` is called
3. Sets session to `{ userId: 'u_demo' }`
4. Calls `seedDemoJournals()` to create sample entries (if not already created)
5. Updates localStorage with session data
6. User is redirected to dashboard
7. Demo user data is available throughout the app

## 💡 Notes

- Demo user (u_demo) already exists in your seed data
- Journal entries are only created once per browser (checked via localStorage)
- Demo mode works in both development and production
- Users can logout and login again as demo anytime
- The demo journal data is separate from the main posts/chapters system

## ✅ All Done!

The demo user functionality is now fully integrated and ready to use! 🎉
