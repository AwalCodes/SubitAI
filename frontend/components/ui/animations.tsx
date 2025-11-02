'use client'

import { motion } from 'framer-motion'

/**
 * Reusable Framer Motion animation variants for consistent UX
 */

// Fade animations
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }
  }
}

export const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }
  }
}

export const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }
  }
}

export const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }
  }
}

// Scale animations
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.21, 1.11, 0.81, 0.99] }
  }
}

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
  }
}

// Stagger animations for lists
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Slide animations
export const slideInLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }
  }
}

export const slideInRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }
  }
}

export const slideInUp = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }
  }
}

// Reusable animated components
export const AnimatedDiv = motion.div
export const AnimatedSection = motion.section
export const AnimatedH1 = motion.h1
export const AnimatedH2 = motion.h2
export const AnimatedP = motion.p
export const AnimatedButton = motion.button

// Container wrapper with animations
export function AnimatedContainer({ 
  children, 
  delay = 0,
  className = '' 
}: { 
  children: React.ReactNode
  delay?: number
  className?: string 
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated card with hover effects
export function AnimatedCard({ 
  children, 
  delay = 0,
  className = '',
  whileHover = { scale: 1.02, y: -5 },
  whileTap = { scale: 0.98 }
}: { 
  children: React.ReactNode
  delay?: number
  className?: string
  whileHover?: any
  whileTap?: any
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ ...scaleIn, hidden: { ...scaleIn.hidden, transition: { delay } } }}
      whileHover={whileHover}
      whileTap={whileTap}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Glow animation for premium elements
export const glowAnimation = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(48, 141, 255, 0.3)',
      '0 0 40px rgba(48, 141, 255, 0.5)',
      '0 0 20px rgba(48, 141, 255, 0.3)'
    ]
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

// Loading shimmer animation
export const shimmerAnimation = {
  animate: {
    backgroundPosition: ['0%', '100%', '0%']
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "linear"
  }
}

