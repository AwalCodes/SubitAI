import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Shield } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy - SUBIT.AI'
}

export default function PrivacyPage() {
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
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
                <p className="text-slate-400">Effective Date: 10 August 2025</p>
              </div>

              {/* Content */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 space-y-8">
                <p className="text-slate-300 leading-relaxed">
                  SUBIT.AI values your privacy and is committed to protecting your personal data in accordance with the Personal Data Protection Act (PDPA) of Thailand and the General Data Protection Regulation (GDPR) of the European Union.
                </p>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Information We Collect</h2>
                  <p className="text-slate-400 mb-3">We may collect the following information:</p>
                  <ul className="list-disc pl-6 space-y-2 text-slate-400">
                    <li>Email address and username</li>
                    <li>Uploaded video files</li>
                    <li>Payment information (e.g., wallet address, transaction ID)</li>
                    <li>Usage logs</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Purpose of Data Collection</h2>
                  <p className="text-slate-400 mb-3">We collect and process your data to:</p>
                  <ul className="list-disc pl-6 space-y-2 text-slate-400">
                    <li>Provide video subtitle generation and embedding services</li>
                    <li>Process payments and manage subscriptions</li>
                    <li>Improve our services and user experience</li>
                    <li>Communicate with users</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Data Storage and Retention</h2>
                  <p className="text-slate-400">
                    Your data is stored on servers located in Asia and retained only as long as necessary to provide our services, or until you request its deletion.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Data Deletion</h2>
                  <p className="text-slate-400">
                    You may request deletion of your data by contacting us at{' '}
                    <a href="mailto:subit053@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                      subit053@gmail.com
                    </a>
                    . We will process your request within 30 days.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Data Sharing with Third Parties</h2>
                  <p className="text-slate-400 mb-3">We may share your data with:</p>
                  <ul className="list-disc pl-6 space-y-2 text-slate-400">
                    <li>NowPayments (for payment processing)</li>
                    <li>Infrastructure providers (e.g., Supabase, hosting providers)</li>
                    <li>Government agencies or courts when legally required</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Data Security</h2>
                  <p className="text-slate-400">
                    We use reasonable technical and organizational measures to protect your data against unauthorized access, disclosure, or destruction.
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
