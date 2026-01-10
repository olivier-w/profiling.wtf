import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../../lib/cn'

interface HeapObject {
  id: string
  name: string
  size: number       // Visual size units
  color: string
  refs: string[]     // IDs of objects this one references
}

type GCStep = 'initial' | 'mark' | 'sweep' | 'done'

// Initial heap state with some unreachable objects
const initialHeap: HeapObject[] = [
  { id: 'root', name: 'root', size: 1, color: '#f97316', refs: ['app', 'config'] },
  { id: 'app', name: 'App', size: 2, color: '#3b82f6', refs: ['user', 'cache'] },
  { id: 'config', name: 'Config', size: 1, color: '#8b5cf6', refs: [] },
  { id: 'user', name: 'User', size: 2, color: '#22c55e', refs: ['session'] },
  { id: 'cache', name: 'Cache', size: 3, color: '#ec4899', refs: [] },
  { id: 'session', name: 'Session', size: 1, color: '#14b8a6', refs: [] },
  // Unreachable objects (garbage)
  { id: 'old_user', name: 'OldUser', size: 2, color: '#6b7280', refs: ['old_session'] },
  { id: 'old_session', name: 'OldSession', size: 1, color: '#6b7280', refs: [] },
  { id: 'temp', name: 'Temp', size: 1, color: '#6b7280', refs: [] },
]

// Grid positions for objects (x, y in grid units)
const positions: Record<string, { x: number; y: number }> = {
  root: { x: 2, y: 0 },
  app: { x: 1, y: 1 },
  config: { x: 3, y: 1 },
  user: { x: 0, y: 2 },
  cache: { x: 2, y: 2 },
  session: { x: 0, y: 3 },
  old_user: { x: 4, y: 2 },
  old_session: { x: 4, y: 3 },
  temp: { x: 5, y: 1 },
}

export function GCSimulator() {
  const [step, setStep] = useState<GCStep>('initial')
  const [heap, setHeap] = useState(initialHeap)

  // Check for reduced motion
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Calculate which objects are reachable from root
  const reachableIds = useMemo(() => {
    const visited = new Set<string>()
    const queue = ['root']
    
    while (queue.length > 0) {
      const id = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)
      
      const obj = initialHeap.find(o => o.id === id)
      if (obj) {
        queue.push(...obj.refs)
      }
    }
    
    return visited
  }, [])

  const unreachableIds = initialHeap
    .filter(o => !reachableIds.has(o.id))
    .map(o => o.id)

  const totalMemory = initialHeap.reduce((sum, o) => sum + o.size, 0)
  const freedMemory = heap
    .filter(o => unreachableIds.includes(o.id))
    .reduce((sum, o) => sum + o.size, 0)

  const handleMark = () => {
    setStep('mark')
  }

  const handleSweep = () => {
    setStep('sweep')
    // After animation, remove unreachable objects
    setTimeout(() => {
      setHeap(prev => prev.filter(o => reachableIds.has(o.id)))
      setStep('done')
    }, prefersReducedMotion ? 100 : 600)
  }

  const handleReset = () => {
    setStep('initial')
    setHeap(initialHeap)
  }

  const cellSize = 50
  const gridWidth = 6 * cellSize
  const gridHeight = 4 * cellSize

  return (
    <div className="space-y-4">
      {/* Step buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleMark}
          disabled={step !== 'initial'}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
            step === 'initial'
              ? 'border border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)]/10'
              : 'border border-transparent bg-[var(--surface-hover)] text-green-400'
          )}
        >
          {step !== 'initial' && <span className="mr-1">✓</span>}
          1. Mark
        </button>
        <button
          onClick={handleSweep}
          disabled={step !== 'mark'}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
            step === 'mark'
              ? 'border border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)]/10'
              : step === 'initial'
              ? 'border border-transparent bg-[var(--surface)] text-[var(--text-muted)]'
              : 'border border-transparent bg-[var(--surface-hover)] text-green-400'
          )}
        >
          {(step === 'sweep' || step === 'done') && <span className="mr-1">✓</span>}
          2. Sweep
        </button>
        {step === 'done' && (
          <button
            onClick={handleReset}
            className="rounded-md bg-[var(--surface-hover)] px-3 py-1.5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--border)]"
          >
            Reset
          </button>
        )}
      </div>

      {/* Step description */}
      <p className="text-sm text-[var(--text-muted)]">
        {step === 'initial' && 'The heap contains objects. Some are reachable from root, some are not.'}
        {step === 'mark' && 'Mark phase: Trace from root, mark all reachable objects (colored). Gray objects are unreachable.'}
        {step === 'sweep' && 'Sweep phase: Remove all unmarked (unreachable) objects.'}
        {step === 'done' && `Done! Freed ${freedMemory} units of memory.`}
      </p>


      {/* Heap visualization */}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
        <svg width={gridWidth + 40} height={gridHeight + 40} className="block">
          {/* Reference arrows */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 6 3, 0 6"
                fill="var(--text-muted)"
              />
            </marker>
          </defs>

          {heap.map(obj => 
            obj.refs.map(refId => {
              const fromPos = positions[obj.id]
              const toPos = positions[refId]
              if (!fromPos || !toPos) return null
              
              const toObj = heap.find(o => o.id === refId)
              if (!toObj) return null

              const x1 = 20 + fromPos.x * cellSize + cellSize / 2
              const y1 = 20 + fromPos.y * cellSize + cellSize / 2
              const x2 = 20 + toPos.x * cellSize + cellSize / 2
              const y2 = 20 + toPos.y * cellSize + cellSize / 2

              // Shorten line to not overlap with circles
              const angle = Math.atan2(y2 - y1, x2 - x1)
              const shortenBy = 18
              const adjustedX2 = x2 - Math.cos(angle) * shortenBy
              const adjustedY2 = y2 - Math.sin(angle) * shortenBy

              return (
                <line
                  key={`${obj.id}-${refId}`}
                  x1={x1}
                  y1={y1}
                  x2={adjustedX2}
                  y2={adjustedY2}
                  stroke="var(--text-muted)"
                  strokeWidth={1.5}
                  markerEnd="url(#arrowhead)"
                  className="transition-opacity"
                  style={{
                    opacity: step === 'sweep' && unreachableIds.includes(obj.id) ? 0.3 : 1
                  }}
                />
              )
            })
          )}

          {/* Objects */}
          <AnimatePresence>
            {heap.map(obj => {
              const pos = positions[obj.id]
              if (!pos) return null

              const x = 20 + pos.x * cellSize + cellSize / 2
              const y = 20 + pos.y * cellSize + cellSize / 2
              const radius = 12 + obj.size * 3

              const isReachable = reachableIds.has(obj.id)
              const isMarked = step !== 'initial' && isReachable
              const isGarbage = step !== 'initial' && !isReachable
              
              // Color logic
              let fill = obj.color
              if (step !== 'initial') {
                fill = isReachable ? obj.color : '#4b5563'  // Gray for garbage
              }

              return (
                <motion.g
                  key={obj.id}
                  initial={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
                  animate={
                    step === 'sweep' && !isReachable
                      ? { scale: 0, opacity: 0 }
                      : { scale: 1, opacity: 1 }
                  }
                  exit={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* Marked indicator ring */}
                  {isMarked && (
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 4}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth={2}
                      className="animate-pulse"
                    />
                  )}
                  
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={fill}
                    className={cn(
                      'transition-all',
                      isGarbage && 'opacity-50'
                    )}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                    className="pointer-events-none"
                  >
                    {obj.name.length > 6 ? obj.name.slice(0, 5) + '…' : obj.name}
                  </text>
                </motion.g>
              )
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-[#f97316]" />
          <span className="text-[var(--text-muted)]">Root</span>
        </div>
        {step !== 'initial' && (
          <>
            <div className="flex items-center gap-2">
              <div className="relative h-4 w-4">
                <div className="absolute inset-0 rounded-full bg-[#3b82f6]" />
                <div className="absolute -inset-0.5 rounded-full border-2 border-green-500" />
              </div>
              <span className="text-[var(--text-muted)]">Reachable (marked)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-[#4b5563] opacity-50" />
              <span className="text-[var(--text-muted)]">Garbage</span>
            </div>
          </>
        )}
      </div>

      {/* Memory stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="cursor-default rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
          <p className="text-xl font-medium tabular-nums text-[var(--text)]">{totalMemory}</p>
          <p className="text-sm text-[var(--text-muted)]">Total heap</p>
        </div>
        <div className="cursor-default rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
          <p className="text-xl font-medium tabular-nums text-[var(--text)]">
            {step === 'done' ? totalMemory - freedMemory : totalMemory - (unreachableIds.length > 0 ? freedMemory : 0)}
          </p>
          <p className="text-sm text-[var(--text-muted)]">In use</p>
        </div>
        <div className={cn(
          'cursor-default rounded border p-3 text-center',
          step === 'done' 
            ? 'border-green-500/30 bg-green-500/10' 
            : 'border-[var(--border)] bg-[var(--surface)]'
        )}>
          <p className={cn(
            'text-xl font-medium tabular-nums',
            step === 'done' ? 'text-green-400' : 'text-[var(--text)]'
          )}>
            {step === 'done' ? freedMemory : unreachableIds.length > 0 ? freedMemory : 0}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            {step === 'done' ? 'Freed' : 'To free'}
          </p>
        </div>
      </div>
    </div>
  )
}
