import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Cookie Policy - SUBIT.AI' }

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
          <p className="text-gray-600 mt-2">How we use cookies and similar technologies</p>

          <div className="prose max-w-none mt-8">
            <p>We use essential and analytics cookies to provide and improve our services. You can control cookies via your browser settings.</p>
            <h2>Types of Cookies</h2>
            <ul>
              <li>Essential: required for core features</li>
              <li>Analytics: to understand usage and improve UX</li>
            </ul>
            <h2>Managing Cookies</h2>
            <p>Most browsers allow you to delete or block cookies. Note that disabling cookies may affect site functionality.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
