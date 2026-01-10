import { useState, useMemo } from 'react'
import { cn } from '../../lib/cn'
import { diffData, type DiffNode } from '../../lib/diffFlameData'

type ViewMode = 'before' | 'after' | 'diff'

interface ProcessedDiffNode {
  name: string
  before: number
  after: number
  delta: number      // percentage change: -75 means 75% faster
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
    ? 100  // New function (regression)
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
    // Sort children alphabetically for consistent positioning
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
  if (mode !== 'diff') {
    // Normal flame colors by depth will be applied in the component
    return ''
  }
  
  if (delta < -20) return '#22c55e'      // Strong improvement (green)
  if (delta < 0) return '#4ade80'        // Mild improvement (light green)
  if (delta === 0) return 'var(--flame-2)'  // No change
  if (delta <= 20) return '#fbbf24'      // Mild regression (yellow)
  return '#ef4444'                        // Strong regression (red)
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
    <div className="space-y-4">
      {/* Story context */}
      <div className="cursor-default rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
        <p className="text-[var(--text)]">
          <strong>The story:</strong> We added caching to <code className="rounded bg-[var(--accent)]/20 px-1 text-[var(--accent)]">parseJSON</code>. 
          Let's see what changed.
        </p>
      </div>

      {/* View mode toggle */}
      <div className="flex gap-2">
        {(['before', 'after', 'diff'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors capitalize',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
              viewMode === mode
                ? 'bg-[var(--accent)] text-[var(--bg)]'
                : 'bg-[var(--surface-hover)] text-[var(--text)] hover:bg-[var(--border)]'
            )}
          >
            {mode === 'diff' ? 'Differential' : mode}
          </button>
        ))}
      </div>

      {/* Flame graph */}
      <div className="relative overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
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

            // Skip nodes with 0 width in before/after views
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
          <div className="absolute right-4 top-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm shadow-lg">
            <p className="font-mono font-medium text-[var(--text)]">{hoveredNode.name}</p>
            <div className="mt-2 space-y-1 text-[var(--text-muted)]">
              <p>Before: <span className="tabular-nums text-[var(--text)]">{hoveredNode.before}</span> samples</p>
              <p>After: <span className="tabular-nums text-[var(--text)]">{hoveredNode.after}</span> samples</p>
              <p className={cn(
                'font-medium',
                hoveredNode.delta < 0 ? 'text-green-400' : hoveredNode.delta > 0 ? 'text-red-400' : 'text-[var(--text-muted)]'
              )}>
                {hoveredNode.delta > 0 ? '+' : ''}{hoveredNode.delta}%
                {hoveredNode.delta < 0 ? ' faster' : hoveredNode.delta > 0 ? ' slower' : ' (no change)'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend for diff view */}
      {viewMode === 'diff' && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-[#22c55e]" />
            <span className="text-[var(--text-muted)]">Faster</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-[var(--flame-2)]" />
            <span className="text-[var(--text-muted)]">No change</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-[#ef4444]" />
            <span className="text-[var(--text-muted)]">Slower</span>
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="cursor-default rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
          <p className="text-2xl font-medium tabular-nums text-[var(--text)]">{totalBefore}</p>
          <p className="text-sm text-[var(--text-muted)]">Before (samples)</p>
        </div>
        <div className="cursor-default rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
          <p className="text-2xl font-medium tabular-nums text-[var(--text)]">{totalAfter}</p>
          <p className="text-sm text-[var(--text-muted)]">After (samples)</p>
        </div>
        <div className="cursor-default rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-center">
          <p className="text-2xl font-medium tabular-nums text-green-400">
            -{Math.round(((totalBefore - totalAfter) / totalBefore) * 100)}%
          </p>
          <p className="text-sm text-[var(--text-muted)]">Overall improvement</p>
        </div>
      </div>

      {/* Key insight */}
      <div className="cursor-default rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">✓</span>
          <p className="text-[var(--text)]">
            <strong className="text-green-400">Notice:</strong> <code className="rounded bg-green-500/20 px-1 text-green-400">parseJSON</code> dropped 75% (caching works!), 
            but we added <code className="rounded bg-red-500/20 px-1 text-red-400">checkCache</code> overhead. The net result is still a 25% win.
          </p>
        </div>
      </div>
    </div>
  )
}
