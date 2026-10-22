# profiling.wtf 🔥

An interactive educational site teaching code profiling and flame graphs from first principles.

<img width="769" height="562" alt="image" src="https://github.com/user-attachments/assets/7a27530c-8abc-4b57-b981-8f42e36fe7fc" />


## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 20.19+ / 22.12+
- A modern browser: Safari 16.4+, Chrome 111+, or Firefox 128+ (Tailwind CSS 4)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/profiling.wtf.git
cd profiling.wtf

# Install dependencies
bun install

# Start the dev server
bun run dev
```

The site will be available at `http://localhost:5173`

### Other Commands

```bash
bun run build      # Production build
bun run preview    # Preview production build
bun run tsc --noEmit  # Type check
```

## Project Structure

```
src/
├── App.tsx                    # Main layout with all sections
├── index.css                  # CSS variables, design tokens
├── lib/                       # Data and utilities
│   ├── cn.ts                  # clsx + tailwind-merge utility
│   ├── flameGraphData.ts      # Sample profile data
│   ├── diffFlameData.ts       # Before/after comparison data
│   └── allocationData.ts      # Memory allocation data
├── components/
│   ├── SamplingDemo.tsx       # Animated sampling visualization
│   ├── BuildDemo.tsx          # 4-step flame graph construction
│   ├── FlameGraph/            # Interactive flame graph component
│   ├── MistakeCard.tsx        # Common mistakes cards
│   ├── Variations/            # Flame chart, diff, off-CPU demos
│   ├── Memory/                # Allocation graphs, GC simulator
│   └── TakingAction/          # Amdahl calculator, patterns
├── sections/                  # Section wrapper components
└── hooks/                     # Custom React hooks
```
