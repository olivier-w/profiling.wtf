import { useState, useMemo } from 'react'
import { cn } from '../../lib/cn'
import { allocationData, formatBytes, type AllocationNode } from '../../lib/allocationData'

interface ProcessedNode {
  name: string
  bytes: number
  selfBytes: number
  x: number        // 0-100 percentage
  width: number    // 0-100 percentage
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
    // Sort children alphabetically
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

  // Blue color scheme for memory (to distinguish from CPU flame graphs)
  const memoryColors = [
    '#1e40af',  // blue-800
    '#1d4ed8',  // blue-700
    '#2563eb',  // blue-600
    '#3b82f6',  // blue-500
  ]

  return (
    <div className="space-y-4">
      {/* Intro */}
      <p className="text-sm text-[var(--text-muted)]">
        Same visualization, different metric: width shows <span className="text-[var(--info)]">bytes allocated</span>, not CPU time.
      </p>

      {/* Flame graph */}
      <div className="relative overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
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
          <div className="absolute right-4 top-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm shadow-lg">
            <p className="font-mono font-medium text-[var(--text)]">{hoveredNode.name}</p>
            <div className="mt-2 space-y-1 text-[var(--text-muted)]">
              <p>
                Total: <span className="tabular-nums text-[var(--info)]">{formatBytes(hoveredNode.bytes)}</span>
              </p>
              <p>
                Self: <span className="tabular-nums text-[var(--text)]">{formatBytes(hoveredNode.selfBytes)}</span>
              </p>
              <p>
                {((hoveredNode.bytes / totalBytes) * 100).toFixed(1)}% of total allocations
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top allocators */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--text)]">Top allocators:</p>
        <div className="space-y-1.5">
          {nodes
            .filter(n => n.selfBytes > 0)
            .sort((a, b) => b.selfBytes - a.selfBytes)
            .slice(0, 4)
            .map((node, i) => (
              <div
                key={node.name}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-2.5 text-sm',
                  i === 0 
                    ? 'border-[var(--info)]/30 bg-[var(--info)]/10' 
                    : 'border-[var(--border)] bg-[var(--surface)]'
                )}
              >
                <span className="font-mono text-[var(--text)]">{node.name}</span>
                <span className="tabular-nums text-[var(--info)]">{formatBytes(node.selfBytes)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Key insight */}
      <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">✓</span>
          <p className="text-[var(--text)]">
            <strong className="text-green-400">The insight:</strong> <code className="rounded bg-[var(--info)]/20 px-1 text-[var(--info)]">resizeImage</code> allocates 40% of all memory. 
            If you're hitting memory limits, that's where to look—even if it's not slow.
          </p>
        </div>
      </div>
    </div>
  )
}
