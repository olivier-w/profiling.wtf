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
    <div className={cn('space-y-6', className)}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <Search
          value={searchQuery}
          onChange={handleSearch}
          stats={searchStats}
          className="flex-1"
        />
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={toggleLayout}
            className="text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text)]"
            aria-label={`Switch to ${isIcicle ? 'flame' : 'icicle'} layout`}
          >
            {isIcicle ? 'Icicle' : 'Flame'}
          </button>
          {zoomNode && (
            <button
              onClick={handleResetZoom}
              className="text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text)]"
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
        className="relative overflow-x-auto"
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
      <p className="text-sm text-[var(--text-muted)]">
        Hover for details. Click to zoom. Double-click to reset.
      </p>

      {/* Annotations for learning */}
      {!zoomNode && !searchQuery && (
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
