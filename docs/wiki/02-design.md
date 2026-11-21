# 2. Design

[← Overview](01-overview.md) · Next: [Architecture →](03-architecture.md)

## Design system (Spec v3)

| Element | Choice |
|---|---|
| Palette | Warm white surfaces and **Dojo Red** (`#B71C1C` light, `#EF4444` dark) as the accent, defined as CSS custom properties in `src/index.css` |
| Type | Bebas Neue for the wordmark and headings, Inter for reading |
| Surfaces | No borders (`--color-border: transparent`); a single elevation token carries depth |
| Spacing | An 8-point scale, set in `tailwind.config.js` |
| Personalization | Four profile themes and a layout editor, the "MySpace" idea made safe |

## Designing for learning

**Four stages, chosen by the learner.** Each technique has a proficiency stage, a TypeScript union of four values (`TrainingJournal.tsx`). The learner picks the stage and can move it back down. That's deliberate: a technique you could hit last month and can't today should be recordable honestly.

**No overall score.** The Progress tab shows how many techniques sit at each stage, not a single mastery percentage.

**Belt chapters.** Journal entries file into the open chapter, which starts as "White Belt Journey." `rankUp()` closes the current chapter and opens the next (`src/store.js`). It mirrors how practitioners actually talk about their journey.

## The token audit (Oct 2026)

When I came back to write the case study, I audited the design system against the code. The tokens hadn't held:
- 24 custom properties are defined, but 6 are used without being defined.
- `--color-primary` is used 153 times in 16 files and **is never defined**. The README even lists it as the brand accent.
- In light mode, active tabs and primary buttons render white on `#F9F9F9`, a contrast of **1.05:1**. A one-line fix brings them back to Dojo Red (6.6:1).
- 51 class names use a rose `brand` colour from Tailwind and 57 use raw `red-500`, so "the red" was three different reds.

These numbers were computed from the source at commit `be2db53`. The case study shows before and after captures.

**Lesson:** tokens don't stay true on their own. Undefined variables fail silently in CSS, so the fix has to be structural: one source of truth and a check that fails the build.
