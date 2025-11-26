'use client'

import * as React from 'react'
import { HelpCircle, X, BookOpen, MessageCircle, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export function FloatingHelp() {
  const [isOpen, setIsOpen] = React.useState(false)

  const helpItems = [
    { icon: BookOpen, label: 'Documentation', href: '/features' },
    { icon: FileText, label: 'FAQ', href: '/faq' },
    { icon: MessageCircle, label: 'Support', href: '/contact' },
  ]

  return (
    <>
      {/* Help button - positioned on right side to avoid sidebar */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-subit-500 to-subit-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Get help"
        style={{ zIndex: 30 }}
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      {/* Help panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 right-6 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-subit-500 to-subit-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Need Help?</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-subit-50 text-sm">
                  Find answers and get support
                </p>
              </div>

              <div className="p-4 space-y-2">
                {helpItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-subit-50 dark:bg-subit-900/20 group-hover:bg-subit-100 dark:group-hover:bg-subit-900/40 transition-colors">
                        <item.icon className="w-5 h-5 text-subit-600 dark:text-subit-400" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-subit-600 dark:group-hover:text-subit-400 transition-colors">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

