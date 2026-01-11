import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../lib/cn'
import { rawSamples, foldedSamples, sortedSamples } from '../lib/flameGraphData'

type Step = 'raw' | 'fold' | 'sort' | 'build'

const steps: { id: Step; label: string; description: string }[] = [
  { id: 'raw', label: 'Raw Samples', description: 'The profiler captured these 8 stack traces' },
  { id: 'fold', label: 'Fold', description: 'Identical stacks merged with counts' },
  { id: 'sort', label: 'Sort', description: 'Siblings sorted alphabetically at each level' },
  { id: 'build', label: 'Build', description: 'Stacks visualized as nested rectangles' },
]

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
        <div style={{ width: `${(1 / total) * 100}%` }} />
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
      
      <p className="mt-4 text-sm text-[var(--text-muted)]">
        Width = sample count. <span className="font-mono text-[var(--accent)]">parseJSON</span> was sampled 4 times (50%)
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

  return (
    <div>
      {/* Step tabs */}
      <div className="mb-6 flex flex-wrap gap-6 text-sm">
        {steps.map((step, i) => {
          const isCurrent = step.id === currentStep
          const isClickable = i <= currentStepIndex + 1
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && setCurrentStep(step.id)}
              disabled={!isClickable}
              className={cn('btn', isCurrent && 'btn-active')}
            >
              <span className={cn('mr-1.5 font-mono text-xs', isCurrent ? 'text-[var(--bg)]/70' : 'text-[var(--text-muted)]')}>{i + 1}.</span>
              {step.label}
            </button>
          )
        })}
      </div>

      {/* Step description */}
      <p className="mb-6 text-[var(--text-muted)]">
        {steps.find(s => s.id === currentStep)?.description}
      </p>

      {/* Step content */}
      <div className="min-h-[280px]">
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
                <div key={i} className="text-[var(--text-muted)]">
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
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">{item.stack}</span>
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
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">{item.stack}</span>
                    <span className="tabular-nums text-[var(--accent)]">{item.count}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                <span className="text-[var(--text)]">Why alphabetical?</span> Sorting alphabetically means the same function always appears in the same horizontal position—that's why the X-axis isn't time.
              </p>
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
    </div>
  )
}
