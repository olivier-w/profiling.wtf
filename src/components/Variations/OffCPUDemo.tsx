import type { JSX } from 'react'
import { useState } from 'react'
import { cn } from '../../lib/cn'

type ViewMode = 'cpu' | 'offcpu'

// CPU profile: only shows actual computation (50ms)
const cpuData = {
  name: 'handleRequest',
  value: 50,
  children: [
    { name: 'parseBody', value: 15 },
    { name: 'validate', value: 20 },
    { name: 'serialize', value: 15 },
  ],
}

// Off-CPU profile: shows waiting time (450ms)
const offCpuData = {
  name: 'handleRequest',
  value: 450,
  children: [
    {
      name: 'dbQuery',
      value: 280,
      children: [
        { name: 'acquireConnection', value: 30 },
        { name: 'waitForResult', value: 250 },
      ],
    },
    { name: 'fetchExternalAPI', value: 120 },
    { name: 'acquireLock', value: 50 },
  ],
}

interface FrameNode {
  name: string
  value: number
  children?: FrameNode[]
}

function MiniFlameGraph({
  data,
  maxValue,
  color,
}: {
  data: FrameNode
  maxValue: number
  color: string
}) {
  const frameHeight = 26
  const gap = 2
  const totalWidth = 500

  function renderNode(
    node: FrameNode,
    depth: number,
    x: number,
    _parentWidth: number
  ): JSX.Element[] {
    const elements: JSX.Element[] = []
    const width = (node.value / maxValue) * totalWidth
    const y = depth * (frameHeight + gap)

    elements.push(
      <g key={`${node.name}-${depth}-${x}`}>
        <rect
          x={x}
          y={y}
          width={Math.max(width - gap, 1)}
          height={frameHeight}
          fill={color}
          rx={3}
          style={{ opacity: 0.7 + depth * 0.1 }}
        />
        {width > 50 && (
          <text
            x={x + 6}
            y={y + 17}
            fill="#fff"
            fontSize={11}
            fontFamily="var(--font-mono)"
            style={{ pointerEvents: 'none' }}
          >
            {node.name.length > width / 7
              ? node.name.slice(0, Math.floor(width / 7) - 1) + '…'
              : node.name}
          </text>
        )}
      </g>
    )

    if (node.children) {
      let childX = x
      for (const child of node.children) {
        const childWidth = (child.value / maxValue) * totalWidth
        elements.push(
          ...renderNode(child, depth + 1, childX, childWidth)
        )
        childX += childWidth
      }
    }

    return elements
  }

  const allElements = renderNode(data, 0, 0, totalWidth)
  const maxDepth = Math.max(
    1,
    ...allElements.map((el) => {
      const match = el.key?.toString().match(/-(\d+)-/)
      return match ? parseInt(match[1]) : 0
    })
  )
  const height = (maxDepth + 1) * (frameHeight + gap) + 10

  return (
    <svg width={totalWidth} height={height} className="block">
      {allElements}
    </svg>
  )
}

export function OffCPUDemo() {
  const [viewMode, setViewMode] = useState<ViewMode>('cpu')

  const totalTime = 500 // ms
  const cpuTime = 50
  const offCpuTime = 450

  return (
    <div className="space-y-6">
      {/* Scenario setup */}
      <div className="space-y-2">
        <p className="text-[var(--text-muted)]">
          A request takes <span className="font-mono text-[var(--text)]">500ms</span> total, 
          but the CPU profiler only shows <span className="font-mono text-[var(--text)]">50ms</span> of work.
        </p>
        <p className="text-[var(--text-muted)]">
          Where did the other 450ms go?
        </p>
      </div>

      {/* Time bar visualization */}
      <div className="space-y-2">
        <div className="flex h-8 w-full overflow-hidden rounded">
          <div
            className="flex items-center justify-center bg-[var(--flame-3)] text-xs font-mono text-[var(--bg)]"
            style={{ width: `${(cpuTime / totalTime) * 100}%` }}
          >
            CPU
          </div>
          <div
            className="flex items-center justify-center bg-blue-600 text-xs font-mono text-white"
            style={{ width: `${(offCpuTime / totalTime) * 100}%` }}
          >
            Waiting
          </div>
        </div>
        <div className="flex justify-between text-xs text-[var(--text-muted)] font-mono">
          <span>0ms</span>
          <span>{totalTime}ms</span>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setViewMode('cpu')}
          className={cn('btn', viewMode === 'cpu' && 'btn-active')}
        >
          CPU Profile
        </button>
        <button
          onClick={() => setViewMode('offcpu')}
          className={cn('btn', viewMode === 'offcpu' && 'btn-active')}
        >
          Off-CPU Profile
        </button>
      </div>

      {/* Flame graph */}
      <div className="overflow-x-auto">
        {viewMode === 'cpu' ? (
          <MiniFlameGraph data={cpuData} maxValue={cpuData.value} color="var(--flame-3)" />
        ) : (
          <MiniFlameGraph data={offCpuData} maxValue={offCpuData.value} color="#2563eb" />
        )}
      </div>

      {/* Stats */}
      <p className="font-mono text-sm text-[var(--text-muted)]">
        {viewMode === 'cpu' ? (
          <>
            Showing: <span className="text-[var(--flame-3)]">{cpuTime}ms</span> of computation (10% of wall time)
          </>
        ) : (
          <>
            Showing: <span className="text-blue-400">{offCpuTime}ms</span> of waiting (90% of wall time)
          </>
        )}
      </p>

      {/* Explanation based on view */}
      <div className="grid gap-6 sm:grid-cols-2 text-sm">
        <div className={cn(viewMode === 'cpu' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]')}>
          <p className="font-medium">CPU Profile</p>
          <p className="mt-1">
            Shows where CPU cycles are spent. Only captures time when your code is actively running.
          </p>
        </div>
        <div className={cn(viewMode === 'offcpu' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]')}>
          <p className="font-medium">Off-CPU Profile</p>
          <p className="mt-1">
            Shows where time is spent waiting—on I/O, network, locks, or sleep. Captures blocked time.
          </p>
        </div>
      </div>

      {/* Key insight */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
        <p className="text-[var(--text)]">
          If your app is slow but <span className="text-[var(--flame-3)]">CPU usage is low</span>, the CPU profile won't help. 
          You need <span className="text-blue-400">off-CPU analysis</span> to see where time is spent waiting.
        </p>
      </div>
    </div>
  )
}
