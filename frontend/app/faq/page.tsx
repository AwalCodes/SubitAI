import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function FAQPage() {
  const faqs = [
    { q: 'How does subtitle generation work?', a: 'Upload your video, our AI transcribes and generates time-coded subtitles you can edit and export.' },
    { q: 'What formats can I export?', a: 'SRT is supported now; VTT and others are planned.' },
    { q: 'How is energy calculated?', a: 'Operations consume energy depending on plan; Free 30/day, Pro 300/day, Premium unlimited.' },
    { q: 'Do you support crypto payments?', a: 'Yes. You can subscribe using major cryptocurrencies via our checkout.' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <div className="mt-8 space-y-6">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900">{f.q}</h3>
                <p className="text-gray-600 mt-2">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
