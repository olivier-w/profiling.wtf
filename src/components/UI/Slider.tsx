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
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="slider-container">
      {label && (
        <div className="slider-header">
          <label className="slider-label">{label}</label>
          {showValue && (
            <span className="slider-value">{formatValue(value)}</span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={{
          background: `linear-gradient(to right, var(--color-accent-primary) 0%, var(--color-accent-primary) ${percentage}%, var(--color-bg-elevated) ${percentage}%, var(--color-bg-elevated) 100%)`
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
          margin-bottom: var(--space-2);
        }

        .slider-label {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }

        .slider-value {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-accent-primary);
        }

        .slider {
          width: 100%;
          height: 6px;
          border-radius: var(--radius-full);
          appearance: none;
          cursor: pointer;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-accent-primary);
          cursor: pointer;
          border: 2px solid var(--color-bg-primary);
          box-shadow: 0 0 0 2px var(--color-accent-primary);
          transition: transform var(--transition-fast);
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-accent-primary);
          cursor: pointer;
          border: 2px solid var(--color-bg-primary);
        }
      `}</style>
    </div>
  )
}
