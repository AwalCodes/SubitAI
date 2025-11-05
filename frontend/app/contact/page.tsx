'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { AnimatedCard, AnimatedContainer, AnimatedDiv } from '@/components/ui/animations'
import { Mail, MessageSquare, Send, Sparkles } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Thanks! We will reply to your message soon.')
    setForm({ name: '', email: '', message: '' })
    setSubmitting(false)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AnimatedContainer className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <AnimatedDiv 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center p-3 bg-subit-50 rounded-full mb-6">
              <MessageSquare className="w-8 h-8 text-subit-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Have questions? Send us a message and we'll get back to you promptly.
            </p>
          </AnimatedDiv>

          {/* Contact Card */}
          <AnimatedCard
            delay={0.1}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-8 md:p-12 shadow-glass border border-neutral-200 dark:border-neutral-800"
          >
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-subit-500 focus:border-subit-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-subit-500 focus:border-subit-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  rows={6}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-subit-500 focus:border-subit-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 resize-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-subit-500 to-subit-600 hover:from-subit-600 hover:to-subit-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-center gap-3 text-neutral-600 dark:text-neutral-400">
                <Mail className="w-5 h-5 text-subit-600 dark:text-subit-400" />
                <span>Or email us directly at</span>
                <a 
                  href="mailto:subit053@gmail.com" 
                  className="font-semibold text-subit-600 dark:text-subit-400 hover:underline"
                >
                  subit053@gmail.com
                </a>
              </div>
            </div>
          </AnimatedCard>

          {/* Additional Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <AnimatedCard
              delay={0.3}
              className="text-center p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
            >
              <div className="inline-flex items-center justify-center p-3 bg-subit-50 dark:bg-subit-900/20 rounded-full mb-4">
                <Sparkles className="w-6 h-6 text-subit-600 dark:text-subit-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Quick Response
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                We typically reply within 24 hours
              </p>
            </AnimatedCard>

            <AnimatedCard
              delay={0.4}
              className="text-center p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
            >
              <div className="inline-flex items-center justify-center p-3 bg-subit-50 dark:bg-subit-900/20 rounded-full mb-4">
                <MessageSquare className="w-6 h-6 text-subit-600 dark:text-subit-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Expert Support
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Get help from our technical team
              </p>
            </AnimatedCard>

            <AnimatedCard
              delay={0.5}
              className="text-center p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
            >
              <div className="inline-flex items-center justify-center p-3 bg-subit-50 dark:bg-subit-900/20 rounded-full mb-4">
                <Sparkles className="w-6 h-6 text-subit-600 dark:text-subit-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                24/7 Available
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Submit requests anytime
              </p>
            </AnimatedCard>
          </div>
        </AnimatedContainer>
      </main>
      <Footer />
    </div>
  )
}
