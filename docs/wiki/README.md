# DojoNet: Project Wiki

DojoNet is a front-end prototype of a social network for martial artists: a training journal, belt-by-belt "chapters," customizable profile pages, forums, events and partner matching. I built it solo in October 2025, from product idea to interface design to front-end code.

The question I kept coming back to: **how do you show progress in a craft without turning it into a score?** In BJJ, finishing a class isn't the same as learning a technique. The prototype is where I first worked through that, and some of its answers are wrong in ways I learned from.

> **Status:** Prototype. It runs entirely in the browser with localStorage, and has no real users or backend. [Live demo](https://epetaway.github.io/DojoNet-Prototype-MAX/) (fictional demo data). Each page below separates what's built, what's designed and what's a known gap.

## The short version

| | |
|---|---|
| **My role** | Product idea, interface design and front-end development, solo. The 23 original commits are mine; two later fixes (Nov 2026) were co-authored with Claude. |
| **Stack** | React, Vite, Tailwind CSS, Zustand, React Router (HashRouter for GitHub Pages), Framer Motion, Vitest; an optional Express JSON server; a Prisma schema that isn't connected |
| **Built** | Oct 27–28, 2025, plus two demo fixes in Nov 2026 |
| **Case study** | [ehicksonjr.com/work/dojonet](https://ehicksonjr.com/work/dojonet) |

## Read in this order

1. **[Overview](01-overview.md)**: the problem, the idea, and what exists
2. **[Design](02-design.md)**: the design system, the progression model, and the token audit
3. **[Architecture](03-architecture.md)**: the static-demo setup, two stores, and the designed backend
4. **[Key decisions](04-decisions.md)**: what I chose, and what I'd choose differently now
5. **[Quality and lessons](05-quality-and-lessons.md)**: known gaps, fixes, and what I took into later projects

## Questions I'd enjoy being asked about

- Why can learners move a technique back down a stage?
- What's wrong with a dashboard that leads with streaks?
- Why did a journal composer that defaults to Public change how I built WithYou?
- How did a design token end up undefined in 153 places, and how would you prevent it?
