import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Features from '@/components/landing/Features'
import Link from 'next/link'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Features | SUBIT.AI',
  description: 'Explore the AI subtitle features that help you create polished videos faster.',
}

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    features: [
      'Basic subtitle generation',
      '30 energy per day',
      'Font customization',
      'Color customization',
      'Watermark-free exports'
    ],
  },
  {
    name: 'Pro',
    description: 'For content creators',
    price: 10,
    popular: true,
    features: [
      'Advanced subtitle generation',
      '300 energy per day',
      'Full font library',
      'Advanced color options',
      'Watermark-free exports',
      'Basic positioning'
    ],
  },
  {
    name: 'Premium',
    description: 'For professionals',
    price: 50,
    features: [
      'Premium subtitle generation',
      'Unlimited energy',
      'Full font library + custom uploads',
      'Advanced color options + gradients',
      'Watermark-free exports',
      'Free positioning anywhere',
      'Advanced shadow & animation effects'
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="bg-white">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center rounded-full bg-subit-100 px-4 py-1 text-sm font-medium text-subit-600 shadow-card">
              Built for creators
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-neutral-900">
              Powerful AI workflows for every video team
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">
              Automate subtitles, collaborate with your team, and publish faster with an experience that feels crafted for professionals.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <Features />

        {/* Feature Highlights */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
            {featureHighlights.map((feature) => (
              <div key={feature.title} className="card-hover text-left">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-subit-50 text-subit-600 shadow-inner">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Workflows and Pricing Section */}
        <section className="py-24 bg-gradient-to-r from-subit-500 to-subit-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">Workflows that match your production speed</h2>
                <p className="text-subit-100 text-lg leading-relaxed mb-8">
                  Upload in bulk, track progress with smart status indicators, and export captions ready for YouTube, TikTok or any editing suite.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {workflowPerks.map((perk) => (
                    <div key={perk.title} className="bg-white/10 rounded-lg px-4 py-3">
                      <p className="font-semibold">{perk.title}</p>
                      <p className="text-sm text-subit-50 mt-1">{perk.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-premium p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Collaboration-ready</h3>
                <ul className="space-y-4">
                  {collaborationPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-subit-100 text-subit-600 font-semibold flex-shrink-0">
                        •
                      </span>
                      <p className="text-neutral-600">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Compact Pricing */}
            <div className="bg-white rounded-2xl shadow-premium p-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Choose the Right Plan for You
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Pay with cryptocurrency and get access to all our powerful subtitle generation features
                </p>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <div key={plan.name} className={`relative ${plan.popular ? 'lg:-mt-4' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-subit-500 to-subit-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <div className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                      plan.popular ? 'border-subit-500' : 'border-gray-200'
                    }`}>
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <p className="text-gray-600 mb-4">{plan.description}</p>
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                          <span className="text-gray-600 ml-1">/month</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <h4 className="font-semibold text-gray-900 text-sm mb-3">What&apos;s included:</h4>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Link href={plan.price === 0 ? '/auth/signup' : plan.price === 10 ? '/checkout/pro' : '/checkout/premium'}>
                        <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          plan.popular
                            ? 'bg-gradient-to-r from-subit-500 to-subit-600 text-white hover:from-subit-600 hover:to-subit-700'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}>
                          {plan.price === 0 ? 'Get Started' : 'Subscribe with Crypto'}
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

const featureHighlights = [
  {
    title: 'Automatic language detection',
    description: 'Detect 50+ languages instantly and auto-select matching subtitle templates.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m6 14h6m-3-3v6M4 9h8m-8 4h6m-6 4h4" />
      </svg>
    ),
  },
  {
    title: 'Smart energy usage',
    description: 'Track quota usage in real-time with energy meters and proactive alerts.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 2.05a9 9 0 017.95 7.95M21 12a9 9 0 01-9 9m0-18a9 9 0 00-7.95 7.95M3 12a9 9 0 009 9m0-9l2.5-2.5M12 12l-2.5-2.5" />
      </svg>
    ),
  },
  {
    title: 'Brand-safe templates',
    description: 'Save presets for fonts, colors, shadows, and export them directly into Adobe Premiere or CapCut.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6m13-7a2 2 0 00-2-2H7a2 2 0 00-2 2v14l7-3 7 3V5z" />
      </svg>
    ),
  },
]

const workflowPerks = [
  {
    title: 'Upload from anywhere',
    description: 'Drag & drop, Dropbox, Google Drive or presigned URLs supported.',
  },
  {
    title: 'Live progress',
    description: 'Real-time status updates powered by Redis & Celery workers.',
  },
  {
    title: 'Subtitle styles',
    description: 'Gradient text, outlines, drop-shadows, and animated karaoke modes.',
  },
  {
    title: 'Instant exports',
    description: 'Generate SRT, VTT, JSON and burned-in video renders on demand.',
  },
]

const collaborationPoints = [
  'Invite your editors and audio engineers with granular permissions',
  'Receive webhook callbacks when files finish processing',
  'Audit history with full event timelines per project',
  'Integrate with Zapier, Make or your custom workflows via API',
]
