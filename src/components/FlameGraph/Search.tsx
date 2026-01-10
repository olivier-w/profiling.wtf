import { cn } from '../../lib/cn'

interface SearchProps {
  value: string
  onChange: (value: string) => void
  stats: { count: number; percentage: string } | null
  className?: string
}

export function Search({ value, onChange, stats, className }: SearchProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search functions..."
        className="w-full rounded bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
        aria-label="Search functions in flame graph"
      />
      {stats && (
        <p className="shrink-0 text-sm tabular-nums text-[var(--text-muted)]">
          {stats.count} match{stats.count !== 1 ? 'es' : ''} ({stats.percentage}%)
        </p>
      )}
    </div>
  )
}
