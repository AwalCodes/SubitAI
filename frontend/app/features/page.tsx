import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import { Languages, Zap, Palette, Upload, Clock, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Features | SUBITAI',
  description: 'Explore the AI subtitle features that help you create polished videos faster.',
}

const featureHighlights = [
  {
    icon: Languages,
    title: 'Automatic language detection',
    description: 'Detect 50+ languages instantly and auto-select matching subtitle templates.',
    gradient: 'from-violet-500 to-violet-600'
  },
  {
    icon: Zap,
    title: 'Smart energy usage',
    description: 'Track quota usage in real-time with energy meters and proactive alerts.',
    gradient: 'from-amber-500 to-amber-600'
  },
  {
    icon: Palette,
    title: 'Brand-safe templates',
    description: 'Save presets for fonts, colors, shadows, and export them directly into Adobe Premiere or CapCut.',
    gradient: 'from-fuchsia-500 to-fuchsia-600'
  },
]

const workflowPerks = [
  {
    icon: Upload,
    title: 'Upload from anywhere',
    description: 'Drag & drop, Dropbox, Google Drive or presigned URLs supported.',
  },
  {
    icon: Clock,
    title: 'Live progress',
    description: 'Real-time status updates powered by Redis & Celery workers.',
  },
  {
    icon: Palette,
    title: 'Subtitle styles',
    description: 'Gradient text, outlines, drop-shadows, and animated karaoke modes.',
  },
  {
    icon: FileText,
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

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 text-sm font-medium text-violet-400">
              Built for creators
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-white">
              Powerful AI workflows for{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                every video team
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
              Automate subtitles, collaborate with your team, and publish faster with an experience that feels crafted for professionals.
            </p>
          </div>
        </section>

        {/* Features Component */}
        <Features />

        {/* Feature Highlights */}
        <section className="py-20 bg-slate-900/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-6">
              {featureHighlights.map((feature) => (
                <div 
                  key={feature.title} 
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflows Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Workflows that match your production speed
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Upload in bulk, track progress with smart status indicators, and export captions ready for YouTube, TikTok or any editing suite.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {workflowPerks.map((perk) => (
                    <div key={perk.title} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <perk.icon className="w-5 h-5 text-violet-400" />
                        <p className="font-semibold text-white">{perk.title}</p>
                      </div>
                      <p className="text-sm text-slate-400">{perk.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                <h3 className="text-2xl font-semibold text-white mb-6">Collaboration-ready</h3>
                <ul className="space-y-4">
                  {collaborationPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-semibold flex-shrink-0 text-sm">
                        •
                      </span>
                      <p className="text-slate-400">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
