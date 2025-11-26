import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Cookie } from 'lucide-react'

export const metadata = { title: 'Cookie Policy - SUBITAI' }

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="pt-20">
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/30">
                  <Cookie className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Cookie Policy</h1>
                <p className="text-slate-400">How we use cookies and similar technologies</p>
              </div>

              {/* Content */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 space-y-8">
                <p className="text-slate-300 leading-relaxed">
                  We use essential and analytics cookies to provide and improve our services. You can control cookies via your browser settings.
                </p>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Types of Cookies</h2>
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                      <h3 className="text-white font-semibold mb-2">Essential Cookies</h3>
                      <p className="text-slate-400 text-sm">Required for core features like authentication and security.</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                      <h3 className="text-white font-semibold mb-2">Analytics Cookies</h3>
                      <p className="text-slate-400 text-sm">Help us understand usage patterns and improve user experience.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Managing Cookies</h2>
                  <p className="text-slate-400">
                    Most browsers allow you to delete or block cookies. Note that disabling cookies may affect site functionality. You can manage your cookie preferences through your browser settings.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
