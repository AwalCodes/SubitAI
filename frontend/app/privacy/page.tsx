import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Privacy Policy - SUBIT.AI'
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Effective Date: 10 August 2025</p>

          <div className="prose max-w-none mt-8 space-y-8">
            <p className="text-gray-700">
              SUBIT.AI values your privacy and is committed to protecting your personal data in accordance with the Personal Data Protection Act (PDPA) of Thailand and the General Data Protection Regulation (GDPR) of the European Union.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Information We Collect</h2>
              <p className="text-gray-700 mb-2">We may collect the following information:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Email address, Username, Uploaded video files, Payment information (e.g., wallet address, transaction ID), Usage logs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Purpose of Data Collection</h2>
              <p className="text-gray-700 mb-2">We collect and process your data to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide video subtitle generation and embedding services, Process payments and manage subscriptions, Improve our services and user experience, Communicate with users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Storage and Retention</h2>
              <p className="text-gray-700">Your data is stored on servers located in Asia and retained only as long as necessary to provide our services, or until you request its deletion.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Deletion</h2>
              <p className="text-gray-700">You may request deletion of your data by contacting us at <a href="mailto:subit053@gmail.com" className="text-blue-600 hover:text-blue-700">subit053@gmail.com</a>. We will process your request within 30 days.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Sharing with Third Parties</h2>
              <p className="text-gray-700 mb-2">We may share your data with:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>NowPayments (for payment processing), Infrastructure providers (e.g., Supabase, hosting providers), Government agencies or courts when legally required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Security</h2>
              <p className="text-gray-700">We use reasonable technical and organizational measures to protect your data against unauthorized access, disclosure, or destruction.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
