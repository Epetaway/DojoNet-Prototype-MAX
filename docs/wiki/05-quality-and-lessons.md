# 5. Quality and lessons

[← Key decisions](04-decisions.md) · [Wiki home](README.md)

## What's checked

| Check | Result |
|---|---|
| `vite build` | Succeeds |
| Vitest | 1 test file, 1 test, passing. Test coverage is minimal, and I'd add it before building further. |
| Lint | The ESLint setup predates ESLint 9's config format and doesn't run as configured. It needs migrating. |

## Fixed (Nov 2026)

| Problem | Fix |
|---|---|
| A first visit showed "Login to see your dashboard" until a reload | The newer store updates the older one when the demo session is created |
| The demo profile (`#/profile/u_demo`) crashed, because the demo user has no layout or posts | Profiles fall back to a default layout, and missing posts are treated as empty |

Both were checked in a production build in a fresh browser: the dashboard loads signed in, and every profile tab renders with no page errors.

## Known gaps

From the Oct 2026 audit ([case-study record](https://ehicksonjr.com/work/dojonet)):
- `--color-primary` is undefined, so light-mode active tabs and buttons render white on near-white (1.05:1)
- Three different reds across tokens, Tailwind's `brand` colour and raw `red-500`
- The dashboard leads with streak, hours and sessions
- The journal composer defaults to Public; the spec says Private
- A seed technique uses "Intermediate," which isn't one of the four stages
- "New Entry" on the Training Journal returns to the dashboard composer
- The base button is 40 px tall, under the 44 px touch-target guideline
- The home page shows a static "4.7k online now," which is placeholder text, not real data

## Lessons I carried forward

1. **Privacy defaults are product decisions.** A Public default in a journal is a design choice, not a setting. WithYou is private by default because of this.
2. **Tokens need enforcement.** An undefined CSS variable fails silently, 153 times. Gundam Forge and later projects audit tokens and measure contrast instead of assuming.
3. **Progress isn't completion.** That idea started here and runs through Gundam Forge's errors-versus-warnings and Kaiju Coach's class flow.
4. **One source of truth for state.** Two stores turned a session into a race.

<!-- EARL: confirm the lessons and the WithYou link are in your words. -->
