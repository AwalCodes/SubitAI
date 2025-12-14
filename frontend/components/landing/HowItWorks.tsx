'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Upload, Sparkles, Download, ArrowRight, ChevronRight } from 'lucide-react'
import { useUser } from '@/lib/providers'

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Video',
    description: 'Drag and drop or select your video file. We support MP4, MOV, AVI, MKV, and audio formats.',
    color: 'from-subit-500 to-subit-600',
    gradient: 'from-subit-200/40 to-subit-300/40'
  },
  {
    icon: Sparkles,
    title: 'AI Magic Happens',
    description: 'Our Groq Whisper AI transcribes your content with 95%+ accuracy in seconds, not minutes.',
    color: 'from-subit-500 to-subit-600',
    gradient: 'from-subit-200/40 to-subit-300/40'
  },
  {
    icon: Download,
    title: 'Edit & Export',
    description: 'Fine-tune your subtitles with our editor and export as SRT, VTT, or embedded video.',
    color: 'from-subit-500 to-subit-600',
    gradient: 'from-subit-200/40 to-subit-300/40'
  }
]

export default function HowItWorks() {
  const { user } = useUser()

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-subit-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-subit-200/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-subit-50 border border-subit-200 rounded-full text-subit-700 text-sm font-medium mb-4">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            From upload to export in under 2 minutes. No learning curve required.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-subit-400 via-subit-500 to-subit-600 opacity-30" />
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-8 border border-neutral-200 hover:shadow-card transition-all duration-300 text-center relative z-10 h-full">
                  {/* Step number badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-r ${step.color} flex items-center justify-center shadow-glow`}>
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} border border-neutral-200 mb-6 mt-2 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-subit-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-4">
                    <ChevronRight className="w-6 h-6 text-neutral-500 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href={user ? "/dashboard/upload-v2" : "/auth/signup"}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-subit-600 hover:bg-subit-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-glow"
            >
              {user ? "Create Subtitles Now" : "Start Free Trial"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <span className="text-neutral-500 text-sm">No credit card required</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}





