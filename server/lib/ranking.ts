// Feed ranking utilities per spec
// computeHot: Reddit hot algorithm
// engagementScore: likes + 2*comments + 3*shares

/**
 * Compute hot score (Reddit-style)
 * s = upvotes - downvotes
 * order = log10(max(|s|, 1))
 * sign = 1 if s>0, -1 if s<0, else 0
 * seconds = unix epoch since Dec 08, 2005
 * hot = sign * order + seconds/45000
 */
export function computeHot(up: number, down: number, createdAt: Date): number {
  const s = up - down
  const order = Math.log10(Math.max(Math.abs(s), 1))
  const sign = s > 0 ? 1 : s < 0 ? -1 : 0
  const seconds = Math.floor(+createdAt / 1000 - 1134028003)
  return sign * order + seconds / 45000
}

/**
 * Engagement = likes + 2*comments + 3*shares
 */
export function engagementScore(likes: number, comments: number, shares: number): number {
  return likes + comments * 2 + shares * 3
}

/**
 * For-you feed ranking v1:
 * score = 0.5*normalize(engagement) + 0.3*interest + 0.2*recency
 * interest = 1 if any(post.tags intersect user.interests)
 * recency = exp(-age_hours/24)
 */
export function forYouScore(
  engagement: number,
  maxEngagement: number,
  hasInterest: boolean,
  ageHours: number
): number {
  const normEngagement = maxEngagement > 0 ? engagement / maxEngagement : 0
  const interest = hasInterest ? 1 : 0
  const recency = Math.exp(-ageHours / 24)
  return 0.5 * normEngagement + 0.3 * interest + 0.2 * recency
}
