import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  id: string
}

function processDiffTree(
  node: DiffNode,
  depth: number,
  x: number,
  totalValue: number,
  mode: ViewMode,
  path: string = ''
): ProcessedDiffNode[] {
  const result: ProcessedDiffNode[] = []
  const value = mode === 'before' ? node.before : node.after
  const width = (value / totalValue) * 100
  const id = `${path}/${node.name}`
  
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
    id,
  })

  if (node.children) {
    let childX = x
    const sortedChildren = [...node.children].sort((a, b) => a.name.localeCompare(b.name))
    
    for (const child of sortedChildren) {
      const childValue = mode === 'before' ? child.before : child.after
      if (childValue > 0) {
        const childNodes = processDiffTree(child, depth + 1, childX, totalValue, mode, id)
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

// Tooltip rendered via portal to document.body
function Tooltip({ node, viewMode }: { node: ProcessedDiffNode; viewMode: ViewMode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handler = (e: MouseEvent) => {
      setPos({ x: e.pageX, y: e.pageY })
    }
    
    document.addEventListener('mousemove', handler)
    return () => document.removeEventListener('mousemove', handler)
  }, [])

  if (!mounted) return null

  const tooltipWidth = 160
  const tooltipHeight = 90
  const offset = 0

  let left = pos.x + offset
  let top = pos.y + offset

  if (left + tooltipWidth > window.innerWidth - 10) {
    left = pos.x - tooltipWidth - offset
  }
  if (top + tooltipHeight > window.innerHeight - 10) {
    top = pos.y - tooltipHeight - offset
  }
  if (left < 10) left = 10
  if (top < 10) top = 10

  return createPortal(
    <div
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="rounded bg-[var(--surface)] px-3 py-2 text-sm shadow-lg border border-[var(--surface-bright)]"
    >
      <p className="font-mono text-[var(--text)]">{node.name}</p>
      <div className="mt-1 space-y-0.5 text-xs text-[var(--text-muted)]">
        <p>Before: <span className="tabular-nums text-[var(--text)]">{node.before}</span> → After: <span className="tabular-nums text-[var(--text)]">{node.after}</span></p>
        {viewMode === 'diff' && (
          <p className={cn(
            node.delta < 0 ? 'text-emerald-400' : node.delta > 0 ? 'text-red-400' : ''
          )}>
            {node.delta > 0 ? '+' : ''}{node.delta}%
            {node.delta < 0 ? ' faster' : node.delta > 0 ? ' slower' : ''}
          </p>
        )}
      </div>
    </div>,
    document.body
  )
}

export function DiffFlameGraph() {
  const [viewMode, setViewMode] = useState<ViewMode>('before')
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
      <div className="flex flex-wrap gap-2 text-sm">
        {(['before', 'after', 'diff'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn('btn', viewMode === mode && 'btn-active')}
          >
            {mode === 'diff' ? 'Differential' : mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Flame graph */}
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="block">
          {nodes.map((node) => {
            const x = (node.x / 100) * width
            const w = Math.max((node.width / 100) * width - gap, 1)
            const y = node.depth * (frameHeight + gap)
            const isHovered = hoveredNode?.id === node.id
            
            let fill: string
            if (viewMode === 'diff') {
              fill = getDiffColor(node.delta, viewMode)
            } else {
              fill = flameColors[node.depth % flameColors.length]
            }

            if (node.width === 0) return null

            return (
              <g 
                key={node.id}
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
                  opacity={isHovered ? 0.8 : 1}
                  stroke={isHovered ? 'var(--text)' : 'transparent'}
                  strokeWidth={1}
                />
                {w > 50 && (
                  <text
                    x={x + 6}
                    y={y + 18}
                    fill={viewMode === 'diff' && node.delta > 20 ? '#fff' : 'var(--bg)'}
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    style={{ pointerEvents: 'none' }}
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
      </div>

      {/* Tooltip via portal */}
      {hoveredNode && <Tooltip node={hoveredNode} viewMode={viewMode} />}

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
