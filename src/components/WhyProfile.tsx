export function WhyProfile() {
  return (
    <div className="space-y-12">

      {/* Scientific method */}
      <p className="text-lg text-[var(--text-muted)]">
        Profiling is the scientific method for performance:{' '}
        <em className="text-[var(--text)] not-italic">measure, don't guess.</em>{' '}
        The flame graph is your microscope.
      </p>

      {/* Contrast */}
      <div className="grid gap-10 sm:grid-cols-2">
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
    </div>
  )
}
