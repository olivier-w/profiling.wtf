# Agent Context: profiling.wtf

## Project Overview

An interactive educational site teaching code profiling and flame graphs from first principles. The pedagogical approach emphasizes *construction* over *consumption* - users learn by seeing how flame graphs are built from raw samples, not just how to read them.

**Live URL:** http://localhost:5173 (dev server)

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite (dev server on port 5173)
- **Styling:** Tailwind CSS with CSS variables
- **Animation:** motion/react (Framer Motion v11+)
- **Package Manager:** Bun preferred

## Project Structure

```
src/
├── App.tsx                      # Main layout with 8 sections
├── index.css                    # CSS variables, design tokens
├── lib/
│   ├── cn.ts                    # clsx + tailwind-merge utility
│   ├── flameGraphData.ts        # Sample profile data
│   ├── diffFlameData.ts         # Before/after comparison data
│   └── allocationData.ts        # Memory allocation data
├── components/
│   ├── WhyProfile.tsx           # Section 01: Motivation
│   ├── SamplingDemo.tsx         # Section 02: Animated sampling visualization
│   ├── BuildDemo.tsx            # Section 03: 4-step flame graph construction
│   ├── FlameGraph/              # Section 04: Interactive flame graph
│   │   ├── FlameGraph.tsx
│   │   ├── FlameNode.tsx
│   │   ├── Tooltip.tsx
│   │   └── Search.tsx
│   ├── MistakeCard.tsx          # Section 05: Common mistakes cards
│   ├── Variations/              # Section 06: Flame graph variations
│   │   ├── FlameChartToggle.tsx # Flame graph vs flame chart comparison
│   │   └── DiffFlameGraph.tsx   # Differential flame graph
│   ├── Memory/                  # Section 07: Memory profiling
│   │   ├── AllocationFlameGraph.tsx
│   │   └── GCSimulator.tsx      # Mark-and-sweep GC visualization
│   └── TakingAction/            # Section 08: Practical application
│       └── AmdahlCalculator.tsx # Interactive Amdahl's Law calculator
└── hooks/
    └── useFlameGraph.ts         # Zoom/search/hover state management
```

## Section Order

```
00 - Header
01 - Why Profile? (motivation, Knight Capital story)
02 - Sampling (animated profiler sampling demo)
03 - Building the Graph (4-step construction: raw → fold → sort → build)
04 - Reading the Graph (interactive flame graph explorer)
05 - Common Mistakes (6 misconception cards)
06 - Variations (flame chart toggle, differential, off-CPU)
07 - Memory Profiling (allocation flame graph, GC simulator)
08 - Taking Action (Amdahl's Law calculator, patterns)
Footer
```

## Design System

### CSS Variables (index.css)

```css
:root {
  --bg: #09090b;           /* zinc-950 */
  --surface: #18181b;      /* zinc-900 */
  --surface-hover: #27272a; /* zinc-800 */
  --border: #3f3f46;       /* zinc-700 */
  --text: #fafafa;         /* zinc-50 */
  --text-muted: #a1a1aa;   /* zinc-400 */
  --accent: #f97316;       /* orange-500 */
  
  /* Semantic colors */
  --success: #22c55e;      /* green-500 */
  --error: #ef4444;        /* red-500 */
  --info: #3b82f6;         /* blue-500 */
  
  /* Flame graph colors */
  --flame-1: #fef08a;      /* yellow-200 */
  --flame-2: #fbbf24;      /* amber-400 */
  --flame-3: #f97316;      /* orange-500 */
  --flame-4: #ea580c;      /* orange-600 */
}
```

### Semantic Card System

| Type | Use Case | Classes |
|------|----------|---------|
| **Key Insight (Green)** | Important takeaways, correct approaches | `border-green-500/20 bg-green-500/5` + ✓ icon |
| **Warning (Red)** | Mistakes, pitfalls, problems | `border-red-500/20 bg-red-500/5` + ✗ icon |
| **Info (Blue)** | Explanatory FYI content | `border-[var(--info)]/20 bg-[var(--info)]/5` + i icon |
| **Highlight (Orange)** | Selected/active states | `border-[var(--accent)]/20 bg-[var(--accent)]/5` |
| **Neutral (Gray)** | Default, de-emphasized | `border-[var(--border)] bg-[var(--surface)]` |

### Card Pattern Template

```tsx
// Key insight card
<div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm">
  <div className="flex items-start gap-2">
    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">✓</span>
    <p className="text-[var(--text)]">
      <strong className="text-green-400">Key insight:</strong> Your content here.
    </p>
  </div>
</div>
```

### Component Conventions

- Use `cn()` utility (clsx + tailwind-merge) for all className logic
- Use `rounded-lg` for cards, `rounded-md` for buttons
- Border opacity: 20%, background opacity: 5% for tinted cards
- Support `prefers-reduced-motion` with static fallbacks
- Use `tabular-nums` for numeric data
- Icon badges: `h-5 w-5` or `h-6 w-6` with matching color background

## Key Interactive Components

### SamplingDemo
- Animated stack that grows/shrinks
- Timer tick captures current stack
- Samples accumulate in list
- Pause/resume functionality

### BuildDemo
- 4-step progression: Raw Samples → Fold → Sort → Build
- Step buttons with disabled states for future steps
- Animated transitions between steps

### FlameGraph
- SVG-based with d3-hierarchy
- Click to zoom, double-click to reset
- Search with highlighting
- Flame/Icicle layout toggle
- Tooltip with self-time vs total-time

### GCSimulator
- Visual heap with colored objects
- Reference arrows between objects
- Mark phase highlights reachable
- Sweep phase removes garbage with animation

### AmdahlCalculator
- Two sliders: runtime % and speedup factor
- Visual before/after bar comparison
- Reality check examples that highlight based on input

## Animation Guidelines

- Use only `transform` and `opacity` (compositor properties)
- Max 200ms for interaction feedback
- Use `ease-out` easing
- Wrap in `prefers-reduced-motion` checks
- Use `motion/react` for React animations

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (port 5173)
bun run build        # Production build
bun run tsc --noEmit # Type check
```
