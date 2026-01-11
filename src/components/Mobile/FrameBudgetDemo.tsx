import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { useInView } from '../../hooks/useInView'

export function FrameBudgetDemo() {
  const [workMs, setWorkMs] = useState(8)
  const [droppedFrames, setDroppedFrames] = useState(0)
  const [lastFrameTime, setLastFrameTime] = useState(0)
  const [fps, setFps] = useState(60)
  const [isRunning, setIsRunning] = useState(true)
  
  const { ref, isInView } = useInView(0.1)
  
  // Refs for animation
  const jankyElRef = useRef<HTMLDivElement>(null)
  const frameTimesRef = useRef<number[]>([])
  const lastTimeRef = useRef(0)
  const startTimeRef = useRef(0)
  const rafIdRef = useRef<number>(0)
  const workMsRef = useRef(workMs)
  
  // Keep workMsRef in sync without restarting animation
  workMsRef.current = workMs
  
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Simulate blocking work
  const simulateWork = useCallback((ms: number) => {
    const start = performance.now()
    while (performance.now() - start < ms) {
      // Intentionally blocking
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (prefersReducedMotion || !isInView || !isRunning) return

    const animate = (time: number) => {
      // Initialize start time on first frame
      if (startTimeRef.current === 0) {
        startTimeRef.current = time
      }
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time
      }
      
      const delta = time - lastTimeRef.current
      lastTimeRef.current = time
      
      // Track frame times for FPS calculation
      frameTimesRef.current.push(delta)
      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift()
      }
      
      // Calculate FPS from recent frames
      const avgDelta = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
      setFps(Math.round(1000 / avgDelta))
      
      // Janky animation - simulate work BEFORE updating position
      const frameStart = performance.now()
      simulateWork(workMsRef.current)
      const frameTime = performance.now() - frameStart
      
      setLastFrameTime(Math.round(frameTime))
      
      // Count dropped frames (anything over 16.6ms budget)
      if (frameTime > 16.6) {
        setDroppedFrames(prev => prev + 1)
      }
      
      // Time-based animation matching the reference ball's 1.5s cycle
      // This ensures smooth animation when work=0, with no discontinuities
      const elapsed = time - startTimeRef.current
      const cycle = 1500 // Match reference ball's 1.5s duration
      const progress = (elapsed % cycle) / cycle
      // Use sine wave: 0 -> 60 -> 0 -> -60 -> 0 but we want 0 -> 60 -> 0
      // So use (1 - cos) / 2 which gives 0 -> 1 -> 0
      const y = (1 - Math.cos(progress * Math.PI * 2)) / 2 * 60
      
      if (jankyElRef.current) {
        jankyElRef.current.style.transform = `translateY(${y}px)`
      }
      
      rafIdRef.current = requestAnimationFrame(animate)
    }

    rafIdRef.current = requestAnimationFrame(animate)
    
    return () => {
      cancelAnimationFrame(rafIdRef.current)
      lastTimeRef.current = 0
    }
  }, [simulateWork, prefersReducedMotion, isInView, isRunning])

  // Reset dropped frames when work changes
  useEffect(() => {
    setDroppedFrames(0)
  }, [workMs])

  const frameTimeColor = lastFrameTime > 16.6 
    ? lastFrameTime > 33 
      ? 'var(--flame-5)' 
      : 'var(--accent)' 
    : 'var(--text)'

  if (prefersReducedMotion) {
    return (
      <div className="rounded-lg border border-[var(--surface)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--text-muted)]">
          Animation paused (prefers-reduced-motion). The key insight: at 60fps, 
          each frame has just 16.6ms. Any work beyond that causes visible stuttering.
        </p>
      </div>
    )
  }

  return (
    <div ref={ref}>
      {/* Side by side animations */}
      <div className="grid grid-cols-2 gap-6">
        {/* Smooth reference */}
        <div className="relative overflow-hidden rounded-lg border border-[var(--surface)] bg-[var(--bg)] p-4">
          <p className="mb-4 text-center text-sm text-[var(--text-muted)]">Reference (CSS)</p>
          <div className="flex h-40 items-center justify-center">
            <motion.div
              className="h-8 w-8 rounded-full bg-[var(--text)]"
              animate={{ y: [0, 60, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-[var(--text-muted)]">Always smooth</p>
        </div>

        {/* Janky with work */}
        <div className="relative overflow-hidden rounded-lg border border-[var(--surface)] bg-[var(--bg)] p-4">
          <p className="mb-4 text-center text-sm text-[var(--text-muted)]">With {workMs}ms work</p>
          <div className="flex h-40 items-center justify-center">
            <div
              ref={jankyElRef}
              className="h-8 w-8 rounded-full"
              style={{ 
                backgroundColor: lastFrameTime > 16.6 ? 'var(--accent)' : 'var(--text)',
                transition: 'background-color 100ms'
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs" style={{ color: frameTimeColor }}>
            {lastFrameTime > 16.6 ? 'Dropping frames!' : 'On budget'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="work-slider" className="text-sm text-[var(--text-muted)]">
            Simulated work per frame
          </label>
          <span className="font-mono text-sm text-[var(--accent)]">{workMs}ms</span>
        </div>
        <input
          id="work-slider"
          type="range"
          min={0}
          max={35}
          value={workMs}
          onChange={(e) => setWorkMs(Number(e.target.value))}
          className="w-full cursor-pointer accent-[var(--accent)]"
          style={{
            height: '8px',
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(workMs / 35) * 100}%, var(--surface) ${(workMs / 35) * 100}%, var(--surface) 100%)`,
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-[var(--surface)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Frame Time</p>
          <p className="font-mono text-xl tabular-nums" style={{ color: frameTimeColor }}>
            {lastFrameTime}ms
          </p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Dropped Frames</p>
          <p className="font-mono text-xl tabular-nums" style={{ color: droppedFrames > 0 ? 'var(--accent)' : 'var(--text)' }}>
            {droppedFrames}
          </p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">FPS</p>
          <p className="font-mono text-xl tabular-nums" style={{ color: fps < 55 ? 'var(--accent)' : 'var(--text)' }}>
            {fps}
          </p>
        </div>
      </div>

      {/* Budget indicator */}
      <div className="mt-6 rounded-lg border border-[var(--surface)] bg-[var(--surface)] p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">Frame budget</span>
          <span className="font-mono text-[var(--text)]">16.6ms</span>
        </div>
        <div className="relative h-3 rounded-full bg-[var(--bg)]">
          {/* Budget line */}
          <div 
            className="absolute top-0 h-full w-px bg-[var(--text-muted)]"
            style={{ left: `${(16.6 / 35) * 100}%` }}
          />
          {/* Current work */}
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{ 
              width: `${(Math.min(workMs, 35) / 35) * 100}%`,
              backgroundColor: workMs > 16.6 ? 'var(--accent)' : 'var(--text)'
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
          <span>0ms</span>
          <span>35ms</span>
        </div>
      </div>

      {/* Insight callout */}
      <div className="mt-6 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4">
        <p className="text-sm text-[var(--text-muted)]">
          <span className="text-[var(--text)]">At 60fps</span>, each frame has 16.6ms. 
          <span className="text-[var(--text)]"> At 120fps</span> (modern phones), just 8.3ms. 
          One slow JSON parse, one large image decode, one complex layout—and users feel it.
        </p>
      </div>

      {/* Pause control */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="btn text-sm"
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
      </div>
    </div>
  )
}
