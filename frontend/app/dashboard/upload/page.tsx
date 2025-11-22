'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()

  // Redirect all traffic from legacy upload page to the new upload-v2 flow
  useEffect(() => {
    router.replace('/dashboard/upload-v2')
  }, [router])

  return null
}
