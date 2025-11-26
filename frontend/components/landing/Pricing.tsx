'use client'

import { motion } from 'framer-motion'
import { Check, X, Zap, Star, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/lib/providers'
import { getSubscriptionLimits } from '@/lib/utils'

const plans = [
  {
    name: 'Free',
    slug: 'free',
    description: 'Perfect for getting started',
    price: 0,
    period: 'month',
    features: [
      '30 energy per day',
      'AI subtitle generation',
      'Basic font customization',
      'SRT/VTT export',
      '5-minute video limit'
    ],
    limitations: [
      'Advanced positioning',
      'Priority support'
    ],
    cta: 'Get Started Free',
    popular: false,
    gradient: 'from-slate-600 to-slate-700',
    borderColor: 'border-slate-700'
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'For content creators',
    price: 10,
    period: 'month',
    features: [
      '300 energy per day',
      'Everything in Free',
      'Full font library',
      'Advanced color options',
      'Basic positioning',
      '30-minute video limit',
      'Email support'
    ],
    limitations: [],
    cta: 'Upgrade to Pro',
    popular: true,
    gradient: 'from-violet-600 to-fuchsia-600',
    borderColor: 'border-violet-500'
  },
  {
    name: 'Premium',
    slug: 'premium',
    description: 'For professionals',
    price: 50,
    period: 'month',
    features: [
      'Unlimited energy',
      'Everything in Pro',
      'Custom font uploads',
      'Gradient colors',
      'Free positioning',
      'Animation effects',
      'No video limits',
      'Priority support'
    ],
    limitations: [],
    cta: 'Go Premium',
    popular: false,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500'
  }
]

const faqs = [
  {
    question: 'How does the energy system work?',
    answer: 'Energy is used for AI transcription. Each transcription costs about 10 energy. Your energy resets daily based on your plan.'
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Yes! Upgrade instantly for immediate access. Downgrade takes effect at the end of your billing cycle.'
  },
  {
    question: 'What video formats are supported?',
    answer: 'We support MP4, MOV, AVI, MKV, WebM, and audio formats like MP3 and WAV.'
  },
  {
    question: 'How accurate are the AI subtitles?',
    answer: 'Our Groq Whisper AI achieves 95%+ accuracy for clear audio. You can always edit manually.'
  }
]

export default function Pricing() {
  const { user } = useUser()

  return (
    <section id="pricing" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl" />
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
          <span className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-500/30">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`h-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 transition-all duration-300 hover:bg-slate-800/70 ${
                plan.popular ? plan.borderColor : 'border-slate-700 hover:border-slate-600'
              }`}>
                {/* Plan header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} mb-4`}>
                    {plan.name === 'Free' ? <Zap className="w-6 h-6 text-white" /> : 
                     plan.name === 'Pro' ? <Sparkles className="w-6 h-6 text-white" /> :
                     <Star className="w-6 h-6 text-white" />}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-slate-400">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-center gap-3 opacity-50">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                        <X className="w-3 h-3 text-slate-500" />
                      </div>
                      <span className="text-slate-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link 
                  href={user ? (plan.price === 0 ? '/dashboard' : `/checkout/${plan.slug}`) : '/auth/signup'}
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {user && plan.price === 0 ? 'Go to Dashboard' : plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Energy Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-20"
        >
          <div className="bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-cyan-600/10 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Understanding Energy</h3>
            </div>
            <p className="text-slate-400 mb-6">
              Energy is our simple way to manage AI usage. Each subtitle generation uses about 10 energy. Your energy automatically resets every 24 hours.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { plan: 'Free', energy: '30', color: 'from-slate-600 to-slate-700' },
                { plan: 'Pro', energy: '300', color: 'from-violet-600 to-fuchsia-600' },
                { plan: 'Premium', energy: '∞', color: 'from-amber-500 to-orange-600' }
              ].map((item) => (
                <div key={item.plan} className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} mb-2`}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white font-semibold">{item.plan}</p>
                  <p className="text-2xl font-bold text-white">{item.energy}</p>
                  <p className="text-slate-500 text-xs">energy/day</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
              >
                <h4 className="font-semibold text-white mb-2 text-sm">
                  {faq.question}
                </h4>
                <p className="text-slate-400 text-sm">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
