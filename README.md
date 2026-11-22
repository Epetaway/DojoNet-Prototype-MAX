
# DojoNet - Martial Arts Social Network (Demo)

[![Deploy Status](https://img.shields.io/badge/deploy-ready-success)]()
[![Built with Vite](https://img.shields.io/badge/built%20with-Vite-646CFF)]()
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://epetaway.github.io/DojoNet-Prototype-MAX/)

**DojoNet** is a modern social networking platform designed for martial artists to connect, train, and grow together.

> **Evaluating this project?** Start with the [project wiki](docs/wiki/README.md): the problem, design, architecture, decisions and lessons, including what I'd do differently. DojoNet is a front-end prototype with fictional demo data; it has no real users or backend. This demo showcases the core features including training journals, partner matchmaking, forums, events, and more.

## 🌐 Live Demo

**[View Live Demo on GitHub Pages](https://epetaway.github.io/DojoNet-Prototype-MAX/)**

### Demo Credentials
- **Quick Access**: Click "Continue as Demo" on login page
- **Email**: demo@dojonet.local
- **Password**: DojoNetDemo2024!

## 🎯 Static Demo Mode

This app is configured to run 100% statically on GitHub Pages without a backend server:
- ✅ All data stored in browser localStorage
- ✅ Demo events and sample data built-in
- ✅ Full feature demonstration without server
- ✅ Works offline after first load

## 🥋 Features

### Training Journal
- **Session Logging**: Track classes, drilling, sparring, and open mat sessions
- **Technique Tracking**: Monitor proficiency levels and certifications
- **Goal Management**: Set and track training objectives with progress indicators
- **Sparring Analytics**: Log sparring rounds with detailed stats and partner records
- **Vitals Tracking**: Monitor energy, intensity, recovery, and injury status
- **Advanced Filters**: Filter entries by injury status, intensity levels, and session types

### Partner Matchmaking (NEW!)
- **Swipe Interface**: Tinder-style card swiping for finding training partners
- **Age-Gated Matching**: Minors only see minors, adults only see adults (safety-first design)
- **Compatibility Algorithm**: 0-100 score based on discipline, skill level, goals, and proximity
- **Advanced Filtering**: Distance, age range, disciplines, skill levels, verified accounts
- **Safety Features**: Report/block system, content filtering, parental controls framework
- **Verification Badges**: OAuth verified, ID verified, parent supervised indicators

### Social Features
- **Forums**: Community discussions with threaded comments
- **Events**: Discover and share martial arts events
- **User Profiles**: Comprehensive profiles with training background
- **Search**: Find users, posts, and content across the platform
- **Notifications**: Real-time updates for interactions

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open http://localhost:5173 to view the app.

## 🎮 Demo Experience
### Auto-Login
The demo automatically logs you in as a demo user on first visit for a seamless experience.

### Pre-populated Data
- Sample training journal entries with vitals tracking
- Mock partner profiles for matchmaking demo
- Forum threads and discussions
- Upcoming martial arts events

### Key Demo Flows

1. **Training Journal** - Navigate via floating nav to see entries, filters, and analytics
2. **Partner Matchmaking** - Swipe through profiles, adjust filters, experience matches
3. **Forums & Events** - Browse discussions and find local events
4. **Dark Mode** - Toggle theme in header (persists to localStorage)

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State**: Zustand
- **Styling**: Tailwind CSS + CSS Variables
- **Icons**: Font Awesome (centralized library)
- **Storage**: localStorage (demo mode)

## 🏗️ Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── matchmaking/  # SwipeCard, partner matching
│   ├── safety/       # Report, block, content filtering
│   ├── dashboard/    # Feed and post components
│   └── layout/       # Header, FloatingNav
├── pages/            # Route pages
│   ├── TrainingJournal.tsx
│   ├── PartnerMatchmaking.jsx
│   ├── Home.jsx
│   └── ...
├── lib/              # Utilities
│   ├── icons.jsx     # Centralized icons
│   └── storage.js    # localStorage helpers
├── types/            # TypeScript definitions
│   └── matchmaking.ts
└── store.js          # Global state
```

## 🔐 Safety Features (Matchmaking)

- **Age Gating**: Multi-layer protection (minors/adults separated)
- **Content Filtering**: Profanity and grooming detection
- **Parental Controls**: Framework for minor supervision
- **Reporting**: 7-category system with escalation
- **Verification**: OAuth and ID verification badges

See `MATCHMAKING_IMPLEMENTATION_GUIDE.md` for details.

## 📚 Documentation

- [Quick Reference](MATCHMAKING_QUICK_REFERENCE.md)
- [Implementation Guide](MATCHMAKING_IMPLEMENTATION_GUIDE.md)
- [Training Enhancements](TRAINING_JOURNAL_ENHANCEMENTS.md)

## 🚧 Demo Limitations

- **No backend**: All data in localStorage
- **Mock auth**: Auto-login demo user
- **Simulated matching**: Probability-based matches
- **No real-time**: Chat/notifications UI-only

## 🎨 Design System

### Themes
- Light/dark mode with CSS variables
- Unified scrollbar styling
- Belt rank color coding

### Key Variables
```css
--color-bg: Page background
--color-surface: Cards/modals
--color-text: Primary text
--color-primary: Brand accent (#B71C1C)
--accent-teal: Success/progress
--accent-amber: Warnings
```

## 📋 Data Storage

Everything persists in browser localStorage:

```javascript
// Training data
`journals_${userId}`
`techniques_${userId}`
`goals_${userId}`
`sparringRounds_${userId}`
`trainingPartners_${userId}`

// Matchmaking
`matches_${userId}`
`swipes_${userId}`
`partner_profiles`
```

To reset: Clear site data in DevTools (Application → Local Storage)

## 🔮 Production Roadmap

To deploy as production app:

- [ ] Backend API (Node.js/PostgreSQL)
- [ ] Real OAuth (Google/Facebook)
- [ ] WebSocket chat server
- [ ] Content moderation service
- [ ] ID verification (Onfido/Jumio)
- [ ] Media hosting (CDN)
- [ ] Push notifications
- [ ] Email service

## 🤝 Contributing

Feedback and suggestions welcome!

1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built for the martial arts community** 🥋

*All data stored locally in your browser. No server communication in demo mode.*
- Testing: Vitest with happy-dom env and jest-dom matchers in `vitest.setup.ts`
