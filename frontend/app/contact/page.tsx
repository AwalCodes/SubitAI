"use client"
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Thanks! We will reply to your message soon.')
    setForm({ name: '', email: '', message: '' })
  }
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-600 mt-2">Have questions? Send us a message and we’ll get back to you.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full px-4 py-2 border rounded-lg" required />
            <input type="email" value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full px-4 py-2 border rounded-lg" required />
            <textarea value={form.message} onChange={e=>setForm({ ...form, message: e.target.value })} placeholder="Your message" rows={5} className="w-full px-4 py-2 border rounded-lg" required />
            <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Send Message</button>
            <p className="text-sm text-gray-600">Or email us at <a className="text-blue-700" href="mailto:subit053@gmail.com">subit053@gmail.com</a></p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
