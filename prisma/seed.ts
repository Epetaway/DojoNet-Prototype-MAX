// Prisma seed script: import existing JSON data into PostgreSQL
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { hashPassword } from '../server/lib/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const prisma = new PrismaClient()

const DATA_PATH = path.join(__dirname, '../server/data.json')

interface OldUser {
  id: string
  name: string
  email?: string
  role?: string
  rank?: string
  gym?: string
  location?: string
  bio?: string
  status?: string
  avatar?: string
  banner?: string
  posts?: Array<{ id: string; title: string; date: string; type: string }>
  comments?: Array<{ id: string; userId: string; text: string; ts: number }>
  following?: string[]
  followers?: string[]
  verifiedGym?: boolean
  rankLevel?: number
}

interface OldThread {
  id: string
  authorId: string
  title: string
  createdAt: number
  votesUp?: number
  votesDown?: number
  score?: number
  tags?: string[]
}

interface OldPost {
  id: string
  threadId: string
  authorId: string
  body: string
  createdAt: number
}

interface OldComment {
  id: string
  threadId: string
  postId?: string
  authorId: string
  body: string
  createdAt: number
  votesUp?: number
  votesDown?: number
}

async function main() {
  console.log('🌱 Seeding database...')

  // Load JSON data
  const raw = fs.readFileSync(DATA_PATH, 'utf8')
  const data = JSON.parse(raw)

  const users: OldUser[] = data.users || []
  const threads: OldThread[] = data.forumThreads || []
  const posts: OldPost[] = data.forumPosts || []
  const comments: OldComment[] = data.forumComments || []

  // 1. Seed users + profiles
  console.log(`Seeding ${users.length} users...`)
  for (const u of users) {
    const email = u.email || `${u.id}@dojonet.local`
    const username = u.name.toLowerCase().replace(/\s+/g, '_')
    const role = mapRole(u.role)

    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email,
        username,
        passwordHash: await hashPassword('password123'), // default for demo
        role,
        profile: {
          create: {
            name: u.name,
            tagline: u.status || null,
            location: u.location || null,
            interests: [],
            avatar: u.avatar || null,
            banner: u.banner || null,
            affiliation: u.verifiedGym
              ? {
                  create: {
                    school: u.gym || 'Unknown Gym',
                    beltOrRank: u.rank || 'White Belt',
                    years: 1,
                    status: 'APPROVED',
                    verifiedBy: null,
                  },
                }
              : undefined,
          },
        },
      },
    })
  }

  // 2. Seed threads + posts
  console.log(`Seeding ${threads.length} threads...`)
  
  // Get all user IDs to cycle through
  const allUsers = await prisma.user.findMany({ select: { id: true } })
  const userIds = allUsers.map((u: { id: string }) => u.id)
  
  for (let i = 0; i < threads.length; i++) {
    const t = threads[i]
    const post = posts.find((p) => p.threadId === t.id)
    if (!post) continue

    // Use existing user IDs in a round-robin fashion
    const authorId = userIds[i % userIds.length]
    const postAuthorId = userIds[(i + 1) % userIds.length]

    await prisma.thread.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        authorId: authorId,
        title: t.title,
        tags: t.tags || [],
        createdAt: new Date(t.createdAt),
        votesUp: t.votesUp || 0,
        votesDown: t.votesDown || 0,
        score: t.score || 0,
        visibility: 'PUBLIC',
        post: {
          create: {
            id: post.id,
            authorId: postAuthorId,
            body: post.body || '',
            createdAt: new Date(post.createdAt),
          },
        },
      },
    })
  }

  // 3. Seed comments
  console.log(`Seeding ${comments.length} comments...`)
  for (let i = 0; i < comments.length; i++) {
    const c = comments[i]
    const thread = await prisma.thread.findUnique({ where: { id: c.threadId }, include: { post: true } })
    if (!thread || !thread.post) continue

    // Use existing user IDs in a round-robin fashion
    const commentAuthorId = userIds[i % userIds.length]

    await prisma.comment.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        threadId: c.threadId,
        postId: thread.post.id,
        authorId: commentAuthorId,
        body: c.body || '',
        createdAt: new Date(c.createdAt),
        votesUp: c.votesUp || 0,
        votesDown: c.votesDown || 0,
      },
    })
  }

  // 4. Seed follows (from old users.following/followers)
  console.log('Seeding follow relationships...')
  for (const u of users) {
    if (!u.following || u.following.length === 0) continue
    for (const targetId of u.following) {
      const exists = await prisma.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId: u.id,
            followeeId: targetId,
          },
        },
      })
      if (!exists) {
        await prisma.follow.create({
          data: {
            followerId: u.id,
            followeeId: targetId,
          },
        })
      }
    }
  }

  console.log('✅ Seed complete!')
}

function mapRole(role?: string): 'STUDENT' | 'INSTRUCTOR' | 'PROFESSOR' | 'OWNER' | 'ADMIN' | 'MOD' {
  if (!role) return 'STUDENT'
  const upper = role.toUpperCase()
  if (upper === 'INSTRUCTOR') return 'INSTRUCTOR'
  if (upper === 'PROFESSOR') return 'PROFESSOR'
  if (upper === 'OWNER') return 'OWNER'
  if (upper === 'ADMIN') return 'ADMIN'
  if (upper === 'MOD') return 'MOD'
  return 'STUDENT'
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
