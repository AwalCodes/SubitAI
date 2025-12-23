'use client'

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SUBITAI',
    url: 'https://subitai.com',
    logo: 'https://subitai.com/favicon-96x96.png?v=2',
    description: 'Free subtitle generator - Generate professional subtitles for your videos in seconds.',
    sameAs: [
      'https://twitter.com/subitai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SUBITAI',
    url: 'https://subitai.com',
    description: 'Free subtitle generator',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://subitai.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SUBITAI',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    url: 'https://subitai.com',
    description: 'Free subtitle generator - Generate professional subtitles for your videos in seconds.',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '29',
      priceCurrency: 'USD',
      offerCount: '3',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'AI-powered transcription',
      'Multiple export formats (SRT, VTT, TXT, JSON)',
      'Support for 50+ languages',
      'Fast processing',
      'High accuracy',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function PricingSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'SUBITAI Subscription',
    description: 'AI-Powered Subtitle Generation Service',
    brand: {
      '@type': 'Brand',
      name: 'SUBITAI',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: '3 transcriptions per day, 5 min max video length',
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: '9',
        priceCurrency: 'USD',
        priceValidUntil: '2025-12-31',
        description: '25 transcriptions per day, 30 min max video length',
      },
      {
        '@type': 'Offer',
        name: 'Premium Plan',
        price: '29',
        priceCurrency: 'USD',
        priceValidUntil: '2025-12-31',
        description: 'Unlimited transcriptions, unlimited video length',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
