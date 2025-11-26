'use client'

import { motion } from 'framer-motion'
import { 
  Upload, Sparkles, Languages, Clock, Shield, 
  FileText, Palette, Zap, Globe 
} from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'Drag & Drop Upload',
    description: 'Simply drag your video or audio file. We support MP4, MOV, AVI, MKV, MP3, WAV, and more.',
    color: 'from-violet-500 to-violet-600'
  },
  {
    icon: Sparkles,
    title: 'AI Transcription',
    description: 'Powered by Groq Whisper AI with 95%+ accuracy. 10x faster than manual transcription.',
    color: 'from-fuchsia-500 to-fuchsia-600'
  },
  {
    icon: Languages,
    title: '50+ Languages',
    description: 'Auto-detect or select from 50+ languages. Perfect for global content creators.',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    icon: Clock,
    title: 'Real-Time Progress',
    description: 'Watch your subtitles generate in real-time with accurate progress tracking.',
    color: 'from-amber-500 to-amber-600'
  },
  {
    icon: FileText,
    title: 'Multiple Formats',
    description: 'Export as SRT, VTT, or JSON. Compatible with YouTube, Vimeo, and all major platforms.',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: Palette,
    title: 'Built-in Editor',
    description: 'Fine-tune timestamps, edit text, and perfect your subtitles before export.',
    color: 'from-rose-500 to-rose-600'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your files are encrypted and never stored permanently. GDPR compliant.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process a 5-minute video in under 30 seconds. No more waiting around.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Globe,
    title: 'Cloud-Based',
    description: 'Access from anywhere, on any device. No software installation required.',
    color: 'from-indigo-500 to-indigo-600'
  }
]

export default function Features() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-600/5 via-fuchsia-600/5 to-cyan-600/5 rounded-full blur-3xl" />
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
          <span className="inline-block px-4 py-1.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full text-fuchsia-400 text-sm font-medium mb-4">
            Powerful Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Professional subtitle generation with features that save you hours of work
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}