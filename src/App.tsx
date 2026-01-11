import { Analytics } from '@vercel/analytics/react'
import { SamplingDemo } from './components/SamplingDemo'
import { BuildDemo } from './components/BuildDemo'
import { FlameGraph } from './components/FlameGraph/FlameGraph'
import { MistakeCard } from './components/MistakeCard'
import { WhyProfile } from './components/WhyProfile'
import { FlameChartToggle } from './components/Variations/FlameChartToggle'
import { DiffFlameGraph } from './components/Variations/DiffFlameGraph'
import { OffCPUDemo } from './components/Variations/OffCPUDemo'
import { AllocationFlameGraph } from './components/Memory/AllocationFlameGraph'
import { GCSimulator } from './components/Memory/GCSimulator'
import { AmdahlCalculator } from './components/TakingAction/AmdahlCalculator'
import { PatternVisualizations } from './components/TakingAction/PatternVisualizations'
import { ExploreProfile } from './components/ExploreProfile/ExploreProfile'
import { sampleFlameData } from './lib/flameGraphData'
import { realisticProfileData } from './lib/realisticProfileData'

function App() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      {/* Header */}
      <header className="mb-24">
        <h1 className="text-5xl text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          How Profiling and Flame Graphs Work
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          An interactive guide to understanding profilers and reading flame graphs
        </p>
      </header>

      {/* Section 1: Why Profile? */}
      <section className="mb-24">
        <h2 className="text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Why Profile?
        </h2>
        <div className="mt-8">
          <WhyProfile />
        </div>
      </section>

      {/* Section 2: Sampling */}
      <section className="mb-24">
        <h2 className="text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Sampling
        </h2>
        <p className="mt-4 text-[var(--text-muted)]">
          Your profiler doesn't watch every instruction. It sets a timer that fires ~100 times per second. 
          Each tick: capture the current call stack. After thousands of samples, you have a statistical picture of where time is spent.
        </p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          <span className="text-[var(--text)]">Why sampling?</span> The alternative—instrumentation—wraps every function call. 
          Accurate, but slows your code 10-100x. Sampling has near-zero overhead. The tradeoff: very fast functions may not appear at all.
        </p>
        <div className="mt-10">
          <SamplingDemo />
        </div>
      </section>

      {/* Section 3: Building */}
      <section className="mb-24">
        <h2 className="text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Building the Graph
        </h2>
        <p className="mt-4 text-[var(--text-muted)]">
          A flame graph is built in steps: fold identical stacks, sort siblings alphabetically, then draw. 
          Width equals frequency—wider means sampled more often.
        </p>
        <div className="mt-10">
          <BuildDemo />
        </div>
      </section>

      {/* Section 4: Reading */}
      <section className="mb-24">
        <h2 className="text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Reading the Graph
        </h2>
        <p className="mt-4 text-[var(--text-muted)]">
          Y-axis is stack depth. X-axis is alphabetical (not time!). Width is sample count. 
          The top edge shows where CPU time was actually spent—that's self-time.
        </p>
        <div className="mt-10">
          <FlameGraph data={sampleFlameData} />
        </div>
      </section>

      {/* Section 5: Common Mistakes */}
      <section className="mb-24">
        <h2 className="text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Common Mistakes
        </h2>
        <div className="mt-8 divide-y divide-[var(--surface)]">
          <MistakeCard
            title="The X-axis is time"
            correction="No—it's alphabetical. Same function appears in same horizontal position across stacks."
          />
          <MistakeCard
            title="Wide means slow"
            correction="Only if the frame has self-time. A wide frame that just calls other functions isn't the problem."
          />
          <MistakeCard
            title="Optimize the widest function"
            correction="The widest frame is often main()—just a dispatcher. Look for frames with high self-time."
          />
          <MistakeCard
            title="Colors indicate performance"
            correction="In classic flame graphs, colors are random warm hues for visual distinction. Know your tool."
          />
          <MistakeCard
            title="Narrow frame = fast function"
            correction="Might just be rarely sampled. Very short functions can be missed entirely by sampling profilers."
          />
          <MistakeCard
            title="Missing function must be fast"
            correction="Sampling artifact. Functions shorter than the sample interval may not appear at all."
          />
        </div>
      </section>

      {/* Section 6: Explore a Real Profile */}
      <section className="mb-24">
        <h2 className="text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Explore a Real Profile
        </h2>
        <p className="mt-4 text-[var(--text-muted)]">
          Real profiles have dozens or hundreds of functions. Use zoom and search to navigate.
        </p>
        <div className="mt-10">
          <ExploreProfile data={realisticProfileData} />
        </div>
      </section>

      {/* Section 7: Variations */}
      <section className="mb-24">
        <h2 className="text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Variations
        </h2>
        <p className="mt-4 text-[var(--text-muted)]">
          The flame graph you've learned is just one view. Different visualizations answer different questions.
        </p>

        {/* Flame Graph vs Flame Chart */}
        <div className="mt-12">
          <h3 className="text-xl font-medium text-[var(--text)]">Flame Graph vs Flame Chart</h3>
          <p className="mt-2 text-[var(--text-muted)]">
            Same data, two views. Flame graphs merge stacks (aggregate). Flame charts preserve time order (temporal).
          </p>
          <div className="mt-6">
            <FlameChartToggle />
          </div>
        </div>

        {/* Differential Flame Graphs */}
        <div className="mt-16">
          <h3 className="text-xl font-medium text-[var(--text)]">Differential Flame Graphs</h3>
          <p className="mt-2 text-[var(--text-muted)]">
            Compare before and after. Green means faster, red means slower.
          </p>
          <div className="mt-6">
            <DiffFlameGraph />
          </div>
        </div>

        {/* Off-CPU */}
        <div className="mt-16">
          <h3 className="text-xl font-medium text-[var(--text)]">Off-CPU Flame Graphs</h3>
          <p className="mt-2 text-[var(--text-muted)]">
            Programs aren't just slow because of CPU. They wait—on disk I/O, network calls, locks, sleep.
          </p>
          <div className="mt-6">
            <OffCPUDemo />
          </div>
        </div>
      </section>

      {/* Section 7: Memory Profiling */}
      <section className="mb-24">
        <h2 className="text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Memory Profiling
        </h2>
        <p className="mt-4 text-[var(--text-muted)]">
          CPU profiling shows where time goes. Memory profiling shows where bytes go.
        </p>

        {/* Allocation Flame Graphs */}
        <div className="mt-12">
          <h3 className="text-xl font-medium text-[var(--text)]">Allocation Flame Graphs</h3>
          <p className="mt-2 text-[var(--text-muted)]">
            Width shows bytes allocated through each call path, not CPU time.
          </p>
          <div className="mt-6">
            <AllocationFlameGraph />
          </div>
        </div>

        {/* GC Simulator */}
        <div className="mt-16">
          <h3 className="text-xl font-medium text-[var(--text)]">How Garbage Collection Works</h3>
          <p className="mt-2 text-[var(--text-muted)]">
            Mark-and-sweep: trace from roots, mark reachable objects, sweep the rest.
          </p>
          <div className="mt-6">
            <GCSimulator />
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            <span className="text-[var(--text)]">Connection to profiling:</span> GC pauses appear as frames in your CPU profile. 
            High allocation rates cause frequent GC, which shows up as time spent in GC functions. 
            If you see significant GC time, check your allocation flame graph.
          </p>
        </div>

        {/* Memory Leaks */}
        <div className="mt-16">
          <h3 className="text-xl font-medium text-[var(--text)]">Common Memory Leak Patterns</h3>
          <div className="mt-4 space-y-3 text-[var(--text-muted)]">
            <p><span className="text-[var(--text)]">Growing event listeners</span> — Attaching listeners without removing them</p>
            <p><span className="text-[var(--text)]">Closures holding references</span> — Functions capturing large objects in scope</p>
            <p><span className="text-[var(--text)]">Unbounded caches</span> — Caches that grow forever without eviction</p>
            <p><span className="text-[var(--text)]">Detached DOM nodes</span> — Removed from DOM but still referenced in JS</p>
          </div>
          <p className="mt-4 text-[var(--text-muted)]">
            Compare heap snapshots over time. If memory grows between identical operations, you have a leak.
          </p>
        </div>
      </section>

      {/* Section 8: Taking Action */}
      <section className="mb-24">
        <h2 className="text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Taking Action
        </h2>
        <p className="mt-4 text-[var(--text-muted)]">
          Understanding flame graphs is half the battle. Now: what do you actually do?
        </p>

        {/* Amdahl's Law */}
        <div className="mt-12">
          <h3 className="text-xl font-medium text-[var(--text)]">Prioritize with Amdahl's Law</h3>
          <p className="mt-2 text-[var(--text-muted)]">
            How much does optimizing one function help overall? The math might surprise you.
          </p>
          <div className="mt-6">
            <AmdahlCalculator />
          </div>
        </div>

        {/* Patterns to look for */}
        <div className="mt-16">
          <h3 className="text-xl font-medium text-[var(--text)]">Patterns to Look For</h3>
          <div className="mt-6">
            <PatternVisualizations />
          </div>
        </div>

        {/* The Loop */}
        <div className="mt-16">
          <h3 className="text-xl font-medium text-[var(--text)]">The Performance Loop</h3>
          <p className="mt-4 font-mono text-[var(--text-muted)]">
            Profile → Analyze → Hypothesize → Change → <span className="text-[var(--accent)]">Repeat</span>
          </p>
          <p className="mt-3 text-[var(--text-muted)]">
            Always profile again after changes. Trust the numbers, not your intuition.
          </p>
        </div>

        {/* Getting Started */}
        <div className="mt-16">
          <h3 className="text-xl font-medium text-[var(--text)]">Getting Started</h3>
          <p className="mt-2 text-[var(--text-muted)]">
            Common profiling tools by platform:
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-[var(--text-muted)]">
              <span className="font-mono text-[var(--text)]">Browser</span> — Chrome DevTools Performance tab
            </p>
            <p className="text-[var(--text-muted)]">
              <span className="font-mono text-[var(--text)]">Node.js</span> — <code className="text-[var(--text-muted)]">--prof</code> flag, clinic.js, 0x
            </p>
            <p className="text-[var(--text-muted)]">
              <span className="font-mono text-[var(--text)]">Python</span> — py-spy, cProfile, scalene
            </p>
            <p className="text-[var(--text-muted)]">
              <span className="font-mono text-[var(--text)]">Go</span> — pprof (built-in)
            </p>
            <p className="text-[var(--text-muted)]">
              <span className="font-mono text-[var(--text)]">Rust</span> — cargo-flamegraph, perf
            </p>
            <p className="text-[var(--text-muted)]">
              <span className="font-mono text-[var(--text)]">Linux</span> — perf, bpftrace
            </p>
            <p className="text-[var(--text-muted)]">
              <span className="font-mono text-[var(--text)]">macOS</span> — Instruments, sample
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 text-[var(--text-muted)]">
        <p>
          Made by{' '}
          <a 
            href="https://olivier.me" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)]"
          >
            Olivier Williams
          </a>
        </p>
        <p>
          Inspired by{' '}
          <a 
            href="https://brianlovin.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)]"
          >
            Brian Lovin
          </a>
          's {' '}
          <a
            href="https://how-terminals-work.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)]"
          >
           How Terminals Work
          </a>
        </p>
      </footer>
      <Analytics />
    </main>
  )
}

export default App
