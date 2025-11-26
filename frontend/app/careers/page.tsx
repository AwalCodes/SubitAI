import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Careers - SUBIT.AI' }

export default function CareersPage() {
  const roles = [
    { title: 'Frontend Engineer (Next.js)', location: 'Remote', type: 'Contract' },
    { title: 'Backend Engineer (FastAPI)', location: 'Remote', type: 'Contract' },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="pt-20">
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/30">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Careers</h1>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Join us in building the best subtitle generator for video creators worldwide.
                </p>
              </div>

              {/* Job Listings */}
              <div className="space-y-4">
                {roles.map((role, i) => (
                  <div 
                    key={i} 
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white text-lg group-hover:text-violet-400 transition-colors">
                          {role.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {role.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {role.type}
                          </span>
                        </div>
                      </div>
                      <a 
                        href={`mailto:subit053@gmail.com?subject=Job Application - ${role.title}`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/25"
                      >
                        Apply
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* No positions message */}
              <div className="mt-12 text-center">
                <p className="text-slate-500">
                  Don&apos;t see a position that fits?{' '}
                  <a href="mailto:subit053@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                    Send us your resume
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
