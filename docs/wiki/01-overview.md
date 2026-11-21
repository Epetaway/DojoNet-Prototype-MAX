# 1. Overview

[← Wiki home](README.md) · Next: [Design →](02-design.md)

## The problem

Martial artists track their training in notebooks, phone notes and memory, and the social side lives on general-purpose platforms that weren't made for it. Fitness apps measure activity, like sessions, hours and streaks. Learning a grappling technique doesn't move in a straight line: you can "know" a sweep in drilling and lose it under pressure.

## The idea

A community built around the training journal, with the personality of early MySpace profiles and a 2025 interface. The design spec's five principles ([`DojoNet-UI-UX-and-Component-Implementation.md`](../DojoNet-UI-UX-and-Component-Implementation.md)):

1. Modular, responsive components with sensible motion and loading states
2. Journal-first: gentle prompts and fast post actions
3. Verification and gym affiliation shown clearly but unobtrusively
4. Safe interactions: scoped privacy, friendly defaults, accessible controls
5. Personalization: theming and layout editing for each profile

## What exists

| Area | Status |
|---|---|
| Training journal: sessions, techniques with four learner-chosen stages, goals, sparring logs | Built |
| Belt chapters: entries file into the current belt's chapter; ranking up closes it and opens the next | Built |
| Profile pages with themes (Default, Tatami, Iron, Neon) and drag-to-arrange widgets | Built |
| Forums, events, search, messages, notifications | Built as prototype screens with local data |
| Partner matching with age-gated results | Built as a prototype with local data |
| Express JSON server for development | Built, optional |
| 16-model Prisma database schema | Designed, not connected |

Everything runs in the browser. There are no real accounts, users or outcomes, and nothing here claims any.
