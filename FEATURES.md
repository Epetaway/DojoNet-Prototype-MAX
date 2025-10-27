# DojoNet Features Documentation

## ✅ Completed Features

### 1. Enhanced Search & Discovery System
**Location:** `src/pages/Search.tsx`

Features:
- **Unified Search**: Search across users, posts, and tags in one interface
- **Advanced Filters**: Filter by martial art, rank, and location
- **Trending Tags**: Display popular hashtags
- **Recent Searches**: Track and display recent search history
- **Tabbed Results**: Organize search results by type (Users, Posts, Tags)
- **Mobile Responsive**: Optimized for all screen sizes

**Integration:**
- Accessible from floating nav bar
- Uses Zustand store for data
- Persists recent searches in localStorage

---

### 2. Advanced Notification System
**Location:** `src/pages/NotificationsPage.tsx`

Features:
- **Notification Center**: Full-page notification management
- **6 Notification Types**:
  - Likes (red indicator)
  - Comments (blue indicator)
  - Follows (green indicator)
  - Messages (purple indicator)
  - Event shares (orange indicator)
  - System notifications (gray indicator)
- **Filtering**: Filter by notification type
- **Preferences**: Customize notification settings
- **Actions**: Mark as read, delete individual, delete all
- **Real-time Updates**: Shows latest notifications first

**Integration:**
- Linked from notification dropdown in header
- Uses Zustand store
- Persists preferences in localStorage

---

### 3. Direct Messaging System
**Location:** `src/pages/Messages.tsx`

Features:
- **Conversation List**: View all conversations with search
- **Real-time Chat**: Send and receive messages
- **Unread Badges**: Shows unread message counts
- **User Search**: Find users to start new conversations
- **Mobile Responsive**: Optimized layout for mobile/desktop
- **Auto-scroll**: Automatically scrolls to latest message
- **Read Status**: Track read/unread messages

**Store Functions:**
- `getOrCreateConversation(userId1, userId2)`
- `sendMessage(conversationId, text)`
- `getConversationMessages(conversationId)`
- `getUserConversations(userId)`
- `markMessagesAsRead(conversationId, userId)`
- `getUnreadCount(conversationId, userId)`
- `deleteConversation(conversationId)`

**Integration:**
- Accessible from floating nav and user profiles
- Message button on other users' profiles
- Persists in localStorage

---

### 4. Training Journal Enhancement
**Location:** `src/pages/TrainingJournal.tsx`

Features:
- **4 Main Tabs**:
  1. **Entries**: View training journal posts with discipline filters
  2. **Techniques**: Track techniques with proficiency levels
  3. **Progress**: View stats and proficiency charts
  4. **Goals**: Set and track training goals with progress bars

- **Technique Tracking**:
  - Add techniques with categories (submissions, takedowns, guard, etc.)
  - Track proficiency: Learning → Practicing → Comfortable → Mastered
  - Edit and delete techniques
  - Filter by discipline

- **Goal Management**:
  - Create goals with target dates
  - Track progress with slider (0-100%)
  - Auto-complete goals at 100%
  - Delete goals

- **Progress Visualization**:
  - Total technique count by proficiency
  - Active goals overview
  - Recent training activity

**Store Functions:**
- Techniques and goals stored per-user in localStorage
- Integrated with existing journal posts

---

### 5. Event Features System
**Location:** `src/pages/EventDetail.jsx`, `src/store.js`

Features:
- **RSVP System**:
  - Going/Interested status
  - View RSVP counts
  - Toggle RSVP status
  
- **Event Comments**:
  - Add comments to events
  - Like/unlike comments
  - View all discussions
  
- **Event Sharing**:
  - Share events with friends
  - Add custom message
  - Creates notifications for recipients
  
- **Event Reminders**:
  - Set custom reminder date/time
  - View active reminders
  - Remove reminders

- **Enhanced Event Details**:
  - Tabbed interface (Details/Discussion)
  - RSVP counts display
  - Comment section with like functionality
  - Share modal with friend selection
  - Reminder modal with date/time picker
  - Calendar integration (.ics download, Google Calendar)

**Store Functions:**
```javascript
// RSVP Management
rsvpToEvent(eventId, status)          // RSVP with 'going', 'interested', or 'not_going'
getEventRSVP(eventId)                 // Get user's RSVP status
getEventRSVPCounts(eventId)           // Get counts for each RSVP type

// Comments
addEventComment(eventId, text)        // Add comment to event
getEventComments(eventId)             // Get all event comments
likeEventComment(eventId, commentId)  // Like/unlike comment

// Sharing
shareEvent(eventId, friendIds, message) // Share event with friends

// Reminders
setEventReminder(eventId, reminderTime)  // Set reminder
getUserEventReminders()                  // Get user's reminders
removeEventReminder(eventId)             // Cancel reminder
```

**Data Storage:**
- `eventRSVPs` - RSVP status per user per event
- `eventComments` - Comments per event
- `eventShares` - Share history
- `eventReminders` - User reminders
- All persisted in localStorage

**Integration:**
- Works with external event API (IBJJF, Smoothcomp, etc.)
- Creates notifications when events are shared
- Compatible with existing notification system
- Accessible from `/event/:id` route

---

## Tech Stack

- **Frontend**: React + TypeScript/JSX + Vite
- **State Management**: Zustand
- **Persistence**: localStorage with sync wrapper
- **Styling**: Tailwind CSS + Custom CSS variables
- **Icons**: FontAwesome + Lucide
- **Routing**: React Router v6

---

## Architecture

### Store Structure (`src/store.js`)
- **Session**: User authentication
- **Users**: User profiles and data
- **Posts**: All content (posts, journals, events)
- **Comments**: Post comments with nested replies
- **Conversations**: Message conversations
- **Messages**: Direct messages
- **Notifications**: User notifications
- **Techniques**: Training techniques per user
- **Goals**: Training goals per user
- **Event Data**: RSVPs, comments, shares, reminders

### localStorage Keys
- `session` - Current user session
- `users` - All users
- `posts` - All posts/journals/events
- `comments` - All comments
- `conversations` - Message conversations
- `messages` - Direct messages
- `notifications_{userId}` - Per-user notifications
- `techniques_{userId}` - Per-user techniques
- `goals_{userId}` - Per-user goals
- `eventRSVPs` - Event RSVP data
- `eventComments` - Event comments
- `eventShares` - Event share history
- `eventReminders` - Event reminders
- `searchPreferences` - Search preferences
- `notificationPreferences` - Notification settings
- `recentSearches` - Recent search history

---

## Future Enhancements

### Backend Integration
- All features use `USE_BACKEND` flag for optional API calls
- Ready to switch from localStorage to REST API
- API endpoints stubbed in store functions

### Potential Features
1. **Real-time Updates**: WebSocket integration for live messaging
2. **Push Notifications**: Browser notifications for events
3. **Media Upload**: Images/videos in posts and messages
4. **Event Calendar**: Full calendar view of events
5. **Advanced Analytics**: Training progress charts and insights
6. **Social Features**: Friend recommendations, mutual connections
7. **Groups/Teams**: Create and manage training groups
8. **Achievements**: Badges and milestones
9. **Video Integration**: Technique videos and tutorials
10. **Geolocation**: Find nearby events and gyms automatically

---

## Development

### Running the App
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Testing
- Manual testing via browser
- All features working with localStorage
- No compilation errors
- Mobile responsive verified

---

## Version History

### v0.5.0 (Current)
- ✅ Enhanced Search & Discovery
- ✅ Advanced Notification System
- ✅ Direct Messaging
- ✅ Training Journal Enhancements
- ✅ Event Features (RSVP, Comments, Sharing, Reminders)

### v0.4.0
- Comment likes and nested replies
- Notification dropdown
- Profile enhancements

### v0.3.0
- Initial social features
- Post creation and viewing
- Basic user profiles

---

## Support

For issues or questions, refer to the codebase or create an issue in the repository.
