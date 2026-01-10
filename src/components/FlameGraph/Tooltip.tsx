import type { ProcessedNode } from '../../hooks/useFlameGraph'

interface TooltipProps {
  node: ProcessedNode
  totalSamples: number
  x: number
  y: number
}

export function Tooltip({ node, totalSamples, x, y }: TooltipProps) {
  const { data } = node
  const selfValue = data.selfValue ?? 0
  const totalValue = data.value
  
  const selfPercent = ((selfValue / totalSamples) * 100).toFixed(1)
  const totalPercent = ((totalValue / totalSamples) * 100).toFixed(1)

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-lg"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%) translateY(-8px)',
      }}
      role="tooltip"
    >
      <p className="mb-1 font-mono text-sm font-medium text-[var(--text)]">
        {data.name}
      </p>
      <div className="space-y-0.5 text-xs">
        <p className="text-[var(--text-muted)]">
          <span className="tabular-nums">{totalValue}</span> samples ({totalPercent}% total)
        </p>
        <p className="text-[var(--text-muted)]">
          <span className="tabular-nums">{selfValue}</span> self ({selfPercent}% self)
        </p>
      </div>
    </div>
  )
}
