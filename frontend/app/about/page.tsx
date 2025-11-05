'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AnimatedCard, AnimatedContainer, AnimatedDiv } from '@/components/ui/animations'
import { Target, Zap, Shield, Heart, Sparkles } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'Making video content accessible to everyone through AI-powered tools.'
    },
    {
      icon: Zap,
      title: 'Fast & Reliable',
      description: 'Lightning-fast processing with 99.9% uptime guaranteed.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is encrypted, secure, and automatically deleted after 30 days.'
    },
    {
      icon: Heart,
      title: 'Creator Focused',
      description: 'Built for content creators who need professional results fast.'
    },
  ]

  const team = [
    {
      name: 'The SUBIT.AI Team',
      role: 'AI & Product Engineering',
      description: 'Passionate about making video accessible with cutting-edge AI'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AnimatedContainer className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <AnimatedDiv 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-subit-500 to-subit-600 rounded-full mb-6 shadow-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
              About SUBIT.AI
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Building the future of video accessibility with AI-powered subtitle technology
            </p>
          </AnimatedDiv>

          {/* Mission Section */}
          <AnimatedCard
            delay={0.1}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-8 md:p-12 mb-12 border border-neutral-200 dark:border-neutral-800 shadow-glass"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-subit-50 dark:bg-subit-900/20 rounded-xl">
                <Target className="w-8 h-8 text-subit-600 dark:text-subit-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                  Our Mission
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg">
                  SUBIT.AI builds AI-powered tools that make video subtitles fast, accurate, and customizable 
                  for creators and teams worldwide. We believe that great content should be accessible to 
                  everyone, regardless of language or hearing ability.
                </p>
              </div>
            </div>
          </AnimatedCard>

          {/* Values Section */}
          <AnimatedDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-12">
              What We Stand For
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, i) => (
                <AnimatedCard
                  key={i}
                  delay={0.3 + i * 0.1}
                  className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 hover:border-subit-300 dark:hover:border-subit-700 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-subit-50 to-subit-100 dark:from-subit-900/20 dark:to-subit-900/40 rounded-lg group-hover:scale-110 transition-transform">
                      <value.icon className="w-6 h-6 text-subit-600 dark:text-subit-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        {value.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </AnimatedDiv>

          {/* Team Section */}
          <AnimatedCard
            delay={0.7}
            className="bg-gradient-to-r from-subit-50 via-white to-subit-50 dark:from-subit-900/20 dark:via-neutral-900 dark:to-subit-900/20 rounded-2xl p-8 md:p-12 border border-neutral-200 dark:border-neutral-800"
          >
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-8">
              Meet the Team
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {team.map((member, i) => (
                <AnimatedDiv
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-subit-500 to-subit-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-subit-600 dark:text-subit-400 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {member.description}
                  </p>
                </AnimatedDiv>
              ))}
            </div>
          </AnimatedCard>

          {/* CTA Section */}
          <AnimatedCard
            delay={1}
            className="mt-16 bg-gradient-to-r from-subit-500 to-subit-600 p-8 rounded-2xl text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-3">
              Join Thousands of Creators
            </h2>
            <p className="text-subit-50 mb-6 max-w-md mx-auto">
              Start creating professional subtitles in minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/signup" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-subit-600 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
              >
                Get Started Free
              </a>
              <a 
                href="/features" 
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Learn More
              </a>
            </div>
          </AnimatedCard>
        </AnimatedContainer>
      </main>
      <Footer />
    </div>
  )
}
