import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useInView } from '../../hooks/useInView'

export function ThermalThrottleDemo() {
  const [isRunning, setIsRunning] = useState(false)
  const [performance, setPerformance] = useState(100)
  const [elapsed, setElapsed] = useState(0)
  const [hasRun, setHasRun] = useState(false)
  
  const { ref } = useInView(0.1)
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

  // Temperature simulation - rises as CPU is stressed
  const getTemperature = (seconds: number): number => {
    if (seconds < 1) return 35
    if (seconds < 3) return 35 + (seconds - 1) * 10 // 35 → 55°C
    if (seconds < 6) return 55 + (seconds - 3) * 5 // 55 → 70°C
    if (seconds < 10) return 70 + (seconds - 6) * 2.5 // 70 → 80°C
    return Math.min(85, 80 + (seconds - 10) * 1) // Caps at 85°C
  }

  const temperature = isRunning || hasRun ? getTemperature(elapsed) : 35

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

  const getTempColor = (temp: number) => {
    if (temp < 50) return 'var(--text)'
    if (temp < 65) return 'var(--flame-2)'
    if (temp < 75) return 'var(--accent)'
    return 'var(--flame-5)'
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

      {/* Dual meters: Performance and Temperature */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        {/* Performance meter */}
        <div>
          <div className="mb-2 flex items-end justify-between">
            <span className="text-xs text-[var(--text-muted)]">CPU Performance</span>
            <motion.span 
              className="font-mono text-2xl tabular-nums"
              style={{ color: getColor(performance) }}
              animate={{ scale: performance < 80 && isRunning ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 0.5, repeat: isRunning && performance < 80 ? Infinity : 0 }}
            >
              {performance.toFixed(0)}%
            </motion.span>
          </div>
          
          <div className="relative h-4 overflow-hidden rounded-full bg-[var(--bg)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: getBarGradient(performance) }}
              animate={{ width: `${performance}%` }}
              transition={{ duration: 0.15, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Temperature meter */}
        <div>
          <div className="mb-2 flex items-end justify-between">
            <span className="text-xs text-[var(--text-muted)]">Device Temp</span>
            <motion.span 
              className="font-mono text-2xl tabular-nums"
              style={{ color: getTempColor(temperature) }}
              animate={{ scale: temperature > 70 && isRunning ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 0.3, repeat: isRunning && temperature > 70 ? Infinity : 0 }}
            >
              {temperature.toFixed(0)}°C
            </motion.span>
          </div>
          
          <div className="relative h-4 overflow-hidden rounded-full bg-[var(--bg)]">
            <motion.div
              className="h-full rounded-full"
              style={{ 
                background: temperature > 70 
                  ? 'linear-gradient(90deg, var(--flame-2) 0%, var(--flame-5) 100%)'
                  : temperature > 50 
                    ? 'linear-gradient(90deg, var(--text) 0%, var(--flame-2) 100%)'
                    : 'var(--text-muted)'
              }}
              animate={{ width: `${((temperature - 30) / 55) * 100}%` }}
              transition={{ duration: 0.15, ease: 'linear' }}
            />
            
            {/* Heat shimmer on temperature bar */}
            <AnimatePresence>
              {isRunning && temperature > 65 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: '100%', opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </AnimatePresence>
          </div>
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
