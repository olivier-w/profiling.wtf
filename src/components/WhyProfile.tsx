export function WhyProfile() {
  return (
    <div className="space-y-6">
      {/* Hook */}
      <p className="text-lg text-[var(--text)]">
        Developers guess where performance problems are.{' '}
        <span className="text-[var(--accent)]">Studies show they're wrong 90% of the time.</span>
      </p>

      {/* Knight Capital Story */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide">
          August 1, 2012
        </p>
        <p className="mt-3 text-[var(--text)]">
          Knight Capital deployed new trading software. Within 45 minutes, a performance bug caused 
          the system to execute 4 million trades—buying high and selling low.
        </p>
        <p className="mt-3 text-2xl font-medium tabular-nums text-[var(--accent)]">
          $440,000,000 lost
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          The company was bankrupt within a week.
        </p>
      </div>

      {/* Contrast */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-400">
            ✗ Premature optimization
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            "I think this function is slow, let me rewrite it." Hours spent optimizing code that 
            runs once at startup.
          </p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm font-medium text-green-400">
            ✓ Informed optimization
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            "The profiler shows this function is 40% of runtime. Let me focus here." 
            Minutes spent where it matters.
          </p>
        </div>
      </div>

      {/* Scientific method */}
      <p className="text-[var(--text-muted)]">
        Profiling is the scientific method for performance:{' '}
        <span className="text-[var(--text)]">measure, don't guess.</span>{' '}
        The flame graph is your microscope.
      </p>
    </div>
  )
}
