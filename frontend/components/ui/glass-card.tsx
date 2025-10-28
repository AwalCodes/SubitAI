'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { scaleIn } from '@/lib/animations'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
  glow?: boolean
}

export function GlassCard({ 
  children, 
  className, 
  hover = true, 
  glow = false,
  ...props 
}: GlassCardProps) {
  // Separate motion props from HTML props
  const { onClick, onMouseEnter, onMouseLeave, ...restProps } = props
  
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'relative overflow-hidden rounded-lg border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-glass transition-all duration-300',
        hover && 'hover:shadow-glass-hover hover:border-neutral-300',
        glow && 'hover:shadow-glow',
        className
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10" {...restProps}>
        {children}
      </div>
    </motion.div>
  )
}
