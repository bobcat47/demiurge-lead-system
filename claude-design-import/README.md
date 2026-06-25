# Claude Design Import Package
## Demiurge Lead Matcher - Complete UI System

This folder contains everything needed to implement the Demiurge Lead Matcher dashboard in Claude Design.

---

## 📁 File Structure

```
claude-design-import/
├── README.md                          # This file
├── design-tokens.json                 # Color palette, typography, spacing
├── component-library.tsx              # All React components (copy-paste ready)
├── pages.tsx                          # Complete page implementations
└── project-brief.md                   # Concise brief for Claude
```

---

## 🚀 Quick Start

### Step 1: Create New Project in Claude Design
1. Open Claude Design
2. Create new project: "Demiurge Lead Matcher"
3. Select "Next.js" template

### Step 2: Install Dependencies
```bash
npm install framer-motion lucide-react clsx tailwind-merge date-fns
npm install -D @types/node @types/react @types/react-dom
```

### Step 3: Copy Files

#### Copy `design-tokens.json` values into:
- `tailwind.config.ts` - Colors, animations, spacing
- `app/globals.css` - CSS variables

#### Copy `component-library.tsx` into:
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/badge.tsx`
- `components/ui/score-display.tsx`
- `components/ui/status-indicator.tsx`
- `components/ui/input.tsx`
- `components/ui/stat-card.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/header.tsx`

#### Copy `pages.tsx` into:
- `app/layout.tsx`
- `app/page.tsx`
- `app/sources/page.tsx`
- `app/providers/page.tsx`

### Step 4: Configure Tailwind

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
        'slide-in': 'slide-in 0.3s ease-out',
      }
    }
  }
}
export default config
```

---

## 🎨 Design System Overview

### Color Palette
- **Background**: `#030305` (deep black)
- **Cards**: `#0A0A0F` (elevated surface)
- **Primary**: `#6366F1` (indigo)
- **Success**: `#10B981` (emerald)
- **Warning**: `#F59E0B` (amber)
- **Danger**: `#F43F5E` (rose)

### Key Features
1. **Glassmorphism** - Translucent cards with backdrop blur
2. **Dark Theme** - Native dark mode, no light mode
3. **Neon Accents** - Subtle glows and gradients
4. **Animated** - Framer Motion for smooth transitions
5. **Responsive** - Sidebar layout, mobile-adaptive

### Components Included
- ✅ Button (primary, secondary, ghost, danger)
- ✅ Card (default, elevated, glow variants)
- ✅ Badge (success, warning, danger, info, neutral)
- ✅ ScoreDisplay (animated ring with count-up)
- ✅ StatusIndicator (pulsing dot)
- ✅ Input (with icon support)
- ✅ Sidebar (navigation)
- ✅ Header (with status)
- ✅ StatCard (metrics display)

### Pages Included
- ✅ Dashboard/Leads (main feed with expandable cards)
- ✅ Source Manager (grid of sources)
- ✅ Providers (provider cards)
- ✅ Analytics (placeholder)

---

## 📋 Implementation Checklist

### Phase 1: Setup
- [ ] Create Next.js project
- [ ] Install dependencies
- [ ] Configure Tailwind with custom colors
- [ ] Set up fonts (Inter, JetBrains Mono)

### Phase 2: Components
- [ ] Create `components/ui/` folder
- [ ] Copy all UI components
- [ ] Create `components/layout/` folder
- [ ] Copy Sidebar and Header

### Phase 3: Pages
- [ ] Set up root layout
- [ ] Create dashboard page
- [ ] Create sources page
- [ ] Create providers page

### Phase 4: Polish
- [ ] Add animations
- [ ] Test responsive layout
- [ ] Verify all interactions
- [ ] Add loading states

---

## 🔗 Key Files to Reference

| File | Purpose |
|------|---------|
| `design-tokens.json` | All design values (colors, spacing, typography) |
| `component-library.tsx` | Ready-to-use React components |
| `pages.tsx` | Complete page implementations with mock data |

---

## 💡 Tips for Claude Design

1. **Start with layout** - Get the sidebar and main content area working first
2. **Use mock data** - The pages.tsx file includes realistic mock data
3. **Animate gradually** - Add animations after static layout is complete
4. **Test dark theme** - Everything should work on pure black background
5. **Font matters** - Use JetBrains Mono for numbers (tabular-nums)

---

## 🐛 Common Issues

### Issue: Components not styled
**Solution**: Check that Tailwind config includes the custom colors and that `globals.css` is imported in layout.

### Issue: Animations not working
**Solution**: Ensure `framer-motion` is installed and components use 'use client' directive.

### Issue: Icons not showing
**Solution**: Verify `lucide-react` is installed and imported correctly.

---

## 📞 Support

For detailed specifications, see:
- `../DESIGN_SPECIFICATION.md` - Full design system documentation
- `../DESIGN_COMPONENTS.md` - Component implementation guide
- `../DESIGN_MOCKUP.md` - Visual mockups and references

---

**Ready to build!** Start with the layout and work your way through components to pages.
