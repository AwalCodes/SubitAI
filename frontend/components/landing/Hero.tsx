'use client'

import React from 'react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-subit-50/40 py-24">
      <div className="pointer-events-none absolute inset-x-0 top-[-200px] flex justify-center opacity-40">
        <div className="h-72 w-[600px] bg-gradient-to-r from-subit-400/40 via-purple-400/40 to-blue-400/40 blur-3xl rounded-full" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Feature Badge matching Figma */}
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-8">
            <svg className="w-4 h-4 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            AI-Powered Subtitle Generation
          </div>
          
          {/* Main headline matching Figma */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Generate{' '}
            <span className="text-primary-700">Subtitles</span>{' '}
            with AI for free
          </h1>
          
          {/* Subtitle matching Figma */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Upload your video and get accurate, customizable subtitles in minutes. 
            No technical skills required. Perfect for creators, teachers, and marketers.
          </p>
          
          {/* Stats matching Figma */}
          <div className="flex justify-center items-center space-x-12 mb-12 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              10,000+ creators
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              4.9/5 rating
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              95% accuracy
            </div>
          </div>
          
          {/* CTA Buttons matching Figma */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup" className="btn-primary">
              Get Started for Free
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/pricing" className="btn-secondary">
              View Pricing
            </Link>
          </div>
          
          {/* Trust indicator matching Figma */}
          <p className="text-sm text-gray-500 mb-8">Trusted by creators worldwide</p>
          
          {/* Demo section matching Figma */}
          <div className="mt-4 flex justify-center">
            <div className="relative w-full max-w-3xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-subit-400/40 via-purple-400/40 to-blue-400/40 blur-2xl opacity-70" />
              <div className="relative bg-white/80 dark:bg-neutral-900/90 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/80 shadow-2xl p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-subit-500 flex items-center justify-center text-white text-sm font-semibold">
                      SUB
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Demo video.mp4</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">2:34 min • English • AI subtitles</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium dark:bg-emerald-900/30 dark:text-emerald-300">
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Subtitles ready
                  </span>
                </div>

                <div className="mb-4 h-24 rounded-xl bg-neutral-900 flex items-end gap-1 px-3 py-3 overflow-hidden">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-full bg-subit-400"
                      style={{ height: `${30 + ((i * 13) % 50)}%` }}
                    />
                  ))}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-3 py-2">
                    <span className="text-xs font-mono text-neutral-500">0:00 - 0:03</span>
                    <span className="ml-3 flex-1 truncate text-sm text-neutral-800 dark:text-neutral-100">
                      Welcome to SUBIT.AI, your AI subtitle copilot.
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-3 py-2">
                    <span className="text-xs font-mono text-neutral-500">0:04 - 0:08</span>
                    <span className="ml-3 flex-1 truncate text-sm text-neutral-800 dark:text-neutral-100">
                      Upload a video and generate subtitles in minutes.
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 px-3 py-2">
                    <span className="text-xs font-mono text-neutral-500">0:09 - 0:14</span>
                    <span className="ml-3 flex-1 truncate text-sm text-neutral-800 dark:text-neutral-100">
                      Edit, export, and share without leaving your browser.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom stats matching Figma */}
          <div className="flex justify-center items-center space-x-12 mt-16 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              95% Accuracy
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Advanced AI transcription
            </div>
            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700 mr-2">2 min avg</span>
              <span className="text-gray-600">Processing time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}