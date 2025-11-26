'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Video, Zap, CheckCircle, ArrowRight } from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = React.useState(0)

  if (!isOpen) return null

  const steps = [
    { title: 'Welcome to SUBITAI! 🎉', description: 'Your AI-powered subtitle generation platform', icon: Sparkles },
    { title: 'Upload Your First Video', description: 'Get started in 3 simple steps', icon: Video },
    { title: 'Manage Your Energy', description: 'Track your usage and limits', icon: Zap },
  ]

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const CurrentIcon = steps[step].icon

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full overflow-hidden">
          <div className="relative bg-gradient-to-r from-subit-500 to-subit-600 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{steps[step].title}</h2>
                <p className="text-subit-100 text-sm">{steps[step].description}</p>
              </div>
            </div>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6"
          >
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-neutral-600 dark:text-neutral-400">
                  Get ready to create professional subtitles in minutes.
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Upload videos up to 5 minutes</span>
                  </li>
                  <li className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>AI-powered transcription</span>
                  </li>
                  <li className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Customize fonts, colors, and styles</span>
                  </li>
                </ul>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className="text-center p-4 rounded-xl bg-gradient-to-br from-subit-50 to-blue-50 dark:from-subit-900/20 dark:to-blue-900/20"
                    >
                      <div className="w-12 h-12 rounded-full bg-subit-500 text-white flex items-center justify-center font-bold mx-auto mb-2">
                        {num}
                      </div>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {num === 1 ? 'Upload' : num === 2 ? 'Process' : 'Export'}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Upload a video, wait for AI processing, then download your subtitled video!
                </p>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Daily Energy
                    </span>
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      30 / 30
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full w-full" />
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Free plan includes 30 energy per day. Upgrade for more capacity!
                </p>
              </div>
            )}
          </motion.div>

          <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === step
                      ? 'w-8 bg-subit-500'
                      : 'w-2 bg-neutral-300 dark:bg-neutral-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-subit-500 to-subit-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                {step === steps.length - 1 ? (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
