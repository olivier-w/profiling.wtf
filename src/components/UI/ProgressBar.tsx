import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error'
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  label,
  showPercentage = true,
  color = 'primary'
}: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100)

  const colorMap = {
    primary: 'var(--color-accent-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)'
  }

  return (
    <div className="progress-container">
      {(label || showPercentage) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showPercentage && (
            <span className="progress-percentage">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className="progress-track">
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ background: colorMap[color] }}
        />
      </div>

      <style>{`
        .progress-container {
          width: 100%;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .progress-label {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }

        .progress-percentage {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-text-primary);
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: var(--color-bg-elevated);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: var(--radius-full);
        }
      `}</style>
    </div>
  )
}
