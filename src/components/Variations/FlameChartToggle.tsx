import { useState } from 'react'
import { cn } from '../../lib/cn'

type ViewMode = 'graph' | 'chart'

const timeOrderedSamples = [
  ['main', 'handleRequest', 'processData', 'parseJSON'],
  ['main', 'handleRequest', 'processData', 'parseJSON'],
  ['main', 'handleRequest', 'processData', 'validate'],
  ['main', 'handleRequest', 'processData', 'validate'],
  ['main', 'handleRequest', 'processData', 'parseJSON'],
  ['main', 'handleRequest', 'log'],
  ['main', 'handleRequest', '[GC pause]'],
  ['main', 'handleRequest', 'processData', 'transform'],
  ['main', 'handleRequest', 'processData', 'parseJSON'],
]

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

  const colors = [
    'var(--flame-4)',
    'var(--flame-3)',
    'var(--flame-2)',
    'var(--flame-1)',
  ]
  const color = node.name === '[GC pause]' ? '#3b82f6' : colors[depth % colors.length]

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
            const color = frame === '[GC pause]' ? '#3b82f6' : colors[frameIndex % colors.length]
            
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
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setViewMode('graph')}
          className={cn('btn', viewMode === 'graph' && 'btn-active')}
        >
          Flame Graph
        </button>
        <button
          onClick={() => setViewMode('chart')}
          className={cn('btn', viewMode === 'chart' && 'btn-active')}
        >
          Flame Chart
        </button>
      </div>

      {/* Visualization */}
      <div className="overflow-x-auto">
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
      <div className="grid gap-6 sm:grid-cols-2 text-sm">
        <div>
          <p className="text-[var(--text)]">Flame Graph</p>
          <p className="mt-1 text-[var(--text-muted)]">
            X-axis: alphabetical. Stacks merge together. Shows aggregate time—parseJSON is 44% of samples.
          </p>
        </div>
        <div>
          <p className="text-[var(--text)]">Flame Chart</p>
          <p className="mt-1 text-[var(--text-muted)]">
            X-axis: time. Each column is one sample. Shows temporal order—notice the <span className="text-blue-400">GC pause</span> at t7.
          </p>
        </div>
      </div>

      {/* Key insight */}
      <p className="text-[var(--text-muted)]">
        <span className="text-[var(--text)]">Key insight:</span> The GC pause is invisible in the flame graph (it merges with other work) 
        but clearly visible in the flame chart at t7. Use flame charts when you need to see <em>when</em> things happened.
      </p>
    </div>
  )
}
