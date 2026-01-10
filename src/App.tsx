import { SamplingDemo } from './components/SamplingDemo'
import { BuildDemo } from './components/BuildDemo'
import { FlameGraph } from './components/FlameGraph/FlameGraph'
import { MistakeCard } from './components/MistakeCard'
import { WhyProfile } from './components/WhyProfile'
import { FlameChartToggle } from './components/Variations/FlameChartToggle'
import { DiffFlameGraph } from './components/Variations/DiffFlameGraph'
import { AllocationFlameGraph } from './components/Memory/AllocationFlameGraph'
import { GCSimulator } from './components/Memory/GCSimulator'
import { AmdahlCalculator } from './components/TakingAction/AmdahlCalculator'
import { sampleFlameData } from './lib/flameGraphData'

function App() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <header className="mb-20">
        <p className="font-mono text-sm text-[var(--text-muted)]">00</p>
        <h1 className="mt-1 text-2xl font-medium text-[var(--accent)]">
          How Flame Graphs Work
        </h1>
        <p className="mt-3 text-[var(--text-muted)]">
          An interactive guide to understanding profilers and reading flame graphs
        </p>
      </header>

      {/* Section 1: Why Profile? */}
      <section className="mb-20">
        <p className="font-mono text-sm text-[var(--text-muted)]">01</p>
        <h2 className="mt-1 text-xl font-medium text-[var(--accent)]">
          Why Profile?
        </h2>
        <div className="mt-6">
          <WhyProfile />
        </div>
      </section>

      {/* Section 2: Sampling */}
      <section className="mb-20">
        <p className="font-mono text-sm text-[var(--text-muted)]">02</p>
        <h2 className="mt-1 text-xl font-medium text-[var(--accent)]">
          Sampling
        </h2>
        <p className="mt-3 text-[var(--text-muted)]">
          Your profiler doesn't watch every instruction. It sets a timer that fires ~100 times per second. 
          Each tick: capture the current call stack. After thousands of samples, you have a statistical picture of where time is spent.
        </p>
        <div className="mt-8">
          <SamplingDemo />
        </div>
      </section>

      {/* Section 3: Building */}
      <section className="mb-20">
        <p className="font-mono text-sm text-[var(--text-muted)]">03</p>
        <h2 className="mt-1 text-xl font-medium text-[var(--accent)]">
          Building the Graph
        </h2>
        <p className="mt-3 text-[var(--text-muted)]">
          A flame graph is built in steps: fold identical stacks, sort siblings alphabetically, then draw. 
          Width equals frequency—wider means sampled more often.
        </p>
        <div className="mt-8">
          <BuildDemo />
        </div>
      </section>

      {/* Section 4: Reading */}
      <section className="mb-20">
        <p className="font-mono text-sm text-[var(--text-muted)]">04</p>
        <h2 className="mt-1 text-xl font-medium text-[var(--accent)]">
          Reading the Graph
        </h2>
        <p className="mt-3 text-[var(--text-muted)]">
          Y-axis is stack depth. X-axis is alphabetical (not time!). Width is sample count. 
          The top edge shows where CPU time was actually spent—that's self-time.
        </p>
        <div className="mt-8">
          <FlameGraph data={sampleFlameData} />
        </div>
      </section>

      {/* Section 5: Common Mistakes */}
      <section className="mb-20">
        <p className="font-mono text-sm text-[var(--text-muted)]">05</p>
        <h2 className="mt-1 text-xl font-medium text-[var(--accent)]">
          Common Mistakes
        </h2>
        <div className="mt-6 space-y-4">
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

      {/* Section 6: Variations */}
      <section className="mb-20">
        <p className="font-mono text-sm text-[var(--text-muted)]">06</p>
        <h2 className="mt-1 text-xl font-medium text-[var(--accent)]">
          Variations
        </h2>
        <p className="mt-3 text-[var(--text-muted)]">
          The flame graph you've learned is just one view. Different visualizations answer different questions.
        </p>

        {/* Flame Graph vs Flame Chart */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-[var(--text)]">Flame Graph vs Flame Chart</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Same data, two views. Flame graphs merge stacks (aggregate). Flame charts preserve time order (temporal).
          </p>
          <div className="mt-4">
            <FlameChartToggle />
          </div>
        </div>

        {/* Differential Flame Graphs */}
        <div className="mt-12">
          <h3 className="text-lg font-medium text-[var(--text)]">Differential Flame Graphs</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Compare before and after. Green means faster, red means slower.
          </p>
          <div className="mt-4">
            <DiffFlameGraph />
          </div>
        </div>

        {/* Off-CPU (brief explanation) */}
        <div className="mt-12 rounded-lg border border-[var(--info)]/20 bg-[var(--info)]/5 p-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--info)]/20 text-xs text-[var(--info)]">i</span>
            <h3 className="text-lg font-medium text-[var(--text)]">Off-CPU Flame Graphs</h3>
          </div>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Programs aren't just slow because of CPU. They wait—on disk I/O, network calls, locks, sleep.
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Off-CPU flame graphs show where time is spent <em>waiting</em>, not computing. 
            Same visualization, different data source. If your profiler shows 10% CPU but 
            the program feels slow, you need off-CPU analysis.
          </p>
        </div>
      </section>

      {/* Section 7: Memory Profiling */}
      <section className="mb-20">
        <p className="font-mono text-sm text-[var(--text-muted)]">07</p>
        <h2 className="mt-1 text-xl font-medium text-[var(--accent)]">
          Memory Profiling
        </h2>
        <p className="mt-3 text-[var(--text-muted)]">
          CPU profiling shows where time goes. Memory profiling shows where bytes go.
        </p>

        {/* Allocation Flame Graphs */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-[var(--text)]">Allocation Flame Graphs</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Width shows bytes allocated through each call path, not CPU time.
          </p>
          <div className="mt-4">
            <AllocationFlameGraph />
          </div>
        </div>

        {/* GC Simulator */}
        <div className="mt-12">
          <h3 className="text-lg font-medium text-[var(--text)]">How Garbage Collection Works</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Mark-and-sweep: trace from roots, mark reachable objects, sweep the rest.
          </p>
          <div className="mt-4">
            <GCSimulator />
          </div>
        </div>

        {/* Memory Leaks (brief) */}
        <div className="mt-12 rounded-lg border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-xs text-red-400">!</span>
            <h3 className="text-lg font-medium text-[var(--text)]">Common Memory Leak Patterns</h3>
          </div>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>• <strong className="text-[var(--text)]">Growing event listeners</strong> — Attaching listeners without removing them</p>
            <p>• <strong className="text-[var(--text)]">Closures holding references</strong> — Functions capturing large objects in scope</p>
            <p>• <strong className="text-[var(--text)]">Unbounded caches</strong> — Caches that grow forever without eviction</p>
            <p>• <strong className="text-[var(--text)]">Detached DOM nodes</strong> — Removed from DOM but still referenced in JS</p>
          </div>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Compare heap snapshots over time. If memory grows between identical operations, you have a leak.
          </p>
        </div>
      </section>

      {/* Section 8: Taking Action */}
      <section className="mb-20">
        <p className="font-mono text-sm text-[var(--text-muted)]">08</p>
        <h2 className="mt-1 text-xl font-medium text-[var(--accent)]">
          Taking Action
        </h2>
        <p className="mt-3 text-[var(--text-muted)]">
          Understanding flame graphs is half the battle. Now: what do you actually do?
        </p>

        {/* Amdahl's Law */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-[var(--text)]">Prioritize with Amdahl's Law</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            How much does optimizing one function help overall? The math might surprise you.
          </p>
          <div className="mt-4">
            <AmdahlCalculator />
          </div>
        </div>

        {/* Patterns to look for */}
        <div className="mt-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-hover)] text-xs text-[var(--text-muted)]">◎</span>
            <h3 className="text-lg font-medium text-[var(--text)]">Patterns to Look For</h3>
          </div>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            <p>• <strong className="text-[var(--text)]">Flat tops</strong> — High self-time means actual work. Start here.</p>
            <p>• <strong className="text-[var(--text)]">Recursive towers</strong> — Deep, narrow stacks. Consider memoization or iteration.</p>
            <p>• <strong className="text-[var(--text)]">Repeated subtrees</strong> — Same work done multiple times. Cache or dedupe.</p>
            <p>• <strong className="text-[var(--text)]">Wide library calls</strong> — Maybe using the wrong API or missing options (batching, streaming).</p>
          </div>
        </div>

        {/* The Loop */}
        <div className="mt-12 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-5">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]/20 text-xs text-[var(--accent)]">↻</span>
            <h3 className="text-lg font-medium text-[var(--text)]">The Performance Loop</h3>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="rounded-lg bg-[var(--surface)] px-3 py-1.5 text-[var(--text)]">Profile</span>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="rounded-lg bg-[var(--surface)] px-3 py-1.5 text-[var(--text)]">Analyze</span>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="rounded-lg bg-[var(--surface)] px-3 py-1.5 text-[var(--text)]">Hypothesize</span>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="rounded-lg bg-[var(--surface)] px-3 py-1.5 text-[var(--text)]">Change</span>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="rounded-lg bg-[var(--accent)] px-3 py-1.5 font-medium text-[var(--bg)]">Repeat</span>
          </div>
          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            Always profile again after changes. Trust the numbers, not your intuition.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] pt-8 text-sm text-[var(--text-muted)]">
        <p>
          Inspired by{' '}
          <a
            href="https://www.brendangregg.com/flamegraphs.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Brendan Gregg's work
          </a>
        </p>
      </footer>
    </main>
  )
}

export default App
