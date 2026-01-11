import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import type { FlameNode } from '../../lib/flameGraphData'

interface FlameGraphProps {
  data: FlameNode
  className?: string
}

interface ProcessedNode {
  name: string
  value: number
  selfValue: number
  x: number
  width: number
  depth: number
  id: string
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
  })

  if (node.children) {
    let childX = x
    const sortedChildren = [...node.children].sort((a, b) => a.name.localeCompare(b.name))
    
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

// Tooltip rendered via portal to document.body
function Tooltip({ node, totalSamples }: { node: ProcessedNode; totalSamples: number }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handler = (e: MouseEvent) => {
      setPos({ x: e.pageX, y: e.pageY })
    }
    
    // Get initial position
    handler({ pageX: 0, pageY: 0 } as MouseEvent)
    
    document.addEventListener('mousemove', handler)
    return () => document.removeEventListener('mousemove', handler)
  }, [])

  if (!mounted) return null

  const tooltipWidth = 180
  const tooltipHeight = 90
  const offset = 16

  let left = pos.x + offset
  let top = pos.y + offset

  // Keep within viewport
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
        <p>
          <span className="tabular-nums">{node.value}</span> samples ({((node.value / totalSamples) * 100).toFixed(1)}%)
        </p>
        <p>
          <span className="tabular-nums">{node.selfValue}</span> self ({((node.selfValue / totalSamples) * 100).toFixed(1)}%)
        </p>
      </div>
    </div>,
    document.body
  )
}

export function FlameGraph({ data, className }: FlameGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<ProcessedNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const totalSamples = data.value

  const nodes = useMemo(() => {
    return processTree(data, 0, 0, totalSamples)
  }, [data, totalSamples])

  const maxDepth = Math.max(...nodes.map(n => n.depth))
  const frameHeight = 24
  const gap = 1
  const height = (maxDepth + 1) * (frameHeight + gap) + 10
  const width = 600

  // Search filtering
  const matchingNames = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>()
    const query = searchQuery.toLowerCase()
    return new Set(nodes.filter(n => n.name.toLowerCase().includes(query)).map(n => n.name))
  }, [nodes, searchQuery])

  const searchStats = useMemo(() => {
    if (!searchQuery.trim() || matchingNames.size === 0) return null
    const matchingNodes = nodes.filter(n => matchingNames.has(n.name))
    const matchingSelfSamples = matchingNodes.reduce((sum, n) => sum + n.selfValue, 0)
    return {
      count: matchingNames.size,
      percentage: ((matchingSelfSamples / totalSamples) * 100).toFixed(1),
    }
  }, [matchingNames, nodes, totalSamples, searchQuery])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search functions..."
          className="flex-1 rounded bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
        />
        {searchStats && (
          <p className="shrink-0 text-sm tabular-nums text-[var(--text-muted)]">
            {searchStats.count} match{searchStats.count !== 1 ? 'es' : ''} ({searchStats.percentage}%)
          </p>
        )}
      </div>

      {/* Flame graph */}
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="block">
          {nodes.map((node) => {
            const x = (node.x / 100) * width
            const w = Math.max((node.width / 100) * width - gap, 1)
            const y = height - (node.depth + 1) * (frameHeight + gap) - 5
            const fill = flameColors[Math.min(node.depth, flameColors.length - 1)]
            const isMatch = matchingNames.has(node.name)
            const opacity = searchQuery && !isMatch ? 0.3 : 1
            const isHovered = hoveredNode?.id === node.id

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
                  rx={2}
                  opacity={opacity}
                  stroke={isHovered ? 'var(--text)' : 'transparent'}
                  strokeWidth={1}
                />
                {w > 35 && (
                  <text
                    x={x + 4}
                    y={y + frameHeight / 2}
                    dy="0.35em"
                    fill="var(--bg)"
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    opacity={opacity}
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
      {hoveredNode && <Tooltip node={hoveredNode} totalSamples={totalSamples} />}

      {/* Instructions */}
      <p className="text-sm text-[var(--text-muted)]">
        Hover for details.
      </p>

      {/* Annotations for learning */}
      {!searchQuery && (
        <div className="grid gap-6 sm:grid-cols-2 text-sm">
          <div>
            <p className="font-mono text-[var(--text)]">handleRequest</p>
            <p className="mt-1 text-[var(--text-muted)]">
              Total: 100% | Self: 0% — just a dispatcher, not the bottleneck
            </p>
          </div>
          <div>
            <p className="font-mono text-[var(--accent)]">parseJSON</p>
            <p className="mt-1 text-[var(--text-muted)]">
              Total: 50% | Self: 50% — actual work happens here
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
