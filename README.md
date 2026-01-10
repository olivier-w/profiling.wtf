# profiling.wtf

An interactive educational site teaching code profiling and flame graphs from first principles.

## 🔥 What You'll Learn

1. **Why Profile?** - The cost of guessing vs measuring
2. **How Profilers Work** - Sampling vs instrumentation explained visually
3. **Building Flame Graphs** - Construct one from raw samples to truly understand
4. **Reading Flame Graphs** - Self-time vs total-time, anatomy explained
5. **Common Mistakes** - Quiz to prevent misreadings
6. **Variations** - Flame charts, icicle charts, differential views
7. **Guided Practice** - Real-world scenarios with hints
8. **Memory Profiling** - GC simulation and leak detection
9. **Taking Action** - Amdahl's Law calculator for prioritization

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Tech Stack

- **React 18** - Component framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Framer Motion** - Animations
- **D3** - Flame graph visualization

## 📚 Key Features

- **Interactive Sampling Visualizer** - Watch a profiler capture stack samples
- **Build-a-FlameGraph Demo** - Step through the construction process
- **Flame Graph Explorer** - Zoom, search, and explore with guided tour
- **Spot-the-Mistake Quiz** - Prevent common misreadings
- **GC Simulator** - Visualize mark-and-sweep garbage collection
- **Amdahl's Law Calculator** - Prioritize optimization targets

## 📖 References

- [Brendan Gregg's Flame Graphs](https://www.brendangregg.com/flamegraphs.html) - The inventor
- [Sentry Profiling Docs](https://docs.sentry.io/product/explore/profiling/)
- [d3-flame-graph](https://github.com/spiermar/d3-flame-graph)

## License

MIT
