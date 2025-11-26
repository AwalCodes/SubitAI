'use client'

import React from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/providers'
import { Sparkles, ArrowRight, Play, Zap, Users, Star } from 'lucide-react'

export default function Hero() {
  const { user, loading } = useUser()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 lg:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/10 via-transparent to-cyan-600/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Feature Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Powered by Groq Whisper AI
            </span>
          </div>
          
          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            <span className="text-white">Generate </span>
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Professional Subtitles
            </span>
            <br />
            <span className="text-white">in Seconds</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your video and get AI-powered subtitles with 95%+ accuracy. 
            Perfect for creators, educators, and businesses worldwide.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mb-10">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-5 h-5 text-violet-400" />
              <span className="font-semibold">10,000+</span>
              <span className="text-slate-500">creators</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="font-semibold">4.9/5</span>
              <span className="text-slate-500">rating</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold">95%</span>
              <span className="text-slate-500">accuracy</span>
            </div>
          </div>
          
          {/* CTA Buttons - Auth aware */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!loading && user ? (
              <>
                <Link 
                  href="/dashboard/upload-v2" 
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                >
                  <Zap className="w-5 h-5" />
                  Create New Subtitle
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-300"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signup" 
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/pricing" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  View Pricing
                </Link>
              </>
            )}
          </div>
          
          {/* Demo section */}
          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-4xl">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20 blur-3xl opacity-60" />
              
              {/* Demo card */}
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/30">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">Demo_Presentation.mp4</p>
                      <p className="text-sm text-slate-400">2:34 min • English • AI Generated</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Ready
                  </span>
                </div>

                {/* Audio waveform */}
                <div className="mb-6 h-20 rounded-xl bg-slate-800/50 flex items-end gap-1 px-4 py-4 border border-slate-700/50">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-500"
                      style={{ 
                        height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%`,
                        opacity: 0.7 + Math.random() * 0.3
                      }}
                    />
                  ))}
                </div>

                {/* Subtitle lines */}
                <div className="space-y-3">
                  {[
                    { time: '0:00 - 0:03', text: 'Welcome to SUBIT.AI, the fastest way to generate subtitles.' },
                    { time: '0:04 - 0:08', text: 'Simply upload your video and let our AI do the magic.' },
                    { time: '0:09 - 0:14', text: 'Edit, customize, and export in multiple formats instantly.' },
                  ].map((line, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-4 rounded-lg bg-slate-800/50 border border-slate-700/50 px-4 py-3 hover:border-violet-500/30 transition-colors"
                    >
                      <span className="text-xs font-mono text-violet-400 whitespace-nowrap">{line.time}</span>
                      <span className="flex-1 text-sm text-slate-200">{line.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom features */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-16 text-sm">
            {[
              { icon: '⚡', label: '10x Faster', desc: 'than manual transcription' },
              { icon: '🎯', label: '95%+ Accuracy', desc: 'AI-powered precision' },
              { icon: '🌍', label: '50+ Languages', desc: 'global coverage' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-400">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <span className="font-semibold text-white">{item.label}</span>
                  <span className="text-slate-500 ml-1">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}