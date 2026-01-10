import { cn } from '../../lib/cn'

interface SearchProps {
  value: string
  onChange: (value: string) => void
  stats: { count: number; percentage: string } | null
  className?: string
}

export function Search({ value, onChange, stats, className }: SearchProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative flex-1">
        <svg
          width="16"
          height="16"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search functions..."
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-10 pr-3 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label="Search functions in flame graph"
        />
      </div>
      {stats && (
        <p className="text-sm tabular-nums text-[var(--text-muted)]">
          {stats.count} match{stats.count !== 1 ? 'es' : ''} ({stats.percentage}% self)
        </p>
      )}
    </div>
  )
}
