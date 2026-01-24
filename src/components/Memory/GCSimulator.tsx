import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../../lib/cn'
import { useInView } from '../../hooks/useInView'

type ObjectType = 'root' | 'box' | 'file' | 'data' | 'trash'

interface HeapObject {
  id: string
  name: string
  size: number
  type: ObjectType
  refs: string[]
}

type GCStep = 'initial' | 'mark' | 'sweep' | 'done'

const initialHeap: HeapObject[] = [
  { id: 'root', name: 'root', size: 1, type: 'root', refs: ['app', 'config'] },
  { id: 'app', name: 'App', size: 2, type: 'box', refs: ['user', 'cache'] },
  { id: 'config', name: 'Config', size: 1, type: 'file', refs: [] },
  { id: 'user', name: 'User', size: 2, type: 'data', refs: ['session'] },
  { id: 'cache', name: 'Cache', size: 3, type: 'box', refs: [] },
  { id: 'session', name: 'Session', size: 1, type: 'file', refs: [] },
  { id: 'old_user', name: 'OldUser', size: 2, type: 'trash', refs: ['old_session'] },
  { id: 'old_session', name: 'OldSess', size: 1, type: 'trash', refs: [] },
  { id: 'temp', name: 'Temp', size: 1, type: 'trash', refs: [] },
]

// Positions as percentages for responsive layout
const positions: Record<string, { x: number; y: number }> = {
  root: { x: 50, y: 10 },
  app: { x: 28, y: 30 },
  config: { x: 68, y: 28 },
  user: { x: 14, y: 52 },
  cache: { x: 42, y: 55 },
  session: { x: 10, y: 78 },
  old_user: { x: 72, y: 52 },
  old_session: { x: 80, y: 78 },
  temp: { x: 58, y: 78 },
}

// Minimal icons using site colors
function ObjectIcon({ type, isGarbage }: { type: ObjectType; isGarbage: boolean }) {
  const baseColor = isGarbage ? 'var(--text-muted)' : getTypeColor(type)
  const size = 28
  
  switch (type) {
    case 'root':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <path 
            d="M14 4L4 12V24H10V18H18V24H24V12L14 4Z" 
            fill={baseColor}
            opacity={isGarbage ? 0.4 : 1}
          />
        </svg>
      )
    case 'box':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <rect x="4" y="8" width="20" height="16" rx="2" fill={baseColor} opacity={isGarbage ? 0.4 : 1}/>
          <line x1="4" y1="12" x2="24" y2="12" stroke="var(--bg)" strokeWidth="1.5" opacity="0.3"/>
        </svg>
      )
    case 'file':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <path 
            d="M8 4H17L22 9V24H8V4Z" 
            fill={baseColor}
            opacity={isGarbage ? 0.4 : 1}
          />
          <path d="M17 4V9H22" fill="none" stroke="var(--bg)" strokeWidth="1" opacity="0.3"/>
        </svg>
      )
    case 'data':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="10" fill={baseColor} opacity={isGarbage ? 0.4 : 1}/>
          <circle cx="14" cy="14" r="4" fill="var(--bg)" opacity="0.3"/>
        </svg>
      )
    case 'trash':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <path 
            d="M6 8C8 6 12 8 10 12C8 16 12 18 10 22C12 20 16 22 18 20C20 18 22 22 24 20C22 18 24 14 22 10C20 6 24 4 22 4C20 6 16 4 12 6C8 8 8 4 6 8Z" 
            fill={baseColor}
            opacity={isGarbage ? 0.4 : 1}
          />
        </svg>
      )
    default:
      return null
  }
}

function getTypeColor(type: ObjectType): string {
  switch (type) {
    case 'root': return 'var(--accent)'
    case 'box': return 'var(--flame-3)'
    case 'file': return 'var(--flame-2)'
    case 'data': return 'var(--flame-4)'
    case 'trash': return 'var(--text-muted)'
  }
}

// Minimal trash can icon
function TrashCan({ isActive }: { isActive: boolean }) {
  const color = isActive ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <svg width="32" height="36" viewBox="0 0 32 36" className="transition-colors duration-300">
      {/* Lid */}
      <rect x="4" y="4" width="24" height="3" rx="1" fill={color} />
      {/* Handle */}
      <rect x="12" y="1" width="8" height="4" rx="1" fill={color} opacity="0.6" />
      {/* Body */}
      <path 
        d="M6 8L8 34H24L26 8H6Z" 
        fill="var(--bg)" 
        stroke={color} 
        strokeWidth="2"
      />
      {/* Lines on body */}
      <line x1="12" y1="12" x2="12" y2="30" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="16" y1="12" x2="16" y2="30" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="20" y1="12" x2="20" y2="30" stroke={color} strokeWidth="1.5" opacity="0.4" />
    </svg>
  )
}

export function GCSimulator() {
  const [step, setStep] = useState<GCStep>('initial')
  const [heap, setHeap] = useState(initialHeap)
  const [flyingItems, setFlyingItems] = useState<string[]>([])
  const { ref } = useInView(0.1)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
  const freedMemory = initialHeap
    .filter(o => unreachableIds.includes(o.id))
    .reduce((sum, o) => sum + o.size, 0)

  const handleMark = () => setStep('mark')

  const handleSweep = () => {
    setStep('sweep')
    
    if (prefersReducedMotion) {
      setHeap(prev => prev.filter(o => reachableIds.has(o.id)))
      setStep('done')
      return
    }

    // Animate items flying to dumpster
    unreachableIds.forEach((id, index) => {
      setTimeout(() => {
        setFlyingItems(prev => [...prev, id])
      }, index * 250)
    })

    timeoutRef.current = setTimeout(() => {
      setHeap(prev => prev.filter(o => reachableIds.has(o.id)))
      setFlyingItems([])
      setStep('done')
    }, unreachableIds.length * 250 + 500)
  }

  const handleReset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setStep('initial')
    setHeap(initialHeap)
    setFlyingItems([])
  }

  return (
    <div ref={ref} className="space-y-4">
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
          <button onClick={handleReset} className="btn">
            Reset
          </button>
        )}
        <span className="text-sm text-[var(--text-muted)]">
          {step === 'initial' && 'The heap contains reachable and unreachable objects.'}
          {step === 'mark' && 'Traced from root. Colored = reachable, gray = garbage.'}
          {step === 'sweep' && 'Taking out the trash...'}
          {step === 'done' && `Freed ${freedMemory} units of memory.`}
        </span>
      </div>

      {/* Heap visualization */}
      <div 
        className="relative rounded-lg bg-[var(--surface)] overflow-hidden"
        style={{ minHeight: '280px' }}
      >
        {/* Reference lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {heap.map(obj =>
            obj.refs.map(refId => {
              const fromPos = positions[obj.id]
              const toPos = positions[refId]
              if (!fromPos || !toPos) return null
              
              const toObj = heap.find(o => o.id === refId)
              if (!toObj) return null

              const isReachable = reachableIds.has(obj.id) && reachableIds.has(refId)
              const isMarkedReachable = step !== 'initial' && isReachable
              const isFading = step === 'sweep' && unreachableIds.includes(obj.id)

              return (
                <line
                  key={`${obj.id}-${refId}`}
                  x1={`${fromPos.x}%`}
                  y1={`${fromPos.y}%`}
                  x2={`${toPos.x}%`}
                  y2={`${toPos.y}%`}
                  stroke={isMarkedReachable ? '#22c55e' : 'var(--text-muted)'}
                  strokeWidth={1.5}
                  strokeDasharray={isMarkedReachable ? 'none' : '4 4'}
                  style={{
                    opacity: isFading ? 0.1 : 0.4,
                    transition: 'opacity 0.3s, stroke 0.3s'
                  }}
                />
              )
            })
          )}
        </svg>

        {/* Heap objects */}
        <AnimatePresence>
          {heap.map(obj => {
            const pos = positions[obj.id]
            if (!pos) return null

            const isReachable = reachableIds.has(obj.id)
            const isMarked = step !== 'initial' && isReachable
            const isGarbage = step !== 'initial' && !isReachable
            const isFlying = flyingItems.includes(obj.id)

            return (
              <motion.div
                key={obj.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 1, opacity: 1 }}
                animate={
                  isFlying
                    ? { 
                        x: `${90 - pos.x}%`,
                        y: `${85 - pos.y}%`,
                        scale: 0.3,
                        opacity: 0,
                        rotate: 180,
                      }
                    : { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }
                }
                exit={{ scale: 0, opacity: 0 }}
                transition={
                  isFlying
                    ? { duration: 0.4, ease: [0.55, 0.055, 0.675, 0.19] }
                    : { duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }
                }
              >
                {/* Object icon with ring wrapper - 28px to match icon size */}
                <div className="relative w-7 h-7 flex items-center justify-center">
                  {/* Marked ring */}
                  {isMarked && (
                    <motion.div
                      className="absolute inset-[-4px] rounded-full border-2 border-dashed border-green-500"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  
                  {/* Garbage X marker */}
                  {isGarbage && !isFlying && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500/80 rounded-full flex items-center justify-center text-white text-[10px] font-bold z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      ✕
                    </motion.div>
                  )}

                  {/* Object icon */}
                  <div className={cn(
                    'transition-all duration-200',
                    isGarbage && 'grayscale opacity-60'
                  )}>
                    <ObjectIcon type={obj.type} isGarbage={isGarbage} />
                  </div>
                </div>

                {/* Label */}
                <span className={cn(
                  'mt-0.5 text-[10px] font-mono transition-colors duration-200',
                  isMarked && 'text-green-400',
                  isGarbage && 'text-[var(--text-muted)]/50',
                  !isMarked && !isGarbage && 'text-[var(--text-muted)]'
                )}>
                  {obj.name}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Trash can */}
        <div className="absolute bottom-2 right-3">
          <TrashCan isActive={step === 'sweep'} />
        </div>
      </div>

      {/* Memory stats */}
      <p className="font-mono text-sm text-[var(--text-muted)]">
        Total: {totalMemory} units | 
        In use: {step === 'done' ? totalMemory - freedMemory : totalMemory - (step !== 'initial' ? freedMemory : 0)} | 
        {step === 'done' ? (
          <span className="text-[var(--accent)]"> Freed: {freedMemory}</span>
        ) : (
          <span> To free: {step !== 'initial' ? freedMemory : '?'}</span>
        )}
      </p>
    </div>
  )
}
