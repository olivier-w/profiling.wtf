import { motion } from 'framer-motion'

interface ToggleProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export default function Toggle({ options, value, onChange }: ToggleProps) {
  return (
    <div className="toggle-group">
      {options.map((option) => (
        <button
          key={option.value}
          className={`toggle-option ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {value === option.value && (
            <motion.div
              className="toggle-indicator"
              layoutId="toggle-indicator"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="toggle-label">{option.label}</span>
        </button>
      ))}

      <style>{`
        .toggle-group {
          display: inline-flex;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-lg);
          padding: var(--space-1);
          gap: var(--space-1);
        }

        .toggle-option {
          position: relative;
          padding: var(--space-2) var(--space-4);
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: color var(--transition-fast);
        }

        .toggle-option:hover {
          color: var(--color-text-primary);
        }

        .toggle-option.active {
          color: var(--color-text-primary);
        }

        .toggle-indicator {
          position: absolute;
          inset: 0;
          background: var(--color-bg-elevated);
          border-radius: var(--radius-md);
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
