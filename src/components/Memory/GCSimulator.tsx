import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../../lib/cn'
import { useInView } from '../../hooks/useInView'

interface HeapObject {
  id: string
  name: string
  size: number
  color: string
  refs: string[]
}

type GCStep = 'initial' | 'mark' | 'sweep' | 'done'

const initialHeap: HeapObject[] = [
  { id: 'root', name: 'root', size: 1, color: '#f97316', refs: ['app', 'config'] },
  { id: 'app', name: 'App', size: 2, color: '#3b82f6', refs: ['user', 'cache'] },
  { id: 'config', name: 'Config', size: 1, color: '#8b5cf6', refs: [] },
  { id: 'user', name: 'User', size: 2, color: '#22c55e', refs: ['session'] },
  { id: 'cache', name: 'Cache', size: 3, color: '#ec4899', refs: [] },
  { id: 'session', name: 'Session', size: 1, color: '#14b8a6', refs: [] },
  { id: 'old_user', name: 'OldUser', size: 2, color: '#6b7280', refs: ['old_session'] },
  { id: 'old_session', name: 'OldSession', size: 1, color: '#6b7280', refs: [] },
  { id: 'temp', name: 'Temp', size: 1, color: '#6b7280', refs: [] },
]

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
  const { ref, isInView } = useInView(0.1)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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

  const handleMark = () => setStep('mark')

  const handleSweep = () => {
    setStep('sweep')
    timeoutRef.current = setTimeout(() => {
      setHeap(prev => prev.filter(o => reachableIds.has(o.id)))
      setStep('done')
    }, prefersReducedMotion ? 100 : 600)
  }

  const handleReset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setStep('initial')
    setHeap(initialHeap)
  }

  const cellSize = 50
  const gridWidth = 6 * cellSize
  const gridHeight = 4 * cellSize

  return (
    <div ref={ref} className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleMark}
          disabled={step !== 'initial'}
          className={cn('btn', step === 'initial' && 'btn-active')}
        >
          1. Mark
        </button>
        <button
          onClick={handleSweep}
          disabled={step !== 'mark'}
          className={cn('btn', step === 'mark' && 'btn-active')}
        >
          2. Sweep
        </button>
        {step === 'done' && (
          <button
            onClick={handleReset}
            className="btn"
          >
            Reset
          </button>
        )}
        <span className="text-sm text-[var(--text-muted)]">
          {step === 'initial' && 'The heap contains reachable and unreachable objects.'}
          {step === 'mark' && 'Traced from root. Colored = reachable, gray = garbage.'}
          {step === 'sweep' && 'Removing unreachable objects...'}
          {step === 'done' && `Freed ${freedMemory} units of memory.`}
        </span>
      </div>

      {/* Heap visualization */}
      <div className="overflow-x-auto">
        <svg width={gridWidth + 40} height={gridHeight + 40} className="block">
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
                  strokeWidth={1}
                  markerEnd="url(#arrowhead)"
                  style={{
                    opacity: step === 'sweep' && unreachableIds.includes(obj.id) ? 0.3 : 0.5
                  }}
                />
              )
            })
          )}

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
              
              let fill = obj.color
              if (step !== 'initial') {
                fill = isReachable ? obj.color : '#374151'
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
                  {isMarked && (
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 3}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                    />
                  )}
                  
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={fill}
                    className={cn(
                      'transition-opacity',
                      isGarbage && 'opacity-40'
                    )}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={9}
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

      {/* Memory stats - inline */}
      <p className="font-mono text-sm text-[var(--text-muted)]">
        Total: {totalMemory} units | 
        In use: {step === 'done' ? totalMemory - freedMemory : totalMemory - (unreachableIds.length > 0 ? freedMemory : 0)} | 
        {step === 'done' ? (
          <span className="text-emerald-400"> Freed: {freedMemory}</span>
        ) : (
          <span> To free: {unreachableIds.length > 0 ? freedMemory : 0}</span>
        )}
      </p>
    </div>
  )
}
