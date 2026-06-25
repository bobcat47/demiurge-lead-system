# 📦 Claude Design Import Package
## Demiurge Lead Matcher - Complete UI System

---

## What's Included

This package contains **everything needed** to implement the Demiurge Lead Matcher dashboard in Claude Design.

### 📁 Files in `claude-design-import/` folder:

| File | Size | Purpose |
|------|------|---------|
| `design-tokens.json` | 5KB | Color palette, typography, spacing values |
| `component-library.tsx` | 16KB | All React components (copy-paste ready) |
| `pages.tsx` | 26KB | Complete page implementations with mock data |
| `project-brief.md` | 5KB | Concise brief for pasting into Claude |
| `README.md` | 5KB | Setup instructions and tips |

**Total: 57KB of production-ready code**

---

## Quick Import Guide

### Option 1: Paste Brief (Fastest)
1. Open Claude Design
2. Create new Next.js project
3. Paste contents of `project-brief.md`
4. Let Claude generate the UI

### Option 2: Copy Components (Most Control)
1. Copy `design-tokens.json` → Tailwind config
2. Copy sections from `component-library.tsx` → component files
3. Copy sections from `pages.tsx` → page files

### Option 3: File-by-File (Most Detailed)
Follow the step-by-step instructions in `README.md`

---

## Component Inventory

### UI Components (8)
```
✅ Button          - Primary, secondary, ghost, danger variants
✅ Card            - Default, elevated, glow variants  
✅ Badge           - Success, warning, danger, info, neutral
✅ ScoreDisplay    - Animated ring with count-up
✅ StatusIndicator - Pulsing status dot
✅ Input           - Text input with icon support
✅ StatCard        - Metric display card
✅ (Plus Card subcomponents: Header, Title, Content, Footer)
```

### Layout Components (2)
```
✅ Sidebar - Fixed navigation with logo, nav items, quick actions
✅ Header  - Sticky header with status, actions
```

### Pages (3)
```
✅ Dashboard/Leads - Main feed with expandable cards
✅ Sources         - Source management grid
✅ Providers       - Provider directory
```

---

## Design Tokens Included

### Colors
- 4 background shades (from #030305 to #1A1A25)
- 4 border opacities (6% to 15%)
- 5 text opacities (25% to 100%)
- 6 accent colors with glow variants

### Typography
- 8 type sizes (micro to display)
- 2 font families (Inter, JetBrains Mono)
- Line heights, weights, letter-spacing

### Spacing
- 12 spacing values (0 to 96px)
- 6 border radius values

### Animations
- 4 duration values
- 3 easing functions
- Keyframe animations (pulse-glow, slide-in, shimmer)

---

## Visual Preview

```
┌───────────────────────────────────────────────────────────────┐
│  ⚡ Demiurge Lead Matcher          [🟢 Active] [Compliant]    │
│  Social Intent Detection System                               │
├──────────────┬────────────────────────────────────────────────┤
│              │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  ⚡ Live      │  │ 1234 │ │  89  │ │  4   │ │  12  │          │
│  🌍 Sources   │  │Posts │ │Leads │ │Srcs  │ │Provs │          │
│  👤 Providers │  └──────┘ └──────┘ └──────┘ └──────┘          │
│  📊 Analytics │                                                │
│              │  ┌───────────────────────────────────────────┐ │
│  ─────────── │  │ #1234  [🟠 Urgent]  [plumbing]      [95] │ │
│              │  │ "Water pipe burst, flooding..."            │ │
│  Quick       │  │ ⏱ 2m ago 📍 Downtown 💰 Premium          │ │
│  Actions     │  │                                             │ │
│              │  │  ┌─────────────────────────────────────┐  │ │
│  [+ Source]  │  │  │ PlumbPro Emergency        [98%]    │  │ │
│  [+ Provider]│  │  │ ⭐ 4.8  🚨 24/7  ⏱ 30min           │  │ │
│              │  │  └─────────────────────────────────────┘  │ │
│              │  │                    [Reject] [Approve]     │ │
│              │  └───────────────────────────────────────────┘ │
└──────────────┴────────────────────────────────────────────────┘
       ↑                              ↑
    Sidebar                       Glass Cards
    (Fixed 280px)                 (Expandable)
```

---

## Copy-Paste Code Blocks

### 1. Install Dependencies
```bash
npm install framer-motion lucide-react clsx tailwind-merge date-fns
npm install -D @types/node @types/react @types/react-dom
```

### 2. Tailwind Config
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          darkest: '#030305',
          deep: '#0A0A0F',
          elevated: '#12121A',
        },
        accent: {
          primary: '#6366F1',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#F43F5E',
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor' },
        }
      }
    }
  }
}
export default config
```

### 3. Global Styles
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #030305;
  color: white;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
```

---

## Key Implementation Details

### Glassmorphism Formula
```css
background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
border: 1px solid rgba(255, 255, 255, 0.06);
backdrop-filter: blur(20px);
border-radius: 16px;
```

### Animation Standards
- Micro-interactions: 150ms
- Standard transitions: 200ms
- Page transitions: 300ms
- Complex animations: 500ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

### Spacing Grid
- Base unit: 8px
- Card padding: 20px (p-5)
- Section gaps: 24px (space-y-6)
- Element gaps: 16px (gap-4)

---

## Quality Checklist

Before finishing, verify:

- [ ] All cards have glassmorphism effect
- [ ] Dark theme is consistent (#030305 background)
- [ ] Indigo accent color (#6366F1) is used for CTAs
- [ ] Numbers use JetBrains Mono font
- [ ] Animations are smooth (60fps)
- [ ] Hover states on all interactive elements
- [ ] Sidebar is fixed, content scrolls
- [ ] Responsive on mobile (sidebar collapses)
- [ ] Score rings animate on load
- [ ] Status dots pulse

---

## Need Help?

### Full Documentation
- `DESIGN_SPECIFICATION.md` - Complete design system (33KB)
- `DESIGN_COMPONENTS.md` - Implementation guide (26KB)
- `DESIGN_MOCKUP.md` - Visual references (23KB)

### Reference Inspirations
- Linear.app (glassmorphism, dark theme)
- Vercel Dashboard (data density, clean layout)
- Raycast (dark aesthetic, smooth animations)

---

## Summary

**What you're building:**
A premium dark-themed dashboard for monitoring and managing leads from social media sources. It matches the aesthetic of modern SaaS products like Linear, Vercel, or Raycast.

**What makes it special:**
- Glassmorphism cards with backdrop blur
- Neon accent glows (indigo, emerald, amber)
- Smooth Framer Motion animations
- Real-time status indicators
- Expandable lead cards with provider matching

**Time estimate:**
- Basic layout: 1 hour
- All components: 2-3 hours
- Animations & polish: 1 hour
- **Total: 4-5 hours for professional result**

---

**Ready to build!** 🚀

Start with `project-brief.md` for the fastest path, or use `component-library.tsx` for maximum control.
