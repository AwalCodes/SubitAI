'use client'

import React from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/providers'
import { Sparkles, ArrowRight, Play, Zap, Users, Star, Shield, CreditCard, Globe } from 'lucide-react'

export default function Hero() {
  const { user, loading } = useUser()

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-subit-200/60 to-subit-300/60 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-subit-200/60 to-subit-300/60 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-subit-200/40 via-transparent to-subit-300/40 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a0a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Feature Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700">
              ✨ 100% Free — No Credit Card Required
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            <span className="text-neutral-900">Generate </span>
            <span className="bg-gradient-to-r from-subit-500 via-subit-600 to-subit-700 bg-clip-text text-transparent">
              Professional Subtitles
            </span>
            <br />
            <span className="text-neutral-900">Instantly — </span>
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">100% Free</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-neutral-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            Transform any video into perfectly-timed subtitles in seconds.
            Powered by world-class AI with 95%+ accuracy — no watermarks, no hidden costs.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600">
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              No Credit Card
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              50+ Languages
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              No Watermarks
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mb-10">
            <div className="flex items-center gap-2 text-neutral-500">
              <Users className="w-5 h-5 text-subit-600" />
              <span className="font-semibold">10,000+</span>
              <span className="text-neutral-400">creators</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="font-semibold">4.9/5</span>
              <span className="text-neutral-400">rating</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <Sparkles className="w-5 h-5 text-subit-600" />
              <span className="font-semibold">95%</span>
              <span className="text-neutral-400">accuracy</span>
            </div>
          </div>

          {/* CTA Buttons - Auth aware */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!loading && user ? (
              <>
                <Link
                  href="/dashboard/upload-v2"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-subit-600 hover:bg-subit-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-glow hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5" />
                  Create New Subtitle
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl border border-neutral-200 transition-all duration-300"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-subit-600 hover:bg-subit-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-glow hover:-translate-y-0.5"
                >
                  Start Creating Now — It&apos;s Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl border border-neutral-200 transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  Watch How It Works
                </Link>
              </>
            )}
          </div>

          {/* Demo section */}
          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-4xl">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-subit-300/30 via-subit-400/30 to-subit-300/30 blur-3xl opacity-60" />

              {/* Demo card */}
              <div className="relative bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-subit-600 flex items-center justify-center text-white text-sm font-bold shadow-glow">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-neutral-900">Demo_Presentation.mp4</p>
                      <p className="text-sm text-neutral-500">2:34 min • English • AI Generated</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Ready
                  </span>
                </div>

                {/* Audio waveform */}
                <div className="mb-6 h-20 rounded-xl bg-neutral-100 flex items-end gap-1 px-4 py-4 border border-neutral-200">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-full bg-gradient-to-t from-subit-500 to-subit-600"
                      style={{
                        height: `${20 + Math.sin(i * 0.5) * 30}%`,
                        opacity: 0.85
                      }}
                    />
                  ))}
                </div>

                {/* Subtitle lines */}
                <div className="space-y-3">
                  {[
                    { time: '0:00 - 0:03', text: 'Welcome to SUBITAI, the fastest way to generate subtitles.' },
                    { time: '0:04 - 0:08', text: 'Simply upload your video and let our AI do the magic.' },
                    { time: '0:09 - 0:14', text: 'Edit, customize, and export in multiple formats instantly.' },
                  ].map((line, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-lg bg-neutral-100 border border-neutral-200 px-4 py-3 hover:border-subit-300 transition-colors"
                    >
                      <span className="text-xs font-mono text-subit-600 whitespace-nowrap">{line.time}</span>
                      <span className="flex-1 text-sm text-neutral-800">{line.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom features */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-16 text-sm">
            {[
              { icon: '⚡', label: '10x Faster', desc: 'than manual work' },
              { icon: '🎯', label: '95%+ Accuracy', desc: 'studio-grade quality' },
              { icon: '🌍', label: '50+ Languages', desc: 'worldwide coverage' },
              { icon: '🎬', label: '100% Free', desc: 'forever, no catch' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-neutral-500">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <span className="font-semibold text-neutral-900">{item.label}</span>
                  <span className="text-neutral-400 ml-1">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
