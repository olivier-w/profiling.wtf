import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useInView } from '../../hooks/useInView'

export function ThermalThrottleDemo() {
  const [isRunning, setIsRunning] = useState(false)
  const [performance, setPerformance] = useState(100)
  const [elapsed, setElapsed] = useState(0)
  const [hasRun, setHasRun] = useState(false)
  
  const { ref, isInView } = useInView(0.1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Throttling simulation curve - drops faster initially, then stabilizes
  const getThrottledPerformance = (seconds: number): number => {
    if (seconds < 3) return 100
    if (seconds < 6) return 100 - ((seconds - 3) * 8) // Drops to ~76%
    if (seconds < 10) return 76 - ((seconds - 6) * 3) // Drops to ~64%
    return Math.max(62, 64 - ((seconds - 10) * 0.5)) // Stabilizes around 62-64%
  }

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 0.1
        setPerformance(getThrottledPerformance(next))
        
        // Auto-stop after 15 seconds
        if (next >= 15) {
          setIsRunning(false)
          setHasRun(true)
        }
        
        return next
      })
    }, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const handleStart = () => {
    setPerformance(100)
    setElapsed(0)
    setIsRunning(true)
    setHasRun(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setPerformance(100)
    setElapsed(0)
    setHasRun(false)
  }

  // Color based on performance
  const getColor = (perf: number) => {
    if (perf > 85) return 'var(--text)'
    if (perf > 70) return 'var(--flame-2)'
    return 'var(--accent)'
  }

  const getBarGradient = (perf: number) => {
    if (perf > 85) return 'linear-gradient(90deg, var(--text) 0%, var(--text-muted) 100%)'
    if (perf > 70) return 'linear-gradient(90deg, var(--flame-2) 0%, var(--accent) 100%)'
    return 'linear-gradient(90deg, var(--accent) 0%, var(--flame-5) 100%)'
  }

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className="rounded-lg border border-[var(--surface)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--text-muted)]">
          Under sustained CPU load, mobile devices throttle to prevent overheating. 
          Performance can drop 30-40% after just 10-15 seconds of heavy work. 
          Your profile on a cool device may not match production conditions.
        </p>
      </div>
    )
  }

  return (
    <div ref={ref} className="rounded-lg border border-[var(--surface)] bg-[var(--surface)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h4 className="text-lg text-[var(--text)]">Sustained Load Test</h4>
          <p className="text-sm text-[var(--text-muted)]">Watch performance degrade over time</p>
        </div>
        <div className="flex gap-2">
          {!isRunning && !hasRun && (
            <button onClick={handleStart} className="btn btn-active">
              Start Load
            </button>
          )}
          {isRunning && (
            <button onClick={() => setIsRunning(false)} className="btn">
              Stop
            </button>
          )}
          {hasRun && (
            <button onClick={handleReset} className="btn">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Performance meter */}
      <div className="mb-4">
        <div className="mb-2 flex items-end justify-between">
          <span className="text-sm text-[var(--text-muted)]">CPU Performance</span>
          <motion.span 
            className="font-mono text-3xl tabular-nums"
            style={{ color: getColor(performance) }}
            animate={{ scale: performance < 80 && isRunning ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isRunning && performance < 80 ? Infinity : 0 }}
          >
            {performance.toFixed(0)}%
          </motion.span>
        </div>
        
        <div className="relative h-6 overflow-hidden rounded-full bg-[var(--bg)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: getBarGradient(performance) }}
            animate={{ width: `${performance}%` }}
            transition={{ duration: 0.15, ease: 'linear' }}
          />
          
          {/* Heat shimmer effect when throttling */}
          <AnimatePresence>
            {isRunning && performance < 80 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <div className="mb-1 flex justify-between text-xs text-[var(--text-muted)]">
          <span>0s</span>
          <span>15s</span>
        </div>
        <div className="relative h-2 rounded-full bg-[var(--bg)]">
          <motion.div
            className="h-full rounded-full bg-[var(--text-muted)]"
            animate={{ width: `${(elapsed / 15) * 100}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-[var(--text-muted)]">Elapsed: {elapsed.toFixed(1)}s</span>
          {elapsed >= 3 && (
            <motion.span 
              className="text-[var(--accent)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Throttling active
            </motion.span>
          )}
        </div>
      </div>

      {/* Status messages */}
      <AnimatePresence mode="wait">
        {!isRunning && !hasRun && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-[var(--bg)] p-4 text-center"
          >
            <p className="text-sm text-[var(--text-muted)]">
              Click "Start Load" to simulate sustained CPU usage
            </p>
          </motion.div>
        )}
        
        {isRunning && elapsed < 3 && (
          <motion.div
            key="starting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-[var(--bg)] p-4 text-center"
          >
            <p className="text-sm text-[var(--text-muted)]">
              Running at full speed... device is heating up
            </p>
          </motion.div>
        )}
        
        {isRunning && elapsed >= 3 && elapsed < 10 && (
          <motion.div
            key="throttling"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4 text-center"
          >
            <p className="text-sm text-[var(--accent)]">
              Thermal throttling engaged—CPU slowing down to prevent overheating
            </p>
          </motion.div>
        )}
        
        {isRunning && elapsed >= 10 && (
          <motion.div
            key="stabilized"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4 text-center"
          >
            <p className="text-sm text-[var(--accent)]">
              Performance stabilized at ~{performance.toFixed(0)}%—this is your new baseline
            </p>
          </motion.div>
        )}
        
        {hasRun && !isRunning && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4"
          >
            <p className="text-sm text-[var(--text)]">
              <span className="font-medium">Same code. {(100 - performance).toFixed(0)}% slower.</span>
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              The device protected itself from overheating. Your profile on a cool phone 
              at your desk may not match a user's phone that's been gaming for an hour.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
