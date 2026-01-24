import { useId } from 'react'

interface SliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  label?: string
  showValue?: boolean
  formatValue?: (value: number) => string
}

export default function Slider({
  min,
  max,
  value,
  onChange,
  label,
  showValue = true,
  formatValue = (v) => String(v)
}: SliderProps) {
  const id = useId()
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="slider-container">
      {label && (
        <div className="slider-header">
          <label htmlFor={id} className="slider-label">{label}</label>
          {showValue && (
            <span className="slider-value" aria-live="polite">{formatValue(value)}</span>
          )}
        </div>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percentage}%, var(--surface) ${percentage}%, var(--surface) 100%)`
        }}
      />

      <style>{`
        .slider-container {
          width: 100%;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .slider-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .slider-value {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          font-variant-numeric: tabular-nums;
          color: var(--accent);
        }

        .slider {
          width: 100%;
          height: 8px;
          border-radius: 9999px;
          appearance: none;
          cursor: pointer;
          touch-action: manipulation;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid var(--bg);
          box-shadow: 0 0 0 2px var(--accent);
          transition: transform var(--duration-fast) var(--ease-out);
        }

        /* Only apply hover on devices that support it */
        @media (hover: hover) and (pointer: fine) {
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid var(--bg);
        }
      `}</style>
    </div>
  )
}
