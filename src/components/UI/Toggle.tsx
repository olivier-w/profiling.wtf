import { motion, useReducedMotion } from 'framer-motion'

interface ToggleProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  'aria-label'?: string
}

export default function Toggle({ options, value, onChange, 'aria-label': ariaLabel }: ToggleProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="toggle-group" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            className={`toggle-option ${isActive ? 'active' : ''}`}
            onClick={() => onChange(option.value)}
            role="radio"
            aria-checked={isActive}
          >
            {isActive && (
              <motion.div
                className="toggle-indicator"
                layoutId="toggle-indicator"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 500, damping: 30 }
                }
              />
            )}
            <span className="toggle-label">{option.label}</span>
          </button>
        )
      })}

      <style>{`
        .toggle-group {
          display: inline-flex;
          background: var(--surface);
          border-radius: 0.5rem;
          padding: 0.25rem;
          gap: 0.25rem;
        }

        .toggle-option {
          position: relative;
          padding: 0.5rem 1rem;
          min-height: 44px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 0.375rem;
          touch-action: manipulation;
          transition: color var(--duration-fast) var(--ease-out);
        }

        /* Only apply hover on devices that support it */
        @media (hover: hover) and (pointer: fine) {
          .toggle-option:hover {
            color: var(--text);
          }
        }

        .toggle-option.active {
          color: var(--text);
        }

        .toggle-indicator {
          position: absolute;
          inset: 0;
          background: #1f1f1f;
          border-radius: 0.375rem;
          z-index: 0;
        }

        .toggle-label {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  )
}
