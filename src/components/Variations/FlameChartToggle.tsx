import { useState } from 'react'
import { cn } from '../../lib/cn'

type ViewMode = 'graph' | 'chart'

// Flame chart shows samples in time order (when they occurred)
// Each sample is a column showing the stack at that moment
const timeOrderedSamples = [
  ['main', 'handleRequest', 'processData', 'parseJSON'],
  ['main', 'handleRequest', 'processData', 'parseJSON'],
  ['main', 'handleRequest', 'processData', 'validate'],
  ['main', 'handleRequest', 'processData', 'validate'],
  ['main', 'handleRequest', 'processData', 'parseJSON'],
  ['main', 'handleRequest', 'log'],
  // GC pause - stack is different, this only shows in chart view
  ['main', 'handleRequest', '[GC pause]'],
  ['main', 'handleRequest', 'processData', 'transform'],
  ['main', 'handleRequest', 'processData', 'parseJSON'],
]

// Flame graph data - merged and sorted alphabetically
const mergedData = {
  name: 'main',
  value: 9,
  children: [
    {
      name: 'handleRequest',
      value: 9,
      children: [
        { name: '[GC pause]', value: 1 },
        { name: 'log', value: 1 },
        {
          name: 'processData',
          value: 7,
          children: [
            { name: 'parseJSON', value: 4 },
            { name: 'transform', value: 1 },
            { name: 'validate', value: 2 },
          ],
        },
      ],
    },
  ],
}

interface FrameNode {
  name: string
  value: number
  children?: FrameNode[]
}

// Recursive function to render flame graph frames
function FlameGraphView({ node, x, width, depth, totalValue }: {
  node: FrameNode
  x: number
  width: number
  depth: number
  totalValue: number
}) {
  const frameHeight = 24
  const gap = 1
  const y = depth * (frameHeight + gap)
  const frameWidth = (node.value / totalValue) * width

  // Color based on depth
  const colors = [
    'var(--flame-4)',
    'var(--flame-3)',
    'var(--flame-2)',
    'var(--flame-1)',
  ]
  const color = node.name === '[GC pause]' ? '#4dabf7' : colors[depth % colors.length]

  let childX = x
  const childElements = node.children?.map((child) => {
    const childWidth = (child.value / totalValue) * width
    const element = (
      <FlameGraphView
        key={`${child.name}-${childX}`}
        node={child}
        x={childX}
        width={width}
        depth={depth + 1}
        totalValue={totalValue}
      />
    )
    childX += childWidth
    return element
  })

  return (
    <>
      <g>
        <rect
          x={x}
          y={y}
          width={Math.max(frameWidth - gap, 1)}
          height={frameHeight}
          fill={color}
          rx={2}
          className="transition-opacity hover:opacity-80"
        />
        {frameWidth > 40 && (
          <text
            x={x + 4}
            y={y + 16}
            fill="var(--bg)"
            fontSize={11}
            fontFamily="var(--font-mono)"
            className="pointer-events-none"
          >
            {node.name.length > frameWidth / 7 
              ? node.name.slice(0, Math.floor(frameWidth / 7) - 1) + '…' 
              : node.name}
          </text>
        )}
      </g>
      {childElements}
    </>
  )
}

// Flame chart shows each sample as a column in time order
function FlameChartView() {
  const frameHeight = 24
  const gap = 1
  const columnWidth = 60
  const width = timeOrderedSamples.length * columnWidth

  return (
    <svg width={width} height={120} className="block">
      {timeOrderedSamples.map((stack, colIndex) => (
        <g key={colIndex}>
          {stack.map((frame, frameIndex) => {
            const colors = [
              'var(--flame-4)',
              'var(--flame-3)',
              'var(--flame-2)',
              'var(--flame-1)',
            ]
            const color = frame === '[GC pause]' ? '#4dabf7' : colors[frameIndex % colors.length]
            
            return (
              <g key={`${colIndex}-${frameIndex}`}>
                <rect
                  x={colIndex * columnWidth}
                  y={frameIndex * (frameHeight + gap)}
                  width={columnWidth - gap}
                  height={frameHeight}
                  fill={color}
                  rx={2}
                  className="transition-opacity hover:opacity-80"
                />
                {columnWidth > 30 && (
                  <text
                    x={colIndex * columnWidth + 4}
                    y={frameIndex * (frameHeight + gap) + 16}
                    fill="var(--bg)"
                    fontSize={9}
                    fontFamily="var(--font-mono)"
                    className="pointer-events-none"
                  >
                    {frame.length > 7 ? frame.slice(0, 6) + '…' : frame}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      ))}
      {/* Time axis labels */}
      {timeOrderedSamples.map((_, i) => (
        <text
          key={i}
          x={i * columnWidth + columnWidth / 2}
          y={115}
          fill="var(--text-muted)"
          fontSize={9}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
        >
          t{i + 1}
        </text>
      ))}
    </svg>
  )
}

export function FlameChartToggle() {
  const [viewMode, setViewMode] = useState<ViewMode>('graph')

  return (
    <div className="space-y-4">
      {/* Toggle buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('graph')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
            viewMode === 'graph'
              ? 'bg-[var(--accent)] text-[var(--bg)]'
              : 'bg-[var(--surface-hover)] text-[var(--text)] hover:bg-[var(--border)]'
          )}
        >
          Flame Graph
        </button>
        <button
          onClick={() => setViewMode('chart')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
            viewMode === 'chart'
              ? 'bg-[var(--accent)] text-[var(--bg)]'
              : 'bg-[var(--surface-hover)] text-[var(--text)] hover:bg-[var(--border)]'
          )}
        >
          Flame Chart
        </button>
      </div>

      {/* Visualization */}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
        {viewMode === 'graph' ? (
          <svg width={500} height={110} className="block">
            <FlameGraphView
              node={mergedData}
              x={0}
              width={500}
              depth={0}
              totalValue={mergedData.value}
            />
          </svg>
        ) : (
          <FlameChartView />
        )}
      </div>

      {/* Explanation */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="cursor-default rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
          <p className="font-medium text-[var(--text)]">Flame Graph</p>
          <p className="mt-1 text-[var(--text-muted)]">
            X-axis: alphabetical. Stacks merge together. Shows aggregate time—parseJSON is 44% of samples.
          </p>
        </div>
        <div className="cursor-default rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
          <p className="font-medium text-[var(--text)]">Flame Chart</p>
          <p className="mt-1 text-[var(--text-muted)]">
            X-axis: time. Each column is one sample. Shows temporal order—notice the{' '}
            <span className="text-[var(--info)]">GC pause</span> at t7.
          </p>
        </div>
      </div>

      {/* Key insight */}
      <div className="cursor-default rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">✓</span>
          <p className="text-[var(--text)]">
            <strong className="text-green-400">Key insight:</strong> The GC pause is invisible in the flame graph (it merges with other work) 
            but clearly visible in the flame chart at t7. Use flame charts when you need to see <em>when</em> things happened.
          </p>
        </div>
      </div>
    </div>
  )
}
