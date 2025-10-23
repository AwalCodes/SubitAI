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

          <div className="prose max-w-none mt-8">
            <h2>Information We Collect</h2>
            <p>We may collect the following information:</p>
            <ul>
              <li>Email address, Username</li>
              <li>Uploaded video files</li>
              <li>Payment information (e.g., wallet address, transaction ID)</li>
              <li>Usage logs</li>
            </ul>

            <h2>Purpose of Data Collection</h2>
            <p>We collect and process your data to:</p>
            <ul>
              <li>Provide video subtitle generation and embedding services</li>
              <li>Process payments and manage subscriptions</li>
              <li>Improve our services and user experience</li>
              <li>Communicate with users</li>
            </ul>

            <h2>Data Storage and Retention</h2>
            <ul>
              <li>Your data is stored on servers located in Asia and retained only as long as necessary to provide our services, or until you request its deletion.</li>
            </ul>

            <h2>Data Deletion</h2>
            <ul>
              <li>You may request deletion of your data by contacting us at <a href="mailto:subit053@gmail.com">subit053@gmail.com</a>. We will process your request within 30 days.</li>
            </ul>

            <h2>Data Sharing with Third Parties</h2>
            <p>We may share your data with:</p>
            <ul>
              <li>Payment processors (e.g., crypto providers)</li>
              <li>Infrastructure/hosting providers (e.g., Supabase)</li>
              <li>Government agencies or courts when legally required</li>
            </ul>

            <h2>Data Security</h2>
            <p>We use reasonable technical and organizational measures to protect your data against unauthorized access, disclosure, or destruction.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
