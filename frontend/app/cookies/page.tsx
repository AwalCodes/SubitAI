import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Cookie } from 'lucide-react'

export const metadata = { title: 'Cookie Policy - SUBITAI' }

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-subit-600 rounded-2xl mb-4 shadow-glow">
                  <Cookie className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">Cookie Policy</h1>
                <p className="text-neutral-600">How we use cookies and similar technologies</p>
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl p-8 border border-neutral-200 space-y-8">
                <p className="text-neutral-700 leading-relaxed">
                  We use essential and analytics cookies to provide and improve our services. You can control cookies via your browser settings.
                </p>

                <section>
                  <h2 className="text-xl font-bold text-neutral-900 mb-3">Types of Cookies</h2>
                  <div className="space-y-4">
                    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                      <h3 className="text-neutral-900 font-semibold mb-2">Essential Cookies</h3>
                      <p className="text-neutral-600 text-sm">Required for core features like authentication and security.</p>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                      <h3 className="text-neutral-900 font-semibold mb-2">Analytics Cookies</h3>
                      <p className="text-neutral-600 text-sm">Help us understand usage patterns and improve user experience.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-neutral-900 mb-3">Managing Cookies</h2>
                  <p className="text-neutral-600">
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
