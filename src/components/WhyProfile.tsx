export function WhyProfile() {
  return (
    <div className="space-y-8">
      {/* Hook */}
      <p className="text-lg text-[var(--text)]">
        Developers guess where performance problems are.{' '}
        <span className="text-[var(--accent)]">Studies show they're wrong 90% of the time.</span>
      </p>

      {/* Knight Capital Story */}
      <div>
        <p className="text-sm uppercase tracking-wide text-[var(--text-muted)]">
          August 1, 2012
        </p>
        <p className="mt-3 text-[var(--text-muted)]">
          Knight Capital deployed new trading software. Within 45 minutes, a performance bug caused 
          the system to execute 4 million trades—buying high and selling low.
        </p>
        <p className="mt-4 text-3xl tabular-nums text-[var(--accent)]" style={{ fontFamily: 'var(--font-display)' }}>
          $440,000,000 lost
        </p>
        <p className="mt-2 text-[var(--text-muted)]">
          The company was bankrupt within a week.
        </p>
      </div>

      {/* Contrast */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-[var(--text-muted)]">
            <span className="text-[var(--text)]">Premature optimization</span> — "I think this function is slow, let me rewrite it." Hours spent optimizing code that 
            runs once at startup.
          </p>
        </div>
        <div>
          <p className="text-[var(--text-muted)]">
            <span className="text-[var(--text)]">Informed optimization</span> — "The profiler shows this function is 40% of runtime. Let me focus here." 
            Minutes spent where it matters.
          </p>
        </div>
      </div>

      {/* Scientific method */}
      <p className="text-[var(--text-muted)]">
        Profiling is the scientific method for performance:{' '}
        <em className="text-[var(--text)] not-italic">measure, don't guess.</em>{' '}
        The flame graph is your microscope.
      </p>
    </div>
  )
}
