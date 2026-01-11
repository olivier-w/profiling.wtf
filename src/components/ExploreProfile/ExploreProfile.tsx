import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import type { FlameNode } from '../../lib/flameGraphData'

interface ExploreProfileProps {
  data: FlameNode
}

interface ProcessedNode {
  name: string
  value: number
  selfValue: number
  x: number
  width: number
  depth: number
  id: string
  original: FlameNode
}

function processTree(
  node: FlameNode,
  depth: number,
  x: number,
  totalValue: number,
  path: string = ''
): ProcessedNode[] {
  const result: ProcessedNode[] = []
  const width = (node.value / totalValue) * 100
  const id = `${path}/${node.name}`

  result.push({
    name: node.name,
    value: node.value,
    selfValue: node.selfValue ?? 0,
    x,
    width,
    depth,
    id,
    original: node,
  })

  if (node.children) {
    let childX = x
    const sortedChildren = [...node.children].sort((a, b) =>
      a.name.localeCompare(b.name)
    )

    for (const child of sortedChildren) {
      const childNodes = processTree(child, depth + 1, childX, totalValue, id)
      result.push(...childNodes)
      childX += (child.value / totalValue) * 100
    }
  }

  return result
}

const flameColors = [
  'var(--flame-5)',
  'var(--flame-4)',
  'var(--flame-3)',
  'var(--flame-2)',
  'var(--flame-1)',
]

function Tooltip({
  node,
  totalSamples,
}: {
  node: ProcessedNode
  totalSamples: number
}) {
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

  const tooltipWidth = 200
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
      <p className="font-mono text-[var(--text)] break-all">{node.name}</p>
      <div className="mt-1 space-y-0.5 text-xs text-[var(--text-muted)]">
        <p>
          Total: <span className="tabular-nums">{node.value}</span> samples (
          {((node.value / totalSamples) * 100).toFixed(1)}%)
        </p>
        <p>
          Self: <span className="tabular-nums">{node.selfValue}</span> (
          {((node.selfValue / totalSamples) * 100).toFixed(1)}%)
        </p>
      </div>
    </div>,
    document.body
  )
}

export function ExploreProfile({ data }: ExploreProfileProps) {
  const [hoveredNode, setHoveredNode] = useState<ProcessedNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [zoomStack, setZoomStack] = useState<FlameNode[]>([data])
  const [isIcicle, setIsIcicle] = useState(false)

  const currentRoot = zoomStack[zoomStack.length - 1]
  const totalSamples = data.value
  const zoomedTotal = currentRoot.value

  const nodes = useMemo(() => {
    return processTree(currentRoot, 0, 0, zoomedTotal)
  }, [currentRoot, zoomedTotal])

  const maxDepth = Math.max(...nodes.map((n) => n.depth))
  const frameHeight = 22
  const gap = 1
  const height = (maxDepth + 1) * (frameHeight + gap) + 10
  const width = 600

  // Search filtering
  const matchingNames = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>()
    const query = searchQuery.toLowerCase()
    return new Set(
      nodes.filter((n) => n.name.toLowerCase().includes(query)).map((n) => n.name)
    )
  }, [nodes, searchQuery])

  const searchStats = useMemo(() => {
    if (!searchQuery.trim() || matchingNames.size === 0) return null

    // Find all matching nodes in the FULL tree (not just current zoom)
    const allNodes = processTree(data, 0, 0, data.value)
    const matchingNodes = allNodes.filter((n) => matchingNames.has(n.name))
    const matchingSelfSamples = matchingNodes.reduce(
      (sum, n) => sum + n.selfValue,
      0
    )

    return {
      count: matchingNames.size,
      totalSelf: matchingSelfSamples,
      percentage: ((matchingSelfSamples / totalSamples) * 100).toFixed(1),
    }
  }, [matchingNames, data, totalSamples, searchQuery])

  const handleZoomIn = (node: ProcessedNode) => {
    if (node.original.children && node.original.children.length > 0) {
      setZoomStack([...zoomStack, node.original])
    }
  }

  const handleZoomOut = (index: number) => {
    setZoomStack(zoomStack.slice(0, index + 1))
  }

  const handleReset = () => {
    setZoomStack([data])
  }

  return (
    <div className="space-y-6">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search functions..."
          className="flex-1 min-w-[200px] rounded bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
        />

        {/* Icicle toggle */}
        <button
          onClick={() => setIsIcicle(!isIcicle)}
          className="btn"
        >
          {isIcicle ? 'Icicle' : 'Flame'}
        </button>
      </div>

      {/* Search results */}
      {searchStats && (
        <p className="text-sm text-[var(--text-muted)]">
          Found <span className="text-[var(--text)] tabular-nums">{searchStats.count}</span> function
          {searchStats.count !== 1 ? 's' : ''} matching "{searchQuery}" —{' '}
          <span className="text-[var(--accent)] tabular-nums">{searchStats.percentage}%</span> of total self-time
        </p>
      )}

      {/* Breadcrumb / zoom path */}
      {zoomStack.length > 1 && (
        <div className="flex flex-wrap items-center gap-1 text-sm">
          {zoomStack.map((node, index) => (
            <span key={index} className="flex items-center">
              {index > 0 && <span className="mx-1 text-[var(--text-muted)]">→</span>}
              <button
                onClick={() => handleZoomOut(index)}
                className={cn(
                  'font-mono rounded px-1.5 py-0.5 transition-colors',
                  index === zoomStack.length - 1
                    ? 'bg-[var(--accent)] text-[var(--bg)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                )}
              >
                {node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name}
              </button>
            </span>
          ))}
          <button
            onClick={handleReset}
            className="ml-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Reset
          </button>
        </div>
      )}

      {/* Flame graph */}
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="block">
          {nodes.map((node) => {
            const x = (node.x / 100) * width
            const w = Math.max((node.width / 100) * width - gap, 1)

            // Icicle: top-down (depth 0 at top), Flame: bottom-up (depth 0 at bottom)
            const y = isIcicle
              ? node.depth * (frameHeight + gap) + 5
              : height - (node.depth + 1) * (frameHeight + gap) - 5

            const fill = flameColors[Math.min(node.depth, flameColors.length - 1)]
            const isMatch = matchingNames.has(node.name)
            const opacity = searchQuery && !isMatch ? 0.25 : 1
            const isHovered = hoveredNode?.id === node.id
            const hasChildren = node.original.children && node.original.children.length > 0

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleZoomIn(node)}
                style={{ cursor: hasChildren ? 'pointer' : 'default' }}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={frameHeight}
                  fill={fill}
                  rx={2}
                  opacity={opacity}
                  stroke={isHovered ? 'var(--text)' : isMatch ? 'var(--accent)' : 'transparent'}
                  strokeWidth={isMatch ? 2 : 1}
                />
                {w > 30 && (
                  <text
                    x={x + 4}
                    y={y + frameHeight / 2}
                    dy="0.35em"
                    fill="var(--bg)"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                    opacity={opacity}
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.name.length > w / 6
                      ? node.name.slice(0, Math.floor(w / 6) - 1) + '…'
                      : node.name}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredNode && <Tooltip node={hoveredNode} totalSamples={totalSamples} />}

      {/* Instructions */}
      <p className="text-sm text-[var(--text-muted)]">
        Click a frame to zoom in. Use breadcrumbs to zoom out.
        {!searchQuery && (
          <span className="text-[var(--text)]"> Try searching for "formatLog".</span>
        )}
      </p>

      {/* Discovery callout - shown when user searches for formatLog */}
      {searchQuery.toLowerCase().includes('formatlog') && searchStats && (
        <div className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-xs text-[var(--accent)]">!</span>
            <p className="text-[var(--text)]">
              <strong className="text-[var(--accent)]">Hidden bottleneck found:</strong>{' '}
              <code className="font-mono">formatLog</code> appears in {searchStats.count} places 
              and accounts for {searchStats.percentage}% of runtime. Logging overhead adds up!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
