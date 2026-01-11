# Claude Context: profiling.wtf

## What This Project Is

An interactive educational site that teaches flame graph profiling from first principles. The key pedagogical insight is teaching *how flame graphs are constructed* from raw profiler samples, not just how to read them. This creates durable understanding.

## Design Philosophy

**Tone:** Refined minimalism. Dark, technical, warm. Like a well-designed developer tool UI.

**Aesthetic:** The content is the hero; design supports without distracting. No flashy gradients, no glow effects, single accent color (orange).

**The "aha moment":** When users SEE samples become a flame graph in the BuildDemo. Most resources show flame graphs without explaining construction. We demystify.

## Current State (January 2026)

The site has 8 main sections fully implemented:
1. Why Profile - Knight Capital disaster story, informed vs premature optimization
2. Sampling - Animated visualization of how profilers capture stack samples
3. Building - Interactive 4-step flame graph construction (THE KEY SECTION)
4. Reading - Full interactive flame graph with zoom, search, layout toggle
5. Common Mistakes - 6 misconception cards with red warning styling
6. Variations - Flame graph vs chart toggle, differential flame graphs, off-CPU
7. Memory - Allocation flame graphs (blue), GC simulator with mark/sweep
8. Taking Action - Amdahl's Law calculator, patterns to look for

## Design Decisions Made

### Why Cards Look The Way They Do

I unified the card system after the user noticed inconsistent styling. The semantic system:

- **Green cards** = key insights, correct approaches, things to focus on
- **Red cards** = mistakes, warnings, things to avoid
- **Blue cards** = informational, FYI, explanatory
- **Orange cards** = highlighted/selected states, featured items
- **Gray cards** = neutral, default, de-emphasized

All use consistent: `rounded-lg`, border opacity 20%, bg opacity 5%, icon badges.

### Why FlameGraph Annotations Use Those Colors

The `handleRequest` card is neutral (gray) because it's "not the bottleneck" - just a dispatcher with 0% self-time. The `parseJSON` card is green because it's the key insight - where actual work happens with high self-time. This teaches the self-time vs total-time distinction visually.

### Why MistakeCards Are Red

Originally they were neutral gray with just a red ✗ icon. The user wanted more clarity, so I made the entire card use the red warning treatment to match the WhyProfile "incorrect example" styling.

### Why BuildDemo Uses Cursor States

The step buttons had `cursor-not-allowed` showing on the active button. Fixed to use:
- `cursor-pointer` on clickable past steps
- `cursor-default` on current active step
- `cursor-not-allowed` on disabled future steps

## What's NOT Implemented (From Original Plan)

These were in the comprehensive plan but user chose not to include:

- **Guided Practice scenarios** (4 pre-built code scenarios with learning objectives)
- **Monaco Editor playground** for running code and seeing flame graphs
- **More detailed GC simulator** with generational GC
- **Memory leak interactive demo**

## Code Patterns to Follow

### The cn() Utility

Always use for className logic:
```tsx
import { cn } from '../lib/cn'

className={cn(
  'base-classes here',
  condition && 'conditional-classes',
  anotherCondition ? 'true-classes' : 'false-classes'
)}
```

### Reduced Motion Support

```tsx
const prefersReducedMotion = 
  typeof window !== 'undefined' && 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// In animations:
initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
```

### Card With Icon Badge Pattern

```tsx
<div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm">
  <div className="flex items-start gap-2">
    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">✓</span>
    <p className="text-[var(--text)]">
      <strong className="text-green-400">Title:</strong> Content here.
    </p>
  </div>
</div>
```

### Code Highlighting in Text

```tsx
<code className="rounded bg-green-500/20 px-1 text-green-400">functionName</code>
<code className="rounded bg-[var(--accent)]/20 px-1 text-[var(--accent)]">highlighted</code>
```

## Things to Watch Out For

1. **Don't use hardcoded colors** - Use CSS variables or Tailwind color classes
2. **Don't forget rounded-lg** - All cards should use `rounded-lg`, buttons use `rounded-md`
3. **Don't skip reduced motion** - All animations need static fallbacks
4. **Don't make cards too busy** - Keep content focused, one key message per card
5. **The site uses Vite** - Despite the Bun rule, this project uses Vite for dev server

## Potential Future Work

If user asks for more content, refer to the original plan at:
`.cursor/plans/profiling_educational_site_04a93dc3.plan.md`

Ideas that could be added:
- More detailed off-CPU flame graph interactive demo
- Flame graph color scheme selector (random warm, heat map, by type)
- Export/share functionality for the interactive demos
- More quiz-style interactions in the mistakes section
- Deeper memory profiling (retained size calculation, leak detection)

## Testing the Site

```bash
bun run dev          # Start at localhost:5173
bun run tsc --noEmit # Check for TypeScript errors
```

Navigate through all 8 sections to verify:
- Animations play smoothly
- Interactive demos respond to clicks
- Cards have consistent styling
- No console errors

## Files Most Likely to Need Editing

- `src/App.tsx` - Main layout, section order, content text
- `src/index.css` - Design tokens, CSS variables
- `src/components/MistakeCard.tsx` - If adding more mistakes
- `src/components/Variations/*.tsx` - For new visualization types
- `src/lib/flameGraphData.ts` - If changing sample data
