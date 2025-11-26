'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: 'How does SUBITAI work?',
    answer: 'SUBITAI uses advanced AI technology (OpenAI Whisper) to automatically transcribe your videos into accurate subtitles. Simply upload your video, our AI processes it, and you get professional subtitles that you can customize and export.'
  },
  {
    question: 'What video formats do you support?',
    answer: 'We support all major video formats including MP4, MOV, AVI, WebM, and MKV. The maximum file size depends on your subscription plan: Free (200MB), Pro (500MB), and Premium (1GB).'
  },
  {
    question: 'How accurate are the AI-generated subtitles?',
    answer: 'Our AI achieves over 95% accuracy for clear audio with good pronunciation. The accuracy may vary based on audio quality, accents, background noise, and technical terminology. You can always edit the subtitles manually.'
  },
  {
    question: 'Can I customize the subtitle appearance?',
    answer: 'Yes! You can customize fonts, colors, sizes, positioning, and add effects like shadows and animations. Pro and Premium users get access to advanced customization options including custom font uploads.'
  },
  {
    question: 'What languages do you support?',
    answer: 'We support over 50 languages including English, Spanish, French, German, Chinese, Japanese, Korean, and many more. The AI automatically detects the language, but you can also specify it manually.'
  },
  {
    question: 'How long does subtitle generation take?',
    answer: 'Processing time varies based on video length and complexity. On average, a 5-minute video takes about 1-2 minutes to process. Longer videos may take proportionally longer.'
  },
  {
    question: 'Can I download subtitles as SRT files?',
    answer: 'Yes! You can download your subtitles as SRT files for use in other video editing software, or export your video with burned-in subtitles directly from our platform.'
  },
  {
    question: 'Is my video data secure and private?',
    answer: 'Absolutely. We use enterprise-grade security measures to protect your data. Videos are processed securely and can be deleted at any time. We never share your content with third parties.'
  },
  {
    question: 'What is the energy system?',
    answer: 'Energy is our platform\'s currency for AI processing. Different operations consume different amounts of energy. Free users get 30 energy daily, Pro users get 300, and Premium users get unlimited energy.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to your plan\'s features until the end of your current billing period.'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about SUBITAI
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-subit-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you get the most out of SUBITAI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@subit.ai"
                className="btn-primary"
              >
                Contact Support
              </a>
              <a
                href="/docs"
                className="btn-outline"
              >
                View Documentation
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}








