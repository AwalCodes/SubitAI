import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://subitai.com'
  
  // Static pages
  const staticPages = [
    '',
    '/features',
    '/pricing',
    '/faq',
    '/about',
    '/careers',
    '/privacy',
    '/terms',
    '/cookies',
  ]

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route === '/pricing' || route === '/features' ? 0.9 : 0.7,
  }))
}

