# Project Brief: Demiurge Lead Matcher Dashboard

## Overview
Build a dark-themed, glassmorphism dashboard for a lead matching system. The interface should feel like a premium cybernetic command center - think Linear.app meets a trading terminal.

## Design Style
- **Dark mode only**: Deep black (#030305) backgrounds
- **Glassmorphism**: Translucent cards with backdrop blur
- **Neon accents**: Indigo (#6366F1) primary, emerald success, amber warnings
- **Premium feel**: Smooth animations, subtle glows, refined spacing

## Layout Structure
```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (280px)    │  MAIN CONTENT AREA            │
│  - Logo             │  - Header (sticky)            │
│  - Navigation       │  - Stats bar                  │
│  - Quick actions    │  - Content panels             │
└─────────────────────────────────────────────────────┘
```

## Pages to Build

### 1. Dashboard/Leads (Main Page)
- Stats bar with 6 metric cards
- Filter pills (All, New, Matched, Approved)
- Search input
- Lead cards (expandable)
  - Score display with animated ring
  - Service badges
  - Match count
  - Expand to show:
    - Original post content
    - Detected signals
    - Matched providers list
    - Approve/Reject actions

### 2. Source Manager
- Grid of source cards
- Each card shows:
  - Source name & type
  - Status badge (active/paused)
  - Last crawl time
  - Stats (posts crawled, qualified)
  - Action buttons

### 3. Providers
- Grid of provider cards
- Each card shows:
  - Business name & rating
  - Service tags
  - Lead stats
  - Conversion rate
  - Emergency badge (if applicable)

## Key Components Needed

### Button
- Variants: primary (indigo gradient), secondary (ghost), danger
- Sizes: sm, md, lg
- Can include icon
- Hover: lift + glow effect

### Card
- Variants: default (subtle), elevated (more visible), glow (active state)
- Glassmorphism effect
- Rounded corners (16px)
- Hover: border brightens

### Badge
- Variants: success (emerald), warning (amber), danger (rose), info (cyan), neutral
- Can include pulsing dot
- Uppercase text

### Score Display
- Circular ring with percentage
- Animated on load
- Color based on score (green 80+, indigo 60+, amber 40+, red <40)
- Shows score value + label

### Sidebar
- Fixed position
- Logo at top
- Navigation items with active state
- Active item: indigo background + glow indicator
- Quick actions panel at bottom

### Header
- Sticky position
- Page title + breadcrumb
- Status indicator (green pulse)
- Action buttons (refresh, notifications)

## Animations Required
1. **Page load**: Cards slide in with stagger (0.05s delay each)
2. **Score display**: Ring animates from 0 to value (1s duration)
3. **Card expand**: Smooth height transition (0.3s)
4. **Button hover**: Lift -1px + shadow increase
5. **Status indicator**: Pulsing glow animation (2s infinite)
6. **Card hover**: Border brightens + subtle lift

## Color Palette
```css
--bg-darkest: #030305;    /* Page background */
--bg-deep: #0A0A0F;       /* Cards */
--accent-primary: #6366F1; /* Indigo */
--accent-success: #10B981; /* Emerald */
--accent-warning: #F59E0B; /* Amber */
--accent-danger: #F43F5E;  /* Rose */
--text-primary: #FFFFFF;
--text-secondary: rgba(255,255,255,0.7);
--border-subtle: rgba(255,255,255,0.06);
```

## Typography
- **Font**: Inter (sans), JetBrains Mono (numbers)
- **Headings**: Bold, tight letter-spacing
- **Body**: Regular weight, comfortable line-height
- **Numbers**: Monospace, tabular figures

## Spacing
- 8px base grid
- Card padding: 20px
- Section gaps: 24px
- Element gaps: 16px

## Icons
Use Lucide React icons:
- Activity (logo)
- Zap (leads)
- Globe (sources)
- Users (providers)
- Plus (add buttons)
- Search, Filter
- ChevronDown/Up (expand)
- CheckCircle2, XCircle (actions)

## Tech Stack
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)

## Deliverables
1. Working Next.js app with all three pages
2. All components in `components/ui/`
3. Layout components in `components/layout/`
4. Responsive design (sidebar collapses on mobile)
5. Smooth animations throughout
6. Mock data for demonstration

## Success Criteria
- [ ] Dark theme looks polished and premium
- [ ] Glassmorphism cards work correctly
- [ ] Animations are smooth (60fps)
- [ ] All interactive elements have hover states
- [ ] Layout is responsive
- [ ] Feels like Linear.app or Vercel Dashboard quality
