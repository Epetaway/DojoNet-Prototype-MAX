# DojoNet Production Migration - Setup Status

## ✅ Completed

### 1. Routes & Pages
- ✅ Added routes to `App.jsx`:
  - `/dashboard-new` → DashboardNew (3-column layout)
  - `/user/:id` → UserProfile (full profile with tabs)
  - `/profile/edit` → ProfileEditor (edit form)
- ✅ Fixed import paths in all TypeScript pages
- ✅ All new UI components created with zinc Tailwind palette

### 2. Dependencies
- ✅ Installed all packages (Prisma, Redis, Socket.IO, JWT, bcrypt, Zod)
- ✅ Fixed version conflicts (BullMQ 5.28.1, tsx 4.19.2)
- ✅ Generated Prisma client

### 3. Database Schema
- ✅ Complete Prisma schema with 15 models
- ✅ Enums: Visibility, Role, VoteValue, ContentType
- ✅ Indexes: GIN on tags, composite on (score DESC, id), (createdAt DESC, id)
- ✅ Seed script fixed (using string literals instead of enum imports)

### 4. Backend Infrastructure
- ✅ `server/lib/db.ts` - Prisma client singleton
- ✅ `server/lib/redis.ts` - ioredis client
- ✅ `server/lib/auth.ts` - JWT + bcrypt
- ✅ `server/lib/ranking.ts` - Hot score, engagement score, for-you algorithms

### 5. UI Components (Zinc Palette)
**Dashboard Components:**
- ✅ `PostCard.tsx` - User post with likes/comments/share
- ✅ `JournalCard.tsx` - Training journal with visibility badge
- ✅ `MiniProfileCard.tsx` - Condensed user card
- ✅ `NavItem.tsx` - Sidebar nav with active state

**Profile Components:**
- ✅ `ProfileHero.tsx` - Profile header with avatar, rank, affiliation
- ✅ `ProfileStats.tsx` - Followers/following/posts/journals
- ✅ `ProfileTabs.tsx` - Posts/Journals/Media/Friends toggle

**General Components:**
- ✅ `HeroSearch.tsx` - Hero with search bar
- ✅ `ThreadCard.tsx` - Reddit-style thread card
- ✅ `CommentItem.tsx` - Inline comment with voting

### 6. Configuration
- ✅ `.env` file created with DATABASE_URL, REDIS_URL, JWT_SECRET
- ✅ Tailwind config updated (zinc palette, brand crimson, shadow utilities)
- ✅ `ARCHITECTURE.md` documentation complete

---

## 🔧 Next Steps (In Order)

### Step 1: Setup PostgreSQL (Required)
```bash
# Install PostgreSQL (if not installed)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb dojonet

# Run migration
npx prisma migrate dev --name init
```

### Step 2: Setup Redis (Optional for now)
```bash
# Install Redis (if not installed)
brew install redis
brew services start redis

# Verify
redis-cli ping  # Should return PONG
```

### Step 3: Seed Database
```bash
npm run db:seed
```

### Step 4: Test New Pages
```bash
# Terminal 1: Start dev server
npm run dev

# Visit in browser:
# http://localhost:5173/dashboard-new
# http://localhost:5173/user/1
# http://localhost:5173/profile/edit
```

### Step 5: Server Migration (High Priority)
Refactor `server/index.js` → `server/index.ts`:

1. **Replace JSON operations with Prisma:**
   ```typescript
   // Before: fs.readFileSync, fs.writeFileSync
   // After: prisma.user.findMany(), prisma.user.create()
   ```

2. **Add JWT middleware:**
   ```typescript
   import { verifyToken } from './lib/auth.js'
   
   function authMiddleware(req, res, next) {
     const token = req.headers.authorization?.replace('Bearer ', '')
     if (!token) return res.status(401).json({ error: 'No token' })
     try {
       req.user = verifyToken(token)
       next()
     } catch {
       res.status(401).json({ error: 'Invalid token' })
     }
   }
   ```

3. **Implement new endpoints:**
   - `POST /api/journals` (with visibility enforcement)
   - `POST /api/journals/:id/promote` (PUBLIC → thread)
   - `POST /api/conversations`, `GET /api/conversations/:id/messages`
   - `POST /api/messages`
   - `POST /api/reports`, `GET /api/admin/queue`

4. **Wire Socket.IO:**
   ```typescript
   import { Server } from 'socket.io'
   const io = new Server(server, { cors: { origin: '*' } })
   
   io.on('connection', (socket) => {
     socket.on('message:new', async (data) => {
       // Save to DB, emit to recipient
     })
     socket.on('typing', (data) => {
       socket.to(data.conversationId).emit('typing', data)
     })
   })
   ```

### Step 6: BullMQ Worker (Optional)
Create `server/workers/feed-scorer.ts`:
```typescript
import { Worker } from 'bullmq'
import { redis } from '../lib/redis.js'
import { prisma } from '../lib/db.js'
import { computeHot } from '../lib/ranking.js'

const worker = new Worker('feed-recompute', async (job) => {
  const threads = await prisma.thread.findMany()
  for (const thread of threads) {
    const score = computeHot(thread.votesUp, thread.votesDown, thread.createdAt)
    await prisma.thread.update({
      where: { id: thread.id },
      data: { score }
    })
  }
}, { connection: redis })
```

### Step 7: Frontend Integration
Update `src/lib/api.js` to handle TypeScript responses:
```javascript
// Add type guards for new API responses
export async function getJournals(userId) {
  const res = await fetch(`/api/users/${userId}/journals`)
  return res.json()
}

export async function createJournal(data) {
  const res = await fetch('/api/journals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}
```

### Step 8: Mobile Responsive
Add bottom nav for mobile in DashboardNew:
```tsx
{/* Show on mobile (<lg), hide sidebar and right panel */}
<nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800">
  {/* Navigation items */}
</nav>
```

### Step 9: Testing
1. Test new pages render correctly
2. Test authentication flow with JWT
3. Test database operations (CRUD)
4. Test WebSocket messaging
5. Test feed ranking algorithms

---

## 📝 Known Issues

1. **React key prop warnings** in DashboardNew, UserProfile
   - Not critical, won't affect runtime
   - Can fix by updating component prop types

2. **CSS @tailwind warnings** in index.css
   - Just linter noise, Tailwind processes correctly
   - Safe to ignore

3. **React version mismatch** (18.3.1 vs 19.0.0)
   - npm warnings during install
   - No functional impact observed

---

## 🎨 UI Components Reference

### DashboardNew (3-column layout)
- Sidebar: w-60 fixed, NavItems with icons
- Feed: flex-1, "Welcome back" + journals + For You feed
- Right panel: w-80 fixed, MiniProfileCard + suggested users + trending

### UserProfile
- ProfileHero: Banner with overlay, avatar, rank, affiliation, bio
- ProfileStats: Followers/following/posts/journals counts
- ProfileTabs: Posts | Journals | Media | Friends
- Content: Renders PostCard or JournalCard based on active tab

### ProfileEditor
- Avatar upload with preview
- Form fields: name, username, bio, rank, gym, location
- Privacy toggle (custom switch UI)
- Interests selection (BJJ, Muay Thai, Wrestling, etc.)
- Save/Cancel actions

---

## 🎯 Production Checklist

- [ ] PostgreSQL running and migrated
- [ ] Redis running
- [ ] JWT_SECRET set (strong random value)
- [ ] Server refactored to TypeScript
- [ ] All endpoints migrated to Prisma
- [ ] Socket.IO wired for messaging
- [ ] BullMQ worker for feed scoring
- [ ] Mobile responsive bottom nav
- [ ] S3 configured for avatar uploads
- [ ] Error boundaries in React
- [ ] Loading states for async operations
- [ ] Toast notifications for user actions
- [ ] SEO meta tags
- [ ] Rate limiting on API endpoints
- [ ] Input validation with Zod
- [ ] HTTPS in production
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Monitoring/logging (Sentry, LogRocket)

---

## 🚀 Quick Start Commands

```bash
# Setup database
createdb dojonet
npx prisma migrate dev --name init
npm run db:seed

# Start all services
brew services start postgresql@14
brew services start redis

# Development
npm run dev          # Frontend (port 5173)
npm run server       # Backend (port 3000, after migration)

# Database tools
npm run db:studio    # Prisma Studio GUI
npx prisma migrate reset  # Reset and re-seed
```

---

## 📚 Documentation

- Full architecture: `ARCHITECTURE.md`
- Prisma schema: `prisma/schema.prisma`
- API endpoints: See ARCHITECTURE.md § API Surface
- Ranking algorithms: See ARCHITECTURE.md § Feed Ranking
- Tailwind config: `tailwind.config.js` (zinc palette, brand colors)

---

Last updated: 2025-01-23
