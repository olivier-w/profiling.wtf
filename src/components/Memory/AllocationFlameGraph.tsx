import { useState, useMemo } from 'react'
import { allocationData, formatBytes, type AllocationNode } from '../../lib/allocationData'

interface ProcessedNode {
  name: string
  bytes: number
  selfBytes: number
  x: number
  width: number
  depth: number
}

function processTree(
  node: AllocationNode,
  depth: number,
  x: number,
  totalBytes: number
): ProcessedNode[] {
  const result: ProcessedNode[] = []
  const width = (node.bytes / totalBytes) * 100
  
  result.push({
    name: node.name,
    bytes: node.bytes,
    selfBytes: node.selfBytes ?? 0,
    x,
    width,
    depth,
  })

  if (node.children) {
    let childX = x
    const sortedChildren = [...node.children].sort((a, b) => a.name.localeCompare(b.name))
    
    for (const child of sortedChildren) {
      const childNodes = processTree(child, depth + 1, childX, totalBytes)
      result.push(...childNodes)
      childX += (child.bytes / totalBytes) * 100
    }
  }

  return result
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
      <div className="relative overflow-x-auto">
        <svg width={width} height={height} className="block">
          {nodes.map((node, i) => {
            const x = (node.x / 100) * width
            const w = Math.max((node.width / 100) * width - gap, 1)
            const y = node.depth * (frameHeight + gap)
            const fill = memoryColors[node.depth % memoryColors.length]

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
                {w > 60 && (
                  <text
                    x={x + 6}
                    y={y + 18}
                    fill="#fff"
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
              <p>Total: <span className="tabular-nums text-blue-400">{formatBytes(hoveredNode.bytes)}</span></p>
              <p>Self: <span className="tabular-nums text-[var(--text)]">{formatBytes(hoveredNode.selfBytes)}</span></p>
              <p>{((hoveredNode.bytes / totalBytes) * 100).toFixed(1)}% of total</p>
            </div>
          </div>
        )}
      </div>

      {/* Top allocators */}
      <div className="space-y-2 text-sm">
        <p className="text-[var(--text)]">Top allocators:</p>
        <div className="space-y-1 font-mono">
          {nodes
            .filter(n => n.selfBytes > 0)
            .sort((a, b) => b.selfBytes - a.selfBytes)
            .slice(0, 4)
            .map((node, i) => (
              <p key={node.name} className={i === 0 ? 'text-blue-400' : 'text-[var(--text-muted)]'}>
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
