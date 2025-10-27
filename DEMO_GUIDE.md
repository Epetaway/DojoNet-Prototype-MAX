# 🎮 DojoNet Demo Guide

## Quick Start

1. **Start the app** (if not already running):
   ```bash
   npm run dev
   ```

2. **Login as Demo User**:
   - Go to `/login`
   - Click "Demo User" or type "demo"

3. **Test Features in Order**:

---

## 🧪 Feature Testing Checklist

### ✅ 1. Post Reactions (2 minutes)
- [x] Go to `/dashboard`
- [x] Find any post in the feed
- [x] Click the heart icon ❤️
- [x] Watch it fill with color
- [x] See the count increment
- [x] Click again to unlike
- [x] Watch it go back to outline

**Expected Result:** Heart toggles between filled/outline, count updates instantly.

---

### ✅ 2. Comment Thread (3 minutes)
- [x] Find a post with comments (look for 💬 3 or similar)
- [x] Click the comment icon or number
- [x] Watch the thread expand
- [x] See existing comments from bots
- [x] Type "Testing comments!" in the input
- [x] Click the send button →
- [x] See your comment appear immediately

**Expected Result:** Comments expand smoothly, your comment appears at bottom.

---

### ✅ 3. Bot Activity (1 minute)
- [x] Open browser console (F12)
- [x] Watch for bot messages:
  ```
  🤖 Jason Doe liked a post by Demo User
  🤖 Maria Tan commented: "Great technique!"
  ```
- [x] Wait 30-60 seconds
- [x] Refresh the feed
- [x] See new likes/comments from bots

**Expected Result:** Bots interact with posts every ~30 seconds.

---

### ✅ 4. Notifications (5 minutes)
- [x] Look at the bell icon 🔔 in header
- [x] Wait for bots to interact with your posts
- [x] Watch the red badge appear (may take 30-60s)
- [x] Click the bell icon
- [x] See dropdown with notifications
- [x] Click a notification
- [x] Navigate to that post
- [x] See the interaction (like or comment)

**Expected Result:** 
- Badge shows unread count
- Dropdown shows bot interactions
- Clicking notification navigates to post

---

### ✅ 5. Onboarding Flow (3 minutes)
- [x] Logout (top right)
- [x] Go to `/signup`
- [x] Create a test account
- [x] **Step 1**: Click Continue
- [x] **Step 2**: Enter name, username, location, song URL (optional)
- [x] **Step 3**: Pick 3 interests (BJJ, Muay Thai, etc.)
- [x] **Step 4**: Add practice claims (skip or fill)
- [x] **Step 5**: Choose a theme (Ocean Blue, Tatami Gold, Iron Indigo, Neon Pink)
- [x] **Step 6**: Review and finish

**Expected Result:** 6-step flow completes, theme applied to profile.

---

### ✅ 6. Profile Features (2 minutes)
- [x] Go to `/u/u_demo` (or click "View Profile" in sidebar)
- [x] See profile theme colors
- [x] Look for Dojo Circle (Top 8 friends)
- [x] Check if music player appears (if song URL set)
- [x] Scroll through profile sections

**Expected Result:** Profile shows theme, Dojo Circle, and optional music player.

---

### ✅ 7. Test Profiles Page (1 minute)
- [x] Go to `/test-profiles`
- [x] See all 11 users displayed
- [x] Each card shows:
  - Avatar
  - Name
  - Rank
  - Theme color
  - Music status (✓ or ✗)
  - Verified badge (if applicable)
- [x] Click "View Profile" on any user
- [x] Navigate to their profile page

**Expected Result:** Grid of all users with metadata.

---

## 🎯 Advanced Testing

### Create Your Own Post
1. Go to `/dashboard`
2. Find "What's on your mind?" composer
3. Type a post: "Testing the new features!"
4. Click "Post"
5. See it appear at top of feed
6. Wait 30-60 seconds
7. Check notifications for bot interactions

### Test Comment Threading
1. Create a new post
2. Wait for a bot to comment
3. Reply to the bot's comment
4. See your reply appear
5. Check that comment count increments

### Test Notification Persistence
1. Get some notifications (wait for bots)
2. Click "Mark all read"
3. Refresh the page
4. Notifications still show (read state persists)
5. Log out and back in
6. Notifications are still there

---

## 🐛 Troubleshooting

### No Notifications Appearing
- Wait 30-60 seconds for bots to act
- Check console for "🤖" messages
- Make sure you have PUBLIC posts
- Try creating a new post

### Comments Not Showing
- Check if post has `comments` array
- Refresh the page
- Clear localStorage: `localStorage.clear()`
- Re-login

### Bot Activity Stopped
```javascript
// In browser console:
import('./lib/botActivity').then(m => m.botActivitySystem.start())
```

### Theme Not Applying
- Complete full onboarding flow
- Or manually set in `/profile-editor`
- Check `localStorage.getItem('users')` for theme value

---

## 📊 What to Look For

### Good Signs ✅
- Heart icon fills when clicked
- Comment count increments
- Notification badge appears
- Bot console messages every 30s
- Smooth transitions and animations
- No console errors

### Issues to Report 🚨
- TypeScript errors in console
- Broken images
- UI not responsive
- Slow performance (>1s delays)
- Data not persisting

---

## 💡 Pro Tips

1. **Use Dev Banner**: On homepage, click "Test Profiles" link
2. **Console Logging**: Keep it open to see bot activity
3. **localStorage**: Check `Application > Local Storage` in DevTools
4. **Multiple Users**: Create test accounts to see friend networks
5. **Refresh**: If stuck, refresh the page (localStorage persists)

---

## 🎨 Visual Features to Notice

### Theme System
- Profile header has colored overlay
- Dot/grid patterns in background
- Consistent color throughout profile

### Micro-interactions
- Heart fills with animation
- Comment thread slides open
- Notification dropdown fades in
- Hover states on buttons

### Responsive Design
- Feed adapts to screen size
- Comments indent properly
- Notification panel scrolls smoothly

---

## 📸 Screenshot Opportunities

1. **Feed with comments open** - Shows threading
2. **Notification dropdown** - Shows badge + list
3. **Profile with theme** - Shows color system
4. **Onboarding theme picker** - Shows 4 options
5. **Test profiles grid** - Shows all 11 users

---

## ✅ Final Checklist

Before considering testing complete:

- [ ] Liked at least one post
- [ ] Commented on at least one post
- [ ] Received at least one notification
- [ ] Clicked a notification
- [ ] Completed onboarding flow
- [ ] Viewed a user profile
- [ ] Saw bot activity in console
- [ ] Tested theme picker
- [ ] Visited test profiles page
- [ ] Created at least one post

---

## 🚀 Next Session Preview

When you're ready to continue, we can add:

1. **Dojo Circle Editing** - Drag-and-drop reordering
2. **Friend Picker Modal** - Add/remove from Top 8
3. **Reply to Comments** - Nested comment threads
4. **Like Comments** - Heart icon on comments
5. **Music Player Controls** - Volume, skip, playlist

---

**Happy Testing! 🥋**

