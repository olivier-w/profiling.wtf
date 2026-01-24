import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { allocationData, formatBytes, type AllocationNode } from '../../lib/allocationData'

interface ProcessedNode {
  name: string
  bytes: number
  selfBytes: number
  x: number
  width: number
  depth: number
  id: string
}

function processTree(
  node: AllocationNode,
  depth: number,
  x: number,
  totalBytes: number,
  path: string = ''
): ProcessedNode[] {
  const result: ProcessedNode[] = []
  const width = (node.bytes / totalBytes) * 100
  const id = `${path}/${node.name}`
  
  result.push({
    name: node.name,
    bytes: node.bytes,
    selfBytes: node.selfBytes ?? 0,
    x,
    width,
    depth,
    id,
  })

  if (node.children) {
    let childX = x
    const sortedChildren = [...node.children].sort((a, b) => a.name.localeCompare(b.name))
    
    for (const child of sortedChildren) {
      const childNodes = processTree(child, depth + 1, childX, totalBytes, id)
      result.push(...childNodes)
      childX += (child.bytes / totalBytes) * 100
    }
  }

  return result
}

// Tooltip rendered via portal to document.body
function Tooltip({ node, totalBytes }: { node: ProcessedNode; totalBytes: number }) {
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

  const tooltipWidth = 180
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
        zIndex: 'var(--z-tooltip)',
        pointerEvents: 'none',
      }}
      className="rounded bg-[var(--surface)] px-3 py-2 text-sm shadow-lg border border-[var(--text-muted)]/20"
      role="tooltip"
    >
      <p className="font-mono text-[var(--text)]">{node.name}</p>
      <div className="mt-1 space-y-0.5 text-xs text-[var(--text-muted)]">
        <p>Total: <span className="tabular-nums text-blue-400">{formatBytes(node.bytes)}</span> ({((node.bytes / totalBytes) * 100).toFixed(1)}%)</p>
        <p>Self: <span className="tabular-nums text-[var(--text)]">{formatBytes(node.selfBytes)}</span></p>
      </div>
    </div>,
    document.body
  )
}

export function AllocationFlameGraph() {
  const [hoveredNode, setHoveredNode] = useState<ProcessedNode | null>(null)

  const totalBytes = allocationData.bytes

  const nodes = useMemo(() => {
    return processTree(allocationData, 0, 0, totalBytes)
  }, [totalBytes])

  const maxDepth = Math.max(...nodes.map(n => n.depth))
  const frameHeight = 28
  const gap = 2
  const height = (maxDepth + 1) * (frameHeight + gap) + 10
  const width = 500

  // Blue color scheme for memory
  const memoryColors = [
    '#1e40af',
    '#1d4ed8',
    '#2563eb',
    '#3b82f6',
  ]

  return (
    <div className="space-y-6">
      {/* Intro */}
      <p className="text-[var(--text-muted)]">
        Same visualization, different metric: width shows <span className="text-blue-400">bytes allocated</span>, not CPU time.
      </p>

      {/* Flame graph */}
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="block">
          {nodes.map((node) => {
            const x = (node.x / 100) * width
            const w = Math.max((node.width / 100) * width - gap, 1)
            const y = node.depth * (frameHeight + gap)
            const fill = memoryColors[node.depth % memoryColors.length]
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
                  rx={3}
                  opacity={isHovered ? 0.8 : 1}
                  stroke={isHovered ? 'var(--text)' : 'transparent'}
                  strokeWidth={1}
                />
                {w > 60 && (
                  <text
                    x={x + 6}
                    y={y + 18}
                    fill="#fff"
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
      {hoveredNode && <Tooltip node={hoveredNode} totalBytes={totalBytes} />}

      {/* Top allocators */}
      <div className="space-y-2 text-sm">
        <p className="text-[var(--text)]">Top allocators:</p>
        <div className="space-y-1 font-mono">
          {nodes
            .filter(n => n.selfBytes > 0)
            .sort((a, b) => b.selfBytes - a.selfBytes)
            .slice(0, 4)
            .map((node, i) => (
              <p key={node.id} className={i === 0 ? 'text-blue-400' : 'text-[var(--text-muted)]'}>
                {node.name}: {formatBytes(node.selfBytes)}
              </p>
            ))}
        </div>
      </div>

      {/* Key insight */}
      <p className="text-[var(--text-muted)]">
        <span className="font-mono text-blue-400">resizeImage</span> allocates 40% of all memory. 
        If you're hitting memory limits, that's where to look—even if it's not slow.
      </p>
    </div>
  )
}
