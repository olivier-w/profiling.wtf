import { useState, useMemo } from 'react'
import { cn } from '../../lib/cn'
import { diffData, type DiffNode } from '../../lib/diffFlameData'

type ViewMode = 'before' | 'after' | 'diff'

interface ProcessedDiffNode {
  name: string
  before: number
  after: number
  delta: number
  x: number
  width: number
  depth: number
}

function processDiffTree(
  node: DiffNode,
  depth: number,
  x: number,
  totalValue: number,
  mode: ViewMode
): ProcessedDiffNode[] {
  const result: ProcessedDiffNode[] = []
  const value = mode === 'before' ? node.before : node.after
  const width = (value / totalValue) * 100
  
  const delta = node.before === 0 
    ? 100
    : Math.round(((node.after - node.before) / node.before) * 100)

  result.push({
    name: node.name,
    before: node.before,
    after: node.after,
    delta,
    x,
    width,
    depth,
  })

  if (node.children) {
    let childX = x
    const sortedChildren = [...node.children].sort((a, b) => a.name.localeCompare(b.name))
    
    for (const child of sortedChildren) {
      const childValue = mode === 'before' ? child.before : child.after
      if (childValue > 0) {
        const childNodes = processDiffTree(child, depth + 1, childX, totalValue, mode)
        result.push(...childNodes)
        childX += (childValue / totalValue) * 100
      }
    }
  }

  return result
}

function getDiffColor(delta: number, mode: ViewMode): string {
  if (mode !== 'diff') return ''
  
  if (delta < -20) return '#22c55e'
  if (delta < 0) return '#4ade80'
  if (delta === 0) return 'var(--flame-2)'
  if (delta <= 20) return '#fbbf24'
  return '#ef4444'
}

export function DiffFlameGraph() {
  const [viewMode, setViewMode] = useState<ViewMode>('diff')
  const [hoveredNode, setHoveredNode] = useState<ProcessedDiffNode | null>(null)

  const totalBefore = diffData.before
  const totalAfter = diffData.after

  const nodes = useMemo(() => {
    const total = viewMode === 'before' ? totalBefore : totalAfter
    return processDiffTree(diffData, 0, 0, total, viewMode)
  }, [viewMode, totalBefore, totalAfter])

  const maxDepth = Math.max(...nodes.map(n => n.depth))
  const frameHeight = 28
  const gap = 2
  const height = (maxDepth + 1) * (frameHeight + gap) + 10
  const width = 500

  const flameColors = [
    'var(--flame-4)',
    'var(--flame-3)',
    'var(--flame-2)',
    'var(--flame-1)',
  ]

  return (
    <div className="space-y-6">
      {/* Story */}
      <p className="text-[var(--text-muted)]">
        We added caching to <code className="font-mono text-[var(--accent)]">parseJSON</code>. Let's see what changed.
      </p>

      {/* View mode toggle */}
      <div className="flex gap-4 text-sm">
        {(['before', 'after', 'diff'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              'capitalize transition-colors',
              viewMode === mode
                ? 'text-[var(--text)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            {mode === 'diff' ? 'Differential' : mode}
            {viewMode === mode && <span className="ml-1 text-[var(--accent)]">*</span>}
          </button>
        ))}
      </div>

      {/* Flame graph */}
      <div className="relative overflow-x-auto">
        <svg width={width} height={height} className="block">
          {nodes.map((node, i) => {
            const x = (node.x / 100) * width
            const w = Math.max((node.width / 100) * width - gap, 1)
            const y = node.depth * (frameHeight + gap)
            
            let fill: string
            if (viewMode === 'diff') {
              fill = getDiffColor(node.delta, viewMode)
            } else {
              fill = flameColors[node.depth % flameColors.length]
            }

            if (node.width === 0) return null

            return (
              <g 
                key={`${node.name}-${i}`}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={frameHeight}
                  fill={fill}
                  rx={3}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                />
                {w > 50 && (
                  <text
                    x={x + 6}
                    y={y + 18}
                    fill={viewMode === 'diff' && node.delta > 20 ? '#fff' : 'var(--bg)'}
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    className="pointer-events-none"
                  >
                    {node.name.length > w / 7 
                      ? node.name.slice(0, Math.floor(w / 7) - 1) + '…' 
                      : node.name}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Tooltip */}
        {hoveredNode && (
          <div className="absolute right-0 top-0 rounded bg-[var(--surface)] p-3 text-sm shadow-lg">
            <p className="font-mono text-[var(--text)]">{hoveredNode.name}</p>
            <div className="mt-2 space-y-1 text-[var(--text-muted)]">
              <p>Before: <span className="tabular-nums text-[var(--text)]">{hoveredNode.before}</span></p>
              <p>After: <span className="tabular-nums text-[var(--text)]">{hoveredNode.after}</span></p>
              <p className={cn(
                hoveredNode.delta < 0 ? 'text-emerald-400' : hoveredNode.delta > 0 ? 'text-red-400' : ''
              )}>
                {hoveredNode.delta > 0 ? '+' : ''}{hoveredNode.delta}%
                {hoveredNode.delta < 0 ? ' faster' : hoveredNode.delta > 0 ? ' slower' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend for diff view */}
      {viewMode === 'diff' && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <span>Faster</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[var(--flame-2)]" />
            <span>No change</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span>Slower</span>
          </div>
        </div>
      )}

      {/* Results summary */}
      <p className="font-mono text-sm text-[var(--text-muted)]">
        Before: {totalBefore} samples | After: {totalAfter} samples | 
        <span className="text-emerald-400"> -{Math.round(((totalBefore - totalAfter) / totalBefore) * 100)}% overall</span>
      </p>

      {/* Key insight */}
      <p className="text-[var(--text-muted)]">
        <span className="font-mono text-emerald-400">parseJSON</span> dropped 75% (caching works!), 
        but we added <span className="font-mono text-red-400">checkCache</span> overhead. Net result: 25% win.
      </p>
    </div>
  )
}
