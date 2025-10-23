import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">About SUBIT.AI</h1>
          <p className="text-gray-600 mt-4">SUBIT.AI builds AI-powered tools that make video subtitles fast, accurate, and customizable for creators and teams.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">Our Mission</h2>
          <p className="text-gray-600 mt-2">Help creators deliver accessible content with beautifully styled subtitles powered by state-of-the-art AI.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
