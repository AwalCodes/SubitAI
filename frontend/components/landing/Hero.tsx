'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function Hero() {
  const [showDemo, setShowDemo] = useState(false)

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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup" className="btn-primary">
              Get Started for Free
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowDemo(true)}
            >
              <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Demo
            </button>
          </div>
          
          {/* Trust indicator matching Figma */}
          <p className="text-sm text-gray-500 mb-8">Trusted by creators worldwide</p>
          
          {/* Demo section matching Figma */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700 mb-4">See SUBIT.AI in action</p>
            <button
              type="button"
              onClick={() => setShowDemo(true)}
              className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-button transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span className="text-gray-700 font-medium">Click to watch demo</span>
            </button>
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

      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDemo(false)}
              className="absolute right-4 top-4 rounded-full bg-white/80 p-1 text-neutral-600 hover:text-neutral-900 shadow-sm"
              aria-label="Close demo"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video bg-black flex items-center justify-center text-white text-sm sm:text-base">
              <span className="opacity-70">
                Demo video placeholder. Replace this with your own recording when ready.
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}