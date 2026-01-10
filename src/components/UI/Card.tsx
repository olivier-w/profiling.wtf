import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  highlighted?: boolean
  className?: string
  onClick?: () => void
}

export default function Card({ 
  children, 
  highlighted = false, 
  className = '',
  onClick 
}: CardProps) {
  return (
    <motion.div
      className={`card ${highlighted ? 'card-highlighted' : ''} ${className}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {children}
    </motion.div>
  )
}
