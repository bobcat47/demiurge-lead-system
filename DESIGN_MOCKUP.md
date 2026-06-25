# Demiurge Lead Matcher - Visual Mockup Reference

## Overall Aesthetic Reference

**Primary Inspiration Sources:**
- **Linear.app** - Dark mode, glass cards, premium feel
- **Vercel Dashboard** - Data density, clean layouts
- **Raycast** - Dark theme, command palette style
- **Trading terminals** (Bloomberg, TradingView) - Data-heavy, real-time feel

---

## SCREEN MOCKUP: Live Leads Page

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                              │
│  HEADER (72px height, fixed, backdrop-blur)                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  [Logo] Demiurge Lead Matcher    Dashboard > Live Leads            [🟢 Active] [🔔]  │   │
│  │                                                                                       │   │
│  │  Logo: Purple/indigo gradient icon (Activity symbol)                                  │   │
│  │  Status badge: Green pulsing dot + "System Active" + "Compliant" emerald badge        │   │
│  └───────────────────────────────────────────────────────────────────────────────────────┘   │
│                                         ▲                                                    │
│                                         │ Background: #030305 with subtle gradient            │
│                                         │ Border-bottom: rgba(255,255,255,0.06)               │
│                                                                                              │
├──────────┬───────────────────────────────────────────────────────────────────────────────────┤
│          │                                                                                   │
│ SIDEBAR  │  STATS BAR (sticky below header)                                                  │
│ (280px)  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│          │  │  1,234  │ │   89    │ │    4    │ │   12    │ │   23    │ │  2m ago │         │
│  ┌────┐  │  │  Posts  │ │  Leads  │ │ Sources │ │Providers│ │  Queue  │ │  Last   │         │
│  │⚡  │  │  │  Today  │ │  Today  │ │ Active  │ │ Active  │ │  Size   │ │  Crawl  │         │
│  │    │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│  │Logo│  │                                                                                   │
│  └────┘  │  Cards: Glass effect, subtle borders, hover states                                │
│  Demiurge│                                                                                   │
│  Lead    │  MAIN CONTENT AREA                                                               │
│  Matcher │                                                                                   │
│          │  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  ─────── │  │  PAGE TITLE                                                                 │   │
│          │  │  Live Lead Feed                                        [Filter ▼] [+ New]  │   │
│  NAV     │  │                                                                             │   │
│          │  │  Filter Pills: [All] [New] [Matched] [Approved] ◄ Active pill has indigo    │   │
│  ⚡ Live  │  │  background with shadow                                                     │   │
│  🌍 Src  │  │                                                                             │   │
│  👤 Prov │  │  ┌─────────────────────────────────────────────────────────────────────────┐│   │
│  📊 Anal │  │  │ LEAD CARD #1 (Urgent - highlighted)                                     ││   │
│  ⚙️ Set  │  │  │                                                                          ││   │
│          │  │  │  ┌────┐  #1234  [🟠 URGENT]  [plumbing]                    [Score: 95]  ││   │
│  ─────── │  │  │  │🔴  │                                                                     ││   │
│          │  │  │  │95  │  "URGENT: Water pipe burst in basement, flooding..."              ││   │
│  QUICK   │  │  │  │Score│                                                                     ││   │
│  ACTIONS │  │  │  └────┘  ⏱ 2m ago  📍 Downtown, NY  💰 Premium  👤 via Reddit          ││   │
│          │  │  │                                                                          ││   │
│  [+ Add  │  │  │  Border: amber-500/30 glow (subtle orange glow for urgent)               ││   │
│  Source] │  │  │                                                                          ││   │
│          │  │  │  EXPANDED STATE:                                                         ││   │
│  [+ Add  │  │  │  ┌─────────────────────────────────────────────────────────────────────┐│   │
│  Providr]│  │  │  │ Original Post:                                                      ││   │
│          │  │  │  │ ┌─────────────────────────────────────────────────────────────────┐ ││   │
│          │  │  │  │ │ "URGENTLY need a plumber in Downtown! Pipe burst and water is  │ ││   │
│          │  │  │  │ │  everywhere. Can anyone recommend someone who can come TODAY?  │ ││   │
│          │  │  │  │ │  Budget is flexible for quick service. Please help!"           │ ││   │
│          │  │  │  │ └─────────────────────────────────────────────────────────────────┘ ││   │
│          │  │  │  │                                                                     ││   │
│          │  │  │  │ Detected Signals: ✓ has_urgency ✓ has_location ✓ ready_to_hire    ││   │
│          │  │  │  │                                                                     ││   │
│          │  │  │  │ MATCHED PROVIDERS (2):                                              ││   │
│          │  │  │  │                                                                     ││   │
│          │  │  │  │ ┌─────────────────────────────────────────────────────────────────┐││   │
│          │  │  │  │ │ ┌────┐ PlumbPro Emergency Services                    [98%]   │││   │
│          │  │  │  │ │ │💧  │ ⭐ 4.8  🚨 24/7  ⏱ 30min  💰 Premium                    │││   │
│          │  │  │  │ │ │💧  │ Serves Downtown | Emergency Available | Top Rated       │││   │
│          │  │  │  │ │ └────┘                              [View] [Contact]          │││   │
│          │  │  │  │ └─────────────────────────────────────────────────────────────────┘││   │
│          │  │  │  │ ┌─────────────────────────────────────────────────────────────────┐││   │
│          │  │  │  │ │ ┌────┐ Quick Fix Plumbing                              [72%]   │││   │
│          │  │  │  │ │ │🔧  │ ⭐ 4.2  ⏱ Same day  💰 Budget                          │││   │
│          │  │  │  │ │ │    │ Serves Downtown | Budget Friendly                       │││   │
│          │  │  │  │ │ └────┘                              [View] [Contact]          │││   │
│          │  │  │  │ └─────────────────────────────────────────────────────────────────┘││   │
│          │  │  │  │                                                                     ││   │
│          │  │  │  │                      [Reject]  [Approve & Contact All]             ││   │
│          │  │  │  │                        Gray btn     Indigo gradient btn            ││   │
│          │  │  │  └─────────────────────────────────────────────────────────────────────┘│   │
│          │  │  │                                                                           │   │
│          │  │  │  ┌─────────────────────────────────────────────────────────────────────────┐   │
│          │  │  │  │ LEAD CARD #2 (Normal priority)                                          │   │
│          │  │  │  │                                                                          │   │
│          │  │  │  │  ┌────┐  #1235  [🔵 electrical]                          [Score: 72]  │   │
│          │  │  │  │  │🔌  │                                                                     │   │
│          │  │  │  │  │72  │  "Looking for electrician to rewire kitchen..."                  │   │
│          │  │  │  │  │    │                                                                     │   │
│          │  │  │  │  └────┘  ⏱ 15m ago  📍 Northside  💰 Standard  👤 via Forum           │   │
│          │  │  │  │                                                                          │   │
│          │  │  │  │  Standard glass card border (no urgency glow)                            │   │
│          │  │  │  └──────────────────────────────────────────────────────────────────────────┘   │
│          │  │  │                                                                              │   │
│          │  │  └──────────────────────────────────────────────────────────────────────────────┘   │
│          │  │                                                                                   │
│          │  └───────────────────────────────────────────────────────────────────────────────────┘
│          │
└──────────┴───────────────────────────────────────────────────────────────────────────────────┘
```

---

## COLOR SWATCHES

### Backgrounds
```
Darkest:   ████████ #030305 (Page background)
Deep:      ████████ #0A0A0F (Cards, sidebar)
Elevated:  ████████ #12121A (Hover states)
Hover:     ████████ #1A1A25 (Active states)
```

### Accents
```
Primary:   ████████ #6366F1 (Indigo - main accent)
Success:   ████████ #10B981 (Emerald - positive)
Warning:   ████████ #F59E0B (Amber - urgent)
Danger:    ████████ #F43F5E (Rose - errors)
Info:      ████████ #06B6D4 (Cyan - info)
Premium:   ████████ #A855F7 (Purple - premium)
```

### Borders
```
Subtle:    ████████ rgba(255,255,255,0.06)
Default:   ████████ rgba(255,255,255,0.10)
Strong:    ████████ rgba(255,255,255,0.15)
Accent:    ████████ rgba(99,102,241,0.30)
```

### Text
```
Primary:   ████████ #FFFFFF
Secondary: ████████ rgba(255,255,255,0.70)
Tertiary:  ████████ rgba(255,255,255,0.50)
Muted:     ████████ rgba(255,255,255,0.35)
```

---

## COMPONENT VISUALS

### Buttons
```
[Primary Button]
┌──────────────────────────────┐
│  🔍 Search Leads             │  ← Indigo gradient bg (#6366F1 → #4F46E5)
│                              │     White text, font-weight: 600
└──────────────────────────────┘     Shadow: 0 4px 12px rgba(99,102,241,0.3)
                                     Hover: Lift -1px, brighter shadow

[Secondary Button]
┌──────────────────────────────┐
│  🔧 Filter                   │  ← Transparent bg with rgba(255,255,255,0.05)
│                              │     Border: rgba(255,255,255,0.10)
└──────────────────────────────┘     Hover: bg rgba(255,255,255,0.10)

[Ghost Button]
┌──────────┐
│  ⋯       │  ← Transparent, icon only
└──────────┘     Hover: bg rgba(255,255,255,0.05)
```

### Cards
```
[Standard Glass Card]
┌──────────────────────────────────────────────┐
│                                              │  ← Background: linear-gradient(135deg, 
│  Content here                                │     rgba(255,255,255,0.05), rgba(255,255,255,0.01))
│                                              │     Border: 1px solid rgba(255,255,255,0.06)
│                                              │     Border-radius: 16px
│                                              │     Backdrop-filter: blur(20px)
└──────────────────────────────────────────────┘

[Elevated Card with Glow]
┌──────────────────────────────────────────────┐
│                                              │  ← Additional:
│  Featured content                            │     Box-shadow: 0 0 40px rgba(99,102,241,0.15)
│                                              │     Border-color: rgba(99,102,241,0.30)
│                                              │
└──────────────────────────────────────────────┘

[Urgent Card]
┌──────────────────────────────────────────────┐
│                                              │  ← Border: 1px solid rgba(245,158,11,0.30)
│  ⚠️ Urgent content                           │     Box-shadow: 0 0 30px rgba(245,158,11,0.10)
│                                              │     (Subtle amber glow)
└──────────────────────────────────────────────┘
```

### Badges
```
[Success Badge]    [Warning Badge]    [Neutral Badge]
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ 🟢 Active    │   │ 🟠 Urgent    │   │ ℹ️ Pending   │
└──────────────┘   └──────────────┘   └──────────────┘

BG: emerald-500/10  BG: amber-500/10   BG: white/5
Border: emerald/20  Border: amber/20   Border: white/10
Text: emerald-400   Text: amber-400    Text: white/60
```

### Score Display
```
┌────────────────────┐
│     ╭────────╮     │  ← Outer ring: rgba(255,255,255,0.10)
│    ╱    95    ╲    │     Progress ring: indigo-400 (animated)
│   │   Score   │    │     Inner: transparent
│    ╲          ╱    │     Number: 32px, font-mono, font-bold
│     ╰────────╯     │
└────────────────────┘
```

---

## TYPOGRAPHY HIERARCHY

```
┌─────────────────────────────────────┐
│ Page Title                          │  ← 30px, font-weight: 700, letter-spacing: -0.02em
│ Subtitle description goes here      │  ← 16px, font-weight: 400, color: white/40
│                                     │
│ Card Title                          │  ← 20px, font-weight: 600
│ Card content and description        │  ← 16px, font-weight: 400, color: white/70
│                                     │
│ Label                               │  ← 14px, font-weight: 500, color: white/60, uppercase
│ Value                               │  ← 14px, font-weight: 400, color: white/90
│                                     │
│ Caption text                        │  ← 12px, font-weight: 500, color: white/50
│ Timestamp • 2m ago                  │  ← 12px, font-weight: 400, color: white/40
└─────────────────────────────────────┘
```

---

## SPACING REFERENCE

```
Section padding:        32px (p-8)
Card padding:           20px (p-5)
Card gap:               16px (space-y-4)
Element gap (large):    24px (gap-6)
Element gap (medium):   16px (gap-4)
Element gap (small):    8px  (gap-2)
Text gap:               4px  (gap-1)
Border radius (cards):  16px (rounded-2xl)
Border radius (btns):   10px (rounded-xl)
Border radius (pills):  20px (rounded-full)
```

---

## INTERACTION STATES

### Hover Effects
```
[Card Hover]
- Border color: rgba(255,255,255,0.06) → rgba(255,255,255,0.10)
- Background: slightly lighter
- Transform: translateY(-1px) (subtle lift)
- Transition: 200ms ease

[Button Hover]
- Primary: shadow increases, translateY(-1px)
- Secondary: background lightens
- Ghost: background appears

[Link Hover]
- Color: white/60 → white
- Underline appears (optional)
```

### Active/Pressed States
```
[Button Pressed]
- Transform: scale(0.98)
- Transition: 100ms

[Card Selected]
- Border: indigo-500/30
- Box-shadow: 0 0 40px indigo-500/15
```

### Focus States
```
[Input Focus]
- Border: indigo-500/50
- Box-shadow: 0 0 0 3px indigo-500/10
- Outline: none

[Button Focus]
- Ring: 2px indigo-500/50
- Offset: 2px
```

---

## ANIMATION TIMING

```
Micro-interactions:     100-150ms (button presses)
Standard transitions:   200ms (hovers, toggles)
Page transitions:       300ms (route changes)
Complex animations:     500ms (score counting, reveals)
Continuous animations:  2000ms+ (pulse glows, shimmers)

Easing:
- Default: cubic-bezier(0.4, 0, 0.2, 1)
- Bounce:  cubic-bezier(0.68, -0.55, 0.265, 1.55)
- Spring:  cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

---

## ICON USAGE

**Style:** Outline only, 2px stroke, rounded caps
**Sizes:**
- Small (in badges): 12px
- Default: 20px
- Large (feature icons): 24px
- XL (empty states): 48px

**Key Icons:**
- Activity (Logo)
- Zap (Leads/Live)
- Globe (Sources)
- Users (Providers)
- BarChart3 (Analytics)
- Settings
- Search, Filter
- ChevronDown/Up (Expand)
- CheckCircle2, XCircle (Actions)
- AlertCircle (Warning)
- Clock, MapPin, DollarSign (Meta)
- Phone, Mail, MessageSquare (Contact)
- Play, Pause (Controls)
- Plus (Add)
- MoreHorizontal (Menu)

---

## FINAL REMINDERS

1. **Dark Mode Only** - No light mode toggle
2. **High Contrast** - White text on dark bg meets WCAG AA
3. **Consistent Spacing** - 8px grid system throughout
4. **Glassmorphism** - Use backdrop-filter sparingly for performance
5. **Animations** - All transitions should feel snappy (200ms)
6. **Empty States** - Always have fallback UI for no data
7. **Loading States** - Shimmer effects for skeleton screens
8. **Error States** - Rose color accents for errors
9. **Success States** - Emerald color for confirmations
10. **Premium Feel** - Subtle gradients, soft shadows, refined details
