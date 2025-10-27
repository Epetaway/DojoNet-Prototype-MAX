export type ID = string

export type Role = 'student' | 'instructor' | 'professor' | 'owner' | 'gym-admin' | 'platform-admin'

export interface Post {
  id: ID
  title: string
  date: string
  type: 'note' | 'tutorial'
  status?: 'PENDING' | 'APPROVED'
}

export interface Comment {
  id: ID
  userId: ID
  text: string
  ts: number
}

export interface User {
  id: ID
  name: string
  role?: Role
  rank: string
  gym: string
  location: string
  bio: string
  status: string
  avatar: string
  banner: string
  theme: string
  layout: { left: string[]; right: string[] }
  playlist: string
  posts: Post[]
  friends: ID[]
  following: ID[]
  followers: ID[]
  dojoCircle: ID[]
  comments: Comment[]
  verifiedGym: boolean
  rankLevel: number
}

export interface Gym {
  id: ID
  name: string
  city: string
  verified: boolean
  members: ID[]
}

export interface EventItem {
  id: ID
  title: string
  date: string
}
