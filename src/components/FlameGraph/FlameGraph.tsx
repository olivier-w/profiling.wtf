import { useState, useRef, useCallback } from 'react'
import { cn } from '../../lib/cn'
import { useFlameGraph, type ProcessedNode } from '../../hooks/useFlameGraph'
import type { FlameNode as FlameNodeType } from '../../lib/flameGraphData'
import { FlameNode } from './FlameNode'
import { Tooltip } from './Tooltip'
import { Search } from './Search'

interface FlameGraphProps {
  data: FlameNodeType
  className?: string
}

export function FlameGraph({ data, className }: FlameGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  
  const {
    processedNodes,
    zoomNode,
    hoveredNode,
    searchQuery,
    searchStats,
    matchingNodeIds,
    isIcicle,
    totalSamples,
    handleZoom,
    handleResetZoom,
    handleHover,
    handleSearch,
    toggleLayout,
  } = useFlameGraph(data)

  const width = 800
  const frameHeight = 24
  const gap = 1
  const maxDepth = Math.max(...processedNodes.map(n => n.depth))
  const height = (maxDepth + 1) * (frameHeight + gap) + 10

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX,
        y: rect.top,
      })
    }
  }, [])

  const handleNodeClick = useCallback((node: ProcessedNode) => {
    handleZoom(node)
  }, [handleZoom])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <Search
          value={searchQuery}
          onChange={handleSearch}
          stats={searchStats}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLayout}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label={`Switch to ${isIcicle ? 'flame' : 'icicle'} layout`}
          >
            {isIcicle ? 'Icicle' : 'Flame'}
          </button>
          {zoomNode && (
            <button
              onClick={handleResetZoom}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              aria-label="Reset zoom"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Flame graph */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4"
        onMouseMove={handleMouseMove}
      >
        <svg
          width={width}
          height={height}
          className="block"
          role="img"
          aria-label="Interactive flame graph visualization"
        >
          {processedNodes.map(node => (
            <FlameNode
              key={node.id}
              node={node}
              maxDepth={maxDepth}
              width={width}
              height={height}
              isHovered={hoveredNode?.id === node.id}
              isSearchMatch={matchingNodeIds.has(node.id)}
              hasSearchQuery={searchQuery.length > 0}
              isIcicle={isIcicle}
              onHover={handleHover}
              onClick={handleNodeClick}
              onDoubleClick={handleResetZoom}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredNode && (
          <Tooltip
            node={hoveredNode}
            totalSamples={totalSamples}
            x={tooltipPos.x}
            y={tooltipPos.y}
          />
        )}
      </div>

      {/* Instructions */}
      <p className="text-xs text-[var(--text-muted)]">
        <strong>Hover</strong> for details • <strong>Click</strong> to zoom • <strong>Double-click</strong> to reset • <strong>Search</strong> to highlight
      </p>

      {/* Annotations for learning */}
      {!zoomNode && !searchQuery && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="cursor-default rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-hover)] text-xs text-[var(--text-muted)]">—</span>
              <p className="font-mono font-medium text-[var(--text)]">handleRequest</p>
            </div>
            <p className="mt-2 pl-7 text-[var(--text-muted)]">
              Total: 100% | Self: 0% — just a dispatcher, not the bottleneck
            </p>
          </div>
          <div className="cursor-default rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">★</span>
              <p className="font-mono font-medium text-green-400">parseJSON</p>
            </div>
            <p className="mt-2 pl-7 text-[var(--text-muted)]">
              Total: 50% | Self: 50% — actual work happens here
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
