'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AnimatedCard, AnimatedContainer, AnimatedDiv } from '@/components/ui/animations'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useState } from 'react'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AnimatedContainer className="max-w-4xl mx-auto">
          {/* Hero section */}
          <AnimatedDiv 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center p-3 bg-subit-50 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-subit-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Everything you need to know about SUBIT.AI
            </p>
          </AnimatedDiv>

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <AnimatedCard
                key={i}
                delay={i * 0.05}
                className="overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 bg-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left group"
                >
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pr-8">
                    {faq.q}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-neutral-500 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === i ? 'rotate-180 text-subit-600' : 'group-hover:text-subit-600'
                    }`}
                  />
                </button>
                
                {openIndex === i && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="pt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                )}
              </AnimatedCard>
            ))}
          </div>

          {/* CTA Section */}
          <AnimatedCard
            delay={0.6}
            className="mt-16 bg-gradient-to-r from-subit-500 to-subit-600 p-8 rounded-2xl text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-3">
              Still have questions?
            </h2>
            <p className="text-subit-50 mb-6 max-w-md mx-auto">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-subit-600 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
              >
                Contact Support
              </a>
              <a 
                href="/features" 
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                View Features
              </a>
            </div>
          </AnimatedCard>
        </AnimatedContainer>
      </main>
      <Footer />
    </div>
  )
}
