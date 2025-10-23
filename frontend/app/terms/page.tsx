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

          <div className="prose max-w-none mt-8">
            <h2>Scope of Service</h2>
            <p>SUBIT.AI provides AI-powered subtitle generation, customization, and export tools. Subscriptions may be paid via cryptocurrencies.</p>

            <h2>Acceptance of Terms</h2>
            <ul>
              <li>By using SUBIT.AI, you agree to these Terms. If you do not agree, stop using the services.</li>
            </ul>

            <h2>User Responsibilities</h2>
            <ul>
              <li>You are responsible for all content you upload.</li>
              <li>No unlawful or infringing content.</li>
              <li>Upon copyright complaints, we may remove content immediately.</li>
            </ul>

            <h2>Payments and No Refund Policy</h2>
            <ul>
              <li>Payments may be processed via crypto payment providers.</li>
              <li>Verify wallet address before payment.</li>
              <li>All payments are final and non‑refundable.</li>
            </ul>

            <h2>Account Suspension or Termination</h2>
            <p>We may suspend or terminate accounts for violations of these terms.</p>

            <h2>Limitation of Liability</h2>
            <p>Services are provided "as is"; we are not liable for indirect or consequential damages to the extent permitted by law.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
