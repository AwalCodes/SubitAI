'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Target, Zap, Shield, Heart, Sparkles, Users, Globe, Award } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'Making video content accessible to everyone through AI-powered tools.',
      gradient: 'from-violet-500 to-violet-600'
    },
    {
      icon: Zap,
      title: 'Fast & Reliable',
      description: 'Lightning-fast processing with 99.9% uptime guaranteed.',
      gradient: 'from-amber-500 to-amber-600'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is encrypted, secure, and automatically deleted after 30 days.',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Heart,
      title: 'Creator Focused',
      description: 'Built for content creators who need professional results fast.',
      gradient: 'from-rose-500 to-rose-600'
    },
  ]

  const stats = [
    { value: '10K+', label: 'Creators', icon: Users },
    { value: '50+', label: 'Languages', icon: Globe },
    { value: '95%', label: 'Accuracy', icon: Award },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl mb-6 shadow-lg shadow-violet-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                About <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">SUBITAI</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed">
                Building the future of video accessibility with AI-powered subtitle technology
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center gap-12 mt-12"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-slate-900/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-slate-700">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                    <Target className="w-8 h-8 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-3">
                      Our Mission
                    </h2>
                    <p className="text-slate-400 leading-relaxed text-lg">
                      SUBITAI builds AI-powered tools that make video subtitles fast, accurate, and customizable 
                      for creators and teams worldwide. We believe that great content should be accessible to 
                      everyone, regardless of language or hearing ability.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                What We Stand For
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Our core values guide everything we do
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {values.map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 h-full">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-gradient-to-br ${value.gradient} rounded-xl group-hover:scale-110 transition-transform shadow-lg`}>
                        <value.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {value.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-slate-900/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Meet the Team
              </h2>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 mt-8">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  The SUBITAI Team
                </h3>
                <p className="text-violet-400 font-medium mb-3">
                  AI & Product Engineering
                </p>
                <p className="text-slate-400 text-sm">
                  Passionate about making video accessible with cutting-edge AI
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl p-8 md:p-12 border border-violet-500/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-3">
                  Join Thousands of Creators
                </h2>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Start creating professional subtitles in minutes
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/auth/signup" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
                  >
                    Get Started Free
                  </Link>
                  <Link 
                    href="/features" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold border border-slate-700 hover:bg-slate-700 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
