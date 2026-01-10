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

  // Check for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return

    const interval = setInterval(() => {
      // Trigger tick animation
      setIsTicking(true)
      setTimeout(() => setIsTicking(false), 200)

      // Capture sample
      const sample = stackStates[stackIndex].join(';')
      setSamples(prev => {
        const next = [...prev, sample]
        // Keep last 6 samples
        return next.slice(-6)
      })

      // Move to next stack state
      setStackIndex(prev => (prev + 1) % stackStates.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [stackIndex, isPaused, prefersReducedMotion])

  // Show static state for reduced motion
  if (prefersReducedMotion) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-6">
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          Animation paused (prefers-reduced-motion). Here's a snapshot of sampling:
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--text-muted)]">Current Stack</h3>
            <div className="space-y-1 font-mono text-sm">
              {stackStates[0].map((frame, i) => (
                <div key={i} className="rounded bg-[var(--surface-hover)] px-3 py-1.5">
                  {frame}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--text-muted)]">Captured Samples</h3>
            <div className="space-y-1 font-mono text-xs">
              {stackStates.slice(0, 4).map((stack, i) => (
                <div key={i} className="rounded bg-[var(--surface-hover)] px-2 py-1 text-[var(--text-muted)]">
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
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              isTicking ? 'bg-[var(--accent)]' : 'bg-[var(--surface-hover)]'
            )}
            animate={isTicking ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <span className="text-sm text-[var(--text-muted)]">
            Profiler sampling at ~1.5s intervals
          </span>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="rounded px-3 py-1 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label={isPaused ? 'Resume animation' : 'Pause animation'}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Program Running */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-[var(--text-muted)]">Program Running</h3>
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
                      : 'bg-[var(--surface-hover)]'
                  )}
                >
                  {frame}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            ↑ Stack grows upward. Highlighted = currently executing.
          </p>
        </div>

        {/* Right: Profiler Samples */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-[var(--text-muted)]">Profiler Samples</h3>
          <div className="min-h-[180px] space-y-1">
            <AnimatePresence mode="popLayout">
              {samples.map((sample, i) => (
                <motion.div
                  key={`${sample}-${i}-${samples.length}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="rounded bg-[var(--surface-hover)] px-2 py-1 font-mono text-xs text-[var(--text-muted)]"
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
