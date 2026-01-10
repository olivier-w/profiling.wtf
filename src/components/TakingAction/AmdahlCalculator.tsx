import { useState, useMemo } from 'react'
import { cn } from '../../lib/cn'

export function AmdahlCalculator() {
  const [runtimePercent, setRuntimePercent] = useState(40)  // % of runtime this function takes
  const [speedupFactor, setSpeedupFactor] = useState(2)     // How much faster we can make it

  // Amdahl's Law: S = 1 / ((1 - P) + P/N)
  // Where P = portion affected, N = speedup of that portion
  const totalSpeedup = useMemo(() => {
    const p = runtimePercent / 100
    const n = speedupFactor
    return 1 / ((1 - p) + p / n)
  }, [runtimePercent, speedupFactor])

  const percentImprovement = ((totalSpeedup - 1) / 1) * 100
  
  // Calculate new runtime as percentage of original
  const newRuntimePercent = (1 / totalSpeedup) * 100

  return (
    <div className="space-y-6">
      {/* Sliders */}
      <div className="space-y-4">
        {/* Runtime percentage slider */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="runtime-slider" className="text-sm text-[var(--text-muted)]">
              This function is <span className="text-[var(--accent)] tabular-nums">{runtimePercent}%</span> of total runtime
            </label>
          </div>
          <input
            id="runtime-slider"
            type="range"
            min={1}
            max={100}
            value={runtimePercent}
            onChange={(e) => setRuntimePercent(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="mt-1 flex justify-between text-xs text-[var(--text-muted)]">
            <span>1%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Speedup factor slider */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="speedup-slider" className="text-sm text-[var(--text-muted)]">
              I can make it <span className="text-[var(--accent)] tabular-nums">{speedupFactor}x</span> faster
            </label>
          </div>
          <input
            id="speedup-slider"
            type="range"
            min={1.5}
            max={100}
            step={0.5}
            value={speedupFactor}
            onChange={(e) => setSpeedupFactor(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="mt-1 flex justify-between text-xs text-[var(--text-muted)]">
            <span>1.5x</span>
            <span>100x</span>
          </div>
        </div>
      </div>

      {/* Visual bar comparison */}
      <div className="space-y-3">
        <div>
          <p className="mb-1 text-sm text-[var(--text-muted)]">Before</p>
          <div className="h-8 w-full rounded bg-[var(--surface-hover)]">
            <div 
              className="flex h-full items-center rounded-l bg-[var(--flame-3)] px-2 text-xs text-[var(--bg)]"
              style={{ width: '100%' }}
            >
              100% runtime
            </div>
          </div>
        </div>
        
        <div>
          <p className="mb-1 text-sm text-[var(--text-muted)]">After</p>
          <div className="h-8 w-full rounded bg-[var(--surface-hover)]">
            <div 
              className={cn(
                'flex h-full items-center rounded-l px-2 text-xs',
                newRuntimePercent < 50 ? 'bg-green-500 text-white' : 'bg-[var(--flame-2)] text-[var(--bg)]'
              )}
              style={{ width: `${newRuntimePercent}%` }}
            >
              {newRuntimePercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4 text-center">
        <p className="text-sm text-[var(--text-muted)]">Maximum possible total speedup</p>
        <p className="mt-1 text-3xl font-medium tabular-nums text-[var(--accent)]">
          {totalSpeedup.toFixed(2)}x
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          ({percentImprovement.toFixed(1)}% faster overall)
        </p>
      </div>

      {/* Reality check examples */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--text)]">Reality check:</p>
        <div className="grid gap-2 text-sm">
          <div className={cn(
            'flex items-center justify-between rounded-lg border p-2.5 transition-colors',
            runtimePercent <= 5 ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[var(--surface)]'
          )}>
            <span className="text-[var(--text-muted)]">10x speedup on 5% of runtime</span>
            <span className="tabular-nums text-[var(--text)]">→ 4.7% total improvement</span>
          </div>
          <div className={cn(
            'flex items-center justify-between rounded-lg border p-2.5 transition-colors',
            runtimePercent >= 40 && runtimePercent <= 50 ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[var(--surface)]'
          )}>
            <span className="text-[var(--text-muted)]">2x speedup on 50% of runtime</span>
            <span className="tabular-nums text-[var(--text)]">→ 33% total improvement</span>
          </div>
          <div className={cn(
            'flex items-center justify-between rounded-lg border p-2.5 transition-colors',
            runtimePercent >= 80 ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[var(--surface)]'
          )}>
            <span className="text-[var(--text-muted)]">2x speedup on 90% of runtime</span>
            <span className="tabular-nums text-[var(--text)]">→ 82% total improvement</span>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">✓</span>
          <p className="text-[var(--text)]">
            <strong className="text-green-400">The lesson:</strong> Focus on the biggest contributors first. 
            A modest improvement to a hot function beats a huge improvement to a cold one.
          </p>
        </div>
      </div>
    </div>
  )
}
