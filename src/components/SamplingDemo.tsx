import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../lib/cn'

const stackStates = [
  ['main', 'handleRequest', 'processData', 'parseJSON'],
  ['main', 'handleRequest', 'processData', 'parseJSON'],
  ['main', 'handleRequest', 'processData', 'validate'],
  ['main', 'handleRequest', 'processData', 'transform'],
  ['main', 'handleRequest', 'processData', 'parseJSON'],
  ['main', 'handleRequest', 'log'],
  ['main', 'handleRequest', 'processData', 'validate'],
  ['main', 'handleRequest', 'processData', 'parseJSON'],
]

export function SamplingDemo() {
  const [stackIndex, setStackIndex] = useState(0)
  const [samples, setSamples] = useState<string[]>([])
  const [isTicking, setIsTicking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const currentStack = stackStates[stackIndex]

  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return

    const interval = setInterval(() => {
      setIsTicking(true)
      setTimeout(() => setIsTicking(false), 200)

      const sample = stackStates[stackIndex].join(';')
      setSamples(prev => {
        const next = [...prev, sample]
        return next.slice(-6)
      })

      setStackIndex(prev => (prev + 1) % stackStates.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [stackIndex, isPaused, prefersReducedMotion])

  if (prefersReducedMotion) {
    return (
      <div>
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          Animation paused (prefers-reduced-motion). Here's a snapshot of sampling:
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm text-[var(--text-muted)]">Current Stack</p>
            <div className="space-y-1 font-mono text-sm">
              {stackStates[0].map((frame, i) => (
                <div key={i} className="rounded bg-[var(--surface)] px-3 py-1.5">
                  {frame}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm text-[var(--text-muted)]">Captured Samples</p>
            <div className="space-y-1 font-mono text-xs">
              {stackStates.slice(0, 4).map((stack, i) => (
                <div key={i} className="text-[var(--text-muted)]">
                  {stack.join(';')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn(
            'inline-block h-2 w-2 rounded-full transition-colors',
            isTicking ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]'
          )} />
          <span className="text-sm text-[var(--text-muted)]">
            Sampling at ~1.5s intervals
          </span>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-sm text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text)]"
          aria-label={isPaused ? 'Resume animation' : 'Pause animation'}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: Program Running */}
        <div>
          <p className="mb-3 text-sm text-[var(--text-muted)]">Program Running</p>
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {currentStack.map((frame, i) => (
                <motion.div
                  key={`${frame}-${i}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className={cn(
                    'rounded px-3 py-1.5 font-mono text-sm',
                    i === currentStack.length - 1
                      ? 'bg-[var(--accent)] text-[var(--bg)]'
                      : 'bg-[var(--surface)]'
                  )}
                >
                  {frame}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Stack grows upward. Highlighted = currently executing.
          </p>
        </div>

        {/* Right: Profiler Samples */}
        <div>
          <p className="mb-3 text-sm text-[var(--text-muted)]">Profiler Samples</p>
          <div className="min-h-[180px] space-y-1">
            <AnimatePresence mode="popLayout">
              {samples.map((sample, i) => (
                <motion.div
                  key={`${sample}-${i}-${samples.length}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="font-mono text-xs text-[var(--text-muted)]"
                >
                  {sample}
                </motion.div>
              ))}
            </AnimatePresence>
            {samples.length === 0 && (
              <p className="text-xs text-[var(--text-muted)]">
                Waiting for first sample...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
