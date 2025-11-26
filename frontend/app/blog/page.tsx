import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { BookOpen, Sparkles, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="pt-20">
        <section className="py-32 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl mb-8 shadow-lg shadow-violet-500/30">
                <BookOpen className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Blog{' '}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Coming Soon
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                We&apos;re working on something amazing! Our blog will feature tutorials, tips, and insights about 
                AI-powered subtitle generation, video accessibility, and content creation.
              </p>

              {/* Features Preview */}
              <div className="grid sm:grid-cols-3 gap-6 mb-12">
                {[
                  { icon: Sparkles, title: 'Tutorials', desc: 'Step-by-step guides' },
                  { icon: Zap, title: 'Tips & Tricks', desc: 'Pro tips for creators' },
                  { icon: BookOpen, title: 'Updates', desc: 'Latest features & news' },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 rounded-xl mb-4">
                      <item.icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                >
                  Explore Features
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Get Notified
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

