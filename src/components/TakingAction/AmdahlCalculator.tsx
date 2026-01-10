import { useState, useMemo } from 'react'
import { cn } from '../../lib/cn'

export function AmdahlCalculator() {
  const [runtimePercent, setRuntimePercent] = useState(40)
  const [speedupFactor, setSpeedupFactor] = useState(2)

  // Amdahl's Law: S = 1 / ((1 - P) + P/N)
  const totalSpeedup = useMemo(() => {
    const p = runtimePercent / 100
    const n = speedupFactor
    return 1 / ((1 - p) + p / n)
  }, [runtimePercent, speedupFactor])

  const percentImprovement = ((totalSpeedup - 1) / 1) * 100
  const newRuntimePercent = (1 / totalSpeedup) * 100

  return (
    <div className="space-y-8">
      {/* Sliders */}
      <div className="space-y-6">
        <div>
          <label htmlFor="runtime-slider" className="block text-[var(--text-muted)]">
            This function is <span className="tabular-nums text-[var(--text)]">{runtimePercent}%</span> of total runtime
          </label>
          <input
            id="runtime-slider"
            type="range"
            min={1}
            max={100}
            value={runtimePercent}
            onChange={(e) => setRuntimePercent(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--accent)]"
          />
        </div>

        <div>
          <label htmlFor="speedup-slider" className="block text-[var(--text-muted)]">
            I can make it <span className="tabular-nums text-[var(--text)]">{speedupFactor}x</span> faster
          </label>
          <input
            id="speedup-slider"
            type="range"
            min={1.5}
            max={100}
            step={0.5}
            value={speedupFactor}
            onChange={(e) => setSpeedupFactor(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--accent)]"
          />
        </div>
      </div>

      {/* Visual bar comparison */}
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-[var(--text-muted)]">Before</p>
          <div className="h-6 w-full rounded bg-[var(--flame-3)]" />
        </div>
        
        <div>
          <p className="mb-2 text-sm text-[var(--text-muted)]">After</p>
          <div className="h-6 w-full rounded bg-[var(--surface)]">
            <div 
              className={cn(
                'h-full rounded',
                newRuntimePercent < 50 ? 'bg-emerald-500' : 'bg-[var(--flame-2)]'
              )}
              style={{ width: `${newRuntimePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="text-center">
        <p className="text-sm text-[var(--text-muted)]">Maximum possible total speedup</p>
        <p className="mt-1 text-4xl tabular-nums text-[var(--accent)]" style={{ fontFamily: 'var(--font-display)' }}>
          {totalSpeedup.toFixed(2)}x
        </p>
        <p className="mt-1 text-[var(--text-muted)]">
          {percentImprovement.toFixed(1)}% faster overall
        </p>
      </div>

      {/* Reality check examples */}
      <div className="space-y-2 text-sm">
        <p className="text-[var(--text)]">Reality check:</p>
        <div className="space-y-1 font-mono text-[var(--text-muted)]">
          <p className={runtimePercent <= 5 ? 'text-[var(--accent)]' : ''}>
            10x speedup on 5% of runtime → 4.7% total improvement
          </p>
          <p className={runtimePercent >= 40 && runtimePercent <= 50 ? 'text-[var(--accent)]' : ''}>
            2x speedup on 50% of runtime → 33% total improvement
          </p>
          <p className={runtimePercent >= 80 ? 'text-[var(--accent)]' : ''}>
            2x speedup on 90% of runtime → 82% total improvement
          </p>
        </div>
      </div>

      {/* Key insight */}
      <p className="text-[var(--text-muted)]">
        <span className="text-[var(--text)]">The lesson:</span> Focus on the biggest contributors first. 
        A modest improvement to a hot function beats a huge improvement to a cold one.
      </p>
    </div>
  )
}
