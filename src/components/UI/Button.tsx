import { ButtonHTMLAttributes, ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'error'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  isLoading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  // Check if device supports hover (non-touch)
  const [canHover, setCanHover] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    setCanHover(mediaQuery.matches)
  }, [])

  const isDisabled = disabled || isLoading

  return (
    <motion.button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={isDisabled}
      whileHover={canHover && !isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
      {...props}
    >
      {isLoading ? (
        <span className="btn-spinner" aria-label="Loading" />
      ) : (
        children
      )}

      <style>{`
        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .btn-spinner {
            animation: none;
            border-color: currentColor;
            border-top-color: transparent;
          }
        }
      `}</style>
    </motion.button>
  )
}
