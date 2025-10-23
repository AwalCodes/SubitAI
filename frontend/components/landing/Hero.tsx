import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Generate Professional Subtitles with AI
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your video and get accurate, customizable subtitles in minutes. No technical skills required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/auth/signup" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-flex items-center justify-center">
              Get Started for Free
            </Link>
            <Link href="/pricing" className="px-5 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg font-medium inline-flex items-center justify-center">
              View Pricing
            </Link>
          </div>

          {/* Carousel placeholder */}
          <div className="mx-auto max-w-5xl">
            <div className="relative rounded-xl overflow-hidden shadow-xl bg-gray-200 aspect-video">
              {/* Overlay label */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-2 rounded">
                Thoughtful
              </div>
              {/* Arrows */}
              <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow">‹</button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow">›</button>
            </div>
            <p className="text-gray-600 mt-3">Accurate subtitles automatically generated for any expression</p>
          </div>
        </div>
      </div>
    </section>
  )
}