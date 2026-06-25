# Demiurge Lead Matcher - Design Specification
## For Claude Design Implementation

---

## 1. DESIGN PHILOSOPHY

### Brand Identity
**Demiurge Systems** represents the intersection of autonomous intelligence and human oversight. The visual language should convey:
- **Precision & Control**: Clean lines, grid-based layouts, systematic spacing
- **Intelligence**: Data visualization, real-time metrics, predictive elements
- **Premium Quality**: Glassmorphism, subtle glows, refined typography
- **Dark Operations**: Deep blacks, subtle grays, high-contrast accents

### Mood Keywords
- Cybernetic command center
- Financial trading terminal aesthetic
- Sci-fi intelligence dashboard
- Dark mode native
- Glass and light

---

## 2. COLOR SYSTEM

### Primary Palette
```css
/* Background Hierarchy */
--bg-darkest: #030305;        /* Deepest background - page level */
--bg-deep: #0A0A0F;           /* Cards, panels */
--bg-elevated: #12121A;       /* Elevated surfaces, hover states */
--bg-hover: #1A1A25;          /* Interactive hover */

/* Border & Divider */
--border-subtle: rgba(255, 255, 255, 0.06);
--border-default: rgba(255, 255, 255, 0.1);
--border-strong: rgba(255, 255, 255, 0.15);
--border-accent: rgba(99, 102, 241, 0.3);

/* Text Hierarchy */
--text-primary: #FFFFFF;
--text-secondary: rgba(255, 255, 255, 0.7);
--text-tertiary: rgba(255, 255, 255, 0.5);
--text-muted: rgba(255, 255, 255, 0.35);
--text-disabled: rgba(255, 255, 255, 0.25);
```

### Accent Colors (Neon Glow System)
```css
/* Primary Accent - Indigo/Electric */
--accent-primary: #6366F1;
--accent-primary-glow: rgba(99, 102, 241, 0.4);
--accent-primary-subtle: rgba(99, 102, 241, 0.1);

/* Success - Emerald */
--accent-success: #10B981;
--accent-success-glow: rgba(16, 185, 129, 0.4);
--accent-success-subtle: rgba(16, 185, 129, 0.1);

/* Warning - Amber */
--accent-warning: #F59E0B;
--accent-warning-glow: rgba(245, 158, 11, 0.4);
--accent-warning-subtle: rgba(245, 158, 11, 0.1);

/* Danger - Rose */
--accent-danger: #F43F5E;
--accent-danger-glow: rgba(244, 63, 94, 0.4);
--accent-danger-subtle: rgba(244, 63, 94, 0.1);

/* Info - Cyan */
--accent-info: #06B6D4;
--accent-info-glow: rgba(6, 182, 212, 0.4);
--accent-info-subtle: rgba(6, 182, 212, 0.1);

/* Special - Purple (Premium features) */
--accent-premium: #A855F7;
--accent-premium-glow: rgba(168, 85, 247, 0.4);
```

### Gradient Patterns
```css
/* Hero/Header Gradient */
--gradient-header: linear-gradient(180deg, 
  rgba(99, 102, 241, 0.15) 0%, 
  transparent 100%);

/* Card Glow Gradient */
--gradient-glow: radial-gradient(
  ellipse at top,
  rgba(99, 102, 241, 0.15) 0%,
  transparent 50%
);

/* Status Indicator Pulse */
--gradient-pulse: radial-gradient(circle, 
  var(--accent-success-glow) 0%, 
  transparent 70%
);

/* Glass Surface */
--glass-surface: linear-gradient(135deg,
  rgba(255, 255, 255, 0.05) 0%,
  rgba(255, 255, 255, 0.01) 100%
);
```

---

## 3. TYPOGRAPHY SYSTEM

### Font Stack
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-display: 'Inter', sans-serif; /* Could upgrade to Cabinet Grotesk or similar */
```

### Type Scale
```css
/* Display - Page Titles */
--text-display: 2.5rem;      /* 40px */
--text-display-weight: 700;
--text-display-line: 1.1;
--text-display-letter: -0.02em;

/* H1 - Section Headers */
--text-h1: 1.875rem;         /* 30px */
--text-h1-weight: 700;
--text-h1-line: 1.2;

/* H2 - Card Headers */
--text-h2: 1.5rem;           /* 24px */
--text-h2-weight: 600;
--text-h2-line: 1.3;

/* H3 - Subsection */
--text-h3: 1.25rem;          /* 20px */
--text-h3-weight: 600;
--text-h3-line: 1.4;

/* Body Large - Important text */
--text-body-lg: 1.125rem;    /* 18px */
--text-body-lg-weight: 400;
--text-body-lg-line: 1.5;

/* Body - Standard */
--text-body: 1rem;           /* 16px */
--text-body-weight: 400;
--text-body-line: 1.5;

/* Body Small - Metadata */
--text-body-sm: 0.875rem;    /* 14px */
--text-body-sm-weight: 400;
--text-body-sm-line: 1.5;

/* Caption - Labels, badges */
--text-caption: 0.75rem;     /* 12px */
--text-caption-weight: 500;
--text-caption-line: 1.4;
--text-caption-letter: 0.02em;

/* Micro - Timestamps, technical */
--text-micro: 0.6875rem;     /* 11px */
--text-micro-weight: 500;
--text-micro-line: 1.3;
--text-micro-letter: 0.03em;
```

### Monospace Usage (Data/Technical)
```css
/* Numbers, scores, codes */
--font-mono-spacing: -0.02em;
--font-mono-variant-numeric: tabular-nums;
```

---

## 4. SPACING SYSTEM (8px Grid)

```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

### Layout Grid
- **Container Max Width**: 1440px
- **Content Max Width**: 1280px
- **Sidebar Width**: 280px (collapsed: 72px)
- **Gutter**: 24px
- **Card Padding**: 20px
- **Section Gap**: 24px

---

## 5. COMPONENT SPECIFICATIONS

### 5.1 Glass Cards

**Base Card (Standard)**
```css
.glass-card {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.01) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 20px;
  transition: all 0.2s ease;
}

.glass-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.07) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
}
```

**Elevated Card (Featured/Important)**
```css
.glass-card-elevated {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.03) 100%
  );
  border: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(99, 102, 241, 0.1);
}
```

**Card with Glow (Active/Hover)**
```css
.glass-card-glow {
  box-shadow: 
    0 0 40px rgba(99, 102, 241, 0.15),
    0 4px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(99, 102, 241, 0.3);
}
```

### 5.2 Buttons

**Primary Button**
```css
.btn-primary {
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}
```

**Secondary Button (Ghost)**
```css
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}
```

**Icon Button**
```css
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border-color: rgba(255, 255, 255, 0.15);
}
```

### 5.3 Status Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #10B981;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #F59E0B;
}

.badge-danger {
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.2);
  color: #F43F5E;
}

.badge-info {
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  color: #06B6D4;
}

.badge-neutral {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}
```

### 5.4 Score Indicators

**Large Score Display**
```css
.score-display {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.2) 0%,
    rgba(99, 102, 241, 0.05) 100%
  );
  border: 1px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
}

.score-value {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.score-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}
```

**Progress Ring (Animated)**
```css
.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.5s ease;
  stroke-linecap: round;
}
```

### 5.5 Input Fields

```css
.input-field {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
}

.input-field:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
```

### 5.6 Navigation Sidebar

```css
.sidebar {
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg,
    rgba(10, 10, 15, 0.95) 0%,
    rgba(10, 10, 15, 0.98) 100%
  );
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 2px 8px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.nav-item.active {
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.15) 0%,
    rgba(99, 102, 241, 0.05) 100%
  );
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: #6366F1;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #6366F1;
  border-radius: 0 3px 3px 0;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}
```

---

## 6. ANIMATION & MOTION

### Easing Functions
```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Durations
```css
--duration-instant: 100ms;
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Key Animations

**Pulse Glow (Status Indicators)**
```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px currentColor;
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 20px currentColor;
    opacity: 0.8;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

**Slide In (Content)**
```css
@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slide-in-up 0.3s var(--ease-out) forwards;
}
```

**Shimmer (Loading States)**
```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-shimmer {
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

**Count Up (Numbers)**
```css
/* Use Framer Motion or similar for smooth number transitions */
```

**Radar Scan (Map/Location)**
```css
@keyframes radar-scan {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## 7. SCREEN SPECIFICATIONS

### 7.1 Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER (Fixed, 72px height)                                         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Logo │ Title/Subtitle                    │ Status │ Actions    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├──────────────────┬──────────────────────────────────────────────────┤
│                  │                                                  │
│ SIDEBAR          │ MAIN CONTENT AREA                                │
│ (280px width)    │ (Fluid, max 1200px)                              │
│                  │                                                  │
│ ┌──────────────┐ │ ┌──────────────────────────────────────────────┐ │
│ │ Navigation   │ │ │ STATS BAR                                    │ │
│ │              │ │ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │ │
│ │ • Live Leads │ │ │ │Card│ │Card│ │Card│ │Card│ │Card│ │Card│   │ │
│ │ • Sources    │ │ │ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘   │ │
│ │ • Providers  │ │ └──────────────────────────────────────────────┘ │
│ │ • Analytics  │ │                                                  │
│ │ • Settings   │ │ ┌──────────────────────────────────────────────┐ │
│ │              │ │ │                                              │ │
│ │ ──────────── │ │ │ CONTENT PANEL                                │ │
│ │              │ │ │                                              │ │
│ │ Quick Actions│ │ │  Lead Feed / Source Manager / etc            │ │
│ │ [+ Add Lead] │ │ │                                              │ │
│ │ [+ Provider] │ │ │                                              │ │
│ └──────────────┘ │ └──────────────────────────────────────────────┘ │
│                  │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘
```

### 7.2 Live Leads Screen

**Header Section**
- Title: "Live Lead Feed" with live indicator (pulsing green dot)
- Filter pills: All | New | Scored | Matched | Approved | Contacted
- Sort dropdown: Newest First | Highest Score | Urgency
- Search input with icon

**Lead Cards (List View)**
Each card contains:

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌────┐  #1234  🚨 URGENT   plumbing   [Status Badge]          Score │
│ │Icon│  "Water pipe burst in basement..."                           │
│ └────┘                                                              │
│ ⏱ 2m ago  📍 Downtown, NY  💰 Premium  👤 via Reddit      [Expand] │
├─────────────────────────────────────────────────────────────────────┤
│ [Expanded Content]                                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Original Post:                                                  │ │
│ │ "Full post text here..."                                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Detected Signals: [has_budget] [asking_recommendations] [urgent]   │
│                                                                     │
│ MATCHED PROVIDERS (3):                                             │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ┌────┐ PlumbPro Emergency Services                    98% Match│ │
│ │ │Logo│ ⭐ 4.8  🚨 24/7  ⏱ 30min  💰 Premium                    │ │
│ │ └────┘ Serves Downtown | Emergency Available | Top Rated       │ │
│ │                        [View] [Contact]                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ┌────┐ Quick Fix Plumbing                              72% Match│ │
│ │ │Logo│ ⭐ 4.2  ⏱ Same day  💰 Budget                          │ │
│ │ └────┘ Serves Downtown | Budget Friendly                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│           [Reject]              [Approve & Contact All]            │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.3 Source Manager Screen

**Grid Layout**
```
┌─────────────────────────────────────────────────────────────────────┐
│ SOURCES                                    [+ Add New Source]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────┐ │
│ │ 🔴 Reddit           │ │ 🟢 Local Forum      │ │ 🟡 Facebook     │ │
│ │ r/HomeImprovement   │ │ Home Services Board │ │ Community Page  │ │
│ │                     │ │                     │ │                 │ │
│ │ Status: ACTIVE      │ │ Status: ACTIVE      │ │ Status: PAUSED  │ │
│ │                     │ │                     │ │                 │ │
│ │ Last Crawl: 2m ago  │ │ Last Crawl: 15m ago │ │ Last Crawl: 2h  │ │
│ │ Posts: 1,234        │ │ Posts: 456          │ │ Posts: 89       │ │
│ │ Qualified: 89       │ │ Qualified: 34       │ │ Qualified: 12   │ │ │
│ │                     │ │                     │ │                 │ │
│ │ [Settings] [Pause]  │ │ [Settings] [Pause]  │ │ [Settings] [Run]│ │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.4 Provider Database Screen

**Table Layout with Cards**
```
┌─────────────────────────────────────────────────────────────────────┐
│ PROVIDERS                                  [+ Add Provider] [Import]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Search: [____________________] Filter: [All Services ▼] [Active ▼] │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🏢 PlumbPro Emergency Services        ⭐ 4.8  🟢 Active         │ │
│ │                                                                   │ │
│ │ Services: plumbing • drain cleaning • emergency repairs          │ │
│ │ Areas: Downtown • Midtown • Westside                             │ │
│ │ Response: 30 min | 24/7: ✅ | Price: Premium                     │ │
│ │                                                                   │ │
│ │ Leads: 45 received | 38 accepted | 84% conversion               │ │
│ │                                                                   │ │
│ │ 📞 +1-555-0101 | ✉️ jobs@plumbpro.com | 💬 WhatsApp             │ │
│ │                                                                   │ │
│ │                         [Edit] [View Leads] [Pause]             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.5 Analytics Dashboard

**Charts & Visualizations**
```
┌─────────────────────────────────────────────────────────────────────┐
│ ANALYTICS                                            [Export] [▲▼]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────┐ │
│ │ Line Chart          │ │ Bar Chart           │ │ Donut Chart     │ │
│ │ Leads Over Time     │ │ Top Services        │ │ Lead Sources    │ │
│ │                     │ │                     │ │                 │ │
│ │    ╭─╮              │ │ ████ plumbing       │ │    ╭────╮       │ │
│ │   ╭╯ ╰╮             │ │ ███  electrical     │ │   ╱ 25%  ╲      │ │
│ │ ─╯    ╰─            │ │ ██   roofing        │ │  ╱ Reddit ╲     │ │
│ │ Last 30 Days        │ │                     │ │ ╱__________╲    │ │
│ │ +24% vs last month  │ │                     │ │                 │ │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Conversion Funnel                                               │ │
│ │                                                                 │ │
│ │ ┌────────────────────────────────────────┐  100%  1,234 Crawled │ │
│ │ ┌──────────────────────────────────┐     │   45%    556 Parsed │ │
│ │ ┌────────────────────────────┐     │     │   23%    284 Qualified│ │
│ │ ┌────────────────────┐     │     │     │   12%    148 Contacted│ │
│ │ ┌──────────────┐     │     │     │     │    8%     99 Converted│ │
│ │ └──────────────┘     │     │     │     │                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. SPECIAL EFFECTS

### 8.1 Scan Line Effect (Optional retro touch)
```css
.scan-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    rgba(99, 102, 241, 0.5),
    transparent
  );
  animation: scan 3s linear infinite;
  pointer-events: none;
}
```

### 8.2 Noise Texture Overlay
```css
.noise-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  z-index: 1000;
}
```

### 8.3 Grid Background (Subtle)
```css
.grid-bg {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

---

## 9. RESPONSIVE BREAKPOINTS

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */

/* Sidebar Behavior */
/* < 1024px: Collapse to icon-only (72px) */
/* < 768px: Hide sidebar, use bottom nav or hamburger */
```

---

## 10. ICONOGRAPHY

**Icon Library**: Lucide React
**Icon Style**: Outline (2px stroke), rounded caps
**Default Size**: 20px (1.25rem)

### Key Icons
- Activity (Logo/Status)
- Zap (Leads/Live)
- Globe (Sources)
- Users (Providers)
- BarChart3 (Analytics)
- Settings
- Search
- Filter
- ChevronDown/Up (Expand)
- CheckCircle2 (Approve)
- XCircle (Reject)
- AlertCircle (Warning)
- Clock (Time)
- MapPin (Location)
- DollarSign (Budget)
- Phone, Mail, MessageSquare (Contact)
- Play, Pause (Controls)
- RefreshCw (Reload)
- Plus (Add)
- MoreHorizontal (Menu)

---

## 11. IMPLEMENTATION NOTES FOR CLAUDE DESIGN

### Critical Requirements
1. **Dark Mode Only** - No light mode needed
2. **Glassmorphism** - Heavy use of backdrop-filter, careful with performance
3. **Monospace for Numbers** - All scores, counts, timestamps
4. **Consistent Spacing** - Strict 8px grid
5. **Smooth Animations** - 60fps, use transform/opacity only
6. **Accessibility** - WCAG 2.1 AA for contrast (even in dark mode)

### Performance Considerations
- Limit backdrop-filter to specific elements (not entire containers)
- Use will-change sparingly
- Implement virtualization for long lists (leads)
- Lazy load below-fold content

### Animation Priority
1. Page transitions (200ms)
2. Card hover states (150ms)
3. Score number counting (500ms)
4. Status pulse effects (2s infinite)
5. Loading shimmer (1.5s infinite)

### File Structure to Create
```
dashboard-v2/
├── app/
│   ├── layout.tsx          # Root layout with fonts, providers
│   ├── globals.css         # CSS variables, base styles
│   ├── page.tsx            # Dashboard main
│   ├── leads/
│   │   └── page.tsx        # Leads view
│   ├── sources/
│   │   └── page.tsx        # Sources view
│   ├── providers/
│   │   └── page.tsx        # Providers view
│   └── analytics/
│       └── page.tsx        # Analytics view
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   └── score.tsx
│   ├── leads/
│   │   ├── lead-card.tsx
│   │   ├── lead-feed.tsx
│   │   └── match-list.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   └── navigation.tsx
│   └── providers/
│       └── provider-card.tsx
├── lib/
│   ├── utils.ts            # cn() helper
│   └── db.ts               # Database client
└── public/
    └── (assets)
```

---

## 12. REFERENCE INSPIRATIONS

### Visual References
- **Linear.app** - Glassmorphism, dark theme, animations
- **Vercel Dashboard** - Clean layouts, data density
- **Raycast** - Command palette, dark aesthetic
- **Figma** - Collaboration features, sidebar design
- **Sentry** - Error monitoring, data visualization
- **Supabase** - Dark mode implementation

### Color Reference
- Backgrounds: #030305 to #12121A
- Accents: Linear-style indigo/purple gradient
- Success: Tailwind emerald-500
- Borders: Very subtle whites (3-10% opacity)

---

**End of Design Specification**

This document provides everything needed to implement a premium, Sigil/Demiurge-style interface. The key is maintaining consistency in the dark theme, using glassmorphism thoughtfully, and ensuring smooth animations throughout.
