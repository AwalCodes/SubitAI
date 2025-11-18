import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Terms of Service - SUBIT.AI' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Effective Date: 10 August 2025</p>

          <div className="prose max-w-none mt-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Scope of Service</h2>
              <p className="text-gray-700">SUBIT.AI is an online platform that allows you to upload videos and process them with our AI technology to generate and embed subtitles. You can customize subtitle fonts, colors, and positioning. We offer subscription services that may be paid via cryptocurrency through NowPayments.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Acceptance of Terms</h2>
              <p className="text-gray-700">By accessing or using SUBIT.AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You are solely responsible for all video content you upload to SUBIT.AI.</li>
                <li>You must not upload any content that infringes on any copyrights, violates any laws, or contains any unlawful or offensive material.</li>
                <li>If we receive a notice of copyright infringement, we reserve the right to remove the content immediately.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Payments and No Refund Policy</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>All payments are processed via NowPayments in cryptocurrency.</li>
                <li>You must verify the wallet address before making any payment.</li>
                <li><strong>No Refund Policy:</strong> All payments are final and non-refundable under any circumstances.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Suspension or Termination</h2>
              <p className="text-gray-700">SUBIT.AI reserves the right to suspend or terminate any user account immediately if we detect any violation of these terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Limitation of Liability</h2>
              <p className="text-gray-700">SUBIT.AI provides services &quot;as is&quot; and does not guarantee accuracy or availability. We are not liable for any indirect or consequential damages arising from the use of our services.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
