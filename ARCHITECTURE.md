# DojoNet – Production Architecture

**Tech stack:** React + Vite + Tailwind CSS 3.x (zinc palette) | Node.js + Express + Prisma + PostgreSQL + Redis + BullMQ + Socket.IO

---

## Overview

DojoNet is a martial arts social platform featuring:

- **Forums** (Reddit-style threads, posts, comments, hot/top/new sorting)
- **Journals** (private/friends/public visibility; promote to thread)
- **Feed ranking** (for-you algorithm: engagement + interest + recency)
- **Messaging** (1:1 WebSocket chat with read receipts and typing indicators)
- **Moderation** (reports, admin queue, soft deletes)
- **Auth** (JWT + bcrypt; email or OAuth ready)

---

## Prerequisites

- **Node.js** 18+ (with npm)
- **PostgreSQL** 14+ running locally or remote
- **Redis** 7+ running (for caching and BullMQ job queues)

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo>
cd DojoNet-Local-Prototype-MAX
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required vars:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dojonet?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="<generate with openssl rand -base64 32>"
PORT=8787
NODE_ENV=development
```

### 3. Initialize database

Run Prisma migrations and generate the client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed database

Import existing JSON data (users, threads, posts, comments):

```bash
npm run db:seed
```

This will:
- Create users with default password `password123` (demo only)
- Import forum threads and posts
- Create follow relationships from the old data

### 5. Start services

**Terminal 1:** Redis (if not already running as a service)

```bash
redis-server
```

**Terminal 2:** Express API server

```bash
npm run server
```

**Terminal 3:** Vite dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the port Vite assigns).

---

## Architecture

### Backend

**Prisma schema** (`prisma/schema.prisma`):

- User, Profile, Affiliation
- Follow, Block
- Journal (PRIVATE/FRIENDS/PUBLIC), JComment, Reaction
- Thread, Post, Comment, Vote
- Conversation, Message
- Report, Notification

**Core libraries:**

- `server/lib/db.ts` – Prisma client singleton
- `server/lib/redis.ts` – ioredis client
- `server/lib/auth.ts` – JWT sign/verify + bcrypt
- `server/lib/ranking.ts` – `computeHot`, `engagementScore`, `forYouScore`

**Job queues** (BullMQ):

- Feed score recomputation (periodic)
- Notification dispatch
- Moderation auto-filter queue

### Frontend

**Components** (`src/components/`):

- `HeroSearch.tsx` – Hero with integrated search bar
- `ThreadCard.tsx` – Reddit-style card with vote column
- `CommentItem.tsx` – Inline comment with vote and reply

**Pages** (lazy-loaded via React Router):

- `/` – Home: HeroSearch + Bento grid + For You feed
- `/explore` – Tag-based discovery
- `/thread/:id` – Thread detail with comments
- `/journals` – Private journal list
- `/messages` – 1:1 chat UI
- `/admin/queue` – Moderation dashboard (MOD/ADMIN only)

**State:**

- Zustand for client session
- React Query (optional) for server state caching

**Dark mode:**

- Tailwind `class` strategy: toggle `.dark` on `<html>`

---

## API surface

### Auth

- `POST /api/auth/register` – create account
- `POST /api/auth/login` – returns JWT
- `GET /api/auth/me` – get current user (Bearer token)

### Threads & Posts

- `POST /api/threads` – create thread + root post
- `GET /api/threads?sort=hot|top|new&tag=bjj&cursor=...` – list threads
- `GET /api/threads/:id` – thread detail + root post + comments
- `POST /api/comments` – add comment (threadId, postId, body, parentId?)
- `POST /api/votes` – vote (targetType, targetId, value: UP|DOWN|NEUTRAL)

### Journals

- `POST /api/journals` – create journal (body, visibility, tags[])
- `PATCH /api/journals/:id` – update journal
- `GET /api/journals` – list own journals
- `POST /api/journals/:id/promote` – convert PUBLIC journal → thread

### Feed

- `GET /api/feed?mode=for_you|following&cursor=...` – ranked or chronological
- `GET /api/explore?tags=bjj,muay-thai` – tag-based discovery

### Messaging

- `POST /api/conversations` – create conversation (participantIds[])
- `GET /api/conversations/:id/messages?cursor=...` – message history
- `POST /api/messages` – send message (conversationId, body, mediaUrl?)

**WebSocket events** (Socket.IO):

- `message:new`
- `message:read`
- `typing`

### Moderation

- `POST /api/reports` – report content (targetType, targetId, reason)
- `GET /api/admin/queue` – fetch pending reports (MOD/ADMIN)
- `POST /api/admin/action` – resolve report (remove|lock|warn|ban)

---

## Feed Ranking

### For You mode

```
engagement = likes + 2*comments + 3*shares
interest   = 1 if any(thread.tags ∩ user.interests)
recency    = exp(-age_hours / 24)
score      = 0.5*normalize(engagement) + 0.3*interest + 0.2*recency
```

### Hot score (Reddit)

```
s = upvotes - downvotes
order = log10(max(|s|, 1))
sign = 1 if s>0, -1 if s<0, else 0
seconds = unix_epoch - 1134028003
hot = sign * order + seconds/45000
```

Recomputed on vote and via BullMQ job (every 15 min).

---

## Moderation

1. **User reports** → POST /api/reports
2. **Auto filters** (optional):
   - Text toxicity (Perspective API)
   - Image NSFW detection
3. **Admin dashboard** → GET /api/admin/queue
4. **Actions**:
   - Remove (soft delete)
   - Lock thread
   - Warn user
   - Temp/perma ban

---

## Privacy

- **Journals** default to PRIVATE
- **Promotion** requires visibility === PUBLIC
- **Friends-only** enforced via join on Follow graph
- **Block lists** applied at query layer

---

## Testing

```bash
npm test          # Vitest unit tests
npm run test:ui   # Vitest UI
```

Integration tests for API endpoints and ranking logic recommended.

---

## Deployment

### Database

1. Provision PostgreSQL (e.g., Supabase, Railway, RDS)
2. Run `npx prisma migrate deploy` in prod
3. Seed: `npm run db:seed` (or custom prod seed)

### Redis

Use managed Redis (e.g., Upstash, ElastiCache, Redis Cloud)

### Server

Deploy Express app to:

- Heroku, Render, Railway (Node.js buildpack)
- Fly.io (Dockerfile)
- AWS ECS / GCP Cloud Run (container)

Set env vars:

```
DATABASE_URL=<prod_pg_url>
REDIS_URL=<prod_redis_url>
JWT_SECRET=<secure_random_32_bytes>
NODE_ENV=production
```

### Frontend

Build and deploy static assets:

```bash
npm run build
# dist/ folder → serve via Vercel, Netlify, Cloudflare Pages, S3+CloudFront
```

Or serve from Express (uncomment `app.use(express.static('dist'))` in server).

---

## Scripts

| Command              | Description                                |
|----------------------|--------------------------------------------|
| `npm run dev`        | Start Vite dev server                      |
| `npm run build`      | Build production bundle                    |
| `npm run server`     | Start Express API server                   |
| `npm run db:migrate` | Run Prisma migrations                      |
| `npm run db:seed`    | Seed database from JSON                    |
| `npm run db:studio`  | Open Prisma Studio GUI                     |
| `npm test`           | Run Vitest unit tests                      |

---

## Contributing

1. Fork and clone
2. Create feature branch (`git checkout -b feat/new-thing`)
3. Commit with conventional commits (`feat:`, `fix:`, `docs:`)
4. Push and open PR

---

## License

MIT (or your chosen license)

---

**Questions?** Open an issue or reach out to the team.
