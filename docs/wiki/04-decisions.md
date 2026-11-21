# 4. Key decisions

[← Architecture](03-architecture.md) · Next: [Quality and lessons →](05-quality-and-lessons.md)

## 1. Learners choose their own stage, and can go back down

**Decision:** The learner sets each technique's stage. There's no automatic promotion from "sessions logged," and the stage can move down as well as up.

**Why:** Logging a technique ten times doesn't mean you can hit it in sparring. Only the learner (or a coach) knows that.

**Trade-off:** Self-reported data is subjective. For a personal journal, honesty matters more than objectivity.

## 2. No single mastery score

**Decision:** The Progress tab shows the spread of techniques across stages, not a percentage.

**Why:** One number would flatten very different skills into a grade.

## 3. A static demo instead of a hosted backend

**Decision:** Run everything in the browser on GitHub Pages, with localStorage and seeded demo data.

**Why:** It's free, anyone can open it, and there's no server to maintain for a prototype.

**Trade-off:** No real accounts or shared data. The two stores and the seeding logic also created the first-visit bug ([Architecture](03-architecture.md#two-stores)).

## What I'd decide differently now

- **The dashboard leads with streak, hours and sessions.** That contradicts the "progress isn't completion" idea. I'd lead with the technique spread and the open belt chapter.
- **The journal composer defaults to Public.** The spec said Private. A training journal holds things people are working on, including injuries and doubts. I now treat private-by-default as a rule, and it became a founding principle of WithYou.
  <!-- EARL: confirm the link to WithYou is how you see it. -->
- **The stage control's selected states measure 2.0–3.3:1 contrast,** below WCAG's 4.5:1 for text. The case study shows a proposed control at 13:1 or higher with `aria-pressed`.
- **One store from day one.** Two stores made a simple session bug possible.
