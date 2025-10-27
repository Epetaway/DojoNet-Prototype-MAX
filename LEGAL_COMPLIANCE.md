# Legal Compliance Framework

## Overview
This document outlines the legally responsible event aggregation system implemented for DojoNet, ensuring compliance with web scraping best practices and data protection principles.

## Core Principles

### 1. Minimal Metadata Capture
- **What we store**: Only essential event metadata (title, date, location, URL)
- **What we DON'T store**: No full content, no user data, no copyrighted materials
- **Implementation**: See `server/events/adapters/` - each adapter extracts only basic fields

### 2. Always Link to Source
- **Registration links**: All events include `registerUrl` pointing to original source
- **No intermediary registration**: Users are directed to official registration pages
- **Source attribution**: Display "via IBJJF/Smoothcomp" badges with brand logos
- **Implementation**: `EventDetail.jsx` shows "View original" button; badges in `EventDetail` component

### 3. Respect robots.txt
- **Parser**: Uses `robotsParser` library to check robots.txt before every request
- **Blocked sources**: Falls back gracefully when blocked (Smoothcomp currently blocks bots)
- **Implementation**: `server/events/fetcher.js` - `checkRobots()` function

### 4. Polite Scraping
- **Rate limiting**: 1 second delay between requests to same domain
- **User-Agent**: Identifies as "DojoNetBot/1.0" with contact info
- **Timeout**: 10-second request timeout to avoid hanging
- **Cache**: 5-minute cache to avoid redundant requests
- **Implementation**: `server/events/fetcher.js` - `politeFetch()` function

### 5. Interest Mapping
- **Purpose**: Map external event types (e.g., Smoothcomp "Type of game") to user interests
- **User control**: Users select interests during sign-up (Gi, No-Gi, MMA, Judo, Wrestling, etc.)
- **Filtered discovery**: Events shown based on user interest preferences
- **Implementation**: `server/events/interests.js` - `InterestChoices` array, `matchEventToInterests()`

### 6. Scheduled Refresh
- **Frequency**: Manual trigger via API endpoint (automatic 30-day refresh disabled in dev)
- **Production**: Recommend external cron service (AWS EventBridge, GitHub Actions, etc.)
- **Cache persistence**: Results stored in `.cache/event-cache.json` with timestamps
- **Refresh log**: Last 50 refresh attempts tracked in `.cache/refresh-log.json`
- **Implementation**: `server/events/scheduler.js` - `refreshEventCache()`, manual trigger at `POST /api/events/refresh`

## Technical Architecture

### Event Sources
- **IBJJF**: International Brazilian Jiu-Jitsu Federation events
- **NAGA**: North American Grappling Association tournaments
- **Smoothcomp**: Multi-sport tournament platform
- **Eventbrite**: General event discovery (stub)
- **Meetup**: BJJ/MMA meetup groups (stub)

### Adapter Pattern
Each source has a dedicated adapter implementing:
```javascript
async function fetchEvents(window) {
  // 1. Check robots.txt via politeFetch
  // 2. Parse HTML with minimal regex (no full DOM)
  // 3. Extract only: title, date, location, registerUrl
  // 4. Return normalized event objects
}
```

### Fallback Strategy
- **Seed events**: 7 curated events serve as fallback when all adapters blocked/fail
- **Implementation**: `server/events/seed.js`
- **Trigger**: Automatic when `runAllAdapters()` returns 0 results in development

### Scoring Algorithm
Events ranked by:
- **Distance** (35%): Proximity to user location
- **Interest match** (30%): Alignment with user-selected interests
- **Recency** (15%): How recently posted/updated
- **Trust** (10%): Verified organizers, established platforms
- **Popularity** (10%): Registration count, social engagement

## API Endpoints

### Search Events
```
GET /api/events/search?lat=40.7128&lng=-74.0060&radiusKm=50&kinds=tournament,seminar
```
Returns aggregated events sorted by relevance score.

### Manual Cache Refresh
```
POST /api/events/refresh
```
Triggers immediate cache refresh (admin use only in production).

### Cache Stats
```
GET /api/events/cache-stats
```
Shows cached event count, timestamp, and last 10 refresh attempts.

## Development vs Production

### Development
- Seed events provide reliable fallback
- Manual refresh via API endpoint
- Verbose logging of adapter failures
- No automatic scheduled refresh

### Production Recommendations
1. **External cron service**: Replace `setInterval` with AWS EventBridge, GitHub Actions, or similar
2. **Proxy rotation**: Use residential proxies to avoid IP blocks
3. **Monitoring**: Alert on adapter failure rates, cache staleness
4. **Rate limit adjustment**: Increase delays if receiving 429 responses
5. **Legal review**: Consult lawyer for ToS compliance with each source

## User Data Protection

### No Personal Data Storage
- User location: Requested via browser geolocation, not stored in aggregator
- User interests: Stored separately in user profile DB (future enhancement)
- Event data: No user-generated content or PII

### GDPR/CCPA Compliance
- No tracking cookies in aggregator
- No data sales or third-party sharing
- Users can request data deletion (no aggregated event data tied to users)

## Future Enhancements

1. **Official APIs**: Replace scraping with official APIs when available (IBJJF, Smoothcomp, etc.)
2. **Organizer partnerships**: Direct data feeds from tournament organizers
3. **User submissions**: Allow verified users to submit events manually
4. **Machine learning**: Improve scoring with click-through rate feedback
5. **Multi-region support**: Expand beyond US/NY default region

## Contact
For questions about our data practices: contact@dojonet.app

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintained by**: DojoNet Team
