import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../../lib/cn'
import { useInView } from '../../hooks/useInView'

type ObjectType = 'root' | 'package' | 'mug' | 'plant' | 'laptop' | 'book' | 'paper' | 'banana' | 'bottle' | 'pizza'

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
  { id: 'app', name: 'App', size: 2, type: 'package', refs: ['user', 'cache'] },
  { id: 'config', name: 'Config', size: 1, type: 'book', refs: [] },
  { id: 'user', name: 'User', size: 2, type: 'mug', refs: ['session'] },
  { id: 'cache', name: 'Cache', size: 3, type: 'plant', refs: [] },
  { id: 'session', name: 'Session', size: 1, type: 'laptop', refs: [] },
  { id: 'old_user', name: 'OldUser', size: 2, type: 'pizza', refs: ['old_session'] },
  { id: 'old_session', name: 'OldSess', size: 1, type: 'banana', refs: [] },
  { id: 'temp', name: 'Temp', size: 1, type: 'paper', refs: [] },
]

// Scattered yard layout positions (x, y as percentages)
const positions: Record<string, { x: number; y: number }> = {
  root: { x: 50, y: 8 },
  app: { x: 25, y: 28 },
  config: { x: 70, y: 25 },
  user: { x: 12, y: 50 },
  cache: { x: 38, y: 55 },
  session: { x: 8, y: 78 },
  old_user: { x: 75, y: 52 },
  old_session: { x: 85, y: 78 },
  temp: { x: 60, y: 75 },
}

// Icon components for each object type
function ObjectIcon({ type, size = 32 }: { type: ObjectType; size?: number }) {
  const iconClass = "drop-shadow-md"
  
  switch (type) {
    case 'root':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={iconClass}>
          <path d="M16 4L4 14V28H12V20H20V28H28V14L16 4Z" fill="#f97316" stroke="#ea580c" strokeWidth="1.5"/>
          <rect x="14" y="14" width="4" height="4" fill="#fbbf24"/>
        </svg>
      )
    case 'package':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={iconClass}>
          <rect x="4" y="8" width="24" height="20" rx="2" fill="#d4a574" stroke="#8B7355" strokeWidth="1.5"/>
          <line x1="4" y1="14" x2="28" y2="14" stroke="#8B7355" strokeWidth="1.5"/>
          <line x1="16" y1="14" x2="16" y2="28" stroke="#8B7355" strokeWidth="1"/>
        </svg>
      )
    case 'mug':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={iconClass}>
          <rect x="6" y="8" width="16" height="18" rx="2" fill="#fafafa" stroke="#a3a3a3" strokeWidth="1.5"/>
          <path d="M22 12H26C27 12 28 13 28 14V18C28 19 27 20 26 20H22" fill="none" stroke="#a3a3a3" strokeWidth="1.5"/>
          <ellipse cx="14" cy="12" rx="6" ry="2" fill="#6b4423"/>
        </svg>
      )
    case 'plant':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={iconClass}>
          <rect x="10" y="20" width="12" height="10" rx="1" fill="#d97706" stroke="#b45309" strokeWidth="1"/>
          <path d="M16 20C16 20 12 16 12 12C12 8 16 6 16 6C16 6 20 8 20 12C20 16 16 20 16 20Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1"/>
          <path d="M16 18C14 16 10 14 8 16C10 14 12 10 16 12" fill="none" stroke="#16a34a" strokeWidth="1.5"/>
          <path d="M16 18C18 16 22 14 24 16C22 14 20 10 16 12" fill="none" stroke="#16a34a" strokeWidth="1.5"/>
        </svg>
      )
    case 'laptop':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={iconClass}>
          <rect x="6" y="8" width="20" height="14" rx="2" fill="#374151" stroke="#1f2937" strokeWidth="1"/>
          <rect x="8" y="10" width="16" height="10" fill="#3b82f6"/>
          <path d="M4 22H28L26 26H6L4 22Z" fill="#6b7280" stroke="#4b5563" strokeWidth="1"/>
        </svg>
      )
    case 'book':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={iconClass}>
          <rect x="6" y="4" width="20" height="24" rx="1" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="1"/>
          <rect x="8" y="4" width="2" height="24" fill="#7c3aed"/>
          <line x1="12" y1="10" x2="24" y2="10" stroke="#e9d5ff" strokeWidth="1.5"/>
          <line x1="12" y1="14" x2="20" y2="14" stroke="#e9d5ff" strokeWidth="1"/>
        </svg>
      )
    case 'paper':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={iconClass}>
          <path d="M8 4C6 6 10 10 8 14C6 18 10 22 8 26C10 24 14 26 18 24C22 22 24 26 26 24C24 22 26 18 24 14C22 10 26 6 24 4C22 6 18 4 14 6C10 8 10 4 8 4Z" fill="#e5e5e5" stroke="#a3a3a3" strokeWidth="1"/>
          <line x1="12" y1="10" x2="20" y2="10" stroke="#a3a3a3" strokeWidth="0.5" strokeDasharray="2"/>
          <line x1="12" y1="14" x2="18" y2="14" stroke="#a3a3a3" strokeWidth="0.5" strokeDasharray="2"/>
        </svg>
      )
    case 'banana':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={iconClass}>
          <path d="M8 24C6 20 8 12 14 8C18 6 24 8 26 12C24 10 18 10 14 14C10 18 10 22 8 24Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"/>
          <path d="M14 8C14 8 12 6 14 4" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="10" cy="20" rx="1" ry="2" fill="#8B7355" opacity="0.5"/>
        </svg>
      )
    case 'bottle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={iconClass}>
          <rect x="12" y="4" width="8" height="4" rx="1" fill="#a3a3a3"/>
          <path d="M12 8L10 12V28H22V12L20 8H12Z" fill="#86efac" fillOpacity="0.6" stroke="#22c55e" strokeWidth="1"/>
          <ellipse cx="16" cy="24" rx="4" ry="2" fill="#22c55e" fillOpacity="0.3"/>
        </svg>
      )
    case 'pizza':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={iconClass}>
          <path d="M16 6L4 28H28L16 6Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"/>
          <circle cx="12" cy="20" r="2" fill="#ef4444"/>
          <circle cx="18" cy="22" r="2" fill="#ef4444"/>
          <circle cx="16" cy="16" r="1.5" fill="#ef4444"/>
          <ellipse cx="14" cy="24" rx="1.5" ry="1" fill="#22c55e"/>
          <ellipse cx="20" cy="18" rx="1" ry="1.5" fill="#22c55e"/>
        </svg>
      )
    default:
      return null
  }
}

// Trash truck SVG component
function TrashTruck({ freedMemory, isVisible }: { freedMemory: number; isVisible: boolean }) {
  return (
    <motion.div
      className="absolute bottom-4 right-0 pointer-events-none"
      initial={{ x: 200, opacity: 0 }}
      animate={isVisible ? { x: 0, opacity: 1 } : { x: 200, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="relative">
        <svg width="120" height="80" viewBox="0 0 120 80" className="drop-shadow-lg">
          {/* Truck body */}
          <rect x="20" y="20" width="70" height="40" rx="4" fill="#4a5568" stroke="#2d3748" strokeWidth="2"/>
          {/* Trash compartment */}
          <rect x="25" y="25" width="60" height="30" rx="2" fill="#2d3748"/>
          {/* Cab */}
          <rect x="90" y="30" width="25" height="30" rx="3" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
          <rect x="95" y="35" width="15" height="10" rx="1" fill="#86efac"/>
          {/* Wheels */}
          <circle cx="35" cy="60" r="10" fill="#1f2937" stroke="#0f172a" strokeWidth="2"/>
          <circle cx="35" cy="60" r="4" fill="#4a5568"/>
          <circle cx="80" cy="60" r="10" fill="#1f2937" stroke="#0f172a" strokeWidth="2"/>
          <circle cx="80" cy="60" r="4" fill="#4a5568"/>
          {/* Recycling symbol */}
          <text x="55" y="45" textAnchor="middle" fill="#22c55e" fontSize="16">♻</text>
        </svg>
        {/* Freed memory badge */}
        {freedMemory > 0 && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-lg"
          >
            +{freedMemory} freed
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Dumpster SVG for sweep target
function Dumpster() {
  return (
    <svg width="60" height="50" viewBox="0 0 60 50" className="drop-shadow-md">
      <rect x="5" y="15" width="50" height="30" rx="2" fill="#4a5568" stroke="#2d3748" strokeWidth="2"/>
      <rect x="8" y="18" width="44" height="24" fill="#374151"/>
      <rect x="5" y="10" width="50" height="8" rx="1" fill="#6b7280" stroke="#4b5563" strokeWidth="1"/>
      <rect x="15" y="5" width="8" height="8" rx="1" fill="#6b7280"/>
      <rect x="37" y="5" width="8" height="8" rx="1" fill="#6b7280"/>
    </svg>
  )
}

export function GCSimulator() {
  const [step, setStep] = useState<GCStep>('initial')
  const [heap, setHeap] = useState(initialHeap)
  const [flyingItems, setFlyingItems] = useState<string[]>([])
  const { ref } = useInView(0.1)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

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

    // Animate items flying to dumpster one by one
    unreachableIds.forEach((id, index) => {
      setTimeout(() => {
        setFlyingItems(prev => [...prev, id])
      }, index * 300)
    })

    // Remove items after animation
    timeoutRef.current = setTimeout(() => {
      setHeap(prev => prev.filter(o => reachableIds.has(o.id)))
      setFlyingItems([])
      setStep('done')
    }, unreachableIds.length * 300 + 600)
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
          {step === 'mark' && 'Traced from root. Glowing = reachable, faded = garbage.'}
          {step === 'sweep' && 'Taking out the trash...'}
          {step === 'done' && `Freed ${freedMemory} units of memory!`}
        </span>
      </div>

      {/* Heap visualization - larger "yard" layout */}
      <div 
        ref={containerRef}
        className="relative w-full bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-xl overflow-hidden border border-[var(--text-muted)]/10"
        style={{ aspectRatio: '16/10', minHeight: '320px', maxHeight: '450px' }}
      >
        {/* Ground gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#2d4a3e]/30 to-transparent" />
        
        {/* Stars/particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
              }}
              animate={prefersReducedMotion ? {} : {
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Reference lines (ownership chains) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {heap.map(obj =>
            obj.refs.map(refId => {
              const fromPos = positions[obj.id]
              const toPos = positions[refId]
              if (!fromPos || !toPos) return null
              
              const toObj = heap.find(o => o.id === refId)
              if (!toObj) return null

              const isReachable = reachableIds.has(obj.id) && reachableIds.has(refId)
              const lineOpacity = step === 'initial' ? 0.3 : isReachable ? 0.6 : 0.15

              return (
                <motion.line
                  key={`${obj.id}-${refId}`}
                  x1={`${fromPos.x}%`}
                  y1={`${fromPos.y}%`}
                  x2={`${toPos.x}%`}
                  y2={`${toPos.y}%`}
                  stroke={isReachable && step !== 'initial' ? '#22c55e' : '#a3a3a3'}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: lineOpacity }}
                  transition={{ duration: 0.3 }}
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
                        x: '200%',
                        y: '100%',
                        scale: 0,
                        opacity: 0,
                        rotate: 360,
                      }
                    : { 
                        scale: 1, 
                        opacity: isGarbage ? 0.5 : 1,
                        y: prefersReducedMotion ? 0 : [0, -3, 0],
                      }
                }
                exit={{ scale: 0, opacity: 0 }}
                transition={
                  isFlying
                    ? { duration: 0.5, ease: 'easeIn' }
                    : { 
                        duration: 2,
                        repeat: prefersReducedMotion ? 0 : Infinity,
                        ease: 'easeInOut',
                      }
                }
              >
                {/* Glow effect for marked items */}
                {isMarked && (
                  <motion.div
                    className="absolute inset-0 -m-2 rounded-full bg-emerald-500/30 blur-md"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                {/* Warning X for garbage */}
                {isGarbage && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    ✕
                  </motion.div>
                )}

                {/* Object icon */}
                <div className={cn(
                  'relative transition-all duration-300',
                  isGarbage && 'grayscale'
                )}>
                  <ObjectIcon type={obj.type} size={obj.type === 'root' ? 44 : 36} />
                </div>

                {/* Label */}
                <span className={cn(
                  'mt-1 text-xs font-mono px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm transition-colors duration-300',
                  isMarked && 'text-emerald-400',
                  isGarbage && 'text-red-400/70',
                  !isMarked && !isGarbage && 'text-[var(--text-muted)]'
                )}>
                  {obj.name}
                </span>

                {/* Size indicator */}
                <span className="text-[10px] text-[var(--text-muted)]/60 font-mono">
                  {obj.size}u
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Dumpster target area */}
        <div className="absolute bottom-2 right-4 flex flex-col items-center">
          <Dumpster />
          {step === 'sweep' && (
            <motion.span 
              className="text-xs text-[var(--text-muted)] mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              🗑️ Trash goes here
            </motion.span>
          )}
        </div>

        {/* Trash truck (appears when done) */}
        <TrashTruck freedMemory={freedMemory} isVisible={step === 'done'} />

        {/* Legend */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
            <div className="w-3 h-3 rounded-full bg-emerald-500/50 border border-emerald-400" />
            <span className="text-emerald-400">Reachable</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
            <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-400/50" />
            <span className="text-red-400/80">Garbage</span>
          </div>
        </div>
      </div>

      {/* Memory stats */}
      <div className="flex flex-wrap items-center gap-4 font-mono text-sm text-[var(--text-muted)]">
        <span>Total: {totalMemory}u</span>
        <span>•</span>
        <span>In use: {step === 'done' ? totalMemory - freedMemory : totalMemory - (step !== 'initial' ? freedMemory : 0)}u</span>
        <span>•</span>
        {step === 'done' ? (
          <span className="text-emerald-400 font-semibold">Freed: {freedMemory}u ✓</span>
        ) : (
          <span className={step !== 'initial' ? 'text-red-400/80' : ''}>
            Garbage: {step !== 'initial' ? freedMemory : '?'}u
          </span>
        )}
      </div>
    </div>
  )
}
