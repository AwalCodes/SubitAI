import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { FileText } from 'lucide-react'

export const metadata = { title: 'Terms of Service - SUBITAI' }

export default function TermsPage() {
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
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
                <p className="text-slate-400">Effective Date: 10 August 2025</p>
              </div>

              {/* Content */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 space-y-8">
                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Scope of Service</h2>
                  <p className="text-slate-400">
                    SUBITAI is an online platform that allows you to upload videos and process them with our AI technology to generate and embed subtitles. You can customize subtitle fonts, colors, and positioning. We offer subscription services that may be paid via cryptocurrency through NowPayments.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Acceptance of Terms</h2>
                  <p className="text-slate-400">
                    By accessing or using SUBITAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">User Responsibilities</h2>
                  <ul className="list-disc pl-6 space-y-2 text-slate-400">
                    <li>You are solely responsible for all video content you upload to SUBITAI.</li>
                    <li>You must not upload any content that infringes on any copyrights, violates any laws, or contains any unlawful or offensive material.</li>
                    <li>If we receive a notice of copyright infringement, we reserve the right to remove the content immediately.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Payments and No Refund Policy</h2>
                  <ul className="list-disc pl-6 space-y-2 text-slate-400">
                    <li>All payments are processed via NowPayments in cryptocurrency.</li>
                    <li>You must verify the wallet address before making any payment.</li>
                    <li><strong className="text-white">No Refund Policy:</strong> All payments are final and non-refundable under any circumstances.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Account Suspension or Termination</h2>
                  <p className="text-slate-400">
                    SUBITAI reserves the right to suspend or terminate any user account immediately if we detect any violation of these terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-white mb-3">Limitation of Liability</h2>
                  <p className="text-slate-400">
                    SUBITAI provides services &quot;as is&quot; and does not guarantee accuracy or availability. We are not liable for any indirect or consequential damages arising from the use of our services.
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
