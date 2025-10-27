# Quick Reference: Using FontAwesome Icons in DojoNet

Import the Icon component and icons object:

```jsx
import { Icon, icons } from '../src/lib/icons';
```

Basic usage:

```jsx
<Icon icon={icons.home} />
<Icon icon={icons.heart} />
<Icon icon={icons.users} />
```

With classes:

```jsx
<Icon icon={icons.plus} className="h-5 w-5" />
<Icon icon={icons.heart} className="text-red-500 w-6 h-6" />
<Icon icon={icons.check} className="text-green-600" />
```

Available icons (common):

- Navigation: home, calendar, message, users, book, settings, bell
- Actions: plus, search, filter, upload, save, check, close, trash, send
- Social: heart, heartOutline, comment, share, bookmark, thumbsUp, thumbsDown
- Visibility: lock, globe, userGroup
- Media: image, video, play
- Time & Location: clock, mapPin, calendar
- Content: file, bolt, sparkles
- User: user, userOutline, dots
- Theme: sun, moon
- Martial Arts: target, trophy, medal, fire, dumbbell, running
- System: logout, eye, chart

Examples in components:

```jsx
<button className="flex items-center gap-2">
  <Icon icon={icons.plus} className="h-4 w-4" />
  <span>New Post</span>
</button>
```

```jsx
<button className="p-2 rounded-full hover:bg-gray-100">
  <Icon icon={icons.heart} className="h-5 w-5 text-red-500" />
</button>
```

```jsx
<Link to="/dashboard" className="flex items-center gap-3">
  <Icon icon={icons.home} className="h-5 w-5" />
  <span>Dashboard</span>
</Link>
```

```jsx
<span className="flex items-center gap-1 text-xs">
  <Icon icon={icons.lock} className="w-3 h-3" />
  Private
</span>
```

```jsx
<div className="flex items-center gap-2">
  <Icon icon={icons.clock} className="animate-spin" />
  <span>Loading...</span>
</div>
```

Adding new icons:

1. Open `src/lib/icons.js`
2. Import from `@fortawesome/*` packages
3. Add to `icons` export object
4. Use anywhere with `<Icon icon={icons.yourIcon} />`
