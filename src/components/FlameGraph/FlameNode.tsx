import type { ProcessedNode } from '../../hooks/useFlameGraph'

// Warm color palette for flame graph frames
const flameColors = [
  'var(--flame-5)', // red - deepest
  'var(--flame-4)', // orange-dark
  'var(--flame-3)', // orange
  'var(--flame-2)', // amber
  'var(--flame-1)', // yellow - shallowest / top
]

function getFlameColor(depth: number, maxDepth: number): string {
  // Deeper = warmer (red), shallower = cooler (yellow)
  const normalizedDepth = Math.min(depth / Math.max(maxDepth, 1), 1)
  const index = Math.floor(normalizedDepth * (flameColors.length - 1))
  return flameColors[index]
}

interface FlameNodeProps {
  node: ProcessedNode
  maxDepth: number
  width: number
  height: number
  isHovered: boolean
  isSearchMatch: boolean
  hasSearchQuery: boolean
  isIcicle: boolean
  onHover: (node: ProcessedNode | null) => void
  onClick: (node: ProcessedNode) => void
  onDoubleClick: () => void
}

export function FlameNode({
  node,
  maxDepth,
  width,
  height,
  isHovered,
  isSearchMatch,
  hasSearchQuery,
  isIcicle,
  onHover,
  onClick,
  onDoubleClick,
}: FlameNodeProps) {
  const frameHeight = 24
  const gap = 1
  
  const x = node.x0 * width
  const frameWidth = Math.max((node.x1 - node.x0) * width - gap, 0)
  
  // For icicle: root at top, children below
  // For flame: root at bottom, children above
  const y = isIcicle
    ? node.depth * (frameHeight + gap)
    : height - (node.depth + 1) * (frameHeight + gap)

  const bgColor = getFlameColor(node.depth, maxDepth)
  
  // Determine opacity based on search and hover state
  let opacity = 1
  if (hasSearchQuery && !isSearchMatch) {
    opacity = 0.3
  } else if (isHovered) {
    opacity = 1
  }

  // Don't render if too small
  if (frameWidth < 1) return null

  const showLabel = frameWidth > 30

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(node)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node)}
      onDoubleClick={onDoubleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick(node)
        if (e.key === 'Escape') onDoubleClick()
      }}
      aria-label={`${node.data.name}: ${node.data.value} samples`}
    >
      <rect
        x={x}
        y={y}
        width={frameWidth}
        height={frameHeight}
        fill={bgColor}
        rx={2}
        style={{
          opacity,
          transition: 'opacity 150ms ease-out',
        }}
        stroke={isHovered ? 'var(--text)' : 'transparent'}
        strokeWidth={1}
      />
      {showLabel && (
        <text
          x={x + 4}
          y={y + frameHeight / 2}
          dy="0.35em"
          fill="var(--bg)"
          fontSize={11}
          fontFamily="var(--font-mono)"
          style={{
            opacity,
            transition: 'opacity 150ms ease-out',
            pointerEvents: 'none',
          }}
        >
          <tspan>
            {frameWidth > 100 
              ? node.data.name 
              : node.data.name.slice(0, Math.floor(frameWidth / 7))}
          </tspan>
        </text>
      )}
    </g>
  )
}
