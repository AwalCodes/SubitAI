'use client'

import { SignIn } from '@clerk/nextjs'
import Logo from '@/components/shared/Logo'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-subit-200/40 via-white to-subit-200/40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a0a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-subit-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-subit-200/40 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <Logo withText href="/" className="mb-12" />

          <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Generate subtitles<br />
            <span className="bg-gradient-to-r from-subit-500 to-subit-700 bg-clip-text text-transparent">
              10x faster
            </span>
          </h1>

          <p className="text-neutral-600 text-lg mb-8 max-w-md">
            AI-powered subtitle generation with 95%+ accuracy. Perfect for content creators worldwide.
          </p>

          <div className="flex items-center gap-6">
            {[
              { value: '10K+', label: 'Creators' },
              { value: '95%', label: 'Accuracy' },
              { value: '50+', label: 'Languages' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-neutral-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Logo withText href="/" />
          </div>

          <SignIn
            routing="path"
            path="/auth/login"
            signUpUrl="/auth/signup"
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-subit-600 hover:bg-subit-700 text-sm normal-case',
                card: 'border border-neutral-200 shadow-none rounded-2xl',
                headerTitle: 'text-2xl font-bold text-neutral-900',
                headerSubtitle: 'text-neutral-600',
                footerActionLink: 'text-subit-600 hover:text-subit-700',
              }
            }}
          />

          <p className="text-center text-neutral-500 text-sm mt-6">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-neutral-600 hover:text-neutral-900 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-neutral-600 hover:text-neutral-900 transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
