'use client'

import { motion } from 'framer-motion'
import { Check, Zap, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    period: 'month',
    features: [
      'Basic subtitle generation',
      '30 energy per day',
      'Font customization',
      'Color customization',
      '5-minute video limit',
      'Watermark on exports'
    ],
    limitations: [
      'Advanced positioning',
      'Shadow & animation effects'
    ],
    cta: 'Get Started',
    popular: false,
    color: 'from-gray-400 to-gray-500'
  },
  {
    name: 'Pro',
    description: 'For content creators',
    price: 10,
    period: 'month',
    features: [
      'Advanced subtitle generation',
      '300 energy per day',
      'Full font library',
      'Advanced color options',
      'Watermark-free exports',
      'Basic positioning',
      '30-minute video limit'
    ],
    limitations: [
      'Advanced shadow & animation'
    ],
    cta: 'Subscribe with Crypto',
    popular: true,
    color: 'from-subit-500 to-subit-600'
  },
  {
    name: 'Premium',
    description: 'For professionals',
    price: 50,
    period: 'month',
    features: [
      'Premium subtitle generation',
      'Unlimited energy',
      'Full font library + custom uploads',
      'Advanced color options - gradients',
      'Watermark-free exports',
      'Free positioning anywhere',
      'Advanced shadow & animation effects',
      'No video upload limits'
    ],
    limitations: [],
    cta: 'Subscribe with Crypto',
    popular: false,
    color: 'from-purple-500 to-purple-600'
  }
]

const energyFeatures = [
  {
    title: 'Energy System',
    description: 'Our unique energy system lets you manage your subtitle generation. Different plans provide different energy allocations:',
    items: [
      'Free Plan: 30 energy daily',
      'Pro Plan: 300 energy daily',
      'Premium Plan: Unlimited energy'
    ]
  },
  {
    title: 'Energy Usage',
    description: 'Typical energy costs for different operations:',
    items: [
      'Generate Subtitles: 1 energy per minute',
      'Remove Watermark: 5 energy',
      'Advanced Positioning: 2 energy',
      'Custom Fonts: 1 energy'
    ]
  }
]

export default function Pricing() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose the Right Plan for You
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pay with cryptocurrency and get access to all our powerful subtitle generation features
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${plan.popular ? 'lg:-mt-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-subit-500 to-subit-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`bg-white rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'border-subit-500' : 'border-gray-200 hover:border-subit-300'
              }`}>
                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 ml-1">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">What&apos;s included:</h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <div key={limitationIndex} className="flex items-start space-x-3 opacity-50">
                      <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">✕</span>
                      </div>
                      <span className="text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href={plan.price === 0 ? '/auth/signup' : '/pricing'}>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-subit-500 to-subit-600 hover:from-subit-600 hover:to-subit-700' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                    {plan.price === 0 && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Energy System Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-subit-50 to-blue-50 rounded-2xl p-8 lg:p-12"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {energyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-subit-500 to-subit-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-subit-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: 'How does the energy system work?',
                answer: 'Energy is our platform\'s currency for AI features. Free users get 30, Pro users get 300, and Premium users get unlimited daily energy, which resets every 24 hours.'
              },
              {
                question: 'How do I pay with cryptocurrency?',
                answer: 'We use secure cryptocurrency payment processing. You can pay with Bitcoin, Ethereum, and other major cryptocurrencies.'
              },
              {
                question: 'Can I upgrade or downgrade my plan?',
                answer: 'Yes, you can change your plan at any time. Upgrades grant immediate access; downgrades take effect at the end of the current billing cycle.'
              },
              {
                question: 'What video formats are supported?',
                answer: 'We support MP4, MOV, AVI, and WebM formats. Maximum file size varies by plan, with Premium having the highest limits.'
              },
              {
                question: 'How accurate are the AI-generated subtitles?',
                answer: 'Our AI achieves over 95% accuracy for clear audio. Subtitles can be manually edited, and the system improves over time.'
              },
              {
                question: 'Is my data secure?',
                answer: 'Yes, we use enterprise-grade security. Your videos are processed securely and can be deleted at any time.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-lg"
              >
                <h4 className="font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h4>
                <p className="text-gray-600">
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








