import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../lib/cn'
import { rawSamples, foldedSamples, sortedSamples } from '../lib/flameGraphData'

type Step = 'raw' | 'fold' | 'sort' | 'build'

const steps: { id: Step; label: string; description: string }[] = [
  { id: 'raw', label: '1. Raw Samples', description: 'The profiler captured these 8 stack traces' },
  { id: 'fold', label: '2. Fold', description: 'Identical stacks merged with counts' },
  { id: 'sort', label: '3. Sort', description: 'Siblings sorted alphabetically at each level' },
  { id: 'build', label: '4. Build', description: 'Stacks visualized as nested rectangles' },
]

// Simple inline flame graph for the build step
function MiniFlameGraph() {
  const total = 8
  
  return (
    <div className="space-y-1">
      {/* Level 0: main */}
      <div className="h-8 w-full rounded bg-[var(--flame-4)] px-2 py-1 font-mono text-xs text-[var(--bg)]">
        main (8)
      </div>
      
      {/* Level 1: handleRequest */}
      <div className="h-8 w-full rounded bg-[var(--flame-3)] px-2 py-1 font-mono text-xs text-[var(--bg)]">
        handleRequest (8)
      </div>
      
      {/* Level 2: log + processData */}
      <div className="flex gap-1">
        <div 
          className="h-8 rounded bg-[var(--flame-2)] px-2 py-1 font-mono text-xs text-[var(--bg)]"
          style={{ width: `${(1 / total) * 100}%` }}
        >
          log
        </div>
        <div 
          className="h-8 rounded bg-[var(--flame-2)] px-2 py-1 font-mono text-xs text-[var(--bg)]"
          style={{ width: `${(7 / total) * 100}%` }}
        >
          processData (7)
        </div>
      </div>
      
      {/* Level 3: parseJSON, transform, validate */}
      <div className="flex gap-1">
        <div style={{ width: `${(1 / total) * 100}%` }} /> {/* spacer for log */}
        <div className="flex gap-1" style={{ width: `${(7 / total) * 100}%` }}>
          <motion.div 
            className="h-8 rounded bg-[var(--flame-1)] px-1 py-1 font-mono text-xs text-[var(--bg)]"
            style={{ width: `${(4 / 7) * 100}%` }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            parseJSON (4)
          </motion.div>
          <div 
            className="h-8 rounded bg-[var(--flame-1)] px-1 py-1 font-mono text-xs text-[var(--bg)]"
            style={{ width: `${(1 / 7) * 100}%` }}
          />
          <div 
            className="h-8 rounded bg-[var(--flame-1)] px-1 py-1 font-mono text-xs text-[var(--bg)]"
            style={{ width: `${(2 / 7) * 100}%` }}
          >
            validate
          </div>
        </div>
      </div>
      
      <p className="mt-3 text-xs text-[var(--text-muted)]">
        ↑ Width = sample count. <span className="rounded bg-green-500/20 px-1 text-green-400">parseJSON</span> was sampled 4 times (50%)
      </p>
    </div>
  )
}

export function BuildDemo() {
  const [currentStep, setCurrentStep] = useState<Step>('raw')
  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const goToStep = (step: Step) => {
    setCurrentStep(step)
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-6">
      {/* Step buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {steps.map((step, i) => {
          const isCompleted = i < currentStepIndex
          const isCurrent = i === currentStepIndex
          const isNext = i === currentStepIndex + 1
          const isDisabled = i > currentStepIndex + 1
          
          return (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              disabled={isDisabled}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                isCompleted && 'border border-transparent bg-[var(--surface-hover)] text-green-400 hover:bg-[var(--border)]',
                isCurrent && 'border border-transparent bg-[var(--surface-hover)] text-[var(--text)]',
                isNext && 'border border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)]/10',
                isDisabled && 'border border-transparent bg-[var(--surface)] text-[var(--text-muted)] opacity-50'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isCompleted && <span className="mr-1">✓</span>}
              {step.label}
            </button>
          )
        })}
      </div>

      {/* Step description */}
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        {steps.find(s => s.id === currentStep)?.description}
      </p>

      {/* Step content */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {currentStep === 'raw' && (
            <motion.div
              key="raw"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="space-y-1 font-mono text-sm"
            >
              {rawSamples.map((sample, i) => (
                <div
                  key={i}
                  className="cursor-default rounded bg-[var(--surface-hover)] px-3 py-1.5"
                >
                  {sample}
                </div>
              ))}
            </motion.div>
          )}

          {currentStep === 'fold' && (
            <motion.div
              key="fold"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="space-y-1 font-mono text-sm"
            >
              {foldedSamples.map((item, i) => (
                <div
                  key={i}
                  className="cursor-default flex items-center justify-between rounded bg-[var(--surface-hover)] px-3 py-1.5"
                >
                  <span>{item.stack}</span>
                  <span className="tabular-nums text-[var(--accent)]">{item.count}</span>
                </div>
              ))}
            </motion.div>
          )}

          {currentStep === 'sort' && (
            <motion.div
              key="sort"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="space-y-1 font-mono text-sm">
                {sortedSamples.map((item, i) => (
                  <div
                    key={i}
                    className="cursor-default flex items-center justify-between rounded bg-[var(--surface-hover)] px-3 py-1.5"
                  >
                    <span>{item.stack}</span>
                    <span className="tabular-nums text-[var(--accent)]">{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="cursor-default rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">✓</span>
                  <div>
                    <strong className="text-green-400">Why alphabetical?</strong>
                    <p className="mt-1 text-[var(--text-muted)]">
                      Sorting alphabetically means the SAME function always appears in the same horizontal position — 
                      that's why the X-axis isn't time.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'build' && (
            <motion.div
              key="build"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <MiniFlameGraph />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation hint */}
      {currentStepIndex < steps.length - 1 && (
        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          Click "{steps[currentStepIndex + 1].label}" to continue →
        </p>
      )}
    </div>
  )
}
