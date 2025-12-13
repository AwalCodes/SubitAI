'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { ChevronDown, HelpCircle, MessageSquare, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { FAQSchema } from '@/components/seo/structured-data'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    { 
      q: 'How does subtitle generation work?', 
      a: 'Upload your video, our AI transcribes and generates time-coded subtitles you can edit and export. The entire process takes just a few minutes and you get professional, broadcast-quality subtitles.' 
    },
    { 
      q: 'What formats can I export?', 
      a: 'Currently we support SRT format with VTT and other formats planned soon. You can also export videos with burned-in subtitles in various styles and animations.' 
    },
    { 
      q: 'How is energy calculated?', 
      a: 'Operations consume energy depending on your plan: Free gets 30/day, Pro gets 300/day, Premium has unlimited. Energy resets daily and unused energy doesn\'t carry over.' 
    },
    { 
      q: 'Do you support crypto payments?', 
      a: 'Yes! You can subscribe using major cryptocurrencies including Bitcoin, Ethereum, USDC, and more via our secure checkout powered by NowPayments.' 
    },
    { 
      q: 'What video formats are supported?', 
      a: 'We support all major video formats: MP4, AVI, MOV, WMV, FLV, WEBM, MKV. Maximum file size is 1GB on all plans. Premium users get higher limits.' 
    },
    { 
      q: 'Can I edit subtitles after generation?', 
      a: 'Absolutely! Our intuitive editor lets you modify text, adjust timing, change styling, and even add animations. All changes save automatically.' 
    },
    { 
      q: 'Is my data secure and private?', 
      a: 'Your privacy is our priority. Videos are stored securely, processed in isolated environments, and automatically deleted after 30 days unless you choose to keep them longer.' 
    },
    { 
      q: 'Can I use subtitles commercially?', 
      a: 'Yes! All generated subtitles are yours to use however you need - commercial projects, YouTube, social media, streaming platforms, and more.' 
    },
  ]

  const faqSchemaData = faqs.map(f => ({ question: f.q, answer: f.a }))

  return (
    <div className="min-h-screen bg-white">
      <FAQSchema faqs={faqSchemaData} />
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-subit-200/40 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-subit-200/40 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-subit-600 rounded-2xl mb-6 shadow-glow">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Everything you need to know about SUBITAI
              </p>
            </motion.div>

            {/* FAQ List */}
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 bg-white border border-neutral-200 hover:shadow-card rounded-xl transition-all text-left group"
                  >
                    <h3 className="text-base font-semibold text-neutral-900 pr-8">
                      {faq.q}
                    </h3>
                    <ChevronDown 
                      className={`w-5 h-5 text-neutral-500 flex-shrink-0 transition-transform duration-300 ${
                        openIndex === i ? 'rotate-180 text-subit-600' : 'group-hover:text-subit-600'
                      }`}
                    />
                  </button>
                  
                  {openIndex === i && (
                    <div className="px-5 pb-5 pt-3 bg-neutral-50 border border-t-0 border-neutral-200 rounded-b-xl -mt-2">
                      <p className="text-neutral-600 leading-relaxed text-sm">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 max-w-2xl mx-auto"
            >
              <div className="bg-subit-50 rounded-2xl p-8 border border-subit-200 text-center">
                <MessageSquare className="w-10 h-10 text-subit-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                  Still have questions?
                </h2>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-subit-600 hover:bg-subit-700 text-white rounded-xl font-semibold transition-all shadow-glow"
                  >
                    Contact Support
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    href="/features" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-subit-700 rounded-xl font-semibold border border-neutral-200 hover:shadow-card transition-all"
                  >
                    View Features
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
