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
      className="pointer-events-none fixed z-50 rounded bg-[var(--surface)] px-3 py-2 shadow-lg"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%) translateY(-8px)',
      }}
      role="tooltip"
    >
      <p className="mb-1 font-mono text-sm text-[var(--text)]">
        {data.name}
      </p>
      <div className="space-y-0.5 text-xs text-[var(--text-muted)]">
        <p>
          <span className="tabular-nums">{totalValue}</span> samples ({totalPercent}%)
        </p>
        <p>
          <span className="tabular-nums">{selfValue}</span> self ({selfPercent}%)
        </p>
      </div>
    </div>
  )
}
