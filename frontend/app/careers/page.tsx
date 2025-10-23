import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CareersPage() {
  const roles = [
    { title: 'Frontend Engineer (Next.js)', location: 'Remote', type: 'Contract' },
    { title: 'Backend Engineer (FastAPI)', location: 'Remote', type: 'Contract' },
  ]
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Careers</h1>
          <p className="text-gray-600 mt-2">Join us in building the best subtitle generator for video creators.</p>
          <div className="mt-8 space-y-4">
            {roles.map((r, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{r.title}</h3>
                    <p className="text-gray-600 text-sm">{r.location} • {r.type}</p>
                  </div>
                  <a className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg" href="mailto:subit053@gmail.com?subject=Job%20Application%20-%20SUBIT.AI">Apply</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
