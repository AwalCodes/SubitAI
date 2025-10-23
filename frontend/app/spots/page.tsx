import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function SpotsPromoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Banner */}
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-subit-500 text-white shadow-xl p-8 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-wide">10 SPOTS ONLY</div>
              <p className="mt-3 text-blue-50">The first 10 people to sign up using this page get unlimited energy for 1 month</p>
            </div>
          </div>

          {/* Brand */}
          <div className="max-w-2xl mx-auto text-center mt-10">
            <div className="flex items-center justify-center space-x-2 text-subit-600 font-semibold">
              <div className="w-8 h-8 rounded-lg bg-subit-500 text-white flex items-center justify-center">S</div>
              <span>SUBIT AI</span>
            </div>
            <p className="mt-3 text-gray-600">Revolutionizing the future with artificial intelligence solutions</p>
            <p className="mt-2 text-gray-900 font-medium">Only <span className="text-blue-600">10</span> spots left</p>
            <Link href="/auth/signup" className="inline-block mt-6">
              <button className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200">Sign Up</button>
            </Link>

            {/* Socials */}
            <div className="mt-10 flex items-center justify-center space-x-6 text-gray-600">
              <a href="#" aria-label="Instagram" className="hover:text-gray-900">IG</a>
              <a href="#" aria-label="Twitter" className="hover:text-gray-900">X</a>
              <a href="#" aria-label="YouTube" className="hover:text-gray-900">YT</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
